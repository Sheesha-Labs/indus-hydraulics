'use server'

import { revalidatePath } from 'next/cache'
import { invalidateNavigation } from '../../../../lib/cache-tags'
import { z } from 'zod'
import { db } from '@indus/db'
import {
  MENU_LINK_TYPES,
  MENU_LOCATIONS,
  type MenuLinkType,
  type MenuLocation,
} from '@indus/domain'
import { auth } from '../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../lib/rbac'
import { failFromError, ok, type Result } from '../../../../lib/result'

/**
 * What is left of the per-item navigation actions.
 *
 * `upsertItem`, `deleteItem`, `reorderItems`, `setPromo`, `uploadPromoImage`,
 * `updateMenu`, `deleteMenu`, `publishMenu` and `unpublishMenu` were the API
 * of the old dialog-per-item editor. The unified editor batches a screenful of
 * edits into `saveMenuTree` (see nav-tree-save.ts) and toggles publish through
 * `setMenuPublished`, so none of them had a caller left.
 *
 * They are deleted rather than kept "just in case": every export of a
 * 'use server' module is a callable endpoint, so an unused one is reachable
 * surface with no screen behind it to say what it is for.
 */

const Slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case')

const MenuLocationSchema = z.enum(MENU_LOCATIONS as readonly [MenuLocation, ...MenuLocation[]])
const MenuLinkTypeSchema = z.enum(MENU_LINK_TYPES as readonly [MenuLinkType, ...MenuLinkType[]])

function revalidateNavigation(menuSlug?: string) {
  revalidatePath('/admin/navigation')
  if (menuSlug) revalidatePath(`/admin/navigation/${menuSlug}`)
  // Was updateTag('navigation') — a tag the storefront never registered, so it
  // purged nothing and the megamenu waited out its 60s timer regardless.
  // invalidateNavigation() hits the three tags that actually exist.
  invalidateNavigation()
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
