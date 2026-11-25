import { refreshSuggestions } from '../../server/autopilot/suggestions'
import { defineOpsFunction } from '../define'

/**
 * ops.autopilot.suggestions (S07-T02): nightly at 01:30 Dubai, earned suggestions for every configurable action
 * (25 clean approvals since its last level change → one level up, never for money). It never changes a level.
 * House lane; skipped while paused (it runs again the next night).
 */
export const autopilotSuggestions = defineOpsFunction(
  { id: 'ops.autopilot.suggestions', lane: 'house', retries: 2, pause: 'skip' },
  { cron: 'TZ=Asia/Dubai 30 1 * * *' },
  async ({ step }) => step.run('refresh', () => refreshSuggestions())
)
