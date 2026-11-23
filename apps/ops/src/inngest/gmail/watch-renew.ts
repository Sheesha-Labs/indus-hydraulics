import * as Sentry from '@sentry/nextjs'
import { canTransitionMailbox, type MailboxStatusValue } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { startWatch } from '../../server/gmail/watch'
import { defineOpsFunction } from '../define'

/**
 * ops.gmail.watch.renew (S04-T04, §1.4 "Renewal"): Google needs `watch` at least every 7 days; Ops renews daily
 * at 03:10 Dubai time ("Daily · Google notifications renew daily — automatic", board 85). A failure records the
 * error, marks the mailbox Behind (the safety poll keeps it current meanwhile) and alerts.
 */
export async function renewWatch(
  mailboxId: string
): Promise<'renewed' | 'failed' | 'not_configured'> {
  try {
    const res = await startWatch(mailboxId)
    return res.started ? 'renewed' : 'not_configured'
  } catch (error) {
    const message = error instanceof Error ? error.name : 'unknown'
    const row = await opsDb.mailbox.findUnique({
      where: { id: mailboxId },
      select: { status: true },
    })
    await opsDb.mailboxSyncState.updateMany({ where: { mailboxId }, data: { watchError: message } })
    const from = row?.status as MailboxStatusValue | undefined
    if (from && canTransitionMailbox(from, 'behind')) {
      await opsDb.mailbox.update({
        where: { id: mailboxId },
        data: { status: 'behind', statusReason: 'Google notifications could not be renewed' },
      })
    }
    Sentry.withScope((scope) => {
      scope.setTag('job', 'watch.renew')
      Sentry.captureException(error)
    })
    return 'failed'
  }
}

export const gmailWatchRenew = defineOpsFunction(
  { id: 'ops.gmail.watch.renew', lane: 'house', retries: 3, pause: 'exempt' },
  { cron: 'TZ=Asia/Dubai 10 3 * * *' },
  async ({ step }) => {
    const ids = await step.run('mailboxes', async () =>
      (
        await opsDb.mailbox.findMany({
          where: {
            status: {
              in: [
                'live',
                'behind',
                'limit_reached',
                'backfilling',
                'backfill_paused',
                'resyncing',
              ],
            },
          },
          select: { id: true },
        })
      ).map((m) => m.id)
    )
    const results: Record<string, string> = {}
    for (const id of ids) results[id] = await step.run(`renew-${id}`, () => renewWatch(id))
    return results
  }
)
