import { opsDb } from '@indus/ops-db'
import { emitEvents } from '../emit-batch'
import { defineOpsFunction } from '../define'

/**
 * ops.gmail.poll (S04-T04, §1.4 "Safety-net poll"): every 10 minutes, a tick for each working mailbox with no
 * successful sync in the last 10 minutes. Pub/Sub can drop or delay notifications; this is how "Behind" is both
 * detected and fixed (board 89).
 */
export const STALE_AFTER_MS = 10 * 60 * 1000

export async function staleMailboxAddresses(now = new Date()): Promise<string[]> {
  const cutoff = new Date(now.getTime() - STALE_AFTER_MS)
  const rows = await opsDb.mailbox.findMany({
    where: {
      status: { in: ['live', 'behind', 'limit_reached', 'backfilling', 'backfill_paused'] },
      pausedAt: null,
      OR: [
        { syncState: { is: null } },
        { syncState: { lastSuccessfulSyncAt: null } },
        { syncState: { lastSuccessfulSyncAt: { lt: cutoff } } },
      ],
    },
    select: { address: true },
  })
  return rows.map((r) => r.address)
}

export const gmailPoll = defineOpsFunction(
  { id: 'ops.gmail.poll', lane: 'house', retries: 1, pause: 'skip' },
  { cron: '*/10 * * * *' },
  async ({ step }) => {
    const addresses = await step.run('stale', () => staleMailboxAddresses())
    if (addresses.length) {
      await step.run('tick', () =>
        emitEvents(
          addresses.map((emailAddress) => ({
            name: 'ops/gmail.poll.tick' as const,
            data: { emailAddress, reason: 'poll' },
          }))
        )
      )
    }
    return { ticked: addresses.length }
  }
)
