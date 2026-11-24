'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction, SafeError } from '../../lib/define-action'
import type { OpsUser } from '../../lib/access-core'
import { copyText, markSent, retrySend } from '../../server/assistant/attention'
import { DecisionError, type Decider } from '../../server/assistant/decisions'

/**
 * Board 110's verbs for a send that went wrong (S06-T03): Retry (a person's click; a new send with a new
 * key), Copy text (the card stays), Mark as sent (Owner). Nothing here retries on its own.
 */
const decider = (u: OpsUser): Decider => ({
  id: u.id,
  initials: u.initials,
  role: u.role,
  canSendSupplierMail: u.canSendSupplierMail,
  canSeeMargins: u.canSeeMargins,
})
function safe(e: unknown): never {
  if (e instanceof DecisionError) throw new SafeError(e.message)
  throw e
}

export const retrySendAction = defineAction({
  name: 'proposal.retry',
  schema: z.object({ actionId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await retrySend(input, decider(ctx.user)).catch(safe)
    revalidatePath('/review')
    return out
  },
})

export const markSentAction = defineAction({
  name: 'proposal.markSent',
  schema: z.object({ actionId: z.uuid() }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await markSent(input, decider(ctx.user)).catch(safe)
    revalidatePath('/review')
    return out
  },
})

export const copyTextAction = defineAction({
  name: 'proposal.copyText',
  schema: z.object({ actionId: z.uuid() }),
  roles: ['owner', 'helper'],
  readOnlySafe: true,
  handler: async (input) => copyText(input).catch(safe),
})
