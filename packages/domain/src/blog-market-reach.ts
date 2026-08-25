/**
 * The "where we deliver this" section that closes every blog article.
 *
 * WHAT PROBLEM THIS SOLVES
 *
 * The catalogue ships from one Dubai warehouse to 126 countries and the blog
 * is read from most of them, but an article said nothing about that. A reader
 * in Accra, Almaty or Aberdeen reached the end of a piece on hose failure with
 * no signal that the parts described in it are something we send to them. The
 * markets section carries that message on 126 pages nobody arrives at first.
 *
 * WHY THIS IS GENERATED RATHER THAN WRITTEN PER ARTICLE
 *
 * Ninety-three hand-written delivery paragraphs would drift: one would promise
 * a transit time, one would imply a branch abroad, and both would be wrong in
 * the way `markets.ts` spends its header warning about. Generating the section
 * from a per-category profile means the honesty rules are enforced in one
 * place and tested once — see `blog-market-reach.test.ts`, which asserts that
 * no generated body contains a bare day count or the word "local".
 *
 * WHY IT IS NOT THE SAME EIGHT LINKS ON ALL 93 ARTICLES
 *
 * That shape is the doorway-page pattern the Al Feel teardown identifies as
 * the reason a competitor's country pages do not rank, and the blog's own
 * `page_link` budget was capped at twelve articles to avoid it. Three things
 * keep this from being that:
 *
 *   1. The prose is per category and about the *work*, not the destination.
 *      Eleven paragraphs, each true of the articles it appears on.
 *   2. The regions rotate. A profile lists more candidate regions than it
 *      shows, and each article takes a different window into that list, so
 *      seventeen `machine-down` articles do not carry seventeen identical
 *      blocks.
 *   3. The countries rotate within the region too. Link equity spreads across
 *      the market set rather than piling onto the same six pages.
 *
 * Rotation is deterministic — derived from the article slug, never random —
 * because an import must produce identical blocks on every run or every
 * re-import shows as a content diff.
 */
import { MARKETS } from './markets'
import { MARKET_REGIONS } from './market-pages'

import type { MarketReachBlock } from './blog-blocks'

/**
 * Destinations withheld from generated marketing copy.
 *
 * A market page exists for each of these and stays reachable — the index
 * deliberately links all 126, and unlinking a live page would orphan it. This
 * list is narrower than that: it governs only where we *advertise*, and an
 * automatically generated "we deliver here" line naming a comprehensively
 * sanctioned destination is a claim worth not making on 93 pages at once.
 *
 * Same seven the markets design handoff held back. The nearest existing
 * precedent is the `lane routing through sanctioned territory` block in
 * apps/web/src/lib/market-geometry.test.ts, which refuses to draw a surface
 * route across Iran, Russia or Belarus; keep the two in mind together, since
 * neither is derived from the other. Flag to the founder rather than treating
 * as settled: this is a commercial and legal call, not a technical one.
 */
export const REACH_EXCLUDED_MARKET_SLUGS: readonly string[] = [
  'russia',
  'belarus',
  'libya',
  'sudan',
  'south-sudan',
  'venezuela',
  'myanmar',
]

export type MarketReachProfile = {
  heading: string
  /** Plain text. No transit times, no foreign premises, no local stock. */
  body: string
  /**
   * Always shown, always first. The home lane — every article's nearest and
   * most-shipped destinations, whatever its subject.
   */
  primaryRegion: string
  /**
   * Candidate regions in priority order. Each article shows a window of
   * `ROTATING_REGIONS_PER_ARTICLE` from this list, offset by its slug, so a
   * large category covers far more of the world than any one article claims.
   */
  rotatingRegions: readonly string[]
}

/** Regions shown besides the pinned primary. Four rows total per block. */
const ROTATING_REGIONS_PER_ARTICLE = 3

/** Countries named per region. Twelve links a block, as text rather than tiles. */
const MARKETS_PER_REGION = 3

/**
 * One profile per blog category.
 *
 * The body is the part that has to be *true of every article in the category*,
 * which is why it talks about how that class of work ships rather than about
 * the article's specific subject. A paragraph that tried to be specific would
 * either be wrong on some of its seventeen articles or say nothing.
 */
