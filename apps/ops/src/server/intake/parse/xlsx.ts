import 'server-only'
import ExcelJS from 'exceljs'
import { columnLetter, displayValue, gridToText } from './sheet-text'
import type { ParsedDocument, SheetCell, SheetGrid, SheetRow } from './types'

/**
 * XLSX / XLSM (S08-T01). exceljs, not the npm `xlsx` package (stale on npm, known prototype-pollution issues):
 * formula cells give their cached result, merged ranges are expanded onto the top-left cell as "[merged A5:C5]",
 * hidden sheets, rows and columns are marked. Values are rendered as written; nothing is computed here.
 */
type CellValue = ExcelJS.CellValue

function valueOf(v: CellValue): { v: string; formula: boolean } {
  if (v === null || v === undefined) return { v: '', formula: false }
  if (typeof v === 'object' && !(v instanceof Date)) {
    if ('formula' in v || 'sharedFormula' in v) {
      const r = (v as ExcelJS.CellFormulaValue).result
      const res = typeof r === 'object' && r !== null && 'error' in r ? '' : displayValue(r)
      return { v: res, formula: true }
    }
    if ('richText' in v)
      return {
        v: v.richText
          .map((t) => t.text)
          .join('')
          .trim(),
        formula: false,
      }
    if ('text' in v && 'hyperlink' in v) return { v: String(v.text).trim(), formula: false }
    if ('error' in v) return { v: '', formula: false }
  }
  return { v: displayValue(v), formula: false }
}

export async function parseXlsx(bytes: Uint8Array): Promise<ParsedDocument> {
  const wb = new ExcelJS.Workbook()
  try {
    await wb.xlsx.load(Buffer.from(bytes) as unknown as ExcelJS.Buffer)
  } catch (e) {
    const msg = (e as Error).message
    if (/encrypt|password/i.test(msg)) return { kind: 'password_protected' }
    return { kind: 'unreadable', detail: `Could not open the workbook (${msg.slice(0, 80)})` }
  }
  const grid: SheetGrid = { sheets: [] }
  for (const ws of wb.worksheets) {
    const merges = new Map<string, string>()
    for (const range of (ws.model as { merges?: string[] }).merges ?? []) {
      const [tl] = range.split(':')
      if (tl) merges.set(tl, range)
    }
    const hiddenCols = new Set<number>()
    for (let c = 1; c <= ws.columnCount; c++) if (ws.getColumn(c).hidden) hiddenCols.add(c)
    const rows: SheetRow[] = []
    ws.eachRow({ includeEmpty: false }, (row, r) => {
      const cells: SheetCell[] = []
      row.eachCell({ includeEmpty: false }, (cell, c) => {
        // A merged range's other cells repeat the master's value: keep only the master.
        if (cell.isMerged && cell.master.address !== cell.address) return
        const { v, formula } = valueOf(cell.value)
        if (v === '') return
        const letter = columnLetter(c)
        const merged = merges.get(`${letter}${r}`)
        cells.push({
          c: letter,
          v,
          ...(merged ? { merged } : {}),
          ...(formula ? { formula: true } : {}),
          ...(hiddenCols.has(c) ? { hidden: true } : {}),
        })
      })
      rows.push({ r, ...(row.hidden ? { hidden: true } : {}), cells })
    })
    grid.sheets.push({ name: ws.name, hidden: ws.state !== 'visible', rows })
  }
  const { text, chunks } = gridToText(grid)
  return { kind: 'sheet', format: 'xlsx', grid, text, chunks }
}
