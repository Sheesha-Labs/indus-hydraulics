import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import {
  groupCrossReferencesByBrand,
  groupCrossReferencesByCompetitor,
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
 * In-memory grouping is sound at the current dataset size (the
 * cross-reference table is small relative to products). When it grows
 * past ~10k rows, swap this for a query that filters on
 * `(brandSlug, mpnSlug)` generated columns + a composite index.
 */

export type ReplacementMatch = CrossRefRow & {
  compatibility: 'direct' | 'compatible' | 'superseded_by_us'
  product: {
    id: string
    sku: string
    slug: string
    title: string
    descriptionShort: string | null
    status: string
    brand: { name: string; slug: string } | null
    images: Array<{ media: { storagePath: string; alt: string | null } }>
  }
}

const loadAllCrossReferences = unstable_cache(
  async (): Promise<ReplacementMatch[]> => {
    const rows = await db.productCrossReference.findMany({
      where: { product: { status: 'active' } },
      include: {
        product: {
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
              include: { media: { select: { storagePath: true, alt: true } } },
            },
          },
        },
      },
    })
    return rows.map((r) => ({
      productId: r.productId,
      competitorBrand: r.competitorBrand,
      competitorMpn: r.competitorMpn,
      compatibility: r.compatibility,
      product: r.product,
    }))
  },
  ['replacement-cross-references'],
  { revalidate: 300, tags: ['cross-references'] },
)

export const getAllReplacementMatches = cache(loadAllCrossReferences)

/** Return matches for a specific (brandSlug, mpnSlug) pair, or [] if none. */
export async function getReplacementMatches(
  brandSlug: string,
  mpnSlug: string,
): Promise<ReplacementMatch[]> {
  const all = await getAllReplacementMatches()
  const groups = groupCrossReferencesByCompetitor(all)
  const hit = groups.find((g) => g.brandSlug === brandSlug && g.mpnSlug === mpnSlug)
  return hit?.rows ?? []
}

/** Return all MPNs we cover for a competitor brand, with match counts. */
export async function getReplacementsForBrand(brandSlug: string): Promise<
  Array<{
    brandSlug: string
    mpnSlug: string
    competitorBrand: string
    competitorMpn: string
    matchCount: number
  }>
> {
  const all = await getAllReplacementMatches()
  const groups = groupCrossReferencesByCompetitor(all)
  return groups
    .filter((g) => g.brandSlug === brandSlug)
    .map((g) => ({
      brandSlug: g.brandSlug,
      mpnSlug: g.mpnSlug,
      competitorBrand: g.competitorBrand,
      competitorMpn: g.competitorMpn,
      matchCount: g.rows.length,
    }))
    .sort((a, b) => a.competitorMpn.localeCompare(b.competitorMpn))
}

/** Top-level brand index, e.g. for /replacement. */
export async function getReplacementBrands(): Promise<
  Array<{ brandSlug: string; competitorBrand: string; mpnCount: number }>
> {
  const all = await getAllReplacementMatches()
  return groupCrossReferencesByBrand(all)
}

/** Sitemap entries — sorted (brand, mpn) pairs. */
export async function getReplacementSitemapKeys(): Promise<
  Array<{ brandSlug: string; mpnSlug: string }>
> {
  const all = await getAllReplacementMatches()
  return uniqueReplacementKeys(all)
}
