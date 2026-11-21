import { describe, expect, it } from 'vitest'

import { CATEGORY_REACH_PROFILES, categoryExportRegions } from './category-market-reach'
import { DESIGNED_PAGE_REACH_PROFILES, designedPageMarketReach } from './designed-page-market-reach'
import { INDUSTRY_REACH_PROFILES, industryMarketReach } from './industry-market-reach'
import { MARKET_REACH_PROFILES } from './blog-market-reach'
import {
  REACH_EXCLUDED_MARKET_SLUGS,
  buildMarketReach,
  marketReachRegions,
  marketRegionBridge,
} from './market-reach'
import { MARKETS } from './markets'
import { MARKET_REGIONS, releasedMarketPageSlugs } from './market-pages'
import { SERVICE_CASE_REACH_PROFILES, serviceCaseMarketReach } from './service-case-market-reach'

import type { MarketReachProfile } from './market-reach'

/**
 * The engine is generated onto every article, every service case and every
 * industry page, so a defect here is a defect on well over a hundred pages at
 * once. The tests are therefore about the two things that would actually cost
 * something: an untrue claim, and a hundred identical blocks.
 *
 * Every profile on every surface is swept by the same checks. A new surface
 * adds its profile record to `ALL_PROFILES` and inherits the lot.
 */

const ALL_PROFILES: Array<
  [surface: string, profiles: Readonly<Record<string, MarketReachProfile>>]
> = [
  ['blog', MARKET_REACH_PROFILES],
  ['service-case', SERVICE_CASE_REACH_PROFILES],
  ['industry', INDUSTRY_REACH_PROFILES],
  ['category', CATEGORY_REACH_PROFILES],
]

const EVERY_PROFILE = ALL_PROFILES.flatMap(([surface, profiles]) =>
  Object.entries(profiles).map(([key, profile]) => ({ surface, key, profile }))
)

/** Enough seeds to exercise the rotation without depending on live content. */
const SAMPLE_SEEDS = [
  'why-hydraulic-hoses-fail',
  'hose-burst-at-the-fitting',
  'hydraulic-hose-kinked',
  'identify-any-hydraulic-fitting',
  'hydraulic-hose-in-uae-heat',
  'backhoe-hydraulic-hose',
  'port-equipment-hydraulic-hose',
  'hydraulic-hose-lead-times',
  'sae-100r-hose-types',
  'api-7k-rotary-vibrator-hose',
  'workover-rig-cylinder-hose-overhaul-jebel-ali',
  'sour-service-hose-assembly-build-100-line-rig-refit',
  'custom-16-port-manifold-en24-420-bar-press-control',
  'iso-4406-oil-cleanliness-coding-q1-2026-aluminum-smelter',
  'steam-hose-safety',
  'field-re-hosing-kit',
  'mobile-crane-hydraulic-hose',
  'what-to-send-for-a-hose-quote',
]

const EVERY_SECTION = EVERY_PROFILE.flatMap(({ surface, key, profile }) =>
  SAMPLE_SEEDS.map((seed) => ({
    surface,
    key,
    seed,
    reach: buildMarketReach(seed, profile),
  }))
)

