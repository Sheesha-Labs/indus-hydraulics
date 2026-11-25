'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../../../lib/define-action'
import { confirmIntakeAsPerson } from '../../../../../../../server/enquiry/from-batch'
import { startEmailIntake } from '../../../../../../../server/intake/email-body'

/**
 * Board 36 actions (S08-T05). Owner and Helper. Opens (or reopens) the intake for a message: the body is read by
 * extract_lines and each attachment is queued as its own file. "Edit as table" and "Continue to match" use the
 * review's own actions on the same batch.
 */
export const startEmailIntakeAction = defineAction({
  name: 'intake.email.start',
  schema: z.object({ messageId: z.uuid(), folder: z.string().min(1).max(40), threadId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await startEmailIntake(ctx.user, input.messageId)
    revalidatePath(`/mail/${input.folder}/${input.threadId}/read-lines`)
    revalidatePath('/enquiries/intake')
    return out
  },
})

/**
 * Board 36 "Continue to match": the enquiry is created from the lines as read — decided, Sure and Likely ones — and
 * each Unsure line stays a question (S08-T06's resolve_extracted_line card). Idempotent per batch.
 */
export const continueFromEmailAction = defineAction({
  name: 'intake.email.confirm',
  schema: z.object({ batchId: z.uuid() }),
  roles: ['owner', 'helper'],
  idempotent: (input) => input.batchId,
  handler: async (input, ctx) => {
    const out = await confirmIntakeAsPerson(
      ctx.user,
      input.batchId,
      { includePendingConfident: true },
      ctx.withTx
    )
    revalidatePath('/enquiries')
    revalidatePath('/enquiries/intake')
    return { ref: out.ref, unsure: out.unsureIds.length }
  },
})
