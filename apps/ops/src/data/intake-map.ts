import 'server-only'
import {
  MAP_TARGET_LABEL,
  MAP_TARGET_SHORT,
  columnOrder,
  detectTable,
  rowRanges,
  unitCounts,
  uomKey,
  type MapTarget,
} from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { parseStoredFile } from '../server/intake/parse/index'
import { otherTables, pickSheet, type SheetMapState } from '../server/intake/sheet-map'
import { loadUnits, uomTableOf } from '../server/intake/units'

/**
 * Board 35 · Map spreadsheet columns (S08-T05). One read of the file and its batch, one of its lines, one of the
 * unit table; the grid comes from parsing the stored file (no copy of the cells is kept in the database).
 */
export interface MapCell {
  c: string
  v: string
  formula: boolean
}
export interface MapRow {
  r: number
  cells: MapCell[]
  /** header | skipped | missing_part | line | none */
  tint: 'header' | 'skipped' | 'missing_part' | 'line' | 'none'
}

export interface MapModel {
  batchId: string
  file: { id: string; name: string }
  sheets: Array<{ name: string; hidden: boolean }>
  sheetIndex: number
  sheet: string
  rowCount: number
  colCount: number
  columns: string[]
  rows: MapRow[]
  formulaCells: number
  headerRow: number
  headerOptions: Array<{ value: string; label: string }>
  titleNote: string | null
  dataNote: string
  others: Array<{ sheet: string; rows: number }>
  client: { name: string; how: string } | null
  mapping: Array<{ c: string; header: string; target: MapTarget; sample: string }>
  strip: Array<{ c: string; label: string }>
  /** Column widths for the preview, by the field each column maps to. */
  widths: Record<string, string>
  targetOptions: Array<{ value: MapTarget; label: string }>
  units: Array<{ raw: string; code: string | null; count: number; overridden: boolean }>
  unitCodes: string[]
  missingPart: number[]
  remember: boolean
  remembered: boolean
  confirmed: boolean
  lines: number
  toCheck: number
}

const WIDTH: Record<MapTarget, string> = {
  line_no: 'w-[34px]',
  description: '',
  part_no: 'w-[116px]',
  qty: 'w-[38px]',
  uom: 'w-[52px]',
  spec: 'w-[98px]',
  make: 'w-[90px]',
  notes: 'w-[98px]',
  ignore: 'w-[80px]',
}

const TARGETS: MapTarget[] = [
  'line_no',
  'description',
  'part_no',
  'qty',
  'uom',
  'spec',
  'make',
  'notes',
  'ignore',
]

