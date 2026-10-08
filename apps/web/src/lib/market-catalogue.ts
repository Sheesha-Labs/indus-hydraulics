import 'server-only'

import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import { STOREFRONT_TAGS } from './cache-tags'
import { mediaUrl } from './media'
import type { CatalogueCluster } from '../components/markets/MarketCatalogueIndex'
import type { MarketBrand, MarketSectorImage } from '../components/markets/MarketIndustries'

/**
 * The catalogue surface a market page links out to.
 *
 * Read from the live tree rather than a written list, for the same reason the
 * older market layout did: the headings a buyer searches for sit above a real,
 * current list of what we stock, and the page cannot drift out of date as the
 * catalogue changes. Every market page runs the same two queries, so both are
 * cross-request cached against the tags admin already purges.
 */

/**
 * Flatten a cluster to its LEAF sub-ranges.
 *
 * The tree is three deep in places — Hoses & Fittings holds "Hydraulic
 * Fittings", which holds eleven specific thread patterns. The links a buyer
 * searches for are the leaves ("SS316L JIC 37° Fittings in Nigeria"), and
 * listing the intermediate alongside its own children reads as a duplicate and
 * competes with it for the same query. So: leaves only, in tree order.
 */
function leafSubRanges(node: CategoryNode): Array<{ slug: string; name: string }> {
  if (node.children.length === 0) return []
  return node.children.flatMap((child) => {
    const deeper = leafSubRanges(child)
    return deeper.length > 0 ? deeper : [{ slug: child.slug, name: child.name }]
  })
}

type CategoryNode = {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  imageUrl: string | null
  imageAlt: string | null
  children: CategoryNode[]
}

const loadClusters = unstable_cache(
  async (): Promise<CatalogueCluster[]> => {
    // One flat read, assembled in memory. Prisma cannot express "all
    // descendants" and a nested `include` would pin the depth — this way an
    // extra level appears on the page the day someone adds one.
    const rows = await db.category.findMany({
      where: { isPublished: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        parentId: true,
        slug: true,
        name: true,
        shortDescription: true,
        image: { select: { storagePath: true, alt: true } },
      },
    })

    const byParent = new Map<string, typeof rows>()
    for (const row of rows) {
      const key = row.parentId ?? 'root'
      const bucket = byParent.get(key)
      if (bucket) bucket.push(row)
      else byParent.set(key, [row])
    }

    const build = (row: (typeof rows)[number]): CategoryNode => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.shortDescription,
      imageUrl: row.image ? mediaUrl(row.image.storagePath) : null,
      // The media row's own alt text, not the category name. A category name
      // describes the link; alt describes the photograph, and the two are only
      // the same thing by accident.
      imageAlt: row.image?.alt ?? null,
      children: (byParent.get(row.id) ?? []).map(build),
    })

    return (byParent.get('root') ?? [])
      .map(build)
      .map((node) => ({
        slug: node.slug,
        name: node.name,
        description: node.shortDescription,
        imageUrl: node.imageUrl,
        imageAlt: node.imageAlt ?? node.name,
        subRanges: leafSubRanges(node),
      }))
      /*
        A top-level category with neither sub-ranges nor a description has
        nothing to say here, and an empty card is worse than no card. Three
        categories currently fall out on that rule — Hydraulic Pumps, Hydraulic
        Cylinders and Seals & Accessories, all real ranges with no
        `shortDescription` written yet. Give any of them a description in admin
        and it appears on all 126 market pages with no code change.
      */
      .filter((cluster) => cluster.subRanges.length > 0 || cluster.description)
  },
  // v2: wide-cluster-first ordering dropped (2026-10) — admin order now rules.
  ['market-catalogue-clusters-v2'],
  { revalidate: 3600, tags: [STOREFRONT_TAGS.categories] }
)

/**
 * Brands with at least one published product.
 *
 * "Brands stocked for Nigeria" is a claim about inventory, so it is answered
 * from inventory. A brand with no published products is one we can source, not
 * one we stock, and listing it here would be the sort of small overstatement
 * that a buyer checks and finds.
 */
const loadBrands = unstable_cache(
  async (): Promise<MarketBrand[]> => {
    const brands = await db.brand.findMany({
      where: { isPublished: true, products: { some: { status: 'active' } } },
      orderBy: { name: 'asc' },
      select: { slug: true, name: true },
    })
    return brands
  },
  ['market-catalogue-brands'],
  { revalidate: 3600, tags: [STOREFRONT_TAGS.brands] }
)

/**
 * Hero photographs for the six market sectors, keyed by sector slug.
 *
 * The sector slugs on a market record are the industry slugs (`oil-gas`,
 * `marine`, `power`, `construction`, `steel`, `mining`), and each industry page
 * has a hero photograph with written alt text. Reading them here means the
 * sector cards on all 126 market pages show the same picture the card links
 * to — and pick up a replacement the day an editor changes the industry hero,
 * with no code change. A sector with no published industry or no hero keeps
 * the labelled placeholder.
 */
const loadSectorImages = unstable_cache(
  async (): Promise<Record<string, MarketSectorImage>> => {
    const rows = await db.industry.findMany({
      where: { isPublished: true, heroId: { not: null } },
      select: { slug: true, name: true, hero: { select: { storagePath: true, alt: true } } },
    })
    const out: Record<string, MarketSectorImage> = {}
    for (const row of rows) {
      if (!row.hero) continue
      out[row.slug] = { url: mediaUrl(row.hero.storagePath), alt: row.hero.alt ?? row.name }
    }
    return out
  },
  ['market-sector-images'],
  { revalidate: 3600, tags: [STOREFRONT_TAGS.industries] }
)

export function marketSectorImages(): Promise<Record<string, MarketSectorImage>> {
  return loadSectorImages()
}

export function marketCatalogueClusters(): Promise<CatalogueCluster[]> {
  return loadClusters()
}

export function marketStockedBrands(): Promise<MarketBrand[]> {
  return loadBrands()
}
