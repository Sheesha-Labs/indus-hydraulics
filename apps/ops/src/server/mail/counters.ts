import 'server-only'
import { opsDb } from '@indus/ops-db'
import { setCounters } from '../assistant/live-counter'

/**
 * The Mail badges (S05-T04, C24): recounted from mail_message after each classify, link or person's change,
 * so a missed bump never drifts. Two indexed queries (handledState, sentAt). Live mail only: backfilled and
 * imported history is never counted as waiting for anyone.
 */
export async function recountMailCounters(now = new Date()): Promise<void> {
  const startOfDubaiDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), -4) +
      (now.getUTCHours() >= 20 ? 86_400_000 : 0)
  )
  const [byState, today] = await Promise.all([
    opsDb.mailMessage.groupBy({
      by: ['handledState'],
      where: {
        direction: 'inbound',
        origin: 'live',
        handledState: { in: ['unsure', 'not_linked', 'needs_you'] },
      },
      _count: { _all: true },
    }),
    opsDb.mailMessage.count({
      where: { direction: 'inbound', origin: 'live', receivedAt: { gte: startOfDubaiDay } },
    }),
  ])
  const n = (s: string) => byState.find((r) => r.handledState === s)?._count._all ?? 0
  await setCounters({
    'mail.unsure': n('unsure'),
    'mail.not_linked': n('not_linked'),
    'mail.needs_you': n('needs_you'),
    'mail.today': today,
  })
}
