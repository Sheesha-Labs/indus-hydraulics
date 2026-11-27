'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { defineAction, SafeError } from '../../lib/define-action'
import type { OpsUser } from '../../lib/access-core'
import {
  approve,
  batchApprove,
  DecisionError,
  later,
  redraft,
  reject,
  saveEdits,
  type Decider,
} from '../../server/assistant/decisions'

/**
 * Review verbs (S06-T02). Thin: roles from the session, Zod input, the decisions service does the rest and
 * writes the audit trail (assistant_action_event with the person as actor). Both roles may call them; the
 * service refuses what a Helper may not decide (locked, money, client-mailbox sends). No `audit` transaction:
 * the approval schedules a send on its own connection (ADR-04).
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

function refresh(): void {
  revalidatePath('/review')
  revalidatePath('/mail', 'layout')
}

const ref = { actionId: z.uuid(), version: z.number().int().min(0) }

export const approveProposalAction = defineAction({
  name: 'proposal.approve',
  schema: z.object({
    ...ref,
    optionValue: z.string().max(200).optional(),
    /** S09-T06: the card's reason chip (board 168) and its body switch. */
    chip: z.string().max(40).optional(),
    toggle: z.boolean().optional(),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await approve(input, decider(ctx.user)).catch(safe)
    refresh()
    return out.undoRemainingMs
      ? { state: out.state, undoRemainingMs: out.undoRemainingMs }
      : { state: out.state }
  },
})

const editsSchema = z
  .object({
    to: z.array(z.email()).min(1).max(20).optional(),
    cc: z.array(z.email()).max(20).optional(),
    subject: z.string().trim().min(1).max(300).optional(),
    body: z.string().trim().min(1).max(50_000).optional(),
  })
  .strict()

export const editApproveProposalAction = defineAction({
  name: 'proposal.editApprove',
  schema: z.object({ ...ref, edits: editsSchema }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await approve(
      { actionId: input.actionId, version: input.version, edits: input.edits },
      decider(ctx.user)
    ).catch(safe)
    refresh()
    return out.undoRemainingMs
      ? { state: out.state, undoRemainingMs: out.undoRemainingMs }
      : { state: out.state }
  },
})

export const rejectProposalAction = defineAction({
  name: 'proposal.reject',
  schema: z.object({
    ...ref,
    chip: z.string().max(40).optional(),
    reason: z.string().trim().min(1, 'Say why in one line.').max(200),
    redraft: z.boolean().default(false),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await reject(input, decider(ctx.user)).catch(safe)
    refresh()
    return out
  },
})

export const laterProposalAction = defineAction({
  name: 'proposal.later',
  schema: z.object({
    ...ref,
    until: z.union([
      z.enum(['in-1h', 'tomorrow-0900', 'monday-0900']),
      z.iso.datetime({ offset: true }),
    ]),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await later(input, decider(ctx.user)).catch(safe)
    refresh()
    return out
  },
})

export const redraftProposalAction = defineAction({
  name: 'proposal.redraft',
  schema: z.object({ actionId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await redraft(input, decider(ctx.user)).catch(safe)
    refresh()
    return out
  },
})

export const batchApproveProposalsAction = defineAction({
  name: 'proposal.batchApprove',
  schema: z.object({ items: z.array(z.object(ref)).min(1).max(50) }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await batchApprove(input.items, decider(ctx.user))
    refresh()
    return { results: out, approved: out.filter((r) => r.ok).length }
  },
})

/** Save an edit without approving it (board 103 "Save"; another person approving the old version sees board 110). */
export const saveEditsProposalAction = defineAction({
  name: 'proposal.saveEdits',
  schema: z.object({ ...ref, edits: editsSchema }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await saveEdits(input, decider(ctx.user)).catch(safe)
    refresh()
    return out
  },
})
