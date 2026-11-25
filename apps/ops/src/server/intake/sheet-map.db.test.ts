import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import { fixture } from './parse/fixtures'
import { memoryStorage } from './testing/memory-storage'

/**
 * Board 35 on the local database (S08-T05): a spreadsheet is mapped in code — header row under the merged titles,
 * totals skipped, units normalised, a line with no part number flagged — and its lines are written straight from
 * the cells with a `sheet` span per value. "Remember" saves the mapping for the client, and the client's next
 * sheet opens with it applied (used count + 1), even with its columns reordered.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../inngest/emit', () => ({
  emitEventOrThrow: async () => undefined,
  emitEvent: async () => true,
}))
vi.mock('../settings/get', () => ({
  getSetting: async () => ({ maxUploadMb: 20 }),
}))

const { setStorageForTests } = await import('../storage/storage')
const { confirmIntakeUpload, intakeKey } = await import('./upload')
const { createIntakeBatch } = await import('./queue')
const { mapSheetFile, updateSheetMap, confirmSheetMap } = await import('./sheet-map')
const { getSheetMap } = await import('../../data/intake-map')

describe.skipIf(!DB_URL)('sheet mapping · local database', () => {
  const mem = memoryStorage()
  let owner = { id: '', name: '' }
  let companyId = ''
  const batches: string[] = []

  async function upload(name: string, bytes: Uint8Array) {
    const b = await createIntakeBatch(owner.id)
    batches.push(b.batchId)
    await opsDb.intakeBatch.update({
      where: { id: b.batchId },
      data: { clientCompanyId: companyId },
    })
    const key = intakeKey(b.batchId, name)
    mem.put('ops-uploads', key, bytes)
    const f = await confirmIntakeUpload({
      batchId: b.batchId,
      key,
      filename: name,
      userId: owner.id,
    })
    return { batchId: b.batchId, fileId: f.intakeFileId }
  }

  beforeAll(async () => {
    setStorageForTests(mem.storage)
    owner = await opsDb.user.findFirstOrThrow({
      where: { role: 'owner' },
      select: { id: true, name: true },
    })
    companyId = (
      await opsDb.company.create({
        data: { name: `Sample Client LLC ${Date.now()}` },
        select: { id: true },
      })
    ).id
  })

  afterAll(async () => {
    const files = await opsDb.intakeFile.findMany({
      where: { batchId: { in: batches } },
      select: { storedFileId: true },
    })
    await opsDb.intakeBatch.deleteMany({ where: { id: { in: batches } } })
    await opsDb.storedFile.deleteMany({
      where: { id: { in: files.flatMap((f) => (f.storedFileId ? [f.storedFileId] : [])) } },
    })
    await opsDb.clientColumnMapping.deleteMany({ where: { companyId } })
    await opsDb.company.delete({ where: { id: companyId } })
    setStorageForTests(null)
    // Each test file has its own client under --isolate=modules: release it, or a full run passes ops_app's 15.
    await opsDb.$disconnect()
  })

  let first = { batchId: '', fileId: '' }

  it('maps the sheet in code: header row 4, twelve lines, totals skipped, a sheet span per value', async () => {
    first = await upload('spares.xlsx', fixture('spares.xlsx'))
    const r = await mapSheetFile(first.fileId)
    expect(r).toEqual({ lines: 12, remembered: false })
    const f = await opsDb.intakeFile.findUniqueOrThrow({ where: { id: first.fileId } })
    expect(f).toMatchObject({ status: 'ready', linesFound: 12, progressNote: 'Columns to map' })
    expect((f.sheetMap as { headerRow: number }).headerRow).toBe(4)
    const lines = await opsDb.intakeLineCandidate.findMany({
      where: { fileId: first.fileId },
      orderBy: { ord: 'asc' },
    })
    expect(lines).toHaveLength(12)
    expect(lines[0]).toMatchObject({
      description: 'Hydraulic hose 1/2" 2SN, 3 m, JIC F/F',
      partNo: 'TEST-08-2SN-3000',
      uom: 'EA',
      uomRaw: 'NOS',
      sourceKind: 'sheet',
      sourceDetail: 'R5',
    })
    expect(lines[0]!.qty?.toString()).toBe('24')
    // Cells are read exactly and a part number shaped like one is a pattern match: two lines are to check — one
    // without a part number, one whose part number has no digits (not seen before).
    expect(lines.filter((l) => l.confidence !== 'sure').map((l) => l.ord)).toEqual([10, 12])
    expect(lines[11]).toMatchObject({ partNo: null, confidence: 'likely', notes: 'P/N to follow' })
    expect(lines[11]!.reasons).toContain('No part no. · matched by description')
    const spans = await opsDb.sourceSpan.findMany({ where: { id: { in: lines[0]!.spanIds } } })
    expect(spans.map((s) => s.cellRef).sort()).toEqual(['B5', 'C5', 'D5', 'E5'])
    expect(spans.every((s) => s.sheet === 'Spares list' && s.sourceKind === 'sheet')).toBe(true)
  })

  it('board 35 shows what was detected and the units normalised', async () => {
    const m = (await getSheetMap(first.batchId, first.fileId))!
    expect(m.titleNote).toBe('Rows 1–2 are a merged title')
    expect(m.dataNote).toBe('5–16 · 12 lines · row 18 is a total and is skipped')
    expect(m.others).toEqual([{ sheet: 'Consumables', rows: 8 }])
    expect(m.mapping.map((c) => c.target)).toEqual([
      'line_no',
      'description',
      'part_no',
      'qty',
      'uom',
      'notes',
    ])
    expect(m.units).toEqual(
      expect.arrayContaining([
        { raw: 'NOS', code: 'EA', count: 7, overridden: false },
        { raw: 'PCS', code: 'EA', count: 2, overridden: false },
        { raw: 'DRUM', code: 'DRUM', count: 1, overridden: false },
      ])
    )
    expect(m.missingPart).toEqual([12])
    expect(m.rows.find((r) => r.r === 18)!.tint).toBe('skipped')
    expect(m.rows.find((r) => r.r === 16)!.tint).toBe('missing_part')
  })

  it('a column change rewrites the lines; a field moves, it is not duplicated', async () => {
    await updateSheetMap(first.fileId, { kind: 'column', c: 'F', target: 'spec' })
    const lines = await opsDb.intakeLineCandidate.findMany({
      where: { fileId: first.fileId },
      orderBy: { ord: 'asc' },
    })
    expect(lines[3]).toMatchObject({ spec: 'As per sample', notes: null })
    await updateSheetMap(first.fileId, { kind: 'column', c: 'F', target: 'description' })
    const m = (await getSheetMap(first.batchId, first.fileId))!
    expect(m.mapping.filter((c) => c.target === 'description').map((c) => c.c)).toEqual(['F'])
    // Put it back the way the client's sheet reads.
    await updateSheetMap(first.fileId, { kind: 'column', c: 'B', target: 'description' })
    await updateSheetMap(first.fileId, { kind: 'column', c: 'F', target: 'notes' })
    expect((await getSheetMap(first.batchId, first.fileId))!.mapping.map((c) => c.target)).toEqual([
      'line_no',
      'description',
      'part_no',
      'qty',
      'uom',
      'notes',
    ])
  })

  it('Continue remembers the mapping for the client; their next sheet opens with it applied', async () => {
    const fresh = await upload('spares-again.xlsx', fixture('spares.xlsx'))
    await mapSheetFile(fresh.fileId)
    await updateSheetMap(fresh.fileId, { kind: 'column', c: 'F', target: 'spec' })
    const out = await confirmSheetMap(owner, fresh.fileId)
    expect(out).toMatchObject({ batchId: fresh.batchId, saved: true })
    const saved = await opsDb.clientColumnMapping.findFirstOrThrow({ where: { companyId } })
    expect(saved.usedCount).toBe(1)
    expect((saved.byHeader as Record<string, string>).remarks).toBe('spec')

    const second = await upload('spares-q1.xlsx', fixture('spares.xlsx'))
    const r = await mapSheetFile(second.fileId)
    expect(r.remembered).toBe(true)
    const m = (await getSheetMap(second.batchId, second.fileId))!
    expect(m.remembered).toBe(true)
    expect(m.mapping.find((c) => c.c === 'F')!.target).toBe('spec')
    expect(
      (await opsDb.clientColumnMapping.findUniqueOrThrow({ where: { id: saved.id } })).usedCount
    ).toBe(2)
  })

  it('the person can set the code for a unit as written', async () => {
    await updateSheetMap(first.fileId, { kind: 'unit', raw: 'drum', code: 'L' })
    const oil = await opsDb.intakeLineCandidate.findFirstOrThrow({
      where: { fileId: first.fileId, uomRaw: 'DRUM' },
    })
    expect(oil.uom).toBe('L')
  })

  it('Continue needs a description and a quantity column', async () => {
    await updateSheetMap(first.fileId, { kind: 'column', c: 'D', target: 'ignore' })
    await expect(confirmSheetMap(owner, first.fileId)).rejects.toThrow(
      'Map a column to Quantity first.'
    )
  })
})
