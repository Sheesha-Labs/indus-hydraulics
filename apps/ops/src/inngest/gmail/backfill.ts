import { backfillStep, bulkQuietUntil, startBackfill } from '../../server/gmail/backfill'
import { defineOpsFunction } from '../define'

/**
 * ops.gmail.backfill (S04-T05, 08-map-integrations §1.7, §9.2): one bounded unit of past-mail work per run, then
 * it asks for the next (`ops/gmail.backfill.continue`). One run per mailbox at a time; the 'backfill' quota
 * bucket (3,000 units a minute) paces the Gmail calls. Never within an hour of a storefront deploy or IndexNow
 * burst (ops.bulk_quiet_until). Pause: wait (the backfill resumes where it stopped).
 */
export const gmailBackfill = defineOpsFunction(
  {
    id: 'ops.gmail.backfill',
    concurrency: { key: 'event.data.mailboxId', limit: 1 },
    retries: 5,
    pause: 'wait',
  },
  [{ event: 'ops/gmail.backfill.requested' }, { event: 'ops/gmail.backfill.continue' }],
  async ({ event, step }) => {
    const mailboxId = String(event.data.mailboxId)
    if (event.name === 'ops/gmail.backfill.requested') {
      const months = Number(event.data.months) === 24 ? 24 : 12
      await step.run('start', () => startBackfill(mailboxId, months))
    }
    const quiet = await step.run('quiet-window', () => bulkQuietUntil())
    if (quiet) await step.sleepUntil('wait-for-quiet', quiet)
    const result = await step.run('work', () => backfillStep(mailboxId))
    if (!result.done) {
      await step.sendEvent('continue', { name: 'ops/gmail.backfill.continue', data: { mailboxId } })
    }
    return {
      done: result.done,
      phase: result.state?.phase ?? null,
      eta: result.state?.etaMinutes ?? null,
    }
  }
)
