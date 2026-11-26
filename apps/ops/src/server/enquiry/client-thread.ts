import 'server-only'
import { salutation } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'

/**
 * The client's side of an enquiry for an email to them (S09-T06/T07): the sales@ mailbox that holds their thread
 * (never purchase@), the message to reply to, the contact and the salutation. A regret, the questions and their
 * reminder all go from sales@ in the client's own thread; when only purchase@ holds it, a new message from sales@.
 */
export interface ClientThread {
  mailbox: { id: string; address: string } | null
  source: {
    threadId: string
    inSales: boolean
    rfcMessageId: string | null
    referencesRfcIds: string[]
    subject: string
    to: string
    quoted: string
    wrote: string
  } | null
  contact: {
    id: string
    name: string | null
    firstName: string | null
    email: string | null
    outOfOfficeUntil: Date | null
  } | null
  salutation: string
}

const DAY = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
})
const day = (d: Date) => DAY.format(d).replace('Sept', 'Sep')

export async function clientThread(enquiryId: string): Promise<ClientThread> {
  const e = await opsDb.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    select: {
      contactId: true,
      intakeBatches: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: {
          mailMessage: {
            select: {
              threadId: true,
              rfcMessageId: true,
              referencesRfcIds: true,
              subject: true,
              fromAddress: true,
              fromName: true,
              bodyText: true,
              sentAt: true,
              mailboxId: true,
              mailbox: { select: { role: true } },
            },
          },
        },
      },
    },
  })
  const m = e.intakeBatches[0]?.mailMessage ?? null
  const [mailbox, contact] = await Promise.all([
    m?.mailbox.role === 'client'
      ? opsDb.mailbox.findUnique({
          where: { id: m.mailboxId },
          select: { id: true, address: true },
        })
      : opsDb.mailbox.findFirst({
          where: { role: 'client', status: 'live' },
          orderBy: { createdAt: 'asc' },
          select: { id: true, address: true },
        }),
    e.contactId
      ? opsDb.contact.findUnique({
          where: { id: e.contactId },
          select: {
            id: true,
            salutation: true,
            firstName: true,
            name: true,
            email: true,
            outOfOfficeUntil: true,
          },
        })
      : null,
  ])
  const to = (contact?.email ?? m?.fromAddress ?? '').toLowerCase()
  return {
    mailbox,
    source: m
      ? {
          threadId: m.threadId,
          inSales: m.mailbox.role === 'client',
          rfcMessageId: m.rfcMessageId,
          referencesRfcIds: m.referencesRfcIds,
          subject: m.subject ?? '',
          to,
          quoted: (m.bodyText ?? '').replace(/\s+/g, ' ').trim().slice(0, 160),
          wrote: `On ${day(m.sentAt)}, ${m.fromName ?? m.fromAddress} wrote:`,
        }
      : null,
    contact: contact
      ? {
          id: contact.id,
          name: contact.name,
          firstName: contact.firstName,
          email: contact.email,
          outOfOfficeUntil: contact.outOfOfficeUntil,
        }
      : null,
    salutation: salutation(contact ?? (m ? { name: m.fromName } : null)),
  }
}

/** "Re: …" without stacked prefixes, for a template's {original_subject}. */
export function originalSubject(subject: string | null | undefined, fallback: string): string {
  return (subject || fallback).replace(/^\s*((re|fwd?|fw)\s*:\s*)+/i, '')
}

/** Paragraphs as the HTML part of an outbound email. */
export function paragraphsHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p>${p
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/\n/g, '<br>')}</p>`
    )
    .join('')
}
