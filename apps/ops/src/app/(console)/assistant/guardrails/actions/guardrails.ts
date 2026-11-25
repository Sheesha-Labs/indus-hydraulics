'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction, SafeError } from '../../../../../lib/define-action'
import { saveDailyCaps, SendingRuleError } from '../../../../../server/mail-send/sending-rules'
import {
  deleteHoliday,
  forgetGuardrails,
  guardrailAudit,
  HOLIDAY_KINDS,
  saveGuardrail,
  saveHoliday,
} from '../../../../../server/autopilot/guardrails'
import { settingSubjectId } from '../../../../../server/settings/subject-id'

/**
 * Board 100 actions (S07-T03). Owner only, version-checked, audited; a saved value is signed off. The fixed
 * rules are refused by the service. The caps reuse S04's service (one source of truth for board 87 and 100,
 * decision D4). The resolver reads the change on its next call (its cache is cleared here).
 */
const PATH = '/assistant/guardrails'
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

function done<T>(out: T): T {
  forgetGuardrails()
  revalidatePath(PATH)
  return out
}

export const saveGuardrailAction = defineAction({
  name: 'guardrails.save',
  schema: z.object({
    key: z.string().regex(/^[a-z][a-z0-9_]{1,63}$/),
    enabled: z.boolean(),
    params: z.record(z.string(), z.unknown()),
    version: z.number().int().min(0),
  }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await saveGuardrail(ctx.tx!, input, ctx.user)),
  audit: (_input, out, ctx) => guardrailAudit(out, ctx.user.initials),
})

export const saveHolidayAction = defineAction({
  name: 'holidays.save',
  schema: z.object({
    id: z.uuid().optional(),
    country: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .default('AE'),
    date: isoDate,
    to: isoDate.optional(),
    name: z.string().trim().min(1).max(120),
    kind: z.enum(HOLIDAY_KINDS),
    hoursStart: hhmm.nullable().optional(),
    hoursEnd: hhmm.nullable().optional(),
  }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await saveHoliday(ctx.tx!, input, ctx.user)),
  audit: (input, out) => ({
    subjectType: 'settings',
    subjectId: settingSubjectId('holiday.AE'),
    kind: 'settings',
    field: 'holiday',
    after: { dates: out.dates, name: input.name, kind: input.kind },
    note: `${input.id ? 'Holiday changed' : 'Holiday added'}: ${input.name}`,
  }),
})

export const deleteHolidayAction = defineAction({
  name: 'holidays.delete',
  schema: z.object({ id: z.uuid() }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => done(await deleteHoliday(ctx.tx!, input, ctx.user)),
  audit: (_input, out) => ({
    subjectType: 'settings',
    subjectId: settingSubjectId('holiday.AE'),
    kind: 'settings',
    field: 'holiday',
    before: { date: out.date, name: out.name },
    note: `Holiday removed: ${out.name}`,
  }),
})

export const saveCapsAction = defineAction({
  name: 'guardrails.saveCaps',
  schema: z.object({
    caps: z
      .array(z.object({ mailboxId: z.uuid(), cap: z.number().int().min(1).max(500) }))
      .min(1)
      .max(10),
  }),
  roles: ['owner'],
  capability: 'change_settings',
  handler: async (input, ctx) => {
    const out = await saveDailyCaps(ctx.tx!, input.caps).catch((e: unknown) => {
      if (e instanceof SendingRuleError) throw new SafeError(e.message)
      throw e
    })
    revalidatePath('/settings/sending')
    revalidatePath('/settings/mailboxes')
    return done(out)
  },
  audit: (_input, out) =>
    out.map((c) => ({
      subjectType: 'mailbox' as const,
      subjectId: c.mailboxId,
      kind: 'settings' as const,
      field: 'dailySendCap',
      before: c.before,
      after: c.after,
    })),
})
