import 'server-only'
import { opsDb } from '@indus/ops-db'
import type { GmailApi } from '../gmail/client'
import {
  GmailPolicyError,
  httpStatusOf,
  MailboxUnavailableError,
  QuotaWaitTooLong,
} from '../gmail/errors'
import { gmailFor } from '../gmail/mailbox-client'
import { OAuthHttpError } from '../gmail/oauth'
import { getAccessToken } from '../gmail/tokens'
import { getSetting } from '../settings/get'
import { buildMime, MimeBuildError, type BuiltMime } from './mime'
import { capDay } from './slot'
import { moveOutbound } from './status'

/**
 * Claim → send → record, once (S04-T06, ADR-07). The single place `users.messages.send` is called for business
 * mail, and it is called at most once per row: there is no loop and no retry here, the Gmail client never retries
 * a send (backoff.ts brands it), and `ops.mail.send` runs with `retries: 0`.
 *
 *   before the claim   build the MIME (attachments read from storage) and refresh the access token, so the
 *                      common failures happen while the row is still `scheduled`: it becomes `failed` with
 *                      `not_dispatched:<why>` (forward only; a person retries with a NEW idempotency key)
 *   the claim          UPDATE … SET status 'sending' WHERE id AND status 'scheduled': zero rows → not_claimed
 *                      (another run, an Undo, a cancel). The claim commits before the network call: no database
 *                      connection is held while Google answers.
 *   the call           2xx → `sent`, Gmail id, counted against the cap, then the RFC Message-ID read back
 *                      a definite 4xx → `failed` (Review card: fix the contact, Resend)
 *                      the token or quota failing inside the call (nothing reached Google) → `failed`
 *                        `not_dispatched:<why>`
 *                      timeout, reset, 5xx, anything else → `unknown`: reconcile looks in Sent. Never resent.
 */
export type SendOnceResult =
  | { kind: 'sent'; gmailMessageId: string }
  | { kind: 'failed'; reason: string }
  | { kind: 'ambiguous'; reason: string }
  | { kind: 'not_claimed' }

type Deps = {
  gmail?: GmailApi
  now?: () => Date
  /** Refresh the token before the claim. Tests with a fake transport pass a no-op. */
  preflight?: (mailboxId: string) => Promise<unknown>
}

/** Errors raised inside the client before any byte went to Google. */
function notDispatched(error: unknown): string | null {
  if (error instanceof MailboxUnavailableError) return error.reason
  if (error instanceof QuotaWaitTooLong) return 'quota'
  if (error instanceof OAuthHttpError) return 'token_refresh'
  if (error instanceof GmailPolicyError) return 'policy'
  if (error instanceof MimeBuildError) return error.code
  return null
}

/** A rejection Google answered definitely: the message was not accepted. */
function definiteRejection(status: number | undefined): boolean {
  return status !== undefined && status >= 400 && status < 500 && status !== 408
}

function safeReason(error: unknown): string {
  const status = httpStatusOf(error)
  const name = error instanceof Error ? error.name : 'error'
  return status ? `http_${status}` : name.slice(0, 60)
}

/** Count one console send against the mailbox's cap day (resets 04:00 GST). */
export async function countSent(mailboxId: string, now: Date): Promise<void> {
  const { capReset } = await getSetting('send.timing')
  const day = capDay(now, capReset)
  await opsDb.$transaction(async (tx) => {
    const state = await tx.mailboxSyncState.findUnique({
      where: { mailboxId },
      select: { sentToday: true, sentTodayDate: true },
    })
    const same = state?.sentTodayDate?.getTime() === day.getTime()
    await tx.mailboxSyncState.upsert({
      where: { mailboxId },
      create: { mailboxId, sentToday: 1, sentTodayDate: day },
      update: same ? { sentToday: { increment: 1 } } : { sentToday: 1, sentTodayDate: day },
    })
  })
}

export async function sendOnce(outboundId: string, deps: Deps = {}): Promise<SendOnceResult> {
  const now = deps.now ?? (() => new Date())
  const row = await opsDb.outboundEmail.findUnique({
    where: { id: outboundId },
    select: {
      status: true,
      mailboxId: true,
      thread: { select: { mailboxId: true, gmailThreadId: true } },
    },
  })
  if (!row || row.status !== 'scheduled' || !row.mailboxId) return { kind: 'not_claimed' }
  const mailboxId = row.mailboxId

  // Before the claim: everything that can fail without Google.
  let mime: BuiltMime
  try {
    mime = await buildMime(outboundId)
    await (deps.preflight ?? getAccessToken)(mailboxId)
  } catch (error) {
    const why = notDispatched(error) ?? 'prepare_failed'
    await moveOutbound(outboundId, ['scheduled'], 'failed', {
      failureReason: `not_dispatched:${why}`,
    })
    return { kind: 'failed', reason: `not_dispatched:${why}` }
  }

  // The claim: one conditional update, committed before the network call.
  const claimed = await moveOutbound(outboundId, ['scheduled'], 'sending', { claimedAt: now() })
  if (!claimed) return { kind: 'not_claimed' }

  // A thread id only when the thread is in THIS mailbox (never send from a mailbox that lacks it).
  const threadId =
    row.thread && row.thread.mailboxId === mailboxId ? row.thread.gmailThreadId : undefined
  const gmail = deps.gmail ?? gmailFor(mailboxId, 'send')

  let sent
  try {
    sent = await gmail.messages.send({ raw: mime.raw, ...(threadId ? { threadId } : {}) })
  } catch (error) {
    const why = notDispatched(error)
    if (why) {
      await moveOutbound(outboundId, ['sending'], 'failed', {
        failureReason: `not_dispatched:${why}`,
      })
      return { kind: 'failed', reason: `not_dispatched:${why}` }
    }
    const status = httpStatusOf(error)
    if (definiteRejection(status)) {
      await moveOutbound(outboundId, ['sending'], 'failed', { failureReason: safeReason(error) })
      return { kind: 'failed', reason: safeReason(error) }
    }
    await moveOutbound(outboundId, ['sending'], 'unknown', { failureReason: safeReason(error) })
    return { kind: 'ambiguous', reason: safeReason(error) }
  }

  const gmailMessageId = sent.id ?? ''
  const sentAt = now()
  await moveOutbound(outboundId, ['sending'], 'sent', {
    gmailMessageId: gmailMessageId || null,
    sentAt,
    failureReason: null,
    holdReason: null,
  })
  await countSent(mailboxId, sentAt)

  // Read back the RFC Message-ID Gmail actually used. A failure here changes nothing about the send.
  if (gmailMessageId) {
    try {
      const meta = await gmail.messages.get({
        id: gmailMessageId,
        format: 'metadata',
        metadataHeaders: ['Message-ID'],
      })
      const header = meta.payload?.headers?.find(
        (h) => (h.name ?? '').toLowerCase() === 'message-id'
      )
      await opsDb.outboundEmail.update({
        where: { id: outboundId },
        data: { rfcMessageId: header?.value?.trim() || null },
      })
    } catch {
      // Left null, never assumed to be the proposed id; reconcile fills it on its next pass.
    }
  }
  return { kind: 'sent', gmailMessageId }
}
