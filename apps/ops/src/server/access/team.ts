import 'server-only'
import type { Prisma } from '@indus/ops-db'
import { AccessError, type HelperFlag, type OpsRole } from '../../lib/access-core'
import { SafeError, SAFE_MESSAGES } from '../../lib/safe-message'
import { isRecentSignIn, revokeAllSessions } from './sessions'
import { lastOwnerMessage, type OpenWork } from './team-core'

/**
 * The team's access changes (board 84, 84b; S03-T03): a Helper's three toggles, removing a Helper,
 * changing a role and handing ownership over. Owner only, and checked here as well as in
 * defineAction, so the rule holds for every caller. Each takes the caller's transaction.
 *
 * Never zero active Owners: `ops.user_one_active_owner` (a partial unique index) allows at most one,
 * and every change here refuses to leave none (`LastOwnerError`). Ownership moves by demoting the
 * current Owner FIRST and then promoting the Helper, inside one transaction: the other order breaks
 * the index (two active Owners for a moment).
 */
export type Tx = Prisma.TransactionClient

export type TeamActor = { id: string; role: OpsRole; name: string }

export type HelperFlags = Record<HelperFlag, boolean>

/** The 84b guard. A SafeError, so its sentence reaches the person as it is. */
export class LastOwnerError extends SafeError {
  readonly code = 'last_owner' as const
  constructor(readonly ownerName: string) {
    super(lastOwnerMessage(ownerName))
  }
}

function ownerOnly(actor: TeamActor): void {
  if (actor.role !== 'owner') throw new AccessError('forbidden')
}

const NO_FLAGS: HelperFlags = {
  canSeeMargins: false,
  canSendSupplierMail: false,
  canEditChaserRules: false,
}

/**
 * Open work a person holds (supplier RFQs, draft chasers). Zero until S12 builds supplier RFQs; the
 * Remove dialog and removeUser read it, so the sentence is right from the day it is not zero.
 */
export async function countOpenWork(_db: Tx, _userId: string): Promise<OpenWork> {
  return { supplierRfqs: 0, draftChasers: 0 }
}

/** Move that open work to `toUserId`. Returns what moved (S12 fills it). */
export async function reassignOpenWork(
  db: Tx,
  fromUserId: string,
  _toUserId: string
): Promise<OpenWork> {
  return countOpenWork(db, fromUserId)
}

/**
 * Refuse a change that would leave no active Owner: `userId` is about to stop being one (removed,
 * demoted). Throws LastOwnerError naming them.
 */
export async function assertOwnerRemains(tx: Tx, userId: string): Promise<void> {
  const leaving = await tx.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true, status: true },
  })
  if (!leaving || leaving.role !== 'owner' || leaving.status !== 'active') return
  const others = await tx.user.count({
    where: { role: 'owner', status: 'active', id: { not: userId } },
  })
  if (others === 0) throw new LastOwnerError(leaving.name)
}

/**
 * Set the Helper's three toggles (Permissions, or a toggle in "What each role can do"). Version-
 * checked on the toggles themselves: `expected` is what the Owner's page showed, and the update
 * applies only if the row still says so (else "Someone changed this a moment ago").
 */
export async function updateHelperPermissions(
  tx: Tx,
  actor: TeamActor,
  input: { userId: string; next: HelperFlags; expected: HelperFlags }
): Promise<HelperFlags> {
  ownerOnly(actor)
  const { count } = await tx.user.updateMany({
    where: { id: input.userId, role: 'helper', status: 'active', ...input.expected },
    data: input.next,
  })
  if (count === 0) {
    const exists = await tx.user.count({
      where: { id: input.userId, role: 'helper', status: 'active' },
    })
    throw new SafeError(exists ? SAFE_MESSAGES.conflict : SAFE_MESSAGES.gone)
  }
  await tx.authEvent.create({ data: { userId: input.userId, kind: 'permissions_changed' } })
  return input.next
}

export type RemovedUser = { work: OpenWork; sessionsEnded: number }

