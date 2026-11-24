import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import type { StoredMailFlags } from '@indus/ops-core'
import { emitEventOrThrow } from '../../inngest/emit'
import { requestAction } from '../assistant/request'
import { setActor, writeTracked } from '../assistant/write-tracked'
import { findOurOutbound } from './our-outbound'

/**
 * Bounces (S05-T07, board 96 middle column). A delivery failure is matched to our sent email by the
 * X-Indus-Outbound header, else the original Message-ID, else the thread.
 *
 *   hard  the contact becomes 'bouncing' (bouncedAt), the outbound's deliveryStatus 'bounced' with the
 *         reason (its status stays 'sent': the send machine is forward-only), the board 89 banner shows it,
 *         and a resend_alternate_contact proposal asks a person (Resend to another address, or Fix contact)
 *   soft  a delay: ops.mail.bounce.soft waits 24 h and shows it only when nothing came back from that address
 *
 * Imported or backfilled bounces never cause anything: the class is the whole effect.
 */
export type BounceOutcome =
  | { kind: 'skipped'; why: 'origin' | 'not_bounce' | 'no_outbound' | 'missing' }
  | { kind: 'hard'; outboundId: string; contactId: string | null; requested: boolean }
  | { kind: 'soft'; outboundId: string | null }

export async function handleBounce(
  messageId: string,
  actionId: string | null,
  deps: { request?: typeof requestAction; emit?: typeof emitEventOrThrow } = {}
): Promise<BounceOutcome> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      origin: true,
      threadId: true,
      mailboxId: true,
      flags: true,
      headerFlags: true,
      inReplyToRfcId: true,
      referencesRfcIds: true,
      sentAt: true,
    },
  })
  if (!m) return { kind: 'skipped', why: 'missing' }
  if (m.origin !== 'live') return { kind: 'skipped', why: 'origin' }
  const b = ((m.flags as StoredMailFlags | null) ?? {}).bounce
  if (!b) return { kind: 'skipped', why: 'not_bounce' }
  const header = (m.headerFlags as { xIndusOutbound?: string } | null) ?? {}
  const recipient = b.finalRecipient?.toLowerCase() ?? null
  const outbound = await findOurOutbound({
    xIndusOutbound: b.xIndusOutbound ?? header.xIndusOutbound,
    rfcIds: [b.originalMessageId, m.inReplyToRfcId, ...m.referencesRfcIds.slice(-3)],
    threadId: m.threadId,
    recipient,
  })

  if (!b.hard) {
    await (deps.emit ?? emitEventOrThrow)({
      name: 'ops/mail.bounce.soft',
      id: `bounce-soft:${m.id}`,
      data: {
        messageId: m.id,
        outboundId: outbound?.id ?? null,
        recipient,
        at: m.sentAt.toISOString(),
      },
    })
    return { kind: 'soft', outboundId: outbound?.id ?? null }
  }
  if (!outbound) return { kind: 'skipped', why: 'no_outbound' }

  const address = recipient ?? outbound.to[0]?.toLowerCase() ?? null
  const reason = [b.status, b.diagnostic].filter(Boolean).join(' · ').slice(0, 300) || 'Bounced'
  const contactId = await opsDb.$transaction(async (tx: Prisma.TransactionClient) => {
    await setActor(tx, { kind: 'assistant' })
    const out = await tx.outboundEmail.findUniqueOrThrow({
      where: { id: outbound.id },
      select: { deliveryStatus: true, failureReason: true, contactId: true },
    })
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId,
        enquiryId: outbound.enquiryId,
        subjectType: 'mail_message',
        subjectId: m.id,
        changes: [
          {
            field: 'outbound.deliveryStatus',
            before: out.deliveryStatus,
            after: 'bounced',
            kind: 'status',
          },
        ],
        note: `Bounced: ${address ?? 'the recipient'}`,
      },
      (t) =>
        t.outboundEmail.update({
          where: { id: outbound.id },
          data: { deliveryStatus: 'bounced', failureReason: reason },
        })
    )
    const contact = await tx.contact.findFirst({
      where: {
        OR: [
          ...(out.contactId ? [{ id: out.contactId }] : []),
          ...(address ? [{ email: { equals: address, mode: 'insensitive' as const } }] : []),
        ],
        archivedAt: null,
      },
      select: { id: true, status: true, bouncedAt: true },
    })
    if (contact && address) {
      const now = new Date()
      await writeTracked(
        tx,
        {
          actor: { kind: 'assistant' },
          actionId,
          enquiryId: outbound.enquiryId,
          subjectType: 'contact',
          subjectId: contact.id,
          changes: [
            { field: 'status', before: contact.status, after: 'bouncing', kind: 'contact' },
            {
              field: 'bouncedAt',
              before: contact.bouncedAt?.toISOString() ?? null,
              after: now.toISOString(),
              kind: 'contact',
            },
          ],
          note: `Contact marked bad: ${address} bounced`,
        },
        (t) =>
          t.contact.update({
            where: { id: contact.id },
            data: { status: 'bouncing', bouncedAt: now },
          })
      )
    }
    return contact?.id ?? null
  })

  let requested = false
  if (outbound.mailboxId) {
    await (deps.request ?? requestAction)({
      actionKey: 'resend_alternate_contact',
      subjectType: 'mail_message',
      subjectId: m.id,
      enquiryId: outbound.enquiryId,
      trigger: 'mail.bounce',
      origin: 'live',
      sourceVersion: `bounce:${outbound.id}`,
      mailboxId: outbound.mailboxId,
    })
    requested = true
  }
  return { kind: 'hard', outboundId: outbound.id, contactId, requested }
}

/**
 * After 24 h: a soft bounce is shown (Needs you) only when that address has not written to us since, the
 * one evidence of delivery we have. Returns whether it was shown.
 */
export async function settleSoftBounce(data: {
  messageId: string
  recipient: string | null
  at: string
}): Promise<{ shown: boolean }> {
  const later = data.recipient
    ? await opsDb.mailMessage.count({
        where: {
          direction: 'inbound',
          fromAddress: { equals: data.recipient, mode: 'insensitive' },
          sentAt: { gt: new Date(data.at) },
        },
      })
    : 0
  if (later > 0) return { shown: false }
  await opsDb.$transaction(async (tx: Prisma.TransactionClient) => {
    await setActor(tx, { kind: 'assistant' })
    const m = await tx.mailMessage.findUnique({
      where: { id: data.messageId },
      select: { handledState: true, flags: true },
    })
    if (!m) return
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        subjectType: 'mail_message',
        subjectId: data.messageId,
        changes: [
          { field: 'handledState', before: m.handledState, after: 'needs_you', kind: 'status' },
        ],
        note: 'Still not delivered after a day',
      },
      (t) =>
        t.mailMessage.update({
          where: { id: data.messageId },
          data: {
            handledState: 'needs_you',
            flags: {
              ...((m.flags as Record<string, unknown> | null) ?? {}),
              softBounceShown: true,
            } as Prisma.InputJsonValue,
          },
        })
    )
  })
  return { shown: true }
}
