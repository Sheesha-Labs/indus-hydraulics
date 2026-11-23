import 'server-only'
import { canTransitionMailbox, mayRoleSend, type MailboxStatusValue } from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import { grantedCapabilities } from './oauth'

/**
 * Board 85 changes to one mailbox (S04-T07). Each takes the action's transaction so the change and its
 * activity_event commit together. The rules:
 *
 *   role         Client / Supplier / Read-only / Personal. Leaving Client or Supplier turns Send off: Read-only
 *                and Personal mailboxes never send.
 *   permissions  never beyond what Google granted (a scope missing = that toggle stays off); Send only on a
 *                Client or Supplier mailbox. Archive does not exist as a permission: Ops never archives.
 *   pause        status 'paused' with who and when; the state it left is kept in statusReason so Resume
 *                returns to it. Mail keeps arriving in Gmail; the sync records the cursor and catches up.
 */
type Tx = Prisma.TransactionClient

export class MailboxAdminError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MailboxAdminError'
  }
}

const PAUSED_FROM = 'paused_from:'

export async function setMailboxRole(
  tx: Tx,
  mailboxId: string,
  role: 'client' | 'supplier' | 'read_only' | 'personal'
): Promise<{ before: string; after: string; sendTurnedOff: boolean }> {
  const row = await tx.mailbox.findUnique({
    where: { id: mailboxId },
    select: { role: true, canSend: true },
  })
  if (!row) throw new MailboxAdminError('That mailbox is not connected.')
  const sendTurnedOff = !mayRoleSend(role) && row.canSend
  await tx.mailbox.update({
    where: { id: mailboxId },
    data: { role, ...(sendTurnedOff ? { canSend: false } : {}) },
  })
  return { before: row.role, after: role, sendTurnedOff }
}

export type PermissionInput = { read: boolean; drafts: boolean; send: boolean; labels: boolean }

export async function setMailboxPermissions(
  tx: Tx,
  mailboxId: string,
  wanted: PermissionInput & { archive?: boolean | undefined }
): Promise<{ before: PermissionInput; after: PermissionInput }> {
  if (wanted.archive)
    throw new MailboxAdminError('Archive is always off: Operations never archives mail.')
  const row = await tx.mailbox.findUnique({
    where: { id: mailboxId },
    select: {
      role: true,
      scopes: true,
      canRead: true,
      canDraft: true,
      canSend: true,
      canLabel: true,
    },
  })
  if (!row) throw new MailboxAdminError('That mailbox is not connected.')
  const granted = grantedCapabilities(row.scopes.join(' '))
  if (wanted.send && !mayRoleSend(row.role)) {
    throw new MailboxAdminError('Read-only and Personal mailboxes never send.')
  }
  const missing = (
    [
      ['read', granted.canRead],
      ['drafts', granted.canDraft],
      ['send', granted.canSend],
      ['labels', granted.canLabel],
    ] as const
  ).filter(([k, ok]) => wanted[k] && !ok)
  if (missing.length) {
    throw new MailboxAdminError(
      `Google did not grant ${missing.map(([k]) => k).join(', ')} for this mailbox. Reconnect it to grant access.`
    )
  }
  if (!wanted.read && (wanted.drafts || wanted.send || wanted.labels)) {
    throw new MailboxAdminError('Reading is needed for everything else.')
  }
  await tx.mailbox.update({
    where: { id: mailboxId },
    data: {
      canRead: wanted.read,
      canDraft: wanted.drafts,
      canSend: wanted.send,
      canLabel: wanted.labels,
    },
  })
  return {
    before: { read: row.canRead, drafts: row.canDraft, send: row.canSend, labels: row.canLabel },
    after: { read: wanted.read, drafts: wanted.drafts, send: wanted.send, labels: wanted.labels },
  }
}

export async function pauseMailboxReading(
  tx: Tx,
  mailboxId: string,
  userId: string,
  now = new Date()
): Promise<{ before: MailboxStatusValue }> {
  const row = await tx.mailbox.findUnique({ where: { id: mailboxId }, select: { status: true } })
  if (!row) throw new MailboxAdminError('That mailbox is not connected.')
  if (row.status === 'paused') return { before: row.status }
  if (!canTransitionMailbox(row.status, 'paused')) {
    throw new MailboxAdminError('Reconnect this mailbox before pausing it.')
  }
  await tx.mailbox.update({
    where: { id: mailboxId },
    data: {
      status: 'paused',
      pausedAt: now,
      pausedById: userId,
      statusReason: `${PAUSED_FROM}${row.status}`,
    },
  })
  return { before: row.status }
}

/** Resume to the state the pause left (live when unknown). The caller then triggers a sync from the cursor. */
export async function resumeMailboxReading(
  tx: Tx,
  mailboxId: string
): Promise<{ after: MailboxStatusValue; address: string } | null> {
  const row = await tx.mailbox.findUnique({
    where: { id: mailboxId },
    select: { status: true, statusReason: true, address: true },
  })
  if (!row) throw new MailboxAdminError('That mailbox is not connected.')
  if (row.status !== 'paused') return null
  const prior = row.statusReason?.startsWith(PAUSED_FROM)
    ? (row.statusReason.slice(PAUSED_FROM.length) as MailboxStatusValue)
    : 'live'
  const after = canTransitionMailbox('paused', prior) ? prior : 'live'
  await tx.mailbox.update({
    where: { id: mailboxId },
    data: { status: after, pausedAt: null, pausedById: null, statusReason: null },
  })
  return { after, address: row.address }
}