export const MARKET_REACH_PROFILES: Readonly<Record<string, MarketReachProfile>> = {
  'failure-analysis': {
    heading: 'Where we send the replacement',
    body: 'A failure correctly diagnosed is only worth something if the replacement can reach the machine. Assemblies built to the specification described here are made up and pressure-tested at our Dubai workshop and dispatched with the crimp record and test certificate travelling with them, which counts for more the further the machine sits from a hose shop. Most orders of this kind start as a photograph and a measurement rather than a part number, and that is enough for us to quote from.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'CIS & Caucasus',
      'Western & Northern Europe',
    ],
  },
  'fitting-identification': {
    heading: 'Where we send the adapter',
    body: 'An identified thread usually becomes a small parcel rather than a pallet, and small parcels are the least complicated thing we ship. Adapters, bonded seals and test-point fittings leave Dubai by courier on their own airway bill, so the destination changes the paperwork and the transit rather than the decision to order at all. Send the photograph and the measurements this article describes and we will name the part before we quote it.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Western & Northern Europe',
      'North America & Caribbean',
      'East Africa',
      'West & Central Africa',
      'South-East Asia',
      'Central & South-East Europe',
    ],
  },
  'gulf-conditions': {
    heading: 'Where these conditions apply, and where we ship',
    body: 'Heat, salt and airborne sand are not a UAE problem. They set hose life across the whole arc from the Atlantic coast of Africa to the Arabian Sea and on into monsoon Asia, and the cover and fitting arguments in this article travel with them. We supply into those markets from Dubai by road, sea and air, and quote the construction against the conditions at the destination rather than against ours.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'North Africa',
      'East Africa',
      'West & Central Africa',
      'South-East Asia',
      'Southern Africa',
    ],
  },
  'hose-assembly': {
    heading: 'Where the finished assemblies go',
    body: 'Assemblies are cut to length in Dubai, crimped, tagged, pressure-tested and crated, and that is exactly what makes them practical to send somewhere with no hose shop of its own. A batch built to a measured list travels as one consignment with its test records and arrives ready to fit rather than ready to be made up. The further the site, the larger that difference gets.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'CIS & Caucasus',
      'South-East Asia',
      'North Africa',
    ],
  },
  'industrial-hose': {
    heading: 'Where we supply this hose',
    body: 'For chemical, food-grade, steam and water hose the certificate is most of what the buyer is actually purchasing, so it is prepared before dispatch rather than chased afterwards. We ship this class of hose from Dubai into plants audited against the same standards we quote to, with the documentation attached to the consignment and referenced on the invoice.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'North Africa',
      'East Africa',
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
    ],
  },
  'machine-down': {
    heading: 'Where we send parts for this machine',
    body: 'A stopped machine in a yard with no hose shop nearby is the situation this catalogue is stocked for. We build the assemblies to the measurements described here and dispatch them from Dubai — by air where the machine is down, by sea where the change is planned. Fleet operators usually send us the machine and the hose position rather than a part number, which is enough to work from.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Southern Africa',
      'South-East Asia',
      'North Africa',
      'CIS & Caucasus',
    ],
  },
  'maintenance-reliability': {
    heading: 'Where we support programmes like this',
    body: 'A hose register or a planned replacement programme is easier to run against one supplier than against whatever happens to be available near the site that month, and that is most of why operators outside the UAE set one up with us. The parts list is held against your machines, quoted as a single package, and shipped from Dubai to a date you set rather than to a dispatch date.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Southern Africa',
      'East Africa',
      'CIS & Caucasus',
      'Western & Northern Europe',
      'West & Central Africa',
      'South-East Asia',
    ],
  },
  'oilfield-pressure-control': {
    heading: 'Where this equipment ships',
    body: 'API-rated hose and pressure-control equipment is supplied against the certification the operator is audited to, with mill and test documentation travelling alongside the goods. We ship it from Dubai into the basins that buy it, and on these lanes it is the paperwork rather than the freight that usually sets the timeline — which is the part worth planning around.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'West & Central Africa',
      'CIS & Caucasus',
      'South America',
      'North America & Caribbean',
      'North Africa',
    ],
  },
  'procurement-export': {
    heading: 'Where we quote and ship',
    body: 'This is an export business run out of one warehouse rather than a network of branches, so the answer to "do you supply my country" is nearly always yes and the real questions are Incoterm, transit and documentation. We quote in AED or USD, ship EXW, FOB, CIF or DAP as the buyer prefers, and prepare certificates of origin and conformity before the consignment leaves. The lanes below are the ones that move most often.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'East Africa',
      'West & Central Africa',
      'Western & Northern Europe',
      'North America & Caribbean',
      'South-East Asia',
      'Southern Africa',
    ],
  },
  safety: {
    heading: 'Where we supply the safety-critical parts',
    body: 'Whip restraints, guarding and correctly rated assemblies are the items an audit asks about, and they are also the hardest things to find in a hurry away from a major supply centre. We ship them from Dubai with the rating documentation attached, so a corrective action closes against evidence rather than against a purchase order.',
    primaryRegion: 'GCC & Middle East',
    rotatingRegions: [
      'Southern Africa',
      'Western & Northern Europe',
      'North America & Caribbean',
      'East Africa',
      'South-East Asia',
    ],
  },
  'specification-standards': {
    heading: 'Where we supply to this standard',
    body: 'SAE, EN, DIN and ISO specifications are the common language of this trade precisely because they do not change at a border — 2SC means the same construction in Rotterdam as it does in Ras Al Khaimah. We supply against the standard quoted rather than against a brand, with the layline and the test certificate as the evidence, and ship from Dubai to wherever the drawing was written.',
    primaryRegion: 'GCC & Middle East',
    // Four, not six. A rotating list is drawn three at a time, so every extra
    // candidate dilutes the two that matter here: standards content is what
    // pulls a European or North American engineer to a Dubai supplier in the
    // first place, and burying it behind East Africa and the Caucasus for
    // breadth's sake spends the slot on a reader who was never going to click.
    rotatingRegions: [
      'Western & Northern Europe',
      'North America & Caribbean',
      'Central & South-East Europe',
      'South-East Asia',
    ],
  },
}

