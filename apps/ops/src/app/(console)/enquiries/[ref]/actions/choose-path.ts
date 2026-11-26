'use server'

import { QUALIFY_PATHS } from '@indus/ops-core'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { emitEvent } from '../../../../../inngest/emit'
import { defineAction } from '../../../../../lib/define-action'
import { SafeError } from '../../../../../lib/safe-message'
import {
  ChoosePathError,
  choosePath,
  markQuickReadAsked,
  undoSpam,
} from '../../../../../server/enquiry/choose-path'
import { TransitionRefused, VersionConflict } from '../../../../../server/enquiry/transition'
import type { EffectEvent } from '../../../../../server/assistant/types'
import { requestActionQuietly } from '../../../../../server/assistant/request'
import '../../../../../server/assistant/actions'

/** A refusal the person can act on comes back as its own sentence; anything else stays generic. */
function refusal(e: unknown): never {
  if (
    e instanceof ChoosePathError ||
    e instanceof VersionConflict ||
    e instanceof TransitionRefused
  )
    throw new SafeError(e.message)
  throw e
}

async function send(events: readonly EffectEvent[]) {
  for (const ev of events)
    await emitEvent({ name: ev.name, ...(ev.id ? { id: ev.id } : {}), data: ev.data })
}

/**
 * Board 167 · "Choose path" (S09-T06). Owner and Helper. Chosen once; the drafts it asks for arrive in Review
 * and nothing is sent on choose. The requests go out after the transaction commits.
 */
export const choosePathAction = defineAction({
  name: 'enquiry.path.choose',
  schema: z.object({
    enquiryId: z.uuid(),
    path: z.enum(QUALIFY_PATHS),
    lineNos: z.array(z.number().int().min(1)).max(500).optional(),
    version: z.number().int().min(0),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        choosePath(tx, {
          ...input,
          actor: {
            id: ctx.user.id,
            initials: ctx.user.initials,
            role: ctx.user.role === 'owner' ? 'owner' : 'helper',
          },
        })
      )
      .catch(refusal)
    await send(out.emit)
    revalidatePath(`/enquiries/${out.ref}`, 'layout')
    revalidatePath('/enquiries')
    if (out.path === 'ignore_spam') revalidatePath('/mail')
    return { ref: out.ref, path: out.path, undoUntil: out.undoUntil }
  },
})

/** 171b state 3 · "Undo · treat as enquiry", inside the 5-minute window. */
export const undoSpamAction = defineAction({
  name: 'enquiry.path.undoSpam',
  schema: z.object({ enquiryId: z.uuid() }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const out = await ctx
      .withTx((tx) =>
        undoSpam(tx, {
          enquiryId: input.enquiryId,
          actor: { id: ctx.user.id, initials: ctx.user.initials },
        })
      )
      .catch(refusal)
    await send(out.emit)
    revalidatePath(`/enquiries/${out.ref}`, 'layout')
    revalidatePath('/enquiries')
    revalidatePath('/mail')
    return { ref: out.ref }
  },
})

/**
 * "Read it now": a quick read for an enquiry that has none (made before S09, or the run failed). A new source
 * version, so it is a new action; the card shows "reading" until it lands.
 */
export const requestQuickReadAction = defineAction({
  name: 'enquiry.qualify.request',
  schema: z.object({ enquiryId: z.uuid(), ref: z.string().regex(/^ENQ-\d{4}-\d{4,}$/) }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    await ctx
      .withTx((tx) =>
        markQuickReadAsked(tx, {
          enquiryId: input.enquiryId,
          actor: { id: ctx.user.id, initials: ctx.user.initials },
        })
      )
      .catch(refusal)
    const ok = await requestActionQuietly({
      actionKey: 'qualify_enquiry',
      subjectType: 'enquiry',
      subjectId: input.enquiryId,
      enquiryId: input.enquiryId,
      trigger: 'person',
      origin: 'live',
      sourceVersion: `${input.ref}:asked:${Date.now()}`,
      requestedById: ctx.user.id,
    })
    if (!ok) throw new SafeError('The Assistant could not be reached. Try again in a moment.')
    revalidatePath(`/enquiries/${input.ref}`, 'layout')
    return { requested: true }
  },
})
