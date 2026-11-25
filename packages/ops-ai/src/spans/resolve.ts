import { findQuote, normaliseForMatch, unionBoxes, type Box } from '@indus/ops-core'

/**
 * Resolves a model's verbatim evidence into source spans (S08-T01, ADR-12, 08-map-integrations §2.8). Pure: the
 * parsed document comes in, span drafts come out; the app persists them (one createMany). Each kind is matched
 * where it can be checked:
 *
 *   email   the quote in the stored body text → char offsets (with the text hash, so a changed body is caught)
 *   pdf     the quote on the page the model named, then ±1 page → the union of its text items' boxes
 *   sheet   the named cell must contain the quote; without a cell, the first cell on the sheet that does
 *   docx    the quote in the coordinate text → offsets, and T{n}R{r}C{c} when it sits in a table cell
 *   image   and scanned PDF pages: nothing to match against → page_only (Why? frames the page, shows the quote)
 *
 * Anything that does not match is `unresolved`: the value it supports becomes Unsure.
 */
export type SpanResolution = 'exact' | 'fuzzy' | 'page_only' | 'unresolved'

export interface Evidence {
  field: string
  quote: string
  page?: number | null
  sheet?: string | null
  cellRef?: string | null
}

export type SpanSource =
  | { kind: 'email'; sourceId: string; text: string; textHash: string | null }
  | {
      kind: 'pdf'
      sourceId: string
      hasTextLayer: boolean
      pages: Array<{
        page: number
        text: string
        items: Array<{ start: number; end: number; x: number; y: number; w: number; h: number }>
      }>
    }
  | {
      kind: 'sheet'
      sourceId: string
      sheets: Array<{
        name: string
        rows: Array<{ r: number; cells: Array<{ c: string; v: string }> }>
      }>
    }
  | { kind: 'docx'; sourceId: string; text: string }
  | { kind: 'image'; sourceId: string }

export interface SourceSpanDraft {
  field: string
  sourceKind: 'email' | 'pdf' | 'sheet' | 'docx' | 'image'
  sourceId: string
  page: number | null
  sheet: string | null
  cellRef: string | null
  charStart: number | null
  charEnd: number | null
  bbox: Box | null
  quote: string
  resolved: SpanResolution
  textHash: string | null
}

const base = (src: SpanSource, ev: Evidence): SourceSpanDraft => ({
  field: ev.field,
  sourceKind: src.kind,
  sourceId: src.sourceId,
  page: null,
  sheet: null,
  cellRef: null,
  charStart: null,
  charEnd: null,
  bbox: null,
  quote: ev.quote.slice(0, 2_000),
  resolved: 'unresolved',
  textHash: null,
})

function resolvePdf(src: Extract<SpanSource, { kind: 'pdf' }>, ev: Evidence): SourceSpanDraft {
  const out = base(src, ev)
  const named = ev.page ?? null
  if (!src.hasTextLayer) return { ...out, page: named ?? 1, resolved: 'page_only' }
  const order = named
    ? [named, named - 1, named + 1].filter((p) => p >= 1 && p <= src.pages.length)
    : src.pages.map((p) => p.page)
  for (const n of order) {
    const page = src.pages.find((p) => p.page === n)
    if (!page) continue
    const hit = findQuote(page.text, ev.quote)
    if (!hit) continue
    const boxes = page.items.filter((i) => i.start < hit.end && i.end > hit.start)
    return {
      ...out,
      page: n,
      charStart: hit.start,
      charEnd: hit.end,
      bbox: unionBoxes(boxes),
      resolved: hit.method,
    }
  }
  return { ...out, page: named }
}

const norm = (s: string) => normaliseForMatch(s).text

function resolveSheet(src: Extract<SpanSource, { kind: 'sheet' }>, ev: Evidence): SourceSpanDraft {
  const out = base(src, ev)
  const sheets = ev.sheet ? src.sheets.filter((s) => s.name === ev.sheet) : src.sheets
  const q = norm(ev.quote)
  if (!q) return out
  if (ev.cellRef) {
    const m = /^([A-Z]{1,3})(\d{1,7})$/i.exec(ev.cellRef.trim())
    if (!m) return { ...out, sheet: ev.sheet ?? null }
    const [c, r] = [m[1]!.toUpperCase(), Number(m[2])]
    for (const s of sheets) {
      const v = s.rows.find((row) => row.r === r)?.cells.find((cell) => cell.c === c)?.v
      if (v !== undefined && norm(v).includes(q))
        return { ...out, sheet: s.name, cellRef: `${c}${r}`, resolved: 'exact' }
    }
    // The model named a cell that does not hold the quote: never move the value somewhere else.
    return { ...out, sheet: ev.sheet ?? null, cellRef: ev.cellRef }
  }
  for (const s of sheets)
    for (const row of s.rows)
      for (const cell of row.cells)
        if (norm(cell.v).includes(q))
          return { ...out, sheet: s.name, cellRef: `${cell.c}${row.r}`, resolved: 'exact' }
  return out
}

function resolveDocx(src: Extract<SpanSource, { kind: 'docx' }>, ev: Evidence): SourceSpanDraft {
  const out = base(src, ev)
  const hit = findQuote(src.text, ev.quote)
  if (!hit) return out
  const lineStart = src.text.lastIndexOf('\n', hit.start - 1) + 1
  const lineEnd = src.text.indexOf('\n', hit.start)
  const line = src.text.slice(lineStart, lineEnd < 0 ? undefined : lineEnd)
  let cellRef: string | null = null
  const tr = /^T(\d+)R(\d+)\t/.exec(line)
  if (tr) {
    // Which C{k}: the last "C{k}:" marker before the hit on this line.
    const before = src.text.slice(lineStart, hit.start)
    const marks = [...before.matchAll(/\tC(\d+):/g)]
    const k = marks.at(-1)?.[1]
    if (k) cellRef = `T${tr[1]}R${tr[2]}C${k}`
  }
  return { ...out, charStart: hit.start, charEnd: hit.end, cellRef, resolved: hit.method }
}

function resolveEmail(src: Extract<SpanSource, { kind: 'email' }>, ev: Evidence): SourceSpanDraft {
  const out = { ...base(src, ev), textHash: src.textHash }
  const hit = findQuote(src.text, ev.quote)
  return hit ? { ...out, charStart: hit.start, charEnd: hit.end, resolved: hit.method } : out
}

export function resolveSpan(src: SpanSource, ev: Evidence): SourceSpanDraft {
  switch (src.kind) {
    case 'email':
      return resolveEmail(src, ev)
    case 'pdf':
      return resolvePdf(src, ev)
    case 'sheet':
      return resolveSheet(src, ev)
    case 'docx':
      return resolveDocx(src, ev)
    case 'image':
      return { ...base(src, ev), page: ev.page ?? 1, resolved: 'page_only' }
  }
}

export function resolveSpans(src: SpanSource, evidence: readonly Evidence[]): SourceSpanDraft[] {
  return evidence.map((ev) => resolveSpan(src, ev))
}

/** A span a value may stand on: exact, fuzzy, or a scanned page's frame. */
export function isResolved(s: Pick<SourceSpanDraft, 'resolved'>): boolean {
  return s.resolved !== 'unresolved'
}
