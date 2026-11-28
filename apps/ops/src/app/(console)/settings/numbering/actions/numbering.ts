'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { emitEvent } from '../../../../../inngest/emit'
import { defineAction, SafeError } from '../../../../../lib/define-action'
import { seedEnquirySequence } from '../../../../../server/numbering/enquiry-seed'
import {
  NUMBERING_CHECK_REQUESTED,
  confirmRoundOneStyle,
  seedSequence,
  setPattern,
} from '../../../../../server/numbering/sequences'

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

/** Board 214 (S11-T08): seed a series with its evidence (never INDUS/Q: the cutover batch, S21). Owner only. */
export const seedSequenceAction = defineAction({
  name: 'numbering.seed',
  schema: z.object({
    key: z.string().min(1).max(40),
    next: z.number().int().min(1).max(2_000_000_000),
    evidence: z.record(z.string(), z.union([z.string().max(200), z.number(), z.null()])),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await seedSequence(input.key, input.next, input.evidence, ctx.user)
    revalidatePath('/settings/numbering')
    return out
  },
})

/** A pattern change: validated in ops-core; affects only future numbers. Owner only. */
export const setPatternAction = defineAction({
  name: 'numbering.pattern',
  schema: z.object({ key: z.string().min(1).max(40), pattern: z.string().min(1).max(40) }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    await setPattern(input.key, input.pattern.trim(), ctx.user)
    revalidatePath('/settings/numbering')
    return { ok: true }
  },
})

/** "Check now": the continuity run for one series, as a background job (Gmail reads stay out of the request). */
export const checkNowAction = defineAction({
  name: 'numbering.check',
  schema: z.object({ key: z.string().min(1).max(40) }),
  roles: ['owner', 'helper'],
  readOnlySafe: true,
  handler: async (input) => {
    const ok = await emitEvent({ name: NUMBERING_CHECK_REQUESTED, data: { key: input.key } })
    if (!ok) throw new SafeError('The check could not be started. Try again in a minute.')
    return { queued: true }
  },
})

/** C6: the Owner confirms the Round 1 numbering style of every series awaiting it. */
export const confirmNumberingStyleAction = defineAction({
  name: 'numbering.confirm_style',
  schema: z.object({}),
  roles: ['owner'],
  handler: async (_input, ctx) => {
    const out = await confirmRoundOneStyle(ctx.user)
    revalidatePath('/settings/numbering')
    return out
  },
})
