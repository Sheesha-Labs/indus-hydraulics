import { describe, expect, it } from 'vitest'
import { MARKET_PAGES, MARKET_REGIONS } from './market-pages'
import { MARKETS, marketBySlug } from './markets'
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
    const saudi = marketBySlug('saudi-arabia')!
    expect(saudi.leadTime).toBe('Typically 3 working days from dispatch')
    expect(marketTransitBand(saudi)).toBe('3 working days')

    const kenya = marketBySlug('kenya')!
    expect(marketTransitBand(kenya)).toBe('10–20 working days by sea')
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
    const brazil = marketBySlug('brazil')!
    expect(brazil.leadTime).toBe('Quoted per consignment')
    expect(marketTransitBand(brazil)).toBeNull()
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
    // lane we plotted, and without the plot there is no claim.
    expect(marketPrimaryMode(marketBySlug('brazil')!)).toBeNull()
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

  it('counts designed pages from MARKET_PAGES', () => {
    expect(totals.designed).toBe(Object.keys(MARKET_PAGES).length)
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