describe('profiles', () => {
  it('names only regions the markets index actually has', () => {
    const known = new Set(MARKET_REGIONS.map(([region]) => region))
    for (const { surface, key, profile } of EVERY_PROFILE) {
      const where = `${surface}/${key}`
      expect(known.has(profile.primaryRegion), `${where}: ${profile.primaryRegion}`).toBe(true)
      for (const region of profile.rotatingRegions) {
        expect(known.has(region), `${where}: ${region}`).toBe(true)
      }
    }
  })

  it('never repeats the primary region inside the rotation', () => {
    for (const { surface, key, profile } of EVERY_PROFILE) {
      const where = `${surface}/${key}`
      expect(profile.rotatingRegions, where).not.toContain(profile.primaryRegion)
      expect(new Set(profile.rotatingRegions).size, `${where} repeats a region`).toBe(
        profile.rotatingRegions.length
      )
    }
  })

  it('offers more regions than any one page shows, so the rotation has somewhere to go', () => {
    for (const { surface, key, profile } of EVERY_PROFILE) {
      expect(profile.rotatingRegions.length, `${surface}/${key} cannot rotate`).toBeGreaterThan(3)
    }
  })

  /**
   * The claims `markets.ts` forbids, checked on generated copy rather than
   * trusted to review. A transit time is an operational commitment, "local
   * stock" is false — stock is in Dubai — and a branch abroad is a
   * false-business-presence claim. Any of them, repeated across the site, is
   * the kind of thing a customer quotes back at you.
   *
   * The last two are the `field_service` trap. Field service is a van and an
   * engineer, and both are in the UAE. A reach section on a field-service page
   * has to be about the PARTS travelling; the moment it has us attending a
   * site abroad it is claiming a presence we do not have.
   */
  it('makes no promise markets.ts forbids', () => {
    const forbidden: Array<[RegExp, string]> = [
      [/\b\d+\s*(?:-|–|to)?\s*\d*\s*(?:hours?|days?|weeks?)\b/i, 'a transit or response time'],
      [/\blocal(?:ly)?\s+(?:stock|stocked|warehouse|branch|office|inventory)\b/i, 'local stock'],
      [/\bour\s+(?:branch|office|warehouse|depot|premises|workshop)\s+in\b/i, 'premises abroad'],
      [/\bsame[- ]day\b|\bnext[- ]day\b|\bovernight\b/i, 'a delivery promise'],
      [/\bguarantee/i, 'a guarantee'],
      [
        /\b(?:we|our)\s+(?:\w+\s+){0,2}(?:engineers?|technicians?|crews?|teams?)\s+(?:travel|fly|mobilis|mobiliz|deploy|attend|visit)/i,
        'our people travelling abroad',
      ],
      [
        /\bwe\s+(?:attend|mobilise|mobilize|dispatch a (?:van|team)|come to your site)\b/i,
        'attending a site abroad',
      ],
    ]
    for (const { surface, key, profile } of EVERY_PROFILE) {
      for (const [pattern, what] of forbidden) {
        expect(pattern.test(profile.body), `${surface}/${key} body makes ${what}`).toBe(false)
        expect(pattern.test(profile.heading), `${surface}/${key} heading makes ${what}`).toBe(false)
      }
    }
  })

  it('writes a distinct paragraph for all but the deliberately shared one', () => {
    // `blog/hose-assembly` and `service-case/hoses` are the same sentence about
    // the same work, which is correct — they describe one operation seen from
    // two surfaces. Everything else must be its own paragraph.
    const counts = new Map<string, string[]>()
    for (const { surface, key, profile } of EVERY_PROFILE) {
      counts.set(profile.body, [...(counts.get(profile.body) ?? []), `${surface}/${key}`])
    }
    const shared = [...counts.values()].filter((where) => where.length > 1)
    expect(shared).toEqual([['blog/hose-assembly', 'service-case/hoses']])
  })

  it('gives every profile a heading of its own within its surface', () => {
    for (const [surface, profiles] of ALL_PROFILES) {
      const headings = Object.values(profiles).map((p) => p.heading)
      expect(new Set(headings).size, `${surface} repeats a heading`).toBe(headings.length)
    }
  })
})

