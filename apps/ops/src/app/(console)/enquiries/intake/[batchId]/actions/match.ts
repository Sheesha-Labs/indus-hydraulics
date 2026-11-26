'use server'

import { opsDb } from '@indus/ops-db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../../lib/define-action'
import { applyMatch } from '../../../../../../server/intake/match'
import { assertConfirmable } from '../../../../../../server/intake/review'

/**
 * Board 16 actions (S09-T04). Owner and Helper. "Continue to match" checks the review can be confirmed (nothing
 * is written); the match step applies one of three outcomes in one transaction, idempotent on the batch.
 */
const roles = ['owner', 'helper'] as const

export const reviewReadyAction = defineAction({
  name: 'intake.match.ready',
  schema: z.object({ batchId: z.uuid() }),
  roles: [...roles],
  readOnlySafe: true,
  handler: async (input) => {
    await opsDb.$transaction((tx) => assertConfirmable(tx, input.batchId))
    return { href: `/enquiries/intake/${input.batchId}/match` }
  },
})

export const searchClientsAction = defineAction({
  name: 'intake.match.clients',
  schema: z.object({ q: z.string().trim().min(1).max(80) }),
  roles: [...roles],
  readOnlySafe: true,
  handler: async (input) =>
    opsDb.company.findMany({
      where: {
        archivedAt: null,
        mergedIntoId: null,
        OR: [
          { name: { contains: input.q, mode: 'insensitive' } },
          { aliases: { has: input.q } },
          { primaryDomain: { contains: input.q.toLowerCase() } },
        ],
      },
      orderBy: [{ isClient: 'desc' }, { name: 'asc' }],
      take: 8,
      select: { id: true, name: true, primaryDomain: true },
    }),
})

const client = {
  companyId: z.uuid().optional(),
  newClient: z.string().trim().min(2).max(160).optional(),
}

export const applyMatchAction = defineAction({
  name: 'intake.match.apply',
  schema: z.discriminatedUnion('option', [
    z.object({ batchId: z.uuid(), option: z.literal('enquiry'), ...client }),
    z.object({ batchId: z.uuid(), option: z.literal('new_lead'), ...client }),
    z.object({ batchId: z.uuid(), option: z.literal('open_lead'), leadId: z.uuid(), ...client }),
  ]),
  roles: [...roles],
  // Idempotent in applyMatch itself (the batch is claimed once). Not an idempotent action: the follow-up events
  // must leave after the transaction commits, which an action-held transaction would delay past them.
  handler: async ({ batchId, ...input }, ctx) => {
    const out = await applyMatch(batchId, input as never, ctx.user)
    revalidatePath('/enquiries/intake')
    revalidatePath('/enquiries')
    revalidatePath('/enquiries/leads')
    return out
  },
})
