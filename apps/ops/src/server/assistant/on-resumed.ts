import 'server-only'
import { mailboxCanRead, type MailboxStatusValue } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { emitEvents } from '../../inngest/emit-batch'
import { recountMailCounters } from '../mail/counters'
import { setCounters } from './live-counter'

/**
 * After "Resume" (S05-T08, C22): every readable mailbox syncs from its stored cursor, so mail that arrived
 * while paused is read in order; the live counters are recounted. Held sends and waiting runs are released
 * by the ops/assistant.resumed event itself (the gate re-gates each send; stale ones stop as 'stale').
 */
export async function afterResume(): Promise<{ mailboxes: number }> {
  const rows = await opsDb.mailbox.findMany({
    where: { pausedAt: null },
    select: { address: true, status: true },
  })
  const readable = rows.filter((r) => mailboxCanRead(r.status as MailboxStatusValue))
  if (readable.length) {
    await emitEvents(
      readable.map((r) => ({
        name: 'ops/gmail.poll.tick' as const,
        data: { emailAddress: r.address, reason: 'resumed' },
      }))
    )
  }
  await recountMailCounters()
  const pending = await opsDb.assistantAction.count({
    where: { surface: 'review', state: { in: ['proposed', 'later'] } },
  })
  await setCounters({ 'review.pending': pending })
  return { mailboxes: readable.length }
}
