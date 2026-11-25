import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { apiSchema } from './api-schema'
import { monthKey } from './budget'
import { buildSystem, type SystemPart } from './cache-layout'
import { costUsd as priceUsage, estimateUsd, tokenCounts } from './cost'
import type { AiLedger } from './ledger'
import type { AiPurpose } from './models'

/**
 * Message Batches (S07-T05, ADR-08): the nightly preference learner sends its groups as one batch at half the
 * Messages price (POST /v1/messages/batches; create → retrieve until `ended` → results by custom_id). No DB here:
 * the ledger is passed in, as for structuredCall.
 *
 *   submitBatch        reserves the whole batch's estimate first (refused → nothing is sent), then creates it
 *   fetchBatchResults  once ended: one ai_call row per result at the batch price, the reservation settled with
 *                      the actual total, and each succeeded result parsed and validated by the caller's schema
 */

/** Batch requests are billed at half the Messages price. */
export const BATCH_PRICE_FACTOR = 0.5

export interface BatchRequestParams {
  model: string
  maxTokens: number
  system: readonly SystemPart[]
  user: string
  effort: 'low' | 'medium' | 'high'
  jsonSchema: Record<string, unknown>
}

export interface BatchRequest {
  customId: string
  params: BatchRequestParams
}

export interface BatchStatus {
  id: string
  status: 'in_progress' | 'canceling' | 'ended'
  counts: {
    processing: number
    succeeded: number
    errored: number
    canceled: number
    expired: number
  }
}

export type BatchResultItem =
  | { customId: string; type: 'succeeded'; message: Anthropic.Messages.Message }
  | { customId: string; type: 'errored' | 'expired' | 'canceled'; error: string }

/** The three calls, so tests can fake them (anthropicBatchTransport is the real one). */
export interface BatchTransport {
  create(
    requests: Array<{ custom_id: string; params: Record<string, unknown> }>
  ): Promise<BatchStatus>
  retrieve(id: string): Promise<BatchStatus>
  results(id: string): AsyncIterable<BatchResultItem>
}

function status(b: Anthropic.Messages.Batches.MessageBatch): BatchStatus {
  return {
    id: b.id,
    status: b.processing_status,
    counts: {
      processing: b.request_counts.processing,
      succeeded: b.request_counts.succeeded,
      errored: b.request_counts.errored,
      canceled: b.request_counts.canceled,
      expired: b.request_counts.expired,
    },
  }
}

export function anthropicBatchTransport(client: Anthropic): BatchTransport {
  return {
    async create(requests) {
      const b = await client.messages.batches.create({
        requests: requests as unknown as Anthropic.Messages.Batches.BatchCreateParams['requests'],
      })
      return status(b)
    },
    async retrieve(id) {
      return status(await client.messages.batches.retrieve(id))
    },
    async *results(id) {
      for await (const r of await client.messages.batches.results(id)) {
        if (r.result.type === 'succeeded') {
          yield { customId: r.custom_id, type: 'succeeded', message: r.result.message }
        } else if (r.result.type === 'errored') {
          const e = r.result.error as unknown as {
            error?: { type?: string; message?: string }
            type?: string
          }
          yield {
            customId: r.custom_id,
            type: 'errored',
            error: e.error?.type ?? e.type ?? 'error',
          }
        } else {
          yield { customId: r.custom_id, type: r.result.type, error: r.result.type }
        }
      }
    },
  }
}

function micro(v: string): bigint {
  const [i = '0', f = ''] = v.split('.')
  return BigInt(i) * 1_000_000n + BigInt(f.slice(0, 6).padEnd(6, '0'))
}
function usd6(m: bigint): string {
  const s = m.toString().padStart(7, '0')
  return `${s.slice(0, -6)}.${s.slice(-6)}`
}
/** Half of a 6-decimal USD string, rounded up to the micro-dollar (never under-charge the budget). */
export function batchPrice(usd: string): string {
  const m = micro(usd)
  return usd6((m + 1n) / 2n)
}

export interface SubmitBatchInput {
  requests: readonly BatchRequest[]
  purpose: AiPurpose
  ledger: AiLedger
  transport: BatchTransport
  now?: Date
}

