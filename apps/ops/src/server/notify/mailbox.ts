import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { opsDb } from '@indus/ops-db'
import { raiseNotification } from './raise'
import { resolveNotifications } from './resolve'

/**
 * The locked "mailbox disconnected" notification (S04-T08, board 89). Raised when Google stops accepting the
 * mailbox's access (tokens.ts, the Gmail client's 401 path) and when the Owner disconnects it; resolved when it
 * reconnects. To the Owner and the mailbox's owner. One open notification per mailbox (dedupe key).
 */
export const disconnectedKey = (mailboxId: string) => `mailbox_disconnected:${mailboxId}`

const ROLE_WORDS: Record<string, string> = {
  client: 'client mail',
  supplier: 'supplier mail',
  read_only: 'mail',
  personal: 'mail',
}

export async function notifyMailboxDisconnected(
  mailboxId: string,
  reason: 'token' | 'disconnected' = 'token'
): Promise<void> {
  const box = await opsDb.mailbox.findUnique({
    where: { id: mailboxId },
    select: { address: true, role: true, ownerUserId: true },
  })
  if (!box) return
  const local = `${box.address.split('@')[0]}@`
  const owners = await opsDb.user.findMany({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  const audience = [
    ...new Set([...owners.map((o) => o.id), ...(box.ownerUserId ? [box.ownerUserId] : [])]),
  ]
  await raiseNotification({
    event: 'mailbox_disconnected',
    severity: 'critical',
    title: `${local} disconnected`,
    body:
      reason === 'token'
        ? `Google no longer accepts Operations' access to ${box.address}. The Assistant can't read or send ${ROLE_WORDS[box.role] ?? 'mail'} until you reconnect it.`
        : `${box.address} was disconnected. Its sends wait until a mailbox with the same role is connected.`,
    dedupeKey: disconnectedKey(mailboxId),
    actionUrl: '/settings/mailboxes',
    subjectType: 'mailbox',
    subjectId: mailboxId,
    audience,
  })
  if (reason === 'token') {
    Sentry.captureMessage('Gmail mailbox access lost', {
      level: 'warning',
      tags: { area: 'gmail', mailboxId },
    })
  }
}

export async function resolveMailboxDisconnected(mailboxId: string): Promise<number> {
  return resolveNotifications(disconnectedKey(mailboxId))
}
