'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import {
  cancelExtraction,
  createIntakeBatch,
  removeIntakeFile,
  setBatchFacts,
} from '../../../../../server/intake/queue'
import {
  confirmIntakeUpload,
  createUploadSlots,
  pasteIntakeText,
} from '../../../../../server/intake/upload'

/**
 * Board 14 actions (S08-T03). Owner and Helper. Files go straight from the browser to Storage on a signed URL;
 * these actions issue the URLs, record what arrived (after the magic-byte check) and work the queue.
 */
const roles = ['owner', 'helper'] as const
function refresh<T>(out: T): T {
  revalidatePath('/enquiries/new')
  revalidatePath('/enquiries/intake')
  return out
}

export const createIntakeBatchAction = defineAction({
  name: 'intake.batch.create',
  schema: z.object({ source: z.enum(['upload', 'paste']).default('upload') }),
  roles: [...roles],
  handler: async (input, ctx) => createIntakeBatch(ctx.user.id, input.source),
})

export const requestUploadSlotsAction = defineAction({
  name: 'intake.upload.slots',
  schema: z.object({
    batchId: z.uuid(),
    files: z
      .array(z.object({ name: z.string().min(1).max(200), size: z.number().int().min(0) }))
      .min(1)
      .max(25),
  }),
  roles: [...roles],
  handler: async (input) => createUploadSlots(input.batchId, input.files),
})

export const confirmUploadAction = defineAction({
  name: 'intake.upload.confirm',
  schema: z.object({
    batchId: z.uuid(),
    key: z.string().min(10).max(300),
    filename: z.string().min(1).max(200),
    replacesFileId: z.uuid().optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await confirmIntakeUpload({
      batchId: input.batchId,
      key: input.key,
      filename: input.filename,
      userId: ctx.user.id,
    })
    // Re-upload: the new file takes the place of the one that needed attention.
    if (input.replacesFileId) await removeIntakeFile(input.replacesFileId)
    return refresh(out)
  },
})

export const pasteEmailTextAction = defineAction({
  name: 'intake.paste',
  schema: z.object({ batchId: z.uuid(), text: z.string().min(1).max(200_000) }),
  roles: [...roles],
  handler: async (input, ctx) => refresh(await pasteIntakeText({ ...input, userId: ctx.user.id })),
})

export const cancelExtractionAction = defineAction({
  name: 'intake.file.cancel',
  schema: z.object({ fileId: z.uuid() }),
  roles: [...roles],
  handler: async (input) => refresh(await cancelExtraction(input.fileId)),
})

export const removeQueuedFileAction = defineAction({
  name: 'intake.file.remove',
  schema: z.object({ fileId: z.uuid() }),
  roles: [...roles],
  handler: async (input) => refresh(await removeIntakeFile(input.fileId)),
})

/** Board 92 manual: client, client reference and deadline beside an upload, a paste or typed lines. */
export const setBatchFactsAction = defineAction({
  name: 'intake.batch.facts',
  schema: z.object({
    batchId: z.uuid().nullable().optional(),
    source: z.enum(['upload', 'paste']).optional(),
    clientCompanyId: z.uuid().nullable().optional(),
    clientRef: z.string().max(80).nullable().optional(),
    deadline: z.iso.date().nullable().optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await setBatchFacts(ctx.user.id, input)
    revalidatePath('/enquiries/new')
    return out
  },
})
