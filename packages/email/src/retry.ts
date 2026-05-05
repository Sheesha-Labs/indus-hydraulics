import { Resend } from 'resend'
import { db } from '@indus/db'

import type { RetryablePayload } from './send'

/**
 * Retry queue for failed transactional emails.
 *
 * The initial `sendEmail` flow stashes a serialisable copy of the input
 * on `SentEmail.payload`. When Resend rejects the send (rate-limit, DNS
 * blip, transient 5xx) the row is marked `status='failed'`. The hourly
 * `email.retry-failed` Inngest cron picks those rows up and calls
 * `retryFailedEmail()` per row.
 *
 * Backoff schedule (from the row's most recent attempt):
 * - retryCount=0  → eligible after 5 minutes
 * - retryCount=1  → eligible after 30 minutes
 * - retryCount=2  → eligible after 3 hours
 * - retryCount=3+ → terminal `dead_letter`
 *
 * Emails with attachments are never retried — the binary content isn't
 * recoverable from the audit row, so `payload` is null for those and the
 * cron skips them.
 */

export const RETRY_BACKOFF_MS: ReadonlyArray<number> = [
  5 * 60 * 1000,
  30 * 60 * 1000,
  3 * 60 * 60 * 1000,
]

export const MAX_RETRIES = RETRY_BACKOFF_MS.length

export function isEligibleForRetry(
  retryCount: number,
  attemptedAt: Date,
  lastAttemptAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (retryCount >= MAX_RETRIES) return false
  const wait = RETRY_BACKOFF_MS[retryCount]
  if (wait === undefined) return false
  const since = lastAttemptAt ?? attemptedAt
  return now.getTime() - since.getTime() >= wait
}

export type RetryOutcome =
  | { ok: true; status: 'sent'; providerId: string | null }
  | { ok: false; status: 'failed' | 'dead_letter'; error: string }

const resendClient = (() => {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
})()

function formatFrom(p: RetryablePayload): string {
  return p.fromName ? `${p.fromName} <${p.fromEmail}>` : p.fromEmail
}

/**
 * Re-attempt a single failed email by ID. Updates the row in place — no
 * new audit row is created so the retry history is contained on the
 * original send. Idempotent: if the row is no longer eligible (already
 * retried by a concurrent cron, status changed, no payload, etc.) the
 * function returns early without side effects.
 */
export async function retryFailedEmail(sentEmailId: string, now: Date = new Date()): Promise<RetryOutcome | null> {
  const row = await db.sentEmail.findUnique({ where: { id: sentEmailId } })
  if (!row) return null
  if (row.status !== 'failed') return null
  if (!row.payload) return null
  if (row.retryCount >= MAX_RETRIES) return null
  if (!isEligibleForRetry(row.retryCount, row.attemptedAt, row.lastAttemptAt, now)) return null

  if (!resendClient) {
    // No API key in this environment — can't retry. Leave row as-is so a
    // later environment with a key can pick it up.
    return null
  }

  // The payload is serialised JSON; cast to the type the writer wrote.
  const payload = row.payload as unknown as RetryablePayload

  const nextRetryCount = row.retryCount + 1
  const willDeadLetter = nextRetryCount >= MAX_RETRIES

  try {
    const result = await resendClient.emails.send({
      from: formatFrom(payload),
      to: payload.to,
      ...(payload.cc && payload.cc.length ? { cc: payload.cc } : {}),
      ...(payload.bcc && payload.bcc.length ? { bcc: payload.bcc } : {}),
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      subject: payload.subject,
      html: payload.html,
    })

    if (result.error) {
      await db.sentEmail.update({
        where: { id: row.id },
        data: {
          status: willDeadLetter ? 'dead_letter' : 'failed',
          error: result.error.message,
          retryCount: nextRetryCount,
          lastAttemptAt: now,
        },
      })
      return {
        ok: false,
        status: willDeadLetter ? 'dead_letter' : 'failed',
        error: result.error.message,
      }
    }

    await db.sentEmail.update({
      where: { id: row.id },
      data: {
        status: 'sent',
        providerId: result.data?.id ?? null,
        sentAt: now,
        retryCount: nextRetryCount,
        lastAttemptAt: now,
        error: null,
      },
    })
    return { ok: true, status: 'sent', providerId: result.data?.id ?? null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email retry error'
    await db.sentEmail.update({
      where: { id: row.id },
      data: {
        status: willDeadLetter ? 'dead_letter' : 'failed',
        error: message,
        retryCount: nextRetryCount,
        lastAttemptAt: now,
      },
    })
    return {
      ok: false,
      status: willDeadLetter ? 'dead_letter' : 'failed',
      error: message,
    }
  }
}

/**
 * Find candidate SentEmail rows eligible for a retry attempt right now.
 * Caller (the Inngest cron) loops and calls `retryFailedEmail()` per id.
 *
 * The query uses a coarse `lastAttemptAt < earliest_threshold` filter
 * to keep the index sargable, then `isEligibleForRetry` re-checks the
 * precise per-row backoff in JS.
 */
export async function findRetryableEmailIds(
  limit: number = 50,
  now: Date = new Date(),
): Promise<string[]> {
  const earliest = new Date(now.getTime() - (RETRY_BACKOFF_MS[0] ?? 0))
  const rows = await db.sentEmail.findMany({
    where: {
      status: 'failed',
      retryCount: { lt: MAX_RETRIES },
      OR: [
        { lastAttemptAt: null, attemptedAt: { lt: earliest } },
        { lastAttemptAt: { lt: earliest } },
      ],
    },
    select: { id: true, retryCount: true, attemptedAt: true, lastAttemptAt: true, payload: true },
    orderBy: { attemptedAt: 'asc' },
    take: limit,
  })
  return rows
    .filter((r) => r.payload !== null)
    .filter((r) => isEligibleForRetry(r.retryCount, r.attemptedAt, r.lastAttemptAt, now))
    .map((r) => r.id)
}
