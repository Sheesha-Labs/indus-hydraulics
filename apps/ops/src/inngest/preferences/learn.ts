import { startLearning } from '../../server/assistant/preferences'
import { defineOpsFunction } from '../define'

/**
 * ops.preferences.learn (S07-T05): 01:00 Dubai, unconsumed signals grouped deterministically; groups of three or
 * more go to the model as one Message Batches submission (budget reserved first). House lane; skipped while
 * paused (the next night picks the signals up).
 */
export const preferencesLearn = defineOpsFunction(
  { id: 'ops.preferences.learn', lane: 'house', retries: 2, pause: 'skip' },
  { cron: 'TZ=Asia/Dubai 0 1 * * *' },
  async ({ step }) => step.run('submit', () => startLearning())
)
