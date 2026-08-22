import { MARKET_PAGES, MARKET_REGIONS, primaryRoute, releasedMarketPage } from './market-pages'
import { MARKETS, marketBySlug, marketSlugByName, type Market } from './markets'

/**
 * The `/markets` hub — the model behind the 126 destination cards.
 *
 * WHY THIS IS NOT IN `markets.ts` OR `market-pages.ts`
 *
 * `markets.ts` is the registry: one row per destination, the facts a market
 * page and the Organization JSON-LD need. `market-pages.ts` is the designed
 * `/markets/{slug}` record. This file is neither — it is the *index*, and
 * everything in it is either presentational (a region's one-line note) or
 * derived by joining the other two (a card's transit band and freight mode).
 *
 * THE ONE RULE THAT MATTERS: EVERY COUNT IS DERIVED.
 *
 * The previous `/markets` page hardcoded "these five" markets in its closing
 * copy while the body linked 126, and the contradiction sat there through
 * every market added after the fifth. Nothing on this page is written down
 * that can be counted instead — destinations, regions and per-region totals
 * all come out of `MARKET_REGIONS`, so market 127 updates the page by
 * existing. If you find yourself typing a number into copy here, stop.
 *
 * WHERE THIS DIVERGES FROM THE DESIGN HANDOFF, AND WHY
 *
 * The design was drawn against a site where 46 of the 126 destinations had a
 * page and the other 80 were names only. This codebase is not that site: every
 * one of the 126 has a live, indexed `/markets/{slug}`, on either the designed
 * template or the plainer legacy one. So every card links.
 *
 * The design's built/unbuilt split survives as something real and narrower:
 * a card shows a transit band when we have one to state, and "Quoted per
 * consignment" when we do not. That is the same two-state card, keyed on the
 * fact the buyer actually cares about rather than on our build progress.
 *
 * EVERY CUSTOMER-FACING CLAIM ON A CARD GOES THROUGH `releasedMarketPage`,
 * NEVER `MARKET_PAGES`.
 *
 * All 46 designed records exist in the repo, but a market whose regulatory
 * prose has not been checked by a forwarder is held back and its route serves
 * the plain layout instead. Reading the raw record here would put "26–32 days"
 * and a `SEA` tag on a card that links to a page saying "quoted per
 * consignment" — which is precisely the index-contradicts-its-own-pages
 * failure this rebuild exists to end, reintroduced from the other direction.
 *
 * The one exception is `marketGeoNames`, and it is deliberate: a record's
 * Natural Earth spellings are cartography, not a claim to a buyer, so an
 * unreleased record's aliases are used and simply draw a better map.
 */

/**
 * One line per region, saying what the lane actually is.
 *
 * These are the reason the page is worth reading rather than scanning — a
 * grid of country names cannot tell a buyer that Egypt needs no canal
 * transit. Each is checked against the routes and lead times in `markets.ts`;
 * where the design's copy contradicted our own data it was rewritten, not
 * kept. The design said Kuwait and Iraq run air-primary; our records have both
 * on road from Dubai with air behind it, so the GCC note says that instead.
 *
 * Keyed by region name. `markets-index.test.ts` asserts the keys and
 * `MARKET_REGIONS` match exactly in both directions, so a region renamed in
 * one place fails the build rather than rendering a section with no note.
 */
export const MARKET_REGION_NOTES: Readonly<Record<string, string>> = {
  'GCC & Middle East':
    'Road lanes from the Dubai warehouse, typically three working days, with air freight where the schedule is tighter. Saudi Arabia is the one where SABER registration rather than distance sets the arrival date.',
  'North Africa':
    'Mediterranean lanes through Suez — except Egypt, where Ain Sokhna sits inside the Red Sea and needs no canal transit at all.',
  'East Africa':
    'Sea into Mombasa, Dar es Salaam and Djibouti, then the Northern and Central corridors inland to the landlocked markets behind them.',
  'West & Central Africa':
    'Around the Cape of Good Hope, which is why transit here is measured in weeks rather than days and why the part list has to be right early.',
  'Southern Africa':
    'Direct down the East coast into Durban and Maputo, plus the overland corridors inland to the Copperbelt and the Kalahari.',
  'CIS & Caucasus':
    'Air-primary out of Dubai, with the Middle Corridor — Poti, rail to Baku, ferry across the Caspian — behind it where volume justifies the routing.',
  'South America':
    'Long sea lanes with transshipment, quoted per consignment against a named port rather than a published band.',
  'North America & Caribbean':
    'Quoted per consignment. Usually a specification or a thread pattern our stock covers and local supply does not.',
  'South-East Asia':
    'Sea out of Jebel Ali through the Strait of Malacca, with Singapore as the regional transshipment hub.',
  'Western & Northern Europe':
    'Quoted per consignment. Specification-driven rather than volume — offshore assemblies and DIN-pattern couplings.',
  'Central & South-East Europe':
    'Quoted per consignment against a specific enquiry, by sea or by air depending on how the schedule sits.',
}

