import { describe, expect, it } from 'vitest'
import {
  MARKET_PAGES,
  MARKET_REGIONS,
  pendingMarketPageSlugs,
  releasedMarketPage,
  releasedMarketPageSlugs,
} from './market-pages'
import { MARKETS, marketBySlug, type Market } from './markets'
import {
  MARKET_GEO_ALIASES,
  MARKET_REGION_NOTES,
  marketDatalistNames,
  marketGeoNames,
  marketIndexRegions,
  marketIndexTotals,
  marketPrimaryMode,
  marketRegionAnchor,
  marketTransitBand,
} from './markets-index'

/**
 * A market with no released page behind it.
 *
 * All 126 registry markets are released, so there is no longer a real one to
 * point these assertions at — and naming one that happened to be held was how
 * this file broke every time a market shipped. The rules being tested are
 * about the INPUT (a slug with no released record, a registry row stating no
 * band), so the input is built rather than found.
 */
function heldMarket(): Market {
  return { ...MARKETS[0]!, slug: 'atlantis', leadTime: 'Quoted per consignment' }
}

describe('MARKET_REGION_NOTES', () => {
  /*
    Both directions. A region renamed in MARKET_REGIONS and not here would
    render a section with an empty note and nobody would notice in review; a
    note left behind after a rename is dead copy that reads as if it applies
    to something.
  */
  it('names every region, and only regions that exist', () => {
    const regions = MARKET_REGIONS.map(([name]) => name)
    expect(Object.keys(MARKET_REGION_NOTES).sort()).toEqual([...regions].sort())
  })

  it('gives every region a note with something in it', () => {
    for (const [region] of MARKET_REGIONS) {
      expect(MARKET_REGION_NOTES[region]?.length ?? 0).toBeGreaterThan(40)
    }
  })
})

describe('marketTransitBand', () => {
  /*
    THE LOAD-BEARING TEST IN THIS FILE.

    `marketTransitBand` parses `Market.leadTime` prose to get a band short
    enough for a 208px card. Parsing prose is only safe while every string in
    the registry is one of the two shapes it knows. This asserts that for all
    126, so a market written in a third shape fails the build instead of
    silently losing its band and telling a buyer it is quoted per consignment.
  */
  it('parses or explicitly declines every lead time in the registry', () => {
    const unhandled = MARKETS.filter(
      (m) => marketTransitBand(m) === null && m.leadTime !== 'Quoted per consignment'
    ).map((m) => `${m.slug}: ${m.leadTime}`)

    expect(unhandled).toEqual([])
  })

  it('shortens a lead time to something that fits a card', () => {
    /*
      Exercised against SYNTHETIC registry rows, not real markets.

      Every market whose registry row states a band now also has a released
      designed record, so `marketTransitBand` reads the manifest for all of
      them and this branch is unreachable through real data. It is still the
      right fallback — market 127 arrives with a registry row and no record,
      and a market set back to `released: false` returns to it — so it is
      tested on inputs rather than on whichever markets happen to be released
      this week. Pinning it to Kenya is what broke when Kenya shipped.
    */
    const row = (leadTime: string): Market =>
      ({ ...marketBySlug('brazil')!, slug: 'nowhere', leadTime }) as Market

    expect(marketTransitBand(row('Typically 3 working days from dispatch'))).toBe('3 working days')
    expect(marketTransitBand(row('Typically 10–20 working days by sea from dispatch'))).toBe(
      '10–20 working days by sea'
    )
    expect(marketTransitBand(row('Quoted per consignment'))).toBeNull()
  })

  it('prefers a designed market’s own manifest row over the registry prose', () => {
    // Nigeria's card and Nigeria's page must print the same number. The page
    // reads its manifest; so does this.
    const nigeria = marketBySlug('nigeria')!
    const manifestTransit = MARKET_PAGES.nigeria?.manifest.find((r) => r.label === 'Transit')?.value
    expect(manifestTransit).toBeTruthy()
    expect(marketTransitBand(nigeria)).toBe(manifestTransit)
  })

  it('returns null for a market with no stated band', () => {
    /*
      A SYNTHETIC market, not a real one. Every one of the 126 is released
      today, so any named market would read its band off its own page and this
      would assert nothing. The rule is about the input — a registry row that
      states no band, behind a slug with no released record — and that rule is
      what a market 127 lands on.
    */
    const unstated = heldMarket()
    expect(unstated.leadTime).toBe('Quoted per consignment')
    expect(marketTransitBand(unstated)).toBeNull()
  })

  it('never returns a band longer than the card can hold', () => {
    for (const market of MARKETS) {
      const band = marketTransitBand(market)
      if (band) expect(band.length).toBeLessThanOrEqual(28)
    }
  })
})

