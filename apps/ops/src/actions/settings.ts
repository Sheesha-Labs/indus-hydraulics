'use server'

import { z } from 'zod'
import { defineAction } from '../lib/define-action'
import { SETTINGS, SETTING_KEYS, type SettingKey } from '../server/settings/registry'
import { markSignedOff } from '../server/settings/signoff'
import { updateSetting } from '../server/settings/update'

/**
 * The settings actions (S03-T04). Cross-cutting (Settings, the setup wizard, Today's first-run
 * card), so they live in src/actions, not under one segment.
 *
 * Both run outside defineAction's own transaction: the service opens one for the versioned UPDATE
 * and its activity_event row, and purges the cache tag only after it commits.
 */

const version = z.number().int().min(0)

/** One branch per key, so a bad value comes back as field errors keyed `value.<field>`. */
const updateSchema = z.discriminatedUnion(
  'key',
  SETTING_KEYS.map((key) =>
    z.object({ key: z.literal(key), value: SETTINGS[key].schema, expectedVersion: version })
  ) as unknown as [z.ZodObject, ...z.ZodObject[]]
)

const keySchema = z.enum(SETTING_KEYS as [SettingKey, ...SettingKey[]])

/**
 * Save one setting. Both roles may call it; an owner-only key refuses a Helper inside the service
 * (`can(user, 'change_settings')`), so the rule holds for every caller, not only this door.
 */
export const updateSettingAction = defineAction({
  name: 'settings.update',
  schema: updateSchema,
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const { key, value, expectedVersion } = input as {
      key: SettingKey
      value: unknown
      expectedVersion: number
    }
    const change = await updateSetting(key, value, expectedVersion, ctx.user)
    return { key: change.key, version: change.version }
  },
})

/** Confirm a seeded default (ADR-28). Owner only. */
export const markSignedOffAction = defineAction({
  name: 'settings.signoff',
  schema: z.object({ key: keySchema, expectedVersion: version.optional() }),
  roles: ['owner'],
  handler: async (input, ctx) => markSignedOff(input.key, ctx.user, input.expectedVersion),
})
