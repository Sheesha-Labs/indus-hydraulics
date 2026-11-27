'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../lib/define-action'
import { requestActionQuietly } from '../../../../server/assistant/request'
import { blockSchema, blockSupplier, unblockSupplier } from '../../../../server/directory/block'

/**
 * Boards 130 and 131 (S10-T07). Ask for a promotion (a card for Review), block (Owner or Helper; the effects are the
 * ones listed), unblock (Owner only, in the action and the service).
 */
const refresh = (id: string) => {
  revalidatePath(`/suppliers/${id}`, 'layout')
  revalidatePath('/suppliers')
}

export const requestPromotionAction = defineAction({
  name: 'supplier.promote.request',
  schema: z.object({ supplierId: z.uuid(), to: z.enum(['trial', 'approved']) }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const ok = await requestActionQuietly({
      actionKey: 'promote_supplier',
      subjectType: 'company',
      subjectId: input.supplierId,
      trigger: 'person',
      origin: 'live',
      sourceVersion: `${input.to}:${new Date().toISOString().slice(0, 10)}`,
      requestedById: ctx.user.id,
    })
    refresh(input.supplierId)
    return { queued: ok }
  },
})

export const blockSupplierAction = defineAction({
  name: 'supplier.block',
  schema: blockSchema.extend({ supplierId: z.uuid() }),
  roles: ['owner', 'helper'],
  idempotent: (i) => `block:${i.supplierId}`,
  handler: async (input, ctx) => {
    const { supplierId, ...b } = input
    const out = await ctx.withTx((tx) => blockSupplier(tx, supplierId, b, ctx.user))
    refresh(supplierId)
    return { withdrawn: out.draftRecipients.length, flaggedPos: out.pos.length }
  },
})

export const unblockSupplierAction = defineAction({
  name: 'supplier.unblock',
  schema: z.object({ supplierId: z.uuid(), reason: z.string().trim().min(1).max(300) }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      unblockSupplier(tx, input.supplierId, input.reason, ctx.user)
    )
    refresh(input.supplierId)
    return out
  },
})
