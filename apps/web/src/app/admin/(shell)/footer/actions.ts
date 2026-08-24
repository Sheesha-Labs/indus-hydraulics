'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import {
  FOOTER_SOCIAL_PLATFORMS,
  isValidCustomUrl,
  isValidSocialHref,
  MENU_LINK_TYPES,
  type FooterSocialPlatform,
  type MenuLinkType,
} from '@indus/domain'
import { auth } from '../../../../lib/admin-auth'
import { invalidateFooter } from '../../../../lib/cache-tags'
import { hasRole, ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'

const OptionalUuid = z
  .union([z.string().uuid(), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v ? v : null))

const OptionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null)

const MenuLinkTypeSchema = z.enum(MENU_LINK_TYPES as readonly [MenuLinkType, ...MenuLinkType[]])
const PlatformSchema = z.enum(
  FOOTER_SOCIAL_PLATFORMS as readonly [FooterSocialPlatform, ...FooterSocialPlatform[]],
)

const LinkSchema = z
  .object({
    label: z.string().trim().min(1, 'Label is required').max(80),
    linkType: MenuLinkTypeSchema,
    customUrl: OptionalText(2048),
    categoryId: OptionalUuid,
    brandId: OptionalUuid,
    industryId: OptionalUuid,
    cmsPageId: OptionalUuid,
    productId: OptionalUuid,
    openInNewTab: z.boolean().default(false),
    isVisible: z.boolean().default(true),
  })
  .superRefine((val, ctx) => {
    if (val.linkType === 'custom_url' && (!val.customUrl || !isValidCustomUrl(val.customUrl))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customUrl'],
        message: 'URL must start with / or https://',
      })
    }
    // A `Record<MenuLinkType, …>` keyed by link type would be tidier, but it is
    // also where a typo in a key silently makes "pick a target" unreachable for
    // exactly one link type — and the failing case is a saved link that
    // resolves to nothing, which `getNavMenu` then drops from the storefront
    // without a word. Spelled out so the compiler checks each branch.
    const target: string | null =
      val.linkType === 'category'
        ? val.categoryId
        : val.linkType === 'brand'
          ? val.brandId
          : val.linkType === 'industry'
            ? val.industryId
            : val.linkType === 'cms_page'
              ? val.cmsPageId
              : val.linkType === 'product'
                ? val.productId
                : null
    if (val.linkType !== 'none' && val.linkType !== 'custom_url' && !target) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['target'], message: 'Pick a target' })
    }
  })

const ColumnSchema = z.object({
  label: z.string().trim().min(1, 'Heading is required').max(80),
  isVisible: z.boolean().default(true),
  links: z.array(LinkSchema).max(40),
})

const SocialSchema = z.object({
  label: z.string().trim().min(1, 'Name is required').max(40),
  platform: PlatformSchema,
  href: z
    .string()
    .trim()
    .max(2048)
    .refine(isValidSocialHref, 'Must be a full https:// address'),
  isVisible: z.boolean().default(true),
})

const LegalLinkSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(80),
  customUrl: z
    .string()
    .trim()
    .max(2048)
    .refine(isValidCustomUrl, 'URL must start with / or https://'),
  openInNewTab: z.boolean().default(false),
  isVisible: z.boolean().default(true),
})

const SaveFooterSchema = z.object({
  brand: z.object({
    tagline: OptionalText(240),
    certificationLine: OptionalText(120),
  }),
  contact: z.object({
    contactLocationLabel: OptionalText(80),
    contactPhone: OptionalText(40),
    contactEmail: z
      .union([z.string().trim().email('Not a valid email'), z.literal('')])
      .optional()
      .transform((v) => v || null),
    contactHours: OptionalText(120),
  }),
  legal: z.object({
    footerLegalLine: OptionalText(240),
    links: z.array(LegalLinkSchema).max(12),
  }),
  columns: z.array(ColumnSchema).max(6),
  socials: z.array(SocialSchema).max(12),
})

export type SaveFooterInput = z.input<typeof SaveFooterSchema>

/**
 * Save the whole footer in one transaction.
 *
 * ── Why replace-then-insert for the links ──
 *
 * The editor holds every column and link in local state and sends all of it on
 * every save. Diffing would mean tracking which rows are new, moved, edited or
 * gone across two nested lists; deleting and re-inserting is one statement per
 * table against ~20 rows. The cost is that `nav_menu_item` ids change on each
 * save — which is free here, because nothing outside these two menus
 * references a footer item by id.
 *
 * It is NOT free for the megamenu, which is why this action is scoped to the
 * two footer locations by `location`, not by an id the caller passes. A bug
 * that widened the delete would otherwise take out 323 megamenu rows.
 *
 * ── Why the whole thing is one transaction ──
 *
 * The delete and the insert are separate statements. A failure between them —
 * a validation error Prisma raises on insert, a dropped connection — would
 * leave the site with no footer links at all, on every page. `$transaction`
 * makes that impossible: either the new footer lands or the old one stays.
 */
