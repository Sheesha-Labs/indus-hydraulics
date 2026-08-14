'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'
import {
  isAllowedIconName,
  isValidCustomUrl,
  MENU_LINK_TYPES,
  MENU_LOCATIONS,
  type MenuLinkType,
  type MenuLocation,
} from '@indus/domain'
import { auth } from '../../../../lib/auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../lib/result'
import { STORAGE_BUCKETS, uploadToStorage } from '../../../../lib/supabase'

const Slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case')

const OptionalUuid = z
  .union([z.string().uuid(), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v ? v : null))

const MenuLocationSchema = z.enum(MENU_LOCATIONS as readonly [MenuLocation, ...MenuLocation[]])
const MenuLinkTypeSchema = z.enum(MENU_LINK_TYPES as readonly [MenuLinkType, ...MenuLinkType[]])

function revalidateNavigation(menuSlug?: string) {
  revalidatePath('/admin/navigation')
  if (menuSlug) revalidatePath(`/admin/navigation/${menuSlug}`)
  updateTag('navigation')
}

// ─── menus ──────────────────────────────────────────────────────────────────

const CreateMenuSchema = z.object({
  slug: Slug,
  name: z.string().trim().min(1).max(120),
  location: MenuLocationSchema,
  description: z.string().trim().max(500).optional().transform((v) => v || null),
})

export async function createMenu(input: z.input<typeof CreateMenuSchema>): Promise<Result<{ id: string; slug: string }>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = CreateMenuSchema.parse(input)
    const created = await db.navMenu.create({
      data: {
        slug: parsed.slug,
        name: parsed.name,
        location: parsed.location,
        description: parsed.description,
      },
      select: { id: true, slug: true },
    })
    revalidateNavigation(created.slug)
    return ok(created)
  } catch (err) {
    return failFromError(err)
  }
}

const UpdateMenuSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().transform((v) => v || null),
})

export async function updateMenu(input: z.input<typeof UpdateMenuSchema>): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = UpdateMenuSchema.parse(input)
    const updated = await db.navMenu.update({
      where: { id: parsed.id },
      data: { name: parsed.name, description: parsed.description },
      select: { slug: true },
    })
    revalidateNavigation(updated.slug)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function publishMenu(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    z.string().uuid().parse(id)
    const updated = await db.navMenu.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
      select: { slug: true },
    })
    revalidateNavigation(updated.slug)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function unpublishMenu(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    z.string().uuid().parse(id)
    const updated = await db.navMenu.update({
      where: { id },
      data: { isPublished: false },
      select: { slug: true },
    })
    revalidateNavigation(updated.slug)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteMenu(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    z.string().uuid().parse(id)
    await db.navMenu.delete({ where: { id } })
    revalidateNavigation()
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ─── items ──────────────────────────────────────────────────────────────────

const ItemFkFields = z.object({
  categoryId: OptionalUuid,
  brandId: OptionalUuid,
  industryId: OptionalUuid,
  cmsPageId: OptionalUuid,
  productId: OptionalUuid,
})

const UpsertItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    menuId: z.string().uuid(),
    parentId: OptionalUuid,
    label: z.string().trim().min(1).max(80),
    iconName: z
      .string()
      .trim()
      .max(40)
      .optional()
      .transform((v) => v || null),
    badge: z
      .string()
      .trim()
      .max(20)
      .optional()
      .transform((v) => v || null),
    description: z
      .string()
      .trim()
      .max(280)
      .optional()
      .transform((v) => v || null),
    linkType: MenuLinkTypeSchema,
    customUrl: z
      .string()
      .trim()
      .max(2048)
      .optional()
      .transform((v) => v || null),
    openInNewTab: z.boolean().default(false),
    isVisible: z.boolean().default(true),
  })
  .merge(ItemFkFields)
  .superRefine((val, ctx) => {
    if (val.iconName && !isAllowedIconName(val.iconName)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['iconName'], message: 'Unknown icon' })
    }
    if (val.linkType === 'custom_url') {
      if (!val.customUrl || !isValidCustomUrl(val.customUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customUrl'],
          message: 'Custom URL must start with / or https://',
        })
      }
    }
    const fkMap: Record<MenuLinkType, string | null> = {
      none: null,
      custom_url: null,
      category: val.categoryId,
      brand: val.brandId,
      industry: val.industryId,
      cms_page: val.cmsPageId,
      product: val.productId,
    }
    const expectedFk = fkMap[val.linkType]
    if (val.linkType !== 'none' && val.linkType !== 'custom_url' && !expectedFk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [`${val.linkType}Id`],
        message: 'Pick a target',
      })
    }
  })

