'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { emitEvent } from '../../inngest/emit'
import { defineAction, SafeError } from '../../lib/define-action'
import { DecisionError } from '../../server/assistant/decisions'
import { undoAction } from '../../server/assistant/undo'

export type UndoResult =
  | { undone: true; ref: string; at: string; actionId: string }
  | { undone: false; left: { ref: string; at: string | null }; actionId: string }

/**
 * Undo (S06-T07, ADR-11): the toast's Undo, the receipt row's and ⌘Z all land here. The server decides what
 * undo means for the action (a queued send, an internal change inside its window) and answers "it left at
 * 10:19" with a correction offer when it cannot. The user who approved, or the Owner (mayUndo).
 */
export const undoApprovalAction = defineAction({
  name: 'proposal.undo',
  schema: z.object({ actionId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx): Promise<UndoResult> => {
    const out = await undoAction(input.actionId, {
      id: ctx.user.id,
      initials: ctx.user.initials,
      role: ctx.user.role,
      canSendSupplierMail: ctx.user.canSendSupplierMail,
      canSeeMargins: ctx.user.canSeeMargins,
    }).catch((e: unknown) => {
      if (e instanceof DecisionError) throw new SafeError(e.message)
      throw e
    })
    revalidatePath('/review')
    revalidatePath('/mail', 'layout')
    revalidatePath('/assistant/log')
    if (out.undone && out.events.length) {
      const events = out.events
      after(async () => {
        await Promise.all(events.map((e) => emitEvent({ name: e.name, data: e.data })))
      })
    }
    return out.undone
      ? { undone: true, ref: out.ref, at: out.at, actionId: input.actionId }
      : { undone: false, left: out.left, actionId: input.actionId }
  },
})
