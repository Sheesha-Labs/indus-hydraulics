import 'server-only'
import Papa from 'papaparse'
import { columnLetter, gridToText } from './sheet-text'
import type { ParsedDocument, SheetGrid, SheetRow } from './types'

/**
 * CSV (S08-T01): papaparse with the delimiter sniffed (comma, semicolon, tab, pipe), every value a string — a
 * European "1.000" stays "1.000" for the number parser to judge. One sheet named "CSV", same grid as XLSX.
 */
export function parseCsv(bytes: Uint8Array): ParsedDocument {
  let text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const res = Papa.parse<string[]>(text, {
    delimiter: '',
    delimitersToGuess: [',', ';', '\t', '|'],
    skipEmptyLines: false,
    dynamicTyping: false,
  })
  if (!res.data.length) return { kind: 'unreadable', detail: 'The CSV file is empty' }
  const rows: SheetRow[] = []
  res.data.forEach((cols, i) => {
    const cells = cols
      .map((v, c) => ({ c: columnLetter(c + 1), v: String(v ?? '').trim() }))
      .filter((x) => x.v !== '')
    if (cells.length) rows.push({ r: i + 1, cells })
  })
  const grid: SheetGrid = { sheets: [{ name: 'CSV', hidden: false, rows }] }
  const out = gridToText(grid)
  return { kind: 'sheet', format: 'csv', grid, text: out.text, chunks: out.chunks }
}
