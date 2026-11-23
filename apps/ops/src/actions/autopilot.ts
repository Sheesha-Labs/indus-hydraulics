'use server'

import { autopilotModeSchema, type AutopilotMode, type Result } from '@indus/ops-core'
import { z } from 'zod'
import { defineAction } from '../lib/define-action'
import { applyAutopilotPreset, presetAudit, type PresetResult } from '../server/autopilot/presets'
import { revalidateSettings } from '../server/settings/update'

/**
 * Autopilot actions (S03-T06). Cross-cutting (Setup 5 now; Settings › Autopilot, board 98, in S07), so
 * they live in src/actions.
 */

const applyPreset = defineAction({
  name: 'autopilot.apply_preset',
  schema: z.object({
    mode: autopilotModeSchema,
    /** The `assistant.mode` version the person saw. */
    expectedVersion: z.number().int().min(0),
  }),
  roles: ['owner'],
  // A double click or a retry of the same change returns the first result instead of a conflict.
  idempotent: (input) => `preset:${input.mode}:${input.expectedVersion}`,
  handler: (input, ctx) =>
    ctx.withTx((tx) => applyAutopilotPreset(tx, input.mode, input.expectedVersion, ctx.user)),
  audit: (_input, out) => presetAudit(out),
})

/**
 * Apply Careful, Balanced or Hands-off (board 83): every configurable, unlocked Autopilot row, the
 * `assistant.mode` setting and one activity_event, in one transaction. Undo is the same call with the
 * previous mode and the returned version. The settings cache tag is purged after the commit.
 */
export async function applyAutopilotPresetAction(input: {
  mode: AutopilotMode
  expectedVersion: number
}): Promise<Result<PresetResult>> {
  const result = await applyPreset(input)
  if (result.success) revalidateSettings(['assistant.mode'])
  return result
}
