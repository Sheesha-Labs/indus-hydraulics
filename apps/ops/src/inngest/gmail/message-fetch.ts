import { emitEvent } from '../emit'
import {
  fetchParsed,
  storeAttachment,
  storeBodyHtml,
  storeMessage,
  type Origin,
} from '../../server/gmail/fetch'
import { defineOpsFunction } from '../define'

/**
 * ops.gmail.message.fetch (S04-T05, 08-map-integrations §1.6, §9.2): one Gmail message into Ops in steps, so a
 * failure repeats only its own step and no step holds a database connection across a network call:
 *
 *   fetch-gmail  network only (messages.get full) → the parsed message, no attachment bytes
 *   store        DB: thread + mail_message (idempotent on mailbox + Gmail id)
 *   att-<n>      one attachment per step: Gmail → sha256 → ops-mail → stored_file / mail_attachment
 *   body-html    sanitised HTML with cid images pointing at their stored files
 *   emit         ops/mail.received AFTER the rows commit (S05 classifies; origin backfill is never acted on)
 *
 * Event ids `mailboxId:gmailId` deduplicate repeats; a stored message short-circuits after `store`.
 */
export const gmailMessageFetch = defineOpsFunction(
  {
    id: 'ops.gmail.message.fetch',
    concurrency: [{ key: 'event.data.mailboxId', limit: 2 }, { limit: 4 }],
    retries: 4,
    pause: 'exempt',
  },
  { event: 'ops/gmail.message.fetch' },
  async ({ event, step }) => {
    const mailboxId = String(event.data.mailboxId)
    const gmailId = String(event.data.gmailId)
    const origin = (event.data.origin === 'backfill' ? 'backfill' : 'live') as Origin
    const parsed = await step.run('fetch-gmail', () => fetchParsed(mailboxId, gmailId, origin))
    const stored = await step.run('store', () => storeMessage(mailboxId, parsed, origin))
    if (!stored.created) return { messageId: stored.messageId, created: false }

    const cidMap: Record<string, string> = {}
    for (const [i, meta] of stored.attachments.entries()) {
      const att = await step.run(`att-${i}`, () =>
        storeAttachment({
          mailboxId,
          messageId: stored.messageId,
          gmailId,
          internalDate: parsed.internalDate,
          meta,
        })
      )
      if (att.contentId) cidMap[att.contentId] = att.fileId
    }
    if (parsed.html) {
      await step.run('body-html', () =>
        storeBodyHtml({
          mailboxId,
          messageId: stored.messageId,
          gmailId,
          internalDate: parsed.internalDate,
          html: parsed.html as string,
          cidMap,
        })
      )
    }
    await step.run('emit', () =>
      emitEvent({
        name: 'ops/mail.received',
        id: `mail-received:${stored.messageId}`,
        data: { messageId: stored.messageId, mailboxId, origin },
      })
    )
    return { messageId: stored.messageId, created: true, attachments: stored.attachments.length }
  }
)
