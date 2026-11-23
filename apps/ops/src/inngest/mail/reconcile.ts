import { reconcileSweep } from '../../server/mail-send/reconcile'
import { defineOpsFunction } from '../define'

/**
 * ops.mail.send.reconcile (S04-T06, ADR-07): every 15 minutes, look again for `unknown` sends in Sent, read back
 * missing RFC Message-IDs and re-request rows stranded in `scheduled`. It never sends: a found row becomes `sent`,
 * a missing one stays `unknown` for a person (Resend or Mark as sent). Runs while paused (it only reads Gmail and
 * records what it finds; re-requested rows meet the gate, which holds them).
 */
export const mailSendReconcile = defineOpsFunction(
  {
    id: 'ops.mail.send.reconcile',
    retries: 2,
    lane: 'house',
    pause: 'exempt',
  },
  { cron: '*/15 * * * *' },
  async ({ step }) => step.run('sweep', () => reconcileSweep())
)
