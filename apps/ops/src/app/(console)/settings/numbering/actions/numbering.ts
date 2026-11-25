'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import { seedEnquirySequence } from '../../../../../server/numbering/enquiry-seed'

/** Settings › Numbering (S08-T06): the Owner seeds the year's ENQ series above the website admin's block (C5). */
export const seedEnquiryAction = defineAction({
  name: 'numbering.enquiry.seed',
  schema: z.object({
    year: z.number().int().min(2024).max(2100),
    next: z.number().int().min(1).max(999_999),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await seedEnquirySequence(ctx.user, input.year, input.next)
    revalidatePath('/settings/numbering')
    return out
  },
  audit: (input, out: { ref: string }, ctx) => ({
    subjectType: 'settings',
    subjectId: ctx.user.id,
    kind: 'settings',
    field: 'numbering.enquiry',
    after: out.ref,
    note: `ENQ ${input.year} seeded at ${out.ref}`,
  }),
})
