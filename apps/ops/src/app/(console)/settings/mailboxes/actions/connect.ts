'use server'

import { z } from 'zod'
import { defineAction, SafeError } from '../../../../../lib/define-action'
import { SAFE_MESSAGES } from '../../../../../lib/safe-message'
import {
  confirmConnectedMailbox,
  mayConnect,
  startConnect,
} from '../../../../../server/gmail/connect'

/**
 * Board 86 / board 80: start the mailbox OAuth flow, and confirm step 4 (aliases, past mail) after Google.
 * The Owner may connect any role; the Helper only the Supplier mailbox and only with "Send supplier RFQs and
 * chasers" on (checked in the service from the session, never from input).
 */
const role = z.enum(['client', 'supplier', 'read_only', 'personal'])

export const startMailboxConnectAction = defineAction({
  name: 'mailbox.connect.start',
  schema: z.object({
    role,
    address: z.email('Enter the mailbox address.').max(254),
    returnTo: z.enum(['settings', 'setup']).default('settings'),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    if (!mayConnect(ctx.user, input.role)) throw new SafeError(SAFE_MESSAGES.forbidden)
    const result = await startConnect({ user: ctx.user, ...input })
    if (result.ok) return { url: result.url }
    if (result.reason === 'not_workspace') {
      throw new SafeError('Client and Supplier mailboxes must be on the company Google Workspace.')
    }
    if (result.reason === 'not_allowed') throw new SafeError(SAFE_MESSAGES.forbidden)
    throw new SafeError(
      'Google sign-in for mailboxes is not set up yet. See the Gmail setup runbook.'
    )
  },
})

export const confirmMailboxConnectAction = defineAction({
  name: 'mailbox.connect.confirm',
  schema: z.object({
    mailboxId: z.uuid(),
    backfillMonths: z.union([z.literal(0), z.literal(12), z.literal(24)]),
    aliases: z.array(z.email()).max(20),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => confirmConnectedMailbox({ user: ctx.user, ...input }, ctx.tx!),
  audit: (input) => ({
    subjectType: 'mailbox',
    subjectId: input.mailboxId,
    kind: 'settings',
    field: 'connection',
    note: `Mailbox connected · past mail ${input.backfillMonths ? `${input.backfillMonths} months` : 'none'}`,
  }),
})