/**
 * Natural Earth `properties.name` for destinations whose trade name differs.
 *
 * Only needed for markets with no `MARKET_PAGES` record — a designed market
 * carries its own `map.geoNames`, which is authoritative and already handles
 * its aliases. Order matters: the first name that matches a feature wins.
 *
 * The 50m dataset is the one this resolves against. If the geometry source or
 * its version ever changes, re-run `market-thumbnails.test.ts` — it asserts
 * that all 126 resolve, because a placeholder box among 125 real silhouettes
 * is conspicuous in a way a missing map on one page is not.
 */
export const MARKET_GEO_ALIASES: Readonly<Record<string, readonly string[]>> = {
  'the United States': ['United States of America', 'United States'],
  'the United Kingdom': ['United Kingdom'],
  'the Netherlands': ['Netherlands'],
  'the Dominican Republic': ['Dominican Rep.', 'Dominican Republic'],
  'Ivory Coast': ["Côte d'Ivoire", 'Ivory Coast'],
  'DR Congo': ['Dem. Rep. Congo', 'Democratic Republic of the Congo'],
  'Republic of the Congo': ['Republic of the Congo', 'Congo'],
  'Equatorial Guinea': ['Eq. Guinea', 'Equatorial Guinea'],
  'Bosnia and Herzegovina': ['Bosnia and Herz.', 'Bosnia and Herzegovina'],
  'North Macedonia': ['North Macedonia', 'Macedonia'],
  'South Sudan': ['S. Sudan', 'South Sudan'],
  Czechia: ['Czechia', 'Czech Rep.'],
  'Timor-Leste': ['Timor-Leste', 'East Timor'],
}

/**
 * Every Natural Earth spelling worth trying for a destination, best first.
 *
 * Answered from the market's own record when one is written — released or not,
 * because these are Natural Earth spellings rather than a claim to a buyer —
 * then the alias table, then the bare name with any leading article removed.
 */
export function marketGeoNames(market: Market): readonly string[] {
  const page = MARKET_PAGES[market.slug]
  if (page) return page.map.geoNames
  const alias = MARKET_GEO_ALIASES[market.name]
  if (alias) return alias
  return [market.name.replace(/^the /, '')]
}

/**
 * The transit string printed on a card, or null when we have no band to state.
 *
 * Three sources, in falling order of precision:
 *
 *   1. A RELEASED designed market's own manifest row. Nigeria's "26–32 days" is a
 *      measured lane, not a rounded lead time, and it is the number the market
 *      page itself prints — reading it here is what keeps the card and the
 *      page it links to from ever disagreeing.
 *   2. The registry's `leadTime`, shortened. The card is 208px wide at design
 *      size; "Typically 3 working days from dispatch" does not fit and
 *      "3 working days" says the same thing.
 *   3. Null — the card says "Quoted per consignment", which is the truth for
 *      116 of the 126 destinations and is not an embarrassment. A buyer would
 *      rather read it than a band we invented.
 *
 * Step 2 parses prose, which is normally a bad idea. It is safe here only
 * because `markets-index.test.ts` walks all 126 and fails if any `leadTime`
 * neither parses nor is exactly "Quoted per consignment" — so a new market
 * written in a new shape breaks the build instead of silently losing its band.
 */
export function marketTransitBand(market: Market): string | null {
  const page = releasedMarketPage(market.slug)
  const stated = page?.manifest.find((row) => row.label === 'Transit')?.value
  if (stated) return stated

  const match = market.leadTime.match(/^Typically (\d+(?:[–-]\d+)?) working days( by sea)?/)
  if (!match) return null
  return `${match[1]} working days${match[2] ? ' by sea' : ''}`
}

