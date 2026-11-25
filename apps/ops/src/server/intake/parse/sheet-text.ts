import type { SheetGrid, SheetRow } from './types'

/**
 * Spreadsheet grid → coordinate text (S08-T01). Every value carries its row and column, so a model's quote can be
 * checked against the very cell it names ("R12\tA:6316-C3\tB:Bearing"). Hidden rows and columns are marked, not
 * dropped: clients hide columns that still matter. Sheets over 2,000 rows are chunked by 500 with the first row
 * (usually the header) repeated at the top of every chunk.
 */
const CHUNK_OVER = 2_000
const CHUNK_ROWS = 500

export function rowText(row: SheetRow): string {
  const cells = row.cells
    .filter((c) => c.v !== '')
    .map(
      (c) =>
        `${c.c}${c.hidden ? '(hidden)' : ''}:${c.v.replace(/[\t\n\r]+/g, ' ')}${c.merged ? ` [merged ${c.merged}]` : ''}`
    )
  return `R${row.r}${row.hidden ? ' (hidden)' : ''}\t${cells.join('\t')}`
}

export function gridToText(grid: SheetGrid): { text: string; chunks: string[] } {
  const parts: string[] = []
  const chunks: string[] = []
  for (const sheet of grid.sheets) {
    const head = `--- SHEET: ${sheet.name}${sheet.hidden ? ' (hidden)' : ''} ---`
    const rows = sheet.rows.filter((r) => r.cells.some((c) => c.v !== ''))
    const lines = rows.map(rowText)
    parts.push([head, ...lines].join('\n'))
    if (rows.length > CHUNK_OVER) {
      const header = lines[0] ?? ''
      for (let i = 1; i < lines.length; i += CHUNK_ROWS)
        chunks.push([head, header, ...lines.slice(i, i + CHUNK_ROWS)].join('\n'))
    } else chunks.push([head, ...lines].join('\n'))
  }
  return { text: parts.join('\n\n'), chunks }
}

/** 1 → A, 27 → AA. */
export function columnLetter(n: number): string {
  let s = ''
  let x = n
  while (x > 0) {
    const m = (x - 1) % 26
    s = String.fromCharCode(65 + m) + s
    x = Math.floor((x - 1) / 26)
  }
  return s
}

/** "AB12" → { c: 'AB', r: 12 }. */
export function parseCellRef(ref: string): { c: string; r: number } | null {
  const m = /^([A-Z]{1,3})(\d{1,7})$/.exec(ref.trim().toUpperCase())
  return m ? { c: m[1]!, r: Number(m[2]) } : null
}

/** The display value of a spreadsheet value: numbers as written, dates as ISO days. */
export function displayValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10)
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : ''
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  return String(v).trim()
}
