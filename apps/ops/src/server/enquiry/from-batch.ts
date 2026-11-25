import 'server-only'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { uuid7 } from '../../lib/uuid7'
import { writeTracked } from '../assistant/write-tracked'
import { bumpIntake } from '../intake/live'
import { TX_OPTIONS } from '../../lib/tx-options'

/**
 * Staging → records (S08-T04 confirm, S08-T06 approve): the one path that writes an enquiry and its lines from an
 * intake. One transaction: the ENQ number is allocated inside it (`ops.allocate_number`, which skips any ref the
 * website admin already issued, C5), the enquiry and its lines are written with the spans they stand on, the batch
 * is confirmed, the thread is linked. Unsure candidates are NEVER written: they stay on the batch and the caller
 * turns each into a question card.
 */
type Tx = Prisma.TransactionClient

export interface FromBatchInput {
  batchId: string
  actor: { kind: 'user'; id: string } | { kind: 'assistant'; actionId: string }
  now?: Date
  title?: string | null
  clientId?: string | null
  contactId?: string | null
  clientRef?: string | null
  deadline?: Date | null
  receivedVia: $Enums.ReceivedVia
  receivedAt: Date
  terms?: {
    incoterm?: string | null
    place?: string | null
    payment?: string | null
    compliance?: string | null
  } | null
  /** The Assistant's path writes Sure and Likely lines still pending; a person's path writes only decided lines. */
  includePendingConfident?: boolean
}

export interface FromBatchResult {
  enquiryId: string
  ref: string
  lineCount: number
  /** Unsure candidates left on the batch: one question card each (S08-T06). */
  unsureIds: string[]
}

function dubaiYear(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(now)
}

export async function allocateEnquiryRef(tx: Tx, enquiryId: string, now: Date): Promise<string> {
  try {
    const [row] = await tx.$queryRaw<Array<{ formatted: string }>>`
      SELECT formatted FROM ops.allocate_number('enquiry', ${dubaiYear(now)}, 'enquiry'::ops."RecordType", ${enquiryId}::uuid)`
    if (!row) throw new Error('allocate_number returned no row')
    return row.formatted
  } catch (e) {
    if (/not seeded/i.test((e as Error).message))
      throw new SafeError(
        'Enquiry numbers are not seeded yet. The Owner seeds them in Settings › Numbering.'
      )
    throw e
  }
}

