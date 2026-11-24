import type { AiPurpose } from './models'
import type { Price } from './cost'

/**
 * Everything `structuredCall` needs from the database, implemented by the app (apps/ops ai-ledger.ts). The
 * package never imports Prisma, so it cannot hold a connection across a model call by construction.
 */
export interface ReserveInput {
  /** "2026-11-01" (budget.monthKey). */
  month: string
  /** 6-decimal USD string. */
  estUsd: string
  purpose: AiPurpose
  actionId?: string | null
}

export interface AiCallRecord {
  actionId?: string | null
  enquiryId?: string | null
  purpose: AiPurpose
  model: string
  promptVersion: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  cacheWrite1hTokens: number
  webSearches: number
  /** 6-decimal USD string. */
  costUsd: string
  latencyMs: number
  ok: boolean
  error?: string | null
  stopReason?: string | null
  effort?: string | null
  reservationId?: string | null
}

export interface AiLedger {
  /** The price row in force for `model` at `at`; throws MissingPriceError when there is none. */
  prices(model: string, at: Date): Promise<Price>
  /** A reservation id, or null when the budget refuses (no API call may follow). */
  reserve(input: ReserveInput): Promise<string | null>
  /** Moves the estimate out of reserved and `actualUsd` into spent. Idempotent. */
  settle(reservationId: string, actualUsd: string): Promise<void>
  /** One `ai_call` row. INSERT-only. */
  record(call: AiCallRecord): Promise<void>
}
