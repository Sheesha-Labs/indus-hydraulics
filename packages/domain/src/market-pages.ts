/**
 * Export-market landing pages — the rich content record behind `/markets/{slug}`.
 *
 * WHY THIS IS SEPARATE FROM `markets.ts`
 *
 * `markets.ts` is the registry: 126 countries with the four or five facts the
 * Organization JSON-LD, the sitemap and the `/markets` index need. Every
 * market has a row there and always will.
 *
 * This file is the *page*. A market only appears here once someone has written
 * its lede, its lane geometry, its city gazetteer, its freight ladder and its
 * eight FAQs — roughly 2,000 words of specific, checkable claims. The route
 * renders the designed page when a record exists here and the older, plainer
 * layout when it does not, so a half-written market can never ship as a page
 * full of empty sections.
 *
 * That split is the whole templatisation story: adding a market is adding a
 * record to `MARKET_PAGES`, not writing a component.
 *
 * THE HONESTY RULES FROM `markets.ts` APPLY HERE UNCHANGED, and they bite
 * harder because this page says far more:
 *
 *   - No premises. There is one office and it is in Dubai. The first FAQ on
 *     every market answers "do you have a branch in X?" with "no" on purpose.
 *   - No response-time promises. `facts` states a typical transit band, which
 *     is an observation; "we will deliver in N days" is a commitment.
 *   - No local-stock claims. Stock is in Dubai. That is the page's whole
 *     argument, not an embarrassment to hide.
 *   - No invented conformity. Where a market has no scheme worth naming, the
 *     clause is dropped rather than filled with a plausible acronym.
 *
 * REGULATORY COPY IS UNVERIFIED. Everything describing another country's
 * import regime — Nigeria's Form M sequence, the SONCAP Product Certificate
 * versus the SONCAP Certificate, PAAR, and who owns each document — was
 * written for the design and has not been checked by a forwarder. A page that
 * misstates a conformity sequence is worse than one that omits it. Get each
 * market's block reviewed before it goes live.
 */

import { MARKET_PAGE_RECORDS as WAVE_1 } from './market-page-records'
import { MARKET_PAGE_RECORDS_2 as WAVE_2 } from './market-page-records-2'
import { MARKET_PAGE_RECORDS_3 as WAVE_3 } from './market-page-records-3'

/**
 * Every written record, in registry order across both authoring waves.
 *
 * Split across two files only because one would be eleven thousand lines. The
 * route, the tests and the admin queue treat them identically — a wave-2
 * record is not a lesser record, it is a later one.
 */
export const ALL_MARKET_PAGE_RECORDS: readonly MarketPage[] = [...WAVE_1, ...WAVE_2, ...WAVE_3]

/** `[lon, lat]`, in that order — the order d3-geo and GeoJSON both use. */
export type LonLat = readonly [lon: number, lat: number]

/** SVG `text-anchor`, for nudging a map label off its marker. */
export type LabelAnchor = 'start' | 'middle' | 'end'

/** A key/value row in the hero fact table or the navy manifest strip. */
export type MarketFactRow = { readonly label: string; readonly value: string }

export type MarketCity = {
  readonly name: string
  /**
   * Real coordinates. NEVER store a formatted string — the gazetteer renders
   * hemispheres at display time via `formatCoordinates`, and a stored
   * "4.82°N" cannot be re-projected onto the map.
   */
  readonly coords: LonLat
  /** Administrative region as locals name it — State, Governorate, Province. */
  readonly region: string
  /**
   * Also mark this city on the hero map. Keep it to 6–8 across the record or
   * the frame crowds; every city appears in the gazetteer and the delivery
   * select regardless.
   *
   * The port or border city is deliberately NOT plotted — the crossing
   * diamond already marks that exact point, and plotting both double-marks it.
   */
  readonly plot?: boolean
  /** Label nudge, only to clear a collision. Defaults dx 8, dy 3, start. */
  readonly dx?: number
  readonly dy?: number
  readonly anchor?: LabelAnchor
}

export type MarketRoute = {
  /**
   * Printed in-frame as the corridor annotation, so keep it SHORT. "SEA ·
   * SUEZ", not "SEA FREIGHT VIA THE SUEZ CANAL" — a long string collides with
   * coastal city labels.
   */
  readonly mode: string
  /**
   * The route a shipment actually takes. Nigeria's sea leg carries 16
   * waypoints because it genuinely rounds the Cape of Good Hope; a straight
   * line would draw across the Sahara and compute 6,000 km instead of 13,910.
   * The distance on the map is summed from these points, so the geometry *is*
   * the claim — never hardcode the number.
   */
  readonly points: readonly LonLat[]
  readonly primary?: boolean
}

