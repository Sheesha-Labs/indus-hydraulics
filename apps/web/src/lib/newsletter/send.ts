import 'server-only'
import { createHash } from 'node:crypto'
import { db, Prisma } from '@indus/db'
import { sendCampaignBatch, type SendEmailInput } from '@indus/email'

import { BASE_URL } from '../seo'
import { campaignRecordRefs, renderCampaign, type CampaignContent } from './campaign'
import { campaignBrand, loadSender } from './campaigns'
import { listUnsubscribeHeaders, newsletterUnsubscribePageUrl } from './links'
import { resolveRecords } from './records'
import { newsletterEmailHash } from './tokens'

/**
 * The newsletter sender — the pieces the Inngest function
 * (inngest/newsletterSend.ts) strings together: start a campaign (snapshot
 * the audience), claim a batch, send it, finish.
 *
 * Duplicate sends (Bazar bug 4) are prevented in two places:
 * - a batch is claimed in one Inngest step and sent in the next, so a
 *   retried send step works on exactly the same deliveries, and the Resend
 *   idempotency key is derived from their ids — Resend answers a repeat of
 *   an accepted batch without sending it again;
 * - a delivery left in `sending` by a run that died is never re-sent
 *   automatically; `finishCampaign` marks it failed (outcome unknown).
 */

export const BATCH_SIZE = 100
/** A run hands over to a fresh run after this many batches (Inngest caps steps per run). */
export const MAX_BATCHES_PER_RUN = 250
/** How long a claimed row may sit in `sending` before it counts as orphaned. */
export const ORPHAN_AFTER_MS = 30 * 60 * 1000
/** Send attempts per batch before its deliveries are marked failed. */
export const MAX_SEND_ATTEMPTS = 3

export const PACE_OPTIONS = [300, 600, 1200, 3000, 6000] as const

/** Seconds to wait between batches of 100 to stay under `maxPerHour`. */
export function pauseSeconds(maxPerHour: number): number {
  const batchesPerHour = Math.max(1, maxPerHour / BATCH_SIZE)
  return Math.max(1, Math.ceil(3600 / batchesPerHour))
}

/** The Resend idempotency key for a batch: stable for the same deliveries, in any order. */
export function batchKey(campaignId: string, deliveryIds: string[]): string {
  const h = createHash('sha256').update(`${campaignId}:${[...deliveryIds].sort().join(',')}`).digest('hex')
  return `newsletter-${h.slice(0, 48)}`
}

/**
 * Snapshot the audience and mark the campaign sending. Null when it was not
 * draft/scheduled — a second click, or a stale scheduled event.
 *
 * Raw SQL (CLAUDE.md §5.3): the snapshot is one set-wise statement in a
 * database function so it is atomic and needs no address in Node.
 */
export async function startCampaign(campaignId: string): Promise<number | null> {
  const rows = await db.$queryRaw<{ n: number | null }[]>(Prisma.sql`SELECT public.newsletter_start_campaign(${campaignId}) AS n`)
  return rows[0]?.n ?? null
}

/** Claim up to `n` queued deliveries of one campaign. Returns their ids. */
export async function claimBatch(campaignId: string, n = BATCH_SIZE): Promise<string[]> {
  const rows = await db.$queryRaw<{ id: string }[]>(
    Prisma.sql`SELECT id FROM public.newsletter_claim_deliveries(${campaignId}, ${n})`,
  )
  return rows.map((r) => r.id)
}

export type BatchOutcome = { sent: number; skipped: number; failed: number }

/**
 * Send one claimed batch. Only deliveries still `sending` are touched, so a
 * retry after a partial success does nothing twice. Throws on a provider
 * failure while attempts remain (Inngest retries the step); on the last
 * attempt marks the batch failed instead.
 */
