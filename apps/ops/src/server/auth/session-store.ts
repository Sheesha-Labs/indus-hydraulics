import 'server-only'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { opsDb } from '@indus/ops-db'

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
function ipHash(ip: string): string {
  const day = new Date().toISOString().slice(0, 10)
  const salt = createHmac('sha256', process.env.OPS_AUTH_SECRET ?? '')
    .update(day)
    .digest()
  return createHash('sha256').update(salt).update(ip).digest('hex')
}

/** One transaction: the session row, the audit event and lastSignInAt. Returns the session id. */
export async function recordSignIn(input: {
  userId: string
  method: 'google' | 'password'
  userAgent: string | null
  ip: string
}): Promise<string> {
  const sid = randomUUID()
  const now = new Date()
  await opsDb.$transaction([
    opsDb.userSession.create({
      data: {
        id: sid,
        sessionToken: sid,
        userId: input.userId,
        method: input.method,
        userAgent: input.userAgent,
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
      },
    }),
    opsDb.user.update({ where: { id: input.userId }, data: { lastSignInAt: now } }),
  ])
  return sid
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

export async function loadOpsUserRow(id: string) {
  return opsDb.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      initials: true,
      role: true,
      status: true,
      canSeeMargins: true,
      canSendSupplierMail: true,
      canEditChaserRules: true,
    },
  })
}
