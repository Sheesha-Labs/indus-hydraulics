'use server'

import { AUTOPILOT_LEVELS, autopilotModeSchema } from '@indus/ops-core'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { applyAutopilotPresetAction } from '../../../../../actions/autopilot'
import { defineAction } from '../../../../../lib/define-action'
import {
  acceptSuggestion,
  dismissSuggestion,
  levelAudit,
  rulesAudit,
  saveActionRules,
  setActionLevel,
} from '../../../../../server/autopilot/levels'
import { revalidateSettings } from '../../../../../server/settings/update'
import { settingSubjectId } from '../../../../../server/settings/subject-id'

/**
 * Board 98 / 99 actions (S07-T02). Levels, the mode and suggestions are the Owner's; rules too, except #13's,
 * which a Helper with "can edit chaser rules" may change. Every write is version-checked and audited, and the
 * mode label is recomputed in the same transaction.
 */
const PATH = '/assistant/autopilot'
const actionKey = z.string().regex(/^[a-z][a-z0-9_]{1,63}$/)

function done<T>(out: T): T {
  revalidatePath(PATH)
  revalidateSettings(['assistant.mode'])
  return out
}

export const setLevelAction = defineAction({
  name: 'autopilot.setLevel',
  schema: z.object({
    actionKey,
    level: z.enum(AUTOPILOT_LEVELS),
    version: z.number().int().min(0),
  }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await setActionLevel(ctx.tx!, input, ctx.user)),
  audit: (_input, out, ctx) => levelAudit(out, ctx.user.initials),
})

export const saveRulesAction = defineAction({
  name: 'autopilot.saveRules',
  schema: z.object({
    actionKey,
    rules: z.record(z.string(), z.unknown()),
    version: z.number().int().min(0),
  }),
  roles: ['owner', 'helper'],
  capability: 'edit_chaser_rules',
  handler: async (input, ctx) => done(await saveActionRules(ctx.tx!, input, ctx.user)),
  audit: (_input, out, ctx) => rulesAudit(out, ctx.user.initials),
})

export const acceptSuggestionAction = defineAction({
  name: 'autopilot.acceptSuggestion',
  schema: z.object({ id: z.uuid(), version: z.number().int().min(0) }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await acceptSuggestion(ctx.tx!, input, ctx.user)),
  audit: (_input, out, ctx) => levelAudit(out, ctx.user.initials),
})

export const dismissSuggestionAction = defineAction({
  name: 'autopilot.dismissSuggestion',
  schema: z.object({ id: z.uuid() }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await dismissSuggestion(ctx.tx!, input)),
  audit: (_input, out) => ({
    subjectType: 'settings',
    subjectId: settingSubjectId(`autopilot.${out.actionKey}`),
    kind: 'settings',
    field: `autopilot.${out.actionKey}.suggestion`,
    after: { dismissedUntil: out.until },
    note: 'Suggestion snoozed for 14 days',
  }),
})

/** Careful, Balanced or Hands-off for every unlocked row (the S03 preset service; Custom is never applied). */
export async function setModeAction(input: { mode: string; expectedVersion: number }) {
  const mode = autopilotModeSchema.safeParse(input.mode)
  if (!mode.success)
    return { success: false as const, error: 'Choose Careful, Balanced or Hands-off.' }
  const res = await applyAutopilotPresetAction({
    mode: mode.data,
    expectedVersion: input.expectedVersion,
  })
  if (res.success) revalidatePath(PATH)
  return res
}
