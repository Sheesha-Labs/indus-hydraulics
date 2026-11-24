import 'server-only'
import { opsDb, Prisma } from '@indus/ops-db'
import { emitEvent } from '../../inngest/emit'
import { scheduleSend } from '../mail-send/schedule'
import { DecisionError, type Decider } from './decisions'
import { setCounters } from './live-counter'
import { setActor } from './write-tracked'

/**
 * A send that went wrong after approval (S06-T03, board 110): Retry, Copy text, Mark as sent. Nothing is ever
 * retried on its own: Retry is a person's click, and makes a NEW outbound row with a NEW idempotency key
 * (`<actionId>:retry:<n>`, retryOfId the failed row), so the queue sends it once. A send with no action of its
 * own (an Owner's reply, a test send) gets an `outbound_attention` card so it has the same verbs.
 */
const ATTENTION_REF = 'outbound_attention'

async function latestOutbound(actionId: string) {
  return opsDb.outboundEmail.findFirst({
    where: { actionId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      failureReason: true,
      mailboxId: true,
      threadId: true,
      inReplyToRfcId: true,
      referencesRfcIds: true,
      toAddresses: true,
      ccAddresses: true,
      subject: true,
      bodyHtml: true,
      bodyText: true,
      kind: true,
      fromAlias: true,
      enquiryId: true,
      companyId: true,
      contactId: true,
      subjectType: true,
      subjectId: true,
    },
  })
}

/** The failed send of an action card or of an attention card. */
async function sendFor(action: { id: string; actionKey: string; preview: unknown }) {
  if (action.actionKey === ATTENTION_REF) {
    const id = (action.preview as { outboundId?: string } | null)?.outboundId
    if (!id) return null
    return opsDb.outboundEmail.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        failureReason: true,
        mailboxId: true,
        threadId: true,
        inReplyToRfcId: true,
        referencesRfcIds: true,
        toAddresses: true,
        ccAddresses: true,
        subject: true,
        bodyHtml: true,
        bodyText: true,
        kind: true,
        fromAlias: true,
        enquiryId: true,
        companyId: true,
        contactId: true,
        subjectType: true,
        subjectId: true,
      },
    })
  }
  return latestOutbound(action.id)
}

async function bumpReview(): Promise<void> {
  const pending = await opsDb.assistantAction.count({
    where: { surface: 'review', state: { in: ['proposed', 'later'] } },
  })
  await setCounters({ 'review.pending': pending })
}

async function loadAction(actionId: string) {
  const a = await opsDb.assistantAction.findUnique({
    where: { id: actionId },
    select: { id: true, ref: true, actionKey: true, state: true, preview: true, basisHash: true },
  })
  if (!a) throw new DecisionError('not_found', 'This card is no longer here.')
  return a
}

/** Retry: a person's click only. A new outbound row, a new key; the action follows its outcome. */
export async function retrySend(
  input: { actionId: string },
  user: Decider
): Promise<{ outboundId: string; undoRemainingMs: number }> {
  const a = await loadAction(input.actionId)
  const failed = await sendFor(a)
  if (!failed || !['failed', 'unknown'].includes(failed.status))
    throw new DecisionError('not_open', 'There is no failed send to retry.')
  if (!failed.mailboxId)
    throw new DecisionError('invalid', 'The send has no mailbox; fix it in Settings.')
  if (user.role !== 'owner') {
    const box = await opsDb.mailbox.findUnique({
      where: { id: failed.mailboxId },
      select: { role: true },
    })
    if (box?.role !== 'supplier' || !user.canSendSupplierMail)
      throw new DecisionError('forbidden', 'Only the Owner can retry this send.')
  }
  if (a.state !== 'failed' && !(a.actionKey === ATTENTION_REF && a.state === 'proposed'))
    throw new DecisionError('not_open', 'This card is not waiting for a retry.')
  const n =
    (await opsDb.outboundEmail.count({
      where: { OR: [{ actionId: a.id }, { retryOfId: failed.id }] },
    })) + 1
  await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    if (a.state === 'failed') {
      await tx.assistantAction.update({
        where: { id: a.id },
        data: { state: 'running', failureReason: null },
      })
    } else {
      await tx.assistantAction.update({
        where: { id: a.id },
        data: {
          state: 'approved',
          decidedById: user.id,
          decidedAt: new Date(),
          chosenOption: 'retry',
        },
      })
    }
  })
  const scheduled = await scheduleSend({
    idempotencyKey: `${a.id}:retry:${n}`,
    kind: failed.kind,
    mailboxId: failed.mailboxId,
    to: failed.toAddresses,
    cc: failed.ccAddresses,
    subject: failed.subject,
    bodyHtml: failed.bodyHtml,
    bodyText: failed.bodyText,
    threadId: failed.threadId,
    inReplyToRfcId: failed.inReplyToRfcId,
    referencesRfcIds: failed.referencesRfcIds,
    fromAlias: failed.fromAlias,
    approvedById: user.id,
    createdById: user.id,
    retryOfId: failed.id,
    enquiryId: failed.enquiryId,
    companyId: failed.companyId,
    contactId: failed.contactId,
    subjectType: failed.subjectType,
    subjectId: failed.subjectId,
    // The original action owns the retry, so the send settles it; an attention card owns its own.
    actionId: a.id,
  })
  if (a.actionKey === ATTENTION_REF) {
    await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'user', id: user.id })
      await tx.assistantAction.updateMany({
        where: { id: a.id, state: 'approved' },
        data: { state: 'queued' },
      })
    })
  }
  await bumpReview()
  return { outboundId: scheduled.outboundId, undoRemainingMs: scheduled.undoRemainingMs }
}

