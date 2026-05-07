/**
 * "Did you mean" suggestion engine for the search results page.
 *
 * Inputs:
 *   - the user's raw query
 *   - the admin-managed synonym groups (each group is a set of mutually-
 *     equivalent terms; e.g. ["pump", "pumps", "pumping"])
 *   - the admin-managed redirect rules (each rule maps a query substring
 *     to a target URL)
 *   - the result count from the FTS pass
 *
 * Output: up to MAX_ALTERNATES alternative queries the user might mean.
 *
 * Strategy:
 *   1. If a synonym group includes the user's query (or one of its
 *      whitespace-split tokens), surface the OTHER terms in that group as
 *      alternates. These are exact admin-curated equivalences — the
 *      strongest signal.
 *   2. If a redirect rule's `query` is a substring of the user's input,
 *      surface that rule's `query` as an alternate (the page can resolve
 *      it client-side; we don't return the URL because the chip is just
 *      a sub-search).
 *   3. Sort by signal strength: synonym matches first, then redirects.
 *   4. Dedupe (case-insensitive) against the user's original query and
 *      across alternates. Cap at MAX_ALTERNATES.
 *
 * Calls are intentionally lightweight — every input is plain string
 * data, no DB access, fully deterministic for tests.
 */

export type AlternateSynonymGroup = { group: string; terms: string[] }
export type AlternateRedirectRule = { query: string; targetUrl: string }

export type AlternateSuggestion = {
  query: string
  source: 'synonym' | 'redirect'
}

export type ProposeAlternatesInput = {
  query: string
  synonyms: ReadonlyArray<AlternateSynonymGroup>
  redirects: ReadonlyArray<AlternateRedirectRule>
  resultCount: number
}

export const MAX_ALTERNATES = 3

/**
 * Threshold at which we surface alternates. Above this and the user got
 * "enough" results, so don't visually clutter the page with suggestions.
 * Below this, it's worth offering alternates because the result set is
 * thin. Set deliberately low — we don't want alternates for every search.
 */
export const ALTERNATES_RESULT_THRESHOLD = 5

export function proposeAlternates(input: ProposeAlternatesInput): AlternateSuggestion[] {
  const { query, synonyms, redirects, resultCount } = input

  if (resultCount > ALTERNATES_RESULT_THRESHOLD) return []

  const trimmed = query.trim()
  if (!trimmed) return []

  const lowered = trimmed.toLowerCase()
  const tokens = new Set(lowered.split(/\s+/).filter(Boolean))

  const alternates: AlternateSuggestion[] = []
  // Seed the dedup set with the full query AND each of its tokens so we
  // don't suggest a word the user already typed.
  const seen = new Set<string>([lowered, ...tokens])

  // 1. Synonym matches.
  for (const grp of synonyms) {
    const groupTermsLower = grp.terms.map((t) => t.toLowerCase())
    const hit = groupTermsLower.some((t) => t === lowered || tokens.has(t))
    if (!hit) continue
    for (const term of grp.terms) {
      const key = term.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      alternates.push({ query: term, source: 'synonym' })
      if (alternates.length >= MAX_ALTERNATES) return alternates
    }
  }

  // 2. Redirect substring matches.
  for (const rule of redirects) {
    const ruleLower = rule.query.toLowerCase()
    if (!ruleLower) continue
    if (lowered === ruleLower) continue // identity → useless suggestion
    if (!lowered.includes(ruleLower)) continue
    if (seen.has(ruleLower)) continue
    seen.add(ruleLower)
    alternates.push({ query: rule.query, source: 'redirect' })
    if (alternates.length >= MAX_ALTERNATES) break
  }

  return alternates
}
