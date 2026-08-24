import 'server-only'
import { z } from 'zod'
import { db, type Prisma } from '@indus/db'
import {
  isAllowedIconName,
  isValidCustomUrl,
  MENU_LINK_TYPES,
  navRowUnchanged,
  type MenuLinkType,
} from '@indus/domain'
import { fail, ok, type Result } from '../../../../lib/result'

/**
 * Save a whole menu tree as the difference between what was loaded and what
 * the editor now holds.
 *
 * Replaces the per-item `upsertItem` / `deleteItem` / `reorderItems` round
 * trips for the unified editor. Those still exist and still work; this is the
 * batched path that lets one Save express a screenful of edits.
 *
 * ── Ordering is load-bearing: create, then update, then delete ──
 *
 * Deleting first looks natural and is wrong. `NavMenuItem.parent` cascades, so
 * deleting a column that the editor emptied by dragging its links ELSEWHERE
 * takes those links with it — they still carry the old `parentId` in the
 * database at that moment, however the draft has re-parented them. Every
 * subsequent update then fails against a row that no longer exists, and the
 * links are simply gone.
 *
 * Creating first is equally load-bearing: a new row may be the new parent of
 * an existing one, so its id has to exist before the updates that point at it.
 *
 * ── Scoping ──
 *
 * Every id the payload names is checked to belong to THIS menu before
 * anything is written, and both the delete and the updates are filtered by
 * `menuId` again at the query. The megamenu is 323 rows in the same table; a
 * save that could reach outside its own menu is the one bug here that would
 * not be recoverable from the UI.
 */

const MenuLinkTypeSchema = z.enum(MENU_LINK_TYPES as readonly [MenuLinkType, ...MenuLinkType[]])

const OptionalUuid = z
  .union([z.string().uuid(), z.literal(''), z.null()])
  .optional()
  .transform((v) => (v ? v : null))

const OptionalText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.null()])
    .optional()
    .transform((v) => (v ? v : null))

const DraftItemSchema = z
  .object({
    id: z.union([z.string().uuid(), z.null()]),
    uid: z.string().min(1).max(64),
    parentUid: z.union([z.string().min(1).max(64), z.null()]),
    label: z.string().trim().min(1, 'Label is required').max(80),
    linkType: MenuLinkTypeSchema,
    customUrl: OptionalText(2048),
    categoryId: OptionalUuid,
    brandId: OptionalUuid,
    industryId: OptionalUuid,
    cmsPageId: OptionalUuid,
    productId: OptionalUuid,
    iconName: OptionalText(40),
    badge: OptionalText(20),
    description: OptionalText(280),
    openInNewTab: z.boolean(),
    isVisible: z.boolean(),
    promoImageId: OptionalUuid,
    promoHeading: OptionalText(120),
    promoBody: OptionalText(280),
    promoLinkUrl: OptionalText(2048),
  })
  .superRefine((val, ctx) => {
    if (val.iconName && !isAllowedIconName(val.iconName)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['iconName'], message: 'Unknown icon' })
    }
    if (val.linkType === 'custom_url' && (!val.customUrl || !isValidCustomUrl(val.customUrl))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customUrl'],
        message: `“${val.label}”: URL must start with / or https://`,
      })
    }
    if (val.promoLinkUrl && !isValidCustomUrl(val.promoLinkUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['promoLinkUrl'],
        message: `“${val.label}”: promo link must start with / or https://`,
      })
    }
    const target =
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
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['target'],
        message: `“${val.label}”: pick a target, or change its link type`,
      })
    }
  })

export const SaveMenuTreeSchema = z.object({
  menuId: z.string().uuid(),
  /** Tree order — a parent always precedes its children. */
  items: z.array(DraftItemSchema).max(1000),
})

export type SaveMenuTreeInput = z.input<typeof SaveMenuTreeSchema>
export type NavTreeItemInput = z.input<typeof DraftItemSchema>
export const NavTreeItemsSchema = z.array(DraftItemSchema).max(1000)
type DraftItem = z.output<typeof DraftItemSchema>

/** The five FK columns and `customUrl`, nulled for every type but the one in use. */
function linkColumns(item: DraftItem) {
  return {
    customUrl: item.linkType === 'custom_url' ? item.customUrl : null,
    categoryId: item.linkType === 'category' ? item.categoryId : null,
    brandId: item.linkType === 'brand' ? item.brandId : null,
    industryId: item.linkType === 'industry' ? item.industryId : null,
    cmsPageId: item.linkType === 'cms_page' ? item.cmsPageId : null,
    productId: item.linkType === 'product' ? item.productId : null,
  }
}

function itemColumns(item: DraftItem) {
  return {
    label: item.label,
    linkType: item.linkType,
    iconName: item.iconName,
    badge: item.badge,
    description: item.description,
    openInNewTab: item.openInNewTab,
    isVisible: item.isVisible,
    promoImageId: item.promoImageId,
    promoHeading: item.promoHeading,
    promoBody: item.promoBody,
    promoLinkUrl: item.promoLinkUrl,
    ...linkColumns(item),
  }
}

