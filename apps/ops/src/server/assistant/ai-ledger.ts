import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import {
  MissingPriceError,
  type AiCallRecord,
  type AiLedger,
  type Price,
  type ReserveInput,
} from '@indus/ops-ai'

/**
 * The Prisma AiLedger for `structuredCall` (S05-T01, ADR-08, C14).
 *
 * Every method is one short statement on the pooled connection and returns before the model call starts or
 * after it ends: no transaction spans a model call (apps/ops/CLAUDE.md §7.4).
 *
 * reserve and settle call the SQL functions through $queryRaw. Documented exception to "no raw queries": the
 * reservation must be ONE conditional UPDATE (`spent + reserved + est <= limit`) so two calls racing for the
 * last dollars cannot both pass, which Prisma's update API cannot express.
 */

const PRICE_TTL_MS = 10 * 60_000

type PriceRow = {
  model: string
  effectiveFrom: Date
  inputPerM: Prisma.Decimal
  outputPerM: Prisma.Decimal
  cacheReadPerM: Prisma.Decimal
  cacheWrite5mPerM: Prisma.Decimal
  cacheWrite1hPerM: Prisma.Decimal
  webSearchPerK: Prisma.Decimal
}

let cache: { at: number; rows: PriceRow[] } | null = null

/** Test seam: forget the cached price table. */
export function resetPriceCache(): void {
  cache = null
}

async function priceRows(nowMs: number): Promise<PriceRow[]> {
  if (cache && nowMs - cache.at < PRICE_TTL_MS) return cache.rows
  const rows = await opsDb.aiModelPrice.findMany({
    select: {
      model: true,
      effectiveFrom: true,
      inputPerM: true,
      outputPerM: true,
      cacheReadPerM: true,
      cacheWrite5mPerM: true,
      cacheWrite1hPerM: true,
      webSearchPerK: true,
    },
    orderBy: [{ model: 'asc' }, { effectiveFrom: 'desc' }],
  })
  cache = { at: nowMs, rows }
  return rows
}

/** The row in force on `at`'s date: the latest effectiveFrom on or before it. */
export function pickPrice(rows: readonly PriceRow[], model: string, at: Date): Price {
  const day = at.toISOString().slice(0, 10)
  const row = rows
    .filter((r) => r.model === model && r.effectiveFrom.toISOString().slice(0, 10) <= day)
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0]
  if (!row) throw new MissingPriceError(model, at)
  return {
    inputPerM: row.inputPerM.toFixed(4),
    outputPerM: row.outputPerM.toFixed(4),
    cacheReadPerM: row.cacheReadPerM.toFixed(4),
    cacheWrite5mPerM: row.cacheWrite5mPerM.toFixed(4),
    cacheWrite1hPerM: row.cacheWrite1hPerM.toFixed(4),
    webSearchPerK: row.webSearchPerK.toFixed(4),
  }
}

export const aiLedger: AiLedger = {
  async prices(model: string, at: Date): Promise<Price> {
    return pickPrice(await priceRows(Date.now()), model, at)
  },

  async reserve(input: ReserveInput): Promise<string | null> {
    const rows = await opsDb.$queryRaw<Array<{ id: string | null }>>`
      SELECT ops.ai_budget_reserve(${input.month}::date, ${input.estUsd}::numeric, ${input.purpose}::text,
                                   ${input.actionId ?? null}::uuid) AS id`
    return rows[0]?.id ?? null
  },

  async settle(reservationId: string, actualUsd: string): Promise<void> {
    // $executeRaw: the function returns void, which $queryRaw cannot deserialise.
    await opsDb.$executeRaw`SELECT ops.ai_budget_settle(${reservationId}::uuid, ${actualUsd}::numeric)`
  },

  async record(call: AiCallRecord): Promise<string> {
    const row = await opsDb.aiCall.create({
      data: {
        actionId: call.actionId ?? null,
        enquiryId: call.enquiryId ?? null,
        purpose: call.purpose,
        model: call.model,
        promptVersion: call.promptVersion,
        inputTokens: call.inputTokens,
        outputTokens: call.outputTokens,
        cacheReadTokens: call.cacheReadTokens,
        cacheWriteTokens: call.cacheWriteTokens,
        cacheWrite1hTokens: call.cacheWrite1hTokens,
        webSearches: call.webSearches,
        costUsd: call.costUsd,
        latencyMs: call.latencyMs,
        ok: call.ok,
        error: call.error ?? null,
        stopReason: call.stopReason ?? null,
        effort: call.effort ?? null,
        reservationId: call.reservationId ?? null,
      },
      select: { id: true },
    })
    return row.id
  },
}

/** Settles reservations a crashed call left open (run by the heartbeat). */
export async function releaseStaleReservations(olderThanMinutes = 30): Promise<number> {
  const rows = await opsDb.$queryRaw<Array<{ n: number }>>`
    SELECT ops.ai_budget_release_stale(make_interval(mins => ${olderThanMinutes}::int)) AS n`
  return Number(rows[0]?.n ?? 0)
}
