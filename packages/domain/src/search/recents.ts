/**
 * Recent-queries list managed by the storefront's `<SearchAutocomplete>`
 * for the current browser session. Stored in `sessionStorage` so it
 * resets on tab close and never leaks across users on shared devices.
 *
 * Pure logic only — the React component handles the actual storage I/O.
 * This module owns: validation, dedup, normalisation, capping. Edge
 * cases are unit-tested without touching the DOM.
 */

export const MAX_RECENT_QUERIES = 5
export const MIN_QUERY_LEN = 2
export const MAX_QUERY_LEN = 80

/**
 * Pushes `query` onto the front of `recents`, dedups case-insensitively
 * against any existing entry (preserving the new casing), trims to length,
 * and caps at `MAX_RECENT_QUERIES`. Returns a NEW array — does not mutate
 * its input. Returns `null` when the query is empty / whitespace-only /
 * shorter than `MIN_QUERY_LEN` / longer than `MAX_QUERY_LEN`, signalling
 * the caller to skip the storage write.
 */
export function pushRecentQuery(
  recents: ReadonlyArray<string>,
  query: string,
): string[] | null {
  const trimmed = query.trim()
  if (trimmed.length < MIN_QUERY_LEN || trimmed.length > MAX_QUERY_LEN) return null

  const lowered = trimmed.toLowerCase()
  const filtered = recents.filter((r) => r.toLowerCase() !== lowered)
  const next = [trimmed, ...filtered]
  return next.slice(0, MAX_RECENT_QUERIES)
}

/**
 * Cleans an untrusted recents list (e.g. read from sessionStorage). Drops
 * non-strings, empties, queries outside the length bounds, and dedupes
 * case-insensitively. Caps at `MAX_RECENT_QUERIES`. Useful as a safety
 * gate when restoring from storage where the data could have been
 * tampered with by an extension or older code path.
 */
export function sanitiseRecents(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of input) {
    if (typeof v !== 'string') continue
    const trimmed = v.trim()
    if (trimmed.length < MIN_QUERY_LEN || trimmed.length > MAX_QUERY_LEN) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
    if (out.length >= MAX_RECENT_QUERIES) break
  }
  return out
}

/**
 * `removeRecentQuery` removes a query from the recents list (used by the
 * "× Clear" button next to each recent in the dropdown). Case-insensitive
 * match. Returns a new array; never mutates input.
 */
export function removeRecentQuery(
  recents: ReadonlyArray<string>,
  query: string,
): string[] {
  const lowered = query.trim().toLowerCase()
  return recents.filter((r) => r.toLowerCase() !== lowered)
}
