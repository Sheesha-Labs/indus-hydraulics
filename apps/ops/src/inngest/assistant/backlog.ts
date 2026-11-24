import {
  PIPELINE_ENABLED_EVENT,
  requestBacklogBatch,
  type BacklogCursor,
} from '../../server/assistant/pipeline-switch'
import { defineOpsFunction } from '../define'

// Action modules register themselves on import (the request event looks up the definition).
import '../../server/assistant/actions'

/**
 * ops.assistant.backlog (S05-T09): after the Owner turns the mail pipeline on, every unclassified live
 * message is requested for #1, oldest first, 200 per batch with 2 s between batches; it stops if the switch
 * is turned off again. At most 100 batches (20,000 messages) per run; a longer backlog continues itself.
 */
const MAX_BATCHES = 100

export const assistantBacklog = defineOpsFunction(
  { id: 'ops.assistant.backlog', lane: 'bulk', retries: 2, pause: 'wait' },
  { event: PIPELINE_ENABLED_EVENT },
  async ({ step }) => {
    let cursor: BacklogCursor | null = null
    let total = 0
    for (let n = 0; n < MAX_BATCHES; n += 1) {
      const out = await step.run(`batch-${n}`, () => requestBacklogBatch(cursor))
      total += out.requested
      if (out.stopped || !out.next)
        return { requested: total, batches: n + 1, stopped: out.stopped ?? null }
      cursor = out.next
      await step.sleep(`between-${n}`, '2s')
    }
    return { requested: total, batches: MAX_BATCHES, more: true }
  }
)
