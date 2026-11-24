import { opsDb } from '@indus/ops-db'
import { defineOpsFunction } from './define'

/**
 * Proves the Inngest app is synced and running: every 10 minutes it stamps
 * settings_entry 'system.inngest_heartbeat'. /api/health reports the stamp. One
 * statement; no transaction held open.
 *
 * (S07-T04: settling stale AI budget reservations moved to ops.budget.reservation.sweep.)
 */
export const heartbeat = defineOpsFunction(
  { id: 'ops.system.heartbeat', lane: 'house', retries: 0, pause: 'exempt' },
  { cron: 'TZ=Asia/Dubai */10 * * * *' },
  async () => {
    const at = new Date().toISOString()
    await opsDb.settingsEntry.upsert({
      where: { key: 'system.inngest_heartbeat' },
      create: { key: 'system.inngest_heartbeat', value: { at } },
      update: { value: { at } },
    })
    return { at }
  }
)
