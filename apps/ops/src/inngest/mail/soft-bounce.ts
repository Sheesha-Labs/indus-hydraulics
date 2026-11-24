import { settleSoftBounce } from '../../server/mail/bounce'
import { defineOpsFunction } from '../define'

/**
 * ops.mail.bounce.soft (S05-T07): a delivery delay is not a failure yet. Sleeps 24 h, then shows the bounce
 * (Needs you) only when that address has not written to us since. A sleeping run holds no lane slot.
 */
export const mailBounceSoft = defineOpsFunction(
  { id: 'ops.mail.bounce.soft', lane: 'house', retries: 2, pause: 'wait' },
  { event: 'ops/mail.bounce.soft' },
  async ({ event, step }) => {
    const data = event.data as { messageId: string; recipient: string | null; at: string }
    await step.sleep('wait-a-day', '24h')
    return step.run('settle', () => settleSoftBounce(data))
  }
)
