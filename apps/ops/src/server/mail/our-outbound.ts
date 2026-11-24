import 'server-only'
import { opsDb } from '@indus/ops-db'

/**
 * Which of our sent emails an auto-reply or a bounce answers (S05-T07), strongest evidence first:
 *   1. the X-Indus-Outbound header we put on every send (the row id), returned in the bounce;
 *   2. the original Message-ID (a DSN's returned headers, or In-Reply-To / References);
 *   3. the latest sent email in the same thread to that address.
 */
export interface OurOutbound {
  id: string
  via: 'x_indus_outbound' | 'message_id' | 'thread'
  mailboxId: string | null
  threadId: string | null
  to: string[]
  subject: string
  bodyHtml: string
  bodyText: string | null
  rfcMessageId: string | null
  contactId: string | null
  companyId: string | null
  enquiryId: string | null
  subjectType: string | null
  subjectId: string | null
  status: string
  sentAt: Date | null
}

const SELECT = {
  id: true,
  mailboxId: true,
  threadId: true,
  toAddresses: true,
  subject: true,
  bodyHtml: true,
  bodyText: true,
  rfcMessageId: true,
  contactId: true,
  companyId: true,
  enquiryId: true,
  subjectType: true,
  subjectId: true,
  status: true,
  sentAt: true,
} as const

type Row = {
  id: string
  mailboxId: string | null
  threadId: string | null
  toAddresses: string[]
  subject: string
  bodyHtml: string
  bodyText: string | null
  rfcMessageId: string | null
  contactId: string | null
  companyId: string | null
  enquiryId: string | null
  subjectType: string | null
  subjectId: string | null
  status: string
  sentAt: Date | null
}

function shape(row: Row, via: OurOutbound['via']): OurOutbound {
  const { toAddresses, ...rest } = row
  return { ...rest, to: toAddresses, via }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function bareId(id: string): string {
  return id.trim().replace(/^<|>$/g, '')
}

export async function findOurOutbound(q: {
  xIndusOutbound?: string | null | undefined
  rfcIds?: Array<string | null | undefined>
  threadId?: string | null
  recipient?: string | null
}): Promise<OurOutbound | null> {
  const x = q.xIndusOutbound?.trim()
  if (x && UUID.test(x)) {
    const row = await opsDb.outboundEmail.findUnique({ where: { id: x }, select: SELECT })
    if (row) return shape(row, 'x_indus_outbound')
  }
  const ids = [
    ...new Set(
      (q.rfcIds ?? []).filter((v): v is string => !!v).flatMap((v) => [bareId(v), `<${bareId(v)}>`])
    ),
  ]
  if (ids.length) {
    const row = await opsDb.outboundEmail.findFirst({
      where: { rfcMessageId: { in: ids } },
      orderBy: { createdAt: 'desc' },
      select: SELECT,
    })
    if (row) return shape(row, 'message_id')
  }
  if (q.threadId && q.recipient) {
    const row = await opsDb.outboundEmail.findFirst({
      where: {
        threadId: q.threadId,
        status: 'sent',
        toAddresses: { has: q.recipient.toLowerCase() },
      },
      orderBy: { sentAt: 'desc' },
      select: SELECT,
    })
    if (row) return shape(row, 'thread')
  }
  return null
}
