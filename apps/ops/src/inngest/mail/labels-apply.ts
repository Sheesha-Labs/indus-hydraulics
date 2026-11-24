import { Prisma } from '@indus/ops-db'
import { recordLatency } from '../../server/assistant/latency'
import { applyLabels, planLabels, recordLabels } from '../../server/mail/labels-apply'
import { defineOpsFunction } from '../define'

/**
 * ops.gmail.labels.apply (S05-T04, action #3): after a message is classified or linked, its `Indus/*` labels
 * follow. plan (DB) → modify (Gmail) → record (DB): no connection held across the Gmail call. One run per
 * message at a time; a repeat with nothing to change does nothing.
 */
export const gmailLabelsApply = defineOpsFunction(
  {
    id: 'ops.gmail.labels.apply',
    lane: 'live',
    perKey: { key: 'event.data.messageId', limit: 1 },
    retries: 4,
    pause: 'wait',
  },
  [{ event: 'ops/mail.classified' }, { event: 'ops/mail.linked' }, { event: 'ops/review.changed' }],
  async ({ event, step }) => {
    const messageId = String(event.data.messageId ?? '')
    if (!messageId) return { skipped: 'no message' }
    const plan = await step.run('plan', () => planLabels(messageId))
    if (plan.skipped) return { skipped: plan.skipped }
    await step.run('modify', () => applyLabels(plan))
    const actionId = await step.run('record', async () => {
      try {
        return await recordLabels(plan)
      } catch (e) {
        // The same change set was already recorded (a replayed step): nothing more to do.
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return null
        throw e
      }
    })
    // S05-T09: the first label on live mail ends the pipeline's clock for that message.
    if (actionId) await step.run('latency', () => recordLatency(messageId))
    return { actionId, add: plan.add.length, remove: plan.remove.length }
  }
)
