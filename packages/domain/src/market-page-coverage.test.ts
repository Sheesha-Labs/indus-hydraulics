import { describe, expect, it } from 'vitest'
import { MARKET_PAGE_RECORDS } from './market-page-records'
import {
  freightBarPercents,
  isRightToLeft,
  marketOrderSequence,
  marketPageBySlug,
  pendingMarketPageSlugs,
  primaryRoute,
  releasedMarketPage,
  releasedMarketPageSlugs,
  transitScore,
} from './market-pages'

/**
 * The template's branch coverage.
 *
 * The design bundle's `market-register.md` names six branches that never
 * execute if the template is implemented against Nigeria alone, and names the
 * market that proves each. This file is that matrix, turned into assertions —
 * both that the branch is still reachable at all (a record could be edited
 * until nothing exercises it) and that it behaves.
 *
 * It runs against every written record, released or not, because the point is
 * to catch a template regression before a market is switched on, not after.
 */

const bySlug = (slug: string) => {
  const page = marketPageBySlug(slug)
  if (!page) throw new Error(`no record for ${slug}`)
  return page
}

describe('coverage — road primary, origin visible in frame', () => {
  // Proven by Saudi Arabia, Oman and Iraq: the only three that do NOT set
  // `fit: 'crossing'`, so Dubai stays inside the frame. Everything downstream
  // of that — the origin marker, its collision-aware label placement, and the
  // absence of the "· FROM …" suffix on the corridor annotation — is dead code
  // on the other 43.
  const originFitted = MARKET_PAGE_RECORDS.filter((p) => p.map.fit === 'origin')

  it('is still reachable', () => {
    expect(originFitted.map((p) => p.slug).sort()).toEqual(['iraq', 'oman', 'saudi-arabia'])
  })

  it('runs a short road lane from Dubai', () => {
    const saudi = bySlug('saudi-arabia')
    expect(primaryRoute(saudi.map).mode).toBe('ROAD')
    // Two waypoints or three: a road lane is a line to a border post, not a
    // traced coastline. If this ever needs sixteen points, something is wrong.
    expect(primaryRoute(saudi.map).points.length).toBeLessThan(6)
  })

  it('names a border crossing rather than a port', () => {
    for (const page of originFitted) {
      expect(page.map.crossing.legend ?? 'Border crossing').toBe('Border crossing')
    }
  })
})

describe('coverage — air primary with a multi-leg secondary', () => {
  // Kazakhstan, Azerbaijan and Uzbekistan quote air as the default and put a
  // long overland corridor behind it. That inverts the freight ladder: the
  // recommended row is the FASTEST by a wide margin, where every sea lane's
  // recommended row is the slowest-but-cheapest.
  const airPrimary = MARKET_PAGE_RECORDS.filter((p) => primaryRoute(p.map).mode.startsWith('AIR'))

  it('is still reachable', () => {
    expect(airPrimary.map((p) => p.slug)).toEqual(
      expect.arrayContaining(['kazakhstan', 'azerbaijan', 'uzbekistan'])
    )
  })

  it('scales the ladder from the slowest mode even when row one is fastest', () => {
    const kz = bySlug('kazakhstan')
    const percents = freightBarPercents(kz.freight)
    expect(Math.max(...percents)).toBe(100)
    // The recommended row must not be the one drawn full width, or the bar
    // silently argues against the recommendation next to it.
    expect(percents[0]).toBeLessThan(100)
    expect(percents.every((p) => p > 0 && p <= 100)).toBe(true)
  })

  it('puts the Middle Corridor behind the air leg on the three Caspian lanes', () => {
    /*
      Only the Caspian three. Kuwait and Iraq also quote air first, but their
      alternative is a short GCC road run — five waypoints, not a corridor.

      The corridor is not a faster alternative; it is the surface route the
      goods take when air is not viable, and it goes the long way round the
      Arabian peninsula and through Suez specifically to avoid Iran and Russia.
      Whether it actually does is asserted against real polygons in
      apps/web/src/lib/market-geometry.test.ts, which has the geometry.
    */
    for (const slug of ['kazakhstan', 'azerbaijan', 'uzbekistan']) {
      const page = bySlug(slug)
      expect(primaryRoute(page.map).mode, slug).toBe('AIR')
      const secondary = page.map.routes.find((r) => !r.primary)!
      expect(secondary.points.length, slug).toBeGreaterThan(12)
    }
  })
})

