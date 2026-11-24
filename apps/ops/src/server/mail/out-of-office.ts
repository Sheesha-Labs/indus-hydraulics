import 'server-only'
import { opsDb } from '@indus/ops-db'
import { splitQuoted, type StoredMailFlags } from '@indus/ops-core'
import { findOurOutbound } from './our-outbound'

/**
 * Out of office (S05-T07, board 96): what action `ooo_facts` reads. An auto-reply is never a reply and never
 * a regret; its only effects are the contact's away date and, when it names a stand-in and answers one of our
 * emails, a Draft-and-ask proposal to resend that email to the stand-in.
 */
export interface OooInput {
  messageId: string
  threadId: string
  mailboxId: string
  fromAddress: string
  fromName: string | null
  subject: string
  /** The auto-reply's own words (above any quoted part), capped. */
  body: string
  /** YYYY-MM-DD in Dubai. */
  today: string
  contact: { id: string; name: string | null } | null
  outbound: { id: string; to: string[]; subject: string } | null
  detectorReturnText: string | null
  detectorAlternateText: string | null
}

export const OOO_BODY_MAX = 3_000

export function dubaiToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export async function loadOooInput(messageId: string, now = new Date()): Promise<OooInput> {
  const m = await opsDb.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      id: true,
      threadId: true,
      mailboxId: true,
      fromAddress: true,
      fromName: true,
      subject: true,
      bodyText: true,
      flags: true,
      headerFlags: true,
      inReplyToRfcId: true,
      referencesRfcIds: true,
    },
  })
  const from = m.fromAddress.toLowerCase()
  const flags = (m.flags as StoredMailFlags | null) ?? {}
  const header = (m.headerFlags as { xIndusOutbound?: string } | null) ?? {}
  const [contact, outbound] = await Promise.all([
    opsDb.contact.findFirst({
      where: { email: { equals: from, mode: 'insensitive' }, archivedAt: null },
      select: { id: true, name: true },
    }),
    findOurOutbound({
      xIndusOutbound: header.xIndusOutbound,
      rfcIds: [m.inReplyToRfcId, ...m.referencesRfcIds.slice(-3)],
      threadId: m.threadId,
      recipient: from,
    }),
  ])
  return {
    messageId: m.id,
    threadId: m.threadId,
    mailboxId: m.mailboxId,
    fromAddress: from,
    fromName: m.fromName,
    subject: m.subject ?? '',
    body: splitQuoted(m.bodyText ?? '').fresh.slice(0, OOO_BODY_MAX),
    today: dubaiToday(now),
    contact,
    outbound: outbound ? { id: outbound.id, to: outbound.to, subject: outbound.subject } : null,
    detectorReturnText: flags.autoReply?.returnDateText ?? null,
    detectorAlternateText: flags.autoReply?.alternateContactText ?? null,
  }
}
