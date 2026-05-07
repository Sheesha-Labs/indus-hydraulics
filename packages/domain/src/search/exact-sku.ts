/**
 * Pre-search filter that decides whether a query is a candidate for the
 * "exact-SKU short-circuit" — i.e. typing `IH-AP71-D-R-V-PC` into the
 * search bar should jump straight to `/p/IH-AP71-D-R-V-PC` rather than
 * running the FTS pipeline.
 *
 * Returns the normalised SKU when the query looks like a single-token
 * SKU/MPN, else null. A null return means "run the normal search".
 *
 * Heuristic (deliberately conservative — false-negatives are fine, false-
 * positives would silently navigate to a 404):
 *   - Trim + uppercase.
 *   - Reject if it contains a space (multi-word query, e.g. "axial piston
 *     pump" — clearly a description, not a SKU).
 *   - Reject if it's too short to be a SKU (<3 chars).
 *   - Reject if it's too long to be a sane SKU (>64 chars).
 *   - Accept if it contains at least one digit OR at least one hyphen
 *     (rejects pure-letter words like "PUMP" which are legit FTS queries,
 *     accepts identifier-like tokens like "A10VSO71" or "IH-AP71-D").
 *
 * The actual database lookup (whether such a SKU exists) is up to the
 * caller — this helper just decides whether the lookup is worth doing.
 */

const MIN_SKU_LEN = 3
const MAX_SKU_LEN = 64

export function extractExactSkuQuery(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.length < MIN_SKU_LEN || trimmed.length > MAX_SKU_LEN) return null
  if (/\s/.test(trimmed)) return null
  const upper = trimmed.toUpperCase()
  const hasDigit = /[0-9]/.test(upper)
  const hasHyphen = upper.includes('-')
  if (!hasDigit && !hasHyphen) return null
  return upper
}
