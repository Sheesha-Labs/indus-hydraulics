'use server'

import { z } from 'zod'
import { defineAction, SafeError } from '../../../../../lib/define-action'
import {
  DisconnectError,
  disconnectCounts,
  disconnectMailbox,
} from '../../../../../server/gmail/disconnect'

/**
 * Board 90 (S04-T08). Owner only. The modal reads LIVE counts when it opens; Disconnect needs the address typed
 * exactly. The service writes the receipt (activity_event) in its own transaction, so this action has no
 * `audit` of its own.
 */
export const disconnectCountsAction = defineAction({
  name: 'mailbox.disconnectCounts',
  schema: z.object({ mailboxId: z.uuid() }),
  roles: ['owner'],
  readOnlySafe: true,
  handler: async (input) => disconnectCounts(input.mailboxId),
})

export const disconnectMailboxAction = defineAction({
  name: 'mailbox.disconnect',
  schema: z.object({
    mailboxId: z.uuid(),
    mode: z.enum(['keep', 'delete']),
    typed: z.string().max(254),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    try {
      // No revalidatePath here: the modal shows the receipt first and refreshes the page on Done.
      return await disconnectMailbox({ ...input, user: ctx.user })
    } catch (error) {
      if (error instanceof DisconnectError) throw new SafeError(error.message)
      throw error
    }
  },
})
