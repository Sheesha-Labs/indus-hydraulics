import 'server-only'
import {
  canTransitionDocument,
  documentNumber,
  type DocKind,
  type DocumentData,
} from '@indus/ops-core'
import { opsDb, type $Enums } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { issueDocument, type DocumentActor, type Issued } from './issue'
import { RECORD_KIND } from './kinds'

/**
 * Cancel and reissue (S11-T04, 06-map-schema §9.8, C30). An issued document is never edited:
 *
 *   cancelDocument    approved | sent → cancelled, without a replacement. The file stays exactly as it was; the
 *                     screen shows a "Cancelled" overlay (a prop, never the file).
 *   reissueDocument   approved | sent → superseded, and a new document points at it (supersedesId) with the
 *                     next revision of the same number ("-R2"), rendered and stored as a new immutable file.
 *                     A tax invoice never revises: an approved one is replaced under a new number; a sent one
 *                     is never cancelled or reissued ("Issue a credit note instead").
 *
 * The old row's status is changed with a guard on its current status, inside the transaction that records the
 * new one, so two people reissuing at once cannot both succeed.
 */
const KIND_OF: Record<$Enums.DocumentKind, DocKind | undefined> = Object.fromEntries(
  Object.entries(RECORD_KIND).map(([k, v]) => [v, k as DocKind])
) as Record<$Enums.DocumentKind, DocKind | undefined>

async function load(documentId: string) {
  const d = await opsDb.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      kind: true,
      direction: true,
      number: true,
      revision: true,
      status: true,
      subjectType: true,
      subjectId: true,
      enquiryId: true,
      orderId: true,
      companyId: true,
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
        select: { dataSnapshot: true, templateId: true },
      },
    },
  })
  if (!d) throw new SafeError('That document is no longer here.')
  return d
}

export async function cancelDocument(
  documentId: string,
  note: string,
  actor: DocumentActor
): Promise<void> {
  const d = await load(documentId)
  const check = canTransitionDocument(d.status, 'cancelled', { kind: d.kind })
  if (!check.ok) throw new SafeError(check.reason)
  await opsDb.$transaction(async (tx) => {
    const moved = await tx.document.updateMany({
      where: { id: d.id, status: d.status },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledById: actor.kind === 'user' ? actor.id : null,
        reissueNote: note.trim() || null,
      },
    })
    if (moved.count !== 1)
      throw new SafeError('Someone changed this document a moment ago. Open it again.')
    await tx.activityEvent.create({
      data: {
        actorKind: actor.kind,
        actorId: actor.kind === 'user' ? actor.id : null,
        enquiryId: d.enquiryId,
        subjectType: 'document',
        subjectId: d.id,
        kind: 'documents',
        field: 'status',
        before: { status: d.status },
        after: { status: 'cancelled' },
        note: note.trim() || 'Cancelled',
      },
    })
  })
}

export async function reissueDocument(i: {
  documentId: string
  reason: $Enums.ReissueReason
  note?: string | null
  /** The corrected data; the last version's snapshot when absent (a re-render with the current letterhead). */
  data?: DocumentData
  /** A tax invoice is replaced under a new number, allocated by the caller. */
  newNumber?: string
  actor: DocumentActor
}): Promise<Issued> {
  const d = await load(i.documentId)
  const kind = KIND_OF[d.kind]
  if (d.direction !== 'produced' || !kind || !d.number)
    throw new SafeError('Only a document Indus issued can be reissued.')
  const check = canTransitionDocument(d.status, 'superseded', {
    kind: d.kind,
    reissueReason: i.reason,
  })
  if (!check.ok) throw new SafeError(check.reason)

  const isInvoice = d.kind === 'tax_invoice'
  if (isInvoice && !i.newNumber)
    throw new SafeError('A tax invoice is replaced under a new number.')
  const number = isInvoice ? i.newNumber! : d.number
  const revision = isInvoice ? 1 : d.revision + 1

  const base = i.data ?? (d.versions[0]?.dataSnapshot as unknown as DocumentData | undefined)
  if (!base) throw new SafeError('There is nothing to reissue from.')
  // The new revision is printed: "-R2" on the Estimate's number, and on the house number.
  const data: DocumentData =
    base.layout === 'estimate'
      ? { ...base, no: number, ...(isInvoice ? {} : { revision: `R${revision}` }) }
      : { ...base, no: isInvoice ? number : documentNumber(number, `R${revision}`) }

  return issueDocument(
    {
      kind,
      data,
      number,
      revision,
      subjectType: d.subjectType ?? 'document',
      subjectId: d.subjectId ?? d.id,
      enquiryId: d.enquiryId,
      orderId: d.orderId,
      companyId: d.companyId,
      templateId: d.versions[0]?.templateId ?? null,
      actor: i.actor,
    },
    {
      supersedesId: d.id,
      reissueReason: i.reason,
      reissueNote: i.note?.trim() || null,
      inTransaction: async (tx) => {
        const moved = await tx.document.updateMany({
          where: { id: d.id, status: d.status },
          data: {
            status: 'superseded',
            reissueReason: i.reason,
            reissueNote: i.note?.trim() || null,
          },
        })
        if (moved.count !== 1)
          throw new SafeError('Someone changed this document a moment ago. Open it again.')
      },
    }
  )
}
