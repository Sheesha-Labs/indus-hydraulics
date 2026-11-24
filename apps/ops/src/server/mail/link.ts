import 'server-only'
import { opsDb, type $Enums } from '@indus/ops-db'
import type { LinkCandidate } from '@indus/ops-core'
import type { MailInput } from './facts'

/**
 * The deterministic link chain (S05-T04, action #2). Each step returns candidates with the reason; decideLink
 * (ops-core) turns them into a verdict. Precision over recall: never a link on subject words alone.
 *
 *   (a) thread         another message in the same thread is already linked → the same records
 *   (b) cross_mailbox  a message in the OTHER mailbox shares a Message-ID / References with this one and is
 *                      linked (a client's mail forwarded to the supplier side, or the reverse)
 *   (c) reply_to_outbound  In-Reply-To / References match one of our sent emails → its record
 *   (d) reference      our own reference in the message (IH-RFQ, ENQ, INDUS/Q, SO, INDUS/PO) → that record
 *   (e) sender_domain  the sender's company → its open records (client: enquiries; supplier: RFQs it got)
 */
const OPEN_ENQUIRY: $Enums.EnquiryStage[] = [
  'new',
  'qualifying',
  'sourcing',
  'quotes_in',
  'pricing',
  'quoted',
  'negotiation',
]
const OPEN_RFQ: $Enums.RfqStatus[] = ['sent', 'scheduled', 'awaiting_approval']
const DOMAIN_LIMIT = 4

const key = (subjectType: string, subjectId: string) => `${subjectType}:${subjectId}`

function cand(
  step: LinkCandidate['step'],
  subjectType: string,
  subjectId: string,
  enquiryId: string | null,
  label: string,
  reason: string
): LinkCandidate {
  return {
    key: key(subjectType, subjectId),
    subjectType,
    subjectId,
    enquiryId,
    label,
    step,
    reason,
  }
}

/** (a) + (b): records already linked to messages of this conversation. */
async function conversationLinks(input: MailInput): Promise<LinkCandidate[]> {
  const ids = [input.rfcMessageId, input.inReplyTo, ...input.references].filter(
    (x): x is string => !!x
  )
  const links = await opsDb.mailLink.findMany({
    where: {
      removedAt: null,
      subjectType: { not: 'company' },
      messageId: { not: input.messageId },
      message: {
        OR: [
          { threadId: input.threadId },
          ...(ids.length
            ? [
                { mailboxId: { not: input.mailboxId }, rfcMessageId: { in: ids } },
                ...(input.rfcMessageId
                  ? [
                      {
                        mailboxId: { not: input.mailboxId },
                        referencesRfcIds: { has: input.rfcMessageId },
                      },
                    ]
                  : []),
              ]
            : []),
        ],
      },
    },
    select: {
      subjectType: true,
      subjectId: true,
      enquiryId: true,
      message: { select: { threadId: true } },
    },
    take: 50,
  })
  return links.map((l) =>
    l.message.threadId === input.threadId
      ? cand(
          'thread',
          l.subjectType,
          l.subjectId,
          l.enquiryId,
          `${l.subjectType} in this thread`,
          'Earlier mail in this thread is linked to it'
        )
      : cand(
          'cross_mailbox',
          l.subjectType,
          l.subjectId,
          l.enquiryId,
          `${l.subjectType} in the other mailbox`,
          'The same conversation is linked in the other mailbox'
        )
  )
}

/** (c): a reply to one of our sent emails. */
async function outboundReplies(input: MailInput): Promise<LinkCandidate[]> {
  const ids = [input.inReplyTo, ...input.references].filter((x): x is string => !!x)
  if (!ids.length) return []
  const rows = await opsDb.outboundEmail.findMany({
    where: {
      subjectType: { not: null },
      subjectId: { not: null },
      OR: [{ rfcMessageId: { in: ids } }, { proposedRfcMessageId: { in: ids } }],
    },
    select: { subjectType: true, subjectId: true, enquiryId: true, subject: true },
    take: 20,
  })
  return rows.map((r) =>
    cand(
      'reply_to_outbound',
      r.subjectType!,
      r.subjectId!,
      r.enquiryId,
      r.subject ?? 'Our email',
      'A reply to an email we sent about it'
    )
  )
}

