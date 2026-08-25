/**
 * The delivery-reach engine, shared by every surface that says "where we
 * deliver this".
 *
 * Extracted from `blog-market-reach.ts` when the same section was added to
 * service cases and industry pages. Only the *profiles* differ between the
 * three — the honesty rules, the exclusion list, the rotation and the pinned
 * lead market are one implementation on purpose. Three copies of a rotation
 * rule is three places for a sanctioned destination to reappear.
 *
 * WHAT A PROFILE OWES ITS SURFACE
 *
 * A profile's body has to be true of *every* page it appears on, which is why
 * they are written per category rather than per page: a paragraph that tried
 * to be specific would either be wrong on some of its pages or say nothing.
 * And it has to obey `markets.ts` — no transit times, no premises abroad, no
 * local-stock claims. That last one is not a style preference. It is enforced
 * by `market-reach.test.ts` over every profile on every surface, because a
 * false claim generated onto 120 pages is not a copy error, it is a thing
 * customers quote back at you.
 */
import { MARKETS } from './markets'
import { MARKET_REGIONS } from './market-pages'

/**
 * Destinations withheld from generated marketing copy.
 *
 * A market page exists for each of these and stays reachable — the index
 * deliberately links all 126, and unlinking a live page would orphan it. This
 * list is narrower than that: it governs only where we *advertise*, and an
 * automatically generated "we deliver here" line naming a comprehensively
 * sanctioned destination is a claim worth not making across the site at once.
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
   * Always shown, always first. The home lane — the nearest and most-shipped
   * destinations, whatever the page's subject.
   */
  primaryRegion: string
  /**
   * Candidate regions in priority order. Each page shows a window of
   * `ROTATING_REGIONS_PER_PAGE` from this list, offset by its own seed, so a
   * large category covers far more of the world than any one page claims.
   *
   * A rotating list is drawn three at a time, so every extra candidate
   * DILUTES the ones that matter — frequency is roughly 3/length. To give a
   * region more weight, shorten this list rather than reordering it: the
   * window wraps, so position barely affects how often a region appears.
   */
  rotatingRegions: readonly string[]
}

/** What a surface renders. Deliberately not a block type — see the callers. */
export type MarketReach = {
  heading: string
  body: string
  groups: Array<{ region: string; markets: Array<{ slug: string; name: string }> }>
  footnote: string
}

/** Regions shown besides the pinned primary. Four rows total. */
const ROTATING_REGIONS_PER_PAGE = 3

/** Countries named per region. Twelve links a section, as text rather than tiles. */
const MARKETS_PER_REGION = 3

/**
 * The closing line, identical everywhere.
 *
 * It is the same sentence on every page deliberately. The hub link the
 * renderer adds after it is the piece of this feature that does the
 * structural work — one link per page into `/markets` distributes far better
 * than a hundred pages each guessing at twelve destinations, and it is the
 * honest answer to a reader whose country is not in the four rows above.
 */
export const MARKET_REACH_FOOTNOTE =
  'Everything above ships from the same Dubai warehouse. If your destination is not listed, it is almost certainly still one we quote.'

// ─────────────────────────────────────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FNV-1a over the seed. Any stable hash would do; what matters is that it is
 * computed here rather than taken from `Math.random` or an array index, so the
 * same page yields the same section on every render and — for the blog, where
 * the result is stored — a re-import is a no-op instead of a content diff.
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
function pickWindow<T>(items: readonly T[], offset: number, count: number): T[] {
  if (items.length === 0) return []
  const take = Math.min(count, items.length)
  const start = ((offset % items.length) + items.length) % items.length
  return Array.from({ length: take }, (_, i) => items[(start + i) % items.length]!)
}

/**
 * The reach section for one page, or null when the profile is missing or names
 * only regions that have no shippable destinations left in them.
 *
 * `seed` is whatever makes this page different from its siblings — an article
 * slug, a service case slug, an industry slug. Two pages sharing a profile and
 * a seed get identical sections, which is correct: the seed IS the identity.
 */
export function buildMarketReach(
  seed: string,
  profile: MarketReachProfile | undefined
): MarketReach | null {
  if (!profile) return null

  const regions = [
    profile.primaryRegion,
    ...pickWindow(profile.rotatingRegions, hash(seed), ROTATING_REGIONS_PER_PAGE),
  ]

  const groups = regions
    .map((region) => {
      const available = REGION_MARKETS.get(region) ?? []
      // Slot one is pinned to the region's leading destination; only the other
      // two rotate.
      //
      // Rotating all three read badly and sold nothing: a page offering
      // "Brunei, Timor-Leste, Singapore" or "Guatemala, Honduras, the United
      // States" buries the lane a reader is likely on under the two smallest
      // markets in the region. MARKET_REGIONS is already written in commercial
      // order — Saudi Arabia, Nigeria, the United States, South Africa each
      // lead their region — so pinning the head keeps the row credible while
      // the tail still spreads links across the market set.
      const [lead, ...rest] = available
      if (!lead) return { region, markets: [] }
      const markets = [lead, ...pickWindow(rest, hash(`${seed}:${region}`), MARKETS_PER_REGION - 1)]
      return { region, markets }
    })
    .filter((g) => g.markets.length > 0)

  if (groups.length === 0) return null

  return {
    heading: profile.heading,
    body: profile.body,
    groups,
    footnote: MARKET_REACH_FOOTNOTE,
  }
}
