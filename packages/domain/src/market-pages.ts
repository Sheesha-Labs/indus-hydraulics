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
   * The destination's conformity scheme, named in the meta description.
   * Omit rather than invent one where the market has none worth naming.
   */
  readonly conformityScheme?: string
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

const NIGERIA: MarketPage = {
  slug: 'nigeria',
  lane: 'DXB → NG',
  dialCode: '+234',
  currency: 'USD',
  conformityScheme: 'SONCAP',
  lede:
    'Nigeria is the longest lane we run and the one with the most paperwork in front of it. Containers sail from Jebel Ali around the Cape of Good Hope to Onne or Lagos, which is why transit is measured in weeks rather than days. Before any of that, the order needs a Form M raised through the buyer’s bank and a SONCAP certificate issued at origin. Neither can be done retrospectively, so the part list has to be right early.',
  facts: [
    { label: 'Typical transit', value: 'Typically 26–32 days by sea from dispatch' },
    {
      label: 'Freight',
      value:
        'Sea freight from Jebel Ali to Onne for oilfield cargo · Lagos, Apapa and Tin Can for general cargo · Air freight into Lagos or Port Harcourt where the schedule is tighter',
    },
    {
      label: 'Incoterms 2020',
      value: 'CIF Onne or Lagos · DAP to the buyer’s site · FOB Jebel Ali · EXW Dubai for a nominated forwarder',
    },
    {
      label: 'Documentation',
      value:
        'Form M raised through the buyer’s bank · SONCAP Product Certificate and SONCAP Certificate before shipment · PAAR from Nigeria Customs · Certificate of Origin, Dubai Chamber attested',
    },
  ],
  manifest: [
    { label: 'Origin', value: 'Jebel Ali · Dubai' },
    { label: 'Primary mode', value: 'Sea, via the Cape' },
    { label: 'Port of entry', value: 'Onne · Port Harcourt' },
    { label: 'Transit', value: '26–32 days' },
    { label: 'Quoted in', value: 'USD' },
    { label: 'Docs prepared', value: 'Before the vessel sails' },
  ],
  map: {
    geoNames: ['Nigeria'],
    fit: 'crossing',
    origin: [55.03, 25.01],
    originLabel: 'JEBEL ALI · DXB',
    crossing: { name: 'ONNE · PORT', coords: [7.15, 4.7], legend: 'Port of entry', dx: 12, dy: 10, anchor: 'start' },
    routes: [
      {
        mode: 'SEA VIA THE CAPE',
        primary: true,
        points: [
          [55.03, 25.01],
          [56.6, 26.55],
          [59.9, 22.3],
          [57.0, 15.5],
          [52.0, 8.0],
          [45.0, -2.0],
          [42.0, -10.0],
          [37.0, -22.0],
          [30.0, -33.0],
          [20.0, -35.5],
          [12.0, -30.0],
          [10.0, -20.0],
          [11.0, -10.0],
          [8.0, -3.0],
          [4.5, 3.0],
          [7.15, 4.7],
        ],
      },
      {
        mode: 'AIR',
        points: [
          [55.36, 25.25],
          [40.0, 15.0],
          [20.0, 8.0],
          [3.32, 6.58],
        ],
      },
    ],
  },
  freight: [
    { name: 'Sea, FCL', transit: '26–32 days', route: 'Jebel Ali to Onne or Lagos, via the Cape', useCase: 'Default for most orders' },
    { name: 'Air freight', transit: '4–6 days', route: 'DXB to LOS or PHC', useCase: 'When the line is down' },
    { name: 'Sea, LCL', transit: '30–38 days', route: 'Consolidated, with transshipment', useCase: 'Small mixed orders' },
  ],
  orderSteps: {
    third:
      'Once the Form M is in place, the SONCAP certification and shipping documents are arranged before the container is loaded.',
    fourth: 'Goods sail from Jebel Ali, and you get the paperwork and tracking together.',
  },
  cities: [
    { name: 'Lagos', coords: [3.39, 6.45], region: 'Lagos State', plot: true, dx: -9, dy: 4, anchor: 'end' },
    { name: 'Ibadan', coords: [3.9, 7.38], region: 'Oyo State', plot: true, dx: -9, dy: -4, anchor: 'end' },
    { name: 'Abuja', coords: [7.49, 9.06], region: 'Federal Capital Territory', plot: true, dx: 9, dy: -6 },
    { name: 'Kano', coords: [8.52, 12.0], region: 'Kano State', plot: true, dx: 9, dy: 4 },
    { name: 'Kaduna', coords: [7.44, 10.52], region: 'Kaduna State', plot: true, dx: -9, dy: 4, anchor: 'end' },
    { name: 'Warri', coords: [5.75, 5.52], region: 'Delta State', plot: true, dx: -9, dy: 8, anchor: 'end' },
    { name: 'Calabar', coords: [8.32, 4.98], region: 'Cross River State', plot: true, dx: 9, dy: 4 },
    { name: 'Port Harcourt', coords: [7.01, 4.82], region: 'Rivers State' },
    { name: 'Onne', coords: [7.15, 4.7], region: 'Rivers State' },
    { name: 'Bonny', coords: [7.17, 4.45], region: 'Rivers State' },
    { name: 'Eket', coords: [7.94, 4.64], region: 'Akwa Ibom State' },
    { name: 'Uyo', coords: [7.93, 5.04], region: 'Akwa Ibom State' },
    { name: 'Yenagoa', coords: [6.27, 4.92], region: 'Bayelsa State' },
    { name: 'Escravos', coords: [5.2, 5.62], region: 'Delta State' },
    { name: 'Sapele', coords: [5.68, 5.89], region: 'Delta State' },
    { name: 'Benin City', coords: [5.63, 6.34], region: 'Edo State' },
  ],
  sectors: [
    {
      slug: 'oil-gas',
      name: 'Oil & Gas',
      description:
        'Wellhead, BOP, flow iron and choke-and-kill support for swamp, land and deepwater operations.',
    },
    {
      slug: 'marine',
      name: 'Marine & Offshore',
      description: 'Deck machinery and vessel hydraulics for the offshore support fleet at Onne and Lagos.',
    },
    {
      slug: 'power',
      name: 'Power & Energy',
      description: 'Actuator and governor hydraulics for gas turbine plant and independent generation.',
    },
    {
      slug: 'construction',
      name: 'Construction',
      description: 'Excavator, crane and batching-plant hydraulics for infrastructure contracts.',
    },
    {
      slug: 'steel',
      name: 'Steel & Metals',
      description: 'High-force cylinders and servo valves for rolling and forming lines.',
    },
    {
      slug: 'mining',
      name: 'Mining',
      description: 'Dust-rated, high-cycle components for cement, quarry and processing plant.',
    },
  ],
  faqs: [
    {
      question: 'Do you have a branch in Nigeria?',
      answer:
        'No. Nigeria is supplied from our Dubai warehouse, with the SONCAP certification done at origin before the container is loaded.',
    },
    {
      question: 'What is SONCAP and who arranges it?',
      answer:
        'The Standards Organisation of Nigeria conformity programme. An accredited firm issues a Product Certificate against the goods, and SON issues the SONCAP certificate customs will ask for. We arrange both from the part numbers on the order.',
    },
    {
      question: 'What do you need from us before shipping?',
      answer:
        'The Form M, raised through your bank. Nothing moves without it, and the PAAR that customs issues is tied to it.',
    },
    {
      question: 'Why does sea freight take a month?',
      answer:
        'Because the routing is around the Cape of Good Hope rather than through the Red Sea. It is a long lane, which is why the conformity work costs nothing in time if it is done while the order is picked.',
    },
    {
      question: 'Can you supply Nigerian content requirements?',
      answer:
        'We supply the goods and the certification. Where a tender requires Nigerian content, we quote through a locally registered partner rather than claiming a status we do not hold.',
    },
    {
      question: 'Can you deliver to Warri, Eket and the swamp locations?',
      answer:
        'Yes, on DAP terms to the base or the site gate. The leg beyond Onne or Warri is quoted rather than estimated.',
    },
    {
      question: 'What currency do you quote in?',
      answer:
        'USD. The Form M and the letter of credit are raised in the same currency, so quoting in anything else creates work for your bank.',
    },
    {
      question: 'Can you supply API-monogrammed equipment?',
      answer:
        'Yes. API 6A wellhead, API 16A BOP, API 16C choke and kill and API 7K drilling hose, with NACE MR0175 material documentation where the contract requires it.',
    },
  ],
}

/**
 * Every market with a designed page. Keyed by slug for O(1) lookup; the route
 * falls back to the plain layout for any market not listed here.
 *
 * 45 further records are written and waiting in the design bundle
 * (`design_handoff_market_page/market-data.jsx`). They land one at a time as
 * each market's regulatory copy clears review — see the docblock at the top.
 */
export const MARKET_PAGES: Readonly<Record<string, MarketPage>> = {
  nigeria: NIGERIA,
}

export function marketPageBySlug(slug: string): MarketPage | undefined {
  return MARKET_PAGES[slug]
}

export function marketPageSlugs(): string[] {
  return Object.keys(MARKET_PAGES)
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
