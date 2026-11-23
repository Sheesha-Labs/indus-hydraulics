'use server'

import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { CompanyImageSlot } from '../lib/company-profile'
import { defineAction } from '../lib/define-action'
import { SETUP_STEPS, type SetupStep } from '../lib/route-params'
import { nextStep, SETUP_STEP_META } from '../lib/setup-steps'
import { saveCompanyAssets, saveCompanyProfile } from '../server/setup/company'
import { saveMoneySetting } from '../server/setup/money'
import { markStep, markWelcomeSeen } from '../server/setup/progress'
import { SETTINGS } from '../server/settings/registry'
import { createUpload, verifyUploadedObject } from '../server/storage/uploads'

/**
 * First-run setup actions (S03-T05, boards 78 and 79). Owner only: the steps change owner-only
 * settings, and the Helper is sent to Today from every setup page. Cross-cutting (Welcome, the setup
 * frame, Today's banner), so they live in src/actions.
 */

const version = z.number().int().min(0)

// ── Welcome ────────────────────────────────────────────────────────────────────────────────

const welcomeSeen = defineAction({
  name: 'setup.welcome_seen',
  schema: z.object({}),
  roles: ['owner'],
  readOnlySafe: true,
  handler: async (_input, ctx) => {
    await markWelcomeSeen(ctx.user.id)
    return null
  },
})

/** "Start setup" (board 78): remember the welcome was seen, then open step 1. */
export async function startSetup(): Promise<void> {
  await welcomeSeen({})
  redirect('/setup/company')
}

// ── Steps the wizard skips for now ───────────────────────────────────────────────────────────

const stepSchema = z.enum(SETUP_STEPS)

const skipStep = defineAction({
  name: 'setup.skip_step',
  schema: z.object({ step: stepSchema }),
  roles: ['owner'],
  handler: async ({ step }, ctx) => {
    // Only steps a later sprint builds can be skipped from the wizard (2 and 3 in S03).
    if (SETUP_STEP_META[step].build === 'later') await markStep(step, 'skipped', ctx.user.id)
    return null
  },
})

const completeStep = defineAction({
  name: 'setup.complete_step',
  schema: z.object({ step: z.enum(['money', 'assistant']) }),
  roles: ['owner'],
  handler: async ({ step }, ctx) => {
    await markStep(step, 'done', ctx.user.id)
    return null
  },
})

/**
 * Next on Setup 4 and Setup 5 (S03-T06): moving on with the values shown is accepting them, so the step
 * is done even if nothing was changed (a change already marked it done). Then open the next step.
 */
export async function completeAndContinue(step: 'money' | 'assistant'): Promise<void> {
  const parsed = z.enum(['money', 'assistant']).safeParse(step)
  if (!parsed.success) redirect('/today')
  await completeStep({ step: parsed.data })
  redirect(parsed.data === 'money' ? '/setup/assistant' : '/setup/invite')
}

/** Next on "Available in a later update — skip for now": record the skip, open the next step. */
export async function skipAndContinue(step: SetupStep): Promise<void> {
  const parsed = stepSchema.safeParse(step)
  if (!parsed.success) redirect('/today')
  await skipStep({ step: parsed.data })
  const next = nextStep(parsed.data)
  redirect((next ? `/setup/${next}` : '/today') as Route)
}

// ── Setup 4 · Money defaults ─────────────────────────────────────────────────────────────────

const moneySchema = z.discriminatedUnion('key', [
  z.object({
    key: z.literal('currency'),
    value: SETTINGS.currency.schema,
    expectedVersion: version,
  }),
  z.object({ key: z.literal('vat'), value: SETTINGS.vat.schema, expectedVersion: version }),
  z.object({
    key: z.literal('pricing.defaults'),
    value: SETTINGS['pricing.defaults'].schema,
    expectedVersion: version,
  }),
])

/**
 * Autosave of one Setup 4 setting (debounced 800 ms in the client): version-checked through the
 * settings service, and checklist 'money' done in the same transaction (first save).
 */
export const saveMoneySettingAction = defineAction({
  name: 'setup.money.save',
  schema: moneySchema,
  roles: ['owner'],
  handler: async (input, ctx) =>
    input.key === 'currency'
      ? saveMoneySetting(ctx, 'currency', input.value, input.expectedVersion)
      : input.key === 'vat'
        ? saveMoneySetting(ctx, 'vat', input.value, input.expectedVersion)
        : saveMoneySetting(ctx, 'pricing.defaults', input.value, input.expectedVersion),
})

// ── Setup 1 · Company and documents ──────────────────────────────────────────────────────────

/**
 * Autosave of the company form (debounced 800 ms in the client): version-checked, so a second tab's
 * save is refused with "Someone changed this a moment ago. Reload and try again." `confirm` stamps
 * confirmedAt (the "Copied from previous setup — check" tags clear).
 */
export const saveCompanyProfileAction = defineAction({
  name: 'setup.company.save',
  schema: z.object({
    profile: SETTINGS['company.profile'].schema,
    expectedVersion: version,
    confirm: z.boolean().optional(),
  }),
  roles: ['owner'],
  handler: async (input, ctx) =>
    saveCompanyProfile(ctx, input.profile, input.expectedVersion, input.confirm ?? false),
})

const slot = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('logo') }),
  z.object({ kind: z.literal('stamp') }),
  z.object({ kind: z.literal('signature'), userId: z.uuid() }),
])

const targetOf = (s: CompanyImageSlot) => ({
  kind: s.kind,
  recordType: 'company-profile',
  recordId: s.kind === 'signature' ? s.userId : undefined,
})

/** Step one of an upload: validate name, size and type, and issue the signed upload URL. */
export const startCompanyUploadAction = defineAction({
  name: 'setup.company.upload_start',
  schema: z.object({
    slot,
    filename: z.string().min(1).max(200),
    size: z.number().int().min(0),
    mime: z.string().max(100),
  }),
  roles: ['owner'],
  handler: async ({ slot: s, filename, size, mime }) => {
    const created = await createUpload({ ...targetOf(s), filename, size, mime })
    return { key: created.key, uploadUrl: created.uploadUrl }
  },
})

/**
 * Step two, after the browser PUT the file: prove the bytes (magic number, size, sha256; a mismatch
 * deletes the object), then record stored_file and point company.assets at it in one transaction.
 */
export const finishCompanyUploadAction = defineAction({
  name: 'setup.company.upload_finish',
  schema: z.object({
    slot,
    key: z.string().min(1).max(400),
    filename: z.string().min(1).max(200),
    expectedVersion: version,
  }),
  roles: ['owner'],
  handler: async ({ slot: s, key, filename, expectedVersion }, ctx) => {
    const object = await verifyUploadedObject(targetOf(s), key)
    return saveCompanyAssets(ctx, s, object, filename, expectedVersion)
  },
})
