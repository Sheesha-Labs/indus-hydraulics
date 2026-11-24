import { routeClassified, routeReceived } from '../../server/mail/router'
import { defineOpsFunction } from '../define'

// Action modules register themselves on import (requestAction looks up the definition).
import '../../server/assistant/actions'

/**
 * ops.mail.route (S05-T04): turns mail events into Assistant actions (server/mail/router.ts). It only
 * requests, except a bounce, which it marks itself (server/mail/bounce.ts), so it waits while the Assistant
 * is paused (S05-T07) as the runner does.
 */
export const mailRoute = defineOpsFunction(
  { id: 'ops.mail.route', lane: 'live', retries: 3, pause: 'wait' },
  [{ event: 'ops/mail.received' }, { event: 'ops/mail.classified' }],
  async ({ event, step }) => {
    const data = event.data as {
      messageId: string
      origin?: string
      class?: string
      actionId?: string
    }
    if (event.name === 'ops/mail.received') return step.run('classify', () => routeReceived(data))
    return step.run('route-classified', () => routeClassified(data))
  }
)
