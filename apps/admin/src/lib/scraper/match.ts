/**
 * Lightweight fuzzy matching for "scraped text → existing record".
 *
 * Used to auto-suggest a Brand or Category when a scraped product has
 * `sourceBrandText` like "Bosch Rexroth GmbH" and we have an existing
 * Brand row called "Bosch Rexroth". The matcher trades on three signals,
 * weighted from strongest to weakest:
 *
 *   1. Exact match on normalised string → score 100
 *   2. Substring containment (one inside the other) → 80 + length-ratio
 *   3. Jaccard token overlap → up to 70
 *
 * Returns the best match if it clears `minScore` (default 60). For lower
 * scores we return null — the user picks manually rather than having us
 * mis-categorise their products.
 */

export type MatchOption = { id: string; name: string }

export type MatchResult = {
  id: string
  name: string
  score: number
}

const DEFAULT_MIN_SCORE = 60

export function matchTextToOption(
  text: string | null | undefined,
  options: readonly MatchOption[],
  opts: { minScore?: number } = {},
): MatchResult | null {
  if (!text) return null
  const minScore = opts.minScore ?? DEFAULT_MIN_SCORE
  const target = normalise(text)
  if (!target) return null

  let best: MatchResult | null = null
  for (const opt of options) {
    const candidate = normalise(opt.name)
    if (!candidate) continue
    const score = scorePair(target, candidate)
    if (score >= minScore && (best === null || score > best.score)) {
      best = { id: opt.id, name: opt.name, score }
    }
  }
  return best
}

export function scorePair(a: string, b: string): number {
  if (a === b) return 100

  // Substring containment with length-ratio penalty. We prefer
  // candidate-inside-target (e.g. brand "Bosch Rexroth" inside scraped
  // "Bosch Rexroth GmbH") over target-inside-candidate.
  if (a.includes(b) || b.includes(a)) {
    const shorter = Math.min(a.length, b.length)
    const longer = Math.max(a.length, b.length)
    const ratio = shorter / longer
    return Math.round(80 + 15 * ratio)
  }

  // Jaccard overlap on tokens. Robust to word-order shuffling.
  const ta = tokenSet(a)
  const tb = tokenSet(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let shared = 0
  for (const tok of ta) if (tb.has(tok)) shared += 1
  const union = ta.size + tb.size - shared
  if (union === 0) return 0
  const jaccard = shared / union
  return Math.round(70 * jaccard)
}

export function normalise(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenSet(input: string): Set<string> {
  const tokens = input.split(' ').filter(Boolean)
  // Drop very short tokens (1-2 chars) — they're usually noise (a, of, &).
  return new Set(tokens.filter((t) => t.length >= 2))
}
