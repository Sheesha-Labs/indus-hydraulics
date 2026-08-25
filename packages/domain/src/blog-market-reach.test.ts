import { describe, expect, it } from 'vitest'

import { MarketReachBlockSchema } from './blog-blocks'
import {
  MARKET_REACH_PROFILES,
  REACH_EXCLUDED_MARKET_SLUGS,
  buildMarketReachBlock,
  marketReachRegions,
} from './blog-market-reach'
import { MARKETS } from './markets'
import { MARKET_REGIONS, releasedMarketPageSlugs } from './market-pages'

/**
 * This block is generated onto every article in the blog, which means a defect
 * here is a defect on 93 pages at once. The tests are therefore about the two
 * things that would actually cost something: an untrue claim, and 93 identical
 * blocks.
 */

/** Enough slugs to exercise the rotation without depending on the live blog. */
const SAMPLE_SLUGS = [
  'why-hydraulic-hoses-fail',
  'hose-burst-at-the-fitting',
  'hydraulic-hose-kinked',
  'identify-any-hydraulic-fitting',
  'bspp-vs-bspt',
  'hydraulic-hose-in-uae-heat',
  'offshore-hydraulic-hose',
  'backhoe-hydraulic-hose',
  'mobile-crane-hydraulic-hose',
  'port-equipment-hydraulic-hose',
  'hydraulic-hose-lead-times',
  'what-to-send-for-a-hose-quote',
  'sae-100r-hose-types',
  'hydraulic-hose-inspection',
  'api-7k-rotary-vibrator-hose',
  'steam-hose-safety',
  'hose-whip-restraint-and-burst-protection',
  'field-re-hosing-kit',
]

const CATEGORIES = Object.keys(MARKET_REACH_PROFILES)

/** Every (category, slug) pair the tests below sweep. */
const ALL_BLOCKS = CATEGORIES.flatMap((category) =>
  SAMPLE_SLUGS.map((slug) => ({
    category,
    slug,
    block: buildMarketReachBlock(slug, category),
  }))
)

describe('profiles', () => {
  it('names only regions the markets index actually has', () => {
    const known = new Set(MARKET_REGIONS.map(([region]) => region))
    for (const [category, profile] of Object.entries(MARKET_REACH_PROFILES)) {
      expect(known.has(profile.primaryRegion), `${category}: ${profile.primaryRegion}`).toBe(true)
      for (const region of profile.rotatingRegions) {
        expect(known.has(region), `${category}: ${region}`).toBe(true)
      }
    }
  })

  it('never repeats the primary region inside the rotation', () => {
    for (const [category, profile] of Object.entries(MARKET_REACH_PROFILES)) {
      expect(profile.rotatingRegions, category).not.toContain(profile.primaryRegion)
      expect(new Set(profile.rotatingRegions).size, `${category} repeats a region`).toBe(
        profile.rotatingRegions.length
      )
    }
  })

  it('offers more regions than any one article shows, so the rotation has somewhere to go', () => {
    for (const [category, profile] of Object.entries(MARKET_REACH_PROFILES)) {
      expect(profile.rotatingRegions.length, `${category} cannot rotate`).toBeGreaterThan(3)
    }
  })

  /**
   * The three claims `markets.ts` forbids, checked on generated copy rather
   * than trusted to review. A transit time is an operational commitment,
   * "local stock" is false — stock is in Dubai — and a branch abroad is a
   * false-business-presence claim. Any of the three, repeated on 93 pages, is
   * the kind of thing a customer quotes back at you.
   */
  it('makes no promise markets.ts forbids', () => {
    const forbidden: Array<[RegExp, string]> = [
      [/\b\d+\s*(?:-|–|to)?\s*\d*\s*(?:hours?|days?|weeks?)\b/i, 'a transit or response time'],
      [/\blocal(?:ly)?\s+(?:stock|stocked|warehouse|branch|office|inventory)\b/i, 'local stock'],
      [/\bour\s+(?:branch|office|warehouse|depot|premises)\s+in\b/i, 'premises abroad'],
      [/\bsame[- ]day\b|\bnext[- ]day\b|\bovernight\b/i, 'a delivery promise'],
      [/\bguarantee/i, 'a guarantee'],
    ]
    for (const [category, profile] of Object.entries(MARKET_REACH_PROFILES)) {
      for (const [pattern, what] of forbidden) {
        expect(pattern.test(profile.body), `${category} body makes ${what}`).toBe(false)
        expect(pattern.test(profile.heading), `${category} heading makes ${what}`).toBe(false)
      }
    }
  })

  it('writes a distinct paragraph per category', () => {
    const bodies = Object.values(MARKET_REACH_PROFILES).map((p) => p.body)
    expect(new Set(bodies).size).toBe(bodies.length)
    const headings = Object.values(MARKET_REACH_PROFILES).map((p) => p.heading)
    expect(new Set(headings).size).toBe(headings.length)
  })
})

