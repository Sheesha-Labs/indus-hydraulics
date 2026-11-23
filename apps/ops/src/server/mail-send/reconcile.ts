import 'server-only'
import { OUTBOUND_HEADER } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import type { OpsEvent } from '../../inngest/emit'
import { emitEvents } from '../../inngest/emit-batch'
import type { GmailApi } from '../gmail/client'
import { gmailFor } from '../gmail/mailbox-client'
import { raiseNotification } from '../notify/raise'
import { countSent } from './send-once'
import { moveOutbound } from './status'

/**
 * An ambiguous send (timeout, reset, 5xx after the body left) is looked for, never resent (S04-T06, ADR-07):
 *
 *   list Sent from one minute before the claim, read each candidate's X-Indus-Outbound header (metadata only)
 *   found      `unknown → sent` with the Gmail id, the time Gmail recorded and the RFC Message-ID
 *   not found  reconcileChecks + 1; from the second check (five minutes after the first) a Review notification:
 *              "We can't tell whether this was sent. Check Sent in Gmail, then Resend or Mark as sent."
 *
 * The row stays `unknown` until it is found or a person decides. Nothing here calls messages.send.
 */
export const UNKNOWN_TITLE = "We can't tell whether this was sent"
export const UNKNOWN_BODY = 'Check Sent in Gmail, then Resend or Mark as sent.'
export const NOTIFY_AFTER_CHECKS = 2
const MAX_PAGES = 4

export type ReconcileResult =
  | { kind: 'sent'; gmailMessageId: string }
  | { kind: 'unknown'; checks: number; notified: boolean }
  | { kind: 'not_unknown' }

function headerOf(
  headers: Array<{ name?: string | null; value?: string | null }> | undefined,
  name: string
) {
  return (
    headers?.find((h) => (h.name ?? '').toLowerCase() === name.toLowerCase())?.value?.trim() ?? null
  )
}

export async function reconcile(
  outboundId: string,
  deps: { gmail?: GmailApi; now?: () => Date } = {}
): Promise<ReconcileResult> {
  const row = await opsDb.outboundEmail.findUnique({
    where: { id: outboundId },
    select: {
      id: true,
      status: true,
      mailboxId: true,
      claimedAt: true,
      reconcileChecks: true,
      subject: true,
    },
  })
  if (!row || row.status !== 'unknown' || !row.mailboxId) return { kind: 'not_unknown' }
  const gmail = deps.gmail ?? gmailFor(row.mailboxId, 'live')
  const since = Math.floor(((row.claimedAt ?? new Date()).getTime() - 60_000) / 1000)

  let pageToken: string | undefined
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const list = await gmail.messages.list({
      q: `in:sent after:${since}`,
      maxResults: 100,
      ...(pageToken ? { pageToken } : {}),
    })
    for (const m of list.messages ?? []) {
      if (!m.id) continue
      const meta = await gmail.messages.get({
        id: m.id,
        format: 'metadata',
        metadataHeaders: [OUTBOUND_HEADER, 'Message-ID'],
      })
      if (headerOf(meta.payload?.headers ?? undefined, OUTBOUND_HEADER) !== row.id) continue
      const sentAt = meta.internalDate ? new Date(Number(meta.internalDate)) : new Date()
      const moved = await moveOutbound(row.id, ['unknown'], 'sent', {
        gmailMessageId: m.id,
        sentAt,
        rfcMessageId: headerOf(meta.payload?.headers ?? undefined, 'Message-ID'),
        failureReason: null,
      })
      if (moved) await countSent(row.mailboxId, sentAt)
      return { kind: 'sent', gmailMessageId: m.id }
    }
    pageToken = list.nextPageToken ?? undefined
    if (!pageToken) break
  }

  const checks = row.reconcileChecks + 1
  await opsDb.outboundEmail.updateMany({
    where: { id: row.id, status: 'unknown' },
    data: { reconcileChecks: checks },
  })
  let notified = false
  if (checks >= NOTIFY_AFTER_CHECKS) {
    const { created } = await raiseNotification({
      event: 'action_failed',
      severity: 'urgent',
      title: UNKNOWN_TITLE,
      body: UNKNOWN_BODY,
      dedupeKey: `outbound_unknown:${row.id}`,
      audience: 'all',
    })
    notified = created > 0
  }
  return { kind: 'unknown', checks, notified }
}

/**
 * The 15-minute sweep (ops.mail.send.reconcile):
 *   - every `unknown` row is looked for again (a delayed Sent copy still turns up)
 *   - a `sent` row whose RFC Message-ID could not be read back gets it now
 *   - a `scheduled` row stranded without a run (its request event never reached Inngest, or the run ended) is
 *     re-requested. Re-requesting is safe: the claim is conditional, so two runs still send once.
 */
export async function reconcileSweep(
  deps: {
    gmailFor?: (mailboxId: string) => GmailApi
    emit?: (events: readonly OpsEvent[]) => Promise<number>
    now?: () => Date
  } = {}
): Promise<{ checked: number; found: number; readBack: number; requeued: number }> {
  const now = (deps.now ?? (() => new Date()))()
  const client = deps.gmailFor ?? ((id: string) => gmailFor(id, 'live'))
  const unknown = await opsDb.outboundEmail.findMany({
    where: { status: 'unknown' },
    select: { id: true, mailboxId: true },
    orderBy: { claimedAt: 'asc' },
    take: 25,
  })
  let found = 0
  for (const u of unknown) {
    if (!u.mailboxId) continue
    const r = await reconcile(u.id, { gmail: client(u.mailboxId), now: () => now })
    if (r.kind === 'sent') found += 1
  }

  const missing = await opsDb.outboundEmail.findMany({
    where: {
      status: 'sent',
      rfcMessageId: null,
      gmailMessageId: { not: null },
      sentAt: { gt: new Date(now.getTime() - 7 * 86_400_000) },
    },
    select: { id: true, mailboxId: true, gmailMessageId: true },
    take: 25,
  })
  let readBack = 0
  for (const m of missing) {
    if (!m.mailboxId || !m.gmailMessageId) continue
    try {
      const meta = await client(m.mailboxId).messages.get({
        id: m.gmailMessageId,
        format: 'metadata',
        metadataHeaders: ['Message-ID'],
      })
      const id = headerOf(meta.payload?.headers ?? undefined, 'Message-ID')
      if (id) {
        await opsDb.outboundEmail.update({ where: { id: m.id }, data: { rfcMessageId: id } })
        readBack += 1
      }
    } catch {
      // Next sweep.
    }
  }

  const stale = new Date(now.getTime() - 15 * 60_000)
  const stranded = await opsDb.outboundEmail.findMany({
    where: {
      channel: 'gmail',
      status: 'scheduled',
      undoUntil: { lt: stale },
      updatedAt: { lt: stale },
      OR: [{ sendSlotAt: null }, { sendSlotAt: { lt: stale } }],
    },
    select: { id: true, mailboxId: true },
    take: 50,
  })
  const events: OpsEvent[] = stranded.map((s) => ({
    name: 'ops/mail.send.requested',
    id: `send:${s.id}:requeue:${Math.floor(now.getTime() / 900_000)}`,
    data: { outboundId: s.id, mailboxId: s.mailboxId, undoUntil: now.toISOString() },
  }))
  if (events.length) await (deps.emit ?? emitEvents)(events)
  return { checked: unknown.length, found, readBack, requeued: events.length }
}