export async function sendBatch(campaignId: string, deliveryIds: string[], attempt = 0): Promise<BatchOutcome> {
  const out: BatchOutcome = { sent: 0, skipped: 0, failed: 0 }
  if (deliveryIds.length === 0) return out

  const campaign = await db.newsletterCampaign.findUnique({
    where: { id: campaignId },
    select: { status: true, subject: true, preheader: true, format: true, design: true, bodyHtml: true, dryRun: true },
  })
  const deliveries = await db.newsletterDelivery.findMany({
    where: { id: { in: deliveryIds }, campaignId, status: 'sending' },
    select: {
      id: true,
      subscriber: { select: { email: true, status: true, unsubscribeToken: true } },
      contact: { select: { email: true, status: true, unsubscribeToken: true } },
    },
  })
  if (!campaign || deliveries.length === 0) return out

  if (campaign.status === 'cancelled') {
    const r = await db.newsletterDelivery.updateMany({
      where: { id: { in: deliveries.map((d) => d.id) }, status: 'sending' },
      data: { status: 'skipped', error: 'Campaign cancelled' },
    })
    return { ...out, skipped: r.count }
  }

  // Still mailable right now? Someone may have left since the snapshot.
  const hashes = deliveries.map((d) => newsletterEmailHash((d.subscriber ?? d.contact)!.email))
  const suppressed = new Set(
    (await db.newsletterSuppression.findMany({ where: { emailHash: { in: hashes } }, select: { emailHash: true } })).map((s) => s.emailHash),
  )

  const content: CampaignContent = {
    subject: campaign.subject,
    preheader: campaign.preheader,
    format: campaign.format === 'rich' ? 'rich' : 'blocks',
    design: campaign.design,
    bodyHtml: campaign.bodyHtml,
  }
  const [records, brand, sender] = await Promise.all([resolveRecords(campaignRecordRefs(content)), campaignBrand(), loadSender()])

  const skip: string[] = []
  const sendable: { id: string; input: SendEmailInput }[] = []
  deliveries.forEach((d, i) => {
    const person = d.subscriber ?? d.contact
    const active = d.subscriber ? d.subscriber.status === 'confirmed' : d.contact?.status === 'active'
    if (!person || !active || suppressed.has(hashes[i]!)) {
      skip.push(d.id)
      return
    }
    const rendered = renderCampaign(content, {
      siteUrl: BASE_URL,
      brand,
      records,
      unsubscribeUrl: newsletterUnsubscribePageUrl(BASE_URL, person.unsubscribeToken),
      recipient: d.subscriber ? 'subscriber' : 'list',
    })
    sendable.push({
      id: d.id,
      input: {
        kind: 'newsletter_campaign',
        to: [person.email],
        fromEmail: sender.fromEmail,
        fromName: sender.fromName,
        replyTo: sender.replyTo,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        headers: listUnsubscribeHeaders(BASE_URL, person.unsubscribeToken),
      },
    })
  })

  if (skip.length) {
    out.skipped = (
      await db.newsletterDelivery.updateMany({
        where: { id: { in: skip }, status: 'sending' },
        data: { status: 'skipped', error: 'Unsubscribed, bounced or suppressed since the send started' },
      })
    ).count
  }
  if (sendable.length === 0) return out

  const now = new Date()
  if (campaign.dryRun) {
    // A rehearsal: everything but the call to Resend.
    out.sent = (
      await db.newsletterDelivery.updateMany({
        where: { id: { in: sendable.map((s) => s.id) }, status: 'sending' },
        data: { status: 'sent', sentAt: now, error: 'Dry run — not sent' },
      })
    ).count
    return out
  }

  const result = await sendCampaignBatch(
    sendable.map((s) => s.input),
    // Keyed on the CLAIMED set, which a retry of this step always has. If a
    // retry would send a different payload (someone left in between), Resend
    // refuses the reused key instead of sending — a failed batch, never a
    // duplicate.
    { idempotencyKey: batchKey(campaignId, deliveryIds) },
  )
  if (!result.ok) {
    if (attempt + 1 < MAX_SEND_ATTEMPTS) throw new Error(`Resend batch failed: ${result.error}`)
    out.failed = (
      await db.newsletterDelivery.updateMany({
        where: { id: { in: sendable.map((s) => s.id) }, status: 'sending' },
        data: { status: 'failed', error: result.error.slice(0, 500) },
      })
    ).count
    return out
  }

  await db.$transaction(
    sendable.map((s, i) =>
      db.newsletterDelivery.updateMany({
        where: { id: s.id, status: 'sending' },
        data: { status: 'sent', sentAt: now, providerId: result.providerIds[i] ?? null, error: null },
      }),
    ),
  )
  out.sent = sendable.length
  return out
}

/** A cancelled campaign: everything not yet sent is skipped. */
export async function skipRemaining(campaignId: string): Promise<number> {
  const r = await db.newsletterDelivery.updateMany({
    where: { campaignId, status: 'queued' },
    data: { status: 'skipped', error: 'Campaign cancelled' },
  })
  return r.count
}

/**
 * Close a campaign once nothing is queued: orphaned `sending` rows become
 * failed (their outcome is unknown, so they are not re-sent), and the
 * campaign is marked sent unless it was cancelled. Returns whether it closed.
 */
export async function finishCampaign(campaignId: string, now = new Date()): Promise<boolean> {
  await db.newsletterDelivery.updateMany({
    where: { campaignId, status: 'sending', claimedAt: { lt: new Date(now.getTime() - ORPHAN_AFTER_MS) } },
    data: { status: 'failed', error: 'Outcome unknown — the send was interrupted; not retried to avoid a duplicate' },
  })
  const open = await db.newsletterDelivery.count({ where: { campaignId, status: { in: ['queued', 'sending'] } } })
  if (open > 0) return false
  await db.newsletterCampaign.updateMany({
    where: { id: campaignId, status: 'sending' },
    data: { status: 'sent', sentAt: now, updatedAt: now },
  })
  return true
}

export type DeliveryCounts = Record<'queued' | 'sending' | 'sent' | 'failed' | 'skipped', number> & {
  delivered: number
  bounced: number
  complained: number
  total: number
}

export async function deliveryCounts(campaignId: string): Promise<DeliveryCounts> {
  const [groups, delivered, bounced, complained] = await Promise.all([
    db.newsletterDelivery.groupBy({ by: ['status'], where: { campaignId }, _count: { _all: true } }),
    db.newsletterDelivery.count({ where: { campaignId, deliveredAt: { not: null } } }),
    db.newsletterDelivery.count({ where: { campaignId, bouncedAt: { not: null } } }),
    db.newsletterDelivery.count({ where: { campaignId, complainedAt: { not: null } } }),
  ])
  const c: DeliveryCounts = { queued: 0, sending: 0, sent: 0, failed: 0, skipped: 0, delivered, bounced, complained, total: 0 }
  for (const g of groups) {
    c[g.status as keyof Omit<DeliveryCounts, 'delivered' | 'bounced' | 'complained' | 'total'>] = g._count._all
    c.total += g._count._all
  }
  return c
}