describe('marketPrimaryMode', () => {
  it('reads the drawn route on a designed market', () => {
    // Nigeria's primary route is "SEA · CAPE"; the card tag is the first word.
    expect(marketPrimaryMode(marketBySlug('nigeria')!)).toBe('SEA')
  })

  it('is null where there is no drawn lane to read', () => {
    // Not guessed from the prose in `routes` — the tag is a claim about the
    // lane we plotted, and without the plot there is no claim. Synthetic, for
    // the reason given above: every real market has a plotted lane now.
    expect(marketPrimaryMode(heldMarket())).toBeNull()
  })
})

describe('marketGeoNames', () => {
  it('prefers a designed market’s own geoNames', () => {
    expect(marketGeoNames(marketBySlug('nigeria')!)).toEqual(MARKET_PAGES.nigeria?.map.geoNames)
  })

  it('falls back to the alias table', () => {
    expect(marketGeoNames(marketBySlug('ivory-coast')!)).toEqual(MARKET_GEO_ALIASES['Ivory Coast'])
  })

  it('strips the leading article when there is no alias', () => {
    expect(marketGeoNames(marketBySlug('germany')!)).toEqual(['Germany'])
  })

  it('never leaves a market with no name to look up', () => {
    for (const market of MARKETS) {
      expect(marketGeoNames(market).length).toBeGreaterThan(0)
    }
  })

  it('has no alias entry for a country that is not a market', () => {
    const names = new Set(MARKETS.map((m) => m.name))
    for (const alias of Object.keys(MARKET_GEO_ALIASES)) {
      expect(names.has(alias)).toBe(true)
    }
  })
})

describe('marketRegionAnchor', () => {
  it('makes a URL-safe fragment', () => {
    expect(marketRegionAnchor('GCC & Middle East')).toBe('gcc-middle-east')
    expect(marketRegionAnchor('Central & South-East Europe')).toBe('central-south-east-europe')
  })

  it('gives every region a distinct anchor', () => {
    const anchors = MARKET_REGIONS.map(([name]) => marketRegionAnchor(name))
    expect(new Set(anchors).size).toBe(anchors.length)
  })
})

describe('marketIndexRegions', () => {
  const regions = marketIndexRegions()

  it('renders every destination exactly once', () => {
    const slugs = regions.flatMap((r) => r.cards.map((c) => c.slug))
    expect(slugs).toHaveLength(MARKETS.length)
    expect(new Set(slugs).size).toBe(MARKETS.length)
  })

  it('drops no country — every card resolved to a real market', () => {
    const total = MARKET_REGIONS.reduce((n, [, list]) => n + list.length, 0)
    expect(regions.reduce((n, r) => n + r.cards.length, 0)).toBe(total)
  })

  it('looks slugs up rather than deriving them', () => {
    // "Republic of the Congo" derives to `republic-of-the-congo` and slugs to
    // `republic-of-congo`. Deriving would have shipped one dead link in 126.
    const congo = regions
      .flatMap((r) => r.cards)
      .find((c) => c.name === 'Republic of the Congo')
    expect(congo?.slug).toBe('republic-of-congo')
  })

  it('strips the leading article from the card label but not the name', () => {
    const usa = regions.flatMap((r) => r.cards).find((c) => c.slug === 'united-states')
    expect(usa?.name).toBe('the United States')
    expect(usa?.label).toBe('United States')
  })

  it('gives every card a lowercase haystack carrying its region', () => {
    const nigeria = regions.flatMap((r) => r.cards).find((c) => c.slug === 'nigeria')
    expect(nigeria?.search).toBe('nigeria west & central africa')
  })

  it('zero-pads the section index', () => {
    expect(regions[0]?.index).toBe('01')
    expect(regions[10]?.index).toBe('11')
  })

  it('counts stated transit bands per region from the cards themselves', () => {
    for (const region of regions) {
      expect(region.withStatedTransit).toBe(region.cards.filter((c) => c.transit !== null).length)
    }
  })
})

