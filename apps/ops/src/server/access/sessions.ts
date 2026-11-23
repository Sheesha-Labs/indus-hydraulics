import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { AccessError, type OpsRole } from '../../lib/access-core'

/**
 * Sessions (C42, board 84 "Devices and sessions", S03-T02). One `ops.user_session` row per sign-in; the
 * JWT carries its id (`sid`). Ending a session sets `revokedAt` (never deletes the row): requireOpsUser
 * refuses it on the next page or action, and the proxy's cache within its TTL.
 *
 * Who may end what: anyone their own sessions; the Owner anyone's. Every revocation writes auth_event
 * `session_revoked` for the session's owner (a sign-out writes `sign_out`).
 *
 * `revokeReason` vocabulary (open, text): `signed_out` (Sign out), `signed_out_from_devices` (Devices ›
 * Sign out, own), `signed_out_by_owner` (the Owner, someone else's), `signed_out_everywhere`,
 * `password_changed`, `password_reset` (reset.ts), `signed_in_again` (the browser signed in afresh).
 */
type Db = Pick<Prisma.TransactionClient, 'userSession' | 'authEvent'>

export type Actor = { id: string; role: OpsRole }

export type SessionListItem = {
  id: string
  deviceLabel: string
  city: string | null
  country: string | null
  method: 'google' | 'password'
  createdAt: Date
  lastSeenAt: Date
  /** The session this request runs in ("This device"). */
  current: boolean
}

/** A user's live sessions: the current one first, then most recently active. */
export async function listSessions(
  userId: string,
  currentSid: string | null,
  options: { now?: Date; db?: Pick<Db, 'userSession'> } = {}
): Promise<SessionListItem[]> {
  const db = options.db ?? opsDb
  const rows = await db.userSession.findMany({
    where: { userId, revokedAt: null, expires: { gt: options.now ?? new Date() } },
    orderBy: [{ lastSeenAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      deviceLabel: true,
      city: true,
      country: true,
      method: true,
      createdAt: true,
      lastSeenAt: true,
    },
    take: 50,
  })
  const items = rows.map((r) => ({
    ...r,
    deviceLabel: r.deviceLabel ?? 'Unknown browser',
    current: r.id === currentSid,
  }))
  return [...items.filter((s) => s.current), ...items.filter((s) => !s.current)]
}

export type RevokeOutcome = 'revoked' | 'already_ended'

/**
 * End one session. A Helper may end only their own; the Owner anyone's (AccessError 'forbidden'
 * otherwise, and for an id that does not exist, so a Helper learns nothing about other rows).
 */
export async function revokeSession(
  db: Db,
  input: { sessionId: string; actor: Actor; reason?: string; now?: Date }
): Promise<RevokeOutcome> {
  const row = await db.userSession.findUnique({
    where: { id: input.sessionId },
    select: { id: true, userId: true },
  })
  if (!row) throw new AccessError('forbidden')
  const own = row.userId === input.actor.id
  if (!own && input.actor.role !== 'owner') throw new AccessError('forbidden')
  const { count } = await db.userSession.updateMany({
    where: { id: row.id, revokedAt: null },
    data: {
      revokedAt: input.now ?? new Date(),
      revokedById: input.actor.id,
      revokeReason: input.reason ?? (own ? 'signed_out_from_devices' : 'signed_out_by_owner'),
    },
  })
  if (count === 0) return 'already_ended'
  await db.authEvent.create({ data: { userId: row.userId, kind: 'session_revoked' } })
  return 'revoked'
}

/**
 * End every live session of a user, except `except` (Sign out everywhere keeps the device it was asked
 * from). Returns how many ended. One auth_event per session ended.
 */
export async function revokeAllSessions(
  db: Db,
  userId: string,
  options: { except?: string | null; actorId: string; reason: string; now?: Date }
): Promise<number> {
  const now = options.now ?? new Date()
  const where: Prisma.UserSessionWhereInput = {
    userId,
    revokedAt: null,
    expires: { gt: now },
    ...(options.except ? { id: { not: options.except } } : {}),
  }
  const live = await db.userSession.findMany({ where, select: { id: true } })
  if (live.length === 0) return 0
  const { count } = await db.userSession.updateMany({
    where: { ...where, id: { in: live.map((s) => s.id) } },
    data: { revokedAt: now, revokedById: options.actorId, revokeReason: options.reason },
  })
  if (count > 0) {
    await db.authEvent.createMany({
      data: Array.from({ length: count }, () => ({ userId, kind: 'session_revoked' as const })),
    })
  }
  return count
}

/**
 * Security changes (set or change the password, regenerate backup codes) need a recent sign-in: this
 * browser's session must have started within the last 10 minutes, else the person signs in again
 * (`/sign-in?reason=reauth`).
 */
export const REAUTH_WINDOW_MS = 10 * 60_000

export function isRecentSignIn(signedInAt: Date | null, now = new Date()): boolean {
  return !!signedInAt && now.getTime() - signedInAt.getTime() <= REAUTH_WINDOW_MS
}

/** When the session `sid` signed in, if it is this user's and still live. */
export async function sessionSignedInAt(
  userId: string,
  sid: string | null,
  db: Pick<Db, 'userSession'> = opsDb
): Promise<Date | null> {
  if (!sid) return null
  const row = await db.userSession.findFirst({
    where: { id: sid, userId, revokedAt: null },
    select: { createdAt: true },
  })
  return row?.createdAt ?? null
}

/** Sign out: the session this browser holds ends now (auth_event `sign_out`). */
export async function endSession(sid: string, db: Db = opsDb): Promise<void> {
  const row = await db.userSession.findUnique({ where: { id: sid }, select: { userId: true } })
  if (!row) return
  const { count } = await db.userSession.updateMany({
    where: { id: sid, revokedAt: null },
    data: { revokedAt: new Date(), revokedById: row.userId, revokeReason: 'signed_out' },
  })
  if (count > 0) await db.authEvent.create({ data: { userId: row.userId, kind: 'sign_out' } })
}
