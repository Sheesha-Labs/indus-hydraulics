import Anthropic, { APIConnectionError, APIError } from '@anthropic-ai/sdk'
import { z } from 'zod'
import { monthKey } from './budget'
import { buildSystem, type SystemPart } from './cache-layout'
import { costUsd as priceUsage, estimateUsd, formatUsd6, tokenCounts, type Price } from './cost'
import { AiRequestError, ProviderUnavailableError } from './errors'
import type { AiLedger } from './ledger'
import {
  refusalRerunModel,
  routeFor,
  supportsServerFallback,
  type AiPurpose,
  type Effort,
  type Route,
} from './models'

/**
 * One structured model call (ADR-08): reserve budget → call → check `stop_reason` → parse → validate → settle
 * and record. Every API request reserves its own estimate, settles its actual cost and writes one `ai_call`
 * row, on every path; a refused reservation returns `budget` with no request at all.
 *
 *   refusal     Haiku has no server-side fallback, so its refusal is rerun once on Sonnet. Sonnet and Opus send
 *               `fallbacks: "default"` and the API reroutes by refusal category itself; a refusal that still
 *               comes back is final.
 *   max_tokens  one rerun with `max_tokens` doubled (the transport streams above 16K); truncated JSON is never
 *               parsed.
 *   invalid     JSON.parse + Zod; one retry with the validation error appended to the user turn.
 *   provider    429 / 529 / 5xx / network, after the SDK's two retries: ProviderUnavailableError (the Inngest
 *               step retries); any other API error: AiRequestError.
 *
 * Never sent: `temperature`, `top_p`, `top_k` (400 on current models), a forced `tool_choice`, a `thinking`
 * budget. Thinking stays the model's default (adaptive); `output_config.effort` is always explicit.
 */

export const SERVER_FALLBACK_BETA = 'server-side-fallback-2026-07-01'

/** The request body structuredCall sends: the beta Messages params plus the server-side fallback field. */
export type CreateBody = Omit<Anthropic.Beta.Messages.MessageCreateParamsNonStreaming, 'stream'> & {
  fallbacks?: 'default'
}

export type Transport = (body: CreateBody) => Promise<Anthropic.Beta.Messages.BetaMessage>

export type FailureReason = 'budget' | 'refusal' | 'invalid' | 'max_tokens'

export type StructuredResult<T> =
  | {
      ok: true
      value: T
      usage: Anthropic.Beta.Messages.BetaUsage
      /** All attempts of this call, 6-decimal USD. */
      costUsd: string
      stopReason: string
      model: string
      attempts: number
    }
  | {
      ok: false
      reason: FailureReason
      detail: string
      costUsd: string
      attempts: number
    }

export interface StructuredCallInput<T> {
  route: Route
  /** Defaults to the route's purpose. */
  purpose?: AiPurpose
  /** Defaults to the route's model (an escalation passes Opus). */
  model?: string
  /** Defaults to the route's effort. */
  effort?: Effort
  system: readonly SystemPart[]
  /** The per-call text: the message under review, today's date, ids. Never cached. */
  user: string
  zod: z.ZodType<T>
  /** Defaults to `z.toJSONSchema(zod)`. */
  jsonSchema?: Record<string, unknown>
  maxTokens: number
  /** e.g. "classify-mail@1"; recorded on every ai_call. */
  promptVersion: string
  actionId?: string | null
  enquiryId?: string | null
  ledger: AiLedger
  transport: Transport
  now?: () => Date
}

interface Attempt {
  model: string
  maxTokens: number
  user: string
}

type AttemptOutcome =
  | { kind: 'budget' }
  | { kind: 'response'; response: Anthropic.Beta.Messages.BetaMessage; costUsd: string }

const RETRYABLE_STATUS = new Set([408, 409, 429])

function isRetryable(e: unknown): boolean {
  if (e instanceof APIConnectionError) return true
  if (e instanceof APIError) {
    const s = e.status
    return s === undefined || RETRYABLE_STATUS.has(s) || s >= 500
  }
  return false
}

function statusOf(e: unknown): number | null {
  return e instanceof APIError && typeof e.status === 'number' ? e.status : null
}

/** A short, prompt-free description of a provider failure for `ai_call.error`. */
function describe(e: unknown): string {
  const name = e instanceof Error ? e.name : 'Error'
  const status = statusOf(e)
  return status === null ? name : `${name} ${status}`
}

function sumUsd(a: string, b: string): string {
  const toE10 = (v: string): bigint => {
    const [w = '0', f = ''] = v.split('.')
    return (BigInt(w) * 1_000_000n + BigInt(f.padEnd(6, '0').slice(0, 6))) * 10_000n
  }
  return formatUsd6(toE10(a) + toE10(b))
}

