import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixture } from './parse/fixtures'
import { memoryStorage } from './testing/memory-storage'

vi.mock('../settings/get', () => ({
  getSetting: async () => ({ callbackAlertMinutes: 45, duplicateWindowDays: 7, maxUploadMb: 1 }),
}))
const { createUploadSlots, intakeKey, intakeRefusal, isIntakeKey, verifyIntakeObject } =
  await import('./upload')
const { setStorageForTests } = await import('../storage/storage')
const { SafeError } = await import('../../lib/safe-message')

/**
 * Intake uploads (S08-T03): refusals before a URL is issued, keys without the file's name, and the read-back that
 * trusts the bytes, not the name.
 */
const BATCH = '0193a5b2-7c1d-7e3f-8a9b-0000000000b1'
let mem: ReturnType<typeof memoryStorage>
beforeEach(() => {
  mem = memoryStorage()
  setStorageForTests(mem.storage)
})
afterEach(() => setStorageForTests(null))

describe('intake uploads', () => {
  it('refuses empty, too large and unread types before a URL exists', async () => {
    expect(intakeRefusal({ name: 'a.pdf', size: 0 }, 1024)).toBe('That file is empty.')
    expect(intakeRefusal({ name: 'a.pdf', size: 2_000_000 }, 1024 * 1024)).toMatch(/^Over 1 MB/)
    expect(intakeRefusal({ name: 'a.exe', size: 10 }, 1024)).toMatch(/^Use PDF/)
    const slots = await createUploadSlots(BATCH, [
      { name: 'Sample Client RFQ.pdf', size: 100 },
      { name: 'huge.pdf', size: 5_000_000 },
    ])
    expect(slots[1]).toEqual({
      name: 'huge.pdf',
      error: 'Over 1 MB: send a smaller file or split it.',
    })
    const ok = slots[0] as { key: string }
    expect(isIntakeKey(BATCH, ok.key)).toBe(true)
  })

  it('the key never carries the file name', () => {
    const k = intakeKey(BATCH, 'Sample Client LLC - RFQ 0921.pdf')
    expect(k).toMatch(new RegExp(`^intake/${BATCH}/[0-9a-f-]{36}\\.pdf$`))
    expect(k.toLowerCase()).not.toContain('sample')
    expect(isIntakeKey(BATCH, `intake/${BATCH}/../x.pdf`)).toBe(false)
  })

  it('reads the object back: a real PDF passes with its hash and size', async () => {
    const key = intakeKey(BATCH, 'rfq.pdf')
    const bytes = fixture('rfq-3-pages.pdf')
    mem.put('ops-uploads', key, bytes)
    const v = await verifyIntakeObject(BATCH, key, 'rfq.pdf')
    expect(v).toMatchObject({ kind: 'pdf', mime: 'application/pdf', sizeBytes: bytes.length })
    expect(v.sha256).toMatch(/^[0-9a-f]{64}$/)
  })

  it('a PDF named .xlsx is refused and deleted', async () => {
    const key = intakeKey(BATCH, 'lines.xlsx')
    mem.put('ops-uploads', key, fixture('rfq-3-pages.pdf'))
    await expect(verifyIntakeObject(BATCH, key, 'lines.xlsx')).rejects.toBeInstanceOf(SafeError)
    expect(mem.removed).toEqual([`ops-uploads/${key}`])
  })

  it('a key from another batch is refused', async () => {
    const key = intakeKey('0193a5b2-7c1d-7e3f-8a9b-0000000000b2', 'rfq.pdf')
    await expect(verifyIntakeObject(BATCH, key, 'rfq.pdf')).rejects.toThrow(
      'The upload did not arrive. Try again.'
    )
  })
})
