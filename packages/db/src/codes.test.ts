import { describe, expect, test, vi } from 'vitest'

import {
  formatAccountCode,
  formatQuoteCode,
  formatRfqCode,
  nextAccountCode,
  nextQuoteCodeForRfq,
  nextRfqCode,
  QUOTE_CODE_BASE,
} from './codes'

describe('format helpers — pure', () => {
  test('formatRfqCode pads to 4 digits', () => {
    expect(formatRfqCode(2026, 1)).toBe('RFQ-2026-0001')
    expect(formatRfqCode(2026, 42)).toBe('RFQ-2026-0042')
    expect(formatRfqCode(2026, 9999)).toBe('RFQ-2026-9999')
  })

  test('formatRfqCode allows overflow past 4 digits without truncation', () => {
    expect(formatRfqCode(2026, 12345)).toBe('RFQ-2026-12345')
  })

  test('formatAccountCode pads to 4 digits', () => {
    expect(formatAccountCode(2018, 142)).toBe('ACC-2018-0142')
  })

  test('formatQuoteCode applies the Zoho-continuation base', () => {
    expect(QUOTE_CODE_BASE).toBe(26386)
    expect(formatQuoteCode(1)).toBe('INDUS/Q26387')
    expect(formatQuoteCode(2)).toBe('INDUS/Q26388')
  })
})

type FakeCounterRow = { scope: string; year: number; value: number }

function makeFakeClient(initialRows: FakeCounterRow[] = []) {
  const rows = new Map(initialRows.map((r) => [`${r.scope}:${r.year}`, r.value]))
  const upsert = vi.fn(async ({ where, update, create }: any) => {
    const key = `${where.scope_year.scope}:${where.scope_year.year}`
    const existing = rows.get(key)
    if (existing === undefined) {
      rows.set(key, create.value)
      return { value: create.value }
    }
    const next = existing + (update.value.increment ?? 0)
    rows.set(key, next)
    return { value: next }
  })
  const findMany = vi.fn(async () => [])
  return {
    client: {
      counter: { upsert } as any,
      quote: { findMany } as any,
    } as any,
    upsert,
    findMany,
    snapshot: () => Array.from(rows.entries()),
  }
}

describe('nextRfqCode — sequencing', () => {
  test('first call on a fresh year creates value=1 and returns padded code', async () => {
    const fake = makeFakeClient()
    const code = await nextRfqCode(fake.client, new Date('2026-05-05'))
    expect(code).toBe('RFQ-2026-0001')
    expect(fake.upsert).toHaveBeenCalledOnce()
    expect(fake.upsert.mock.calls[0]![0].create).toEqual({ scope: 'rfq', year: 2026, value: 1 })
  })

  test('subsequent calls increment monotonically', async () => {
    const fake = makeFakeClient([{ scope: 'rfq', year: 2026, value: 41 }])
    const a = await nextRfqCode(fake.client, new Date('2026-05-05'))
    const b = await nextRfqCode(fake.client, new Date('2026-05-05'))
    expect(a).toBe('RFQ-2026-0042')
    expect(b).toBe('RFQ-2026-0043')
  })

  test('different years use independent counters', async () => {
    const fake = makeFakeClient()
    const a = await nextRfqCode(fake.client, new Date('2026-12-31'))
    const b = await nextRfqCode(fake.client, new Date('2027-01-01'))
    expect(a).toBe('RFQ-2026-0001')
    expect(b).toBe('RFQ-2027-0001')
  })
})

describe('nextAccountCode', () => {
  test('produces ACC- prefix and pads to 4', async () => {
    const fake = makeFakeClient()
    const code = await nextAccountCode(fake.client, new Date('2026-05-05'))
    expect(code).toBe('ACC-2026-0001')
  })
})

describe('nextQuoteCodeForRfq', () => {
  test('first quote on an RFQ continues the global Zoho sequence', async () => {
    const fake = makeFakeClient()
    const result = await nextQuoteCodeForRfq('rfq-id', fake.client)
    expect(result).toEqual({ kind: 'new', code: 'INDUS/Q26387', revision: 1 })
  })

  test('second quote on the same RFQ becomes a -R2 revision of the latest', async () => {
    const fake = makeFakeClient()
    fake.client.quote.findMany.mockResolvedValueOnce([{ code: 'INDUS/Q26387', revision: 1 }])
    const result = await nextQuoteCodeForRfq('rfq-id', fake.client)
    expect(result).toEqual({
      kind: 'revision',
      code: 'INDUS/Q26387-R2',
      revision: 2,
      ofCode: 'INDUS/Q26387',
    })
  })

  test('third quote on an RFQ becomes -R3', async () => {
    const fake = makeFakeClient()
    fake.client.quote.findMany.mockResolvedValueOnce([{ code: 'INDUS/Q26387-R2', revision: 2 }])
    const result = await nextQuoteCodeForRfq('rfq-id', fake.client)
    expect(result.code).toBe('INDUS/Q26387-R3')
    expect(result.revision).toBe(3)
  })

  test('upsert is called with correct shape (atomic increment)', async () => {
    const fake = makeFakeClient()
    await nextRfqCode(fake.client, new Date('2026-05-05'))
    const args = fake.upsert.mock.calls[0]![0]
    expect(args.where).toEqual({ scope_year: { scope: 'rfq', year: 2026 } })
    expect(args.update).toEqual({ value: { increment: 1 } })
    expect(args.create).toEqual({ scope: 'rfq', year: 2026, value: 1 })
    expect(args.select).toEqual({ value: true })
  })
})
