import { applyLearnBatches } from '../../server/assistant/preferences'
import { defineOpsFunction } from '../define'

/**
 * ops.preferences.batch.poll (S07-T05): every 10 minutes; when a learner batch has ended, its results become
 * Preference rows (linted; duplicates strengthen) and its signals are marked consumed. Returns at once when no
 * batch is open. House lane; skipped while paused.
 */
export const preferencesBatchPoll = defineOpsFunction(
  { id: 'ops.preferences.batch.poll', lane: 'house', retries: 2, pause: 'skip' },
  { cron: '*/10 * * * *' },
  async ({ step }) => step.run('apply', () => applyLearnBatches())
)
