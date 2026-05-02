/**
 * Pure helpers for the on-site search engine (Postgres FTS + pg_trgm).
 *
 * Why pure: the storefront `/search` page uses `db.$queryRawUnsafe` to call
 * `to_tsquery` etc., but the inputs (synonym expansion, redirect detection,
 * boost selection) are deterministic and unit-testable here.
 *
 * The actual SQL string assembly happens at the call site so we can use
 * Prisma's parameterised raw query API safely. This module just decides
 * WHAT to query for.
 */

export type SynonymGroup = { group: string; terms: string[] }
export type SearchRedirectRule = { query: string; targetUrl: string }
export type Boost = { entityType: string; entityId: string; boost: number }

export type SearchInput = {
  rawQuery: string
  synonyms: SynonymGroup[]
  redirects: SearchRedirectRule[]
  boosts: Boost[]
}

export type SearchPlan =
  | { kind: 'redirect'; targetUrl: string }
  | {
      kind: 'fts'
      normalized: string
      tsqueryExpression: string
      // pg_trgm fallback term — used when FTS returns 0 rows.
      trigramTerm: string
      boosts: Boost[]
    }

/**
 * Lower-case, collapse whitespace, strip leading/trailing non-alphanumerics.
 * Used for synonym/redirect lookups so "O-Ring  " matches "o-ring".
 */
export function normaliseQuery(q: string): string {
  return q
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Expand a query through synonym groups (bidirectional). Returns the original
 * normalised query plus every synonym term that shares a group with any
 * normalised token in the query.
 */
export function expandSynonyms(
  normalised: string,
  groups: SynonymGroup[],
): string[] {
  const tokens = normalised.split(' ').filter(Boolean)
  const expansions = new Set<string>([normalised])
  for (const group of groups) {
    const groupTerms = group.terms.map((t) => t.toLowerCase().trim())
    if (groupTerms.some((term) => tokens.includes(term) || normalised.includes(term))) {
      for (const term of groupTerms) expansions.add(term)
    }
  }
  return Array.from(expansions)
}

/**
 * Build a Postgres `websearch_to_tsquery`-friendly expression by OR-joining
 * expansions. websearch_to_tsquery already tokenises and supports phrase
 * quoting — we just need to give it a multi-term string.
 */
export function buildTsQueryExpression(expansions: string[]): string {
  return expansions
    .map((e) => e.includes(' ') ? `"${e}"` : e)
    .join(' OR ')
}

export function planSearch(input: SearchInput): SearchPlan {
  const normalised = normaliseQuery(input.rawQuery)
  if (!normalised) {
    return {
      kind: 'fts',
      normalized: '',
      tsqueryExpression: '',
      trigramTerm: '',
      boosts: input.boosts,
    }
  }

  const redirect = input.redirects.find((r) => r.query.toLowerCase().trim() === normalised)
  if (redirect) {
    return { kind: 'redirect', targetUrl: redirect.targetUrl }
  }

  const expansions = expandSynonyms(normalised, input.synonyms)
  return {
    kind: 'fts',
    normalized: normalised,
    tsqueryExpression: buildTsQueryExpression(expansions),
    trigramTerm: normalised,
    boosts: input.boosts,
  }
}
