'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { defineAction } from '../lib/define-action'
import { pauseAssistant, resumeAssistant } from '../server/assistant/state'

/**
 * "Pause everything" and "Resume" (S05-T08, C22, board 102 states 1–2). Owner only: a Helper calling either
 * gets the forbidden Result, and the UI never offers them. The pause row, its activity_event, the locked
 * `assistant_paused` notification and the ops/assistant.paused / resumed events live in
 * server/assistant/state.ts; resume releases every waiting run and re-gates held sends.
 */
export const pauseAssistantAction = defineAction({
  name: 'assistant.pause',
  schema: z.object({ note: z.string().trim().max(200).optional() }),
  roles: ['owner'],
  handler: async (input, ctx) => {
    // The events and the notification go after the response: the pause itself is the committed row.
    const out = await pauseAssistant(ctx.user.id, input.note ?? null, (work) => after(work))
    revalidatePath('/', 'layout')
    return { pausedAt: out.pausedAt.toISOString(), changed: out.changed }
  },
})

export const resumeAssistantAction = defineAction({
  name: 'assistant.resume',
  schema: z.object({}),
  roles: ['owner'],
  handler: async (_input, ctx) => {
    const out = await resumeAssistant(ctx.user.id, (work) => after(work))
    revalidatePath('/', 'layout')
    return { resumedAt: out.resumedAt.toISOString(), changed: out.changed }
  },
})
