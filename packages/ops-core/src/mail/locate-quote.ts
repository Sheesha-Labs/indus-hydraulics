import { damerauLevenshtein } from './homoglyph'

/**
 * Where a model's verbatim quote sits in the email text (S05-T04, 08-map-integrations §2.8 email rows).
 * Exact first (after whitespace and case are normalised on both sides), then fuzzy: the closest window of the
 * same length within 10 % edits. Not found → unresolved, and the reason that cited it is dropped (ADR-12).
 * Offsets are in the ORIGINAL text, so the Why? panel can highlight them.
 */
export type QuoteResolution =
  { resolved: 'exact' | 'fuzzy'; charStart: number; charEnd: number } | { resolved: 'unresolved' }

/** Lowercased, whitespace runs collapsed to one space, with a map back to original offsets. */
function normalise(text: string): { norm: string; map: number[] } {
  let norm = ''
  const map: number[] = []
  let lastSpace = true
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (/\s/.test(ch)) {
      if (lastSpace) continue
      norm += ' '
      map.push(i)
      lastSpace = true
    } else {
      norm += ch.toLowerCase()
      map.push(i)
      lastSpace = false
    }
  }
  return { norm, map }
}

const MAX_FUZZY_TEXT = 20_000

export function locateQuote(text: string, quote: string): QuoteResolution {
  const t = normalise(text)
  const q = normalise(quote).norm.trim()
  if (q.length < 3 || t.norm.length === 0) return { resolved: 'unresolved' }

  const at = t.norm.indexOf(q)
  if (at >= 0) {
    return { resolved: 'exact', charStart: t.map[at]!, charEnd: t.map[at + q.length - 1]! + 1 }
  }
  if (t.norm.length > MAX_FUZZY_TEXT || q.length > 400) return { resolved: 'unresolved' }

  const budget = Math.floor(q.length * 0.1)
  if (budget === 0) return { resolved: 'unresolved' }
  let best = { d: Infinity, start: -1, len: q.length }
  // Windows of the quote's length ± the budget, stepping one character: O(n·m) but bounded by the caps above.
  for (const len of [q.length, q.length - 1, q.length + 1]) {
    if (len <= 0) continue
    for (let s = 0; s + len <= t.norm.length; s++) {
      // Cheap filter: the window must share its first or last character with the quote.
      if (t.norm[s] !== q[0] && t.norm[s + len - 1] !== q[q.length - 1]) continue
      const d = damerauLevenshtein(t.norm.slice(s, s + len), q)
      if (d < best.d) best = { d, start: s, len }
      if (d === 0) break
    }
  }
  if (best.start < 0 || best.d > budget) return { resolved: 'unresolved' }
  return {
    resolved: 'fuzzy',
    charStart: t.map[best.start]!,
    charEnd: t.map[best.start + best.len - 1]! + 1,
  }
}