export async function upsertItem(input: z.input<typeof UpsertItemSchema>): Promise<Result<{ id: string }>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = UpsertItemSchema.parse(input)
    const fkPayload = {
      categoryId: parsed.linkType === 'category' ? parsed.categoryId : null,
      brandId: parsed.linkType === 'brand' ? parsed.brandId : null,
      industryId: parsed.linkType === 'industry' ? parsed.industryId : null,
      cmsPageId: parsed.linkType === 'cms_page' ? parsed.cmsPageId : null,
      productId: parsed.linkType === 'product' ? parsed.productId : null,
      customUrl: parsed.linkType === 'custom_url' ? parsed.customUrl : null,
    }
    const data = {
      menuId: parsed.menuId,
      parentId: parsed.parentId,
      label: parsed.label,
      iconName: parsed.iconName,
      badge: parsed.badge,
      description: parsed.description,
      linkType: parsed.linkType,
      openInNewTab: parsed.openInNewTab,
      isVisible: parsed.isVisible,
      ...fkPayload,
    }

    let item: { id: string; menu: { slug: string } }
    if (parsed.id) {
      item = await db.navMenuItem.update({
        where: { id: parsed.id },
        data,
        select: { id: true, menu: { select: { slug: true } } },
      })
    } else {
      const max = await db.navMenuItem.aggregate({
        where: { menuId: parsed.menuId, parentId: parsed.parentId },
        _max: { position: true },
      })
      const nextPosition = (max._max.position ?? -1) + 1
      item = await db.navMenuItem.create({
        data: { ...data, position: nextPosition },
        select: { id: true, menu: { select: { slug: true } } },
      })
    }
    revalidateNavigation(item.menu.slug)
    return ok({ id: item.id })
  } catch (err) {
    return failFromError(err)
  }
}

