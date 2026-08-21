/**
 * Derive a focus keyword for a category from its slug and title.
 *
 * A focus keyword is not free. `scoreEntity` computes
 * `100 * weightedPass / totalWeight` where `totalWeight` sums only the checks
 * it actually pushed, and a non-empty keyword pushes extra ones. Setting a
 * keyword that does not match therefore *lowers* the score: it adds to the
 * denominator and nothing to the numerator. Any bulk assignment has to be
 * checked against the same rules `scoreEntity` uses, or it makes every entity
 * look worse while appearing to add data.
 *
 * For a category exactly two checks apply, worth 13 between them:
 * `keywordInTitle` (8) and `keywordInUrl` (5). `keywordInFirstParagraph` (4)
 * only fires when `scoreEntity` receives a `firstParagraph`, and no category
 * call site passes one — `seo/health/page.tsx`, `seo/inspector/page.tsx` and
 * `inngest/functions.ts` all build the category input from
 * title/description/focusKeyword/url alone.
 *
 * `deriveCategoryFocusKeyword` returns a keyword only when it clears both, so
 * every keyword it produces scores a full 13/13 and can only raise a score.
 * When nothing qualifies it returns null, and null scores strictly better
 * than a keyword that misses.
 */

/** Mirrors the applicable WEIGHTS in ./health.ts. */
export const CATEGORY_KEYWORD_WEIGHTS = { title: 8, url: 5 } as const

/** Both applicable checks. Anything less is a guess the score charges for. */
export const CATEGORY_KEYWORD_MIN_WEIGHT =
  CATEGORY_KEYWORD_WEIGHTS.title + CATEGORY_KEYWORD_WEIGHTS.url

/** Words that make a keyword longer without making it more specific. */
const STOP = new Set(['and', 'or', 'the', 'for', 'with', 'in', 'of', 'a', 'an'])

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[—–|(),/]/g, ' ')
    .replace(/[^a-z0-9°\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Rejects candidates too generic to be a focus keyword.
 *
 * Scoring alone happily returns "hoses" for `abrasive-hoses`, "adapters" for
 * `bsp-adapters` and — worst — "ram" and "kill" for the BOP categories,
 * because a bare head noun appears in the title and the URL every time. Those
 * are not keywords: they are the word the category is filed under, they would
 * be assigned to dozens of categories at once, and nobody ranks for them.
 *
 * A candidate qualifies on either count: two or more words, or a single token
 * carrying a standard number (`en14420-5`, `din-2353`), which is specific
 * precisely because it is a part number.
 */
export function isSpecificKeyword(candidate: string): boolean {
  const trimmed = candidate.trim()
  if (!trimmed) return false
  if (trimmed.split(/\s+/).length >= 2) return true
  return /\d/.test(trimmed)
}

/**
 * Candidate keywords, longest first within each source.
 *
 * The slug is the strongest source: `keywordInUrl` compares
 * `keyword.replace(/\s+/g, '-')` against the URL, so a slug-derived candidate
 * passes that check by construction. Title-derived candidates are offered too
 * because the slug is sometimes shorter than the phrase a buyer types.
 */
export function focusKeywordCandidates(
  slug: string,
  name: string,
  seoTitle: string | null,
): string[] {
  const out: string[] = []
  const slugWords = slug.split('-').filter((w) => w && !STOP.has(w))

  // Full slug, then progressively shorter tails: `din-2353-bite-type-adapters`
  // yields the whole phrase down to `adapters`.
  for (let i = 0; i < slugWords.length; i++) out.push(slugWords.slice(i).join(' '))

  // Leading segment of the title, before any dash/pipe/paren separator.
  if (seoTitle) {
    const head = seoTitle.split(/[—–|(]/)[0] ?? ''
    const hw = words(head).filter((w) => !STOP.has(w))
    for (let i = 0; i < hw.length; i++) out.push(hw.slice(i).join(' '))
  }

  const nw = words(name).filter((w) => !STOP.has(w))
  for (let i = 0; i < nw.length; i++) out.push(nw.slice(i).join(' '))

  return [...new Set(out.filter((c) => c.length >= 3))]
}

/** Scores a candidate exactly the way `scoreEntity` will, for a category. */
export function weighCategoryKeyword(
  keyword: string,
  slug: string,
  seoTitle: string | null,
): { weight: number; inTitle: boolean; inUrl: boolean } {
  const k = keyword.trim().toLowerCase()
  const inTitle = (seoTitle ?? '').toLowerCase().includes(k)
  // scoreEntity is called with `url: `/${slug}`` at every category call site.
  const url = `/${slug}`.toLowerCase()
  const inUrl = url.includes(k.replace(/\s+/g, '-')) || url.includes(k)
  return {
    weight:
      (inTitle ? CATEGORY_KEYWORD_WEIGHTS.title : 0) + (inUrl ? CATEGORY_KEYWORD_WEIGHTS.url : 0),
    inTitle,
    inUrl,
  }
}

export type DerivedFocusKeyword = {
  keyword: string
  weight: number
  inTitle: boolean
  inUrl: boolean
}

/**
 * Best focus keyword for a category, or null when nothing qualifies.
 *
 * Ranks by specificity first and weight only to break ties. Ranking by weight
 * alone picks the generic tail of the slug: for `abrasive-hoses` the bare word
 * "hoses" clears both checks while "abrasive hoses" may not, and the higher
 * score is worthless because "hoses" is not a query anyone competes on.
 */
export function deriveCategoryFocusKeyword(
  slug: string,
  name: string,
  seoTitle: string | null,
): DerivedFocusKeyword | null {
  let best: DerivedFocusKeyword | null = null
  for (const candidate of focusKeywordCandidates(slug, name, seoTitle)) {
    if (!isSpecificKeyword(candidate)) continue
    const w = weighCategoryKeyword(candidate, slug, seoTitle)
    if (w.weight < CATEGORY_KEYWORD_MIN_WEIGHT) continue
    const candidateWords = candidate.split(' ').length
    const bestWords = best ? best.keyword.split(' ').length : -1
    if (!best || candidateWords > bestWords || (candidateWords === bestWords && w.weight > best.weight)) {
      best = { keyword: candidate, ...w }
    }
  }
  return best
}
