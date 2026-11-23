import { NonRetriableError } from 'inngest'

/**
 * Gmail errors Ops raises itself (S04-T03). Each extends Inngest's NonRetriableError where a retry cannot help,
 * so a step that throws one fails at once instead of burning attempts (08-map-integrations §1.12).
 */

/** A call the allow-list forbids: a system label, an unknown label id, a method Ops never makes. */
export class GmailPolicyError extends NonRetriableError {
  constructor(message: string) {
    super(message)
    this.name = 'GmailPolicyError'
  }
}

/** The mailbox cannot be used: token expired or revoked (`invalid_grant`, 401), disconnected, paused. */
export class MailboxUnavailableError extends NonRetriableError {
  constructor(
    readonly mailboxId: string,
    readonly reason: 'token_expired' | 'revoked' | 'not_connected' | 'not_configured' | 'paused'
  ) {
    super(`Mailbox unavailable: ${reason}`)
    this.name = 'MailboxUnavailableError'
  }
}

/**
 * The quota bucket would need more than the in-step wait allows. Retriable on purpose: the Inngest step is
 * retried later, when the bucket has refilled.
 */
export class QuotaWaitTooLong extends Error {
  constructor(
    readonly bucket: string,
    readonly waitMs: number
  ) {
    super(`Gmail quota: ${bucket} bucket needs ${Math.ceil(waitMs / 1000)} s`)
    this.name = 'QuotaWaitTooLong'
  }
}

/** history.list answered 404: the stored startHistoryId is older than Google keeps. The caller resyncs. */
export class HistoryTooOldError extends NonRetriableError {
  constructor() {
    super('Gmail history is older than Google keeps; a bounded resync is needed')
    this.name = 'HistoryTooOldError'
  }
}

/** The HTTP status of a Gmail/Google error, whatever shape the transport gave it. */
export function httpStatusOf(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined
  const e = error as { status?: unknown; code?: unknown; response?: { status?: unknown } }
  const candidates = [e.status, e.response?.status, e.code]
  for (const c of candidates) {
    const n = typeof c === 'string' ? Number(c) : c
    if (typeof n === 'number' && Number.isInteger(n) && n >= 100 && n < 600) return n
  }
  return undefined
}

/** Google's `reason` field (rateLimitExceeded, userRateLimitExceeded, invalid_grant …), if any. */
export function googleReasonOf(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined
  const e = error as {
    reason?: unknown
    errors?: Array<{ reason?: unknown }>
    response?: {
      data?: { error?: unknown; error_description?: unknown } & {
        errors?: Array<{ reason?: unknown }>
      }
    }
  }
  if (typeof e.reason === 'string') return e.reason
  const listed = e.errors?.[0]?.reason ?? e.response?.data?.errors?.[0]?.reason
  if (typeof listed === 'string') return listed
  const data = e.response?.data?.error
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const nested = (data as { errors?: Array<{ reason?: unknown }>; status?: unknown }).errors?.[0]
      ?.reason
    if (typeof nested === 'string') return nested
  }
  return undefined
}
