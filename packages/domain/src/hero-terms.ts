/**
 * The rotating half of the homepage headline.
 *
 * The headline reads "<country possessive> premier supplier of <term>", where
 * the term swaps every few seconds. `hero-geo.ts` owns the first half.
 *
 * ## The rule every entry has to clear
 *
 * A term may appear here only when it has its own published page, a heading on
 * that page matching the term, and enough live stock to survive the click. A
 * word in the hero is a claim about what we sell, shown to someone deciding in
 * a few seconds whether to bother with us — so a term that leads to a thin or
 * mismatched page costs more than never saying it.
 *
 * That rule is why several categories the founder asked for are absent:
 *
 *   - "chemical hoses" (14) and "air hoses" (25) are buried inside combined
 *     categories named something else.
 *   - "marine hoses" has no category and no products. Dropped by the founder
 *     on 2026-08-22 rather than pointed somewhere approximate.
 *   - "hydraulic couplings" resolves to `quick-couplers`, 29 SKUs. Retargeted
 *     for search by `regroup-hose-fittings.ts` but left out of the rotation:
 *     29 is thin next to the 140 and 201 either side of it, and seven terms is
 *     already at the point where the line starts to read as a slot machine.
 *
 * `hydraulic adapters` and `hydraulic fittings` were a single compromise entry
 * ("hose fittings & adapters", pointing at the shared parent) until
 * `regroup-hose-fittings.ts` gave each family a hub of its own on 2026-08-22.
 *
 * ## Order
 *
 * Position 0 is not cosmetic. It is server-rendered into the HTML, so it is
 * the term Google and every LLM crawler reads, and it is what a visitor who
 * does not linger sees. `hydraulic hoses` leads by founder decision: it is the
 * highest-intent search term for this business, accepted alongside the fact
 * that it is currently the thinnest range (16 live SKUs against 330 for
 * industrial hose). The catalogue sprint that grows it is the follow-up.
 *
 * Six is close to the practical ceiling. Past seven or eight the rotation
 * reads as a slot machine rather than a statement.
 */

export type HeroTerm = {
  /** The words as they appear in the headline. Lower case; plural noun. */
  word: string
  /** Category page this term promises. Must be a live, published route. */
  href: string
}

export const HERO_TERMS: readonly HeroTerm[] = [
  { word: 'hydraulic hoses', href: '/c/hydraulic-hoses' },
  { word: 'hydraulic adapters', href: '/c/hydraulic-adapters' },
  { word: 'hydraulic fittings', href: '/c/hydraulic-fittings' },
  { word: 'industrial hoses', href: '/c/industrial-hose-suppliers-uae' },
  { word: 'oil & gas hoses', href: '/c/oil-gas-hoses' },
  { word: 'metallic & PTFE hoses', href: '/c/metallic-hose-suppliers-uae' },
  { word: 'Molykote lubricants', href: '/c/industrial-lubricant-suppliers-uae' },
]

/**
 * How long each term is held before the next one fades in, in milliseconds.
 *
 * Long enough to read a two-word phrase once without re-reading; short enough
 * that all six cycle in under twenty seconds. The existing hero image carousel
 * runs at 2500 ms, which is right for a picture and slightly fast for prose.
 */
export const HERO_TERM_DWELL_MS = 2600

/** Crossfade duration. Comfortably inside the dwell, so each term settles. */
export const HERO_TERM_FADE_MS = 300
