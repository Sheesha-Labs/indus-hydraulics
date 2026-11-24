'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { MAIL_CLASSES } from '@indus/ops-core'
import { emitEvent } from '../../../../inngest/emit'
import { defineAction, SafeError } from '../../../../lib/define-action'
import { recountMailCounters } from '../../../../server/mail/counters'
import { OverrideError } from '../../../../server/mail/overrides'
import { itsReal } from '../../../../server/mail/phishing'

/**
 * "It's real" on a phishing card (S05-T07, board 96): the person's word against the checks. Reclassifies
 * through writeTracked, records a preference signal, clears the flag and, with a company chosen, adds the
 * sender's domain to it (never a public mail domain).
 */
const classSchema = z
  .enum(MAIL_CLASSES)
  .exclude(['unclassified', 'phishing', 'bounce', 'auto_reply'])

export const itsRealAction = defineAction({
  name: 'mail.itsReal',
  schema: z.object({
    messageId: z.uuid(),
    cls: classSchema,
    companyId: z.uuid().nullish(),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        itsReal(tx, {
          messageId: input.messageId,
          cls: input.cls,
          companyId: input.companyId ?? null,
          actor: { id: ctx.user.id, initials: ctx.user.initials },
        })
      )
      .catch((e: unknown) => {
        if (e instanceof OverrideError) throw new SafeError(e.message)
        throw e
      })
    revalidatePath('/mail')
    after(async () => {
      await Promise.all(out.events.map((e) => emitEvent({ name: e.name, data: e.data })))
      await recountMailCounters()
    })
    return { messageId: out.messageId, learned: out.learned }
  },
})
