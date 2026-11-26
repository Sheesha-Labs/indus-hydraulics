import 'server-only'
import { matchSentence, type CompanyMatch } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access'
import { SafeError } from '../../lib/safe-message'
import { TX_OPTIONS } from '../../lib/tx-options'
import { matchCompany } from '../directory/match-company'
import { announceEnquiryCreated, recordAckSkip } from '../enquiry/created'
import { confirmIntakeAsPerson } from '../enquiry/from-batch'
import { attachLinesToLead, createClientInline, createLeadFromBatch } from '../lead/create'
import { getSetting } from '../settings/get'
import { assertConfirmable, detectRevision, type RevisionHit } from './review'

/**
 * Board 16 · Step 3 of 3 · Match (S09-T04): where the reviewed lines go. The client comes from the sender and the
 * letterhead (several candidates are Unsure and wait for a person), an unknown sender becomes a client inline,
 * and the lines go to an open lead, a new lead, or straight to an enquiry when the document is a formal RFQ (a
 * deadline or client reference found, shown with its evidence). Applying is one transaction and idempotent on
 * the batch: a second click returns the first result.
 */

export type MatchOption = 'open_lead' | 'new_lead' | 'enquiry'

export interface MatchStep {
  batchId: string
  status: 'open' | 'confirmed' | 'cancelled'
  /** Already applied: where it went. */
  done: { href: string; label: string } | null
  sender: { email: string; name: string | null } | null
  issuer: { name: string; page: number | null } | null
  company:
    | { kind: 'sure'; companyId: string; name: string; contactId: string | null; sentence: string }
    | { kind: 'unsure'; candidates: Array<{ companyId: string; name: string; why: string }> }
    | { kind: 'none' }
  openLeads: Array<{ id: string; ref: string; title: string; stage: string; lines: number }>
  suggested: MatchOption
  /** "The document is a formal RFQ with a deadline (2 Oct found on page 1)". */
  enquiryEvidence: string | null
  summary: {
    lines: number
    merged: number
    categories: Array<{ name: string; count: number }> | null
    clientRef: string | null
  }
  revision: RevisionHit | null
  /** The lead this intake was started from ("Upload more files" on a lead). */
  fromLeadId: string | null
}

const DAY = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
})
const fmtDay = (d: Date) => DAY.format(d).replace('Sept', 'Sep')

interface Facts {
  closingDate?: { text?: string; quote?: string; page?: number | null }
  issuer?: { text?: string; quote?: string; page?: number | null }
}

export async function getMatchStep(batchId: string): Promise<MatchStep | null> {
  const b = await opsDb.intakeBatch.findUnique({
    where: { id: batchId },
    select: {
      id: true,
      status: true,
      clientRef: true,
      deadline: true,
      terms: true,
      leadId: true,
      clientCompanyId: true,
      contactId: true,
      clientCompany: { select: { id: true, name: true } },
      enquiry: { select: { ref: true } },
      mailMessage: { select: { fromAddress: true, fromName: true } },
      candidates: {
        select: { decision: true, part: { select: { trade: { select: { name: true } } } } },
      },
    },
  })
  if (!b) return null
  let done: MatchStep['done'] = null
  if (b.status === 'confirmed') {
    if (b.enquiry) done = { href: `/enquiries/${b.enquiry.ref}`, label: b.enquiry.ref }
    else if (b.leadId) {
      const l = await opsDb.lead.findUnique({ where: { id: b.leadId }, select: { ref: true } })
      if (l) done = { href: `/enquiries/leads/${l.ref}`, label: l.ref }
    }
  }
  const facts = (b.terms ?? {}) as Facts
  const issuer = facts.issuer?.text
    ? { name: facts.issuer.text, page: facts.issuer.page ?? null }
    : null
  const sender = b.mailMessage?.fromAddress
    ? { email: b.mailMessage.fromAddress, name: b.mailMessage.fromName }
    : null

  let company: MatchStep['company']
  if (b.clientCompany) {
    // A person already named the client (review facts, or the lead this intake came from).
    company = {
      kind: 'sure',
      companyId: b.clientCompany.id,
      name: b.clientCompany.name,
      contactId: b.contactId,
      sentence: 'Chosen on the intake',
    }
  } else {
    const m: CompanyMatch = await matchCompany({
      letterheadName: issuer?.name ?? null,
      senderEmail: sender?.email ?? null,
    })
    company =
      m.kind === 'sure'
        ? {
            kind: 'sure',
            companyId: m.companyId,
            name: m.companyName,
            contactId: m.contactId,
            sentence: matchSentence(m.basis, sender?.email ?? null),
          }
        : m.kind === 'unsure'
          ? {
              kind: 'unsure',
              candidates: m.candidates.map((c) => ({
                companyId: c.companyId,
                name: c.companyName,
                why: c.why,
              })),
            }
          : { kind: 'none' }
  }

  const openLeads =
    company.kind === 'sure'
      ? (
          await opsDb.lead.findMany({
            where: {
              companyId: company.companyId,
              stage: { in: ['new', 'contacted', 'qualified'] },
            },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: {
              id: true,
              ref: true,
              title: true,
              name: true,
              stage: true,
              _count: { select: { lines: true } },
            },
          })
        ).map((l) => ({
          id: l.id,
          ref: l.ref,
          title: l.title ?? l.name,
          stage: l.stage,
          lines: l._count.lines,
        }))
      : []

  const kept = b.candidates.filter((c) => c.decision === 'accepted' || c.decision === 'edited')
  const trades = new Map<string, number>()
  for (const c of kept) {
    const t = c.part?.trade?.name
    if (t) trades.set(t, (trades.get(t) ?? 0) + 1)
  }
  const closing = facts.closingDate
  const enquiryEvidence = b.deadline
    ? `The document is a formal RFQ with a deadline (${fmtDay(b.deadline)}${closing?.page ? ` found on page ${closing.page}` : closing?.quote ? ' found in the document' : ''})`
    : b.clientRef
      ? `The document carries the client's RFQ reference ${b.clientRef}`
      : null
  const fromLeadId = b.leadId && b.status === 'open' ? b.leadId : null
  return {
    batchId: b.id,
    status: b.status,
    done,
    sender,
    issuer,
    company,
    openLeads,
    suggested: enquiryEvidence
      ? 'enquiry'
      : fromLeadId || openLeads.length
        ? 'open_lead'
        : 'new_lead',
    enquiryEvidence,
    summary: {
      lines: kept.length,
      merged: b.candidates.filter((c) => c.decision === 'merged').length,
      categories: trades.size
        ? [...trades.entries()]
            .sort((a, z) => z[1] - a[1])
            .map(([name, count]) => ({ name, count }))
        : null,
      clientRef: b.clientRef,
    },
    revision: b.status === 'open' ? await detectRevision(batchId) : null,
    fromLeadId,
  }
}

