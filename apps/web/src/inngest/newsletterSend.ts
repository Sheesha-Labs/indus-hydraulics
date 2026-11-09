import { db } from '@indus/db'

import {
  BATCH_SIZE,
  MAX_BATCHES_PER_RUN,
  claimBatch,
  finishCampaign,
  pauseSeconds,
  sendBatch,
  skipRemaining,
  startCampaign,
} from '../lib/newsletter/send'
import { inngest } from './client'

export const NEWSLETTER_SEND_EVENT = 'newsletter/campaign.send'

export type NewsletterSendEvent = {
  campaignId: string
  /** Set for a scheduled send: the run only proceeds if the campaign is still scheduled for exactly this time. */
  scheduledAt?: string
  /** A follow-on run after MAX_BATCHES_PER_RUN; skips the start. */
  continuation?: boolean
}

/**
 * Sends one newsletter campaign, paced.
 *
 * start (snapshot the audience) → { claim 100 → send them → pause } … →
 * finish. Claim and send are separate steps on purpose: Inngest memoises
 * the claim, so a retried send works on the same deliveries with the same
 * Resend idempotency key (lib/newsletter/send.ts). Cancelling a campaign
 * stops it at the next batch. One run per campaign at a time.
 */
export const newsletterCampaignSend = inngest.createFunction(
  {
    id: 'newsletter.campaign.send',
    // One run per campaign; the plan's cap is 5 across the app.
    concurrency: { key: 'event.data.campaignId', limit: 1 },
    retries: 2,
  },
  { event: NEWSLETTER_SEND_EVENT },
  async ({ event, step, attempt }) => {
    const { campaignId, scheduledAt, continuation } = event.data as NewsletterSendEvent

    if (!continuation) {
      const started = await step.run('start', async () => {
        if (scheduledAt) {
          // A rescheduled or unscheduled campaign leaves its old event in
          // flight; it must do nothing.
          const c = await db.newsletterCampaign.findUnique({ where: { id: campaignId }, select: { status: true, scheduledAt: true } })
          if (c?.status !== 'scheduled' || c.scheduledAt?.toISOString() !== scheduledAt) return null
        }
        return startCampaign(campaignId)
      })
      if (started === null) return { campaignId, skipped: 'not startable' }
    }

    const paceRow = await step.run('pace', () =>
      db.newsletterCampaign.findUnique({ where: { id: campaignId }, select: { maxPerHour: true } }),
    )
    const pause = pauseSeconds(paceRow?.maxPerHour ?? 600)

    let totals = { sent: 0, skipped: 0, failed: 0 }
    for (let i = 0; i < MAX_BATCHES_PER_RUN; i++) {
      const claim = await step.run(`claim-${i}`, async () => {
        const c = await db.newsletterCampaign.findUnique({ where: { id: campaignId }, select: { status: true } })
        if (c?.status === 'cancelled') return { cancelled: true, ids: [] as string[] }
        return { cancelled: false, ids: await claimBatch(campaignId, BATCH_SIZE) }
      })
      if (claim.cancelled) {
        await step.run('cancelled', () => skipRemaining(campaignId))
        break
      }
      if (claim.ids.length === 0) break

      const r = await step.run(`send-${i}`, () => sendBatch(campaignId, claim.ids, attempt))
      totals = { sent: totals.sent + r.sent, skipped: totals.skipped + r.skipped, failed: totals.failed + r.failed }

      if (claim.ids.length < BATCH_SIZE) break
      await step.sleep(`pause-${i}`, `${pause}s`)

      if (i === MAX_BATCHES_PER_RUN - 1) {
        await step.sendEvent('continue', { name: NEWSLETTER_SEND_EVENT, data: { campaignId, continuation: true } })
        return { campaignId, ...totals, continued: true }
      }
    }

    const closed = await step.run('finish', () => finishCampaign(campaignId))
    return { campaignId, ...totals, closed }
  },
)