export type SubmitBatchResult =
  | { ok: true; batchId: string; reservationId: string; estUsd: string }
  | { ok: false; reason: 'budget' | 'empty' }

export async function submitBatch(input: SubmitBatchInput): Promise<SubmitBatchResult> {
  if (!input.requests.length) return { ok: false, reason: 'empty' }
  const now = input.now ?? new Date()
  let est = 0n
  for (const r of input.requests) {
    const price = await input.ledger.prices(r.params.model, now)
    const chars = r.params.system.reduce((n, p) => n + p.text.length, 0) + r.params.user.length
    est += micro(batchPrice(estimateUsd({ chars, maxTokens: r.params.maxTokens, price })))
  }
  const estUsd = usd6(est)
  const reservationId = await input.ledger.reserve({
    month: monthKey(now),
    estUsd,
    purpose: input.purpose,
    actionId: null,
  })
  if (reservationId === null) return { ok: false, reason: 'budget' }
  try {
    const b = await input.transport.create(
      input.requests.map((r) => ({
        custom_id: r.customId,
        params: {
          model: r.params.model,
          max_tokens: r.params.maxTokens,
          system: buildSystem(r.params.system),
          messages: [{ role: 'user', content: r.params.user }],
          output_config: {
            effort: r.params.effort,
            format: { type: 'json_schema', schema: apiSchema(r.params.jsonSchema) },
          },
        },
      }))
    )
    return { ok: true, batchId: b.id, reservationId, estUsd }
  } catch (e) {
    await input.ledger.settle(reservationId, '0.000000')
    throw e
  }
}

export interface FetchBatchInput<T> {
  batchId: string
  reservationId: string | null
  purpose: AiPurpose
  promptVersion: string
  zod: z.ZodType<T>
  ledger: AiLedger
  transport: BatchTransport
  now?: Date
}

export type ParsedBatchResult<T> =
  | { customId: string; ok: true; data: T; costUsd: string }
  | { customId: string; ok: false; error: string; costUsd: string }

/**
 * Results of an ended batch: one ai_call per result at the batch price, the reservation settled with the
 * total, and each answer checked (stop_reason first, then JSON, then the schema). Null while it still runs.
 */
export async function fetchBatchResults<T>(
  input: FetchBatchInput<T>
): Promise<{ status: BatchStatus; results: ParsedBatchResult<T>[] | null; totalUsd: string }> {
  const s = await input.transport.retrieve(input.batchId)
  if (s.status !== 'ended') return { status: s, results: null, totalUsd: '0.000000' }
  const now = input.now ?? new Date()
  const out: ParsedBatchResult<T>[] = []
  let total = 0n
  for await (const r of input.transport.results(input.batchId)) {
    if (r.type !== 'succeeded') {
      out.push({ customId: r.customId, ok: false, error: r.error, costUsd: '0.000000' })
      continue
    }
    const m = r.message
    const price = await input.ledger.prices(m.model, now)
    const cost = batchPrice(priceUsage(m.usage, price))
    total += micro(cost)
    await input.ledger.record({
      purpose: input.purpose,
      model: m.model,
      promptVersion: input.promptVersion,
      ...tokenCounts(m.usage),
      costUsd: cost,
      latencyMs: 0,
      ok: m.stop_reason === 'end_turn',
      error: null,
      stopReason: m.stop_reason ?? null,
      effort: null,
      reservationId: input.reservationId,
    })
    if (m.stop_reason !== 'end_turn') {
      out.push({
        customId: r.customId,
        ok: false,
        error: `stop_reason ${m.stop_reason}`,
        costUsd: cost,
      })
      continue
    }
    const text = m.content.find((c) => c.type === 'text')
    let json: unknown
    try {
      json = JSON.parse(text && 'text' in text ? text.text : '')
    } catch {
      out.push({ customId: r.customId, ok: false, error: 'not JSON', costUsd: cost })
      continue
    }
    const parsed = input.zod.safeParse(json)
    out.push(
      parsed.success
        ? { customId: r.customId, ok: true, data: parsed.data, costUsd: cost }
        : { customId: r.customId, ok: false, error: 'schema', costUsd: cost }
    )
  }
  const totalUsd = usd6(total)
  if (input.reservationId) await input.ledger.settle(input.reservationId, totalUsd)
  return { status: s, results: out, totalUsd }
}
