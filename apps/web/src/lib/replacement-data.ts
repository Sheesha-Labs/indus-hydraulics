import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import {
  competitorBrandSlug,
  groupCrossReferencesByCompetitor,
  isStandardDesignation,
  uniqueReplacementKeys,
  type CrossRefRow,
} from '@indus/domain'

/**
 * Source-of-truth data layer for the /replacement/... programmatic
 * pages. We fetch all active cross-references once per request,
 * cache them across requests for 5 minutes (admin-managed data),
 * then run the in-memory slug matchers from `@indus/domain` to
 * answer per-page queries.
 *
 * Two kinds of row live in the table:
 *
 *   - family rows   — a competitor family named against a listing (Crosby
 *                     G-209 → the G-209 pattern shackle). These get their own
 *                     `/replacement/<brand>/<mpn>` page, as before.
 *   - per-size rows — one competitor number per Indus part number
 *                     (`variantPartNumber` set), thousands of them from the
 *                     Hydraulics Direct interchange data. These print in the
 *                     product page's size table and are listed on the brand hub
 *                     by series. Their part pages stay reachable but are
 *                     noindex and canonical to the product: a page per size is
 *                     the near-duplicate template the 2026-09-04 audit removed.
 *
 * The cache holds slim rows plus one copy of each product. Embedding the
 * product in every row — 5,000+ rows sharing ~150 products — would pass the
 * 2 MB Data Cache entry limit, and an over-limit entry is silently not cached,
 * so every replacement page would query the whole table on every request.
 */

export type Compatibility = 'direct' | 'compatible' | 'superseded_by_us'

type SlimRow = CrossRefRow & {
  compatibility: Compatibility
  variantPartNumber: string | null
  series: string | null
}

export type ReplacementProduct = {
  id: string
  sku: string
  slug: string
  title: string
  descriptionShort: string | null
  status: string
  brand: { name: string; slug: string } | null
  images: Array<{ alt: string | null; media: { storagePath: string; alt: string | null } }>
}

export type ReplacementMatch = SlimRow & { product: ReplacementProduct }

const loadReplacementData = unstable_cache(
  async (): Promise<{ rows: SlimRow[]; products: Record<string, ReplacementProduct> }> => {
    const rows = await db.productCrossReference.findMany({
      where: { product: { status: 'active' } },
      select: {
        productId: true,
        competitorBrand: true,
        competitorMpn: true,
        compatibility: true,
        variantPartNumber: true,
        series: true,
      },
    })
    const ids = [...new Set(rows.map((r) => r.productId))]
    const products = await db.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        sku: true,
        slug: true,
        title: true,
        descriptionShort: true,
        status: true,
        brand: { select: { name: true, slug: true } },
        images: {
          orderBy: { position: 'asc' },
          take: 1,
          select: { alt: true, media: { select: { storagePath: true, alt: true } } },
        },
      },
    })
    return { rows, products: Object.fromEntries(products.map((p) => [p.id, p])) }
  },
  ['replacement-cross-references-v2'],
  { revalidate: 300, tags: ['cross-references'] }
)

const getReplacementData = cache(loadReplacementData)

/** Rows that can own a `/replacement/<brand>/<mpn>` page: makers, not standard codes. */
function brandRows(rows: SlimRow[]): SlimRow[] {
  return rows.filter((r) => !isStandardDesignation(r.competitorBrand))
}

/** Return matches for a specific (brandSlug, mpnSlug) pair, or [] if none. */
export async function getReplacementMatches(
  brandSlug: string,
  mpnSlug: string
): Promise<ReplacementMatch[]> {
  const { rows, products } = await getReplacementData()
  const groups = groupCrossReferencesByCompetitor(brandRows(rows))
  const hit = groups.find((g) => g.brandSlug === brandSlug && g.mpnSlug === mpnSlug)
  return (hit?.rows ?? []).flatMap((r) => {
    const product = products[r.productId]
    return product ? [{ ...r, product }] : []
  })
}

export type BrandSeries = {
  series: string
  compatibility: Compatibility
  sizes: number
  product: Pick<ReplacementProduct, 'sku' | 'slug' | 'title'>
}

export type BrandPart = {
  brandSlug: string
  mpnSlug: string
  competitorMpn: string
  matchCount: number
}

/**
 * Everything one competitor brand's hub lists: the series matched size by size
 * (each linking to the Indus listing that carries the full size table) and the
 * family-level part numbers that have their own page.
 */
export async function getReplacementsForBrand(brandSlug: string): Promise<{
  competitorBrand: string
  series: BrandSeries[]
  parts: BrandPart[]
  partNumberCount: number
} | null> {
  const { rows, products } = await getReplacementData()
  const mine = brandRows(rows).filter((r) => competitorBrandSlug(r.competitorBrand) === brandSlug)
  if (mine.length === 0) return null

  const seriesMap = new Map<string, BrandSeries>()
  for (const r of mine) {
    if (!r.variantPartNumber) continue
    const product = products[r.productId]
    if (!product) continue
    const label = r.series ?? r.competitorMpn
    const key = `${label}|${r.productId}`
    const entry = seriesMap.get(key)
    if (entry) entry.sizes += 1
    else
      seriesMap.set(key, {
        series: label,
        compatibility: r.compatibility,
        sizes: 1,
        product: { sku: product.sku, slug: product.slug, title: product.title },
      })
  }

  const parts = groupCrossReferencesByCompetitor(mine.filter((r) => !r.variantPartNumber))
    .map((g) => ({
      brandSlug: g.brandSlug,
      mpnSlug: g.mpnSlug,
      competitorMpn: g.competitorMpn,
      matchCount: g.rows.length,
    }))
    .sort((a, b) => a.competitorMpn.localeCompare(b.competitorMpn))

  return {
    competitorBrand: mine[0]!.competitorBrand,
    series: [...seriesMap.values()].sort(
      (a, b) => a.series.localeCompare(b.series) || a.product.title.localeCompare(b.product.title)
    ),
    parts,
    partNumberCount: new Set(mine.map((r) => r.competitorMpn)).size,
  }
}

/** Top-level brand index, e.g. for /replacement. Standard codes (SAE, MS) are not brands. */
export async function getReplacementBrands(): Promise<
  Array<{ brandSlug: string; competitorBrand: string; mpnCount: number }>
> {
  const { rows } = await getReplacementData()
  const byBrand = new Map<string, { competitorBrand: string; mpns: Set<string> }>()
  for (const r of brandRows(rows)) {
    const slug = competitorBrandSlug(r.competitorBrand)
    if (!slug) continue
    const entry = byBrand.get(slug) ?? {
      competitorBrand: r.competitorBrand,
      mpns: new Set<string>(),
    }
    entry.mpns.add(r.competitorMpn)
    byBrand.set(slug, entry)
  }
  return [...byBrand.entries()]
    .map(([brandSlug, v]) => ({
      brandSlug,
      competitorBrand: v.competitorBrand,
      mpnCount: v.mpns.size,
    }))
    .sort((a, b) => b.mpnCount - a.mpnCount)
}

/**
 * Sitemap entries — sorted (brand, mpn) pairs for family-level rows only.
 * Per-size rows never own an indexable page (see the note at the top).
 */
export async function getReplacementSitemapKeys(): Promise<
  Array<{ brandSlug: string; mpnSlug: string; matches: number }>
> {
  const { rows } = await getReplacementData()
  return uniqueReplacementKeys(brandRows(rows).filter((r) => !r.variantPartNumber))
}
