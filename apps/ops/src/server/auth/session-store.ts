import 'server-only'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { opsDb } from '@indus/ops-db'
import { deviceHash, describeDevice, type RequestLocation } from '../access/devices'

/** Who may sign in, and the rows a sign-in writes (ADR-05). */
export type SignInUser = {
  id: string
  email: string
  name: string
  initials: string
  role: 'owner' | 'helper'
  status: 'invited' | 'active' | 'suspended' | 'removed'
}

const SESSION_HOURS = 8

export async function findUserByEmail(email: string): Promise<SignInUser | null> {
  return opsDb.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, name: true, initials: true, role: true, status: true },
  })
}

export async function findActiveUserByEmail(email: string) {
  const user = await findUserByEmail(email)
  return user && user.status === 'active'
    ? { id: user.id, email: user.email, name: user.name }
    : null
}

/**
 * The client address is never stored. A daily keyed hash lets the Devices list
 * and lockout logic tell repeat addresses apart within a day, and no further.
 */
export function ipHash(ip: string): string {
  const day = new Date().toISOString().slice(0, 10)
  const salt = createHmac('sha256', process.env.OPS_AUTH_SECRET ?? '')
    .update(day)
    .digest()
  return createHash('sha256').update(salt).update(ip).digest('hex')
}

export type SignInRecord = {
  sid: string
  at: Date
  deviceLabel: string
  deviceHash: string
  city: string | null
}

/**
 * One transaction: the session row (device label, device hash, city, country), the audit event,
 * lastSignInAt and, when this browser still carried another Ops session (`previousSid`, e.g. signing
 * in again to change a password), that session's end. Returns the new session id and what the
 * new-device check needs (S03-T02).
 */
export async function recordSignIn(input: {
  userId: string
  method: 'google' | 'password'
  userAgent: string | null
  ip: string
  location?: RequestLocation
  previousSid?: string | null
}): Promise<SignInRecord> {
  const sid = randomUUID()
  const now = new Date()
  const device = describeDevice(input.userAgent)
  const hash = deviceHash(device)
  const city = input.location?.city ?? null
  const country = input.location?.country ?? null
  await opsDb.$transaction([
    ...(input.previousSid
      ? [
          opsDb.userSession.updateMany({
            where: { id: input.previousSid, revokedAt: null },
            data: { revokedAt: now, revokeReason: 'signed_in_again' },
          }),
        ]
      : []),
    opsDb.userSession.create({
      data: {
        id: sid,
        sessionToken: sid,
        userId: input.userId,
        method: input.method,
        userAgent: input.userAgent,
        deviceLabel: device.label,
        deviceHash: hash,
        city,
        country,
        expires: new Date(now.getTime() + SESSION_HOURS * 3600 * 1000),
      },
    }),
    opsDb.authEvent.create({
      data: {
        userId: input.userId,
        kind: 'sign_in',
        method: input.method,
        userAgent: input.userAgent,
        ipHash: ipHash(input.ip),
        city,
        country,
      },
    }),
    opsDb.user.update({ where: { id: input.userId }, data: { lastSignInAt: now } }),
  ])
  return { sid, at: now, deviceLabel: device.label, deviceHash: hash, city }
}

/** A refused sign-in records the email only: no user link for an unknown address. */
export async function recordFailedSignIn(input: {
  email: string
  method: 'google' | 'password'
  userAgent: string | null
  ip: string
}): Promise<void> {
  await opsDb.authEvent.create({
    data: {
      email: input.email || null,
      kind: 'sign_in_failed',
      method: input.method,
      userAgent: input.userAgent,
      ipHash: ipHash(input.ip),
    },
  })
}

/** The user and their session as requireOpsUser needs them (lib/access-core.ts `AccessRow`). */
export type OpsAccessRow = {
  id: string
  email: string
  name: string
  initials: string
  role: 'owner' | 'helper'
  status: string
  canSeeMargins: boolean
  canSendSupplierMail: boolean
  canEditChaserRules: boolean
  session: { revokedAt: Date | null; expires: Date; lastSeenAt: Date; createdAt: Date } | null
}

type AccessJoinRow = Omit<OpsAccessRow, 'session'> & {
  sessionId: string | null
  revokedAt: Date | null
  expires: Date | null
  lastSeenAt: Date | null
  sessionCreatedAt: Date | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The user AND the session row in ONE query (S03-T02). requireOpsUser runs on every page and every
 * server action, so this is the hottest read in Ops. Raw SQL for a documented reason: Prisma 6
 * without the relationJoins preview loads an `include` with a second query, and the guard must stay
 * at one round trip. The session must belong to this user (the JOIN says so) or `session` is null.
 */
export async function loadOpsAccessRow(id: string, sid: string): Promise<OpsAccessRow | null> {
  // A malformed id would make the ::uuid cast throw; it is simply no such row.
  if (!UUID.test(id)) return null
  const sessionId = UUID.test(sid) ? sid : null
  const rows = await opsDb.$queryRaw<AccessJoinRow[]>`
    SELECT u.id, u.email, u.name, u.initials, u.role::text AS role, u.status::text AS status,
           u."canSeeMargins", u."canSendSupplierMail", u."canEditChaserRules",
           s.id AS "sessionId", s."revokedAt", s.expires, s."lastSeenAt",
           s."createdAt" AS "sessionCreatedAt"
      FROM ops."user" u
      LEFT JOIN ops.user_session s ON s.id = ${sessionId}::uuid AND s."userId" = u.id
     WHERE u.id = ${id}::uuid`
  const row = rows[0]
  if (!row) return null
  const { sessionId: found, revokedAt, expires, lastSeenAt, sessionCreatedAt, ...user } = row
  return {
    ...user,
    session:
      found && expires && lastSeenAt && sessionCreatedAt
        ? { revokedAt, expires, lastSeenAt, createdAt: sessionCreatedAt }
        : null,
  }
}

/** The Devices list's "last active": written at most once per session per 5 minutes. */
export const LAST_SEEN_EVERY_MS = 5 * 60_000

/** Conditional, so two requests racing past the 5-minute mark write once between them. */
export async function touchSession(sid: string): Promise<void> {
  await opsDb.$executeRaw`
    UPDATE ops.user_session SET "lastSeenAt" = now()
     WHERE id = ${sid}::uuid AND "lastSeenAt" < now() - interval '5 minutes'`
}
