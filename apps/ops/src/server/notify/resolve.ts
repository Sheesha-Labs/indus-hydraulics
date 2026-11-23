import 'server-only'
import { opsDb } from '@indus/ops-db'

/** Resolve every open notification with this key (the thing it reported has been dealt with). */
export async function resolveNotifications(dedupeKey: string, now = new Date()): Promise<number> {
  const { count } = await opsDb.notification.updateMany({
    where: { dedupeKey, resolvedAt: null },
    data: { resolvedAt: now },
  })
  return count
}