/**
 * Remove someone's access (Owner only): status `removed`, removedAt, toggles off, every session
 * revoked, open work moved to the Owner, auth_event `user_removed`. The only Owner cannot be removed.
 */
export async function removeUser(
  tx: Tx,
  actor: TeamActor,
  userId: string,
  now = new Date()
): Promise<RemovedUser> {
  ownerOnly(actor)
  const target = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true },
  })
  if (!target || target.status !== 'active') throw new SafeError(SAFE_MESSAGES.gone)
  await assertOwnerRemains(tx, userId)
  const work = await reassignOpenWork(tx, userId, actor.id)
  await tx.user.update({
    where: { id: userId },
    data: { status: 'removed', removedAt: now, ...NO_FLAGS },
  })
  const sessionsEnded = await revokeAllSessions(tx, userId, {
    actorId: actor.id,
    reason: 'removed_by_owner',
    now,
  })
  await tx.authEvent.create({ data: { userId, kind: 'user_removed' } })
  return { work, sessionsEnded }
}

/**
 * Change one person's role (Owner only). Demoting the only Owner is refused (84b); promoting a
 * second Owner breaks the one-Owner index, so ownership moves only through transferOwnership.
 */
export async function changeRole(
  tx: Tx,
  actor: TeamActor,
  userId: string,
  role: OpsRole
): Promise<void> {
  ownerOnly(actor)
  if (role === 'helper') await assertOwnerRemains(tx, userId)
  if (role === 'owner') {
    throw new SafeError('There is one Owner at a time. Use Transfer ownership instead.')
  }
  await tx.user.update({ where: { id: userId }, data: { role, ...NO_FLAGS } })
}

export const TRANSFER_TEXT = {
  reauth: 'For your security, sign in again before transferring ownership.',
  target: 'Ownership can go only to the active Helper.',
} as const

export type Transferred = { fromUserId: string; toUserId: string; sessionsEnded: number }

/**
 * Hand ownership to the active Helper (Owner only). Needs a sign-in within the last 10 minutes
 * (`signedInAt`: this browser's session start). One transaction: demote the Owner to Helper first,
 * then promote the Helper (the partial unique index allows one active Owner), auth_event
 * `ownership_transferred` for both, and both people's sessions revoked so new roles apply at once.
 */
export async function transferOwnership(
  tx: Tx,
  actor: TeamActor,
  input: { toUserId: string; signedInAt: Date | null; now?: Date }
): Promise<Transferred> {
  ownerOnly(actor)
  const now = input.now ?? new Date()
  if (!isRecentSignIn(input.signedInAt, now)) throw new SafeError(TRANSFER_TEXT.reauth)
  if (input.toUserId === actor.id) throw new SafeError(TRANSFER_TEXT.target)
  const target = await tx.user.findUnique({
    where: { id: input.toUserId },
    select: { role: true, status: true },
  })
  if (!target || target.role !== 'helper' || target.status !== 'active') {
    throw new SafeError(TRANSFER_TEXT.target)
  }

  // 1. Demote first: for a moment there is no Owner, never two.
  const demoted = await tx.user.updateMany({
    where: { id: actor.id, role: 'owner', status: 'active' },
    data: { role: 'helper', ...NO_FLAGS },
  })
  if (demoted.count === 0) throw new SafeError(SAFE_MESSAGES.conflict)
  // 2. Then promote.
  await tx.user.update({ where: { id: input.toUserId }, data: { role: 'owner', ...NO_FLAGS } })

  await tx.authEvent.createMany({
    data: [
      { userId: actor.id, kind: 'ownership_transferred' },
      { userId: input.toUserId, kind: 'ownership_transferred' },
    ],
  })
  let sessionsEnded = 0
  for (const userId of [actor.id, input.toUserId]) {
    sessionsEnded += await revokeAllSessions(tx, userId, {
      actorId: actor.id,
      reason: 'ownership_transferred',
      now,
    })
  }
  return { fromUserId: actor.id, toUserId: input.toUserId, sessionsEnded }
}
