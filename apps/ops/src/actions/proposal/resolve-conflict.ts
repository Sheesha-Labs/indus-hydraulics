'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction, SafeError } from '../../lib/define-action'
import type { OpsUser } from '../../lib/access-core'
import { DecisionError, keepMyVersion, type Decider } from '../../server/assistant/decisions'

/**
 * Board 110 "Changed by <them> while you were reviewing": Keep mine and tell <them>. (Review his change is a
 * link: the card reloads with their version, and Approve is on again.) Both versions stay in the trail.
 */
const decider = (u: OpsUser): Decider => ({
  id: u.id,
  initials: u.initials,
  role: u.role,
  canSendSupplierMail: u.canSendSupplierMail,
  canSeeMargins: u.canSeeMargins,
})

export const keepMyVersionAction = defineAction({
  name: 'proposal.keepMine',
  schema: z.object({
    actionId: z.uuid(),
    version: z.number().int().min(0),
    seen: z.number().int().min(0),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await keepMyVersion(input, decider(ctx.user)).catch((e: unknown) => {
      if (e instanceof DecisionError) throw new SafeError(e.message)
      throw e
    })
    revalidatePath('/review')
    return out
  },
})
