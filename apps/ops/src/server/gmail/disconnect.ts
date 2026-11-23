import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { emitEventOrThrow } from '../../inngest/emit'
import { writeAudit } from '../../lib/audit'
import { notifyMailboxDisconnected } from '../notify/mailbox'
import { googleEndpoints, revokeToken } from './oauth'
import { openFromBytes, REFRESH_AAD } from './tokens'
import { stopWatch } from './watch'

/**
 * Board 90 · Disconnect a mailbox (S04-T08, 08-map §1.10). In order:
 *
 *   1  the typed address must match (case and spaces ignored)
 *   2  Google first, outside any transaction: revoke the refresh token, stop the watch (best effort: the
 *      tokens are cleared either way, so Operations can no longer act in the mailbox)
 *   3  one transaction: token columns cleared, status 'disconnected' + disconnectedAt, the sync cursor KEPT
 *      (reconnecting the same mailbox resumes gap-free), every scheduled/held send of this mailbox becomes
 *      waiting_for_mailbox (never moved to another mailbox; Review shows "Waiting for a Supplier mailbox"),
 *      and the receipt on activity_event
 *   4  the locked notification; for "Delete everything imported", ops/mailbox.purge.requested (the purge runs
 *      on ops_maint in 500-row batches and writes its own receipt). Gmail itself is never touched.
 */
export class DisconnectError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DisconnectError'
  }
}

export type DisconnectCounts = { emails: number; attachments: number; supplierQuotes: number }

/** S15 registers the count of supplier quotes whose prices came only from this mailbox. */
let capturedQuotesCounter: ((mailboxId: string) => Promise<number>) | null = null
export function setCapturedQuotesCounter(
  fn: ((mailboxId: string) => Promise<number>) | null
): void {
  capturedQuotesCounter = fn
}

export async function disconnectCounts(mailboxId: string): Promise<DisconnectCounts> {
  const [emails, attachments, supplierQuotes] = await Promise.all([
    opsDb.mailMessage.count({ where: { mailboxId } }),
    opsDb.mailAttachment.count({ where: { message: { mailboxId } } }),
    capturedQuotesCounter ? capturedQuotesCounter(mailboxId) : Promise.resolve(0),
  ])
  return { emails, attachments, supplierQuotes }
}

export type DisconnectReceipt = {
  mailboxId: string
  address: string
  mode: 'keep' | 'delete'
  at: string
  revoked: boolean
  watchStopped: boolean
  sendsWaiting: number
  counts: DisconnectCounts
  headline: string
  detail: string
}

const n = (v: number) => v.toLocaleString('en-US')

function clock(at: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(at)
}

export async function disconnectMailbox(input: {
  mailboxId: string
  mode: 'keep' | 'delete'
  typed: string
  user: { id: string; initials: string }
  now?: Date
  deps?: {
    revoke?: typeof revokeToken
    stop?: typeof stopWatch
    emit?: typeof emitEventOrThrow
  }
}): Promise<DisconnectReceipt> {
  const now = input.now ?? new Date()
  const box = await opsDb.mailbox.findUnique({
    where: { id: input.mailboxId },
    select: { id: true, address: true, role: true, status: true, refreshTokenEnc: true },
  })
  if (!box) throw new DisconnectError('That mailbox is not connected.')
  if (input.typed.trim().toLowerCase() !== box.address.toLowerCase()) {
    throw new DisconnectError(`Type ${box.address} to confirm.`)
  }
  const counts = await disconnectCounts(box.id)

  // 2 · Google, before the transaction (no connection held across the network).
  let revoked = false
  if (box.refreshTokenEnc) {
    try {
      const token = openFromBytes(box.refreshTokenEnc, REFRESH_AAD(box.id))
      revoked = await (input.deps?.revoke ?? revokeToken)({ endpoints: googleEndpoints(), token })
    } catch {
      revoked = false
    }
  }
  const watchStopped =
    box.status === 'disconnected' ? true : await (input.deps?.stop ?? stopWatch)(box.id)

  // 3 · One transaction.
  const local = `${box.address.split('@')[0]}@`
  const roleWord =
    box.role === 'client' ? 'Client' : box.role === 'supplier' ? 'Supplier' : 'matching'
  const modeWords = input.mode === 'keep' ? 'kept imported data' : 'deleting imported data'
  const receiptDetail = (waiting: number) =>
    [
      input.mode === 'keep'
        ? `Kept ${n(counts.emails)} email references, ${n(counts.attachments)} attachments, ${n(counts.supplierQuotes)} supplier quotes.`
        : `${n(counts.emails)} emails and ${n(counts.attachments)} attachments are being removed from Indus Operations. Gmail itself is not touched.`,
      waiting
        ? `${waiting} queued send${waiting === 1 ? '' : 's'} returned to Review as “Waiting for a ${roleWord} mailbox”.`
        : null,
      revoked
        ? `Google access revoked at ${clock(now)}.`
        : 'Google did not confirm the revoke; no token is kept.',
    ]
      .filter(Boolean)
      .join(' ')
  const sendsWaiting = await opsDb.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.mailbox.update({
      where: { id: box.id },
      data: {
        status: 'disconnected',
        statusReason: 'Disconnected in Settings',
        disconnectedAt: now,
        refreshTokenEnc: null,
        accessTokenEnc: null,
        accessExpiresAt: null,
        tokenKeyId: null,
        canSend: false,
        pausedAt: null,
        pausedById: null,
      },
    })
    await tx.mailboxSyncState.updateMany({
      where: { mailboxId: box.id },
      data: { watchExpiresAt: null },
    })
    const { count } = await tx.outboundEmail.updateMany({
      where: { mailboxId: box.id, status: { in: ['scheduled', 'held'] } },
      data: { status: 'waiting_for_mailbox', holdReason: 'mailbox' },
    })
    await writeAudit(tx, input.user.id, {
      subjectType: 'mailbox',
      subjectId: box.id,
      kind: 'settings',
      field: 'connection',
      before: box.status,
      after: 'disconnected',
      note: `${input.user.initials} disconnected ${local} · ${modeWords}. ${receiptDetail(count)}`,
    })
    return count
  })

  // 4 · After commit.
  await notifyMailboxDisconnected(box.id, 'disconnected')
  if (input.mode === 'delete') {
    await (input.deps?.emit ?? emitEventOrThrow)({
      name: 'ops/mailbox.purge.requested',
      id: `mailbox-purge:${box.id}:${now.getTime()}`,
      data: { mailboxId: box.id, requestedById: input.user.id },
    })
  }

  const headline = `Disconnected ${box.address} · ${modeWords}`
  const detail = receiptDetail(sendsWaiting)
  return {
    mailboxId: box.id,
    address: box.address,
    mode: input.mode,
    at: now.toISOString(),
    revoked,
    watchStopped,
    sendsWaiting,
    counts,
    headline,
    detail,
  }
}