/** (d): our reference in the message, resolved to an existing record. */
async function byReference(input: MailInput): Promise<LinkCandidate[]> {
  const m = input.facts.reference.match
  if (!m) return []
  const why = `Our reference ${m.canonical} is in the ${m.source === 'subject' ? 'subject' : m.source === 'quoted' ? 'quoted text' : 'message'}`
  switch (m.kind) {
    case 'supplier_rfq': {
      const r = await opsDb.supplierRfq.findUnique({
        where: { ref: m.canonical },
        select: { id: true, enquiryId: true },
      })
      return r ? [cand('reference', 'supplier_rfq', r.id, r.enquiryId, m.canonical, why)] : []
    }
    case 'enquiry': {
      const r = await opsDb.enquiry.findUnique({
        where: { ref: m.canonical },
        select: { id: true, title: true },
      })
      return r ? [cand('reference', 'enquiry', r.id, r.id, `${m.canonical} · ${r.title}`, why)] : []
    }
    case 'quotation': {
      const base = m.canonical.replace(/-R\d+$/, '')
      const r = await opsDb.quotation.findFirst({
        where: { number: { in: [m.canonical, base] } },
        orderBy: { revision: 'desc' },
        select: { id: true, enquiryId: true },
      })
      return r ? [cand('reference', 'quotation', r.id, r.enquiryId, m.canonical, why)] : []
    }
    case 'order': {
      const r = await opsDb.order.findUnique({
        where: { ref: m.canonical },
        select: { id: true, enquiryId: true },
      })
      return r ? [cand('reference', 'order', r.id, r.enquiryId, m.canonical, why)] : []
    }
    case 'supplier_po': {
      const base = m.canonical.replace(/-R\d+$/, '')
      const r = await opsDb.supplierPo.findFirst({
        where: { number: { in: [m.canonical, base] } },
        select: { id: true, order: { select: { enquiryId: true } } },
      })
      return r ? [cand('reference', 'supplier_po', r.id, r.order.enquiryId, m.canonical, why)] : []
    }
    default:
      return []
  }
}

/** (e): the sender's company and its open records. */
async function bySenderDomain(input: MailInput): Promise<LinkCandidate[]> {
  const companyId = input.sender.companyId
  if (!companyId) return []
  const out: LinkCandidate[] = []
  if (input.sender.role === 'client' || input.sender.role === 'both') {
    const enquiries = await opsDb.enquiry.findMany({
      where: { clientId: companyId, stage: { in: OPEN_ENQUIRY } },
      orderBy: { receivedAt: 'desc' },
      select: { id: true, ref: true, title: true },
      take: DOMAIN_LIMIT,
    })
    for (const e of enquiries) {
      out.push(
        cand(
          'sender_domain',
          'enquiry',
          e.id,
          e.id,
          `${e.ref} · ${e.title}`,
          'An open enquiry of the sender’s company'
        )
      )
    }
  }
  if (input.sender.role === 'supplier' || input.sender.role === 'both') {
    const rfqs = await opsDb.supplierRfq.findMany({
      where: { status: { in: OPEN_RFQ }, recipients: { some: { supplierId: companyId } } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, ref: true, enquiryId: true },
      take: DOMAIN_LIMIT,
    })
    for (const r of rfqs) {
      out.push(
        cand(
          'sender_domain',
          'supplier_rfq',
          r.id,
          r.enquiryId,
          r.ref,
          'An open RFQ sent to the sender’s company'
        )
      )
    }
  }
  return out
}

/** Every candidate, in chain order. Steps (a)–(d) run first; (e) only when they found nothing. */
export async function linkCandidates(input: MailInput): Promise<LinkCandidate[]> {
  const [conversation, outbound, reference] = await Promise.all([
    conversationLinks(input),
    outboundReplies(input),
    byReference(input),
  ])
  const strong = [...conversation, ...outbound, ...reference]
  if (strong.length) return strong
  return bySenderDomain(input)
}
