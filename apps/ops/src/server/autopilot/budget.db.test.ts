import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { monthStart } from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { getCostPage } from '../../data/ai-cost'
import { aiLedger } from '../assistant/ai-ledger'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import { budgetThresholds, rolloverBudget, sweepReservations } from './budget-jobs'

/**
 * Board 101 on the local database (S07-T04). On a far-future month so the real month is untouched: each budget
 * mode enforced by ops.ai_budget_reserve (hard stop refuses a classification; warn and pause research refuses
 * research only; warn only refuses nothing), rollover is idempotent, the sweep settles stale reservations, and
 * the 80 % / 100 % notices fire once each. The page total equals the SQL sum for the Dubai month.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../../inngest/emit', () => ({
  emitEvent: async () => true,
  emitEventOrThrow: async () => undefined,
}))

const FUTURE = new Date('2099-03-15T08:00:00Z')
const MONTH = '2099-03-01'
const monthDate = new Date(`${MONTH}T00:00:00Z`)

describe.skipIf(!DB_URL)('AI budget · local database', () => {
  beforeAll(async () => {
    await opsDb.aiBudget.deleteMany({ where: { month: monthDate } }).catch(() => undefined)
  })

  afterAll(async () => {
    await opsDb.aiBudget
      .update({ where: { month: monthDate }, data: { spentUsd: 0, reservedUsd: 0 } })
      .catch(() => undefined)
  })

  it('rollover creates the month from the setting, twice without error', async () => {
    expect(await rolloverBudget(FUTURE)).toEqual({ month: MONTH })
    expect(await rolloverBudget(FUTURE)).toEqual({ month: MONTH })
    const row = await opsDb.aiBudget.findUniqueOrThrow({ where: { month: monthDate } })
    expect(row.limitUsd.toNumber()).toBeGreaterThan(0)
  })

  async function set(mode: string, spent: number) {
    await opsDb.aiBudget.update({
      where: { month: monthDate },
      data: {
        mode,
        limitUsd: 100,
        spentUsd: spent,
        reservedUsd: 0,
        notified80At: null,
        notified100At: null,
      },
    })
  }
  const reserve = (purpose: string) =>
    aiLedger.reserve({
      month: MONTH,
      estUsd: '0.010000',
      purpose: purpose as never,
      actionId: null,
    })

  it('hard stop refuses a classification at the limit', async () => {
    await set('hard_stop', 100)
    expect(await reserve('classify')).toBeNull()
    expect(await reserve('research')).toBeNull()
  })

  it('warn and pause research refuses research only', async () => {
    await set('warn_pause_research', 100)
    expect(await reserve('research')).toBeNull()
    const id = await reserve('classify')
    expect(id).not.toBeNull()
    await aiLedger.settle(id!, '0')
  })

  it('warn only refuses nothing', async () => {
    await set('warn_only', 150)
    const a = await reserve('research')
    const b = await reserve('classify')
    expect(a && b).toBeTruthy()
    await aiLedger.settle(a!, '0')
    await aiLedger.settle(b!, '0')
  })

  it('the sweep settles reservations open for 30 minutes', async () => {
    await set('warn_only', 0)
    const id = await reserve('classify')
    await opsDb.aiReservation.update({
      where: { id: id! },
      data: { createdAt: new Date(Date.now() - 31 * 60_000) },
    })
    const out = await sweepReservations()
    expect(out.released).toBeGreaterThanOrEqual(1)
    const r = await opsDb.aiReservation.findUniqueOrThrow({ where: { id: id! } })
    expect(r.settledAt).not.toBeNull()
  })

  it('the 80 % and 100 % notices fire once each', async () => {
    await set('warn_pause_research', 85)
    expect((await budgetThresholds(FUTURE)).notified).toEqual(['80'])
    expect((await budgetThresholds(FUTURE)).notified).toEqual([])
    await opsDb.aiBudget.update({ where: { month: monthDate }, data: { spentUsd: 100 } })
    expect((await budgetThresholds(FUTURE)).notified).toEqual(['100'])
    expect((await budgetThresholds(FUTURE)).notified).toEqual([])
    const n = await opsDb.notification.count({
      where: { dedupeKey: { in: [`budget80:${MONTH}`, `budget100:${MONTH}`] } },
    })
    expect(n).toBeGreaterThanOrEqual(2)
  })

  it('the page total equals the sum of ai_call since the Dubai month start', async () => {
    const now = new Date()
    const page = await getCostPage({ role: 'owner' }, now)
    const sum = await opsDb.aiCall.aggregate({
      where: { at: { gte: monthStart(now) } },
      _sum: { costUsd: true },
    })
    expect(page.mtdUsd).toBe(
      new Prisma.Decimal(sum._sum.costUsd ?? 0).toDecimalPlaces(2).toFixed(2)
    )
    expect(page.day).toBeGreaterThan(0)
    expect(page.markerShare).toBeCloseTo(page.day / page.days, 5)
  })
})
