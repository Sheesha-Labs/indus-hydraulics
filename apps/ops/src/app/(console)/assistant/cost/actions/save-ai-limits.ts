'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import { BUDGET_MODES, saveAiLimits } from '../../../../../server/autopilot/ai-limits'
import { forgetGuardrails } from '../../../../../server/assistant/guardrail-context'
import { settingSubjectId } from '../../../../../server/settings/subject-id'
import { revalidateSettings } from '../../../../../server/settings/update'

/**
 * Board 101 · save the limits (S07-T04). Owner only; the two settings are version-checked and audited by the
 * settings service, and the current month's ai_budget row takes the new limit and mode in the same
 * transaction, so the reservation function enforces them on the next model call.
 */
export const saveAiLimitsAction = defineAction({
  name: 'aiLimits.save',
  schema: z.object({
    monthlyBudgetUsd: z.number().finite().positive().max(100_000),
    mode: z.enum(BUDGET_MODES),
    researchCapUsd: z.number().finite().positive().max(1_000),
    budgetVersion: z.number().int().min(0),
    researchVersion: z.number().int().min(0),
  }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => {
    const out = await saveAiLimits(ctx.tx!, input, ctx.user)
    forgetGuardrails()
    revalidateSettings(['assistant.budget', 'research.cap'])
    revalidatePath('/assistant/cost')
    revalidatePath('/', 'layout')
    return out
  },
  audit: (_input, out) => ({
    subjectType: 'settings',
    subjectId: settingSubjectId('ai_budget'),
    kind: 'settings',
    field: `ai_budget.${out.month}`,
    after: { limitUsd: out.limitUsd, mode: out.mode, researchCapUsd: out.researchCapUsd },
    note: `AI limits saved: USD ${out.limitUsd} a month, ${out.mode.replaceAll('_', ' ')}, research cap USD ${out.researchCapUsd}`,
  }),
})
