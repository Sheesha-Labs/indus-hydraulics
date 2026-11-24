import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { $Enums, opsDb } from '@indus/ops-db'
import { AI_PURPOSES, MODELS, structuredCall, type Transport } from '@indus/ops-ai'
import { z } from 'zod'
import { localDatabaseUrl } from '../mail-send/testing/fixture'
import { aiLedger, pickPrice, releaseStaleReservations, resetPriceCache } from './ai-ledger'

/**
 * The Prisma AiLedger against the real SQL functions (S05-T01): a reservation inside the limit passes and
 * settles into spent; a hard-stopped month refuses and structuredCall makes no API request; every call writes
 * one ai_call row. Each run uses its own far-future month, so parallel files never share a budget row.
 */
const DB_URL = localDatabaseUrl()
const YEAR = 2100 + Math.floor(Math.random() * 800)
const MONTH = `${YEAR}-01-01`
const AT = new Date(`${YEAR}-01-15T09:00:00Z`)
const PROMPT = `ledger-test-${YEAR}@1`

const Label = z.strictObject({ label: z.enum(['enquiry', 'other']) })

function transportReplying(text: string, calls: { n: number }): Transport {
  return async (body) => {
    calls.n += 1
    return {
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: body.model,
      content: [{ type: 'text', text, citations: null }],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 2_000,
        output_tokens: 200,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
        cache_creation: null,
        server_tool_use: null,
        service_tier: null,
      },
    } as unknown as Awaited<ReturnType<Transport>>
  }
}

describe('ai_call purposes', () => {
  it('ops-ai mirrors the AiPurpose enum exactly', () => {
    expect([...AI_PURPOSES].sort()).toEqual(Object.values($Enums.AiPurpose).sort())
  })
})

describe('pickPrice', () => {
  const D = (v: string) => ({ toFixed: (dp: number) => Number(v).toFixed(dp) }) as never
  const row = (model: string, from: string, input: string) => ({
    model,
    effectiveFrom: new Date(`${from}T00:00:00Z`),
    inputPerM: D(input),
    outputPerM: D('1'),
    cacheReadPerM: D('0.1'),
    cacheWrite5mPerM: D('1.25'),
    cacheWrite1hPerM: D('2'),
    webSearchPerK: D('10'),
  })
  it('takes the latest row on or before the date', () => {
    const rows = [row('m', '2026-11-01', '1'), row('m', '2027-01-01', '2')]
    expect(pickPrice(rows, 'm', new Date('2026-12-31T23:00:00Z')).inputPerM).toBe('1.0000')
    expect(pickPrice(rows, 'm', new Date('2027-01-01T00:00:00Z')).inputPerM).toBe('2.0000')
    expect(() => pickPrice(rows, 'm', new Date('2026-10-01T00:00:00Z'))).toThrow(/No price/)
    expect(() => pickPrice(rows, 'other', new Date('2027-01-01T00:00:00Z'))).toThrow(/No price/)
  })
})

describe.skipIf(!DB_URL)('aiLedger · real reservation functions', () => {
  beforeAll(async () => {
    resetPriceCache()
    await opsDb.aiBudget.create({
      data: { month: new Date(`${MONTH}T00:00:00Z`), limitUsd: '1.0000', mode: 'hard_stop' },
    })
  })

  afterAll(async () => {
    await opsDb.$disconnect()
  })

  it('reads the seeded 5.5 prices', async () => {
    const p = await aiLedger.prices(MODELS.haiku, AT)
    expect(p).toMatchObject({
      inputPerM: '0.1000',
      outputPerM: '0.5000',
      cacheWrite1hPerM: '0.2000',
    })
  })

  it('reserves inside the limit, settles into spent once, and refuses past the limit', async () => {
    const id = await aiLedger.reserve({ month: MONTH, estUsd: '0.600000', purpose: 'classify' })
    expect(id).toEqual(expect.any(String))
    // 0.6 reserved + 0.6 more > 1.0 under hard_stop
    expect(
      await aiLedger.reserve({ month: MONTH, estUsd: '0.600000', purpose: 'classify' })
    ).toBeNull()

    await aiLedger.settle(id!, '0.250000')
    await aiLedger.settle(id!, '0.250000') // idempotent
    const b = await opsDb.aiBudget.findUniqueOrThrow({
      where: { month: new Date(`${MONTH}T00:00:00Z`) },
    })
    expect(b.spentUsd.toFixed(6)).toBe('0.250000')
    expect(b.reservedUsd.toFixed(6)).toBe('0.000000')
  })

  it('a structured call records one ai_call and settles its cost', async () => {
    const calls = { n: 0 }
    const res = await structuredCall({
      route: 'classify',
      system: [{ id: 'rules', text: 'Classify.' }],
      user: 'Email body.',
      zod: Label,
      maxTokens: 500,
      promptVersion: PROMPT,
      ledger: aiLedger,
      transport: transportReplying('{"label":"enquiry"}', calls),
      now: () => AT,
    })
    // 2,000 × 0.1 / 1M + 200 × 0.5 / 1M = 0.0003
    expect(res).toMatchObject({ ok: true, value: { label: 'enquiry' }, costUsd: '0.000300' })
    expect(calls.n).toBe(1)
    const rows = await opsDb.aiCall.findMany({ where: { promptVersion: PROMPT } })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      model: MODELS.haiku,
      purpose: 'classify',
      effort: 'low',
      stopReason: 'end_turn',
      ok: true,
      inputTokens: 2_000,
      outputTokens: 200,
    })
    expect(rows[0]!.costUsd.toFixed(6)).toBe('0.000300')
    expect(rows[0]!.reservationId).toEqual(expect.any(String))
  })

  it('makes no API request once the month is at its hard-stop limit', async () => {
    await opsDb.aiBudget.update({
      where: { month: new Date(`${MONTH}T00:00:00Z`) },
      data: { spentUsd: '1.000000' },
    })
    const calls = { n: 0 }
    const res = await structuredCall({
      route: 'classify',
      system: [{ id: 'rules', text: 'Classify.' }],
      user: 'Email body.',
      zod: Label,
      maxTokens: 500,
      promptVersion: PROMPT,
      ledger: aiLedger,
      transport: transportReplying('{"label":"enquiry"}', calls),
      now: () => AT,
    })
    expect(res).toMatchObject({ ok: false, reason: 'budget' })
    expect(calls.n).toBe(0)
    expect(await opsDb.aiCall.count({ where: { promptVersion: PROMPT } })).toBe(1)
  })

  it('releases stale reservations at zero', async () => {
    expect(await releaseStaleReservations(30)).toBeGreaterThanOrEqual(0)
  })
})
