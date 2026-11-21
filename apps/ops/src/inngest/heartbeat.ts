import { opsDb } from '@indus/ops-db'
import { inngest } from './client'

/**
 * Proves the Inngest app is synced and running: every 10 minutes it stamps
 * settings_entry 'system.inngest_heartbeat'. /api/health reports the stamp. One
 * statement; no transaction held open.
 */
export const heartbeat = inngest.createFunction(
  { id: 'ops.system.heartbeat', concurrency: { limit: 1 }, retries: 0 },
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
