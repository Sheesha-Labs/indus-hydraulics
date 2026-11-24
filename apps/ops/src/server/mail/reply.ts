import 'server-only'
import { createHash } from 'node:crypto'
import { opsDb, type Prisma } from '@indus/ops-db'
import { replyReferences } from '@indus/ops-core'
import type { OpsUser } from '../../lib/access-core'
import { basisHash } from '../assistant/runner'
import { setActor } from '../assistant/write-tracked'
import { threadVersion } from './thread-version'
import { htmlToText, sanitizeMailHtml } from '../gmail/html'
import { resolveSendEnvelope } from '../mail-send/envelope'
import { scheduleSend } from '../mail-send/schedule'

/**
 * A reply from the Mail view (S05-T05). Always in the thread's own mailbox (never switched), always through
 * the send queue with its five-minute undo.
 *
 * Who may send (decision, flagged for sign-off):
 *   - the Owner, from either mailbox;
 *   - a Helper, from the supplier mailbox (purchase@) when "can send supplier mail" is on;
 *   - a Helper's reply in a client-mailbox (sales@) thread is NOT sent: it becomes a `manual_reply` proposal,
 *     "Ask Krishan to send", in Review.
 */
export class ReplyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReplyError'
  }
}

export type ReplyOutcome =
  | { kind: 'scheduled'; outboundId: string; undoRemainingMs: number }
  | { kind: 'proposed'; actionRef: string }

export interface ReplyInput {
  user: OpsUser
  threadId: string
  to: string[]
  cc: string[]
  html: string
}

function dubaiDay(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function replySubject(subject: string | null): string {
  const s = (subject ?? '').trim()
  return /^re:/i.test(s) ? s : `Re: ${s || '(no subject)'}`
}

/** Who may do what with a reply in a mailbox of this role. */
export function replyPermission(
  user: Pick<OpsUser, 'role' | 'canSendSupplierMail'>,
  mailboxRole: string
): 'send' | 'propose' | 'none' {
  if (user.role === 'owner')
    return mailboxRole === 'client' || mailboxRole === 'supplier' ? 'send' : 'none'
  if (mailboxRole === 'supplier') return user.canSendSupplierMail ? 'send' : 'none'
  if (mailboxRole === 'client') return 'propose'
  return 'none'
}

export async function replyInThread(input: ReplyInput, now = new Date()): Promise<ReplyOutcome> {
  const to = [...new Set(input.to.map((a) => a.trim().toLowerCase()).filter(Boolean))]
  const cc = [...new Set(input.cc.map((a) => a.trim().toLowerCase()).filter(Boolean))]
  if (to.length === 0) throw new ReplyError('Add at least one recipient')
  const thread = await opsDb.mailThread.findUnique({
    where: { id: input.threadId },
    select: {
      id: true,
      subject: true,
      mailbox: { select: { id: true, role: true, address: true } },
      messages: {
        where: { rfcMessageId: { not: null } },
        orderBy: { sentAt: 'desc' },
        take: 1,
        select: { rfcMessageId: true, referencesRfcIds: true, subject: true },
      },
    },
  })
  if (!thread) throw new ReplyError('That conversation is no longer here')
  const permission = replyPermission(input.user, thread.mailbox.role)
  if (permission === 'none') throw new ReplyError('You cannot reply from this mailbox')

  const html = sanitizeMailHtml(input.html)
  const text = htmlToText(html).trim()
  if (!text) throw new ReplyError('Write the reply first')
  const last = thread.messages[0]
  const subject = replySubject(last?.subject ?? thread.subject)

  if (permission === 'propose') {
    // A Helper's reply on the client mailbox waits for the Owner (manual_reply, Draft and ask).
    // The basis: the thread's latest inbound. A client reply after this makes the card stale (S06-T01).
    const basis = basisHash({ thread: await threadVersion(thread.id) })
    const ref = await opsDb.$transaction(async (tx: Prisma.TransactionClient) => {
      await setActor(tx, { kind: 'user', id: input.user.id })
      const [num] = await tx.$queryRaw<Array<{ formatted: string }>>`
        SELECT formatted FROM ops.allocate_number('assistant_action', ${dubaiDay(now)})`
      if (!num) throw new Error('allocate_number returned no row')
      await tx.assistantAction.create({
        data: {
          ref: num.formatted,
          actionKey: 'manual_reply',
          levelAtTime: 'draft_and_ask',
          guardrails: [],
          subjectType: 'mail_thread',
          subjectId: thread.id,
          headline: `Ask Krishan to send: ${subject}`,
          reasons: [
            { text: `${input.user.name} wrote a reply in a ${thread.mailbox.address} thread` },
          ] as unknown as Prisma.InputJsonValue,
          preview: {
            mailbox: thread.mailbox.address,
            to,
            cc,
            subject,
            html,
          } as Prisma.InputJsonValue,
          checks: [
            { label: 'Client mailbox', status: 'warn', detail: 'Only the Owner sends from it' },
          ] as unknown as Prisma.InputJsonValue,
          confidence: 'sure',
          onApproveText: `Sends the reply from ${thread.mailbox.address} in this thread`,
          inputs: {
            threadId: thread.id,
            writtenById: input.user.id,
            // S06: the request the staleness check and the approval read, as for a runner action.
            request: {
              actionKey: 'manual_reply',
              subjectType: 'mail_thread',
              subjectId: thread.id,
              trigger: 'person',
              origin: 'manual',
              sourceVersion: basis,
            },
          } as Prisma.InputJsonValue,
          basisHash: basis,
          state: 'proposed',
          origin: 'manual',
          surface: 'review',
          levelReasons: [
            'A Helper reply on the client mailbox always asks the Owner',
          ] as unknown as Prisma.InputJsonValue,
        },
      })
      return num.formatted
    })
    return { kind: 'proposed', actionRef: ref }
  }

  const resolved = await resolveSendEnvelope('other', { mailboxId: thread.mailbox.id })
  if (!resolved.ok) throw new ReplyError(resolved.message)
  const key = createHash('sha256')
    .update(
      `${input.user.id}:${thread.id}:${to.join(',')}:${html}:${Math.floor(now.getTime() / 60_000)}`
    )
    .digest('hex')
    .slice(0, 32)
  const result = await scheduleSend(
    {
      idempotencyKey: `reply:${key}`,
      kind: 'other',
      mailboxId: thread.mailbox.id,
      to,
      cc,
      subject,
      bodyHtml: html,
      bodyText: text,
      fromAlias: resolved.envelope.fromAlias,
      threadId: thread.id,
      ...(last?.rfcMessageId
        ? {
            inReplyToRfcId: last.rfcMessageId,
            referencesRfcIds: replyReferences(last.referencesRfcIds, last.rfcMessageId),
          }
        : {}),
      approvedById: input.user.id,
      createdById: input.user.id,
      subjectType: 'mail_thread',
      subjectId: thread.id,
    },
    { now: () => now }
  )
  return {
    kind: 'scheduled',
    outboundId: result.outboundId,
    undoRemainingMs: result.undoRemainingMs,
  }
}
