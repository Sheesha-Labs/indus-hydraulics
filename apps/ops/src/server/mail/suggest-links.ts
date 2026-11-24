import 'server-only'
import { opsDb, type $Enums } from '@indus/ops-db'
import { parseReference } from '@indus/ops-core'
import { loadMailInput } from './facts'
import { linkCandidates } from './link'

/**
 * Board 95 "Link to…" suggestions (S05-T06). Deterministic, no model: with an empty search, the link chain's
 * candidates (same thread, the other mailbox, a reply to our email, our reference, the sender's company and its
 * open records) with their reasons; with a search, one of our references resolved exactly, else companies by
 * name or domain and each one's open enquiries.
 */
export interface LinkSuggestion {
  key: string
  subjectType: 'enquiry' | 'supplier_rfq' | 'quotation' | 'order' | 'supplier_po' | 'company'
  subjectId: string
  enquiryId: string | null
  title: string
  detail: string
}

const OPEN_ENQUIRY: $Enums.EnquiryStage[] = [
  'new',
  'qualifying',
  'sourcing',
  'quotes_in',
  'pricing',
  'quoted',
  'negotiation',
]
const MAX = 8

const s = (
  subjectType: LinkSuggestion['subjectType'],
  subjectId: string,
  enquiryId: string | null,
  title: string,
  detail: string
): LinkSuggestion => ({
  key: `${subjectType}:${subjectId}`,
  subjectType,
  subjectId,
  enquiryId,
  title,
  detail,
})

async function byReference(q: string): Promise<LinkSuggestion[]> {
  const ref = parseReference(q)
  if (!ref || ref.match !== 'known_format') return []
  const c = ref.canonical
  switch (ref.kind) {
    case 'enquiry': {
      const e = await opsDb.enquiry.findUnique({
        where: { ref: c },
        select: { id: true, title: true, client: { select: { name: true } } },
      })
      return e
        ? [
            s(
              'enquiry',
              e.id,
              e.id,
              `${c} · ${e.client?.name ?? 'No client yet'} · ${e.title}`,
              'Reference typed'
            ),
          ]
        : []
    }
    case 'supplier_rfq': {
      const r = await opsDb.supplierRfq.findUnique({
        where: { ref: c },
        select: { id: true, enquiryId: true },
      })
      return r ? [s('supplier_rfq', r.id, r.enquiryId, c, 'Reference typed')] : []
    }
    case 'quotation': {
      const q2 = await opsDb.quotation.findFirst({
        where: { number: { in: [c, c.replace(/-R\d+$/, '')] } },
        orderBy: { revision: 'desc' },
        select: { id: true, enquiryId: true },
      })
      return q2 ? [s('quotation', q2.id, q2.enquiryId, c, 'Reference typed')] : []
    }
    case 'order': {
      const o = await opsDb.order.findUnique({
        where: { ref: c },
        select: { id: true, enquiryId: true },
      })
      return o ? [s('order', o.id, o.enquiryId, c, 'Reference typed')] : []
    }
    case 'supplier_po': {
      const p = await opsDb.supplierPo.findFirst({
        where: { number: { in: [c, c.replace(/-R\d+$/, '')] } },
        select: { id: true, order: { select: { enquiryId: true } } },
      })
      return p ? [s('supplier_po', p.id, p.order.enquiryId, c, 'Reference typed')] : []
    }
    default:
      return []
  }
}

async function byCompany(q: string): Promise<LinkSuggestion[]> {
  const term = q.trim().toLowerCase()
  if (term.length < 2) return []
  const companies = await opsDb.company.findMany({
    where: { OR: [{ name: { contains: term, mode: 'insensitive' } }, { domains: { has: term } }] },
    select: {
      id: true,
      name: true,
      isClient: true,
      isSupplier: true,
      enquiries: {
        where: { stage: { in: OPEN_ENQUIRY } },
        orderBy: { receivedAt: 'desc' },
        take: 3,
        select: { id: true, ref: true, title: true },
      },
    },
    take: 5,
  })
  return companies.flatMap((c) => [
    ...c.enquiries.map((e) =>
      s('enquiry', e.id, e.id, `${e.ref} · ${c.name} · ${e.title}`, 'Open enquiry of this client')
    ),
    s(
      'company',
      c.id,
      null,
      c.name,
      c.isClient && c.isSupplier
        ? 'Client and supplier'
        : c.isClient
          ? 'Client'
          : c.isSupplier
            ? 'Supplier'
            : 'Company'
    ),
  ])
}

export async function suggestLinks(messageId: string, q: string): Promise<LinkSuggestion[]> {
  const query = q.trim()
  if (query) {
    const exact = await byReference(query)
    if (exact.length) return exact
    return (await byCompany(query)).slice(0, MAX)
  }
  const mail = await loadMailInput(messageId)
  const chain = await linkCandidates(mail)
  const out: LinkSuggestion[] = chain
    .filter((c) =>
      ['enquiry', 'supplier_rfq', 'quotation', 'order', 'supplier_po'].includes(c.subjectType)
    )
    .map((c) =>
      s(c.subjectType as LinkSuggestion['subjectType'], c.subjectId, c.enquiryId, c.label, c.reason)
    )
  if (mail.sender.companyId && mail.sender.companyName) {
    out.push(
      s('company', mail.sender.companyId, null, mail.sender.companyName, 'Same sender’s company')
    )
  }
  return [...new Map(out.map((x) => [x.key, x])).values()].slice(0, MAX)
}
