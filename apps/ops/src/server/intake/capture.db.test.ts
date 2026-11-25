import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import { fixture } from './parse/fixtures'
import { memoryStorage } from './testing/memory-storage'

/**
 * ops.capture.document's steps on the local database (S08-T03), with Storage in memory and events recorded:
 * an encrypted PDF and a 96-dpi scan need attention without a model call; a PDF moves to "Reading 3 pages";
 * a run that staged nothing leaves the file needing a person; an archive becomes its own queued files; a
 * cancelled file is skipped; nothing is written to an enquiry.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({
  captureException: () => undefined,
  withScope: () => undefined,
}))
const events: Array<{ name: string; data: Record<string, unknown> }> = []
vi.mock('../../inngest/emit', () => ({
  emitEventOrThrow: async (e: { name: string; data: Record<string, unknown> }) =>
    void events.push(e),
  emitEvent: async (e: { name: string; data: Record<string, unknown> }) => {
    events.push(e)
    return true
  },
}))
vi.mock('../settings/get', () => ({
  getSetting: async () => ({ callbackAlertMinutes: 45, duplicateWindowDays: 7, maxUploadMb: 20 }),
}))

const { setStorageForTests } = await import('../storage/storage')
const { confirmIntakeUpload, intakeKey } = await import('./upload')
const { createIntakeBatch, cancelExtraction } = await import('./queue')
const { expandArchive, failFile, finishCapture, inspectFile, noteReading, startCapture } =
  await import('./capture')
const { getQueue } = await import('../../data/intake')

describe.skipIf(!DB_URL)('capture steps · local database', () => {
  const mem = memoryStorage()
  let owner = ''
  let batchId = ''
  const add = async (name: string) => {
    const key = intakeKey(batchId, name)
    mem.put('ops-uploads', key, fixture(name))
    return (await confirmIntakeUpload({ batchId, key, filename: name, userId: owner })).intakeFileId
  }

  beforeAll(async () => {
    setStorageForTests(mem.storage)
    owner = (await opsDb.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } }))
      .id
    batchId = (await createIntakeBatch(owner)).batchId
  })

  afterAll(async () => {
    const files = await opsDb.intakeFile.findMany({
      where: { batchId },
      select: { storedFileId: true },
    })
    await opsDb.intakeBatch.delete({ where: { id: batchId } })
    await opsDb.storedFile.deleteMany({
      where: { id: { in: files.flatMap((f) => (f.storedFileId ? [f.storedFileId] : [])) } },
    })
    setStorageForTests(null)
  })

  it('upload queues the file and asks for capture', async () => {
    const id = await add('rfq-3-pages.pdf')
    const f = await opsDb.intakeFile.findUniqueOrThrow({
      where: { id },
      include: { storedFile: true },
    })
    expect(f).toMatchObject({ status: 'queued', kind: 'pdf', filename: 'rfq-3-pages.pdf' })
    expect(f.storedFile).toMatchObject({
      bucket: 'ops-uploads',
      mimeType: 'application/pdf',
      source: 'upload',
    })
    expect(events.at(-1)).toMatchObject({
      name: 'ops/document.capture.requested',
      data: { intakeFileId: id },
    })
  })

  it('a PDF: extracting, then "Reading 3 pages"; a run that staged nothing needs a person', async () => {
    const id = await add('rfq-3-pages.pdf')
    const s = await startCapture(id)
    expect(s.skip).toBe(false)
    const i = await inspectFile(s.file!)
    expect(i).toMatchObject({ pageCount: 3, failure: null })
    await noteReading(id, batchId, i)
    expect(await opsDb.intakeFile.findUniqueOrThrow({ where: { id } })).toMatchObject({
      status: 'extracting',
      progressNote: 'Reading 3 pages',
      pageCount: 3,
    })
    expect(await finishCapture(id, batchId, { skipped: 'budget' })).toBe('needs_attention')
    expect(await opsDb.intakeFile.findUniqueOrThrow({ where: { id } })).toMatchObject({
      status: 'needs_attention',
      progressNote: 'Not read: the monthly AI budget is spent',
    })
  })

  it('encrypted and coarse scans need attention without a model call', async () => {
    const enc = await add('encrypted.pdf')
    const s1 = await startCapture(enc)
    const i1 = await inspectFile(s1.file!)
    expect(i1.failure?.kind).toBe('password_protected')
    await failFile(enc, batchId, i1.failure!)
    const scan = await add('scan-96dpi.jpg')
    const s2 = await startCapture(scan)
    const i2 = await inspectFile(s2.file!)
    expect(i2.failure).toMatchObject({
      kind: 'unreadable',
      note: 'Image too low resolution to read reliably',
      meta: '96 dpi scan',
    })
    await failFile(scan, batchId, i2.failure!)
    const { batches } = await getQueue({ batchId })
    const row = batches[0]!.rows.find((r) => r.id === scan)!
    expect(row).toMatchObject({
      chip: { label: 'Needs attention', tone: 'bad' },
      result: 'Image too low resolution to read reliably',
      meta: 'JPEG · 96 dpi scan',
      action: 'reupload',
    })
  })

  it('an archive becomes its own queued files', async () => {
    const zip = await add('two-files.zip')
    const s = await startCapture(zip)
    const i = await inspectFile(s.file!)
    expect(i.zip).toEqual({ expand: true, entries: 1 })
    const r = await expandArchive(zip, s)
    expect(r).toEqual({ added: 1, refused: [] })
    const child = await opsDb.intakeFile.findFirstOrThrow({ where: { parentFileId: zip } })
    expect(child).toMatchObject({ filename: 'lines.csv', kind: 'sheet', status: 'queued' })
    expect((await opsDb.intakeFile.findUniqueOrThrow({ where: { id: zip } })).progressNote).toBe(
      'Expanded into 1 file'
    )
  })

  it('a cancelled file is skipped; nothing reached an enquiry', async () => {
    const id = await add('semicolons.csv')
    await cancelExtraction(id)
    expect(events.at(-1)).toMatchObject({
      name: 'ops/document.capture.cancelled',
      data: { intakeFileId: id },
    })
    expect((await startCapture(id)).skip).toBe(true)
    expect(
      (await opsDb.intakeBatch.findUniqueOrThrow({ where: { id: batchId } })).enquiryId
    ).toBeNull()
  })
})
