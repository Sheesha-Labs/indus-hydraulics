import { budgetThresholds } from '../../server/autopilot/budget-jobs'
import { defineOpsFunction } from '../define'

/**
 * ops.budget.thresholds (S07-T04): after spend is recorded (ops/ai.spent, debounced 60 s), raises the 80 % and
 * 100 % notices once per month. Exempt from pause: a notice about money is never held.
 */
export const budgetThresholdsFn = defineOpsFunction(
  {
    id: 'ops.budget.thresholds',
    lane: 'house',
    retries: 2,
    pause: 'exempt',
    debounce: { period: '60s' },
  },
  { event: 'ops/ai.spent' },
  async ({ step }) => step.run('thresholds', () => budgetThresholds())
)
