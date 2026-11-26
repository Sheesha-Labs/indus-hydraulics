'use server'

import { PIPELINE_GROUP_KEYS } from '@indus/ops-core'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../lib/define-action'
import { moveToGroup } from '../../../../server/enquiry/pipeline'

/**
 * Board 04 · move a card to another column (drag, or "Move to…" from the keyboard). Owner and Helper. The
 * machine decides; a refusal comes back as the error (the card snaps back with its reason). Won is never
 * moved here: the result says where the PO check is.
 */
export const moveEnquiryStageAction = defineAction({
  name: 'enquiry.stage.move',
  schema: z.object({
    enquiryId: z.uuid(),
    toGroup: z.enum(PIPELINE_GROUP_KEYS as unknown as [string, ...string[]]),
    version: z.number().int().min(0),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      moveToGroup(tx, { ...input, toGroup: input.toGroup as never }, ctx.user)
    )
    if (out.kind === 'moved') {
      revalidatePath('/enquiries')
      revalidatePath(`/enquiries/${out.ref}`)
    }
    return out
  },
})
