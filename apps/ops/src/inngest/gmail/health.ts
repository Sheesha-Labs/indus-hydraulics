import { runHealthCheck } from '../../server/gmail/health'
import { defineOpsFunction } from '../define'

/**
 * ops.gmail.health (S04-T09): every five minutes, turn the stored sync facts into mailbox states (live, behind,
 * limit reached, backfill paused), the banner notifications and the Sentry alerts. Database only; no Gmail call.
 * retries 0: the next run is five minutes away. Runs while paused (it only reports).
 */
export const gmailHealth = defineOpsFunction(
  { id: 'ops.gmail.health', concurrency: [{ limit: 1 }], retries: 0, pause: 'exempt' },
  { cron: '*/5 * * * *' },
  async ({ step }) => step.run('check', () => runHealthCheck())
)
