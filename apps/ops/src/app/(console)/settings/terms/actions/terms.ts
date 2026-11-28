'use server'

import { TERMS_CATEGORIES } from '@indus/ops-core'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import {
  archiveClause,
  clauseInputSchema,
  clausePatchSchema,
  createClause,
  setCategoryLock,
  setDefaultClause,
  updateClause,
} from '../../../../../server/terms/clauses'
import {
  acceptCandidate,
  createTermsImportUpload,
  dismissImport,
  skipCandidate,
  startTermsImport,
} from '../../../../../server/terms/import'
import {
  assignPresetToClients,
  createPreset,
  setDefaultPreset,
  setPresetClause,
  setPresetValues,
} from '../../../../../server/terms/presets'

/**
 * Board 39 actions (S11-T06). Owner only (Selling settings); the Helper sees the library read only. Every write
 * goes through the terms services, which record it on the clause's, preset's or client's history; a person is
 * the actor here, so a locked clause's wording may change (the Assistant path is refused in the service).
 */
const PATH = '/settings/terms'
const roles = ['owner'] as const
const done = <T>(v: T) => {
  revalidatePath(PATH)
  return v
}
const values = z.record(z.string(), z.union([z.string().max(80), z.number().int()]))

export const createClauseAction = defineAction({
  name: 'terms.clause.create',
  schema: clauseInputSchema,
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => createClause(tx, input, { kind: 'user', id: ctx.user.id }))),
})

export const updateClauseAction = defineAction({
  name: 'terms.clause.update',
  schema: z.object({ id: z.uuid(), patch: clausePatchSchema, version: z.number().int().min(0) }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(
      await ctx.withTx((tx) =>
        updateClause(tx, input.id, input.patch, input.version, {
          kind: 'user',
          id: ctx.user.id,
        })
      )
    ),
})

export const setCategoryLockAction = defineAction({
  name: 'terms.category.lock',
  schema: z.object({ category: z.enum(TERMS_CATEGORIES), locked: z.boolean() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(
      await ctx.withTx((tx) =>
        setCategoryLock(tx, input.category, input.locked, { kind: 'user', id: ctx.user.id })
      )
    ),
})

export const setDefaultClauseAction = defineAction({
  name: 'terms.clause.default',
  schema: z.object({ id: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) => done(await ctx.withTx((tx) => setDefaultClause(tx, input.id))),
  audit: (input) => ({
    subjectType: 'settings' as const,
    subjectId: input.id,
    kind: 'terms' as const,
    field: 'terms_clause.isDefault',
    after: true,
  }),
})

export const archiveClauseAction = defineAction({
  name: 'terms.clause.archive',
  schema: z.object({ id: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => archiveClause(tx, input.id, { kind: 'user', id: ctx.user.id }))),
})

export const setPresetValuesAction = defineAction({
  name: 'terms.preset.values',
  schema: z.object({ presetId: z.uuid(), clauseId: z.uuid(), values }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(
      await ctx.withTx((tx) =>
        setPresetValues(tx, input.presetId, input.clauseId, input.values, {
          kind: 'user',
          id: ctx.user.id,
        })
      )
    ),
})

export const setPresetClauseAction = defineAction({
  name: 'terms.preset.clause',
  schema: z.object({ presetId: z.uuid(), clauseId: z.uuid(), member: z.boolean() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(
      await ctx.withTx((tx) =>
        setPresetClause(tx, input.presetId, input.clauseId, input.member, {
          kind: 'user',
          id: ctx.user.id,
        })
      )
    ),
})

export const setDefaultPresetAction = defineAction({
  name: 'terms.preset.default',
  schema: z.object({ presetId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(
      await ctx.withTx((tx) =>
        setDefaultPreset(tx, input.presetId, { kind: 'user', id: ctx.user.id })
      )
    ),
})

export const createPresetAction = defineAction({
  name: 'terms.preset.create',
  schema: z.object({
    name: z.string().trim().min(2).max(60),
    description: z.string().trim().max(120).nullable(),
    clauseIds: z.array(z.uuid()).max(40),
  }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => createPreset(tx, input, { kind: 'user', id: ctx.user.id }))),
})

export const assignPresetAction = defineAction({
  name: 'terms.preset.assign',
  schema: z.object({ presetId: z.uuid(), companyIds: z.array(z.uuid()).min(1).max(200) }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      assignPresetToClients(tx, input.presetId, input.companyIds, {
        kind: 'user',
        id: ctx.user.id,
      })
    )
    revalidatePath('/clients', 'layout')
    return done(out)
  },
})

export const termsImportSlotAction = defineAction({
  name: 'terms.import.slot',
  schema: z.object({ name: z.string().max(200), size: z.number().int() }),
  roles: [...roles],
  handler: (input) => createTermsImportUpload(input),
})

export const startTermsImportAction = defineAction({
  name: 'terms.import.start',
  schema: z.object({ key: z.string().max(300), filename: z.string().max(200) }),
  roles: [...roles],
  handler: async (input, ctx) => done(await startTermsImport(input.key, input.filename, ctx.user)),
})

export const acceptCandidateAction = defineAction({
  name: 'terms.import.accept',
  schema: z.object({
    candidateId: z.uuid(),
    edits: z.object({
      category: z.enum(TERMS_CATEGORIES).optional(),
      title: z.string().trim().min(1).max(80).optional(),
      body: z.string().trim().min(3).max(600).optional(),
      defaults: values.optional(),
    }),
  }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => acceptCandidate(tx, input.candidateId, input.edits, ctx.user))),
})

export const skipCandidateAction = defineAction({
  name: 'terms.import.skip',
  schema: z.object({ candidateId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => skipCandidate(tx, input.candidateId, ctx.user))),
})

export const dismissImportAction = defineAction({
  name: 'terms.import.dismiss',
  schema: z.object({ importId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) =>
    done(await ctx.withTx((tx) => dismissImport(tx, input.importId, ctx.user))),
})
