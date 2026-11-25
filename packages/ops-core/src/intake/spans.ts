import { damerauLevenshtein } from '../mail/homoglyph'

/**
 * Source-span matching for intake (S08-T01, ADR-12, 08-map-integrations §2.8). A model cites every value with a
 * verbatim quote; code finds that quote in the parsed text and keeps the ORIGINAL offsets so Why? can highlight
 * them. A quote that cannot be found makes the value Unsure. Pure: no I/O.
 */

/** Characters folded before matching: typographic quotes, dashes and spaces that PDFs and Word love. */
const FOLD: Record<string, string> = {
  '‘': "'",
  '’': "'",
  '‚': "'",
  '‛': "'",
  '′': "'",
  '“': '"',
  '”': '"',
  '„': '"',
  '‟': '"',
  '″': '"',
  '‐': '-',
  '‑': '-',
  '‒': '-',
  '–': '-',
  '—': '-',
  '―': '-',
  '−': '-',
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
}

export interface NormalisedText {
  /** Lowercased, NFKC, quotes and dashes folded, whitespace runs collapsed to one space. */
  text: string
  /** map[i] = offset in the original text of normalised character i. */
  map: number[]
}

/** NFKC per character (so offsets stay mappable), folds, lowercases and collapses whitespace. */
export function normaliseForMatch(input: string): NormalisedText {
  let text = ''
  const map: number[] = []
  let lastSpace = true
  for (let i = 0; i < input.length; i++) {
    const raw = input[i]!
    const folded = FOLD[raw] ?? raw.normalize('NFKC')
    for (const ch of folded) {
      if (/\s/.test(ch)) {
        if (lastSpace) continue
        text += ' '
        map.push(i)
        lastSpace = true
      } else {
        text += ch.toLowerCase()
        map.push(i)
        lastSpace = false
      }
    }
  }
  // A trailing collapsed space carries no meaning.
  if (text.endsWith(' ')) {
    text = text.slice(0, -1)
    map.pop()
  }
  return { text, map }
}

export interface QuoteHit {
  start: number
  end: number
  method: 'exact' | 'fuzzy'
}

const MAX_FUZZY_HAYSTACK = 60_000
const MAX_FUZZY_QUOTE = 400

/**
 * Where `quote` sits in `haystack`, as offsets into the original haystack. Exact after normalisation first; then
 * fuzzy: a window of the quote's length (±1) within 10 % edits (Damerau–Levenshtein). Null when neither holds.
 */
export function findQuote(haystack: string, quote: string): QuoteHit | null {
  const h = normaliseForMatch(haystack)
  const q = normaliseForMatch(quote).text
  if (q.length < 2 || h.text.length === 0) return null
  const at = h.text.indexOf(q)
  if (at >= 0) return { start: h.map[at]!, end: h.map[at + q.length - 1]! + 1, method: 'exact' }
  if (h.text.length > MAX_FUZZY_HAYSTACK || q.length > MAX_FUZZY_QUOTE) return null
  const budget = Math.floor(q.length * 0.1)
  if (budget === 0) return null
  let best = { d: Number.POSITIVE_INFINITY, s: -1, len: q.length }
  for (const len of [q.length, q.length - 1, q.length + 1]) {
    if (len <= 0) continue
    for (let s = 0; s + len <= h.text.length; s++) {
      if (h.text[s] !== q[0] && h.text[s + len - 1] !== q[q.length - 1]) continue
      const d = damerauLevenshtein(h.text.slice(s, s + len), q)
      if (d < best.d) best = { d, s, len }
      if (d === 0) break
    }
  }
  if (best.s < 0 || best.d > budget) return null
  return { start: h.map[best.s]!, end: h.map[best.s + best.len - 1]! + 1, method: 'fuzzy' }
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** The smallest box holding every box (PDF user units). Null for none. */
export function unionBoxes(boxes: readonly Box[]): Box | null {
  if (!boxes.length) return null
  let x0 = Number.POSITIVE_INFINITY
  let y0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  let y1 = Number.NEGATIVE_INFINITY
  for (const b of boxes) {
    x0 = Math.min(x0, b.x)
    y0 = Math.min(y0, b.y)
    x1 = Math.max(x1, b.x + b.w)
    y1 = Math.max(y1, b.y + b.h)
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}
