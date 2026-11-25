'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction } from '../../../../../../lib/define-action'
import { confirmSheetMap, updateSheetMap } from '../../../../../../server/intake/sheet-map'

/**
 * Board 35 actions (S08-T05). Owner and Helper. Each control rewrites the sheet's lines from its cells; "Continue to
 * review" confirms the mapping and remembers it for the client when the toggle is on.
 */
const roles = ['owner', 'helper'] as const

function refresh(batchId: string) {
  revalidatePath(`/enquiries/intake/${batchId}/map`)
  revalidatePath(`/enquiries/intake/${batchId}`)
  revalidatePath('/enquiries/intake')
}

const change = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('column'),
    c: z.string().regex(/^[A-Z]{1,3}$/),
    target: z.string().max(20),
  }),
  z.object({ kind: z.literal('sheet'), sheet: z.string().min(1).max(120) }),
  z.object({ kind: z.literal('header'), row: z.number().int().min(1).max(10_000) }),
  z.object({
    kind: z.literal('unit'),
    raw: z.string().min(1).max(30),
    code: z.string().min(1).max(12),
  }),
  z.object({ kind: z.literal('remember'), on: z.boolean() }),
])

export const updateSheetMapAction = defineAction({
  name: 'intake.sheet.map',
  schema: z.object({ batchId: z.uuid(), fileId: z.uuid(), change }),
  roles: [...roles],
  handler: async (input) => {
    const out = await updateSheetMap(input.fileId, input.change)
    refresh(input.batchId)
    return out
  },
})

export const continueFromMapAction = defineAction({
  name: 'intake.sheet.confirm',
  schema: z.object({ batchId: z.uuid(), fileId: z.uuid() }),
  roles: [...roles],
  handler: async (input, ctx) => {
    const out = await confirmSheetMap(ctx.user, input.fileId)
    refresh(out.batchId)
    return out
  },
})
