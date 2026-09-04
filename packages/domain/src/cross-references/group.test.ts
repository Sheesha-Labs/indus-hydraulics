import { describe, it, expect } from 'vitest'
import {
  groupCrossReferencesByBrand,
  groupCrossReferencesByCompetitor,
  REPLACEMENT_INDEX_MIN_MATCHES,
  uniqueReplacementKeys,
  type CrossRefRow,
} from './group'

const rows: CrossRefRow[] = [
  { competitorBrand: 'Parker', competitorMpn: 'PV16-T', productId: 'p1' },
  { competitorBrand: 'parker', competitorMpn: 'PV16-T', productId: 'p2' }, // case differs but slugs match
  { competitorBrand: 'Eaton', competitorMpn: 'V2010-1F9S1S', productId: 'p3' },
  { competitorBrand: 'Bosch / Rexroth', competitorMpn: 'A10VSO 71/31R', productId: 'p4' },
  { competitorBrand: '', competitorMpn: 'IGNORED', productId: 'p5' }, // dropped — empty brand
  { competitorBrand: 'Parker', competitorMpn: 'PVS24', productId: 'p6' },
]

describe('groupCrossReferencesByCompetitor', () => {
  it('collapses rows that slug to the same (brand, mpn)', () => {
    const groups = groupCrossReferencesByCompetitor(rows)
    const parkerPv16 = groups.find((g) => g.brandSlug === 'parker' && g.mpnSlug === 'pv16-t')
    expect(parkerPv16?.rows).toHaveLength(2)
    expect(parkerPv16?.rows.map((r) => r.productId).sort()).toEqual(['p1', 'p2'])
  })

  it('drops rows where either slug would be empty', () => {
    const groups = groupCrossReferencesByCompetitor(rows)
    expect(groups.find((g) => g.rows.some((r) => r.productId === 'p5'))).toBeUndefined()
  })

  it('preserves the original brand/mpn text from the first row of each group', () => {
    const groups = groupCrossReferencesByCompetitor(rows)
    const bosch = groups.find((g) => g.brandSlug === 'bosch-rexroth')
    expect(bosch?.competitorBrand).toBe('Bosch / Rexroth')
    expect(bosch?.competitorMpn).toBe('A10VSO 71/31R')
  })

  it('returns 4 unique groups for the test fixture', () => {
    const groups = groupCrossReferencesByCompetitor(rows)
    expect(groups).toHaveLength(4)
  })
})

describe('uniqueReplacementKeys', () => {
  it('returns sorted unique (brandSlug, mpnSlug) pairs with their match counts', () => {
    const keys = uniqueReplacementKeys(rows)
    expect(keys).toEqual([
      { brandSlug: 'bosch-rexroth', mpnSlug: 'a10vso-71-31r', matches: 1 },
      { brandSlug: 'eaton', mpnSlug: 'v2010-1f9s1s', matches: 1 },
      // Two source rows slug to the same competitor part, so this one has a
      // real choice on it — the distinction the index gate turns on.
      { brandSlug: 'parker', mpnSlug: 'pv16-t', matches: 2 },
      { brandSlug: 'parker', mpnSlug: 'pvs24', matches: 1 },
    ])
  })

  /**
   * The gate the sitemap and the page's robots meta both read. If these two
   * ever disagree the site submits a URL it then tells Google not to index,
   * which is a worse signal than either choice alone.
   */
  it('separates stub pages from real comparisons at the index threshold', () => {
    const keys = uniqueReplacementKeys(rows)
    const indexable = keys.filter((k) => k.matches >= REPLACEMENT_INDEX_MIN_MATCHES)
    expect(indexable.map((k) => k.mpnSlug)).toEqual(['pv16-t'])
  })
})

describe('groupCrossReferencesByBrand', () => {
  it('groups by competitor brand and counts unique MPNs', () => {
    const brands = groupCrossReferencesByBrand(rows)
    const parker = brands.find((b) => b.brandSlug === 'parker')
    expect(parker?.mpnCount).toBe(2) // pv16-t + pvs24
    const eaton = brands.find((b) => b.brandSlug === 'eaton')
    expect(eaton?.mpnCount).toBe(1)
  })

  it('sorts most-covered brands first', () => {
    const brands = groupCrossReferencesByBrand(rows)
    expect(brands[0]?.brandSlug).toBe('parker')
  })
})
