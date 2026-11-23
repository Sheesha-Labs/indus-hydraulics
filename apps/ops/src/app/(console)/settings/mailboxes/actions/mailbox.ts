'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { emitEvent } from '../../../../../inngest/emit'
import { writeAudit } from '../../../../../lib/audit'
import { defineAction, SafeError } from '../../../../../lib/define-action'
import {
  MailboxAdminError,
  pauseMailboxReading,
  resumeMailboxReading,
  setMailboxPermissions,
  setMailboxRole,
} from '../../../../../server/gmail/mailbox-admin'
import { ScheduleError } from '../../../../../server/mail-send/schedule'
import { sendTestEmail, TestSendError } from '../../../../../server/mail-send/test-send'

/**
 * Board 85 actions (S04-T07). Owner only: a mailbox's role, what the Assistant may do in it and whether it is
 * read are the Owner's decisions (board 84 permissions). Each writes an activity_event on the mailbox.
 */
const PATH = '/settings/mailboxes'

function safe(error: unknown): never {
  if (
    error instanceof MailboxAdminError ||
    error instanceof TestSendError ||
    error instanceof ScheduleError
  ) {
    throw new SafeError(error.message)
  }
  throw error
}

export const setMailboxRoleAction = defineAction({
  name: 'mailbox.setRole',
  schema: z.object({
    mailboxId: z.uuid(),
    role: z.enum(['client', 'supplier', 'read_only', 'personal']),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await setMailboxRole(ctx.tx!, input.mailboxId, input.role).catch(safe)
    revalidatePath(PATH)
    return out
  },
  audit: (input, out) => ({
    subjectType: 'mailbox',
    subjectId: input.mailboxId,
    kind: 'settings',
    field: 'role',
    before: out.before,
    after: out.after,
    ...(out.sendTurnedOff ? { note: 'Send turned off: this role never sends' } : {}),
  }),
})

export const setMailboxPermissionsAction = defineAction({
  name: 'mailbox.setPermissions',
  schema: z.object({
    mailboxId: z.uuid(),
    read: z.boolean(),
    drafts: z.boolean(),
    send: z.boolean(),
    labels: z.boolean(),
    /** Present only to be refused: archive can never be enabled. */
    archive: z.literal(false).optional(),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await setMailboxPermissions(ctx.tx!, input.mailboxId, input).catch(safe)
    revalidatePath(PATH)
    return out
  },
  audit: (input, out) => ({
    subjectType: 'mailbox',
    subjectId: input.mailboxId,
    kind: 'settings',
    field: 'permissions',
    before: out.before,
    after: out.after,
  }),
})

export const pauseMailboxReadingAction = defineAction({
  name: 'mailbox.pauseReading',
  schema: z.object({ mailboxId: z.uuid() }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await pauseMailboxReading(ctx.tx!, input.mailboxId, ctx.user.id).catch(safe)
    revalidatePath(PATH)
    return out
  },
  audit: (input, out) => ({
    subjectType: 'mailbox',
    subjectId: input.mailboxId,
    kind: 'status',
    before: out.before,
    after: 'paused',
    note: 'Reading paused',
  }),
})

/**
 * Resume commits first, then wakes the work that waited: ops/mailbox.resumed re-gates held sends, and a poll
 * tick syncs from the stored historyId (nothing arrived in Gmail is lost while paused).
 */
export const resumeMailboxReadingAction = defineAction({
  name: 'mailbox.resumeReading',
  schema: z.object({ mailboxId: z.uuid() }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx(async (tx) => {
        const resumed = await resumeMailboxReading(tx, input.mailboxId)
        if (resumed) {
          await writeAudit(tx, ctx.user.id, {
            subjectType: 'mailbox',
            subjectId: input.mailboxId,
            kind: 'status',
            before: 'paused',
            after: resumed.after,
            note: 'Reading resumed',
          })
        }
        return resumed
      })
      .catch(safe)
    if (out) {
      await emitEvent({
        name: 'ops/mailbox.resumed',
        id: `mailbox-resumed:${input.mailboxId}:${Date.now()}`,
        data: { mailboxId: input.mailboxId },
      })
      await emitEvent({ name: 'ops/gmail.poll.tick', data: { emailAddress: out.address } })
    }
    revalidatePath(PATH)
    return { resumed: !!out, status: out?.after ?? null }
  },
})

/** Owner-only diagnostic (not on the board): one test email through the real queue, with the server's Undo. */
export const sendTestEmailAction = defineAction({
  name: 'mailbox.sendTest',
  schema: z.object({
    mailboxId: z.uuid(),
    to: z.email().max(254),
    mode: z.enum(['reply', 'new']),
  }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    const out = await sendTestEmail({ userId: ctx.user.id, ...input }).catch(safe)
    return {
      outboundId: out.outboundId,
      undoRemainingMs: out.undoRemainingMs,
      threaded: out.threaded,
    }
  },
  audit: (input, out) => ({
    subjectType: 'mailbox',
    subjectId: input.mailboxId,
    kind: 'other',
    note: `Test email queued (${out.threaded ? 'reply in thread' : 'new thread'})`,
  }),
})
