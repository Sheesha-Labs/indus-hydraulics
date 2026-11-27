'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import { decide, sendBack, submitForReview } from '../../../../../server/directory/approval'
import {
  addSupplierBankAccount,
  bankAccountSchema,
  callbackSchema,
  recordBankCallback,
} from '../../../../../server/directory/bank'
import { recordScreening, screeningRowSchema } from '../../../../../server/directory/screening'

/**
 * Board 51 (S10-T05). Screening rows and bank details: Owner or Helper. The call-back record and the decision:
 * Owner only, in the action's roles and again in the service (architecture §1.2).
 */
const refresh = (id: string) => {
  revalidatePath(`/suppliers/new/${id}`, 'layout')
  revalidatePath(`/suppliers/${id}`, 'layout')
  revalidatePath('/suppliers')
}

export const saveScreeningAction = defineAction({
  name: 'supplier.vetting.screening',
  schema: z.object({ supplierId: z.uuid(), rows: z.array(screeningRowSchema).min(1).max(7) }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      recordScreening(tx, input.supplierId, input.rows, ctx.user)
    )
    refresh(input.supplierId)
    return out
  },
})

export const addBankAccountAction = defineAction({
  name: 'supplier.vetting.bank',
  schema: z.object({ supplierId: z.uuid(), account: bankAccountSchema }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      addSupplierBankAccount(tx, input.supplierId, input.account, { kind: 'user', id: ctx.user.id })
    )
    refresh(input.supplierId)
    return { last4: out.last4 }
  },
})

export const recordCallbackAction = defineAction({
  name: 'supplier.bank.callback',
  schema: callbackSchema.extend({ supplierId: z.uuid() }),
  roles: ['owner'],
  idempotent: (i) => `callback:${i.accountId}`,
  handler: async (input, ctx) => {
    const { supplierId, ...cb } = input
    const out = await ctx.withTx((tx) => recordBankCallback(tx, cb, ctx.user))
    refresh(supplierId)
    return out
  },
})

export const submitForReviewAction = defineAction({
  name: 'supplier.vetting.submit',
  schema: z.object({ supplierId: z.uuid(), note: z.string().trim().max(300).optional() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) => submitForReview(tx, input.supplierId, ctx.user, input.note))
    refresh(input.supplierId)
    return { ok: true }
  },
})

export const sendBackAction = defineAction({
  name: 'supplier.vetting.send_back',
  schema: z.object({ supplierId: z.uuid(), reason: z.string().trim().min(1).max(300) }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) => sendBack(tx, input.supplierId, input.reason, ctx.user))
    refresh(input.supplierId)
    return { ok: true }
  },
})

export const decideSupplierAction = defineAction({
  name: 'supplier.vetting.decide',
  schema: z.object({
    supplierId: z.uuid(),
    decision: z.enum(['approve', 'approve_trial', 'reject']),
    reason: z.string().trim().max(400).optional(),
  }),
  roles: ['owner'],
  idempotent: (i) => `decide:${i.supplierId}:${i.decision}`,
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      decide(tx, input.supplierId, input.decision, ctx.user, input.reason ?? null)
    )
    refresh(input.supplierId)
    return out
  },
})
