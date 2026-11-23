'use server'

import { z } from 'zod'
import { defineAction, SafeError } from '../lib/define-action'
import { SAFE_MESSAGES } from '../lib/safe-message'
import { mayUndo, undoSend } from '../server/mail-send/undo'

/**
 * Undo a queued email (ADR-11, board 93 "Undo 3:12"). Cross-cutting: the receipt row on any screen calls it.
 * The Owner may undo any queued email; the Helper only one they composed or approved. The server decides
 * whether it is still in time; the countdown the UI shows comes from the server's undoRemainingMs.
 */
export const undoOutboundAction = defineAction({
  name: 'outbound.undo',
  schema: z.object({ outboundId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    if (!(await mayUndo(input.outboundId, ctx.user))) throw new SafeError(SAFE_MESSAGES.forbidden)
    const out = await undoSend(input.outboundId)
    if (!out.success) throw new SafeError(out.error)
    return out.data
  },
})