describe('buildMarketReach', () => {
  it('returns null for a profile that does not exist', () => {
    expect(buildMarketReach('anything', undefined)).toBeNull()
  })

  it('is deterministic — a stored section must not show as a content diff', () => {
    for (const { surface, key, seed, reach } of EVERY_SECTION) {
      const profile = ALL_PROFILES.find(([s]) => s === surface)![1][key]!
      expect(buildMarketReach(seed, profile), `${surface}/${key}/${seed}`).toEqual(reach)
    }
  })

  it('always leads with the pinned primary region', () => {
    for (const { surface, key, reach } of EVERY_SECTION) {
      const profile = ALL_PROFILES.find(([s]) => s === surface)![1][key]!
      expect(reach?.groups[0]?.region).toBe(profile.primaryRegion)
    }
  })

  it('shows four regions and never repeats one', () => {
    for (const { surface, key, seed, reach } of EVERY_SECTION) {
      const regions = reach!.groups.map((g) => g.region)
      const where = `${surface}/${key}/${seed}`
      expect(regions.length, where).toBe(4)
      expect(new Set(regions).size, `${where} repeats a region`).toBe(regions.length)
    }
  })

  it('keeps each page to twelve destinations, named once each', () => {
    for (const { surface, key, seed, reach } of EVERY_SECTION) {
      const slugs = reach!.groups.flatMap((g) => g.markets.map((m) => m.slug))
      const where = `${surface}/${key}/${seed}`
      expect(slugs.length, where).toBe(12)
      expect(new Set(slugs).size, `${where} repeats a destination`).toBe(slugs.length)
    }
  })

  it('names only markets that have a released page, under their own name', () => {
    const released = new Set(releasedMarketPageSlugs())
    const nameBySlug = new Map(MARKETS.map((m) => [m.slug, m.name]))
    for (const { surface, key, seed, reach } of EVERY_SECTION) {
      for (const group of reach!.groups) {
        for (const market of group.markets) {
          const where = `${surface}/${key}/${seed}: ${market.slug}`
          expect(released.has(market.slug), where).toBe(true)
          expect(market.name, where).toBe(nameBySlug.get(market.slug))
        }
      }
    }
  })

  it('never advertises an excluded destination', () => {
    const excluded = new Set<string>(REACH_EXCLUDED_MARKET_SLUGS)
    for (const { surface, key, seed, reach } of EVERY_SECTION) {
      for (const group of reach!.groups) {
        for (const market of group.markets) {
          expect(
            excluded.has(market.slug),
            `${surface}/${key}/${seed} advertises ${market.slug}`
          ).toBe(false)
        }
      }
    }
  })

  it('puts every destination in the region that actually contains it', () => {
    const slugByName = new Map(MARKETS.map((m) => [m.name, m.slug]))
    const regionOf = new Map<string, string>()
    for (const [region, names] of MARKET_REGIONS) {
      for (const name of names) {
        const slug = slugByName.get(name)
        if (slug) regionOf.set(slug, region)
      }
    }
    for (const { surface, key, seed, reach } of EVERY_SECTION) {
      for (const group of reach!.groups) {
        for (const market of group.markets) {
          expect(regionOf.get(market.slug), `${surface}/${key}/${seed}: ${market.slug}`).toBe(
            group.region
          )
        }
      }
    }
  })

  /**
   * The point of the rotation. Without it every page in a category carries the
   * same twelve links, which is the doorway-page shape the blog's `page_link`
   * budget was capped to avoid — see blog-cross-links.test.ts.
   */
  it('does not give two pages sharing a profile the same section', () => {
    for (const { surface, key, profile } of EVERY_PROFILE) {
      const fingerprints = SAMPLE_SEEDS.map((seed) => {
        const reach = buildMarketReach(seed, profile)!
        return reach.groups
          .map((g) => `${g.region}:${g.markets.map((m) => m.slug).join(',')}`)
          .join('|')
      })
      expect(new Set(fingerprints).size, `${surface}/${key} barely rotates`).toBeGreaterThan(3)
    }
  })

  it('spreads its links well beyond the six destinations the blog used to name', () => {
    const named = new Set(
      EVERY_SECTION.flatMap(({ reach }) =>
        reach!.groups.flatMap((g) => g.markets.map((m) => m.slug))
      )
    )
    expect(named.size).toBeGreaterThan(40)
  })

  /**
   * The founder's ask was GCC *plus* Africa, Europe and North America. Regions
   * are chosen for topical honesty per profile, so no single page claims all
   * four; this asserts the site as a whole reaches them.
   */
  it('reaches Europe, North America and Africa across the site', () => {
    const regions = new Set(
      EVERY_SECTION.flatMap(({ reach }) => reach!.groups.map((g) => g.region))
    )
    for (const required of [
      'GCC & Middle East',
      'Western & Northern Europe',
      'Central & South-East Europe',
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

describe('surface entry points', () => {
  it('returns a section for every service case category, and null for an unknown one', () => {
    for (const category of Object.keys(SERVICE_CASE_REACH_PROFILES)) {
      expect(serviceCaseMarketReach('some-case', category), category).not.toBeNull()
    }
    expect(serviceCaseMarketReach('some-case', 'not-a-category')).toBeNull()
  })

  it('returns a section for every industry, and null for an unknown one', () => {
    for (const slug of Object.keys(INDUSTRY_REACH_PROFILES)) {
      expect(industryMarketReach(slug), slug).not.toBeNull()
    }
    expect(industryMarketReach('not-an-industry')).toBeNull()
  })

  /**
   * An industry page has exactly one page per profile, so its seed is its own
   * slug and there is nothing to rotate. Two industries must still differ —
   * seven pages carrying one region set would be the thing this whole design
   * exists to avoid.
   */
  /**
   * The category band drops the pinned home region because the five GCC chips
   * above it already carry those links with a transit band on each. Repeating
   * them underneath would be the same links twice on one page.
   */
  it('drops the home region from the category band, and only that one', () => {
    for (const rootSlug of Object.keys(CATEGORY_REACH_PROFILES)) {
      const profile = CATEGORY_REACH_PROFILES[rootSlug]!
      const out = categoryExportRegions(rootSlug, rootSlug)
      expect(out, rootSlug).not.toBeNull()
      expect(
        out!.groups.map((g) => g.region),
        rootSlug
      ).not.toContain(profile.primaryRegion)
      expect(out!.groups.length, rootSlug).toBe(3)
      expect(out!.groups.flatMap((g) => g.markets).length, rootSlug).toBe(9)
    }
    expect(categoryExportRegions('anything', 'not-a-root')).toBeNull()
  })

  /**
   * `/quality-control`'s commercial framing is unapproved and carries two
   * claims flagged as needing confirmation — a certificate reissued against a
   * heat number years later, and third-party inspection by named agencies
   * scheduled against the production date. The generated paragraph must not
   * give either a second home, or striking it from the page would leave it
   * standing underneath.
   */
  it('does not restate the unapproved quality-control claims', () => {
    const body = DESIGNED_PAGE_REACH_PROFILES['quality-control']!.body
    for (const claim of [
      /reissu/i,
      /\bheat number\b/i,
      /\bSGS\b|\bTÜV\b|\bTUV\b|\bBureau Veritas\b/i,
      /third[- ]party inspection/i,
    ]) {
      expect(claim.test(body), `quality-control reach restates ${claim}`).toBe(false)
    }
  })

  it('gives each designed capability page a different region set', () => {
    const fingerprints = Object.keys(DESIGNED_PAGE_REACH_PROFILES).map((key) =>
      designedPageMarketReach(key)!
        .groups.map((g) => g.region)
        .join('|')
    )
    expect(new Set(fingerprints).size).toBe(fingerprints.length)
    expect(designedPageMarketReach('not-a-page')).toBeNull()
  })

  it('gives each industry a different region set', () => {
    const fingerprints = Object.keys(INDUSTRY_REACH_PROFILES).map((slug) =>
      industryMarketReach(slug)!
        .groups.map((g) => g.region)
        .join('|')
    )
    expect(new Set(fingerprints).size).toBe(fingerprints.length)
  })
})

/**
 * A census on 2026-11-20 found all 21 Central & South-East Europe markets —
 * Turkey, Greece, Romania, the Balkans, the Baltics — with no link from any
 * category page, because no root rotated that region. These pin the fix.
 */
describe('category reach into Europe', () => {
  const EUROPE = ['Western & Northern Europe', 'Central & South-East Europe']

  it('rotates both European regions on more than one root', () => {
    for (const region of EUROPE) {
      const roots = Object.entries(CATEGORY_REACH_PROFILES).filter(([, p]) =>
        p.rotatingRegions.includes(region)
      )
      expect(roots.length, region).toBeGreaterThan(3)
    }
  })

  it('names every advertisable European market from some category page', () => {
    const named = new Set<string>()
    for (const root of Object.keys(CATEGORY_REACH_PROFILES)) {
      // A root plus forty synthetic children stands in for the live tree.
      for (let i = 0; i < 40; i++) {
        const out = categoryExportRegions(i === 0 ? root : `${root}-child-${i}`, root)
        for (const g of out?.groups ?? []) for (const m of g.markets) named.add(m.slug)
      }
    }
    const bySlug = new Map(MARKETS.map((m) => [m.name, m.slug]))
    const excluded = new Set(REACH_EXCLUDED_MARKET_SLUGS)
    const released = new Set(releasedMarketPageSlugs())
    for (const [region, names] of MARKET_REGIONS) {
      if (!EUROPE.includes(region)) continue
      for (const name of names) {
        const slug = bySlug.get(name)!
        if (excluded.has(slug) || !released.has(slug)) continue
        expect(named.has(slug), `${name} gets no category link`).toBe(true)
      }
    }
  })

  /**
   * Freight-mode honesty: these roots' paragraphs talk about basins, campaigns
   * and well-service spreads, or about lubricants Europe buys locally. Adding
   * Europe to them would put a claim on the page that is not true there.
   */
  it('keeps Europe off the well-service and lubricant roots', () => {
    for (const root of [
      'fracturing-equipment',
      'stimulation-equipment',
      'cementing-equipment',
      'well-testing-equipment',
      'blowout-preventers',
      'drilling-workover-systems',
      'industrial-lubricant-suppliers-uae',
    ]) {
      const profile = CATEGORY_REACH_PROFILES[root]
      expect(profile, root).toBeDefined()
      for (const region of EUROPE) expect(profile!.rotatingRegions, root).not.toContain(region)
    }
  })
})

/**
 * The market page directory lists its own region in full and, below it, one
 * market from every other region. Without that row every region was an island.
 */
describe('marketRegionBridge', () => {
  const bySlug = new Map(MARKETS.map((m) => [m.name, m.slug]))
  const regionOf = new Map<string, string>()
  for (const [region, names] of MARKET_REGIONS)
    for (const n of names) regionOf.set(bySlug.get(n)!, region)
  const excluded = new Set(REACH_EXCLUDED_MARKET_SLUGS)
  const released = new Set(releasedMarketPageSlugs())

  it('links exactly one market in each other region, never its own', () => {
    for (const m of MARKETS) {
      const bridge = marketRegionBridge(m.slug)
      const regions = bridge.map((b) => b.region)
      expect(new Set(regions).size, m.slug).toBe(regions.length)
      expect(regions, m.slug).not.toContain(regionOf.get(m.slug))
      expect(regions.length, m.slug).toBe(MARKET_REGIONS.length - 1)
      for (const b of bridge) expect(regionOf.get(b.slug), `${m.slug} -> ${b.slug}`).toBe(b.region)
    }
  })

  it('never links an excluded or held market', () => {
    for (const m of MARKETS) {
      for (const b of marketRegionBridge(m.slug)) {
        expect(excluded.has(b.slug), `${m.slug} -> ${b.slug}`).toBe(false)
        expect(released.has(b.slug), `${m.slug} -> ${b.slug}`).toBe(true)
      }
    }
  })

  it('gives every advertisable market at least one link from outside its region', () => {
    const inbound = new Map<string, number>()
    for (const m of MARKETS)
      for (const b of marketRegionBridge(m.slug))
        inbound.set(b.slug, (inbound.get(b.slug) ?? 0) + 1)
    for (const m of MARKETS) {
      if (excluded.has(m.slug) || !released.has(m.slug)) continue
      expect(inbound.get(m.slug) ?? 0, m.slug).toBeGreaterThan(0)
    }
  })

  it('returns nothing for an unknown market', () => {
    expect(marketRegionBridge('atlantis')).toEqual([])
  })
})
