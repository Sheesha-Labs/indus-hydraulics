import 'server-only'
import type { Prisma } from '@indus/ops-db'
import { emitEvent } from '../../inngest/emit'
// Registers every action module, so the requests below find their definitions in any caller.
import '../assistant/actions'
import { ackSkip } from '../assistant/actions/create-enquiry'
import { actionDefinition } from '../assistant/registry'
import { requestActionQuietly } from '../assistant/request'
import { writeTracked } from '../assistant/write-tracked'

/**
 * What follows a new enquiry made by a person (intake match "Create enquiry", lead convert; S09-T04/T05), the
 * same as the Assistant's #4: `ops/enquiry.created`, the acknowledgement (#6, unless the client asked for none:
 * logged with the reason), the quick read (qualify_enquiry, S09-T06) and one question card per Unsure line.
 *
 * `recordAckSkip` runs inside the creating transaction; `announceEnquiryCreated` after it commits.
 */

export async function recordAckSkip(
  tx: Prisma.TransactionClient,
  e: { enquiryId: string; clientId: string | null; actorId: string }
): Promise<boolean> {
  const skip = await ackSkip(tx, e.clientId)
  if (!skip) return false
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: e.actorId },
      enquiryId: e.enquiryId,
      subjectType: 'enquiry',
      subjectId: e.enquiryId,
      changes: [{ field: 'acknowledgement', before: null, after: 'skipped', kind: 'status' }],
      note: skip,
    },
    async () => undefined
  )
  return true
}

export async function announceEnquiryCreated(e: {
  enquiryId: string
  ref: string
  ackSkipped: boolean
  unsureIds?: readonly string[]
  requestedById?: string | null
}): Promise<void> {
  await emitEvent({
    name: 'ops/enquiry.created',
    id: `enquiry-created:${e.enquiryId}`,
    data: { enquiryId: e.enquiryId, ref: e.ref, actionId: null },
  })
  const base = {
    subjectType: 'enquiry' as const,
    subjectId: e.enquiryId,
    enquiryId: e.enquiryId,
    trigger: 'enquiry.created',
    origin: 'live' as const,
    ...(e.requestedById ? { requestedById: e.requestedById } : {}),
  }
  // The quick read runs once its action module is registered (S09-T06).
  if (actionDefinition('qualify_enquiry'))
    await requestActionQuietly({ ...base, actionKey: 'qualify_enquiry', sourceVersion: e.ref })
  if (!e.ackSkipped)
    await requestActionQuietly({ ...base, actionKey: 'ack_email', sourceVersion: e.ref })
  for (const id of e.unsureIds ?? [])
    await requestActionQuietly({
      ...base,
      actionKey: 'resolve_extracted_line',
      subjectType: 'enquiry',
      sourceVersion: id,
    })
}
