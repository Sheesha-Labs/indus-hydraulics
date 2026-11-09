import { parseCsv } from './lists'

/** Largest file the import screen will read. */
export const LIST_FILE_MAX_BYTES = 10 * 1024 * 1024

const EXCEL = /\.(xlsx|xlsm|xls)$/i

/**
 * Rows of cell text from bytes: a workbook's first sheet, or CSV text.
 *
 * Runs in the browser — the server only ever receives the address and name
 * columns (lists.ts `toImportPairs`), so the rest of a sheet, and the
 * spreadsheet parser itself, never touch the server.
 */
export async function rowsFromBytes(bytes: ArrayBuffer, fileName: string): Promise<string[][]> {
  if (EXCEL.test(fileName)) {
    const XLSX = await import('xlsx')
    const wb = XLSX.read(bytes, { type: 'array', cellDates: false, cellFormula: false, cellHTML: false })
    const first = wb.SheetNames[0]
    if (!first) return []
    const sheet = wb.Sheets[first]!
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '', blankrows: false })
    return rows
      .map((r) => r.map((c) => (c === null || c === undefined ? '' : String(c))))
      .filter((r) => r.some((c) => c.trim() !== ''))
  }
  return parseCsv(new TextDecoder('utf-8').decode(bytes))
}
