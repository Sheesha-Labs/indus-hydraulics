import 'server-only'
import { db } from '@indus/db'
import type { MenuLinkType, MenuLocation, NavDraftItem } from '@indus/domain'

/**
 * Load one menu in the shape the unified editor edits.
 *
 * `uid` is seeded from the database id for every existing row. That is the
 * whole trick behind the diff: a row keeps the same uid across an editing
 * session whether or not it has been saved, so "which row is this" and "does
 * this row exist in the database yet" stay separate questions.
 */
export async function loadNavMenuDraft(location: MenuLocation): Promise<{
  id: string
  slug: string
  name: string
  isPublished: boolean
  publishedAt: string | null
  items: NavDraftItem[]
} | null> {
  const menu = await db.navMenu.findUnique({
    where: { location },
    select: {
      id: true,
      slug: true,
      name: true,
      isPublished: true,
      publishedAt: true,
      items: {
        orderBy: [{ position: 'asc' }],
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
      },
    },
  })
  if (!menu) return null

  return {
    id: menu.id,
    slug: menu.slug,
    name: menu.name,
    isPublished: menu.isPublished,
    publishedAt: menu.publishedAt ? menu.publishedAt.toISOString() : null,
    items: toTreeOrder(menu.items),
  }
}

type Row = {
  id: string
  parentId: string | null
  position: number
  label: string
  linkType: string
  customUrl: string | null
  categoryId: string | null
  brandId: string | null
  industryId: string | null
  cmsPageId: string | null
  productId: string | null
  iconName: string | null
  badge: string | null
  description: string | null
  openInNewTab: boolean
  isVisible: boolean
  promoImageId: string | null
  promoHeading: string | null
  promoBody: string | null
  promoLinkUrl: string | null
}

/**
 * Depth-first, parents before children, siblings by position.
 *
 * The editor and the save both treat array order as tree order, so this is
 * where that contract is established. A flat `orderBy: position` would
 * interleave levels — every row of position 0 first, from every parent — and
 * the first save would rewrite the whole menu.
 */
function toTreeOrder(rows: Row[]): NavDraftItem[] {
  const byParent = new Map<string | null, Row[]>()
  for (const row of rows) {
    const list = byParent.get(row.parentId) ?? []
    list.push(row)
    byParent.set(row.parentId, list)
  }
  for (const list of byParent.values()) list.sort((a, b) => a.position - b.position)

  const out: NavDraftItem[] = []
  const walk = (parentId: string | null, guard = 0) => {
    // A cycle in `parentId` is impossible through the UI and cheap to survive
    // if the data ever acquires one by hand.
    if (guard > 64) return
    for (const row of byParent.get(parentId) ?? []) {
      out.push({
        id: row.id,
        uid: row.id,
        parentUid: row.parentId,
        label: row.label,
        linkType: row.linkType as MenuLinkType,
        customUrl: row.customUrl,
        categoryId: row.categoryId,
        brandId: row.brandId,
        industryId: row.industryId,
        cmsPageId: row.cmsPageId,
        productId: row.productId,
        iconName: row.iconName,
        badge: row.badge,
        description: row.description,
        openInNewTab: row.openInNewTab,
        isVisible: row.isVisible,
        promoImageId: row.promoImageId,
        promoHeading: row.promoHeading,
        promoBody: row.promoBody,
        promoLinkUrl: row.promoLinkUrl,
      })
      walk(row.id, guard + 1)
    }
  }
  walk(null)
  return out
}
