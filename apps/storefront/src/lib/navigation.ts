import 'server-only'
import { cache } from 'react'
import { db } from '@indus/db'
import {
  type MenuLinkType,
  type MenuLocation,
  type ResolvedNavItem,
  type ResolvedNavMenu,
} from '@indus/domain'

async function loadRaw(location: MenuLocation) {
  return db.navMenu.findUnique({
    where: { location },
    include: {
      items: {
        where: { isVisible: true },
        orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
        include: {
          category: { select: { slug: true, _count: { select: { products: true } } } },
          brand: { select: { slug: true } },
          industry: { select: { slug: true } },
          cmsPage: { select: { slug: true } },
          product: { select: { sku: true } },
          promoImage: { select: { storagePath: true } },
        },
      },
    },
  })
}

type LoadedMenu = NonNullable<Awaited<ReturnType<typeof loadRaw>>>
type RawItem = LoadedMenu['items'][number]

function resolveHref(item: RawItem): string | null {
  switch (item.linkType as MenuLinkType) {
    case 'category':
      return item.category ? `/c/${item.category.slug}` : null
    case 'brand':
      return item.brand ? `/brands/${item.brand.slug}` : null
    case 'industry':
      return item.industry ? `/industries/${item.industry.slug}` : null
    case 'cms_page':
      return item.cmsPage ? `/${item.cmsPage.slug}` : null
    case 'product':
      return item.product ? `/p/${item.product.sku}` : null
    case 'custom_url':
      return item.customUrl ?? null
    case 'none':
    default:
      return null
  }
}

function buildTree(rawItems: RawItem[]): ResolvedNavItem[] {
  const byParent = new Map<string | null, RawItem[]>()
  for (const it of rawItems) {
    const arr = byParent.get(it.parentId) ?? []
    arr.push(it)
    byParent.set(it.parentId, arr)
  }
  for (const arr of byParent.values()) arr.sort((a, b) => a.position - b.position)

  function buildLevel(parentId: string | null): ResolvedNavItem[] {
    const rows = byParent.get(parentId) ?? []
    return rows
      .map<ResolvedNavItem | null>((row) => {
        const href = resolveHref(row)
        // For non-leaf items, allow null href (rendered as section header).
        // For leaves with broken FK targets, drop them.
        const children = buildLevel(row.id)
        const linkType = row.linkType as MenuLinkType
        const expectsHref = linkType !== 'none'
        if (expectsHref && !href && children.length === 0) return null
        return {
          id: row.id,
          parentId: row.parentId,
          position: row.position,
          label: row.label,
          iconName: row.iconName,
          badge: row.badge,
          description: row.description,
          href,
          openInNewTab: row.openInNewTab,
          productCount: row.category?._count?.products ?? null,
          promoImageUrl: row.promoImage?.storagePath ?? null,
          promoHeading: row.promoHeading,
          promoBody: row.promoBody,
          promoLinkUrl: row.promoLinkUrl,
          children,
        }
      })
      .filter((v): v is ResolvedNavItem => v !== null)
  }

  return buildLevel(null)
}

export const getNavMenu = cache(async (location: MenuLocation): Promise<ResolvedNavMenu | null> => {
  const menu = await loadRaw(location)
  if (!menu || !menu.isPublished) return null
  return {
    id: menu.id,
    slug: menu.slug,
    name: menu.name,
    location: menu.location as MenuLocation,
    isPublished: menu.isPublished,
    publishedAt: menu.publishedAt,
    items: buildTree(menu.items),
  }
})
