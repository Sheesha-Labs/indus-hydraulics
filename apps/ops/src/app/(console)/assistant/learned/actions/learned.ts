'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import {
  addPhrase,
  addRule,
  editPreference,
  pickToneSamples,
  removePreference,
  togglePreference,
} from '../../../../../server/assistant/preference-writes'

/**
 * Board 115 actions (S07-T05). Owner only, except phrases for purchase@ (the Helper, D19). Every text is linted
 * by the service; every change is audited against the preference.
 */
const PATH = '/assistant/learned'
const text = z.string().trim().min(3).max(200)
function done<T>(out: T): T {
  revalidatePath(PATH)
  return out
}
const audit = (field: string, note: string, id: string, before?: unknown, after?: unknown) => ({
  subjectType: 'settings' as const,
  subjectId: id,
  kind: 'settings' as const,
  field,
  ...(before !== undefined ? { before: before as never } : {}),
  ...(after !== undefined ? { after: after as never } : {}),
  note,
})

export const editPreferenceAction = defineAction({
  name: 'preferences.edit',
  schema: z.object({ id: z.uuid(), description: text }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await editPreference(ctx.tx!, input, ctx.user)),
  audit: (_i, out) =>
    audit('preference.description', 'Preference edited', out.id, out.before, out.after),
})

export const togglePreferenceAction = defineAction({
  name: 'preferences.toggle',
  schema: z.object({ id: z.uuid(), enabled: z.boolean() }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await togglePreference(ctx.tx!, input, ctx.user)),
  audit: (_i, out) =>
    audit(
      'preference.enabled',
      `Preference ${out.enabled ? 'switched on' : 'switched off'}: ${out.description}`,
      out.id,
      undefined,
      { enabled: out.enabled }
    ),
})

export const removePreferenceAction = defineAction({
  name: 'preferences.remove',
  schema: z.object({ id: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => done(await removePreference(ctx.tx!, input, ctx.user)),
  audit: (_i, out) =>
    audit('preference', `Preference removed: ${out.description}`, out.id, {
      description: out.description,
    }),
})

export const addRuleAction = defineAction({
  name: 'preferences.addRule',
  schema: z.object({
    description: text,
    scope: z.enum(['global', 'client', 'supplier']),
    companyId: z.uuid().nullable().optional(),
  }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await addRule(ctx.tx!, input, ctx.user)),
  audit: (_i, out) =>
    audit('preference', `Rule added: ${out.description}`, out.id, undefined, {
      description: out.description,
    }),
})

export const pickToneSamplesAction = defineAction({
  name: 'preferences.pickToneSamples',
  schema: z.object({ messageIds: z.array(z.uuid()).min(1).max(3) }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await pickToneSamples(ctx.tx!, input, ctx.user)),
  audit: (_i, out, ctx) =>
    audit('preference.tone_sample', 'Tone samples chosen', ctx.user.id, undefined, {
      messageIds: out.messageIds,
    }),
})

export const addPhraseAction = defineAction({
  name: 'preferences.addPhrase',
  schema: z.object({ phrase: text, kind: z.enum(['phrase_use', 'phrase_avoid']) }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => done(await addPhrase(ctx.tx!, input, ctx.user)),
  audit: (_i, out) =>
    audit(
      'preference.phrase',
      `Phrase added (${out.kind === 'phrase_use' ? 'use' : 'avoid'}): ${out.phrase}`,
      out.id,
      undefined,
      { phrase: out.phrase }
    ),
})
