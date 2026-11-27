'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../../lib/define-action'
import { SafeError } from '../../../../../../lib/safe-message'
import { requestActionQuietly } from '../../../../../../server/assistant/request'
import '../../../../../../server/assistant/actions'
import { scopeVersion } from '../../../../../../server/enquiry/choose-path'
import {
  answerManually,
  applyFallbackNow,
  changeAssumptionNow,
  proceedWithAssumption,
  QuestionsError,
} from '../../../../../../server/enquiry/questions-actions'

/**
 * Board 171 · the Questions tab's own actions (S09-T07). Owner and Helper. A person's answer, an assumption, the
 * fallback chosen now, and "Add question" (which asks the Assistant to draft the questions for Review).
 */
const roles = ['owner', 'helper'] as const
const refSchema = z.string().regex(/^ENQ-\d{4}-\d{4,}$/)

function refusal(e: unknown): never {
  if (e instanceof QuestionsError) throw new SafeError(e.message)
  throw e
}

const refresh = (ref: string) => {
  revalidatePath(`/enquiries/${ref}`, 'layout')
  revalidatePath('/enquiries')
}

export const answerQuestionAction = defineAction({
  name: 'enquiry.question.answer',
  schema: z.object({
    questionId: z.uuid(),
    ref: refSchema,
    text: z.string().trim().min(1).max(2000),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) => answerManually(tx, input, ctx.user)).catch(refusal)
    refresh(input.ref)
    return out
  },
})

export const proceedWithAssumptionAction = defineAction({
  name: 'enquiry.question.assume',
  schema: z.object({ questionId: z.uuid(), ref: refSchema }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) => proceedWithAssumption(tx, input, ctx.user)).catch(refusal)
    refresh(input.ref)
    return out
  },
})

export const changeAssumptionAction = defineAction({
  name: 'enquiry.question.changeAssumption',
  schema: z.object({
    questionId: z.uuid(),
    ref: refSchema,
    text: z.string().trim().min(3).max(300),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) => changeAssumptionNow(tx, input, ctx.user)).catch(refusal)
    refresh(input.ref)
    return out
  },
})

export const applyFallbackAction = defineAction({
  name: 'enquiry.question.fallback',
  schema: z.object({
    enquiryId: z.uuid(),
    ref: refSchema,
    choice: z.enum(['assume', 'leave_out', 'wait']),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) => applyFallbackNow(tx, input, ctx.user)).catch(refusal)
    refresh(input.ref)
    return out
  },
})

/** "Add question": the lines to ask about and what to ask; the Assistant drafts the email for Review (#7). */
export const addQuestionAction = defineAction({
  name: 'enquiry.question.add',
  schema: z.object({
    enquiryId: z.uuid(),
    ref: refSchema,
    lineNos: z.array(z.number().int().min(1)).min(1).max(100),
    note: z.string().trim().max(400).optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const ok = await requestActionQuietly({
      actionKey: 'ask_client_questions',
      subjectType: 'enquiry',
      subjectId: input.enquiryId,
      enquiryId: input.enquiryId,
      trigger: 'person',
      origin: 'live',
      sourceVersion: scopeVersion('lines', input.lineNos, new Date()),
      requestedById: ctx.user.id,
      ...(input.note ? { hint: input.note } : {}),
    })
    if (!ok) throw new SafeError('The Assistant could not be reached. Try again in a moment.')
    refresh(input.ref)
    return { requested: true }
  },
})
