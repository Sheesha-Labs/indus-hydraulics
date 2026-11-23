import 'server-only'
import { opsDb } from '@indus/ops-db'
import { env } from '../../lib/env'
import { gmailFor } from './mailbox-client'

/**
 * Gmail push (S04-T02/T04, 08-map-integrations §1.4): `users.watch` on the whole mailbox (no label filter: Ops
 * needs INBOX arrivals and SENT, so a reply written in Gmail reaches the record, board 88), to the Pub/Sub topic.
 * Google needs it renewed at least every 7 days; ops.gmail.watch.renew does it daily.
 *
 * The first watch sets the history position to start from. A reconnect keeps the stored position so the sync
 * resumes exactly where it stopped (board 90: nothing is read twice).
 */
export type WatchResult = { started: boolean; expiresAt: string | null; reason?: 'not_configured' }

export async function startWatch(mailboxId: string): Promise<WatchResult> {
  const topicName = env().GMAIL_PUBSUB_TOPIC
  if (!topicName) {
    await opsDb.mailboxSyncState.upsert({
      where: { mailboxId },
      create: { mailboxId, watchError: 'not_configured' },
      update: { watchError: 'not_configured' },
    })
    return { started: false, expiresAt: null, reason: 'not_configured' }
  }
  const res = await gmailFor(mailboxId, 'live').watch({ topicName })
  const expiresAt = res.expiration ? new Date(Number(res.expiration)) : null
  const existing = await opsDb.mailboxSyncState.findUnique({
    where: { mailboxId },
    select: { historyId: true },
  })
  await opsDb.mailboxSyncState.upsert({
    where: { mailboxId },
    create: {
      mailboxId,
      historyId: res.historyId ?? null,
      watchExpiresAt: expiresAt,
      watchRenewedAt: new Date(),
      watchError: null,
    },
    update: {
      watchExpiresAt: expiresAt,
      watchRenewedAt: new Date(),
      watchError: null,
      ...(existing?.historyId ? {} : { historyId: res.historyId ?? null }),
    },
  })
  return { started: true, expiresAt: expiresAt?.toISOString() ?? null }
}

/** Stop push for a mailbox (Disconnect, board 90). Best effort: a token Google already revoked cannot stop it. */
export async function stopWatch(mailboxId: string): Promise<boolean> {
  try {
    await gmailFor(mailboxId, 'live').stop()
    return true
  } catch {
    return false
  } finally {
    await opsDb.mailboxSyncState
      .update({ where: { mailboxId }, data: { watchExpiresAt: null } })
      .catch(() => undefined)
  }
}
