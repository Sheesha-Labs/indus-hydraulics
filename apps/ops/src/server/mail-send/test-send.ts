import 'server-only'
import { randomUUID } from 'node:crypto'
import { replyReferences } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { getSetting } from '../settings/get'
import { resolveSendEnvelope } from './envelope'
import { scheduleSend, type ScheduleResult } from './schedule'

/**
 * "Send a test email…" (S04-T07, Owner only, a diagnostic not drawn on board 85). It goes through the same queue
 * as every send: the hold (Undo), the send slot, the gate, one claim and one send.
 * The recipient must be on the Owner-edited `mail.test_allowlist` (internal addresses only).
 *
 *   reply   in the latest thread of THIS mailbox with that address (In-Reply-To, References, single Re:)
 *   new     a new thread
 */
export class TestSendError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TestSendError'
  }
}

export async function sendTestEmail(input: {
  userId: string
  mailboxId: string
  to: string
  mode: 'reply' | 'new'
  now?: Date
}): Promise<ScheduleResult & { threaded: boolean }> {
  const now = input.now ?? new Date()
  const to = input.to.trim().toLowerCase()
  const { addresses } = await getSetting('mail.test_allowlist')
  if (!addresses.includes(to)) {
    throw new TestSendError('Add this address to the test list in Settings › Mailboxes first.')
  }
  const resolved = await resolveSendEnvelope('other', { mailboxId: input.mailboxId })
  if (!resolved.ok) throw new TestSendError(resolved.message)
  const { envelope } = resolved

  let thread: { threadId: string; rfc: string; refs: string[]; subject: string } | null = null
  if (input.mode === 'reply') {
    const last = await opsDb.mailMessage.findFirst({
      where: {
        mailboxId: envelope.mailboxId,
        rfcMessageId: { not: null },
        OR: [{ fromAddress: to }, { toAddresses: { has: to } }],
      },
      orderBy: { sentAt: 'desc' },
      select: { threadId: true, rfcMessageId: true, referencesRfcIds: true, subject: true },
    })
    if (last?.rfcMessageId) {
      thread = {
        threadId: last.threadId,
        rfc: last.rfcMessageId,
        refs: replyReferences(last.referencesRfcIds, last.rfcMessageId),
        subject: last.subject ?? 'Test email',
      }
    }
  }

  const when = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(now)
  const text = `This is a test email from Indus Operations, sent from ${envelope.mailboxAddress} at ${when} GST. No action is needed.`
  const result = await scheduleSend(
    {
      idempotencyKey: `test:${randomUUID()}`,
      kind: 'other',
      mailboxId: envelope.mailboxId,
      to: [to],
      subject: thread ? thread.subject : 'Test email from Indus Operations',
      bodyHtml: `<p>${text}</p>`,
      bodyText: text,
      fromAlias: envelope.fromAlias,
      approvedById: input.userId,
      createdById: input.userId,
      ...(thread
        ? { threadId: thread.threadId, inReplyToRfcId: thread.rfc, referencesRfcIds: thread.refs }
        : {}),
    },
    { now: () => now }
  )
  return { ...result, threaded: !!thread }
}
