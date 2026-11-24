import { routeClassified, routeReceived } from '../../server/mail/router'
import { defineOpsFunction } from '../define'

// Action modules register themselves on import (requestAction looks up the definition).
import '../../server/assistant/actions'

/**
 * ops.mail.route (S05-T04): turns mail events into Assistant actions (server/mail/router.ts). It only
 * requests; the runner (ops.assistant.run) waits while the Assistant is paused, so this function is exempt.
 */
export const mailRoute = defineOpsFunction(
  { id: 'ops.mail.route', lane: 'live', retries: 3, pause: 'exempt' },
  [{ event: 'ops/mail.received' }, { event: 'ops/mail.classified' }],
  async ({ event, step }) => {
    const data = event.data as { messageId: string; origin?: string; class?: string }
    if (event.name === 'ops/mail.received') return step.run('classify', () => routeReceived(data))
    return step.run('link', () => routeClassified(data))
  }
)