export async function getSheetMap(batchId: string, fileId: string | null): Promise<MapModel | null> {
  const file = await opsDb.intakeFile.findFirst({
    where: { batchId, kind: 'sheet', ...(fileId ? { id: fileId } : {}), status: { not: 'removed' } },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      filename: true,
      sheetMap: true,
      batch: { select: { clientCompany: { select: { name: true } } } },
      storedFile: { select: { bucket: true, path: true, filename: true } },
      candidates: {
        where: { decision: { notIn: ['removed', 'merged'] } },
        orderBy: { ord: 'asc' },
        select: { partNo: true, uomRaw: true, confidence: true, sourceDetail: true },
      },
    },
  })
  if (!file?.storedFile) return null
  const map = file.sheetMap as SheetMapState | null
  const doc = await parseStoredFile(file.storedFile)
  if (doc.kind !== 'sheet') return null
  const picked = pickSheet(doc.grid, map?.sheet)
  if (!picked) return null
  const table = detectTable(picked.sheet.rows, map ? { headerRow: map.headerRow } : {}) ?? picked.table
  const units = uomTableOf(await loadUnits())
  const overrides = map?.units ?? {}

  const lines = file.candidates
  const lineRowOf = (d: string | null) => (d && /^R\d+$/.test(d) ? Number(d.slice(1)) : null)
  const missingRows = new Set(lines.filter((l) => !l.partNo).map((l) => lineRowOf(l.sourceDetail)))
  const skipped = new Set(table.skipped.map((s) => s.row))
  const lineRows = new Set(table.lineRows)
  const columns = [
    ...new Set(picked.sheet.rows.flatMap((r) => r.cells.map((c) => c.c))),
  ].sort(columnOrder)
  // Every row up to the last, so blank rows show where they are (board 35 hatches row 17).
  const byRow = new Map(picked.sheet.rows.map((r) => [r.r, r]))
  const last = picked.sheet.rows.at(-1)?.r ?? 0
  const allRows = Array.from({ length: last }, (_, i) => byRow.get(i + 1) ?? { r: i + 1, cells: [] })
  const rows: MapRow[] = allRows.map((r) => ({
    r: r.r,
    cells: r.cells.map((c) => ({ c: c.c, v: c.v, formula: !!c.formula })),
    tint:
      r.r === table.headerRow
        ? 'header'
        : skipped.has(r.r)
          ? 'skipped'
          : missingRows.has(r.r)
            ? 'missing_part'
            : lineRows.has(r.r)
              ? 'line'
              : 'none',
  }))
  const titles = table.skipped.filter((s) => s.why === 'merged_title').map((s) => s.row)
  const totals = table.skipped.filter((s) => s.why === 'totals' || s.why === 'subtotal')
  const missingPart = lines.flatMap((l, i) => (l.partNo ? [] : [i + 1]))
  const mapping = (map?.columns ?? []).map((c) => ({ ...c }))
  const uomCounts = unitCounts(
    lines.map((l) => l.uomRaw),
    { codes: units.codes, aliases: new Map([...units.aliases, ...Object.entries(overrides)]) }
  )
  return {
    batchId,
    file: { id: file.id, name: file.filename },
    sheets: doc.grid.sheets.map((s) => ({ name: s.name, hidden: s.hidden })),
    sheetIndex: doc.grid.sheets.findIndex((s) => s.name === picked.sheet.name) + 1,
    sheet: picked.sheet.name,
    rowCount: picked.sheet.rows.at(-1)?.r ?? 0,
    colCount: columns.length,
    columns,
    rows,
    formulaCells: picked.sheet.rows.reduce((n, r) => n + r.cells.filter((c) => c.formula).length, 0),
    headerRow: table.headerRow,
    headerOptions: picked.sheet.rows
      .filter((r) => r.r <= Math.max(table.headerRow + 5, 10) && r.cells.some((c) => c.v.trim()))
      .map((r) => ({
        value: String(r.r),
        label: `Row ${r.r} · ${r.cells
          .map((c) => c.v.trim())
          .filter(Boolean)
          .slice(0, 3)
          .join(', ')}`.slice(0, 60),
      })),
    titleNote: titles.length
      ? `Row${titles.length === 1 ? '' : 's'} ${rowRanges(titles)} ${titles.length === 1 ? 'is a' : 'are a'} merged title`
      : null,
    dataNote: [
      table.dataRows ? `${table.dataRows[0]}–${table.dataRows[1]}` : 'none',
      `${table.lineRows.length} line${table.lineRows.length === 1 ? '' : 's'}`,
      ...totals.map((t) => `row ${t.row} is a ${t.why === 'subtotal' ? 'subtotal' : 'total'} and is skipped`),
    ].join(' · '),
    others: otherTables(doc.grid, picked.sheet.name),
    client: file.batch.clientCompany
      ? { name: file.batch.clientCompany.name, how: 'from the intake' }
      : null,
    mapping,
    strip: mapping
      .filter((m) => m.target !== 'ignore')
      .map((m) => ({ c: m.c, label: MAP_TARGET_SHORT[m.target] })),
    widths: Object.fromEntries(
      columns.map((c) => [c, WIDTH[mapping.find((m) => m.c === c)?.target ?? 'ignore']])
    ),
    targetOptions: TARGETS.map((t) => ({ value: t, label: MAP_TARGET_LABEL[t] })),
    units: uomCounts.map((u) => ({ ...u, overridden: !!overrides[uomKey(u.raw)] })),
    unitCodes: [...units.codes].sort(),
    missingPart,
    remember: map?.remember ?? true,
    remembered: map?.remembered ?? false,
    confirmed: !!map?.confirmedAt,
    lines: lines.length,
    toCheck: lines.filter((l) => l.confidence !== 'sure').length,
  }
}
