import { opsDb } from '@indus/ops-db'
import { releaseStaleReservations } from '../server/assistant/ai-ledger'
import { defineOpsFunction } from './define'

/**
 * Proves the Inngest app is synced and running: every 10 minutes it stamps
 * settings_entry 'system.inngest_heartbeat'. /api/health reports the stamp. One
 * statement; no transaction held open.
 *
 * S05-T01: it also settles, at zero, any AI budget reservation a crashed call left open for 30 minutes, so
 * a dead process never keeps money reserved. Two statements, each on its own.
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
    const releasedReservations = await releaseStaleReservations(30)
    return { at, releasedReservations }
  }
)
