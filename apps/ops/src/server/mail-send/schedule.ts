import 'server-only'
import { normaliseEnvelope, proposedMessageId, replySubject } from '@indus/ops-core'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'
import { emitEventOrThrow } from '../../inngest/emit'
import { getSetting } from '../settings/get'

/**
 * Put one email on the send queue (S04-T06, ADR-07, ADR-11). Every Gmail send in Ops starts here.
 *
 *   idempotency  the key is unique: a second call with the same key (double approve, double click, a redelivered
 *                event) returns the first row and emits nothing new, so there is one row and one Gmail call.
 *   hold         `undoUntil` = now + the `undo` setting (5 minutes by default). The UI shows the server's
 *                remaining milliseconds, never its own clock.
 *   mailbox      the caller names the mailbox (from the sending rule's role). A thread must belong to THAT
 *                mailbox: Ops never sends from a mailbox that does not hold the thread (08-map §1.9).
 *   approver     `approvedById` is the PERSON who approved. Do-and-tell and Do-quietly effects never pass one
 *                (their effect type has no approver field), so a priced client email they queue stops at the
 *                gate with `needs_person`.
 *
 * Then `ops/mail.send.requested` (event id `send:<outboundId>`) starts the one `ops.mail.send` run for the row.
 */
export type ScheduleAttachment = { fileId: string; filename: string; documentId?: string | null }

export type ScheduleInput = {
  idempotencyKey: string
  kind: $Enums.OutboundKind
  mailboxId: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  bodyHtml: string
  bodyText?: string | null
  /** ops.mail_thread id: a reply in this mailbox's thread. */
  threadId?: string | null
  /** The Message-ID being answered and its References chain (already trimmed by replyReferences). */
  inReplyToRfcId?: string | null
  referencesRfcIds?: string[]
  fromAlias?: string | null
  attachments?: ScheduleAttachment[]
  approvedById?: string | null
  basisHash?: string | null
  actionId?: string | null
  enquiryId?: string | null
  companyId?: string | null
  contactId?: string | null
  subjectType?: $Enums.RecordType | null
  subjectId?: string | null
  createdById?: string | null
  retryOfId?: string | null
  /** S10: the identifier check on supplier-bound text, read by the send gate (step 10) until S12's hook. */
  identifierCheck?: Prisma.InputJsonValue | null
}

export type ScheduleResult = {
  outboundId: string
  status: $Enums.OutboundStatus
  undoUntil: string | null
  undoRemainingMs: number
  duplicate: boolean
}

export class ScheduleError extends Error {
  constructor(
    readonly code: 'mailbox_not_found' | 'thread_in_other_mailbox' | 'bad_envelope',
    message: string
  ) {
    super(message)
    this.name = 'ScheduleError'
  }
}

type Deps = {
  now?: () => Date
  emit?: typeof emitEventOrThrow
}

function remaining(undoUntil: Date | null, now: Date): number {
  return undoUntil ? Math.max(0, undoUntil.getTime() - now.getTime()) : 0
}

async function existing(key: string, now: Date): Promise<ScheduleResult | null> {
  const row = await opsDb.outboundEmail.findUnique({
    where: { idempotencyKey: key },
    select: { id: true, status: true, undoUntil: true },
  })
  if (!row) return null
  return {
    outboundId: row.id,
    status: row.status,
    undoUntil: row.undoUntil?.toISOString() ?? null,
    undoRemainingMs: remaining(row.undoUntil, now),
    duplicate: true,
  }
}

export async function scheduleSend(input: ScheduleInput, deps: Deps = {}): Promise<ScheduleResult> {
  const now = (deps.now ?? (() => new Date()))()
  const first = await existing(input.idempotencyKey, now)
  if (first) return first

  const mailbox = await opsDb.mailbox.findUnique({
    where: { id: input.mailboxId },
    select: { id: true, address: true },
  })
  if (!mailbox) throw new ScheduleError('mailbox_not_found', 'That mailbox is not connected')
  if (input.threadId) {
    const thread = await opsDb.mailThread.findUnique({
      where: { id: input.threadId },
      select: { mailboxId: true },
    })
    if (!thread || thread.mailboxId !== mailbox.id) {
      throw new ScheduleError(
        'thread_in_other_mailbox',
        'That conversation is in another mailbox; start a new email from this one'
      )
    }
  }
  let envelope
  try {
    envelope = normaliseEnvelope(
      { to: input.to, cc: input.cc ?? [], bcc: input.bcc ?? [] },
      mailbox.address
    )
  } catch (error) {
    throw new ScheduleError('bad_envelope', (error as Error).message)
  }

  const { sendWindowMinutes } = await getSetting('undo')
  const undoUntil = new Date(now.getTime() + sendWindowMinutes * 60_000)
  const subject = input.inReplyToRfcId ? replySubject(input.subject) : input.subject

  let id: string
  try {
    id = await opsDb.$transaction(async (tx) => {
      const row = await tx.outboundEmail.create({
        data: {
          ...(input.identifierCheck ? { identifierCheck: input.identifierCheck } : {}),
          channel: 'gmail',
          kind: input.kind,
          mailboxId: mailbox.id,
          threadId: input.threadId ?? null,
          inReplyToRfcId: input.inReplyToRfcId ?? null,
          referencesRfcIds: input.referencesRfcIds ?? [],
          toAddresses: envelope.to,
          ccAddresses: envelope.cc,
          bccAddresses: envelope.bcc,
          subject,
          bodyHtml: input.bodyHtml,
          bodyText: input.bodyText ?? null,
          status: 'scheduled',
          undoUntil,
          idempotencyKey: input.idempotencyKey,
          fromAlias: input.fromAlias?.trim().toLowerCase() || null,
          approvedById: input.approvedById ?? null,
          approvedAt: input.approvedById ? now : null,
          basisHash: input.basisHash ?? null,
          actionId: input.actionId ?? null,
          enquiryId: input.enquiryId ?? null,
          companyId: input.companyId ?? null,
          contactId: input.contactId ?? null,
          subjectType: input.subjectType ?? null,
          subjectId: input.subjectId ?? null,
          createdById: input.createdById ?? null,
          retryOfId: input.retryOfId ?? null,
          attachments: {
            create: (input.attachments ?? []).map((a, position) => ({
              fileId: a.fileId,
              filename: a.filename,
              documentId: a.documentId ?? null,
              position,
            })),
          },
        },
        select: { id: true },
      })
      await tx.outboundEmail.update({
        where: { id: row.id },
        data: { proposedRfcMessageId: proposedMessageId(row.id) },
      })
      return row.id
    })
  } catch (error) {
    // A concurrent call with the same key won the insert: return its row, emit nothing.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const won = await existing(input.idempotencyKey, now)
      if (won) return won
    }
    throw error
  }

  await (deps.emit ?? emitEventOrThrow)({
    name: 'ops/mail.send.requested',
    id: `send:${id}`,
    data: { outboundId: id, mailboxId: mailbox.id, undoUntil: undoUntil.toISOString() },
  })
  return {
    outboundId: id,
    status: 'scheduled',
    undoUntil: undoUntil.toISOString(),
    undoRemainingMs: remaining(undoUntil, now),
    duplicate: false,
  }
}

/** The server's remaining undo milliseconds for a row (the UI counts down from this, ADR-11). */
export async function undoRemainingMs(outboundId: string, now = new Date()): Promise<number> {
  const row = await opsDb.outboundEmail.findUnique({
    where: { id: outboundId },
    select: { undoUntil: true, status: true },
  })
  if (!row || row.status !== 'scheduled') return 0
  return remaining(row.undoUntil, now)
}