export async function saveFooter(input: SaveFooterInput): Promise<Result<void>> {
  try {
    const session = await auth()
    requireRole(session, ROLES.CMS_WRITE)
    const parsed = SaveFooterSchema.parse(input)

    const settings = await db.storeSettings.findFirst({
      select: {
        id: true,
        tagline: true,
        certificationLine: true,
        contactLocationLabel: true,
        contactPhone: true,
        contactEmail: true,
        contactHours: true,
        footerLegalLine: true,
      },
    })

    const settingsPayload = {
      tagline: parsed.brand.tagline,
      certificationLine: parsed.brand.certificationLine,
      contactLocationLabel: parsed.contact.contactLocationLabel,
      contactPhone: parsed.contact.contactPhone,
      contactEmail: parsed.contact.contactEmail,
      contactHours: parsed.contact.contactHours,
      footerLegalLine: parsed.legal.footerLegalLine,
    }

    /*
     * The brand and contact fields on this screen live on `store_settings`,
     * and they are not footer-only: the phone number and email are also the
     * /contact page's, the Organization JSON-LD's, and the reply-to on quote
     * mail. Writing them is SETTINGS_WRITE elsewhere in the admin, so a
     * `cms_editor` reaching them through a screen labelled "Footer" would be a
     * quiet privilege widening.
     *
     * Checked against the stored values rather than by gating the whole
     * action: a cms_editor editing only link columns must still be able to
     * save, and the client disables these inputs for them — so a payload that
     * differs from what is stored is either a stale form or a forged request,
     * and both should be refused rather than silently applied.
     */
    const settingsChanged =
      settings === null ||
      (Object.keys(settingsPayload) as (keyof typeof settingsPayload)[]).some(
        (key) => (settings[key] ?? null) !== settingsPayload[key],
      )
    if (settingsChanged && !hasRole(session, ROLES.SETTINGS_WRITE)) {
      return fail(
        'FORBIDDEN',
        'Your role can edit the footer’s links but not its brand, contact or legal details.',
      )
    }

    const [mainMenu, legalMenu] = await Promise.all([
      db.navMenu.findUnique({ where: { location: 'footer_main' }, select: { id: true } }),
      db.navMenu.findUnique({ where: { location: 'footer_legal' }, select: { id: true } }),
    ])
    if (!mainMenu || !legalMenu) {
      return fail(
        'NOT_FOUND',
        'The footer menus are missing. Create them in Navigation, then reopen this page.',
      )
    }

    await db.$transaction(async (tx) => {
      if (settings) {
        await tx.storeSettings.update({ where: { id: settings.id }, data: settingsPayload })
      } else {
        await tx.storeSettings.create({ data: settingsPayload })
      }

      // Deleting the roots is enough: `NavMenuItem.parent` cascades, so the
      // links go with their column. Scoped by menuId, so the megamenu is out
      // of reach even if a column somehow carried a foreign parent.
      await tx.navMenuItem.deleteMany({ where: { menuId: mainMenu.id } })
      for (const [index, column] of parsed.columns.entries()) {
        await tx.navMenuItem.create({
          data: {
            menuId: mainMenu.id,
            parentId: null,
            position: index,
            label: column.label,
            linkType: 'none',
            isVisible: column.isVisible,
            children: {
              create: column.links.map((link, linkIndex) => ({
                menuId: mainMenu.id,
                position: linkIndex,
                label: link.label,
                linkType: link.linkType,
                // Nulled per type rather than passed through, so switching a
                // link from Category to Custom URL cannot leave the old
                // categoryId behind for `resolveHref` to prefer.
                customUrl: link.linkType === 'custom_url' ? link.customUrl : null,
                categoryId: link.linkType === 'category' ? link.categoryId : null,
                brandId: link.linkType === 'brand' ? link.brandId : null,
                industryId: link.linkType === 'industry' ? link.industryId : null,
                cmsPageId: link.linkType === 'cms_page' ? link.cmsPageId : null,
                productId: link.linkType === 'product' ? link.productId : null,
                openInNewTab: link.openInNewTab,
                isVisible: link.isVisible,
              })),
            },
          },
        })
      }

      await tx.navMenuItem.deleteMany({ where: { menuId: legalMenu.id } })
      if (parsed.legal.links.length > 0) {
        await tx.navMenuItem.createMany({
          data: parsed.legal.links.map((link, index) => ({
            menuId: legalMenu.id,
            parentId: null,
            position: index,
            label: link.label,
            linkType: 'custom_url' as const,
            customUrl: link.customUrl,
            openInNewTab: link.openInNewTab,
            isVisible: link.isVisible,
          })),
        })
      }

      await tx.footerSocial.deleteMany({})
      if (parsed.socials.length > 0) {
        await tx.footerSocial.createMany({
          data: parsed.socials.map((social, index) => ({
            position: index,
            label: social.label,
            platform: social.platform,
            href: social.href,
            isVisible: social.isVisible,
          })),
        })
      }
    })

    revalidatePath('/admin/footer')
    revalidatePath('/admin/navigation')
    invalidateFooter()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}
