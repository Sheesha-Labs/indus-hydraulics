import { afterResume } from '../../server/assistant/on-resumed'
import { defineOpsFunction } from '../define'

/**
 * ops.assistant.on-resumed (S05-T08): catch up after "Resume" — a sync for every readable mailbox from its
 * stored cursor, and the counters recounted. Exempt: it runs because the pause ended.
 */
export const assistantOnResumed = defineOpsFunction(
  { id: 'ops.assistant.on-resumed', lane: 'house', retries: 2, pause: 'exempt' },
  { event: 'ops/assistant.resumed' },
  async ({ step }) => step.run('catch-up', () => afterResume())
)