describe('marketIndexTotals', () => {
  const totals = marketIndexTotals()

  it('derives the destination count rather than stating it', () => {
    expect(totals.destinations).toBe(MARKETS.length)
    expect(totals.regions).toBe(MARKET_REGIONS.length)
  })

  it('counts only the market pages that are actually served', () => {
    // Not `Object.keys(MARKET_PAGES).length`. All 46 records exist; most are
    // held pending a forwarder sign-off and their routes serve the plain
    // layout.
    expect(totals.designed).toBe(releasedMarketPageSlugs().length)
    expect(totals.designed).toBeLessThanOrEqual(Object.keys(MARKET_PAGES).length)
  })

  it('never claims more stated bands than there are destinations', () => {
    expect(totals.withStatedTransit).toBeGreaterThan(0)
    expect(totals.withStatedTransit).toBeLessThanOrEqual(totals.destinations)
  })
})

describe('marketDatalistNames', () => {
  it('offers every destination, article-free and sorted', () => {
    const names = marketDatalistNames()
    expect(names).toHaveLength(MARKETS.length)
    expect(names).toContain('United States')
    expect(names.some((n) => n.startsWith('the '))).toBe(false)
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names)
  })
})

describe('the release gate', () => {
  /*
    THE INVARIANT THIS PAGE EXISTS TO PROTECT, FROM THE OTHER DIRECTION.

    All 46 designed records live in the repo; only the ones whose regulatory
    prose a forwarder has signed off are served. Reading the raw record here
    would put a freight-mode tag and a precise transit band on a card that
    links to a page saying "quoted per consignment" — an index contradicting
    its own pages, which is exactly the bug this rebuild removed.

    These walk the pending list rather than naming markets, so they keep
    working as records are released one at a time.
  */
  const cards = new Map(marketIndexRegions().flatMap((r) => r.cards.map((c) => [c.slug, c])))

  it('has released markets to check', () => {
    /*
      The pending list is now EMPTY — all 46 records cleared forwarder review
      on 2026-08-22 — so the held-market loop below is vacuous rather than
      wrong. It is kept, and the behaviour it guards is asserted against a
      synthetic held card in `gives a held market nothing to contradict its
      page`, because the mechanism has to keep working for market 47: written,
      unreleased, and shown on the index as a plain card until someone signs
      the conformity sequence off.
    */
    expect(releasedMarketPageSlugs().length).toBeGreaterThan(0)
    expect(pendingMarketPageSlugs().length + releasedMarketPageSlugs().length).toBe(
      Object.keys(MARKET_PAGES).length
    )
  })

  it('gives a held market nothing to contradict its page', () => {
    /*
      The mechanism, on a synthetic record, so it survives every market being
      released — which, since 2026-08-24, every market is. `marketPrimaryMode`
      and `marketTransitBand` both route through `releasedMarketPage`, which
      returns undefined for anything held — so a held market falls back to its
      registry row and can never print a lane its page does not mention.
    */
    const held = heldMarket()
    expect(releasedMarketPage(held.slug)).toBeUndefined()
    expect(marketPrimaryMode(held)).toBeNull()
    expect(held.leadTime).toBe('Quoted per consignment')
    expect(marketTransitBand(held)).toBeNull()
  })

  it('gives a held market no freight-mode tag and no page-derived band', () => {
    for (const slug of pendingMarketPageSlugs()) {
      const card = cards.get(slug)
      expect(card, `${slug} is missing from the index`).toBeDefined()
      expect(card!.mode, `${slug} is held but tagged with a freight mode`).toBeNull()
      expect(card!.designed, `${slug} is held but counted as designed`).toBe(false)

      /*
        The sharp case: a held market whose registry row says "Quoted per
        consignment" while its held record states a band. Nigeria is exactly
        this shape — registry "Quoted per consignment", record "26–32 days" —
        so a card reading the held record would print a lane the page behind it
        does not mention. Comparing the two strings is no good on its own:
        Qatar's held record and its registry row both say three working days,
        and agreeing proves nothing.
      */
      const market = marketBySlug(slug)!
      if (market.leadTime === 'Quoted per consignment') {
        expect(card!.transit, `${slug} is showing its held page's transit band`).toBeNull()
      }
    }
  })

  it('gives a released market its tag and its own band', () => {
    for (const slug of releasedMarketPageSlugs()) {
      const card = cards.get(slug)
      expect(card, `${slug} is missing from the index`).toBeDefined()
      expect(card!.designed).toBe(true)
      expect(card!.mode, `${slug} is released but has no freight-mode tag`).toBeTruthy()

      const transit = MARKET_PAGES[slug]?.manifest.find((row) => row.label === 'Transit')?.value
      if (transit) expect(card!.transit).toBe(transit)
    }
  })
})
