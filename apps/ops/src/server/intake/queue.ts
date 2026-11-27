import 'server-only'
import { opsDb } from '@indus/ops-db'
import { emitEvent } from '../../inngest/emit'
import { SafeError } from '../../lib/safe-message'
import { bumpIntake } from './live'
import { CAPTURE_CANCELLED } from './upload'
import { TX_OPTIONS } from '../../lib/tx-options'

/**
 * Board 14's queue verbs (S08-T03). Cancel stops a file that is being read, Remove takes a queued one out, and a
 * file that needs attention is replaced by a new upload. Nothing here touches a candidate a person has decided.
 */
export async function createIntakeBatch(
  userId: string,
  source: 'upload' | 'paste' = 'upload',
  leadRef: string | null = null
): Promise<{ batchId: string }> {
  // From a lead: the intake belongs to it, so board 16 offers "Add to open lead" with its client.
  const lead = leadRef
    ? await opsDb.lead.findUnique({
        where: { ref: leadRef },
        select: { id: true, companyId: true, contactId: true, stage: true },
      })
    : null
  if (leadRef && (!lead || lead.stage === 'converted' || lead.stage === 'dropped'))
    throw new SafeError('That lead is not open any more.')
  const b = await opsDb.intakeBatch.create({
    data: {
      source,
      createdById: userId,
      ...(lead
        ? { leadId: lead.id, clientCompanyId: lead.companyId, contactId: lead.contactId }
        : {}),
    },
    select: { id: true },
  })
  return { batchId: b.id }
}

/**
 * Board 92 "New enquiry without an email": the client, the client's reference and the deadline a person types
 * beside an upload, a paste or typed lines. Kept on the batch; confirming writes them onto the enquiry.
 */
export async function setBatchFacts(
  userId: string,
  i: {
    batchId?: string | null | undefined
    source?: 'upload' | 'paste' | undefined
    clientCompanyId?: string | null | undefined
    clientRef?: string | null | undefined
    deadline?: string | null | undefined
  }
): Promise<{ batchId: string }> {
  const batchId = i.batchId ?? (await createIntakeBatch(userId, i.source ?? 'upload')).batchId
  const b = await opsDb.intakeBatch.findUnique({ where: { id: batchId }, select: { status: true } })
  if (!b) throw new SafeError('That intake no longer exists.')
  if (b.status !== 'open') throw new SafeError('That intake is already confirmed.')
  if (i.clientCompanyId) {
    const c = await opsDb.company.findUnique({
      where: { id: i.clientCompanyId },
      select: { id: true },
    })
    if (!c) throw new SafeError('Choose a client from the list.')
  }
  await opsDb.intakeBatch.update({
    where: { id: batchId },
    data: {
      ...(i.clientCompanyId !== undefined ? { clientCompanyId: i.clientCompanyId } : {}),
      ...(i.clientRef !== undefined ? { clientRef: i.clientRef?.trim() || null } : {}),
      ...(i.deadline !== undefined
        ? { deadline: i.deadline ? new Date(`${i.deadline}T14:00:00.000Z`) : null }
        : {}),
      version: { increment: 1 },
    },
  })
  await bumpIntake(batchId)
  return { batchId }
}

async function fileOf(fileId: string) {
  const f = await opsDb.intakeFile.findUnique({
    where: { id: fileId },
    select: { id: true, batchId: true, status: true, batch: { select: { status: true } } },
  })
  if (!f) throw new SafeError('That file is no longer in the queue.')
  if (f.batch.status !== 'open') throw new SafeError('That intake is already confirmed.')
  return f
}

export async function cancelExtraction(fileId: string): Promise<{ batchId: string }> {
  const f = await fileOf(fileId)
  if (f.status !== 'extracting' && f.status !== 'queued')
    throw new SafeError('That file is not being read any more.')
  await opsDb.$transaction(async (tx) => {
    await tx.intakeFile.update({
      where: { id: fileId },
      data: {
        status: 'cancelled',
        progressNote: 'Cancelled',
        failureKind: null,
        failureNote: null,
      },
    })
    await bumpIntake(f.batchId, tx)
  }, TX_OPTIONS)
  await emitEvent({ name: CAPTURE_CANCELLED, data: { intakeFileId: fileId } })
  return { batchId: f.batchId }
}

/** Takes a queued, cancelled or failed file out of the batch (with any lines it staged). */
export async function removeIntakeFile(fileId: string): Promise<{ batchId: string }> {
  const f = await fileOf(fileId)
  if (f.status === 'extracting') throw new SafeError('Cancel it first: it is being read.')
  await opsDb.$transaction(async (tx) => {
    await tx.intakeLineCandidate.deleteMany({ where: { fileId, decision: 'pending' } })
    await tx.intakeFile.update({
      where: { id: fileId },
      data: { status: 'removed', progressNote: 'Removed' },
    })
    await bumpIntake(f.batchId, tx)
  }, TX_OPTIONS)
  if (f.status === 'queued')
    await emitEvent({ name: CAPTURE_CANCELLED, data: { intakeFileId: fileId } })
  return { batchId: f.batchId }
}