describe('coverage — landlocked, sea + road, two transit countries', () => {
  // Chad, Mali, Niger, Zambia, Rwanda, Burundi. The route has to reach a port
  // by sea and then continue overland through a real crossing, which is what
  // produces the long multi-waypoint paths.
  const landlocked = MARKET_PAGE_RECORDS.filter((p) => primaryRoute(p.map).mode.includes('ROAD') && primaryRoute(p.map).mode.includes('SEA'))

  it('is still reachable', () => {
    expect(landlocked.map((p) => p.slug)).toEqual(
      expect.arrayContaining(['chad', 'mali', 'niger', 'zambia', 'rwanda', 'burundi'])
    )
  })

  it('traces the sea leg properly rather than cutting across land', () => {
    for (const page of landlocked) {
      // A sea-plus-road lane that reaches its destination in four hops is a
      // straight line drawn over a continent.
      expect(primaryRoute(page.map).points.length, page.slug).toBeGreaterThanOrEqual(8)
    }
  })

  it('holds the longest lane in the set', () => {
    const chad = bySlug('chad')
    expect(transitScore(chad.freight[0].transit)).toBeGreaterThanOrEqual(55)
  })

  it('keeps the extreme ladder spread legible', () => {
    // Chad is 40–55 days by sea+road against 6–9 by air. The air bar lands
    // near 16% — small, and it has to stay visible rather than collapsing to
    // a hairline the reader cannot see.
    const percents = freightBarPercents(bySlug('chad').freight)
    expect(Math.min(...percents)).toBeGreaterThan(5)
    expect(Math.max(...percents)).toBe(100)
  })
})

describe('coverage — quoting currency', () => {
  // Nigeria is USD, so implementing against it alone never exercises the AED
  // default or the third value.
  const currencies = new Set(MARKET_PAGE_RECORDS.map((p) => p.currency))

  it('exercises all three currencies in use', () => {
    expect([...currencies].sort()).toEqual(['AED', 'EUR', 'USD'])
  })

  it('resolves each one into the order sequence', () => {
    for (const [slug, expected] of [
      ['saudi-arabia', 'AED'],
      ['nigeria', 'USD'],
      ['tunisia', 'EUR'],
    ] as const) {
      const steps = marketOrderSequence(bySlug(slug))
      expect(steps[1], slug).toContain(`in ${expected}`)
      expect(steps[1], slug).not.toContain('{currency}')
    }
  })

  it('quotes the GCC in AED and the African lanes in USD', () => {
    // Not decoration: the Form M and the letter of credit are raised in the
    // quoting currency, so an AED Estimate into Nigeria creates work at the
    // buyer's bank.
    for (const slug of ['saudi-arabia', 'oman', 'qatar', 'bahrain', 'kuwait', 'iraq']) {
      expect(bySlug(slug).currency, slug).toBe('AED')
    }
    for (const slug of ['tunisia', 'morocco']) {
      expect(bySlug(slug).currency, slug).toBe('EUR')
    }
  })
})

describe('coverage — local-language breadcrumb', () => {
  const withLocalName = MARKET_PAGE_RECORDS.filter((p) => p.localName)

  it('is set on 34 markets and omitted where English is official', () => {
    expect(withLocalName).toHaveLength(34)
    // Nigeria, Ghana, South Africa and the rest of the English-official set
    // omit it rather than transliterating for the sake of the field.
    for (const slug of ['nigeria', 'ghana', 'south-africa', 'zimbabwe', 'zambia']) {
      expect(bySlug(slug).localName, slug).toBeUndefined()
    }
  })

  it('lays Arabic out right-to-left', () => {
    for (const slug of ['saudi-arabia', 'egypt', 'morocco', 'mauritania']) {
      const name = bySlug(slug).localName!
      expect(isRightToLeft(name), `${slug}: ${name}`).toBe(true)
    }
  })

  it('does NOT force right-to-left on Latin, Cyrillic or Ge’ez scripts', () => {
    /*
      The opposite failure, and the more likely one: a per-market `dir` flag
      set once and copied. Ivory Coast is French, Equatorial Guinea Spanish,
      Kenya Swahili, Ethiopia Amharic, Kazakhstan Kazakh, Eritrea Tigrinya —
      all left-to-right, none of them English.
    */
    for (const slug of ['ivory-coast', 'equatorial-guinea', 'kenya', 'ethiopia', 'kazakhstan', 'eritrea', 'madagascar']) {
      const name = bySlug(slug).localName!
      expect(name, slug).toBeTruthy()
      expect(isRightToLeft(name), `${slug}: ${name}`).toBe(false)
    }
  })
})