export async function createEnquiryFromBatch(tx: Tx, i: FromBatchInput): Promise<FromBatchResult> {
  const now = i.now ?? new Date()
  const b = await tx.intakeBatch.findUnique({
    where: { id: i.batchId },
    select: {
      id: true,
      status: true,
      version: true,
      clientRef: true,
      deadline: true,
      clientCompanyId: true,
      contactId: true,
      mailMessageId: true,
      mailMessage: { select: { subject: true, threadId: true } },
      candidates: {
        where: { decision: { notIn: ['removed', 'merged'] } },
        orderBy: { ord: 'asc' },
        select: {
          id: true,
          description: true,
          qty: true,
          uom: true,
          partNo: true,
          make: true,
          spec: true,
          certification: true,
          clientRef: true,
          confidence: true,
          decision: true,
          duplicateOfId: true,
          unsure: true,
          partId: true,
          partMatch: true,
          catalogueProductId: true,
          sourcePage: true,
          spanIds: true,
          fieldSpans: true,
          file: { select: { storedFileId: true, actionId: true, kind: true } },
        },
      },
    },
  })
  if (!b) throw new SafeError('That intake no longer exists.')
  if (b.status !== 'open') throw new SafeError('These lines are already confirmed.')
  // Claim the batch first: a second approval of the same intake waits here, then finds it confirmed.
  const claim = await tx.intakeBatch.updateMany({
    where: { id: b.id, status: 'open', version: b.version },
    data: { version: { increment: 1 } },
  })
  if (claim.count !== 1)
    throw new SafeError('Someone changed these lines a moment ago. The page shows the latest.')

  const writable = b.candidates.filter((c) =>
    c.decision === 'accepted' || c.decision === 'edited'
      ? true
      : !!i.includePendingConfident &&
        c.decision === 'pending' &&
        !c.duplicateOfId &&
        (c.confidence === 'sure' || c.confidence === 'likely')
  )
  const unsureIds = b.candidates
    .filter((c) => !writable.includes(c) && c.confidence === 'unsure' && !c.duplicateOfId)
    .map((c) => c.id)
  const missingQty = writable.find((c) => !c.qty)
  if (missingQty)
    throw new SafeError(`Line “${missingQty.description.slice(0, 60)}” has no quantity.`)
  if (!writable.length && !unsureIds.length)
    throw new SafeError('There are no lines to create an enquiry from.')

  const id = uuid7(now.getTime())
  const ref = await allocateEnquiryRef(tx, id, now)
  const first = writable[0]?.description ?? b.candidates[0]?.description ?? 'Enquiry'
  const title =
    (i.title ?? b.mailMessage?.subject ?? first)
      .replace(/^\s*(re|fwd?|fw)\s*:\s*/i, '')
      .slice(0, 200) || ref
  const actorUser = i.actor.kind === 'user' ? i.actor.id : null
  const actionId = i.actor.kind === 'assistant' ? i.actor.actionId : null

  await writeTracked(
    tx,
    {
      actor: i.actor.kind === 'user' ? { kind: 'user', id: i.actor.id } : { kind: 'assistant' },
      actionId,
      enquiryId: id,
      subjectType: 'enquiry',
      subjectId: id,
      changes: [
        { field: 'stage', before: null, after: 'new', kind: 'status' },
        { field: 'lines', before: 0, after: writable.length, kind: 'quantity' },
      ],
      note: `Created ${ref} from intake${unsureIds.length ? ` · ${unsureIds.length} line${unsureIds.length === 1 ? '' : 's'} to answer` : ''}`,
    },
    async (t) => {
      await t.enquiry.create({
        data: {
          id,
          ref,
          title,
          clientId: i.clientId ?? b.clientCompanyId,
          contactId: i.contactId ?? b.contactId,
          clientRef: i.clientRef ?? b.clientRef,
          receivedVia: i.receivedVia,
          receivedAt: i.receivedAt,
          deadline: i.deadline ?? b.deadline,
          requestedIncoterm: i.terms?.incoterm ?? null,
          deliveryPoint: i.terms?.place ?? null,
          requestedPayment: i.terms?.payment ?? null,
          complianceNote: i.terms?.compliance ?? null,
          ownerId: actorUser,
          origin: 'ops',
        },
      })
      if (writable.length)
        await t.enquiryLine.createMany({
          data: writable.map((c, n) => ({
            enquiryId: id,
            no: n + 1,
            clientPartNo: c.partNo,
            clientItemCode: c.clientRef,
            description: c.description,
            qty: c.qty!,
            uom: c.uom ?? 'EA',
            specNotes: c.spec,
            requestedMake: c.make,
            requiredCertification: c.certification,
            partId: c.partId,
            matchConfidence: c.partId ? (c.partMatch === 'fuzzy' ? 'likely' : 'sure') : null,
            catalogueProductId: c.catalogueProductId,
            sourceDocumentId: c.file?.kind === 'email' ? null : (c.file?.storedFileId ?? null),
            sourceMessageId: c.file?.kind === 'email' ? b.mailMessageId : null,
            sourcePage: c.sourcePage,
            sourceSpan: { spanIds: c.spanIds, fieldSpans: c.fieldSpans } as Prisma.InputJsonValue,
            extractionConfidence: c.confidence,
            extractedByActionId: c.file?.actionId ?? null,
          })),
        })
      await t.intakeBatch.update({
        where: { id: b.id },
        data: {
          status: 'confirmed',
          confirmedAt: now,
          confirmedById: actorUser,
          enquiryId: id,
          ...(i.clientId ? { clientCompanyId: i.clientId } : {}),
        },
      })
      if (b.mailMessageId)
        await t.mailLink.upsert({
          where: {
            messageId_subjectType_subjectId: {
              messageId: b.mailMessageId,
              subjectType: 'enquiry',
              subjectId: id,
            },
          },
          create: {
            messageId: b.mailMessageId,
            enquiryId: id,
            subjectType: 'enquiry',
            subjectId: id,
            linkedBy: actorUser ? 'user' : 'assistant',
            confidence: 'sure',
            actionId,
          },
          update: {},
        })
      if (b.mailMessage?.threadId)
        await t.mailThread.updateMany({
          where: { id: b.mailMessage.threadId, enquiryId: null },
          data: { enquiryId: id },
        })
    }
  )
  await bumpIntake(b.id, tx)
  return { enquiryId: id, ref, lineCount: writable.length, unsureIds }
}

/**
 * A person's confirm on board 15 (S08-T04): checks the review, then creates the enquiry as them. An idempotent action
 * already holds the instance's one connection, so it passes its own `withTx`; elsewhere a transaction is opened.
 */
export async function confirmIntakeAsPerson(
  p: { id: string },
  batchId: string,
  input: Omit<FromBatchInput, 'batchId' | 'actor' | 'receivedVia' | 'receivedAt'> & {
    receivedVia?: $Enums.ReceivedVia
    receivedAt?: Date
  },
  withTx: <R>(fn: (tx: Prisma.TransactionClient) => Promise<R>) => Promise<R> = (fn) =>
    opsDb.$transaction(fn, TX_OPTIONS)
): Promise<FromBatchResult> {
  const { assertConfirmable } = await import('../intake/review')
  return withTx(async (tx) => {
    await assertConfirmable(tx, batchId, { lines: !input.includePendingConfident })
    const b = await tx.intakeBatch.findUniqueOrThrow({
      where: { id: batchId },
      select: { source: true, createdAt: true, mailMessage: { select: { sentAt: true } } },
    })
    return createEnquiryFromBatch(tx, {
      ...input,
      batchId,
      actor: { kind: 'user', id: p.id },
      receivedVia:
        input.receivedVia ??
        (b.source === 'mail' ? 'email' : b.source === 'paste' ? 'manual' : 'file_upload'),
      receivedAt: input.receivedAt ?? b.mailMessage?.sentAt ?? b.createdAt,
    })
  })
}
