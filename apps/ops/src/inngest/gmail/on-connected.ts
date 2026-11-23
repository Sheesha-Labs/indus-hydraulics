import { canTransitionMailbox, type MailboxStatusValue } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { refreshSendAs } from '../../server/gmail/connect'
import { ensureIndusLabels } from '../../server/gmail/labels'
import { gmailFor } from '../../server/gmail/mailbox-client'
import { startWatch } from '../../server/gmail/watch'
import { defineOpsFunction } from '../define'

/**
 * After a mailbox is connected or reconnected (S04-T02 step 7, board 86): read send-as aliases and the
 * signature, create or adopt the Indus/* labels, start the Gmail watch (S04-T04), then mark the mailbox live
 * and catch up from the stored history position (a reconnect resumes where it stopped: nothing is read twice).
 * The backfill starts separately, from step 4's "Read past mail" (ops/gmail.backfill.requested).
 */
export const gmailOnConnected = defineOpsFunction(
  {
    id: 'ops.mailbox.on-connected',
    concurrency: { key: 'event.data.mailboxId', limit: 1 },
    retries: 3,
    pause: 'exempt',
  },
  [{ event: 'ops/mailbox.connected' }, { event: 'ops/mailbox.reconnected' }],
  async ({ event, step }) => {
    const mailboxId = String(event.data.mailboxId)
    await step.run('send-as', () => refreshSendAs(mailboxId))
    const labels = await step.run('labels', () =>
      ensureIndusLabels(mailboxId, gmailFor(mailboxId, 'send'))
    )
    const watch = await step.run('watch', () => startWatch(mailboxId))
    await step.run('go-live', async () => {
      const row = await opsDb.mailbox.findUnique({
        where: { id: mailboxId },
        select: { status: true },
      })
      const from = row?.status as MailboxStatusValue | undefined
      if (from && from !== 'live' && canTransitionMailbox(from, 'live')) {
        await opsDb.mailbox.update({
          where: { id: mailboxId },
          data: { status: 'live', statusReason: null },
        })
      }
    })
    // Catch up at once from the STORED history position (never reset on reconnect): mail that arrived while
    // the mailbox was disconnected, or since the watch started.
    const address = await step.run(
      'address',
      async () =>
        (await opsDb.mailbox.findUnique({ where: { id: mailboxId }, select: { address: true } }))
          ?.address ?? null
    )
    if (address) {
      await step.sendEvent('catch-up', {
        name: 'ops/gmail.poll.tick',
        data: { emailAddress: address, reason: 'connected' },
      })
    }
    return { labels, watch }
  }
)
