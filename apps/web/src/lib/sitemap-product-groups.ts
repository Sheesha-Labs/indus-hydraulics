/**
 * Which product sitemap a product belongs to — by the root of its category tree.
 *
 * WHY (2026-11-20). One `products.xml` of ~7,200 URLs gave Search Console one
 * coverage number for the whole catalogue. The URL Inspection sample that day
 * found 0/40 lifting and 0/16 marine category pages indexed against 14/40 for
 * hoses — a difference that a single averaged product figure cannot show for
 * the product pages under them. Split by root group, Search Console reports
 * coverage per group, which is the axis the next fix would act along.
 *
 * Pure (no database import) so the grouping is unit-tested.
 */

export type ProductSitemapGroup = 'hoses' | 'lifting' | 'marine' | 'other'

export const PRODUCT_SITEMAP_GROUPS: readonly ProductSitemapGroup[] = [
  'hoses',
  'lifting',
  'marine',
  'other',
] as const

/** Root-category slugs per group. Anything not listed is `other`. */
export const PRODUCT_GROUP_ROOTS: Readonly<
  Record<Exclude<ProductSitemapGroup, 'other'>, readonly string[]>
> = {
  hoses: [
    'hydraulic-hose-fittings-suppliers-uae',
    'industrial-hose-suppliers-uae',
    'oil-gas-hoses',
    'lay-flat-hoses',
  ],
  lifting: ['lifting-rigging-equipment-uae'],
  marine: ['marine-equipment-uae'],
}

/** The group a root-category slug falls in; `other` for an unknown or missing root. */
export function groupForRootSlug(rootSlug: string | null | undefined): ProductSitemapGroup {
  if (!rootSlug) return 'other'
  for (const [group, roots] of Object.entries(PRODUCT_GROUP_ROOTS)) {
    if (roots.includes(rootSlug)) return group as ProductSitemapGroup
  }
  return 'other'
}

export type CategoryNode = { id: string; parentId: string | null; slug: string }

/**
 * Group of every category id, resolved through its root ancestor.
 *
 * A cycle in the tree (which the admin should never allow) or a dangling
 * parent stops the walk at the last node reached rather than looping, and
 * that node's slug decides the group.
 */
export function categoryGroups(
  categories: readonly CategoryNode[]
): Map<string, ProductSitemapGroup> {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const groups = new Map<string, ProductSitemapGroup>()
  for (const category of categories) {
    let node = category
    const seen = new Set<string>([node.id])
    while (node.parentId) {
      const parent = byId.get(node.parentId)
      if (!parent || seen.has(parent.id)) break
      seen.add(parent.id)
      node = parent
    }
    groups.set(category.id, groupForRootSlug(node.slug))
  }
  return groups
}

/** Category ids whose products belong in `group`. */
export function categoryIdsForGroup(
  groups: ReadonlyMap<string, ProductSitemapGroup>,
  group: ProductSitemapGroup
): string[] {
  return [...groups].filter(([, g]) => g === group).map(([id]) => id)
}
