import { googleReasonOf, httpStatusOf, MailboxUnavailableError } from './errors'

/**
 * Retry for Gmail READS and LABEL WRITES only (S04-T03, 08-map-integrations §1.12): 429, 403
 * rateLimitExceeded / userRateLimitExceeded and 5xx, with full jitter (base 1 s, factor 2, max 64 s), honouring
 * Retry-After, at most 6 attempts. 401 / invalid_grant become MailboxUnavailableError at once.
 *
 * Sends are never retried (ADR-07: "No automatic resend after approval, ever"). The type system keeps them out:
 * a function branded as a send cannot be passed here (see `SendCall`).
 */
declare const SEND_BRAND: unique symbol
/** A call that sends mail. withBackoff refuses this type at compile time. */
export type SendCall<T> = (() => Promise<T>) & { readonly [SEND_BRAND]: true }

/** Brand a send so it can never be handed to withBackoff. */
export function sendCall<T>(fn: () => Promise<T>): SendCall<T> {
  return fn as SendCall<T>
}

type NotSend<F> = F extends { readonly [SEND_BRAND]: true } ? never : F

export type BackoffOptions = {
  kind: 'read' | 'label'
  mailboxId?: string
  maxAttempts?: number
  baseMs?: number
  maxMs?: number
  sleep?: (ms: number) => Promise<void>
  random?: () => number
}

const RATE_REASONS = new Set(['rateLimitExceeded', 'userRateLimitExceeded'])

/** Whether a failed read may be tried again. */
export function isRetriable(error: unknown): boolean {
  const status = httpStatusOf(error)
  if (status === 429) return true
  if (status !== undefined && status >= 500) return true
  if (status === 403 && RATE_REASONS.has(googleReasonOf(error) ?? '')) return true
  const code = (error as { code?: unknown })?.code
  return code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'EAI_AGAIN'
}

function isAuthFailure(error: unknown): boolean {
  return httpStatusOf(error) === 401 || googleReasonOf(error) === 'invalid_grant'
}

/** Retry-After as milliseconds (seconds or an HTTP date), if the error carries one. */
export function retryAfterMs(error: unknown, now = Date.now()): number | undefined {
  const headers = (error as { response?: { headers?: unknown } })?.response?.headers
  let raw: unknown
  if (headers && typeof (headers as Headers).get === 'function')
    raw = (headers as Headers).get('retry-after')
  else if (headers && typeof headers === 'object')
    raw = (headers as Record<string, unknown>)['retry-after']
  if (typeof raw !== 'string' && typeof raw !== 'number') return undefined
  const seconds = Number(raw)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const at = Date.parse(String(raw))
  return Number.isFinite(at) ? Math.max(0, at - now) : undefined
}

export async function withBackoff<T, F extends () => Promise<T>>(
  fn: NotSend<F>,
  options: BackoffOptions
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 6
  const base = options.baseMs ?? 1_000
  const max = options.maxMs ?? 64_000
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const random = options.random ?? Math.random
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await (fn as F)()
    } catch (error) {
      if (isAuthFailure(error)) {
        throw new MailboxUnavailableError(options.mailboxId ?? 'unknown', 'token_expired')
      }
      if (attempt >= maxAttempts || !isRetriable(error)) throw error
      const cap = Math.min(max, base * 2 ** (attempt - 1))
      const wait = retryAfterMs(error) ?? Math.floor(random() * cap)
      await sleep(Math.min(wait, max))
    }
  }
}
