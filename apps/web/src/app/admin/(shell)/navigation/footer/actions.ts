'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import {
  FOOTER_SOCIAL_PLATFORMS,
  isValidSocialHref,
  type FooterSocialPlatform,
} from '@indus/domain'
import { auth } from '../../../../../lib/admin-auth'
import { invalidateFooter } from '../../../../../lib/cache-tags'
import { hasRole, ROLES, requireRole } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'
import { applyMenuTree, NavTreeItemsSchema } from '../nav-tree-save'

const OptionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null)

const PlatformSchema = z.enum(
  FOOTER_SOCIAL_PLATFORMS as readonly [FooterSocialPlatform, ...FooterSocialPlatform[]],
)

const SocialSchema = z.object({
  label: z.string().trim().min(1, 'Name is required').max(40),
  platform: PlatformSchema,
  href: z.string().trim().max(2048).refine(isValidSocialHref, 'Must be a full https:// address'),
  isVisible: z.boolean(),
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
  legal: z.object({ footerLegalLine: OptionalText(240) }),
  socials: z.array(SocialSchema).max(12),
  columnsMenuId: z.string().uuid(),
  columns: NavTreeItemsSchema,
  legalMenuId: z.string().uuid(),
  legalLinks: NavTreeItemsSchema,
})

export type SaveFooterInput = z.input<typeof SaveFooterSchema>

/**
 * Save the whole footer — two menus, the store-settings fields and the social
 * rows — as one unit.
 *
 * Every part is written inside a single `$transaction`, which is the reason
 * this exists rather than the screen firing `saveMenuTree` twice and a
 * settings update alongside. The footer reads as one object to a visitor; a
 * save that half-lands leaves the site showing a column list from one edit and
 * a copyright line from another, with nothing to say so.
 *
 * The two menus go through `applyMenuTree`, so footer columns get the same
 * create-then-update-then-delete ordering and the same id preservation as
 * every other navigation surface.
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
     * The brand and contact fields are not footer-only: the phone number and
     * email are also /contact's, the Organization JSON-LD's, and the reply-to
     * on quote mail. Writing them is SETTINGS_WRITE everywhere else in the
     * admin, so a cms_editor reaching them through a navigation screen would
     * be a quiet privilege widening.
     *
     * Compared against what is stored rather than gated outright, so an editor
     * changing only link columns can still save. A payload that differs is
     * either a stale form or a forged request; both are refused.
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

    let treeError: Result<void> | null = null

    await db.$transaction(
      async (tx) => {
        if (settings) {
          await tx.storeSettings.update({ where: { id: settings.id }, data: settingsPayload })
        } else {
          await tx.storeSettings.create({ data: settingsPayload })
        }

        const columns = await applyMenuTree(tx, parsed.columnsMenuId, parsed.columns)
        if (!columns.success) {
          treeError = columns
          // Thrown, not returned: a `return` here commits everything written
          // before it, which is exactly the half-saved footer the transaction
          // is here to prevent.
          throw new TransactionAbort()
        }
        const legal = await applyMenuTree(tx, parsed.legalMenuId, parsed.legalLinks)
        if (!legal.success) {
          treeError = legal
          throw new TransactionAbort()
        }

        // Socials are replace-all, unlike the menus. There are at most twelve,
        // nothing references a social row by id, and they carry no children —
        // so the reasons the menus need a diff do not apply.
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
      },
      { timeout: 30_000 },
    ).catch((err: unknown) => {
      if (err instanceof TransactionAbort) return
      throw err
    })

    if (treeError) return treeError

    revalidatePath('/admin/navigation')
    revalidatePath('/admin/navigation/footer')
    invalidateFooter()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

/** Rolls the transaction back while letting the real reason travel out in `treeError`. */
class TransactionAbort extends Error {
  constructor() {
    super('footer save aborted')
    this.name = 'TransactionAbort'
  }
}
