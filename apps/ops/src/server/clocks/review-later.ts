import 'server-only'
import { opsDb } from '@indus/ops-db'
import { setCounters } from '../assistant/live-counter'
import { isStale } from '../assistant/staleness'
import { setActor } from '../assistant/write-tracked'
import { registerClock } from './registry'

/**
 * 'review.later' (S06-T03): a Later card whose time has come returns to the queue, "Back from Later". One that
 * went stale meanwhile comes back stale, so it is redrafted before anyone can approve it ("A send that would go
 * stale meanwhile is redrafted first").
 */
registerClock<{ id: string }>({
  key: 'review.later',
  async due(now, limit) {
    return opsDb.assistantAction.findMany({
      where: { state: 'later', laterUntil: { lte: now } },
      orderBy: { laterUntil: 'asc' },
      take: limit,
      select: { id: true },
    })
  },
  async fire(item) {
    const s = await isStale(item.id)
    const moved = await opsDb.$transaction(async (tx) => {
      await setActor(tx, { kind: 'system' })
      const { count } = await tx.assistantAction.updateMany({
        where: { id: item.id, state: 'later' },
        data: {
          state: 'proposed',
          ...(s.stale
            ? {
                staleAt: new Date(),
                staleReason: s.reason ?? 'The record changed while it waited.',
              }
            : {}),
        },
      })
      return count
    })
    if (moved) {
      const pending = await opsDb.assistantAction.count({
        where: { surface: 'review', state: { in: ['proposed', 'later'] } },
      })
      await setCounters({ 'review.pending': pending })
    }
    return moved ? (s.stale ? 'back_stale' : 'back') : 'skipped'
  },
})
