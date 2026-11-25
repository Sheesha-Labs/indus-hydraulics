/**
 * Spreadsheet table detection (S08-T05, board 35 "Detected"). Finds the header row under any merged title rows, the
 * data rows below it, and the rows that are not lines — titles, blanks, totals and subtotals — so they are shown as
 * skipped rather than read. Works on the parser's grid (cells by column letter); no I/O.
 */
export interface GridCell {
  c: string
  v: string
  merged?: string
  formula?: boolean
  hidden?: boolean
}

export interface GridRow {
  r: number
  hidden?: boolean
  cells: readonly GridCell[]
}

export type SkipWhy = 'merged_title' | 'blank' | 'totals' | 'subtotal' | 'hidden'

export interface DetectedTable {
  headerRow: number
  /** First and last data row (inclusive); null when the header has nothing under it. */
  dataRows: [number, number] | null
  /** Rows that hold lines, in order. */
  lineRows: number[]
  skipped: Array<{ row: number; why: SkipWhy }>
  /** Column letters with a header cell, left to right. */
  columns: string[]
}

/** Words a header row is made of. Two of them in one row mark it as the header. */
const HEADER_WORDS =
  /^(s\/?n|sr\.?\s*no\.?|sl\.?\s*no\.?|no\.?|#|item(\s*no\.?)?|line(\s*no\.?)?|pos(ition)?|desc(ription)?|item description|material description|particulars|product|part(\s*no\.?|\s*number)?|p\/?n|maker\s*p\/?n|mpn|model|code|qty|quantity|req(uired)?\s*qty|unit|uom|u\/m|remarks?|notes?|comments?|spec(ification)?|material|size|make|brand|manufacturer)\.?$/i
const TOTAL = /\b(grand\s+)?total\b|\btotal\s+(items|qty|quantity|amount)\b/i
const SUBTOTAL = /\bsub-?\s*total\b/i

const filled = (row: GridRow) => row.cells.filter((c) => c.v.trim() !== '')

function colIndex(c: string): number {
  let n = 0
  for (const ch of c.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n
}

export function columnOrder(a: string, b: string): number {
  return colIndex(a) - colIndex(b)
}

/** A merged range that spans more than one column ("A1:F1"). */
function spansColumns(merged: string | undefined): boolean {
  if (!merged) return false
  const [from, to] = merged.split(':')
  if (!from || !to) return false
  return from.replace(/\d+/g, '') !== to.replace(/\d+/g, '')
}

function headerScore(row: GridRow): number {
  const cells = filled(row)
  if (cells.length < 2) return 0
  if (cells.some((c) => spansColumns(c.merged))) return 0
  const words = cells.filter((c) => HEADER_WORDS.test(c.v.trim())).length
  const numeric = cells.filter((c) => /^[\d.,\s]+$/.test(c.v.trim())).length
  return words >= 2 && numeric === 0 ? words : 0
}

function skipWhy(row: GridRow): SkipWhy | null {
  if (row.hidden) return 'hidden'
  const cells = filled(row)
  if (!cells.length) return 'blank'
  const text = cells.map((c) => c.v).join(' ')
  if (SUBTOTAL.test(text)) return 'subtotal'
  if (TOTAL.test(text)) return 'totals'
  // A row that only sums the column above: one or two cells, a formula among them.
  if (cells.length <= 2 && cells.some((c) => c.formula)) return 'totals'
  return null
}

/**
 * The table on one sheet: the header is the first row in the top 30 with at least two header words and no numbers;
 * failing that, the first row with three or more text cells. Rows above it are titles (or blank).
 */
export function detectTable(
  rows: readonly GridRow[],
  opts: { headerRow?: number } = {}
): DetectedTable | null {
  const top = rows.slice(0, 30)
  const forced = opts.headerRow ? rows.find((r) => r.r === opts.headerRow) : undefined
  const scored = top
    .map((row) => ({ row, s: headerScore(row) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.row.r - b.row.r)
  const header =
    forced ??
    scored[0]?.row ??
    top.find(
      (row) =>
        filled(row).length >= 3 &&
        !filled(row).some((c) => spansColumns(c.merged)) &&
        filled(row).every((c) => !/^[\d.,\s]+$/.test(c.v.trim()))
    )
  if (!header) return null
  const skipped: DetectedTable['skipped'] = []
  for (const row of rows) {
    if (row.r >= header.r) break
    skipped.push({ row: row.r, why: filled(row).length ? 'merged_title' : 'blank' })
  }
  const lineRows: number[] = []
  for (const row of rows) {
    if (row.r <= header.r) continue
    const why = skipWhy(row)
    if (why) skipped.push({ row: row.r, why })
    else lineRows.push(row.r)
  }
  // Trailing blanks after the last row with anything in it are not worth listing.
  const last = lineRows.at(-1) ?? header.r
  const lastContent = Math.max(last, ...skipped.filter((s) => s.why !== 'blank').map((s) => s.row))
  const shown = skipped.filter((s) => !(s.why === 'blank' && s.row > lastContent))
  return {
    headerRow: header.r,
    dataRows: lineRows.length ? [lineRows[0]!, last] : null,
    lineRows,
    skipped: shown,
    columns: filled(header)
      .map((c) => c.c)
      .sort(columnOrder),
  }
}

/** Board 35 "Rows 1–3 are a merged title": consecutive rows grouped into ranges. */
export function rowRanges(rows: readonly number[]): string {
  const sorted = [...rows].sort((a, b) => a - b)
  const out: string[] = []
  let start: number | null = null
  let prev: number | null = null
  for (const r of sorted) {
    if (start !== null && prev !== null && r === prev + 1) {
      prev = r
      continue
    }
    if (start !== null) out.push(start === prev ? `${start}` : `${start}–${prev}`)
    start = r
    prev = r
  }
  if (start !== null) out.push(start === prev ? `${start}` : `${start}–${prev}`)
  return out.join(', ')
}