describe('buildMarketReachBlock', () => {
  it('returns null for a category with no profile, rather than guessing one', () => {
    expect(buildMarketReachBlock('some-article', 'a-category-nobody-wrote')).toBeNull()
  })

  it('produces a block the schema accepts, every time', () => {
    for (const { category, slug, block } of ALL_BLOCKS) {
      const parsed = MarketReachBlockSchema.safeParse(block)
      expect(
        parsed.success ? null : `${category}/${slug}: ${parsed.error.issues[0]?.message}`
      ).toBeNull()
    }
  })

  it('is deterministic — a re-import must not show as a content diff', () => {
    for (const { category, slug, block } of ALL_BLOCKS) {
      expect(buildMarketReachBlock(slug, category)).toEqual(block)
    }
  })

  it('always leads with the pinned primary region', () => {
    for (const { category, block } of ALL_BLOCKS) {
      expect(block?.groups[0]?.region).toBe(MARKET_REACH_PROFILES[category]!.primaryRegion)
    }
  })

  it('shows four regions and never repeats one', () => {
    for (const { category, slug, block } of ALL_BLOCKS) {
      const regions = block!.groups.map((g) => g.region)
      expect(regions.length, `${category}/${slug}`).toBe(4)
      expect(new Set(regions).size, `${category}/${slug} repeats a region`).toBe(regions.length)
    }
  })

  it('keeps each article to twelve destinations, named once each', () => {
    for (const { category, slug, block } of ALL_BLOCKS) {
      const slugs = block!.groups.flatMap((g) => g.markets.map((m) => m.slug))
      expect(slugs.length, `${category}/${slug}`).toBe(12)
      expect(new Set(slugs).size, `${category}/${slug} repeats a destination`).toBe(slugs.length)
    }
  })

  it('names only markets that have a released page', () => {
    const released = new Set(releasedMarketPageSlugs())
    const byName = new Map(MARKETS.map((m) => [m.slug, m.name]))
    for (const { category, slug, block } of ALL_BLOCKS) {
      for (const group of block!.groups) {
        for (const market of group.markets) {
          expect(released.has(market.slug), `${category}/${slug}: ${market.slug}`).toBe(true)
          // The stored name is what the reader sees; it must be the country's
          // own name, not a label that has drifted from the page it links to.
          expect(market.name).toBe(byName.get(market.slug))
        }
      }
    }
  })

  it('never advertises an excluded destination', () => {
    const excluded = new Set<string>(REACH_EXCLUDED_MARKET_SLUGS)
    for (const { category, slug, block } of ALL_BLOCKS) {
      for (const group of block!.groups) {
        for (const market of group.markets) {
          expect(excluded.has(market.slug), `${category}/${slug} advertises ${market.slug}`).toBe(
            false
          )
        }
      }
    }
  })

  it('puts every destination in the region that actually contains it', () => {
    const bySlug = new Map(MARKETS.map((m) => [m.name, m.slug]))
    const regionOf = new Map<string, string>()
    for (const [region, names] of MARKET_REGIONS) {
      for (const name of names) {
        const slug = bySlug.get(name)
        if (slug) regionOf.set(slug, region)
      }
    }
    for (const { category, slug, block } of ALL_BLOCKS) {
      for (const group of block!.groups) {
        for (const market of group.markets) {
          expect(regionOf.get(market.slug), `${category}/${slug}: ${market.slug}`).toBe(
            group.region
          )
        }
      }
    }
  })

  /**
   * The point of the rotation. Without it every article in a category carries
   * the same twelve links, which is the doorway-page shape the blog's
   * `page_link` budget was capped to avoid — see blog-cross-links.test.ts.
   */
  it('does not give two articles in a category the same block', () => {
    for (const category of CATEGORIES) {
      const fingerprints = SAMPLE_SLUGS.map((slug) => {
        const block = buildMarketReachBlock(slug, category)!
        return block.groups
          .map((g) => `${g.region}:${g.markets.map((m) => m.slug).join(',')}`)
          .join('|')
      })
      // Not all distinct — the sample is larger than the rotation for some
      // categories — but a category that collapses to one or two shapes is a
      // profile with too few regions in it.
      expect(new Set(fingerprints).size, `${category} barely rotates`).toBeGreaterThan(3)
    }
  })

  it('spreads its links well beyond the six destinations the blog used to name', () => {
    const named = new Set(
      ALL_BLOCKS.flatMap(({ block }) => block!.groups.flatMap((g) => g.markets.map((m) => m.slug)))
    )
    expect(named.size).toBeGreaterThan(40)
  })

  /**
   * The founder's ask was specifically GCC *plus* Africa, Europe and North
   * America. Regions are chosen for topical honesty per category, so no single
   * article claims all four; this asserts the blog as a whole reaches them.
   */
  it('reaches Europe, North America and Africa across the blog', () => {
    const regions = new Set(ALL_BLOCKS.flatMap(({ block }) => block!.groups.map((g) => g.region)))
    for (const required of [
      'GCC & Middle East',
      'Western & Northern Europe',
      'North America & Caribbean',
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'North Africa',
    ]) {
      expect(regions.has(required), `nothing reaches ${required}`).toBe(true)
    }
  })
})

describe('marketReachRegions', () => {
  it('drops the excluded destinations but keeps every region', () => {
    expect(marketReachRegions()).toEqual(MARKET_REGIONS.map(([region]) => region))
  })
})
