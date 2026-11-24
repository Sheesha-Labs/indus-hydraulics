'use server'

import { randomUUID } from 'node:crypto'
import { err, ok, type Result } from '@indus/ops-core'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { getAssistantPanel, type AssistantPanelFeed } from '../data/assistant-panel'
import { requireOpsUser } from '../lib/access'
import { defineAction, SafeError } from '../lib/define-action'
import { isExpectedRefusal, SAFE_MESSAGES, safeMessage } from '../lib/safe-message'
import { requestActionQuietly } from '../server/assistant/request'
// Every action definition registers itself on import; requestAction needs `instruction` in the web server.
import '../server/assistant/actions'

/**
 * The Assistant panel (S06-T08, shell S03): the read behind its three sections, and `assistant.instruct`,
 * which turns typed text into an `instruction` request. The text never acts: it becomes a Review card
 * (maxLevel Draft and ask). Refused while paused or over budget, as the panel says.
 */
const refSchema = z
  .string()
  .regex(/^[A-Z0-9/-]{3,40}$/)
  .nullable()

export async function assistantPanelRead(
  recordRef: string | null
): Promise<Result<AssistantPanelFeed>> {
  if (!refSchema.safeParse(recordRef).success) return err(SAFE_MESSAGES.invalid)
  try {
    const user = await requireOpsUser()
    return ok(await getAssistantPanel(recordRef, user))
  } catch (e) {
    if (!isExpectedRefusal(e)) Sentry.captureException(e)
    return err(safeMessage(e))
  }
}

export const instructAction = defineAction({
  name: 'assistant.instruct',
  schema: z.object({
    recordRef: z.string().regex(/^ENQ-\d{4}-\d{4,}$/),
    text: z.string().trim().min(1, 'Type an instruction').max(1000),
  }),
  roles: ['owner', 'helper'],
  handler: async (input, ctx) => {
    const feed = await getAssistantPanel(input.recordRef, ctx.user)
    if (!feed.record) throw new SafeError('That record is not here.')
    if (feed.blocked) throw new SafeError(feed.blocked.text)
    const queued = await requestActionQuietly({
      actionKey: 'instruction',
      subjectType: feed.record.subjectType,
      subjectId: feed.record.subjectId,
      enquiryId: feed.record.subjectId,
      trigger: 'panel',
      origin: 'live',
      sourceVersion: `instruction:${randomUUID()}`,
      hint: input.text,
      requestedById: ctx.user.id,
    })
    if (!queued) throw new SafeError('The Assistant could not be reached. Try again shortly.')
    return { queued: true }
  },
})