/**
 * The freight mode tag in the corner of a thumbnail — `SEA`, `ROAD`, `AIR`.
 *
 * Only a RELEASED designed market has a published lane to read it from, so this
 * is null for the rest rather than guessed from the prose in `routes`. The tag
 * is a claim about a lane the linked page actually shows; without that page
 * there is no claim.
 */
export function marketPrimaryMode(market: Market): string | null {
  const page = releasedMarketPage(market.slug)
  if (!page) return null
  return primaryRoute(page.map).mode.split(' ')[0]?.toUpperCase() ?? null
}

/** A single destination card, fully resolved. */
export type MarketIndexCard = {
  readonly name: string
  /** Display label — the leading article is for prose, not a card. */
  readonly label: string
  readonly slug: string
  readonly countryCode: string
  /** Null renders "Quoted per consignment". */
  readonly transit: string | null
  /** Null renders no corner tag. */
  readonly mode: string | null
  /** True once the market's designed `/markets/{slug}` is actually served. */
  readonly designed: boolean
  /** Lowercased haystack for the client-side filter — name plus region. */
  readonly search: string
}

export type MarketIndexRegion = {
  readonly name: string
  readonly note: string
  /** Zero-padded, for the kicker. */
  readonly index: string
  /** Anchor target for the jump nav. */
  readonly anchor: string
  readonly cards: readonly MarketIndexCard[]
  readonly withStatedTransit: number
}

/**
 * `#gcc-middle-east` — an in-page anchor, not a route.
 *
 * Deliberately not `marketSlugByName`: this identifies a section of this page,
 * and coupling it to the market slug table would break the jump nav the first
 * time a region is renamed.
 */
export function marketRegionAnchor(region: string): string {
  return region
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * The whole page model: eleven regions, 126 cards, every count derived.
 *
 * Slugs are looked up through `marketSlugByName`, never derived from the name.
 * "Republic of the Congo" slugs to `republic-of-congo`, not
 * `republic-of-the-congo`, and deriving it would have shipped one dead link in
 * a grid of 126 where nobody would notice it.
 */
export function marketIndexRegions(): MarketIndexRegion[] {
  const slugByName = marketSlugByName()

  return MARKET_REGIONS.map(([region, countries], position) => {
    const cards = countries.flatMap<MarketIndexCard>((name) => {
      const slug = slugByName.get(name)
      // Unreachable while `market-pages.test.ts` passes — it asserts
      // MARKET_REGIONS and MARKETS name each other exactly. Dropping the card
      // beats rendering a link to a 404 if that ever stops being true.
      if (!slug) return []
      const market = marketBySlug(slug)
      if (!market) return []

      return [
        {
          name,
          label: name.replace(/^the /, ''),
          slug,
          countryCode: market.countryCode,
          transit: marketTransitBand(market),
          mode: marketPrimaryMode(market),
          designed: releasedMarketPage(slug) !== undefined,
          search: `${name} ${region}`.toLowerCase(),
        },
      ]
    })

    return {
      name: region,
      note: MARKET_REGION_NOTES[region] ?? '',
      index: String(position + 1).padStart(2, '0'),
      anchor: marketRegionAnchor(region),
      cards,
      withStatedTransit: cards.filter((c) => c.transit !== null).length,
    }
  })
}

/** The four hero stat tiles' numbers, and the breadcrumb strip's. */
export function marketIndexTotals(): {
  destinations: number
  regions: number
  withStatedTransit: number
  designed: number
} {
  const regions = marketIndexRegions()
  const cards = regions.flatMap((r) => r.cards)
  return {
    destinations: cards.length,
    regions: regions.length,
    withStatedTransit: cards.filter((c) => c.transit !== null).length,
    designed: cards.filter((c) => c.designed).length,
  }
}

/**
 * Destination names for the enquiry form's `<datalist>`.
 *
 * A typing aid ONLY. The destination field is free text and is never validated
 * against this list — the entire purpose of that form is the destinations we
 * do not already list, and rejecting one would turn the page's best lead
 * source into a dead end.
 */
export function marketDatalistNames(): string[] {
  return MARKETS.map((m) => m.name.replace(/^the /, '')).sort((a, b) => a.localeCompare(b))
}