export type MarketCrossing = {
  /** Marker label, uppercase. */
  readonly name: string
  readonly coords: LonLat
  /** Legend wording. Omit for a road lane, where "Border crossing" is right. */
  readonly legend?: string
  readonly dx?: number
  readonly dy?: number
  readonly anchor?: LabelAnchor
}

export type MarketMap = {
  /**
   * Natural Earth `properties.name`, which is not always the trade name —
   * Ivory Coast is `Côte d'Ivoire`, DR Congo is `Dem. Rep. Congo`. Pass every
   * spelling that might match; the first hit wins.
   */
  readonly geoNames: readonly string[]
  /**
   * What the frame is fitted to besides the country itself.
   *
   * `crossing` fits the country plus its port or border post; `origin` fits
   * the country plus Dubai. Use `crossing` whenever fitting Dubai in the same
   * frame would shrink the country to a smudge — which is every market outside
   * the GCC, and Bahrain inside it. When the origin then falls outside the
   * frame its marker suppresses itself and the corridor annotation gains
   * "· FROM {originLabel}" so the lane still reads.
   */
  /**
   * Clip the drawn country to a bounding box, `[west, south, east, north]`.
   *
   * Natural Earth files a country's overseas territories inside the SAME
   * feature as its mainland. France carries French Guiana, Réunion and the
   * Antilles; the Netherlands carries the Caribbean municipalities; Norway
   * carries Svalbard and Jan Mayen. Fitting the frame to that feature spans
   * half the planet — France's map came out at an 800 km scale bar with
   * fifty-three "neighbours" and Dubai inside the frame, which is not a map of
   * France in any useful sense.
   *
   * Where this is set, only the polygons whose centroid falls inside the box
   * are drawn and fitted. Leave it unset for a country whose feature is
   * already just the country — which is nearly all of them.
   */
  readonly mainland?: readonly [number, number, number, number]
  readonly fit: 'origin' | 'crossing'
  readonly origin: LonLat
  readonly originLabel: string
  readonly crossing: MarketCrossing
  /** Exactly two, exactly one of them primary. */
  readonly routes: readonly [MarketRoute, MarketRoute]
}

export type MarketFreightMode = {
  readonly name: string
  /**
   * Keep the format "N–M days" or "N days". The comparison bars parse the
   * LAST integer out of this string and scale it against the slowest mode, so
   * a data edit can never desync the bars from the numbers.
   */
  readonly transit: string
  readonly route: string
  readonly useCase: string
}

/** Must key into an `Industry.slug` — the sector card links to that page. */
export type MarketSectorSlug = 'oil-gas' | 'marine' | 'power' | 'construction' | 'steel' | 'mining'

export type MarketSector = {
  readonly slug: MarketSectorSlug
  readonly name: string
  /** Names the application in THIS market, not the sector in general. */
  readonly description: string
}

export type MarketFaq = { readonly question: string; readonly answer: string }

export type MarketComplianceDoc = {
  /** Short reference as the trade uses it — "FORM M", "SC", "PAAR". */
  readonly ref: string
  readonly name: string
  /** Who issues it. The question a buyer actually asks. */
  readonly issuer: string
  /** Where it sits in the sequence — "Before the vessel sails". */
  readonly when: string
}

/**
 * The destination's conformity regime, in full.
 *
 * NOT RENDERED. The standalone compliance section was cut from the design at
 * the client's request, and its content now lives distributed across the hero
 * fact table, the operations-band caption and the FAQ.
 *
 * It is kept because it is the source those three were written FROM, and
 * because it is the part of the record a forwarder reviews. Deleting it would
 * mean the next person editing a conformity claim has only the three
 * paraphrases and no statement of the sequence they paraphrase. Do not render
 * it, and do not delete it.
 */
export type MarketCompliance = {
  readonly heading: string
  readonly body: string
  readonly documents: readonly MarketComplianceDoc[]
}