/**
 * Mark as sent (Owner): the person sent it themselves, or found it in Gmail's Sent. The outbound row keeps its
 * status (a Gmail row is `sent` only with Gmail's message id, which reconcile or the sync fills when it finds
 * the message); the action records the person's word and leaves Review.
 */
export async function markSent(
  input: { actionId: string },
  user: Decider
): Promise<{ state: string }> {
  if (user.role !== 'owner')
    throw new DecisionError('forbidden', 'Only the Owner marks a send as sent.')
  const a = await loadAction(input.actionId)
  const o = await sendFor(a)
  if (!o || !['failed', 'unknown'].includes(o.status))
    throw new DecisionError('not_open', 'There is no failed send here.')
  await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'user', id: user.id })
    const now = new Date()
    if (a.state === 'proposed') {
      await tx.assistantAction.update({
        where: { id: a.id },
        data: {
          state: 'approved',
          decidedById: user.id,
          decidedAt: now,
          chosenOption: 'mark_sent',
        },
      })
    }
    if (a.state !== 'running')
      await tx.assistantAction.update({ where: { id: a.id }, data: { state: 'running' } })
    await tx.assistantAction.update({
      where: { id: a.id },
      data: {
        state: 'done',
        doneAt: now,
        failureReason: null,
        rejectReason: `Marked as sent by ${user.initials}`,
      },
    })
  })
  await bumpReview()
  return { state: 'done' }
}

/** Copy text: the email as written, for the person to send from Gmail themselves. The card stays. */
export async function copyText(input: {
  actionId: string
}): Promise<{ to: string[]; subject: string; body: string }> {
  const a = await loadAction(input.actionId)
  const o = await sendFor(a)
  if (!o) throw new DecisionError('not_found', 'There is no email on this card.')
  return {
    to: o.toAddresses,
    subject: o.subject,
    body: o.bodyText ?? o.bodyHtml.replace(/<[^>]+>/g, ''),
  }
}

function dubaiDayKey(now: Date): string {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '00'
  return `${g('year')}-${g('month')}-${g('day')}`
}

/**
 * A send with no action of its own ended failed or unknown: one attention card for it (idempotent by the
 * outbound id), so it waits in Review with Retry / Copy text / Mark as sent.
 */
export async function createOutboundAttention(
  outboundId: string,
  now = new Date()
): Promise<string | null> {
  const o = await opsDb.outboundEmail.findUnique({
    where: { id: outboundId },
    select: {
      id: true,
      status: true,
      actionId: true,
      failureReason: true,
      toAddresses: true,
      subject: true,
      mailboxId: true,
    },
  })
  if (!o || o.actionId || !['failed', 'unknown'].includes(o.status)) return null
  const key = `outbound_attention:outbound:${o.id}`
  const existing = await opsDb.assistantAction.findUnique({
    where: { idempotencyKey: key },
    select: { ref: true },
  })
  if (existing) return existing.ref
  const failure =
    o.status === 'unknown'
      ? "We can't tell whether this was sent. Check Sent in Gmail, then Resend or Mark as sent."
      : (o.failureReason ?? 'The send failed.')
  try {
    return await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'system' })
      const [num] = await tx.$queryRaw<Array<{ formatted: string }>>`
        SELECT formatted FROM ops.allocate_number('assistant_action', ${dubaiDayKey(now)})`
      if (!num) throw new Error('allocate_number returned no row')
      await tx.assistantAction.create({
        data: {
          ref: num.formatted,
          actionKey: ATTENTION_REF,
          levelAtTime: 'draft_and_ask',
          guardrails: [],
          subjectType: 'mailbox',
          subjectId: o.mailboxId,
          headline: `${o.status === 'unknown' ? 'Check' : 'Resend'}: ${o.subject || '(no subject)'} to ${o.toAddresses[0] ?? 'the recipient'}`,
          reasons: [{ text: failure }] as unknown as Prisma.InputJsonValue,
          preview: {
            outboundId: o.id,
            failure,
            actions:
              o.status === 'unknown'
                ? ['mark_sent', 'retry', 'copy']
                : ['retry', 'copy', 'mark_sent', 'fix_mailbox'],
          } as Prisma.InputJsonValue,
          checks: [] as unknown as Prisma.InputJsonValue,
          confidence: 'sure',
          state: 'proposed',
          surface: 'review',
          idempotencyKey: key,
          origin: 'live',
        },
      })
      return num.formatted
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return null
    throw e
  } finally {
    await bumpReview()
    await emitEvent({ name: 'ops/review.changed', data: { outboundId } })
  }
}
