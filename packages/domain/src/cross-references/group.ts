import { competitorBrandSlug, competitorMpnSlug } from './slug'

/**
 * Pure helper used by the `/replacement` index pages: given a flat list
 * of cross-reference rows, group them by the slugged
 * (competitorBrand, competitorMpn) key so the index page can render one
 * entry per unique competitor part. Multiple Indus products that
 * replace the same competitor MPN collapse into a single entry with N
 * matching products.
 *
 * Prisma-free: caller passes plain rows.
 */

export type CrossRefRow = {
  competitorBrand: string
  competitorMpn: string
  /** Anything you want to surface on the page — typed by the caller. */
  productId: string
}

export type GroupedReplacement<T extends CrossRefRow> = {
  brandSlug: string
  mpnSlug: string
  /** Original (un-slugged) brand text, taken from the first row in the group. */
  competitorBrand: string
  /** Original (un-slugged) MPN text. */
  competitorMpn: string
  rows: T[]
}

export function groupCrossReferencesByCompetitor<T extends CrossRefRow>(
  rows: T[],
): GroupedReplacement<T>[] {
  const map = new Map<string, GroupedReplacement<T>>()
  for (const row of rows) {
    const brandSlug = competitorBrandSlug(row.competitorBrand)
    const mpnSlug = competitorMpnSlug(row.competitorMpn)
    if (!brandSlug || !mpnSlug) continue
    const key = `${brandSlug}/${mpnSlug}`
    const existing = map.get(key)
    if (existing) {
      existing.rows.push(row)
    } else {
      map.set(key, {
        brandSlug,
        mpnSlug,
        competitorBrand: row.competitorBrand,
        competitorMpn: row.competitorMpn,
        rows: [row],
      })
    }
  }
  return Array.from(map.values())
}

/** Convenience: only the (brand, mpn) keys, sorted, for sitemap generation. */
export function uniqueReplacementKeys<T extends CrossRefRow>(
  rows: T[],
): Array<{ brandSlug: string; mpnSlug: string }> {
  const groups = groupCrossReferencesByCompetitor(rows)
  return groups
    .map((g) => ({ brandSlug: g.brandSlug, mpnSlug: g.mpnSlug }))
    .sort((a, b) => {
      if (a.brandSlug !== b.brandSlug) return a.brandSlug.localeCompare(b.brandSlug)
      return a.mpnSlug.localeCompare(b.mpnSlug)
    })
}

/**
 * Group all cross-references by competitor brand for the brand-level
 * index page (`/replacement/<brand>`). Returns one entry per unique
 * competitor brand with the count of MPNs we cover.
 */
export function groupCrossReferencesByBrand<T extends CrossRefRow>(
  rows: T[],
): Array<{ brandSlug: string; competitorBrand: string; mpnCount: number }> {
  const byBrand = new Map<string, { competitorBrand: string; mpns: Set<string> }>()
  for (const row of rows) {
    const brandSlug = competitorBrandSlug(row.competitorBrand)
    const mpnSlug = competitorMpnSlug(row.competitorMpn)
    if (!brandSlug || !mpnSlug) continue
    const existing = byBrand.get(brandSlug)
    if (existing) {
      existing.mpns.add(mpnSlug)
    } else {
      byBrand.set(brandSlug, { competitorBrand: row.competitorBrand, mpns: new Set([mpnSlug]) })
    }
  }
  return Array.from(byBrand.entries())
    .map(([brandSlug, v]) => ({
      brandSlug,
      competitorBrand: v.competitorBrand,
      mpnCount: v.mpns.size,
    }))
    .sort((a, b) => b.mpnCount - a.mpnCount)
}
