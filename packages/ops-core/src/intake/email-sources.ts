import type { EmailSegment } from './email-segments'

/**
 * Where an email's lines come from (S08-T05, board 36): a table in the body ("Table · 6 lines"), a sentence ("Text ·
 * 1 line"), or an earlier reply that is shown greyed and never read ("Ignored · earlier reply"). Tables are found in
 * the stored plain text: two or more consecutive lines that split into three or more cells on tabs, pipes or runs of
 * two-plus spaces (how mail clients and the HTML-to-text step render a table). Offsets are into the body text.
 */
export type SourceKind = 'table' | 'text' | 'ignored'

export interface BodyRegion {
  kind: SourceKind
  start: number
  end: number
  /** For a table: its rows split into cells, header first. */
  rows?: string[][]
}

const CELL_SPLIT = /\t+|\s+\|\s+|\s{2,}/

export function splitCells(line: string): string[] {
  // A tab row keeps its empty cells ("1\tHose\t\t6 nos" has an empty P/N); spaced and piped rows cannot.
  if (line.includes('\t')) {
    const cells = line
      .replace(/^\s+|\s+$/g, '')
      .split('\t')
      .map((c) => c.trim())
    return cells.some((c) => c) ? cells : []
  }
  const t = line.trim().replace(/^\||\|$/g, '')
  if (!t) return []
  return t
    .split(CELL_SPLIT)
    .map((c) => c.trim())
    .filter((c) => c !== '')
}

interface Line {
  text: string
  start: number
  end: number
}

function linesOf(text: string, from: number, to: number): Line[] {
  const out: Line[] = []
  let at = from
  for (const raw of text.slice(from, to).split('\n')) {
    out.push({ text: raw, start: at, end: at + raw.length })
    at += raw.length + 1
  }
  return out
}

/** Tables and text inside the readable segments; earlier replies as ignored regions. */
export function emailBodyRegions(text: string, segments: readonly EmailSegment[]): BodyRegion[] {
  const out: BodyRegion[] = []
  for (const seg of segments) {
    if (seg.kind === 'quoted_reply') {
      out.push({ kind: 'ignored', start: seg.start, end: seg.end })
      continue
    }
    if (seg.kind === 'signature') continue
    const lines = linesOf(text, seg.start, seg.end)
    let run: Line[] = []
    const flush = () => {
      if (run.length >= 2) {
        out.push({
          kind: 'table',
          start: run[0]!.start,
          end: run.at(-1)!.end,
          rows: run.map((l) => splitCells(l.text)),
        })
      }
      run = []
    }
    for (const l of lines) {
      if (splitCells(l.text).length >= 3) run.push(l)
      else flush()
    }
    flush()
  }
  return out.sort((a, b) => a.start - b.start)
}

/** Table or text for a line read at [start, end): inside a table region, or not. */
export function sourceOfRange(
  regions: readonly BodyRegion[],
  range: readonly [number, number] | null
): Exclude<SourceKind, 'ignored'> {
  if (!range) return 'text'
  return regions.some((r) => r.kind === 'table' && r.start <= range[0] && range[1] <= r.end)
    ? 'table'
    : 'text'
}

/** Board 36's client ref "Found in the subject": a reference-shaped token in the subject line. */
export function clientRefFromSubject(subject: string | null | undefined): string | null {
  if (!subject) return null
  const cleaned = subject.replace(/^\s*((re|fwd?|fw|aw|tr)\s*:\s*)+/i, '')
  const m = cleaned.match(/\b([A-Z]{2,}[A-Z0-9]*(?:[-/][A-Z0-9]+){1,4})\b/)
  return m && /\d/.test(m[1]!) ? m[1]! : null
}

/** "Same as last order", "as per our PO 4471", "as before": a line that points at an earlier order. */
export const SAME_AS_BEFORE =
  /\b(same\s+as\s+(our\s+|the\s+)?(last|previous|earlier)\s+(order|po|supply|time)|as\s+per\s+(our\s+)?(last\s+)?(po|order)\b[\s#:.-]*[A-Z0-9-]*|as\s+(supplied\s+)?before|same\s+as\s+before)\b/i

/**
 * Board 36's "Needed by": the first sentence in the readable text that asks for something by a date ("required
 * onboard by 30 Sep"). Returns the phrase as evidence and the date text for `parsePrintedDate`; the date itself is
 * read by code.
 */
const NEEDED_BY =
  /\b(?:required|needed|need(?:ed)?\s+it|deliver(?:y|ed)?|onboard|on\s+board|latest|closing|due)\b[^.\n]{0,40}?\b(?:by|before|on|latest|not\s+later\s+than|nlt)\s+((?:\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}(?:\s+\d{4})?)|(?:[A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)|(?:\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}))/i

const KEYWORD = /\b(?:required|needed|need(?:ed)?\s+it|deliver(?:y|ed)?|latest|closing|due)\b/gi

export function neededByPhrase(
  text: string,
  regions: readonly BodyRegion[]
): { quote: string; dateText: string; start: number; end: number } | null {
  const ignored = regions.filter((r) => r.kind === 'ignored')
  const re = new RegExp(NEEDED_BY.source, 'gi')
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0
    if (ignored.some((r) => r.start <= start && start < r.end)) continue
    // The phrase from its LAST keyword to the date, as printed ("required onboard by 30 Sep", not "delivery for …").
    const head = m[0].slice(0, m[0].length - m[1]!.length)
    const kw = [...head.matchAll(KEYWORD)].at(-1)
    const from = kw?.index ?? 0
    return {
      quote: m[0].slice(from),
      dateText: m[1]!,
      start: start + from,
      end: start + m[0].length,
    }
  }
  return null
}
