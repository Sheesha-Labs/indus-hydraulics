import { purgeBatch, writePurgeReceipt, type PurgeTotals } from '../../server/gmail/purge'
import { defineOpsFunction } from '../define'

/**
 * ops.mailbox.purge (S04-T08, board 90 "Delete everything imported from this mailbox"): one step per batch of at
 * most 500 messages on the ops_maint client, a short sleep between batches, then the receipt. A failed step
 * repeats only its own batch (deleting is idempotent). Global concurrency 1: one purge at a time. Runs while the
 * Assistant is paused (it only removes Operations' own copies; Gmail is never touched).
 */
/** Inngest caps steps per run; a larger mailbox continues in a fresh run carrying the totals so far. */
const MAX_BATCHES = 400

export const mailboxPurge = defineOpsFunction(
  {
    id: 'ops.mailbox.purge',
    lane: 'bulk',
    retries: 2,
    pause: 'exempt',
  },
  { event: 'ops/mailbox.purge.requested' },
  async ({ event, step }) => {
    const mailboxId = String(event.data.mailboxId)
    const requestedById =
      typeof event.data.requestedById === 'string' ? event.data.requestedById : null
    const carried = (event.data.totals ?? null) as PurgeTotals | null
    const totals: PurgeTotals = carried ?? { messages: 0, attachments: 0, files: 0, threads: 0 }
    let done = false
    for (let i = 0; i < MAX_BATCHES; i += 1) {
      const batch = await step.run(`batch-${i}`, () => purgeBatch(mailboxId))
      totals.messages += batch.totals.messages
      totals.attachments += batch.totals.attachments
      totals.files += batch.totals.files
      totals.threads += batch.totals.threads
      if (batch.done) {
        done = true
        break
      }
      await step.sleep(`pause-${i}`, '1s')
    }
    if (!done) {
      await step.sendEvent('continue', {
        name: 'ops/mailbox.purge.requested',
        data: { mailboxId, requestedById, totals },
      })
      return { continued: true, totals }
    }
    await step.run('receipt', () => writePurgeReceipt({ mailboxId, requestedById, totals }))
    return totals
  }
)
