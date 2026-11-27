'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../lib/define-action'
import {
  createSupplierUpload,
  supplierFilePrefix,
} from '../../../../../server/directory/document-files'
import {
  activateSupplier,
  lineCardEntrySchema,
  recordPriceList,
  saveLineCard,
  saveSupplierTerms,
  termsSchema,
} from '../../../../../server/directory/line-card'

/** Board 52 (S10-T06): the line card (versioned), the terms, the price list, and Activate. Owner or Helper. */
const roles = ['owner', 'helper'] as const
const refresh = (id: string) => {
  revalidatePath(`/suppliers/new/${id}`, 'layout')
  revalidatePath(`/suppliers/${id}`, 'layout')
  revalidatePath('/suppliers')
}

export const saveLineCardAction = defineAction({
  name: 'supplier.line_card.save',
  schema: z.object({ supplierId: z.uuid(), entries: z.array(lineCardEntrySchema).min(1).max(80) }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) =>
      saveLineCard(tx, input.supplierId, input.entries, ctx.user)
    )
    refresh(input.supplierId)
    return out
  },
})

export const saveTermsAction = defineAction({
  name: 'supplier.terms.save',
  schema: z.object({ supplierId: z.uuid(), terms: termsSchema }),
  roles: [...roles],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) => saveSupplierTerms(tx, input.supplierId, input.terms, ctx.user))
    refresh(input.supplierId)
    return { ok: true }
  },
})

export const priceListSlotAction = defineAction({
  name: 'supplier.price_list.slot',
  schema: z.object({ supplierId: z.uuid(), name: z.string().max(200), size: z.number().int() }),
  roles: [...roles],
  handler: (input) =>
    createSupplierUpload(supplierFilePrefix(input.supplierId, 'price-list'), {
      name: input.name,
      size: input.size,
    }),
})

export const recordPriceListAction = defineAction({
  name: 'supplier.price_list.record',
  schema: z.object({
    supplierId: z.uuid(),
    key: z.string().max(300),
    filename: z.string().max(200),
  }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await recordPriceList(
      input.supplierId,
      { key: input.key, filename: input.filename },
      ctx.user
    )
    refresh(input.supplierId)
    return out
  },
})

export const activateSupplierAction = defineAction({
  name: 'supplier.activate',
  schema: z.object({ supplierId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await ctx.withTx((tx) => activateSupplier(tx, input.supplierId, ctx.user))
    refresh(input.supplierId)
    return out
  },
})
