import { describe, expect, it } from 'vitest'
import { MARKETS, marketBySlug } from './markets'
import {
  MARKET_PAGES,
  MARKET_REGIONS,
  MARKET_SECTOR_SHOTS,
  marketDestinationCount,
  formatCoordinates,
  freightBarPercents,
  isRightToLeft,
  marketOrderSequence,
  marketPageBySlug,
  primaryRoute,
  transitScore,
  type MarketPage,
} from './market-pages'

const pages = Object.values(MARKET_PAGES)

/**
 * These assert the *contract* the template relies on, not the prose. A market
 * page renders 16 sections off one record; every rule below exists because
 * breaking it produces a page that still compiles and still deploys but is
 * wrong in a way nobody notices until a buyer reads it.
 */
describe('market page records', () => {
  it('keys every record by its own slug', () => {
    for (const [key, page] of Object.entries(MARKET_PAGES)) {
      expect(page.slug).toBe(key)
    }
  })

  it('has a matching registry row for every page', () => {
    // The page inherits its name, country code and meta description from
    // `markets.ts`. Without a row there the route 404s and the sitemap never
    // lists it — a page that exists in code and nowhere else.
    for (const page of pages) {
      expect(marketBySlug(page.slug), `no market registry row for ${page.slug}`).toBeDefined()
    }
  })

  it('states exactly four hero facts, in the fixed order', () => {
    const expected = ['Typical transit', 'Freight', 'Incoterms 2020', 'Documentation']
    for (const page of pages) {
      expect(page.facts.map((f) => f.label)).toEqual(expected)
    }
  })

  it('states six manifest cells', () => {
    // Five looks under-filled at 1440px and seven crowds; the grid column
    // count is derived from the array length, so this is a design rule the
    // data has to keep rather than one the CSS can enforce.
    for (const page of pages) {
      expect(page.manifest).toHaveLength(6)
    }
  })

  it('draws exactly two routes with exactly one primary', () => {
    for (const page of pages) {
      expect(page.map.routes).toHaveLength(2)
      expect(page.map.routes.filter((r) => r.primary)).toHaveLength(1)
    }
  })

  it('traces every route with at least two waypoints', () => {
    for (const page of pages) {
      for (const route of page.map.routes) {
        expect(route.points.length, `${page.slug} · ${route.mode}`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('keeps every coordinate on the planet, in [lon, lat] order', () => {
    // The commonest data error on this record is a transposed pair, and it is
    // invisible until the map renders a city in the sea. Longitude out of
    // [-90, 90] would pass a naive check, so both axes are bounded here.
    const check = (label: string, [lon, lat]: readonly [number, number]) => {
      expect(Math.abs(lon), `${label} longitude`).toBeLessThanOrEqual(180)
      expect(Math.abs(lat), `${label} latitude`).toBeLessThanOrEqual(90)
    }
    for (const page of pages) {
      check(`${page.slug} origin`, page.map.origin)
      check(`${page.slug} crossing`, page.map.crossing.coords)
      for (const city of page.cities) check(`${page.slug} · ${city.name}`, city.coords)
      for (const route of page.map.routes) {
        route.points.forEach((p, i) => check(`${page.slug} · ${route.mode}[${i}]`, p))
      }
    }
  })

  it('lists 12–16 delivery cities and plots no more than eight', () => {
    for (const page of pages) {
      expect(page.cities.length).toBeGreaterThanOrEqual(12)
      expect(page.cities.length).toBeLessThanOrEqual(16)
      expect(page.cities.filter((c) => c.plot).length).toBeLessThanOrEqual(8)
    }
  })

  it('does not plot the port or border city itself', () => {
    // The crossing diamond already marks that exact point. Plotting the city
    // too puts a dot and a diamond on the same pixel with two labels fighting
    // over the same 40px of coastline.
    for (const page of pages) {
      const crossing = page.map.crossing.coords
      const clash = page.cities.find(
        (c) => c.plot && c.coords[0] === crossing[0] && c.coords[1] === crossing[1]
      )
      expect(clash, `${page.slug} plots its own crossing`).toBeUndefined()
    }
  })

  it('names three freight modes, fastest-realistic first', () => {
    for (const page of pages) {
      expect(page.freight).toHaveLength(3)
      const first = transitScore(page.freight[0].transit)
      // Row 0 takes the accent colour as the recommended default, so it must
      // not be the slowest option on the list.
      const slowest = Math.max(...page.freight.map((m) => transitScore(m.transit)))
      expect(first, `${page.slug} recommends its slowest mode`).toBeLessThanOrEqual(slowest)
    }
  })

  it('names six sectors, each keyed to a real industry page', () => {
    for (const page of pages) {
      expect(page.sectors).toHaveLength(6)
      const slugs = page.sectors.map((s) => s.slug)
      expect(new Set(slugs).size, `${page.slug} repeats a sector`).toBe(6)
      for (const slug of slugs) expect(MARKET_SECTOR_SHOTS[slug]).toBeTruthy()
    }
  })

  it('answers at least eight questions, none of them duplicated', () => {
    // These become FAQPage schema. A duplicate question is a structured-data
    // error, not just clumsy copy.
    for (const page of pages) {
      expect(page.faqs.length).toBeGreaterThanOrEqual(8)
      const questions = page.faqs.map((f) => f.question)
      expect(new Set(questions).size).toBe(questions.length)
      for (const faq of page.faqs) {
        expect(faq.answer.length, `${page.slug} · ${faq.question}`).toBeGreaterThan(20)
      }
    }
  })

  it('opens with the branch question and answers it honestly', () => {
    // The single most load-bearing sentence on the page. There is one office
    // and it is in Dubai; a market page that implies otherwise is a false
    // business-presence claim — see the docblock in markets.ts.
    for (const page of pages) {
      const first = page.faqs[0]!
      const market = marketBySlug(page.slug)!
      expect(first.question).toBe(`Do you have a branch in ${market.name}?`)
      expect(first.answer.startsWith('No.')).toBe(true)
    }
  })

  it('never promises an arrival time in the transit fact', () => {
    // "Typically N days from dispatch" is an observation. "We deliver in N
    // days" is an operational commitment that assistants repeat back to
    // customers as a guarantee.
    for (const page of pages) {
      const transit = page.facts[0].value.toLowerCase()
      expect(transit).not.toMatch(/\bguarantee|\bwe deliver\b|\bwithin \d+ (?:day|hour)/)
    }
  })
})

describe('MARKET_REGIONS', () => {
  it('names every market exactly once', () => {
    // A duplicate would print the country twice in the closing sitemap and
    // double-count the "126 destinations" kicker.
    const listed = MARKET_REGIONS.flatMap(([, countries]) => countries)
    expect(new Set(listed).size).toBe(listed.length)
    expect(marketDestinationCount()).toBe(listed.length)
  })

  it('stays in sync with the market registry, in both directions', () => {
    /*
      The two lists are joined on the country NAME, not on a slug, because the
      sitemap is written as prose. That makes drift silent in both directions:

        - A market in `MARKETS` but missing here never appears in any other
          market page's sitemap, so it ships with zero internal links from its
          126 natural referrers and is effectively invisible to a crawler.
        - A name here that no market matches renders as an unlinked label
          nobody notices, and the "126 destinations" count overstates reality.

      Neither shows up in a screenshot or a typecheck. It shows up here.
    */
    const listed = new Set(MARKET_REGIONS.flatMap(([, countries]) => countries))
    const registered = new Set(MARKETS.map((m) => m.name))

    const missingFromRegions = [...registered].filter((n) => !listed.has(n))
    const missingFromRegistry = [...listed].filter((n) => !registered.has(n))

    expect(missingFromRegions, 'markets with no regional column').toEqual([])
    expect(missingFromRegistry, 'regional entries with no market').toEqual([])
  })
})

describe('formatCoordinates', () => {
  it('formats hemispheres from the sign', () => {
    expect(formatCoordinates([7.01, 4.82])).toBe('4.82°N 7.01°E')
    expect(formatCoordinates([-58.38, -34.6])).toBe('34.60°S 58.38°W')
  })

  it('writes a bare degree on the meridian and the equator', () => {
    // "0.00°N" is not something anyone writes on a map.
    expect(formatCoordinates([0, 0])).toBe('0° 0°')
    expect(formatCoordinates([9.5, 0])).toBe('0° 9.50°E')
  })
})

describe('transitScore', () => {
  it('takes the slow end of a band', () => {
    // A freight bar is a claim about the worst case.
    expect(transitScore('26–32 days')).toBe(32)
    expect(transitScore('4–6 days')).toBe(6)
    expect(transitScore('3 days')).toBe(3)
  })

  it('falls back to 1 rather than dividing by zero', () => {
    expect(transitScore('Quoted per consignment')).toBe(1)
  })
})

describe('freightBarPercents', () => {
  it('scales every bar against the slowest mode', () => {
    const percents = freightBarPercents([
      { name: 'Sea, FCL', transit: '26–32 days', route: '', useCase: '' },
      { name: 'Air', transit: '4–6 days', route: '', useCase: '' },
      { name: 'Sea, LCL', transit: '30–38 days', route: '', useCase: '' },
    ])
    expect(percents[2]).toBe(100)
    expect(percents[0]).toBeCloseTo((32 / 38) * 100, 5)
    expect(percents[1]).toBeCloseTo((6 / 38) * 100, 5)
  })
})

describe('isRightToLeft', () => {
  it('detects direction from the string, not from the market', () => {
    expect(isRightToLeft('نيجيريا')).toBe(true)
    expect(isRightToLeft('Nijeriya')).toBe(false)
    expect(isRightToLeft('Nigéria')).toBe(false)
  })
})

describe('marketOrderSequence', () => {
  it('resolves the quoting currency into step two', () => {
    const page = marketPageBySlug('nigeria')!
    const steps = marketOrderSequence(page)
    expect(steps).toHaveLength(4)
    expect(steps[1]).toContain('in USD')
    expect(steps[1]).not.toContain('{currency}')
    expect(steps[2]).toBe(page.orderSteps.third)
  })
})

describe('primaryRoute', () => {
  it('returns the flagged route', () => {
    const page = marketPageBySlug('nigeria')!
    expect(primaryRoute(page.map).mode).toBe('SEA VIA THE CAPE')
  })

  it('falls back to the first when nothing is flagged', () => {
    const map = {
      ...marketPageBySlug('nigeria')!.map,
      routes: [
        { mode: 'ROAD', points: [[0, 0] as const, [1, 1] as const] },
        { mode: 'AIR', points: [[0, 0] as const, [1, 1] as const] },
      ],
    } as MarketPage['map']
    expect(primaryRoute(map).mode).toBe('ROAD')
  })
})
