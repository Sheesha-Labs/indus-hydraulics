'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../lib/define-action'

/** Board 128 saved views (S10-T03): a name for the current filters, the person's own. */
export const saveSupplierViewAction = defineAction({
  name: 'supplier.view.save',
  schema: z.object({
    name: z.string().trim().min(1, 'Name the view.').max(40),
    query: z.string().max(600),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const params = new URLSearchParams(input.query)
    params.delete('cursor')
    params.delete('selected')
    const row = await ctx.withTx((tx) =>
      tx.savedSearch.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          queryText: params.toString(),
          structured: { page: 'suppliers' },
        },
        select: { id: true },
      })
    )
    revalidatePath('/suppliers')
    return row
  },
})

export const deleteSupplierViewAction = defineAction({
  name: 'supplier.view.delete',
  schema: z.object({ id: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    await ctx.withTx((tx) =>
      tx.savedSearch.deleteMany({ where: { id: input.id, userId: ctx.user.id } })
    )
    revalidatePath('/suppliers')
    return { ok: true }
  },
})
