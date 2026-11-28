import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Numbers under concurrency on the local Postgres (S11-T08, ADR-15): 50 allocations in 50 separate transactions
 * at once give 50 distinct consecutive values with no gap, for a global and a month-scoped sequence; a released
 * number is reused first; a number seen outside Operations is skipped and recorded void; an unseeded sequence
 * refuses; and allocating outside a transaction does not compile.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

const GLOBAL = 'zz_test_global'
const MONTH = 'zz_test_month'

async function ensure(key: string, pattern: string, scopeKind: 'global' | 'month', scope: string) {
  await opsDb.numberSequence.upsert({
    where: { key },
    update: {},
    create: { key, label: `Test ${key}`, pattern, scopeKind, signoffStatus: 'not_required' },
  })
  const max = await opsDb.issuedNumber.aggregate({
    where: { sequenceKey: key, scope },
    _max: { value: true },
  })
  const next = Number(max._max.value ?? 0n) + 1
  await opsDb.$executeRaw`SELECT ops.seed_number_sequence(${key}, ${BigInt(next)}, '{"source":"local test"}'::jsonb, ${scope}, NULL)`
  return next
}

describe.skipIf(!DB_URL)('allocate_number · concurrency on the local database', () => {
  let alloc: typeof import('./allocate')
  const month = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: '2-digit',
    month: '2-digit',
  })
    .format(new Date())
    .replace('-', '')

  beforeAll(async () => {
    alloc = await import('./allocate')
  })

  afterAll(async () => {
    await opsDb.$disconnect()
  })

  it.each([
    [GLOBAL, 'ZT/{n}', 'global' as const, ''],
    [MONTH, 'ZM-{yymm}-{nn}', 'month' as const, ''],
  ])(
    '%s: 50 parallel allocations are 50 distinct consecutive numbers',
    async (key, pattern, kind) => {
      const scope = kind === 'month' ? month : ''
      const start = await ensure(key, pattern, kind, scope)
      const out = await Promise.all(
        Array.from({ length: 50 }, () =>
          opsDb.$transaction((tx) => alloc.allocate(tx, key, scope, null), {
            timeout: 60_000,
            maxWait: 60_000,
          })
        )
      )
      const values = out.map((o) => Number(o.value)).sort((a, b) => a - b)
      expect(new Set(values).size).toBe(50)
      expect(values).toEqual(Array.from({ length: 50 }, (_, i) => start + i))
      expect(new Set(out.map((o) => o.formatted)).size).toBe(50)
      if (kind === 'month') expect(out[0]!.formatted).toMatch(new RegExp(`^ZM-${month}-\\d{2,}$`))
    },
    120_000
  )

  it('a released number is given out again first; an outside number is skipped and recorded void', async () => {
    await ensure(GLOBAL, 'ZT/{n}', 'global', '')
    const a = await opsDb.$transaction((tx) => alloc.allocate(tx, GLOBAL, '', null))
    await opsDb.$transaction((tx) =>
      alloc.release(tx, GLOBAL, a.formatted, { outboundStatus: 'undone' })
    )
    expect(await alloc.peek(opsDb, GLOBAL)).toBe(a.formatted)
    const again = await opsDb.$transaction((tx) => alloc.allocate(tx, GLOBAL, '', null))
    expect(again.formatted).toBe(a.formatted)
    await expect(
      opsDb.$transaction((tx) =>
        alloc.release(tx, GLOBAL, again.formatted, { outboundStatus: 'sent' })
      )
    ).rejects.toThrow(/left the building/)

    const next = await alloc.peek(opsDb, GLOBAL)
    const nextValue = Number(next!.split('/')[1])
    await opsDb.externalNumberObservation.create({
      data: { sequenceKey: GLOBAL, formatted: next!, value: BigInt(nextValue), source: 'manual' },
    })
    expect(await alloc.peek(opsDb, GLOBAL)).toBe(`ZT/${nextValue + 1}`)
    const b = await opsDb.$transaction((tx) => alloc.allocate(tx, GLOBAL, '', null))
    expect(b.formatted).toBe(`ZT/${nextValue + 1}`)
    expect(
      await opsDb.issuedNumber.findUniqueOrThrow({
        where: { sequenceKey_formatted: { sequenceKey: GLOBAL, formatted: next! } },
        select: { status: true },
      })
    ).toEqual({ status: 'void' })
  })

  it('an unseeded sequence refuses; peek says null', async () => {
    const seeded = await opsDb.numberSequence.findUniqueOrThrow({ where: { key: 'quotation' } })
    if (seeded.seededAt) return
    await expect(
      opsDb.$transaction((tx) => alloc.allocate(tx, 'quotation', '', null))
    ).rejects.toThrow(/not seeded/)
    expect(await alloc.peek(opsDb, 'quotation')).toBeNull()
  })

  it('allocating outside a transaction does not compile', () => {
    const outside = () =>
      // @ts-expect-error the root client is not a transaction client (NumberTx refuses $transaction)
      alloc.allocate(opsDb, GLOBAL, '', null)
    expect(typeof outside).toBe('function')
  })
})