export async function deleteItem(id: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    z.string().uuid().parse(id)
    const removed = await db.navMenuItem.delete({
      where: { id },
      select: { menu: { select: { slug: true } } },
    })
    revalidateNavigation(removed.menu.slug)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

const ReorderSchema = z.object({
  menuId: z.string().uuid(),
  ordering: z
    .array(
      z.object({
        id: z.string().uuid(),
        parentId: z.string().uuid().nullable(),
        position: z.number().int().min(0),
      }),
    )
    .min(1),
})

export async function reorderItems(input: z.input<typeof ReorderSchema>): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = ReorderSchema.parse(input)

    const ids = parsed.ordering.map((row) => row.id)
    const owned = await db.navMenuItem.findMany({
      where: { id: { in: ids }, menuId: parsed.menuId },
      select: { id: true, menu: { select: { slug: true } } },
    })
    if (owned.length !== ids.length) {
      return fail('VALIDATION', 'Some items do not belong to this menu')
    }

    const newParentMap = new Map(parsed.ordering.map((row) => [row.id, row.parentId]))
    for (const row of parsed.ordering) {
      if (row.parentId === row.id) {
        return fail('VALIDATION', 'An item cannot be its own parent')
      }
      let cursor = row.parentId
      const seen = new Set<string>()
      while (cursor) {
        if (cursor === row.id) {
          return fail('VALIDATION', 'Reorder would create a cycle')
        }
        if (seen.has(cursor)) break
        seen.add(cursor)
        cursor = newParentMap.get(cursor) ?? null
      }
    }

    await db.$transaction(
      parsed.ordering.map((row) =>
        db.navMenuItem.update({
          where: { id: row.id },
          data: { parentId: row.parentId, position: row.position },
        }),
      ),
    )

    revalidateNavigation(owned[0]?.menu.slug)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ─── promo ──────────────────────────────────────────────────────────────────

const SetPromoSchema = z.object({
  itemId: z.string().uuid(),
  promoImageId: OptionalUuid,
  promoHeading: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  promoBody: z
    .string()
    .trim()
    .max(280)
    .optional()
    .transform((v) => v || null),
  promoLinkUrl: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .transform((v) => v || null),
})

export async function setPromo(input: z.input<typeof SetPromoSchema>): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = SetPromoSchema.parse(input)
    if (parsed.promoLinkUrl && !isValidCustomUrl(parsed.promoLinkUrl)) {
      return fail('VALIDATION', 'Promo link must start with / or https://', {
        promoLinkUrl: ['Invalid URL'],
      })
    }
    const updated = await db.navMenuItem.update({
      where: { id: parsed.itemId },
      data: {
        promoImageId: parsed.promoImageId,
        promoHeading: parsed.promoHeading,
        promoBody: parsed.promoBody,
        promoLinkUrl: parsed.promoLinkUrl,
      },
      select: { menu: { select: { slug: true } } },
    })
    revalidateNavigation(updated.menu.slug)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

export async function uploadPromoImage(formData: FormData): Promise<Result<{ mediaId: string; url: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.CMS_WRITE)
    const file = formData.get('file')
    if (!(file instanceof File)) return fail('VALIDATION', 'No file provided')
    if (!file.type.startsWith('image/')) return fail('VALIDATION', 'Only image uploads are allowed')
    if (file.size > 5_000_000) return fail('VALIDATION', 'Image must be under 5 MB')

    const { storagePath, bytes, mimeType } = await uploadToStorage(STORAGE_BUCKETS.images, file, 'nav-promo')
    const media = await db.media.create({
      data: {
        kind: 'image',
        mimeType,
        originalFilename: file.name,
        storagePath,
        bytes,
        uploadedById: session.user.id,
      },
      select: { id: true, storagePath: true },
    })
    return ok({ mediaId: media.id, url: media.storagePath })
  } catch (err) {
    return failFromError(err)
  }
}

// ─── link target search ─────────────────────────────────────────────────────

const SearchSchema = z.object({
  linkType: MenuLinkTypeSchema,
  query: z.string().trim().max(120),
})

export async function searchLinkTargets(
  input: z.input<typeof SearchSchema>,
): Promise<Result<Array<{ id: string; label: string; sublabel: string | null }>>> {
  try {
    requireRole(await auth(), ROLES.CMS_WRITE)
    const parsed = SearchSchema.parse(input)
    const q = parsed.query
    const take = 20

    if (parsed.linkType === 'category') {
      const rows = await db.category.findMany({
        where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] } : undefined,
        take,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      })
      return ok(rows.map((r) => ({ id: r.id, label: r.name, sublabel: `/c/${r.slug}` })))
    }
    if (parsed.linkType === 'brand') {
      const rows = await db.brand.findMany({
        where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] } : undefined,
        take,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      })
      return ok(rows.map((r) => ({ id: r.id, label: r.name, sublabel: `/brands/${r.slug}` })))
    }
    if (parsed.linkType === 'industry') {
      const rows = await db.industry.findMany({
        where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] } : undefined,
        take,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      })
      return ok(rows.map((r) => ({ id: r.id, label: r.name, sublabel: `/industries/${r.slug}` })))
    }
    if (parsed.linkType === 'cms_page') {
      const rows = await db.cmsPage.findMany({
        where: q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] } : undefined,
        take,
        orderBy: { title: 'asc' },
        select: { id: true, title: true, slug: true },
      })
      return ok(rows.map((r) => ({ id: r.id, label: r.title, sublabel: `/${r.slug}` })))
    }
    if (parsed.linkType === 'product') {
      const rows = await db.product.findMany({
        where: q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }] } : undefined,
        take,
        orderBy: { title: 'asc' },
        select: { id: true, title: true, sku: true },
      })
      return ok(rows.map((r) => ({ id: r.id, label: r.title, sublabel: r.sku })))
    }
    return ok([])
  } catch (err) {
    return failFromError(err)
  }
}
