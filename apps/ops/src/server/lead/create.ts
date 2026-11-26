import 'server-only'
import { domainOf, isFreeMail, partNoNorm } from '@indus/ops-core'
import type { $Enums, Prisma } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { uuid7 } from '../../lib/uuid7'
import { writeTracked } from '../assistant/write-tracked'
import { bumpIntake } from '../intake/live'

/**
 * Leads (S09-T04/T05): a company with a requirement and no formal RFQ yet. Every lead gets its L- number from
 * `ops.allocate_number('lead')` inside the creating transaction. Intake lines land as lead_line rows with the
 * document, page and spans they were read from; only lines a person accepted or edited are written.
 */
type Tx = Prisma.TransactionClient
export type Person = { id: string }

export async function allocateLeadRef(tx: Tx, leadId: string): Promise<string> {
  const [row] = await tx.$queryRaw<Array<{ formatted: string }>>`
    SELECT formatted FROM ops.allocate_number('lead', '', 'lead'::ops."RecordType", ${leadId}::uuid)`
  if (!row) throw new Error('allocate_number returned no row')
  return row.formatted
}

export interface NewLead {
  name: string
  companyId?: string | null | undefined
  companyName?: string | null | undefined
  contactId?: string | null | undefined
  email?: string | null | undefined
  phone?: string | null | undefined
  source: $Enums.LeadSource
  title?: string | null | undefined
  interest?: string | null | undefined
  estValue?: string | null | undefined
  estCurrency?: string | null | undefined
  nextAction?: string | null | undefined
  nextActionAt?: Date | null | undefined
  ownerId?: string | null | undefined
  clientRef?: string | null | undefined
  neededBy?: Date | null | undefined
  notes?: string | null | undefined
}

export async function createLead(
  tx: Tx,
  input: NewLead,
  by: Person
): Promise<{ id: string; ref: string }> {
  const id = uuid7()
  const ref = await allocateLeadRef(tx, id)
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: by.id },
      subjectType: 'lead',
      subjectId: id,
      changes: [{ field: 'stage', before: null, after: 'new', kind: 'status' }],
      note: `Created ${ref}`,
    },
    (t) =>
      t.lead.create({
        data: {
          id,
          ref,
          name: input.name,
          companyId: input.companyId ?? null,
          companyName: input.companyName ?? null,
          contactId: input.contactId ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          source: input.source,
          title: input.title ?? null,
          interest: input.interest ?? null,
          estValue: input.estValue ?? null,
          estCurrency: input.estCurrency ?? null,
          nextAction: input.nextAction ?? null,
          nextActionAt: input.nextActionAt ?? null,
          ownerId: input.ownerId ?? by.id,
          clientRef: input.clientRef ?? null,
          neededBy: input.neededBy ?? null,
          notes: input.notes ?? null,
        },
      })
  )
  return { id, ref }
}

/** The intake candidates a person accepted or edited, with what each line needs. */
async function confirmedCandidates(tx: Tx, batchId: string) {
  return tx.intakeLineCandidate.findMany({
    where: { batchId, decision: { in: ['accepted', 'edited'] } },
    orderBy: { ord: 'asc' },
    select: {
      id: true,
      description: true,
      qty: true,
      uom: true,
      partNo: true,
      spec: true,
      sourcePage: true,
      spanIds: true,
      part: { select: { tradeId: true } },
      file: { select: { storedFileId: true, kind: true } },
    },
  })
}

/** Claims an open batch for one outcome; a second caller finds it confirmed. */
async function claimBatch(tx: Tx, batchId: string): Promise<void> {
  const b = await tx.intakeBatch.findUniqueOrThrow({
    where: { id: batchId },
    select: { status: true, version: true },
  })
  if (b.status !== 'open') throw new SafeError('These lines are already confirmed.')
  const { count } = await tx.intakeBatch.updateMany({
    where: { id: batchId, status: 'open', version: b.version },
    data: { version: { increment: 1 } },
  })
  if (count !== 1)
    throw new SafeError('Someone changed these lines a moment ago. The page shows the latest.')
}

async function writeLeadLines(
  tx: Tx,
  leadId: string,
  batchId: string,
  by: Person
): Promise<number> {
  const lines = await confirmedCandidates(tx, batchId)
  if (!lines.length) throw new SafeError('There are no confirmed lines to add.')
  const last = await tx.leadLine.aggregate({ where: { leadId }, _max: { no: true } })
  const start = last._max.no ?? 0
  const now = new Date()
  await tx.leadLine.createMany({
    data: lines.map((c, i) => ({
      leadId,
      no: start + i + 1,
      description: c.description,
      partNo: c.partNo,
      partNoNorm: c.partNo ? partNoNorm(c.partNo) || null : null,
      qty: c.qty,
      uom: c.uom,
      specNotes: c.spec,
      tradeId: c.part?.tradeId ?? null,
      sourceDocumentId: c.file?.kind === 'email' ? null : (c.file?.storedFileId ?? null),
      sourcePage: c.sourcePage,
      spanIds: c.spanIds,
      confirmedById: by.id,
      confirmedAt: now,
    })),
  })
  return lines.length
}

