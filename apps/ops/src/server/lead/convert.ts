import 'server-only'
import type { $Enums, Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access'
import { SafeError } from '../../lib/safe-message'
import { uuid7 } from '../../lib/uuid7'
import { writeTracked } from '../assistant/write-tracked'
import { recordAckSkip } from '../enquiry/created'
import { allocateEnquiryRef } from '../enquiry/from-batch'
import { changeLeadStage } from '../enquiry/transition'

/**
 * Board 23 · Convert lead to enquiry (S09-T05), one transaction, idempotent on the lead: the ENQ number is
 * allocated; the enquiry carries the client, contact, client reference, deadline and owner; only the ticked
 * categories' lines are copied (with the document, page and spans they were read from); the lead's intake files
 * move to the enquiry; its notes become an activity entry; the lead is closed as Converted through the lead
 * machine. "Pre-allocate from line cards" is stored for S12, which drafts the RFQs for review.
 */
type Tx = Prisma.TransactionClient

export const UNCATEGORISED = 'uncategorised'

export interface ConvertInput {
  leadId: string
  clientRef?: string | null
  /** YYYY-MM-DD; stored at 14:00 GST like intake. */
  deadline?: string | null
  ownerId: string
  /** Trade ids to carry, and/or UNCATEGORISED. */
  categories: string[]
  preallocate: boolean
}

export interface ConvertResult {
  enquiryId: string
  ref: string
  lines: number
  /** Repeated: the enquiry the lead already became. */
  replayed: boolean
  ackSkipped: boolean
}

const VIA: Record<$Enums.LeadSource, $Enums.ReceivedVia> = {
  callback: 'callback',
  website: 'website_rfq',
  email: 'email',
  manual: 'manual',
  import: 'manual',
}

export async function convertLeadToEnquiry(
  tx: Tx,
  i: ConvertInput,
  user: Pick<OpsUser, 'id' | 'role'>,
  now = new Date()
): Promise<ConvertResult> {
  const lead = await tx.lead.findUnique({
    where: { id: i.leadId },
    select: {
      id: true,
      ref: true,
      stage: true,
      title: true,
      name: true,
      source: true,
      companyId: true,
      contactId: true,
      notes: true,
      convertedEnquiry: { select: { id: true, ref: true, _count: { select: { lines: true } } } },
      lines: { orderBy: { no: 'asc' } },
    },
  })
  if (!lead) throw new SafeError('That lead no longer exists.')
  if (lead.stage === 'converted' && lead.convertedEnquiry)
    return {
      enquiryId: lead.convertedEnquiry.id,
      ref: lead.convertedEnquiry.ref,
      lines: lead.convertedEnquiry._count.lines,
      replayed: true,
      ackSkipped: false,
    }
  if (lead.stage === 'dropped') throw new SafeError(`${lead.ref} was dropped. Revive it first.`)
  const owner = await tx.user.findFirst({
    where: { id: i.ownerId, status: 'active' },
    select: { id: true },
  })
  if (!owner) throw new SafeError('Choose an active team member as owner.')

  const chosen = lead.lines.filter((l) => i.categories.includes(l.tradeId ?? UNCATEGORISED))
  if (!chosen.length) throw new SafeError('Tick at least one category of lines to carry.')
  const missing = chosen.find((l) => !l.qty)
  if (missing) throw new SafeError(`Line ${missing.no} has no quantity. Fill it on the lead first.`)

  const id = uuid7(now.getTime())
  const { ref } = await allocateEnquiryRef(tx, id, now)
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      enquiryId: id,
      subjectType: 'enquiry',
      subjectId: id,
      changes: [
        { field: 'stage', before: null, after: 'new', kind: 'status' },
        { field: 'lines', before: 0, after: chosen.length, kind: 'quantity' },
      ],
      note: `Created ${ref} from lead ${lead.ref}`,
    },
    async (t) => {
      await t.enquiry.create({
        data: {
          id,
          ref,
          title: (lead.title ?? lead.name).slice(0, 200),
          clientId: lead.companyId,
          contactId: lead.contactId,
          clientRef: i.clientRef?.trim() || null,
          deadline: i.deadline ? new Date(`${i.deadline}T10:00:00.000Z`) : null,
          receivedVia: VIA[lead.source],
          receivedAt: now,
          ownerId: i.ownerId,
          preallocateRequested: i.preallocate,
          origin: 'ops',
        },
      })
      await t.enquiryLine.createMany({
        data: chosen.map((l, n) => ({
          enquiryId: id,
          no: n + 1,
          clientPartNo: l.partNo,
          description: l.description,
          qty: l.qty!,
          uom: l.uom ?? 'EA',
          specNotes: l.specNotes,
          sourceDocumentId: l.sourceDocumentId,
          sourcePage: l.sourcePage,
          sourceSpan: { spanIds: l.spanIds, fromLeadLine: l.id } as Prisma.InputJsonValue,
        })),
      })
      // The lead's files move with it: its intakes now belong to the enquiry too.
      await t.intakeBatch.updateMany({ where: { leadId: lead.id }, data: { enquiryId: id } })
      await t.document.updateMany({
        where: { subjectType: 'lead', subjectId: lead.id },
        data: { enquiryId: id },
      })
    }
  )
  if (lead.notes?.trim())
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: user.id },
        enquiryId: id,
        subjectType: 'enquiry',
        subjectId: id,
        changes: [{ field: 'notes', before: null, after: 'from lead', kind: 'other' }],
        note: `Lead notes: ${lead.notes.trim().slice(0, 1800)}`,
      },
      async () => undefined
    )
  await changeLeadStage(tx, {
    leadId: lead.id,
    to: 'converted',
    ctx: { convertedEnquiryId: id, actorRole: user.role },
    actor: { kind: 'user', id: user.id },
    data: { convertedEnquiryId: id },
    note: `Converted to ${ref}`,
  })
  const ackSkipped = await recordAckSkip(tx, {
    enquiryId: id,
    clientId: lead.companyId,
    actorId: user.id,
  })
  return { enquiryId: id, ref, lines: chosen.length, replayed: false, ackSkipped }
}

/** The next ENQ number the modal shows ("next free"): read only, nothing reserved. */
export async function nextEnquiryRefPreview(
  tx: Pick<Tx, '$queryRaw'>,
  now = new Date()
): Promise<string | null> {
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
    now
  )
  const rows = await tx.$queryRaw<Array<{ formatted: string }>>`
    SELECT ops.format_number(s.pattern, c."nextValue", ${year}, s."scopeKind", s."padTo") AS formatted
      FROM ops.number_sequence s JOIN ops.number_counter c ON c."sequenceKey" = s.key AND c.scope = ${year}
     WHERE s.key = 'enquiry' AND s."seededAt" IS NOT NULL`
  return rows[0]?.formatted ?? null
}