function textOf(message: Anthropic.Beta.Messages.BetaMessage): string {
  return message.content
    .filter((b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
}

function issues(error: z.ZodError): string {
  return error.issues
    .slice(0, 8)
    .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('; ')
}

export async function structuredCall<T>(
  input: StructuredCallInput<T>
): Promise<StructuredResult<T>> {
  const route = routeFor(input.route)
  const purpose = input.purpose ?? route.purpose
  const effort = input.effort ?? route.effort
  const now = input.now ?? (() => new Date())
  const system = buildSystem(input.system)
  const systemChars = input.system.reduce((n, p) => n + p.text.length, 0)
  const schema = input.jsonSchema ?? (z.toJSONSchema(input.zod) as Record<string, unknown>)
  const { ledger } = input

  let total = '0.000000'
  let attempts = 0

  const priceFor = async (model: string, fallback: Price | null): Promise<Price> => {
    try {
      return await ledger.prices(model, now())
    } catch (e) {
      if (fallback) return fallback
      throw e
    }
  }

  const run = async (a: Attempt): Promise<AttemptOutcome> => {
    const price = await priceFor(a.model, null)
    const estUsd = estimateUsd({
      chars: systemChars + a.user.length,
      maxTokens: a.maxTokens,
      price,
    })
    const reservationId = await ledger.reserve({
      month: monthKey(now()),
      estUsd,
      purpose,
      actionId: input.actionId ?? null,
    })
    if (reservationId === null) return { kind: 'budget' }

    const body: CreateBody = {
      model: a.model,
      max_tokens: a.maxTokens,
      system,
      messages: [{ role: 'user', content: a.user }],
      output_config: { effort, format: { type: 'json_schema', schema } },
      ...(supportsServerFallback(a.model)
        ? {
            betas: [SERVER_FALLBACK_BETA as Anthropic.Beta.AnthropicBeta],
            fallbacks: 'default' as const,
          }
        : {}),
    }

    attempts += 1
    const started = Date.now()
    const base = {
      actionId: input.actionId ?? null,
      enquiryId: input.enquiryId ?? null,
      purpose,
      promptVersion: input.promptVersion,
      effort,
      reservationId,
    }

    let response: Anthropic.Beta.Messages.BetaMessage
    try {
      response = await input.transport(body)
    } catch (e) {
      const latencyMs = Date.now() - started
      await ledger.settle(reservationId, '0.000000')
      await ledger.record({
        ...base,
        model: a.model,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        cacheWrite1hTokens: 0,
        webSearches: 0,
        costUsd: '0.000000',
        latencyMs,
        ok: false,
        error: describe(e),
        stopReason: null,
      })
      if (isRetryable(e)) throw new ProviderUnavailableError(describe(e), statusOf(e))
      throw new AiRequestError(describe(e), statusOf(e))
    }

    const latencyMs = Date.now() - started
    const served = response.model || a.model
    const cost = priceUsage(response.usage, await priceFor(served, price))
    const counts = tokenCounts(response.usage)
    total = sumUsd(total, cost)
    await ledger.settle(reservationId, cost)
    await ledger.record({
      ...base,
      model: served,
      ...counts,
      costUsd: cost,
      latencyMs,
      ok: response.stop_reason === 'end_turn' || response.stop_reason === 'stop_sequence',
      error: null,
      stopReason: response.stop_reason ?? null,
    })
    return { kind: 'response', response, costUsd: cost }
  }

  let attempt: Attempt = {
    model: input.model ?? route.model,
    maxTokens: input.maxTokens,
    user: input.user,
  }
  let reranRefusal = false
  let reranMaxTokens = false
  let retriedInvalid = false

  for (;;) {
    const out = await run(attempt)
    if (out.kind === 'budget') {
      return {
        ok: false,
        reason: 'budget',
        detail: 'The monthly AI budget refused this call',
        costUsd: total,
        attempts,
      }
    }
    const { response } = out
    const stop = response.stop_reason

    // stop_reason before content, always.
    if (stop === 'refusal') {
      const rerun = refusalRerunModel(attempt.model)
      if (rerun && !reranRefusal) {
        reranRefusal = true
        attempt = { ...attempt, model: rerun }
        continue
      }
      const category = response.stop_details?.category ?? 'unspecified'
      return {
        ok: false,
        reason: 'refusal',
        detail: `Refused (${category})`,
        costUsd: total,
        attempts,
      }
    }
    if (stop === 'max_tokens') {
      if (!reranMaxTokens) {
        reranMaxTokens = true
        attempt = { ...attempt, maxTokens: attempt.maxTokens * 2 }
        continue
      }
      return {
        ok: false,
        reason: 'max_tokens',
        detail: `Output exceeded ${attempt.maxTokens} tokens`,
        costUsd: total,
        attempts,
      }
    }
    if (stop !== 'end_turn' && stop !== 'stop_sequence') {
      return {
        ok: false,
        reason: 'invalid',
        detail: `Unexpected stop_reason ${stop}`,
        costUsd: total,
        attempts,
      }
    }

    let problem: string
    try {
      const parsed = input.zod.safeParse(JSON.parse(textOf(response)))
      if (parsed.success) {
        return {
          ok: true,
          value: parsed.data,
          usage: response.usage,
          costUsd: total,
          stopReason: stop,
          model: response.model || attempt.model,
          attempts,
        }
      }
      problem = issues(parsed.error)
    } catch {
      problem = 'the reply was not valid JSON'
    }
    if (retriedInvalid) {
      return { ok: false, reason: 'invalid', detail: problem, costUsd: total, attempts }
    }
    retriedInvalid = true
    attempt = {
      ...attempt,
      user: `${input.user}\n\nYour previous reply did not match the required schema (${problem}). Reply again with JSON that matches it exactly.`,
    }
  }
}
