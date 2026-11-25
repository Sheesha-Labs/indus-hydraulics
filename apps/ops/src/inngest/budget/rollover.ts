import { rolloverBudget } from '../../server/autopilot/budget-jobs'
import { defineOpsFunction } from '../define'

/** ops.budget.rollover (S07-T04): the new month's ai_budget row from settings, 00:05 Dubai on the 1st. */
export const budgetRollover = defineOpsFunction(
  { id: 'ops.budget.rollover', lane: 'house', retries: 2, pause: 'exempt' },
  { cron: 'TZ=Asia/Dubai 5 0 1 * *' },
  async ({ step }) => step.run('rollover', () => rolloverBudget())
)