export type ApplyMatchInput =
  | { option: 'enquiry'; companyId?: string; newClient?: string }
  | { option: 'new_lead'; companyId?: string; newClient?: string }
  | { option: 'open_lead'; leadId: string; companyId?: string; newClient?: string }

export interface ApplyMatchResult {
  href: string
  label: string
  kind: 'enquiry' | 'lead'
  /** Repeated click: the first result. */
  replayed: boolean
}

export async function applyMatch(
  batchId: string,
  input: ApplyMatchInput,
  user: Pick<OpsUser, 'id'>,
  withTx: <R>(fn: (tx: Prisma.TransactionClient) => Promise<R>) => Promise<R> = (fn) =>
    opsDb.$transaction(fn, TX_OPTIONS)
): Promise<ApplyMatchResult> {
  const { domains: freeMail } = await getSetting('qualify.free_mail_domains')
  let announce: Parameters<typeof announceEnquiryCreated>[0] | null = null
  const out = await withTx(async (tx): Promise<ApplyMatchResult> => {
    const b = await tx.intakeBatch.findUnique({
      where: { id: batchId },
      select: {
        status: true,
        leadId: true,
        clientCompanyId: true,
        contactId: true,
        enquiry: { select: { ref: true } },
        mailMessage: { select: { fromAddress: true, fromName: true } },
      },
    })
    if (!b) throw new SafeError('That intake no longer exists.')
    if (b.status === 'confirmed') {
      if (b.enquiry)
        return {
          href: `/enquiries/${b.enquiry.ref}`,
          label: b.enquiry.ref,
          kind: 'enquiry',
          replayed: true,
        }
      if (b.leadId) {
        const l = await tx.lead.findUniqueOrThrow({
          where: { id: b.leadId },
          select: { ref: true },
        })
        return { href: `/enquiries/leads/${l.ref}`, label: l.ref, kind: 'lead', replayed: true }
      }
    }
    await assertConfirmable(tx, batchId)

    // The client: chosen, created inline, or already on the batch.
    let companyId = input.companyId ?? b.clientCompanyId
    let contactId = b.contactId
    if (input.newClient) {
      const made = await createClientInline(
        tx,
        {
          name: input.newClient,
          senderEmail: b.mailMessage?.fromAddress ?? null,
          senderName: b.mailMessage?.fromName ?? null,
          freeMail,
        },
        user
      )
      companyId = made.companyId
      contactId = made.contactId
    }
    // Adding to an open lead: the lead's client, when none was chosen.
    if (!companyId && input.option === 'open_lead')
      companyId =
        (await tx.lead.findUnique({ where: { id: input.leadId }, select: { companyId: true } }))
          ?.companyId ?? null
    if (!companyId) throw new SafeError('Choose the client first.')
    if (companyId !== b.clientCompanyId) {
      const known = b.mailMessage?.fromAddress
        ? await tx.contact.findFirst({
            where: { companyId, email: { equals: b.mailMessage.fromAddress, mode: 'insensitive' } },
            select: { id: true },
          })
        : null
      contactId = known?.id ?? contactId ?? null
      await tx.intakeBatch.update({
        where: { id: batchId },
        data: { clientCompanyId: companyId, contactId },
      })
    }

    if (input.option === 'enquiry') {
      const made = await confirmIntakeAsPerson(
        user,
        batchId,
        { clientId: companyId, contactId },
        (fn) => fn(tx)
      )
      const skipped = await recordAckSkip(tx, {
        enquiryId: made.enquiryId,
        clientId: companyId,
        actorId: user.id,
      })
      announce = {
        enquiryId: made.enquiryId,
        ref: made.ref,
        ackSkipped: skipped,
        unsureIds: made.unsureIds,
        requestedById: user.id,
      }
      return { href: `/enquiries/${made.ref}`, label: made.ref, kind: 'enquiry', replayed: false }
    }
    if (input.option === 'new_lead') {
      const lead = await createLeadFromBatch(tx, batchId, { companyId, contactId }, user)
      return {
        href: `/enquiries/leads/${lead.ref}`,
        label: lead.ref,
        kind: 'lead',
        replayed: false,
      }
    }
    const lead = await attachLinesToLead(tx, batchId, input.leadId, user)
    return { href: `/enquiries/leads/${lead.ref}`, label: lead.ref, kind: 'lead', replayed: false }
  })
  if (announce) await announceEnquiryCreated(announce)
  return out
}
