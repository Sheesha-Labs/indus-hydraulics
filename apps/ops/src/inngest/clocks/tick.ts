import { clockKeys, runClock } from '../../server/clocks/registry'
import { defineOpsFunction } from '../define'

import '../../server/clocks'

/**
 * ops.clocks.tick (S06-T03): every 15 minutes, each registered clock in its own step (≤ 200 items each). A cron
 * that runs again soon: skipped while paused.
 */
export const clocksTick = defineOpsFunction(
  { id: 'ops.clocks.tick', lane: 'house', retries: 2, pause: 'skip' },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    const out: Record<string, Record<string, number>> = {}
    for (const key of clockKeys()) out[key] = await step.run(`clock-${key}`, () => runClock(key))
    return out
  }
)
