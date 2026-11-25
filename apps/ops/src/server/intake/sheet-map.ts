import 'server-only'
import { createHash } from 'node:crypto'
import {
  MAP_TARGETS,
  applyRemembered,
  byHeaderOf,
  columnOrder,
  computeLineConfidence,
  detectTable,
  headerSignature,
  inferMapping,
  looksLikePartNumber,
  normaliseUom,
  parseQuantity,
  partNoNorm,
  type ColumnGuess,
  type DetectedTable,
  type MapTarget,
  type PartMatchMethod,
  type UomTable,
  uomKey,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import type { SourceSpanDraft } from '@indus/ops-ai'
import { SafeError } from '../../lib/safe-message'
import { TX_OPTIONS } from '../../lib/tx-options'
import { matchParts } from '../parts/match'
import type { CandidateDraft } from './candidates'
import { bumpIntake } from './live'
import { parseStoredFile } from './parse/index'
import type { SheetGrid, SheetGridSheet } from './parse/types'
import { stageCandidates } from './stage'
import { loadUnits, uomTableOf } from './units'

/**
 * Spreadsheet intake (S08-T05, board 35). A sheet does not go to the model: its table is found in code (header row
 * under merged titles, totals skipped), its columns are mapped to line fields (inferred, or the client's remembered
 * mapping applied by header text), and the lines are written straight from the cells with a `sheet` span per value.
 * The person can change any column's field; each change rewrites the file's lines. "Continue to review" confirms the
 * mapping and, when "Remember" is on and the client is known, saves it for that client's next sheet.
 */
export interface SheetMapState {
  sheet: string
  headerRow: number
  /** sha256 of `headerSignature` (sorted, normalised header cells). */
  signature: string
  columns: Array<Pick<ColumnGuess, 'c' | 'header' | 'target' | 'sample'>>
  /** Raw unit (uppercase) → unit code the person chose for a unit the table does not know. */
  units: Record<string, string>
  remember: boolean
  /** A client's remembered mapping was applied. */
  remembered: boolean
  confirmedAt: string | null
}

export const signatureOf = (header: ReadonlyArray<{ v: string }>): string =>
  createHash('sha256').update(headerSignature(header)).digest('hex')

function cellMap(sheet: SheetGridSheet): Map<number, Map<string, string>> {
  return new Map(sheet.rows.map((r) => [r.r, new Map(r.cells.map((c) => [c.c, c.v]))]))
}

/** The sheet to read: the one asked for, else the first visible sheet with a table. */
export function pickSheet(
  grid: SheetGrid,
  name?: string | null
): { sheet: SheetGridSheet; table: DetectedTable } | null {
  const order = name
    ? grid.sheets.filter((s) => s.name === name)
    : [...grid.sheets.filter((s) => !s.hidden), ...grid.sheets.filter((s) => s.hidden)]
  for (const sheet of order) {
    const table = detectTable(sheet.rows)
    if (table) return { sheet, table }
  }
  return null
}

/** Other sheets that also hold a table (board 35 "Consumables also has a table · 8 rows"). */
export function otherTables(
  grid: SheetGrid,
  current: string
): Array<{ sheet: string; rows: number }> {
  return grid.sheets
    .filter((s) => s.name !== current && !s.hidden)
    .flatMap((s) => {
      const t = detectTable(s.rows)
      return t?.lineRows.length ? [{ sheet: s.name, rows: t.lineRows.length }] : []
    })
}

export function guessColumns(
  sheet: SheetGridSheet,
  table: DetectedTable,
  units: UomTable
): ColumnGuess[] {
  const cells = cellMap(sheet)
  // A hidden column is never mapped: what the client hid is not part of the request.
  const hidden = new Set(sheet.rows.flatMap((r) => r.cells.filter((c) => c.hidden).map((c) => c.c)))
  const header = [...(cells.get(table.headerRow) ?? new Map<string, string>())]
    .filter(([c]) => !hidden.has(c))
    .map(([c, v]) => ({ c, v }))
  const samples = new Map<string, string[]>()
  for (const r of table.lineRows.slice(0, 20))
    for (const [c, v] of cells.get(r) ?? []) samples.set(c, [...(samples.get(c) ?? []), v])
  return inferMapping(header, samples, units)
}

/** One draft per line row, values from the cells; code reads the quantity and the unit, never a model. */
export function draftsFromSheet(
  sheet: SheetGridSheet,
  table: DetectedTable,
  map: Pick<SheetMapState, 'columns' | 'units'>,
  ctx: { storedFileId: string; units: UomTable; matches: ReadonlyMap<string, MatchLike> }
): CandidateDraft[] {
  const cells = cellMap(sheet)
  const colOf = (t: MapTarget) => map.columns.find((c) => c.target === t)?.c ?? null
  const uomTable: UomTable = {
    codes: ctx.units.codes,
    aliases: new Map([...ctx.units.aliases, ...Object.entries(map.units)]),
  }
  const out: CandidateDraft[] = []
  for (const r of table.lineRows) {
    const row = cells.get(r) ?? new Map<string, string>()
    const val = (t: MapTarget) => {
      const c = colOf(t)
      const v = c ? (row.get(c) ?? '').trim() : ''
      return v ? { c: c!, v } : null
    }
    const desc = val('description')
    const qty = val('qty')
    if (!desc && !qty) continue
    const part = val('part_no')
    const uomCell = val('uom')
    const parsed = parseQuantity(qty?.v ?? null, 'dot')
    const uomRaw = uomCell?.v ?? parsed.unitText ?? null
    // The person's choice for a unit as written wins over the table (board 35's unit chips).
    const override = uomRaw ? map.units[uomKey(uomRaw)] : undefined
    const uom = override
      ? { code: override, method: 'alias' as const }
      : normaliseUom(uomRaw, uomTable)
    const spans: SourceSpanDraft[] = (
      [
        ['description', desc],
        ['qty', qty],
        ['uom', uomCell],
        ['partNumber', part],
        ['spec', val('spec')],
        ['make', val('make')],
        ['notes', val('notes')],
      ] as const
    ).flatMap(([field, cell]) =>
      cell
        ? [
            {
              field,
              sourceKind: 'sheet' as const,
              sourceId: ctx.storedFileId,
              page: null,
              sheet: sheet.name,
              cellRef: `${cell.c}${r}`,
              charStart: null,
              charEnd: null,
              bbox: null,
              quote: cell.v,
              resolved: 'exact' as const,
              textHash: null,
            },
          ]
        : []
    )
    const norm = part ? partNoNorm(part.v) : null
    const m = norm ? ctx.matches.get(norm) : undefined
    // The extractor's rule: no hit, but shaped like a part number, reads as a pattern match.
    const partMatch: PartMatchMethod = m
      ? m.method === 'none' && looksLikePartNumber(part!.v)
        ? 'pattern'
        : m.method
      : part && looksLikePartNumber(part.v)
        ? 'pattern'
        : 'none'
    const conf = computeLineConfidence({
      evidence: {
        description: desc ? 'resolved' : 'missing',
        qty: qty ? 'resolved' : 'missing',
        uom: uomCell ? 'resolved' : 'missing',
        partNumber: part ? 'resolved' : 'missing',
      },
      qty: { value: parsed.value, problem: parsed.problem },
      qtyConflict: false,
      uomMethod: uomCell ? uom.method : parsed.unitText ? uom.method : 'missing',
      partNumber: part?.v ?? null,
      partMatch,
      lookalikeAmbiguous: false,
      doubtFields: [],
      alternativeMake: false,
    })
    out.push({
      ord: out.length + 1,
      description: desc?.v ?? '',
      qty: parsed.value === null ? null : Number(parsed.value.toFixed(4)).toString(),
      qtyPrinted: qty?.v ?? null,
      // An unknown unit is kept as written and flagged (board 35 "DRUM · kept, check").
      uom: uom.code ?? (uomRaw ? uomRaw.toUpperCase() : 'EA'),
      uomRaw,
      uomMethod: uom.method,
      partNo: part?.v ?? null,
      partNoNorm: norm,
      make: val('make')?.v ?? null,
      spec: val('spec')?.v ?? null,
      certification: null,
      clientRef: null,
      notes: val('notes')?.v ?? null,
      confidence: conf.confidence,
      reasons: conf.reasons,
      unsure: null,
      partId: m?.partId ?? null,
      partMatch,
      catalogueProductId: m?.catalogueProductId ?? null,
      spans,
      sourcePage: null,
      sourceKind: 'sheet',
      sourceDetail: `R${r}`,
      doubts: [],
      alternativeMake: false,
    })
  }
  return out
}

type MatchLike = Pick<
  Awaited<ReturnType<typeof matchParts>> extends Map<string, infer V> ? V : never,
  'method' | 'partId' | 'catalogueProductId'
>

interface LoadedSheetFile {
  id: string
  batchId: string
  storedFileId: string
  companyId: string | null
  map: SheetMapState | null
  grid: SheetGrid
}

async function loadSheetFile(fileId: string): Promise<LoadedSheetFile> {
  const f = await opsDb.intakeFile.findUnique({
    where: { id: fileId },
    select: {
      id: true,
      batchId: true,
      kind: true,
      sheetMap: true,
      batch: { select: { clientCompanyId: true, status: true } },
      storedFile: { select: { id: true, bucket: true, path: true, filename: true } },
    },
  })
  if (!f || f.kind !== 'sheet' || !f.storedFile)
    throw new SafeError('That spreadsheet is no longer in the intake.')
  if (f.batch.status !== 'open') throw new SafeError('These lines are already confirmed.')
  const doc = await parseStoredFile(f.storedFile)
  if (doc.kind !== 'sheet') throw new SafeError('That file could not be read as a spreadsheet.')
  return {
    id: f.id,
    batchId: f.batchId,
    storedFileId: f.storedFile.id,
    companyId: f.batch.clientCompanyId,
    map: (f.sheetMap as SheetMapState | null) ?? null,
    grid: doc.grid,
  }
}

async function rewriteLines(
  file: LoadedSheetFile,
  map: SheetMapState,
  mappingId?: string | null
): Promise<{ lines: number; toCheck: number }> {
  const picked = pickSheet(file.grid, map.sheet)
  if (!picked) throw new SafeError('No table was found on that sheet.')
  const table = detectTable(picked.sheet.rows, { headerRow: map.headerRow }) ?? picked.table
  const units = uomTableOf(await loadUnits())
  const partCol = map.columns.find((c) => c.target === 'part_no')?.c
  const partCells = partCol
    ? picked.sheet.rows.flatMap((r) => r.cells.filter((c) => c.c === partCol).map((c) => c.v))
    : []
  const matches = await matchParts(partCells)
  const drafts = draftsFromSheet(picked.sheet, table, map, {
    storedFileId: file.storedFileId,
    units,
    matches,
  })
  return opsDb.$transaction(async (tx) => {
    await tx.intakeLineCandidate.deleteMany({ where: { fileId: file.id } })
    const staged = await stageCandidates(tx, {
      batchId: file.batchId,
      fileId: file.id,
      actionId: null,
      drafts,
    })
    await tx.intakeFile.update({
      where: { id: file.id },
      data: {
        sheetMap: map as unknown as Prisma.InputJsonValue,
        status: 'ready',
        progressPct: 100,
        progressNote: map.confirmedAt ? null : 'Columns to map',
        linesFound: drafts.length,
        linesToCheck: staged.toCheck,
        ...(mappingId !== undefined ? { mappingId } : {}),
      },
    })
    await bumpIntake(file.batchId, tx)
    return { lines: drafts.length, toCheck: staged.toCheck }
  }, TX_OPTIONS)
}

/**
 * The capture job's sheet step: find the table, apply the client's remembered mapping (used count + 1) or infer
 * one, and write the lines. The file is Ready with "Columns to map" until a person confirms.
 */
export async function mapSheetFile(
  fileId: string
): Promise<{ lines: number; remembered: boolean }> {
  const file = await loadSheetFile(fileId)
  const picked = pickSheet(file.grid)
  if (!picked) {
    await opsDb.intakeFile.update({
      where: { id: fileId },
      data: {
        status: 'needs_attention',
        failureKind: 'unreadable',
        failureNote: 'No table with a header row was found in this spreadsheet',
        progressPct: 100,
      },
    })
    await bumpIntake(file.batchId)
    return { lines: 0, remembered: false }
  }
  const units = uomTableOf(await loadUnits())
  let columns = guessColumns(picked.sheet, picked.table, units)
  const header = columns.map((c) => ({ v: c.header }))
  const signature = signatureOf(header)
  let remembered = false
  let mappingId: string | null = null
  let unitOverrides: Record<string, string> = {}
  if (file.companyId) {
    const saved = await opsDb.clientColumnMapping.findUnique({
      where: { companyId_fileSignature: { companyId: file.companyId, fileSignature: signature } },
      select: { id: true, byHeader: true, unitOverrides: true },
    })
    if (saved) {
      columns = applyRemembered(columns, saved.byHeader as Record<string, string>)
      unitOverrides = (saved.unitOverrides as Record<string, string>) ?? {}
      remembered = true
      mappingId = saved.id
      await opsDb.clientColumnMapping.update({
        where: { id: saved.id },
        data: { usedCount: { increment: 1 }, lastUsedAt: new Date() },
      })
    }
  }
  const map: SheetMapState = {
    sheet: picked.sheet.name,
    headerRow: picked.table.headerRow,
    signature,
    columns: columns.map(({ c, header: h, target, sample }) => ({ c, header: h, target, sample })),
    units: unitOverrides,
    remember: true,
    remembered,
    confirmedAt: null,
  }
  const r = await rewriteLines(file, map, mappingId)
  return { lines: r.lines, remembered }
}

const isTarget = (t: string): t is MapTarget => (MAP_TARGETS as readonly string[]).includes(t)

/** Board 35's controls: a column's field, the sheet, the header row, a unit, or the Remember toggle. */
export async function updateSheetMap(
  fileId: string,
  change:
    | { kind: 'column'; c: string; target: string }
    | { kind: 'sheet'; sheet: string }
    | { kind: 'header'; row: number }
    | { kind: 'unit'; raw: string; code: string }
    | { kind: 'remember'; on: boolean }
): Promise<{ lines: number; toCheck: number }> {
  const file = await loadSheetFile(fileId)
  const map = file.map
  if (!map) throw new SafeError('This spreadsheet has not been read yet.')
  if (change.kind === 'remember') {
    await opsDb.intakeFile.update({
      where: { id: fileId },
      data: { sheetMap: { ...map, remember: change.on } as unknown as Prisma.InputJsonValue },
    })
    await bumpIntake(file.batchId)
    return { lines: 0, toCheck: 0 }
  }
  let next: SheetMapState = { ...map }
  if (change.kind === 'column') {
    if (!isTarget(change.target)) throw new SafeError('Choose a field from the list.')
    // A field belongs to one column: moving it here frees it elsewhere.
    next.columns = map.columns.map((c) =>
      c.c === change.c
        ? { ...c, target: change.target as MapTarget }
        : c.target === change.target && change.target !== 'ignore'
          ? { ...c, target: 'ignore' }
          : c
    )
  } else if (change.kind === 'unit') {
    next.units = { ...map.units, [change.raw.toUpperCase()]: change.code }
  } else {
    const units = uomTableOf(await loadUnits())
    const picked =
      change.kind === 'sheet' ? pickSheet(file.grid, change.sheet) : pickSheet(file.grid, map.sheet)
    if (!picked) throw new SafeError('No table was found on that sheet.')
    const table =
      change.kind === 'header'
        ? (detectTable(picked.sheet.rows, { headerRow: change.row }) ?? picked.table)
        : picked.table
    const columns = guessColumns(picked.sheet, table, units)
    next = {
      ...map,
      sheet: picked.sheet.name,
      headerRow: table.headerRow,
      signature: signatureOf(columns.map((c) => ({ v: c.header }))),
      columns: columns.map(({ c, header, target, sample }) => ({ c, header, target, sample })),
      remembered: false,
    }
  }
  next.columns = [...next.columns].sort((a, b) => columnOrder(a.c, b.c))
  return rewriteLines(file, next)
}

/**
 * "Continue to review": the mapping is confirmed, and saved for the client when Remember is on and the batch has a
 * client. Returns where to go next.
 */
export async function confirmSheetMap(
  p: { id: string },
  fileId: string
): Promise<{ batchId: string; saved: boolean }> {
  const file = await loadSheetFile(fileId)
  const map = file.map
  if (!map) throw new SafeError('This spreadsheet has not been read yet.')
  if (!map.columns.some((c) => c.target === 'description'))
    throw new SafeError('Map a column to Description first.')
  if (!map.columns.some((c) => c.target === 'qty'))
    throw new SafeError('Map a column to Quantity first.')
  let saved = false
  await opsDb.$transaction(async (tx) => {
    let mappingId: string | null = null
    if (map.remember && file.companyId) {
      const row = await tx.clientColumnMapping.upsert({
        where: {
          companyId_fileSignature: { companyId: file.companyId, fileSignature: map.signature },
        },
        create: {
          companyId: file.companyId,
          fileSignature: map.signature,
          sheetName: map.sheet,
          headerRow: map.headerRow,
          mapping: Object.fromEntries(map.columns.map((c) => [c.c, c.target])),
          byHeader: byHeaderOf(map.columns.map((c) => ({ ...c, score: 0 }))),
          unitOverrides: map.units,
          usedCount: 1,
          lastUsedAt: new Date(),
          createdById: p.id,
        },
        update: {
          sheetName: map.sheet,
          headerRow: map.headerRow,
          mapping: Object.fromEntries(map.columns.map((c) => [c.c, c.target])),
          byHeader: byHeaderOf(map.columns.map((c) => ({ ...c, score: 0 }))),
          unitOverrides: map.units,
        },
        select: { id: true },
      })
      mappingId = row.id
      saved = true
    }
    await tx.intakeFile.update({
      where: { id: fileId },
      data: {
        sheetMap: {
          ...map,
          confirmedAt: new Date().toISOString(),
        } as unknown as Prisma.InputJsonValue,
        progressNote: null,
        ...(mappingId ? { mappingId } : {}),
      },
    })
    await bumpIntake(file.batchId, tx)
  }, TX_OPTIONS)
  return { batchId: file.batchId, saved }
}
