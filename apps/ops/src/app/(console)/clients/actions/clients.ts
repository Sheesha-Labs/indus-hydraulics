'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../lib/define-action'
import { createCompany } from '../../../../server/directory/company'
import {
  CLIENT_GROUPS,
  updateClientProfile,
  type ClientGroup,
} from '../../../../server/directory/profiles'

/**
 * Boards 11 and 12 (S10-T02). Owner and Helper; the credit section is the Owner's (refused server-side in
 * updateClientProfile). Every change is logged through writeTracked.
 */
const roles = ['owner', 'helper'] as const

export const createClientAction = defineAction({
  name: 'client.create',
  schema: z.object({
    name: z.string().trim().min(1, 'Write the company name.').max(160),
    country: z
      .string()
      .regex(/^[A-Za-z]{2}$/, 'Use a two-letter country code, e.g. AE.')
      .optional(),
    city: z.string().trim().max(80).optional(),
    industry: z.string().trim().max(80).optional(),
    website: z.string().trim().max(200).optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      createCompany(
        tx,
        {
          name: input.name,
          roles: { client: true },
          country: input.country ?? null,
          city: input.city ?? null,
          industry: input.industry ?? null,
          website: input.website ?? null,
        },
        { kind: 'user', id: ctx.user.id }
      )
    )
    revalidatePath('/clients')
    return out
  },
})

const groupSchema = z.enum(Object.keys(CLIENT_GROUPS) as [ClientGroup, ...ClientGroup[]])

export const updateClientProfileAction = defineAction({
  name: 'client.profile.update',
  schema: z.object({
    companyId: z.uuid(),
    group: groupSchema,
    values: z.record(z.string(), z.unknown()),
    expectedUpdatedAt: z.string().optional(),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) =>
      updateClientProfile(
        tx,
        input.companyId,
        input.group,
        input.values,
        ctx.user,
        input.expectedUpdatedAt
      )
    )
    revalidatePath(`/clients/${input.companyId}`)
    revalidatePath('/clients')
    return { ok: true }
  },
})
