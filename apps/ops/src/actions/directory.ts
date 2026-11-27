'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../lib/define-action'
import { SafeError } from '../lib/safe-message'
import { archiveContact, setPreferred, upsertContact } from '../server/directory/contact'
import { mergeCompanies } from '../server/directory/merge'

/**
 * Directory verbs shared by the client and supplier profiles (S10-T01/T02/T03): contacts and merging. Owner and
 * Helper; a merge of a supplier with verified bank details is the Owner's (assertCanMerge).
 */
const roles = ['owner', 'helper'] as const

function refresh(companyId: string) {
  revalidatePath(`/clients/${companyId}`)
  revalidatePath(`/suppliers/${companyId}`, 'layout')
  revalidatePath('/clients')
  revalidatePath('/suppliers')
}

export const upsertContactAction = defineAction({
  name: 'directory.contact.upsert',
  schema: z.object({
    companyId: z.uuid(),
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().max(200).optional(),
    phone: z.string().trim().max(40).optional(),
    role: z.string().trim().max(60).optional(),
    sourceKind: z.enum(['manual', 'verified_on_page', 'directory_only']).default('manual'),
    sourceUrl: z.url().optional(),
    isPreferred: z.boolean().optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const company = await ctx.withTx(async (tx) => {
      const c = await tx.company.findUnique({
        where: { id: input.companyId },
        select: { id: true },
      })
      if (!c) throw new SafeError('That company is no longer here.')
      return upsertContact(
        tx,
        {
          companyId: input.companyId,
          email: input.email || null,
          name: input.name || null,
          phone: input.phone || null,
          role: input.role || null,
          sourceKind: input.sourceKind,
          sourceUrl: input.sourceUrl ?? null,
          ...(input.isPreferred === undefined ? {} : { isPreferred: input.isPreferred }),
        },
        { kind: 'user', id: ctx.user.id }
      )
    })
    refresh(input.companyId)
    return company
  },
})

export const archiveContactAction = defineAction({
  name: 'directory.contact.archive',
  schema: z.object({ contactId: z.uuid(), companyId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) => archiveContact(tx, input.contactId, { kind: 'user', id: ctx.user.id }))
    refresh(input.companyId)
    return { ok: true }
  },
})

export const setPreferredContactAction = defineAction({
  name: 'directory.contact.preferred',
  schema: z.object({ contactId: z.uuid(), companyId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) => setPreferred(tx, input.contactId, { kind: 'user', id: ctx.user.id }))
    refresh(input.companyId)
    return { ok: true }
  },
})

export const mergeCompaniesAction = defineAction({
  name: 'directory.merge',
  schema: z.object({ survivorId: z.uuid(), mergedId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      mergeCompanies(tx, input.survivorId, input.mergedId, ctx.user)
    )
    refresh(input.survivorId)
    refresh(input.mergedId)
    return {
      survivorId: out.survivorId,
      contactsMerged: out.contactsMerged,
      kept: Object.keys(out.kept).length,
    }
  },
})
