import { opsDb } from '@indus/ops-db'
import { syncMailbox, type SyncReason } from '../../server/gmail/sync'
import { defineOpsFunction } from '../define'

/**
 * ops.gmail.sync (S04-T04, 08-map-integrations §9.2): a push notification or a safety-poll tick → one
 * incremental sync. One run per mailbox at a time (keyed by address: the push route has no database, so it
 * knows only the address), debounced 3 s so a burst of notifications becomes one history read.
 *
 * Pause: record_only. syncMailbox itself records the notification and stops while paused (the mailbox's own
 * pause is checked there too).
 */
export const gmailSync = defineOpsFunction(
  {
    id: 'ops.gmail.sync',
    lane: 'live',
    perKey: { key: 'event.data.emailAddress', limit: 1 },
    debounce: { key: 'event.data.emailAddress', period: '3s' },
    retries: 3,
    pause: 'record_only',
  },
  [{ event: 'ops/gmail.notified' }, { event: 'ops/gmail.poll.tick' }],
  async ({ event, step }) => {
    const address = String(event.data.emailAddress ?? '').toLowerCase()
    const mailboxId = await step.run('resolve', async () =>
      address
        ? ((await opsDb.mailbox.findUnique({ where: { address }, select: { id: true } }))?.id ??
          null)
        : null
    )
    if (!mailboxId) return { kind: 'unknown-mailbox' as const }
    const reason: SyncReason =
      event.name === 'ops/gmail.notified'
        ? 'push'
        : event.data.reason === 'connected'
          ? 'connected'
          : 'poll'
    if (reason === 'push') {
      await step.run('note-push', () =>
        opsDb.mailboxSyncState.updateMany({
          where: { mailboxId },
          data: { lastPushAt: new Date() },
        })
      )
    }
    // One step: the fan-out and the cursor write commit together; a retry re-reads from the stored cursor and
    // the fetch events deduplicate on `mailboxId:gmailId`.
    return step.run('sync', () =>
      syncMailbox({
        mailboxId,
        reason,
        notifiedHistoryId: (event.data.historyId as string | undefined) ?? null,
      })
    )
  }
)