describe('coverage — geo as an alias array', () => {
  // Natural Earth's `properties.name` is not the trade name for four markets.
  // A miss here is a blank map, and blank silently — the panel falls back to a
  // labelled placeholder rather than throwing.
  const aliased = MARKET_PAGE_RECORDS.filter((p) => p.map.geoNames.length > 1)

  it('is still reachable', () => {
    expect(aliased.map((p) => p.slug).sort()).toEqual([
      'dr-congo',
      'equatorial-guinea',
      'ivory-coast',
      'republic-of-congo',
    ])
  })

  it('carries the Natural Earth spelling, not just the trade name', () => {
    expect(bySlug('ivory-coast').map.geoNames).toContain("Côte d'Ivoire")
    expect(bySlug('dr-congo').map.geoNames).toContain('Dem. Rep. Congo')
    expect(bySlug('equatorial-guinea').map.geoNames).toContain('Eq. Guinea')
  })
})

describe('coverage — port of entry versus border crossing', () => {
  it('splits the set, and never leaves a sea lane calling its port a crossing', () => {
    const ports = MARKET_PAGE_RECORDS.filter((p) => p.map.crossing.legend === 'Port of entry')
    const crossings = MARKET_PAGE_RECORDS.filter((p) => !p.map.crossing.legend)
    expect(ports.length).toBeGreaterThan(20)
    expect(crossings.length).toBeGreaterThan(5)
    expect(ports.length + crossings.length).toBe(MARKET_PAGE_RECORDS.length)

    for (const page of ports) {
      /*
        A "Port of entry" legend has to be earned by a route that actually
        arrives at a port — but not necessarily the PRIMARY one. The three
        Caspian markets quote air as the default and still name Aktau, Baku
        and their Caspian ferry terminals as the point of entry, because that
        is where the surface corridor lands. Asserting on the primary alone
        would have called that a bug.
      */
      const arrivesByWater = page.map.routes.some((r) => /SEA|CORRIDOR|RAIL/.test(r.mode))
      expect(arrivesByWater, `${page.slug} names a port but no route reaches one`).toBe(true)
    }
  })
})

describe('the release gate', () => {
  it('serves only records whose copy has been cleared or already shipped', () => {
    expect(releasedMarketPageSlugs().sort()).toEqual(['nigeria', 'saudi-arabia'])
  })

  it('hides the rest from the route while keeping them in the repo', () => {
    expect(pendingMarketPageSlugs()).toHaveLength(44)
    expect(releasedMarketPage('chad')).toBeUndefined()
    // …but the record is there, complete, and testable.
    expect(marketPageBySlug('chad')?.faqs).toHaveLength(8)
  })

  it('marks only Saudi Arabia as forwarder-verified', () => {
    // Its copy is verbatim from the live site. Nigeria is released because it
    // shipped before this gate existed — it is flagged honestly rather than
    // quietly withdrawn, and it is on the review list like the rest.
    const verified = MARKET_PAGE_RECORDS.filter((p) => p.regulatoryCopy === 'verified')
    expect(verified.map((p) => p.slug)).toEqual(['saudi-arabia'])
    expect(marketPageBySlug('nigeria')?.regulatoryCopy).toBe('unverified')
  })

  it('never releases a market whose copy is unverified except the one already live', () => {
    for (const page of MARKET_PAGE_RECORDS) {
      if (page.released && page.regulatoryCopy === 'unverified') {
        expect(page.slug, 'a new market was released without sign-off').toBe('nigeria')
      }
    }
  })
})

describe('the records carry their compliance source', () => {
  it('keeps the conformity sequence on every market', () => {
    // Not rendered — the standalone section was cut from the design — but it
    // is what the FAQ, the fact table and the operations caption were written
    // FROM, and it is the part a forwarder reviews.
    for (const page of MARKET_PAGE_RECORDS) {
      expect(page.compliance.documents.length, page.slug).toBeGreaterThanOrEqual(4)
      expect(page.compliance.body.length, page.slug).toBeGreaterThan(100)
      for (const doc of page.compliance.documents) {
        expect(doc.ref, page.slug).toBeTruthy()
        expect(doc.issuer, page.slug).toBeTruthy()
      }
    }
  })
})

describe('every record carries a dial code', () => {
  it('is a plausible E.164 prefix', () => {
    for (const page of MARKET_PAGE_RECORDS) {
      expect(page.dialCode, page.slug).toMatch(/^\+\d{1,4}$/)
    }
  })

  it('matches the destination, spot-checked', () => {
    expect(bySlug('nigeria').dialCode).toBe('+234')
    expect(bySlug('saudi-arabia').dialCode).toBe('+966')
    expect(bySlug('kazakhstan').dialCode).toBe('+7')
    expect(bySlug('south-africa').dialCode).toBe('+27')
    expect(bySlug('egypt').dialCode).toBe('+20')
  })
})
