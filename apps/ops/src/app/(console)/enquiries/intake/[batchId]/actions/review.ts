'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../../lib/define-action'
import { SafeError } from '../../../../../../lib/safe-message'
import { requestActionQuietly } from '../../../../../../server/assistant/request'
import { confirmIntakeAsPerson } from '../../../../../../server/enquiry/from-batch'
import {
  acceptAllHigh,
  addManualLine,
  batchOfCandidate,
  confirmCandidate,
  detectRevision,
  mergeDuplicates,
  recordRevisionIntent,
  removeCandidate,
  requestOriginalTarget,
  resolveUnsure,
  updateCandidate,
} from '../../../../../../server/intake/review'

/**
 * Board 15 and board 17 actions (S08-T04). Owner and Helper. Every decision is the person's (activity "Decided by
 * KB/AB"); "Continue" creates the enquiry from the confirmed lines (idempotent per batch).
 */
const roles = ['owner', 'helper'] as const
const person = (u: { id: string; name: string }) => ({ id: u.id, name: u.name })
async function refresh<T>(out: T, batchId?: string): Promise<T> {
  if (batchId) revalidatePath(`/enquiries/intake/${batchId}`)
  revalidatePath('/enquiries/intake')
  return out
}
const batchOf = batchOfCandidate

export const updateCandidateAction = defineAction({
  name: 'intake.line.update',
  schema: z.object({
    id: z.uuid(),
    version: z.number().int().min(0),
    description: z.string().max(500).optional(),
    partNo: z.string().max(80).optional(),
    qty: z.string().max(40).optional(),
    uom: z.string().max(20).optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) =>
    refresh(await updateCandidate(person(ctx.user), input), await batchOf(input.id)),
})

export const confirmCandidateAction = defineAction({
  name: 'intake.line.confirm',
  schema: z.object({ id: z.uuid(), version: z.number().int().min(0) }),
  roles: [...roles],
  handler: async (input, ctx) =>
    refresh(
      await confirmCandidate(person(ctx.user), input.id, input.version),
      await batchOf(input.id)
    ),
})

export const acceptAllHighAction = defineAction({
  name: 'intake.lines.accept_high',
  schema: z.object({ batchId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    refresh(await acceptAllHigh(person(ctx.user), input.batchId), input.batchId),
})

export const resolveUnsureAction = defineAction({
  name: 'intake.line.resolve',
  schema: z.object({
    id: z.uuid(),
    version: z.number().int().min(0),
    value: z.string().min(1).max(200),
    via: z.enum(['option', 'typed', 'handwriting']),
    choice: z.enum(['printed', 'handwritten']).optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) =>
    refresh(await resolveUnsure(person(ctx.user), input), await batchOf(input.id)),
})

export const mergeDuplicatesAction = defineAction({
  name: 'intake.line.merge',
  schema: z.object({ id: z.uuid(), mode: z.enum(['keep', 'sum', 'both']) }),
  roles: [...roles],
  handler: async (input, ctx) =>
    refresh(await mergeDuplicates(person(ctx.user), input.id, input.mode), await batchOf(input.id)),
})

export const removeCandidateAction = defineAction({
  name: 'intake.line.remove',
  schema: z.object({ id: z.uuid(), version: z.number().int().min(0) }),
  roles: [...roles],
  handler: async (input, ctx) =>
    refresh(
      await removeCandidate(person(ctx.user), input.id, input.version),
      await batchOf(input.id)
    ),
})

export const addManualLineAction = defineAction({
  name: 'intake.line.add',
  schema: z.object({ batchId: z.uuid(), fileId: z.uuid().nullable().default(null) }),
  roles: [...roles],
  handler: async (input, ctx) =>
    refresh(await addManualLine(person(ctx.user), input.batchId, input.fileId), input.batchId),
})

export const revisionIntentAction = defineAction({
  name: 'intake.revision.intent',
  schema: z.object({ batchId: z.uuid(), intent: z.enum(['revision', 'new']) }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const hit = await detectRevision(input.batchId)
    return refresh(
      await recordRevisionIntent(person(ctx.user), input.batchId, input.intent, hit),
      input.batchId
    )
  },
})

/** Board 17 "Ask client for original": a Draft-and-ask reply in the client's thread (only for an intake from mail). */
export const requestOriginalAction = defineAction({
  name: 'intake.file.request_original',
  schema: z.object({ fileId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const f = await requestOriginalTarget(input.fileId)
    const queued = await requestActionQuietly({
      actionKey: 'request_original',
      subjectType: 'intake_file',
      subjectId: f.id,
      enquiryId: f.enquiryId,
      trigger: 'person',
      origin: 'live',
      sourceVersion: `${f.failureKind ?? 'unreadable'}`,
      requestedById: ctx.user.id,
    })
    if (!queued) throw new SafeError('The Assistant could not be reached. Try again in a minute.')
    return refresh({ queued: true }, f.batchId)
  },
})

export const confirmExtractionAction = defineAction({
  name: 'intake.confirm',
  schema: z.object({ batchId: z.uuid() }),
  roles: [...roles],
  idempotent: (input) => input.batchId,
  handler: async (input, ctx) => {
    const out = await confirmIntakeAsPerson(ctx.user, input.batchId, {}, ctx.withTx)
    revalidatePath('/enquiries')
    return refresh({ ref: out.ref, unsure: out.unsureIds.length }, input.batchId)
  },
})
