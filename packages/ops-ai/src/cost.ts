/**
 * Model cost arithmetic (C14). Exact: prices are 4-decimal strings (`ops.ai_model_price`), token counts are
 * integers, so every product is held as a bigint at scale 10 (USD × 10^10) and rounded half-up once, to the
 * 6 decimals `ai_call.costUsd` stores. No floats touch money (apps/ops/CLAUDE.md §6.8).
 */

/** USD per million tokens (per thousand searches), as the database serialises numeric(12,4). */
export interface Price {
  inputPerM: string
  outputPerM: string
  cacheReadPerM: string
  cacheWrite5mPerM: string
  cacheWrite1hPerM: string
  webSearchPerK: string
}

/** The usage fields the Messages API returns (a structural subset of the SDK's Usage). */
export interface UsageLike {
  input_tokens: number
  output_tokens: number
  cache_read_input_tokens?: number | null
  cache_creation_input_tokens?: number | null
  cache_creation?: { ephemeral_5m_input_tokens: number; ephemeral_1h_input_tokens: number } | null
  server_tool_use?: { web_search_requests?: number | null } | null
}

/** Token counts as `ai_call` records them. */
export interface TokenCounts {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  /** All cache writes (5 min + 1 h). */
  cacheWriteTokens: number
  cacheWrite1hTokens: number
  webSearches: number
}

const SCALE_PRICE = 4
const PRICE_UNIT = 10n ** BigInt(SCALE_PRICE)
const PRICE = /^(\d+)(?:\.(\d+))?$/

/** "0.1250" → 1250n (USD per M × 10^4). Refuses negatives and more than 4 decimals. */
export function parsePrice(value: string): bigint {
  const m = PRICE.exec(value.trim())
  if (!m) throw new RangeError(`not a price: "${value}"`)
  const [, whole = '0', frac = ''] = m
  if (frac.length > SCALE_PRICE && /[1-9]/.test(frac.slice(SCALE_PRICE)))
    throw new RangeError(`more than ${SCALE_PRICE} decimal places: "${value}"`)
  return BigInt(whole) * PRICE_UNIT + BigInt(frac.slice(0, SCALE_PRICE).padEnd(SCALE_PRICE, '0'))
}

function count(n: number | null | undefined): bigint {
  if (n === null || n === undefined) return 0n
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(`not a token count: ${n}`)
  return BigInt(n)
}

/** Normalises the API's usage into the counts `ai_call` stores. */
export function tokenCounts(usage: UsageLike): TokenCounts {
  const write1h = usage.cache_creation?.ephemeral_1h_input_tokens ?? 0
  const write5m =
    usage.cache_creation?.ephemeral_5m_input_tokens ??
    Math.max((usage.cache_creation_input_tokens ?? 0) - write1h, 0)
  return {
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: write5m + write1h,
    cacheWrite1hTokens: write1h,
    webSearches: usage.server_tool_use?.web_search_requests ?? 0,
  }
}

/** USD × 10^10. Token prices are per million (10^6) at scale 10^4; searches are per thousand. */
function costE10(c: TokenCounts, p: Price): bigint {
  const write5m = c.cacheWriteTokens - c.cacheWrite1hTokens
  const perToken =
    count(c.inputTokens) * parsePrice(p.inputPerM) +
    count(c.outputTokens) * parsePrice(p.outputPerM) +
    count(c.cacheReadTokens) * parsePrice(p.cacheReadPerM) +
    count(write5m) * parsePrice(p.cacheWrite5mPerM) +
    count(c.cacheWrite1hTokens) * parsePrice(p.cacheWrite1hPerM)
  // tokens × (USD/M × 10^4) = USD × 10^10; searches × (USD/K × 10^4) × 10^3 = USD × 10^10.
  return perToken + count(c.webSearches) * parsePrice(p.webSearchPerK) * 1000n
}

/** USD × 10^10 → "0.000123" (6 dp, half-up). */
export function formatUsd6(e10: bigint): string {
  if (e10 < 0n) throw new RangeError('cost cannot be negative')
  const micro = (e10 + 5_000n) / 10_000n
  const whole = micro / 1_000_000n
  const frac = (micro % 1_000_000n).toString().padStart(6, '0')
  return `${whole}.${frac}`
}

/** What a call cost, as the 6-decimal string `ai_call.costUsd` stores. */
export function costUsd(usage: UsageLike, price: Price): string {
  return formatUsd6(costE10(tokenCounts(usage), price))
}

export interface EstimateInput {
  /** Characters of system + user text; tokens are estimated at 4 characters each. */
  chars: number
  /** A `messages.countTokens` result, used instead of `chars` when the caller has one. */
  inputTokens?: number
  maxTokens: number
  price: Price
  maxSearches?: number
}

/** Above this many characters a caller should count tokens instead of estimating them. */
export const COUNT_TOKENS_ABOVE_CHARS = 50_000

/**
 * The most a call can cost, reserved before it runs: every input token at the uncached input price, the full
 * `max_tokens` at the output price, and every allowed search. Rounded up to the next micro-dollar so a
 * reservation never undershoots.
 */
export function estimateUsd(input: EstimateInput): string {
  const inputTokens = input.inputTokens ?? Math.ceil(Math.max(input.chars, 0) / 4)
  const e10 =
    count(inputTokens) * parsePrice(input.price.inputPerM) +
    count(input.maxTokens) * parsePrice(input.price.outputPerM) +
    count(input.maxSearches ?? 0) * parsePrice(input.price.webSearchPerK) * 1000n
  const micro = (e10 + 9_999n) / 10_000n
  return formatUsd6(micro * 10_000n)
}
