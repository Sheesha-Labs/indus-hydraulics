'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import { updateEnquiryFacts } from '../../../../../server/enquiry/facts'

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

/**
 * Board 05 · edit the header facts (S09-T03). Owner and Helper. Version-checked: a conflict comes back as data
 * (what changed, by whom) for the editor's Keep theirs / Keep mine, never as a silent overwrite.
 */
export const updateEnquiryFactsAction = defineAction({
  name: 'enquiry.facts.update',
  schema: z.object({
    enquiryId: z.uuid(),
    ref: z.string().regex(/^ENQ-\d{4}-\d{4,}$/),
    version: z.number().int().min(0),
    title: z.string().trim().min(1).max(200).optional(),
    clientRef: z.string().trim().max(120).nullable().optional(),
    deadline: day.nullable().optional(),
    decisionBy: day.nullable().optional(),
    ownerId: z.uuid().nullable().optional(),
  }),
  roles: ['owner', 'helper'],
  handler: async ({ ref, ...input }, ctx) => {
    const out = await ctx.withTx((tx) => updateEnquiryFacts(tx, input, ctx.user))
    if (out.kind === 'saved' && out.changed.length) {
      revalidatePath(`/enquiries/${ref}`, 'layout')
      revalidatePath('/enquiries')
    }
    return out
  },
})
