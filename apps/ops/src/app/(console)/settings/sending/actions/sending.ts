'use server'

import { CC_CHOICES, SENDING_RULE_ROWS, SENDING_ROLES } from '@indus/ops-core'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction, SafeError } from '../../../../../lib/define-action'
import {
  saveDailyCaps,
  saveSendingRuleRow,
  SendingRuleError,
  signatureFromLines,
} from '../../../../../server/mail-send/sending-rules'
import { getSetting } from '../../../../../server/settings/get'
import { settingSubjectId } from '../../../../../server/settings/subject-id'
import { updateSetting } from '../../../../../server/settings/update'

/**
 * Board 87 actions (S04-T07). Owner only; the Helper sees the page read-only. Rules and caps write through the
 * action's transaction with an activity_event; signatures and the send policy are settings rows, saved with
 * their version check by the settings service (which writes its own activity_event and purges the cache).
 */
const PATH = '/settings/sending'
/** Board 87's "Hold every external email for" choices (the plan allows 1–30). */
const HOLD_MINUTES: readonly number[] = [1, 2, 5, 10, 15, 30]
const rowKeys = SENDING_RULE_ROWS.map((r) => r.key) as [string, ...string[]]

function safe(error: unknown): never {
  if (error instanceof SendingRuleError) throw new SafeError(error.message)
  throw error
}

export const saveSendingRuleAction = defineAction({
  name: 'sending.saveRule',
  schema: z.object({
    row: z.enum(rowKeys),
    fromRole: z.enum(SENDING_ROLES),
    cc: z.enum(CC_CHOICES),
    signatureUserId: z.uuid().nullable(),
    threadMode: z.enum(['client_thread', 'rfq_thread', 'new_thread_per_recipient', 'new_thread']),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await saveSendingRuleRow(
      ctx.tx!,
      input.row,
      {
        fromRole: input.fromRole,
        cc: input.cc,
        signatureUserId: input.signatureUserId,
        threadMode: input.threadMode,
      },
      ctx.user.id
    ).catch(safe)
    revalidatePath(PATH)
    return { kinds: out.kinds, before: out.before }
  },
  audit: (input, out) =>
    out.kinds.map((kind) => ({
      subjectType: 'settings' as const,
      subjectId: settingSubjectId(`sending_rule.${kind}`),
      kind: 'settings' as const,
      field: `sending_rule.${kind}`,
      ...(out.before ? { before: out.before } : {}),
      after: {
        fromRole: input.fromRole,
        cc: input.cc,
        signatureUserId: input.signatureUserId,
        threadMode: input.threadMode,
      },
    })),
})

export const saveSignatureAction = defineAction({
  name: 'sending.saveSignature',
  schema: z.object({
    userId: z.uuid(),
    name: z.string().trim().min(1).max(120),
    lines: z.array(z.string().max(200)).min(1).max(12),
    expectedVersion: z.number().int().min(0),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const block = signatureFromLines(input.lines, input.name)
    if (!block.text.trim()) throw new SafeError('Write at least one line.')
    const current = await getSetting('send.signatures')
    const change = await updateSetting(
      'send.signatures',
      { ...current, [input.userId]: block },
      input.expectedVersion,
      ctx.user
    )
    revalidatePath(PATH)
    return { version: change.version }
  },
})

export const saveSendPolicyAction = defineAction({
  name: 'sending.savePolicy',
  schema: z.discriminatedUnion('part', [
    z.object({
      part: z.literal('hold'),
      minutes: z
        .number()
        .int()
        .refine((n) => HOLD_MINUTES.includes(n), 'Choose 1, 2, 5, 10, 15 or 30 minutes.'),
      expectedVersion: z.number().int().min(0),
    }),
    z.object({
      part: z.literal('window'),
      clientWindow: z.enum(['next_morning', 'immediately']),
      expectedVersion: z.number().int().min(0),
    }),
    z.object({
      part: z.literal('names'),
      quotation: z.string(),
      supplierRfq: z.string(),
      expectedVersion: z.number().int().min(0),
    }),
  ]),
  roles: ['owner'],
  handler: async (input, ctx) => {
    let version: number
    if (input.part === 'hold') {
      version = (
        await updateSetting(
          'undo',
          { sendWindowMinutes: input.minutes },
          input.expectedVersion,
          ctx.user
        )
      ).version
    } else if (input.part === 'window') {
      const timing = await getSetting('send.timing')
      version = (
        await updateSetting(
          'send.timing',
          { ...timing, clientWindow: input.clientWindow },
          input.expectedVersion,
          ctx.user
        )
      ).version
    } else {
      version = (
        await updateSetting(
          'send.attachment_names',
          { quotation: input.quotation, supplierRfq: input.supplierRfq },
          input.expectedVersion,
          ctx.user
        )
      ).version
    }
    revalidatePath(PATH)
    return { version }
  },
})

export const saveDailyCapsAction = defineAction({
  name: 'sending.saveCaps',
  schema: z.object({
    caps: z
      .array(z.object({ mailboxId: z.uuid(), cap: z.number().int().min(1).max(500) }))
      .min(1)
      .max(10),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await saveDailyCaps(ctx.tx!, input.caps).catch(safe)
    revalidatePath(PATH)
    revalidatePath('/settings/mailboxes')
    return out
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