export type MarketPage = {
  /** Matches a `Market.slug` in `markets.ts`. Enforced by the tests. */
  readonly slug: string
  /** Breadcrumb strip and map panel header, e.g. "DXB → NG". */
  readonly lane: string
  /**
   * The destination's international dialling prefix, e.g. "+234".
   *
   * Used as the phone placeholder on both forms. It reads as a small thing and
   * is not: the person filling the form is in this market, and a placeholder
   * showing their own country's prefix is the difference between a number we
   * can dial and one missing its country code.
   */
  readonly dialCode: string
  /**
   * Quoting currency. Reaches three places: order step 2, the quote form's
   * navy rail and the closing CTA. AED on the GCC lanes, USD on the African
   * ones, EUR where the buyer's own contracts are in euros.
   */
  readonly currency: 'AED' | 'USD' | 'EUR' | 'SAR'
  /**
   * Local-language name, shown in the breadcrumb strip. Omit where English is
   * an official language. Writing direction is DETECTED from the string, never
   * hardcoded per market — see `isRightToLeft`.
   */
  readonly localName?: string
  /**
   * Has this market's regulatory prose been checked by the client's forwarder?
   *
   * The conformity schemes, document owners, sequencing, transit bands and
   * freight ladders on these pages were WRITTEN FOR THE DESIGN. They read as
   * fact, so they have to be checked as fact — a page that misstates a
   * conformity sequence is worse than one that omits it, because a buyer acts
   * on it.
   *
   * Only Saudi Arabia's copy is verbatim from the live site and therefore
   * already client-verified. Everything else is `unverified` until a forwarder
   * signs it off, and `releasedMarketPage` will not serve it — the record sits
   * in the repo, complete and reviewable, and flips on with a one-word edit.
   *
   * Nigeria is the exception: it shipped before this gate existed and is live
   * today. It is marked honestly rather than quietly withdrawn, and it is on
   * the review list like the rest.
   */
  readonly regulatoryCopy: 'verified' | 'unverified'
  /**
   * True once the copy has cleared review AND the market is meant to be
   * public. Separate from `regulatoryCopy` so a market can be held back for a
   * commercial reason without implying its copy is wrong.
   */
  readonly released: boolean
  /** 3–4 sentences on what is DISTINCTIVE about this lane. Never restates the H1. */
  readonly lede: string
  /** Exactly four rows, always these four keys, in this order. */
  readonly facts: readonly [MarketFactRow, MarketFactRow, MarketFactRow, MarketFactRow]
  /** Six pairs. Five looks under-filled, seven crowds. */
  readonly manifest: readonly MarketFactRow[]
  readonly map: MarketMap
  /** Exactly three, fastest-realistic first — row one is styled as the default. */
  readonly freight: readonly [MarketFreightMode, MarketFreightMode, MarketFreightMode]
  /**
   * Steps 3 and 4 of the order sequence. Steps 1 and 2 are global; this pair
   * names the market's actual gating document.
   */
  readonly orderSteps: { readonly third: string; readonly fourth: string }
  /** 12–16. All appear in the gazetteer and the delivery-city select. */
  readonly cities: readonly MarketCity[]
  /** Exactly six, in descending order of relevance TO THIS MARKET. */
  readonly sectors: readonly [
    MarketSector,
    MarketSector,
    MarketSector,
    MarketSector,
    MarketSector,
    MarketSector,
  ]
  /**
   * Minimum eight, all market-specific. These become the FAQPage schema, so
   * they must be real questions with real answers — marketing copy phrased as
   * a question is a structured-data violation, not just bad writing.
   */
  readonly faqs: readonly MarketFaq[]
  /** Source of record for the conformity claims. Never rendered — see above. */
  readonly compliance: MarketCompliance
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared constants — identical on every market page.
// ─────────────────────────────────────────────────────────────────────────────

/** Steps 1 and 2 of the order sequence. `{currency}` is interpolated. */
export const MARKET_ORDER_STEPS = [
  'Send the part numbers, or the bore, thread and pressure if you do not have them. A photo of the failed part is usually enough.',
  'We quote in {currency} against real stock, with the Incoterm stated on the Estimate rather than assumed.',
] as const

/**
 * The four operations panels. Caption three interpolates the market name; the
 * photographs themselves are of the Dubai facility and serve every market.
 */
export const MARKET_OPERATIONS = [
  {
    label: 'Stock',
    caption: 'Stock held in Dubai, not drop-shipped from a factory queue.',
    shot: 'Dubai warehouse — hose and fittings racking',
  },
  {
    label: 'Assembly',
    caption: 'Assemblies crimped and pressure-tested before they are packed.',
    shot: 'Crimping and pressure-test bay, tagged assemblies',
  },
  {
    label: 'Documents',
    caption: 'Conformity set for {market} prepared while the order is picked.',
    shot: 'Conformity dossier, printed set on the desk',
  },
  {
    label: 'Dispatch',
    caption: 'One consignment, one set of documents, tracking on dispatch.',
    shot: 'Loaded trailer at the yard gate',
  },
] as const

/**
 * The market sitemap that closes every market page — 126 destinations in 11
 * regional columns.
 *
 * It stays on every page rather than collapsing to a "see all" link because
 * the reciprocity is the point: each market page carries a link to all 125
 * others, so a market gains 125 internal links the moment it ships, and every
 * existing page gains one.
 *
 * Grouping lives here rather than as a `region` field on `Market` because it
 * is presentational — the column order and the region names are a layout
 * decision, not a fact about the country. `market-pages.test.ts` asserts this
 * list and `MARKETS` name each other exactly, in both directions, so a market
 * added to one and forgotten in the other fails the build rather than
 * silently dropping out of 126 pages' link graphs.
 */
export const MARKET_REGIONS: readonly (readonly [region: string, countries: readonly string[]])[] = [
  ['GCC & Middle East', ['Saudi Arabia', 'Oman', 'Qatar', 'Bahrain', 'Kuwait', 'Iraq']],
  [
    'North Africa',
    ['Egypt', 'Morocco', 'Algeria', 'Libya', 'Tunisia', 'Sudan', 'South Sudan', 'Mauritania'],
  ],
  [
    'East Africa',
    ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Ethiopia', 'Eritrea', 'Djibouti', 'Madagascar', 'Mozambique'],
  ],
  [
    'West & Central Africa',
    [
      'Nigeria',
      'Ghana',
      'Guinea',
      'Ivory Coast',
      'Senegal',
      'Mali',
      'Burkina Faso',
      'Niger',
      'Liberia',
      'Sierra Leone',
      'Cameroon',
      'Chad',
      'Gabon',
      'Republic of the Congo',
      'DR Congo',
      'Equatorial Guinea',
      'Angola',
    ],
  ],
  ['Southern Africa', ['South Africa', 'Namibia', 'Botswana', 'Zambia', 'Zimbabwe']],
  [
    'CIS & Caucasus',
    ['Russia', 'Kazakhstan', 'Uzbekistan', 'Ukraine', 'Belarus', 'Armenia', 'Georgia', 'Azerbaijan', 'Moldova'],
  ],
  [
    'South America',
    ['Chile', 'Peru', 'Bolivia', 'Argentina', 'Colombia', 'Ecuador', 'Guyana', 'Suriname', 'Brazil', 'Venezuela', 'Paraguay', 'Uruguay'],
  ],
  [
    'North America & Caribbean',
    [
      'the United States',
      'Canada',
      'Mexico',
      'Panama',
      'Trinidad and Tobago',
      'Jamaica',
      'the Dominican Republic',
      'Costa Rica',
      'Guatemala',
      'Honduras',
    ],
  ],
  [
    'South-East Asia',
    ['Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'Myanmar', 'Cambodia', 'Laos', 'Brunei', 'Timor-Leste'],
  ],
  [
    'Western & Northern Europe',
    [
      'the United Kingdom',
      'Norway',
      'the Netherlands',
      'Germany',
      'France',
      'Italy',
      'Spain',
      'Portugal',
      'Ireland',
      'Belgium',
      'Luxembourg',
      'Denmark',
      'Sweden',
      'Finland',
      'Iceland',
      'Austria',
      'Switzerland',
    ],
  ],
  [
    'Central & South-East Europe',
    [
      'Poland',
      'Czechia',
      'Slovakia',
      'Hungary',
      'Romania',
      'Bulgaria',
      'Greece',
      'Cyprus',
      'Malta',
      'Turkey',
      'Croatia',
      'Slovenia',
      'Serbia',
      'Bosnia and Herzegovina',
      'North Macedonia',
      'Montenegro',
      'Albania',
      'Kosovo',
      'Estonia',
      'Latvia',
      'Lithuania',
    ],
  ],
]

/** Total destinations across every region — the count printed in the kicker. */
export function marketDestinationCount(): number {
  return MARKET_REGIONS.reduce((total, [, list]) => total + list.length, 0)
}

export type MarketStandard = {
  readonly standard: string
  readonly types: string
  readonly appliesTo: string
}

/** Global. Only the sentence under the tariff list names the country. */
export const MARKET_STANDARDS: readonly MarketStandard[] = [
  { standard: 'EN 853', types: '1SN · 2SN', appliesTo: 'Wire-braid hydraulic hose' },
  { standard: 'EN 856', types: '4SP · 4SH', appliesTo: 'Spiral-wire hydraulic hose' },
  { standard: 'EN 857', types: '1SC · 2SC', appliesTo: 'Compact wire-braid hose' },
  { standard: 'SAE J517', types: '100R1 · R2 · R12 · R13 · R15', appliesTo: 'SAE hydraulic hose series' },
  { standard: 'ISO 18752', types: 'Grades A–D', appliesTo: 'Performance-based hose classification' },
  { standard: 'API 16C', types: 'Choke & kill', appliesTo: 'Well control flexible lines' },
  { standard: 'API 7K', types: 'Rotary & vibrator', appliesTo: 'Drilling hose' },
  { standard: 'API 6A', types: 'PSL 1–4', appliesTo: 'Wellhead equipment' },
  { standard: 'DIN 2353', types: 'L · S series', appliesTo: 'Bite-type tube couplings' },
  { standard: 'ISO 8434-1', types: '24° cone', appliesTo: 'Metric tube connections' },
  { standard: 'ISO 6162 / 12151', types: 'Code 61 · 62', appliesTo: 'SAE flange and hose connections' },
  { standard: 'EN 14420-5', types: 'Clamped', appliesTo: 'Industrial hose couplings' },
  { standard: 'NACE MR0175', types: 'ISO 15156', appliesTo: 'Sour-service materials' },
  { standard: 'ISO 9001:2015', types: 'Certified', appliesTo: 'Quality management system' },
]

export type MarketTariffLine = {
  readonly hsCode: string
  readonly description: string
  readonly useCase: string
}

/** Global. Classification is confirmed line by line at quotation. */
export const MARKET_TARIFF_LINES: readonly MarketTariffLine[] = [
  { hsCode: '4009.22', description: 'Rubber tube, reinforced with metal, with fittings', useCase: 'Hydraulic hose assemblies' },
  { hsCode: '4009.42', description: 'Rubber tube, reinforced with other materials, with fittings', useCase: 'Industrial hose assemblies' },
  { hsCode: '7307.91', description: 'Flanges, iron or steel', useCase: 'SAE and API flanges' },
  { hsCode: '7307.99', description: 'Tube and pipe fittings, iron or steel', useCase: 'Adapters, nipples, couplings' },
  { hsCode: '8481.80', description: 'Taps, cocks, valves and similar appliances', useCase: 'Ball, gate, butterfly, needle' },
  { hsCode: '8413.60', description: 'Rotary positive displacement pumps', useCase: 'Gear and vane pumps' },
  { hsCode: '8412.21', description: 'Hydraulic power engines, linear acting', useCase: 'Cylinders' },
  { hsCode: '3403.99', description: 'Lubricating preparations', useCase: 'Greases, pastes, compounds' },
]

/** Application photography brief per sector, for the industry card image slot. */
export const MARKET_SECTOR_SHOTS: Record<MarketSectorSlug, string> = {
  'oil-gas': 'Wellhead christmas tree with control panel',
  marine: 'Deck crane and mooring winch, quayside',
  power: 'Turbine governor actuator, plant room',
  construction: 'Excavator boom cylinder on site',
  steel: 'Rolling mill stand, hot line',
  mining: 'Open-pit haul truck, hydraulic service',
}

/** Incoterms offered on the quote form, in the order a buyer meets them. */
export const MARKET_INCOTERM_OPTIONS = [
  'DAP — to our site',
  'CIF',
  'FOB Jebel Ali',
  'EXW Dubai',
  'Advise us',
] as const

/**
 * "Needed by". The most commercially useful field on the form — it is the one
 * that decides whether an enquiry is a shutdown or a budget exercise, so it
 * is stored on the RFQ rather than buried in the message body.
 */
export const MARKET_URGENCY_OPTIONS = [
  'From stock — urgent',
  'Within a week',
  'Planned shutdown',
  'Budgetary only',
] as const

export type MarketUrgencyOption = (typeof MARKET_URGENCY_OPTIONS)[number]

// ─────────────────────────────────────────────────────────────────────────────
// Records
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every written record, keyed by slug — released or not.
 *
 * This is the review surface: the tests run against all 46, so a record that
 * is still waiting on its forwarder sign-off is held to exactly the same
 * contract as one that is live. Use `releasedMarketPage` for anything that
 * renders.
 */
export const MARKET_PAGES: Readonly<Record<string, MarketPage>> = Object.fromEntries(
  ALL_MARKET_PAGE_RECORDS.map((page) => [page.slug, page])
)

/** Raw lookup, ignoring the release gate. For tests and admin tooling. */
export function marketPageBySlug(slug: string): MarketPage | undefined {
  return MARKET_PAGES[slug]
}

/**
 * The record the ROUTE should render, or undefined.
 *
 * Everything customer-facing goes through here. A market whose regulatory
 * prose has not been checked by a forwarder falls back to the plain layout,
 * which makes no conformity claims beyond what `markets.ts` already carries —
 * so the failure mode of an un-reviewed market is a smaller page, never a
 * wrong one.
 */
export function releasedMarketPage(slug: string): MarketPage | undefined {
  const page = MARKET_PAGES[slug]
  return page?.released ? page : undefined
}

/** Slugs the route should statically generate the designed page for. */
export function releasedMarketPageSlugs(): string[] {
  return ALL_MARKET_PAGE_RECORDS.filter((p) => p.released).map((p) => p.slug)
}

/** Written but held back — the queue a forwarder review works through. */
export function pendingMarketPageSlugs(): string[] {
  return ALL_MARKET_PAGE_RECORDS.filter((p) => !p.released).map((p) => p.slug)
}

export function marketPageSlugs(): string[] {
  return ALL_MARKET_PAGE_RECORDS.map((p) => p.slug)
}

// ─────────────────────────────────────────────────────────────────────────────
// Derived values — never authored, always computed from the record above.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format `[lon, lat]` for the gazetteer: `4.82°N 7.01°E`.
 *
 * Hemisphere-aware, and a bare `0°` on the meridian and the equator because
 * "0.00°N" is not a thing anyone writes. Formatting happens here rather than
 * in the data so the same pair can drive both the label and the projection.
 */
export function formatCoordinates([lon, lat]: LonLat): string {
  return `${formatDegree(lat, 'N', 'S')} ${formatDegree(lon, 'E', 'W')}`
}

function formatDegree(value: number, positive: string, negative: string): string {
  if (value === 0) return '0°'
  return `${Math.abs(value).toFixed(2)}°${value < 0 ? negative : positive}`
}

/**
 * The comparable number inside a transit string — the LAST integer, so
 * "26–32 days" scores 32 and "4–6 days" scores 6. Comparing on the slow end is
 * deliberate: a freight bar is a promise about the worst case.
 *
 * Returns 1 for an unparseable string so a bad row renders as a stub rather
 * than dividing by zero.
 */
export function transitScore(transit: string): number {
  const numbers = transit.match(/\d+/g)
  if (!numbers || numbers.length === 0) return 1
  return Number(numbers[numbers.length - 1])
}

/**
 * Bar widths for the freight ladder, as percentages of the slowest mode.
 *
 * Derived rather than authored so a copy edit to a transit string can never
 * leave the bars saying something the numbers next to them contradict.
 */
export function freightBarPercents(modes: readonly MarketFreightMode[]): number[] {
  const scores = modes.map((m) => transitScore(m.transit))
  const slowest = Math.max(...scores, 1)
  return scores.map((s) => (s / slowest) * 100)
}

/**
 * Should this string be laid out right-to-left?
 *
 * Answered from the codepoints, never stored per market — the same field carries
 * Arabic, Amharic, Swahili, Portuguese and French across the record set, and a
 * per-market flag is one more thing to get wrong when a market is added.
 */
export function isRightToLeft(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/.test(text)
}

/** Order sequence with step 2's currency resolved. Always four steps. */
export function marketOrderSequence(page: MarketPage): string[] {
  return [
    MARKET_ORDER_STEPS[0],
    MARKET_ORDER_STEPS[1].replace('{currency}', page.currency),
    page.orderSteps.third,
    page.orderSteps.fourth,
  ]
}

/** The one route drawn as the corridor. Falls back to the first if none is flagged. */
export function primaryRoute(map: MarketMap): MarketRoute {
  return map.routes.find((r) => r.primary) ?? map.routes[0]
}
