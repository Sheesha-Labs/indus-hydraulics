import 'server-only'
import { opsDb } from '@indus/ops-db'
import { emitEvent } from '../../inngest/emit'
import { SafeError } from '../../lib/safe-message'
import { bumpIntake } from './live'
import { CAPTURE_CANCELLED } from './upload'

/**
 * Board 14's queue verbs (S08-T03). Cancel stops a file that is being read, Remove takes a queued one out, and a
 * file that needs attention is replaced by a new upload. Nothing here touches a candidate a person has decided.
 */
export async function createIntakeBatch(
  userId: string,
  source: 'upload' | 'paste' = 'upload'
): Promise<{ batchId: string }> {
  const b = await opsDb.intakeBatch.create({
    data: { source, createdById: userId },
    select: { id: true },
  })
  return { batchId: b.id }
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
  })
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
  })
  if (f.status === 'queued')
    await emitEvent({ name: CAPTURE_CANCELLED, data: { intakeFileId: fileId } })
  return { batchId: f.batchId }
}
