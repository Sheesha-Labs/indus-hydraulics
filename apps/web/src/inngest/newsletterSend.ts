import { db } from '@indus/db'

import {
  BATCH_SIZE,
  MAX_BATCHES_PER_RUN,
  ORPHAN_AFTER_MS,
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
    /**
     * Retries exhausted (a database outage mid-send): close the campaign as
     * cancelled and skip what was not sent, so it never sits in `sending`
     * with nothing behind it. Sending the event again would resume it, but a
     * person should decide that — the report shows what went.
     */
    onFailure: async ({ event, error }) => {
      const { campaignId } = (event.data?.event?.data ?? {}) as Partial<NewsletterSendEvent>
      if (!campaignId) return
      console.error('[newsletter] send failed', campaignId, error?.message)
      await db.newsletterDelivery.updateMany({
        where: { campaignId, status: 'queued' },
        data: { status: 'skipped', error: 'The send stopped on an error' },
      })
      await db.newsletterCampaign.updateMany({
        where: { id: campaignId, status: 'sending' },
        data: { status: 'cancelled', cancelledAt: new Date() },
      })
    },
  },
  { event: NEWSLETTER_SEND_EVENT },
  async ({ event, step, attempt }) => {
    const { campaignId, scheduledAt, continuation } = event.data as NewsletterSendEvent

    if (!continuation) {
      const started = await step.run('start', async () => {
        const c = await db.newsletterCampaign.findUnique({ where: { id: campaignId }, select: { status: true, scheduledAt: true } })
        // Already started with rows still queued: this step's own first
        // attempt committed and its answer was lost, or an earlier run died.
        // Resume — claims take queued rows only, and one run per campaign
        // runs at a time, so nothing is sent twice.
        if (c?.status === 'sending') {
          const queued = await db.newsletterDelivery.count({ where: { campaignId, status: 'queued' } })
          return queued > 0 ? queued : null
        }
        // A rescheduled or unscheduled campaign leaves its old event in
        // flight; it must do nothing.
        if (scheduledAt && (c?.status !== 'scheduled' || c.scheduledAt?.toISOString() !== scheduledAt)) return null
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

    let closed = await step.run('finish', () => finishCampaign(campaignId))
    if (!closed) {
      // Rows still `sending` are younger than the orphan cut-off (a claim
      // whose answer was lost). Wait until they count as orphaned, then close
      // — they are failed, not re-sent.
      await step.sleep('wait-for-orphans', `${Math.ceil(ORPHAN_AFTER_MS / 1000) + 60}s`)
      closed = await step.run('finish-again', () => finishCampaign(campaignId))
    }
    return { campaignId, ...totals, closed }
  },
)
