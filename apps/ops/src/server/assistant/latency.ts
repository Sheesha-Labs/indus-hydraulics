import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { isDeskHours, LATENCY_WINDOW, latencyBreached, latencyStats } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { holidaysFor } from '../mail-send/slot'
import { getSetting } from '../settings/get'
import { readCounters, setCounters } from './live-counter'

/**
 * Pipeline latency (S05-T09, exit criterion "classified, linked and labelled within 2 minutes"): when #3
 * first labels a live message, its firstLabelledAt is set; p50 / p95 of receivedAt → firstLabelledAt over the
 * last LATENCY_WINDOW such messages go to live_counter (mail.latency_p50_s, mail.latency_p95_s) and
 * /api/health. Over 180 s at p95 during desk hours, Sentry hears about it.
 */
export async function recordLatency(
  messageId: string,
  now = new Date()
): Promise<{
  p50: number | null
  p95: number | null
  count: number
} | null> {
  const first = await opsDb.mailMessage.updateMany({
    where: { id: messageId, origin: 'live', direction: 'inbound', firstLabelledAt: null },
    data: { firstLabelledAt: now },
  })
  if (first.count === 0) return null
  const rows = await opsDb.mailMessage.findMany({
    where: { firstLabelledAt: { not: null }, origin: 'live', direction: 'inbound' },
    orderBy: { firstLabelledAt: 'desc' },
    take: LATENCY_WINDOW,
    select: { receivedAt: true, firstLabelledAt: true },
  })
  const stats = latencyStats(
    rows.map((r) => (r.firstLabelledAt!.getTime() - r.receivedAt.getTime()) / 1000)
  )
  await setCounters({
    'mail.latency_p50_s': stats.p50 ?? 0,
    'mail.latency_p95_s': stats.p95 ?? 0,
    'mail.latency_n': stats.count,
  })
  if (latencyBreached(stats)) {
    const [holidays, weekends] = await Promise.all([
      holidaysFor(['AE'], now, 2),
      getSetting('calendar.country_weekends'),
    ])
    if (isDeskHours(now, holidays, weekends)) {
      Sentry.captureMessage('Mail pipeline p95 latency above 180 s', {
        level: 'warning',
        tags: { area: 'assistant', job: 'latency' },
        fingerprint: ['ops-mail-latency-p95'],
        extra: stats,
      })
    }
  }
  return stats
}

export async function readLatency(): Promise<{
  p50: number | null
  p95: number | null
  count: number
}> {
  const c = await readCounters(['mail.latency_p50_s', 'mail.latency_p95_s', 'mail.latency_n'])
  const n = c['mail.latency_n'] ?? 0
  return n
    ? { p50: c['mail.latency_p50_s'] ?? 0, p95: c['mail.latency_p95_s'] ?? 0, count: n }
    : { p50: null, p95: null, count: 0 }
}
