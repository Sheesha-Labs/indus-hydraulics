'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { emitEvent } from '../inngest/emit'
import { defineAction, SafeError } from '../lib/define-action'
import { RevertError, revertEvent } from '../server/assistant/revert'
import { recountMailCounters } from '../server/mail/counters'

/**
 * "Revert to before Assistant change" on a History row (S06-T07, board 113/114): a revert_change action,
 * decided by the person, writes the before values back as new rows ("Reverted by KB"); the Assistant's
 * version stays in History and its action reads Reverted. No `audit`: the rows are the audit.
 */
export const revertChangeAction = defineAction({
  name: 'assistant.revertChange',
  schema: z.object({ eventId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await revertEvent(input.eventId, {
      id: ctx.user.id,
      initials: ctx.user.initials,
    }).catch((e: unknown) => {
      if (e instanceof RevertError) throw new SafeError(e.message)
      throw e
    })
    revalidatePath('/enquiries', 'layout')
    revalidatePath('/suppliers', 'layout')
    revalidatePath('/clients', 'layout')
    revalidatePath('/mail', 'layout')
    revalidatePath('/assistant/log')
    after(async () => {
      await Promise.all(out.events.map((e) => emitEvent({ name: e.name, data: e.data })))
      if (out.events.length) await recountMailCounters()
    })
    return { ref: out.ref }
  },
})