export async function createLeadFromBatch(
  tx: Tx,
  batchId: string,
  i: { companyId: string; contactId?: string | null; title?: string | null },
  by: Person
): Promise<{ leadId: string; ref: string; lines: number }> {
  await claimBatch(tx, batchId)
  const [b, company] = [
    await tx.intakeBatch.findUniqueOrThrow({
      where: { id: batchId },
      select: {
        clientRef: true,
        deadline: true,
        mailMessage: { select: { subject: true, fromAddress: true } },
      },
    }),
    await tx.company.findUniqueOrThrow({ where: { id: i.companyId }, select: { name: true } }),
  ]
  const lead = await createLead(
    tx,
    {
      name: company.name,
      companyId: i.companyId,
      companyName: company.name,
      contactId: i.contactId ?? null,
      email: b.mailMessage?.fromAddress ?? null,
      source: b.mailMessage ? 'email' : 'manual',
      title: i.title ?? b.mailMessage?.subject?.replace(/^\s*(re|fwd?|fw)\s*:\s*/i, '') ?? null,
      clientRef: b.clientRef,
      neededBy: b.deadline,
    },
    by
  )
  const lines = await writeLeadLines(tx, lead.id, batchId, by)
  await tx.intakeBatch.update({
    where: { id: batchId },
    data: {
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedById: by.id,
      leadId: lead.id,
      clientCompanyId: i.companyId,
    },
  })
  await bumpIntake(batchId, tx)
  return { leadId: lead.id, ref: lead.ref, lines }
}

export async function attachLinesToLead(
  tx: Tx,
  batchId: string,
  leadId: string,
  by: Person
): Promise<{ leadId: string; ref: string; lines: number }> {
  const lead = await tx.lead.findUnique({
    where: { id: leadId },
    select: { ref: true, stage: true },
  })
  if (!lead) throw new SafeError('That lead no longer exists.')
  if (lead.stage === 'converted' || lead.stage === 'dropped')
    throw new SafeError(`${lead.ref} is ${lead.stage}: choose an open lead or create one.`)
  await claimBatch(tx, batchId)
  const lines = await writeLeadLines(tx, leadId, batchId, by)
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: by.id },
      subjectType: 'lead',
      subjectId: leadId,
      changes: [{ field: 'lines', before: null, after: lines, kind: 'quantity' }],
      note: `Added ${lines} line${lines === 1 ? '' : 's'} from intake`,
    },
    (t) =>
      t.intakeBatch.update({
        where: { id: batchId },
        data: { status: 'confirmed', confirmedAt: new Date(), confirmedById: by.id, leadId },
      })
  )
  await bumpIntake(batchId, tx)
  return { leadId, ref: lead.ref, lines }
}

/**
 * An unknown sender becomes a client inline (board 16 "Create client"): the company, its domain unless it is a
 * public webmail domain, and the sender as a contact (source: the email header).
 */
export async function createClientInline(
  tx: Tx,
  i: {
    name: string
    senderEmail?: string | null
    senderName?: string | null
    freeMail: readonly string[]
  },
  by: Person
): Promise<{ companyId: string; contactId: string | null }> {
  const name = i.name.trim()
  if (!name) throw new SafeError('Give the client a name.')
  const domain =
    i.senderEmail && !isFreeMail(i.senderEmail, i.freeMail) ? domainOf(i.senderEmail) : null
  const id = uuid7()
  let contactId: string | null = null
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: by.id },
      subjectType: 'company',
      subjectId: id,
      changes: [{ field: 'created', before: null, after: name, kind: 'contact' }],
      note: 'Client created from an intake',
    },
    async (t) => {
      await t.company.create({
        data: {
          id,
          name,
          isClient: true,
          source: i.senderEmail ? 'email' : 'manual',
          ...(domain ? { primaryDomain: domain, domains: [domain] } : {}),
        },
      })
      if (i.senderEmail) {
        const c = await t.contact.create({
          data: {
            companyId: id,
            email: i.senderEmail.toLowerCase(),
            name: i.senderName ?? null,
            sourceKind: 'email_header',
          },
          select: { id: true },
        })
        contactId = c.id
      }
    }
  )
  return { companyId: id, contactId }
}
