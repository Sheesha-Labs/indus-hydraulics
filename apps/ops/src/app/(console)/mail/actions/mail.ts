'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { MAIL_CLASSES } from '@indus/ops-core'
import { emitEvent } from '../../../../inngest/emit'
import { defineAction, SafeError } from '../../../../lib/define-action'
import { ScheduleError } from '../../../../server/mail-send/schedule'
import { recountMailCounters } from '../../../../server/mail/counters'
import {
  changeType,
  LINKABLE,
  linkTo,
  markNotBusiness,
  OverrideError,
  unlink,
  type OverrideResult,
} from '../../../../server/mail/overrides'
import { ReplyError, replyInThread } from '../../../../server/mail/reply'
import { resolveUnsure, undoResolution } from '../../../../server/mail/resolve-unsure'

/**
 * Mail view actions (S05-T05, board 91 "Not right?" and the reply composer; S05-T06 Link to…). Both the Owner
 * and the Helper may correct the Assistant's sorting. Each correction is written through writeTracked with
 * the person as actor and records a preference signal; its events go out after the transaction commits.
 *
 * None of these declares `audit`: the activity rows ARE the audit (writeTracked), and an audit transaction
 * would hold the single pooled connection while the reply's scheduleSend opens its own (the 2026-11-23
 * deadlock).
 */
const PATH = '/mail'

function safe(error: unknown): never {
  if (
    error instanceof OverrideError ||
    error instanceof ReplyError ||
    error instanceof ScheduleError
  ) {
    throw new SafeError(error.message)
  }
  throw error
}

/**
 * After a correction commits: its events (labels follow, a new class asks the link step again) and the badge
 * recount run AFTER the response, so the person never waits on Inngest or the counts.
 */
function followUp(out: OverrideResult): void {
  revalidatePath(PATH)
  after(async () => {
    await Promise.all(out.events.map((e) => emitEvent({ name: e.name, data: e.data })))
    await recountMailCounters()
  })
}

const classSchema = z.enum(MAIL_CLASSES).exclude(['unclassified'])

export const changeTypeAction = defineAction({
  name: 'mail.changeType',
  schema: z.object({ messageId: z.uuid(), cls: classSchema }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        changeType(tx, {
          messageId: input.messageId,
          cls: input.cls,
          actor: { id: ctx.user.id, initials: ctx.user.initials },
        })
      )
      .catch(safe)
    followUp(out)
    return { messageId: out.messageId }
  },
})

export const markNotBusinessAction = defineAction({
  name: 'mail.markNotBusiness',
  schema: z.object({ messageId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        markNotBusiness(tx, {
          messageId: input.messageId,
          actor: { id: ctx.user.id, initials: ctx.user.initials },
        })
      )
      .catch(safe)
    followUp(out)
    return { messageId: out.messageId }
  },
})

export const unlinkAction = defineAction({
  name: 'mail.unlink',
  schema: z.object({ messageId: z.uuid(), subjectType: z.enum(LINKABLE), subjectId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        unlink(tx, { ...input, actor: { id: ctx.user.id, initials: ctx.user.initials } })
      )
      .catch(safe)
    followUp(out)
    return { messageId: out.messageId }
  },
})

/** Board 95 "Use this email as": the class a link also sets ("Just keep" leaves the class alone). */
const USE_AS = {
  client_reply: 'client_reply',
  supplier_quote: 'supplier_quote',
  document: 'supplier_documents',
} as const

export const linkToAction = defineAction({
  name: 'mail.linkTo',
  schema: z.object({
    messageId: z.uuid(),
    subjectType: z.enum(LINKABLE),
    subjectId: z.uuid(),
    enquiryId: z.uuid().nullable(),
    alsoThread: z.boolean().default(true),
    choice: z.enum(['override', 'unsure_choice']).default('override'),
    useAs: z.enum(['client_reply', 'supplier_quote', 'document', 'just_keep']).default('just_keep'),
    /** A move: the message's other record links are retired (kept as history). */
    replace: z.boolean().default(true),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const actor = { id: ctx.user.id, initials: ctx.user.initials }
    const out = await ctx
      .withTx(async (tx) => {
        const linked = await linkTo(tx, {
          messageId: input.messageId,
          subjectType: input.subjectType,
          subjectId: input.subjectId,
          enquiryId: input.enquiryId,
          alsoThread: input.alsoThread,
          kind: input.choice,
          replace: input.replace,
          actor,
        })
        if (input.useAs === 'just_keep') return linked
        const typed = await changeType(tx, {
          messageId: input.messageId,
          cls: USE_AS[input.useAs],
          actor,
        })
        return { ...linked, events: [...linked.events, ...typed.events] }
      })
      .catch(safe)
    followUp(out)
    return { messageId: out.messageId }
  },
})

export const resolveUnsureAction = defineAction({
  name: 'mail.resolveUnsure',
  schema: z.object({
    messageId: z.uuid(),
    actionId: z.uuid(),
    option: z.string().min(1).max(120),
    companyId: z.uuid().nullable().default(null),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        resolveUnsure(tx, { ...input, actor: { id: ctx.user.id, initials: ctx.user.initials } })
      )
      .catch(safe)
    followUp(out)
    return {
      messageId: out.messageId,
      actionId: input.actionId,
      filedAs: out.filedAs,
      learned: out.learned,
    }
  },
})

export const undoResolutionAction = defineAction({
  name: 'mail.undoResolution',
  schema: z.object({ actionId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        undoResolution(tx, {
          actionId: input.actionId,
          actor: { id: ctx.user.id, initials: ctx.user.initials },
        })
      )
      .catch(safe)
    followUp({
      messageId: out.messageId,
      events: [{ name: 'ops/review.changed', data: { messageId: out.messageId } }],
    })
    return out
  },
})

export const replyAction = defineAction({
  name: 'mail.reply',
  schema: z.object({
    threadId: z.uuid(),
    to: z.array(z.email()).min(1).max(20),
    cc: z.array(z.email()).max(20).default([]),
    html: z.string().min(1).max(200_000),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await replyInThread({ user: ctx.user, ...input }).catch(safe)
    revalidatePath(PATH, 'layout')
    return out
  },
})
