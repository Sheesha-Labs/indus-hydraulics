import { sweepReservations } from '../../server/autopilot/budget-jobs'
import { defineOpsFunction } from '../define'

/**
 * ops.budget.reservation.sweep (S07-T04): every 30 minutes, settles at zero any reservation a crashed call
 * left open for 30 minutes (moved here from the heartbeat), so a dead process never keeps money reserved.
 */
export const budgetReservationSweep = defineOpsFunction(
  { id: 'ops.budget.reservation.sweep', lane: 'house', retries: 2, pause: 'exempt' },
  { cron: '*/30 * * * *' },
  async ({ step }) => step.run('sweep', () => sweepReservations())
)