/**
 * The closing line, identical everywhere.
 *
 * It is the same sentence on all 93 deliberately. The hub link is the piece of
 * this feature that does the structural work — one link per article into
 * `/markets` distributes far better than 93 articles each guessing at twelve
 * destinations, and it is the honest answer to a reader whose country is not
 * in the four rows above.
 */
export const MARKET_REACH_FOOTNOTE =
  'Everything above ships from the same Dubai warehouse. If your destination is not listed, it is almost certainly still one we quote.'

// ─────────────────────────────────────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FNV-1a over the slug. Any stable hash would do; what matters is that it is
 * computed here rather than taken from `Math.random` or an array index, so the
 * same article yields the same block on every import and a re-import is a
 * no-op instead of a diff.
 */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/** Region name to its shippable market slugs, in the order the region lists them. */
function regionMarkets(): Map<string, Array<{ slug: string; name: string }>> {
  const bySlug = new Map(MARKETS.map((m) => [m.name, m.slug]))
  const excluded = new Set(REACH_EXCLUDED_MARKET_SLUGS)
  const out = new Map<string, Array<{ slug: string; name: string }>>()
  for (const [region, names] of MARKET_REGIONS) {
    const rows: Array<{ slug: string; name: string }> = []
    for (const name of names) {
      const slug = bySlug.get(name)
      // A name MARKETS does not carry is a data error, not something to render.
      // `market-pages.test.ts` already fails on that, so drop it quietly here.
      if (!slug || excluded.has(slug)) continue
      rows.push({ slug, name })
    }
    out.set(region, rows)
  }
  return out
}

const REGION_MARKETS = regionMarkets()

/** Every region this module can name, for tests and admin tooling. */
export function marketReachRegions(): string[] {
  return [...REGION_MARKETS.keys()]
}

/** `count` items from `items`, starting at `offset`, wrapping. */
function window<T>(items: readonly T[], offset: number, count: number): T[] {
  if (items.length === 0) return []
  const take = Math.min(count, items.length)
  const start = ((offset % items.length) + items.length) % items.length
  return Array.from({ length: take }, (_, i) => items[(start + i) % items.length]!)
}

/**
 * The block for one article, or null when its category has no profile.
 *
 * Returning null rather than falling back to a default is deliberate: a new
 * blog category should reach a human who decides what is true of it, not
 * inherit the procurement paragraph by accident.
 */
export function buildMarketReachBlock(
  articleSlug: string,
  categorySlug: string
): MarketReachBlock | null {
  const profile = MARKET_REACH_PROFILES[categorySlug]
  if (!profile) return null

  const seed = hash(articleSlug)

  const regions = [
    profile.primaryRegion,
    ...window(profile.rotatingRegions, seed, ROTATING_REGIONS_PER_ARTICLE),
  ]

  const groups = regions
    .map((region) => {
      const available = REGION_MARKETS.get(region) ?? []
      // Slot one is pinned to the region's leading destination; only the other
      // two rotate.
      //
      // Rotating all three read badly and sold nothing: an article offering
      // "Brunei, Timor-Leste, Singapore" or "Guatemala, Honduras, the United
      // States" buries the lane a reader is likely to be on under the two
      // smallest markets in the region. MARKET_REGIONS is already written in
      // commercial order — Saudi Arabia, Nigeria, the United States, South
      // Africa each lead their region — so pinning the head keeps the row
      // credible while the tail still spreads links across the market set.
      const [lead, ...rest] = available
      if (!lead) return { region, markets: [] }
      const markets = [
        lead,
        ...window(rest, hash(`${articleSlug}:${region}`), MARKETS_PER_REGION - 1),
      ]
      return { region, markets }
    })
    .filter((g) => g.markets.length > 0)

  if (groups.length === 0) return null

  return {
    type: 'market_reach',
    heading: profile.heading,
    body: profile.body,
    groups,
    footnote: MARKET_REACH_FOOTNOTE,
  }
}
