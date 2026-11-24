'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { CORRECTION_REASONS } from '@indus/ops-core'
import { defineAction, SafeError } from '../lib/define-action'
import { CorrectionStartError, startCorrection } from '../server/assistant/corrections'

/**
 * Board 114 "Send a correction instead?" (S06-T07): the reason chip and a note. The Assistant drafts a
 * correction card for Review (always Draft and ask), or a registered reissue runs.
 */
export const startCorrectionAction = defineAction({
  name: 'assistant.startCorrection',
  schema: z.object({
    actionId: z.uuid(),
    reason: z.enum(CORRECTION_REASONS),
    note: z.string().trim().max(400).nullable(),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await startCorrection(
      { actionId: input.actionId, reason: input.reason, note: input.note || null },
      { id: ctx.user.id }
    ).catch((e: unknown) => {
      if (e instanceof CorrectionStartError) throw new SafeError(e.message)
      throw e
    })
    revalidatePath('/review')
    return out
  },
})
