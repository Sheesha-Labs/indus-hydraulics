import 'server-only'
import { documentLabel, fillTemplate, requiredDocuments, type RequiredRow } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { countryWord } from './clients'

/**
 * The new-supplier wizard (S10-T04..T06, boards 50–52): one read of the draft supplier with its profile, contacts,
 * documents, the open document request and its email preview (the template filled with a placeholder link), and
 * who started it. Later steps (vetting, bank, line card) add their own reads in the step's page.
 */
export const WIZARD_STEPS = [
  ['company', 'Company'],
  ['documents', 'Documents'],
  ['vetting', 'Vetting'],
  ['bank', 'Bank'],
  ['line-card', 'Line card'],
  ['approve', 'Approve'],
] as const
export type WizardStep = (typeof WIZARD_STEPS)[number][0]

const DATE = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const day = (d: Date) => DATE.format(d).replace('Sept', 'Sep')
const LONG = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'long', year: 'numeric' })

export interface WizardContact {
  id: string
  role: string
  name: string | null
  email: string | null
  phone: string | null
}

export interface SupplierWizard {
  id: string
  name: string
  onboarding: string | null
  tier: string
  version: number
  facts: {
    legalName: string
    country: string
    countryWord: string
    address: string
    website: string
    registryNo: string
    taxId: string
    foundedYear: number | null
    staffCount: number | null
    introducedBy: string
    quoteCurrencies: string[]
    type: string
  }
  contacts: WizardContact[]
  documents: Array<RequiredRow & { number: string | null; issuer: string | null; note: string | null; hasFile: boolean; expires: string | null }>
  inCount: number
  of: number
  request: {
    id: string
    status: string
    to: string | null
    kinds: string[]
    expires: string
    remindersOn: boolean
    sentAt: string | null
    remindersSent: number
  } | null
  composer: { to: string | null; subject: string; body: string; missing: string[] } | null
  started: string
}

export async function getSupplierWizard(id: string): Promise<SupplierWizard | null> {
  const c = await opsDb.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      legalName: true,
      country: true,
      website: true,
      isSupplier: true,
      supplierProfile: true,
      contacts: {
        where: { archivedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true, role: true, name: true, email: true, phone: true, sourceKind: true, status: true },
      },
      complianceDocs: {
        orderBy: { createdAt: 'desc' },
        select: { kind: true, status: true, expiresAt: true, archivedAt: true, number: true, issuer: true, note: true, fileId: true },
      },
      lineCards: { where: { tradeId: { not: null }, status: { not: 'not_carried' } }, select: { id: true } },
    },
  })
  if (!c || !c.isSupplier || !c.supplierProfile) return null
  const p = c.supplierProfile
  const [request, tpl, proposer] = await Promise.all([
    opsDb.supplierDocumentRequest.findFirst({
      where: { supplierId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        contactId: true,
        requestedKinds: true,
        expiresAt: true,
        remindersOn: true,
        remindersSent: true,
        outboundId: true,
        createdAt: true,
      },
    }),
    opsDb.emailTemplate.findUnique({ where: { key: 'supplier_document_request' }, select: { subjectTemplate: true, bodyTemplate: true } }),
    p.proposedById ? opsDb.user.findUnique({ where: { id: p.proposedById }, select: { name: true } }) : null,
  ])
  const now = new Date()
  const req = requiredDocuments(c.complianceDocs, {
    hasTrades: c.lineCards.length > 0,
    today: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
  })
  const latest = (kind: string) => c.complianceDocs.find((d) => d.kind === kind && !d.archivedAt)
  const sales = c.contacts.find((k) => k.role === 'Sales' && k.email && k.sourceKind !== 'directory_only' && k.status === 'active')
  const outstanding = req.rows.filter((r) => !r.optional && !['received', 'signed', 'awaiting_signature'].includes(r.status))
  const sent = request?.outboundId
    ? await opsDb.outboundEmail.findUnique({ where: { id: request.outboundId }, select: { sentAt: true } })
    : null
  const composer = tpl
    ? (() => {
        const values = {
          salutation: sales?.name ? `Dear ${sales.name.split(/\s+/)[0]},` : 'Dear Sir or Madam,',
          supplier_name: c.name,
          document_list: outstanding.map((r) => `- ${r.label}`).join('\n'),
          upload_link: '⟨secure upload link⟩',
          expiry_date: LONG.format(new Date(now.getTime() + 14 * 86_400_000)),
        }
        const s = fillTemplate(tpl.subjectTemplate, values)
        const b = fillTemplate(tpl.bodyTemplate, values)
        return { to: sales?.email ?? null, subject: s.text, body: b.text, missing: [...s.missing, ...b.missing] }
      })()
    : null

  return {
    id: c.id,
    name: c.name,
    onboarding: p.onboardingStatus,
    tier: p.tier,
    version: p.version,
    facts: {
      legalName: c.legalName ?? c.name,
      country: c.country ?? '',
      countryWord: countryWord(c.country) ?? '',
      address: p.address ?? '',
      website: c.website ?? '',
      registryNo: p.registryNo ?? '',
      taxId: p.taxId ?? '',
      foundedYear: p.foundedYear,
      staffCount: p.staffCount,
      introducedBy: p.introducedBy ?? '',
      quoteCurrencies: p.quoteCurrencies,
      type: p.type,
    },
    contacts: c.contacts.map((k) => ({ id: k.id, role: k.role ?? '', name: k.name, email: k.email, phone: k.phone })),
    documents: req.rows.map((r) => {
      const d = latest(r.kind)
      return {
        ...r,
        number: d?.number ?? null,
        issuer: d?.issuer ?? null,
        note: d?.note ?? null,
        hasFile: !!d?.fileId,
        expires: r.expiresAt ? day(r.expiresAt) : null,
      }
    }),
    inCount: req.inCount,
    of: req.of,
    request: request
      ? {
          id: request.id,
          status: request.status === 'open' && request.expiresAt < now ? 'expired' : request.status,
          to: c.contacts.find((k) => k.id === request.contactId)?.email ?? sales?.email ?? null,
          kinds: request.requestedKinds.map(documentLabel),
          expires: day(request.expiresAt),
          remindersOn: request.remindersOn,
          sentAt: sent?.sentAt ? day(sent.sentAt) : null,
          remindersSent: request.remindersSent,
        }
      : null,
    composer,
    started: `Started ${day(p.proposedAt ?? now)}${proposer ? ` · ${proposer.name}` : ''}`,
  }
}