/** Positions renumbered per parent from array order. The array IS the ordering. */
function placements(items: DraftItem[]): Map<string, number> {
  const perParent = new Map<string | null, number>()
  const out = new Map<string, number>()
  for (const item of items) {
    const next = perParent.get(item.parentUid) ?? 0
    perParent.set(item.parentUid, next + 1)
    out.set(item.uid, next)
  }
  return out
}

function findCycle(items: DraftItem[]): string | null {
  const parentOf = new Map(items.map((i) => [i.uid, i.parentUid]))
  for (const item of items) {
    if (item.parentUid === item.uid) return item.label
    let cursor = item.parentUid
    const seen = new Set<string>()
    while (cursor) {
      if (cursor === item.uid) return item.label
      if (seen.has(cursor)) break
      seen.add(cursor)
      cursor = parentOf.get(cursor) ?? null
    }
  }
  return null
}

/**
 * The write itself, callable from inside another transaction.
 *
 * Split out so the Footer screen — which saves two menus plus store settings
 * plus the social rows as one unit — can wrap all of it in a single
 * transaction rather than issuing four independent saves that can half-fail.
 */
export async function applyMenuTree(
  client: Prisma.TransactionClient | typeof db,
  menuId: string,
  items: DraftItem[],
): Promise<Result<{ slug: string }>> {
  const menu = await client.navMenu.findUnique({ where: { id: menuId }, select: { slug: true } })
  if (!menu) return fail('NOT_FOUND', 'That menu no longer exists.')

  const cyclicLabel = findCycle(items)
  if (cyclicLabel) {
    return fail('VALIDATION', `“${cyclicLabel}” would end up inside itself.`)
  }

  const uids = new Set(items.map((i) => i.uid))
  for (const item of items) {
    if (item.parentUid && !uids.has(item.parentUid)) {
      return fail('VALIDATION', `“${item.label}” points at a parent that is not in this menu.`)
    }
  }

  // Every comparable column, not just the id: a save must issue a write only
  // for rows that actually changed. Rewriting all of them unconditionally
  // works, but 323 sequential round trips to a remote database takes over five
  // seconds — so a no-op save on the megamenu would block the editor for
  // longer than the edit took, every time.
  const existing = await client.navMenuItem.findMany({
    where: { menuId },
    select: {
      id: true,
      parentId: true,
      position: true,
      label: true,
      linkType: true,
      customUrl: true,
      categoryId: true,
      brandId: true,
      industryId: true,
      cmsPageId: true,
      productId: true,
      iconName: true,
      badge: true,
      description: true,
      openInNewTab: true,
      isVisible: true,
      promoImageId: true,
      promoHeading: true,
      promoBody: true,
      promoLinkUrl: true,
    },
  })
  const existingById = new Map(existing.map((row) => [row.id, row]))
  const existingIds = new Set(existing.map((row) => row.id))

  // An id in the payload that this menu does not own is refused rather than
  // ignored: silently dropping it would save a tree missing a row the editor
  // can still see on screen.
  for (const item of items) {
    if (item.id !== null && !existingIds.has(item.id)) {
      return fail('CONFLICT', 'This menu changed since you opened it. Reload and try again.')
    }
  }

  const keptIds = new Set(items.map((i) => i.id).filter((id): id is string => id !== null))
  const deletedIds = [...existingIds].filter((id) => !keptIds.has(id))
  const position = placements(items)

  // uid → database id. Seeded with the rows that already have one so a created
  // row can name an existing parent, then extended as rows are created so a
  // created row can name a created parent.
  const idByUid = new Map<string, string>()
  for (const item of items) if (item.id) idByUid.set(item.uid, item.id)

  const run = async (tx: Prisma.TransactionClient) => {
    // 1) Create. Tree order guarantees a parent is created before its child.
    for (const item of items) {
      if (item.id !== null) continue
      const parentId = item.parentUid ? (idByUid.get(item.parentUid) ?? null) : null
      const created = await tx.navMenuItem.create({
        data: {
          menuId,
          parentId,
          position: position.get(item.uid) ?? 0,
          ...itemColumns(item),
        },
        select: { id: true },
      })
      idByUid.set(item.uid, created.id)
    }

    // 2) Update the surviving rows that actually changed. Re-parenting happens
    //    HERE, before any delete, so a link dragged out of a column about to be
    //    removed is no longer that column's child when it goes.
    for (const item of items) {
      if (item.id === null) continue
      const parentId = item.parentUid ? (idByUid.get(item.parentUid) ?? null) : null
      const nextPosition = position.get(item.uid) ?? 0
      const columns = itemColumns(item)
      const before = existingById.get(item.id)
      if (before && navRowUnchanged(before, { parentId, position: nextPosition, columns })) {
        continue
      }
      await tx.navMenuItem.updateMany({
        where: { id: item.id, menuId },
        data: { parentId, position: nextPosition, ...columns },
      })
    }

    // 3) Delete last. Cascade now only reaches rows the draft also dropped.
    if (deletedIds.length > 0) {
      await tx.navMenuItem.deleteMany({ where: { id: { in: deletedIds }, menuId } })
    }
  }

  // `$transaction` exists on the client but not on a transaction client, which
  // is how this tells "called directly" from "called inside the Footer save".
  if ('$transaction' in client) {
    await client.$transaction(run, { timeout: 30_000 })
  } else {
    await run(client as Prisma.TransactionClient)
  }

  return ok({ slug: menu.slug })
}

