'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { emitEvent } from '../inngest/emit'
import { defineAction, SafeError } from '../lib/define-action'
import { CorrectionError } from '../server/assistant/actions/override-value'
import { correctValue } from '../server/assistant/override'
import { OverrideError } from '../server/mail/overrides'
import { recountMailCounters } from '../server/mail/counters'

/**
 * "This is wrong…" in Why? (S06-T05, board 112): the person picks the right value and says why in a line. The
 * correction is the person's (writeTracked, "Overridden by KB"), recorded as an `override_value` action that
 * reverts the original, and teaches a preference. Its events (labels, the link step) go after commit.
 *
 * No `audit`: the activity rows and the action row ARE the audit, and an audit transaction would hold the one
 * pooled connection (see mail/actions/mail.ts).
 */
export const correctValueAction = defineAction({
  name: 'assistant.correctValue',
  schema: z.object({
    actionRef: z.string().regex(/^A-[A-Za-z0-9-]{1,60}$/),
    value: z.string().trim().min(1, 'Choose the right value').max(300),
    reason: z.string().trim().min(1, 'Say in a line why it is wrong').max(300),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        correctValue(tx, {
          actionRef: input.actionRef,
          value: input.value,
          reason: input.reason,
          actor: { id: ctx.user.id, initials: ctx.user.initials },
        })
      )
      .catch((e: unknown) => {
        if (e instanceof CorrectionError || e instanceof OverrideError)
          throw new SafeError(e.message)
        throw e
      })
    revalidatePath('/mail', 'layout')
    revalidatePath('/review')
    revalidatePath('/assistant/log')
    after(async () => {
      await Promise.all(out.events.map((e) => emitEvent({ name: e.name, data: e.data })))
      await recountMailCounters()
    })
    return { ref: out.ref, label: out.label }
  },
})
