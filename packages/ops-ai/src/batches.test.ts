import type Anthropic from '@anthropic-ai/sdk'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  batchPrice,
  fetchBatchResults,
  submitBatch,
  type BatchResultItem,
  type BatchTransport,
} from './batches'
import type { Price } from './cost'
import type { AiCallRecord, AiLedger, ReserveInput } from './ledger'

/** The batch flow with a fake transport and ledger (S07-T05): reserve first, half price, settle the total. */
const PRICE: Price = {
  inputPerM: '1.00',
  outputPerM: '5.00',
  cacheReadPerM: '0.10',
  cacheWrite5mPerM: '1.25',
  cacheWrite1hPerM: '2.00',
  webSearchPerK: '10.00',
}

function ledger(allow = true) {
  const calls: AiCallRecord[] = []
  const reserves: ReserveInput[] = []
  const settles: Array<[string, string]> = []
  const l: AiLedger = {
    prices: async () => PRICE,
    reserve: async (r) => {
      reserves.push(r)
      return allow ? 'res-1' : null
    },
    settle: async (id, usd) => {
      settles.push([id, usd])
    },
    record: async (c) => {
      calls.push(c)
      return `call-${calls.length}`
    },
  }
  return { l, calls, reserves, settles }
}

function message(
  text: string,
  stop: Anthropic.Messages.StopReason = 'end_turn'
): Anthropic.Messages.Message {
  return {
    id: 'm',
    type: 'message',
    role: 'assistant',
    model: 'claude-haiku-5-5',
    content: [{ type: 'text', text, citations: null }],
    stop_reason: stop,
    stop_sequence: null,
    usage: { input_tokens: 1_000_000, output_tokens: 100_000 },
  } as unknown as Anthropic.Messages.Message
}

function transport(results: BatchResultItem[], status: 'ended' | 'in_progress' = 'ended') {
  const created: unknown[] = []
  const t: BatchTransport = {
    create: async (requests) => {
      created.push(requests)
      return {
        id: 'batch-1',
        status: 'in_progress',
        counts: { processing: requests.length, succeeded: 0, errored: 0, canceled: 0, expired: 0 },
      }
    },
    retrieve: async (id) => ({
      id,
      status,
      counts: { processing: 0, succeeded: 1, errored: 0, canceled: 0, expired: 0 },
    }),
    results: async function* results() {
      for (const r of results) yield r
    },
  }
  return { t, created }
}

const req = {
  customId: 'g1',
  params: {
    model: 'claude-haiku-5-5',
    maxTokens: 800,
    system: [{ text: 'Rules', cache: true }],
    user: 'Signals',
    effort: 'low' as const,
    jsonSchema: { type: 'object' },
  },
}

describe('Message Batches', () => {
  it('half price, rounded up to the micro-dollar', () => {
    expect(batchPrice('1.500000')).toBe('0.750000')
    expect(batchPrice('0.000001')).toBe('0.000001')
  })

  it('reserves the estimate first and sends nothing when the budget refuses', async () => {
    const { l, reserves } = ledger(false)
    const { t, created } = transport([])
    expect(
      await submitBatch({ requests: [req as never], purpose: 'other', ledger: l, transport: t })
    ).toEqual({
      ok: false,
      reason: 'budget',
    })
    expect(reserves).toHaveLength(1)
    expect(created).toHaveLength(0)
  })

  it('creates the batch with output_config JSON and the custom ids', async () => {
    const { l } = ledger()
    const { t, created } = transport([])
    const out = await submitBatch({
      requests: [req as never],
      purpose: 'other',
      ledger: l,
      transport: t,
    })
    expect(out).toMatchObject({ ok: true, batchId: 'batch-1', reservationId: 'res-1' })
    const sent = (created[0] as Array<{ custom_id: string; params: Record<string, unknown> }>)[0]!
    expect(sent.custom_id).toBe('g1')
    expect(sent.params.output_config).toMatchObject({ format: { type: 'json_schema' } })
    expect(sent.params).not.toHaveProperty('temperature')
  })

  it('reads results at the batch price, validates them and settles the total', async () => {
    const { l, calls, settles } = ledger()
    const { t } = transport([
      { customId: 'g1', type: 'succeeded', message: message('{"n":1}') },
      { customId: 'g2', type: 'succeeded', message: message('not json') },
      { customId: 'g3', type: 'succeeded', message: message('{"n":"x"}') },
      { customId: 'g4', type: 'errored', error: 'invalid_request' },
    ])
    const out = await fetchBatchResults({
      batchId: 'batch-1',
      reservationId: 'res-1',
      purpose: 'other',
      promptVersion: 'learn-preferences@1',
      zod: z.object({ n: z.number() }),
      ledger: l,
      transport: t,
    })
    // 1M input at 1.00 + 100k output at 5.00 = 1.50, half = 0.75 per succeeded result.
    expect(calls).toHaveLength(3)
    expect(calls[0]?.costUsd).toBe('0.750000')
    expect(out.results?.map((r) => r.ok)).toEqual([true, false, false, false])
    expect(out.totalUsd).toBe('2.250000')
    expect(settles).toEqual([['res-1', '2.250000']])
  })

  it('returns null while the batch still runs', async () => {
    const { l } = ledger()
    const { t } = transport([], 'in_progress')
    const out = await fetchBatchResults({
      batchId: 'batch-1',
      reservationId: 'res-1',
      purpose: 'other',
      promptVersion: 'x',
      zod: z.object({}),
      ledger: l,
      transport: t,
    })
    expect(out.results).toBeNull()
  })
})
