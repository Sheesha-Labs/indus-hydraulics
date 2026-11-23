import 'server-only'
import { formatDate } from '@indus/ops-ui/format'
import { opsDb, type Prisma } from '@indus/ops-db'
import { AccessError, type OpsRole } from '../../lib/access-core'
import { randomToken, sha256Hex } from '../../lib/crypto'
import { SafeError } from '../../lib/safe-message'
import { opsUrl, sendSystemEmail, type SystemEmailResult } from '../mail/system-email'
import { inviteEmail } from '../mail/system-templates'
import { markStep } from '../setup/progress'
import { checkNewPassword, hashSecret, setPasswordHash, PASSWORD_PROBLEM_TEXT } from './password'
import {
  initialsOf,
  inviteDomainVerdict,
  inviteExpiry,
  inviteState,
  nameFromEmail,
  normaliseEmail,
  type DomainVerdict,
  type InviteState,
} from './team-core'

/**
 * Helper invitations (board 84 Team, board 77 "Accept invitation", setup step 6; S03-T03).
 *
 * - One Owner, at most one Helper (architecture §1.2): an invite is refused while a Helper is active
 *   or another invitation is open.
 * - The link token is 32 random bytes; only its sha256 is stored (`user_invite.tokenHash`). It works
 *   once, until `expiresAt` = now + `auth.inviteDays` (default 7). Resend revokes the old link and
 *   issues a new one with a new expiry; Revoke ends it.
 * - Inviting creates (or reuses) the person's `user` row with status `invited`, so the team page and
 *   the setup steps know them by name; nobody can sign in as `invited`.
 * - Accepting with Google (auth.ts signIn callback, `acceptInviteWithGoogle`) or with a password and an
 *   authenticator (`acceptInviteWithPassword`, then T01's enrolment, then `activateInvitedUser`) turns
 *   the row `active`, stamps the invite `acceptedAt` and writes auth_event `invite_accepted`, in one
 *   transaction.
 *
 * Every function that writes takes the caller's transaction: actions pass `ctx.tx`/`ctx.withTx`, the
 * database tests pass one they roll back. Email goes out only after the transaction commits.
 */
export type Tx = Prisma.TransactionClient

export type TeamActor = { id: string; role: OpsRole; name: string }

export type CreatedInvite = {
  inviteId: string
  email: string
  /** The raw link token: emailed once, never stored, never returned to a browser. */
  token: string
  expiresAt: Date
  verdict: DomainVerdict
}

export type InviteOptions = { workspaceDomain: string; inviteDays: number; now?: Date }

export const INVITE_TEXT = {
  domain: (domain: string) =>
    `Invites must be @${domain}. Tick “Allow another domain” to invite this address anyway.`,
  helperExists: 'There is already a Helper. Remove them before inviting someone else.',
  hasAccess: 'That person already has access.',
  openForSame: 'An invitation to that address is already open. Use Resend instead.',
  openForOther: (email: string) =>
    `An invitation to ${email} is still open. Resend or revoke it first.`,
  used: 'That invitation was already accepted.',
  revoked: 'That invitation was revoked. Send a new one.',
  gone: 'That invitation no longer exists. Reload the page.',
} as const

function ownerOnly(actor: TeamActor): void {
  if (actor.role !== 'owner') throw new AccessError('forbidden')
}

const OPEN = (now: Date): Prisma.UserInviteWhereInput => ({
  acceptedAt: null,
  revokedAt: null,
  expiresAt: { gt: now },
})

async function newInviteRow(
  tx: Tx,
  input: { email: string; role: OpsRole; invitedById: string; expiresAt: Date }
): Promise<{ id: string; token: string }> {
  const token = randomToken(32)
  const row = await tx.userInvite.create({
    data: { ...input, tokenHash: sha256Hex(token) },
    select: { id: true },
  })
  return { id: row.id, token }
}

/**
 * Invite a Helper (Owner only). Refuses a foreign domain unless `overrideDomain` (then auth_event
 * `invite_domain_override` records the Owner's choice), an address that already has access, a second
 * Helper and a second open invitation. Marks setup step 6 done.
 */
export async function createInvite(
  tx: Tx,
  actor: TeamActor,
  input: { email: string; overrideDomain: boolean },
  options: InviteOptions
): Promise<CreatedInvite> {
  ownerOnly(actor)
  const now = options.now ?? new Date()
  const email = normaliseEmail(input.email)
  const verdict = inviteDomainVerdict(email, options.workspaceDomain, input.overrideDomain)
  if (verdict === 'refused') throw new SafeError(INVITE_TEXT.domain(options.workspaceDomain))

  // One after another: a transaction runs its statements on one connection anyway.
  const existing = await tx.user.findUnique({
    where: { email },
    select: { id: true, status: true },
  })
  const helper = await tx.user.findFirst({
    where: { role: 'helper', status: 'active' },
    select: { id: true },
  })
  const open = await tx.userInvite.findFirst({ where: OPEN(now), select: { email: true } })
  if (existing?.status === 'active') throw new SafeError(INVITE_TEXT.hasAccess)
  if (helper) throw new SafeError(INVITE_TEXT.helperExists)
  if (open) {
    throw new SafeError(
      open.email === email ? INVITE_TEXT.openForSame : INVITE_TEXT.openForOther(open.email)
    )
  }

  // The person's row, `invited` until they accept: reuse a former one (removed, never-accepted).
  const fresh = { role: 'helper' as const, status: 'invited' as const, removedAt: null }
  const resetFlags = { canSeeMargins: false, canSendSupplierMail: false, canEditChaserRules: false }
  if (existing) {
    await tx.user.update({ where: { id: existing.id }, data: { ...fresh, ...resetFlags } })
  } else {
    const name = nameFromEmail(email)
    await tx.user.create({ data: { email, name, initials: initialsOf(name), ...fresh } })
  }

  const expiresAt = inviteExpiry(now, options.inviteDays)
  const row = await newInviteRow(tx, { email, role: 'helper', invitedById: actor.id, expiresAt })
  await tx.authEvent.createMany({
    data: [
      { userId: actor.id, email, kind: 'invite_sent' },
      ...(verdict === 'override'
        ? [{ userId: actor.id, email, kind: 'invite_domain_override' as const }]
        : []),
    ],
  })
  await markStep('invite', 'done', actor.id, tx)
  return { inviteId: row.id, email, token: row.token, expiresAt, verdict }
}

/** Resend: the old link stops working at once; a new one with a new expiry goes out. */
export async function resendInvite(
  tx: Tx,
  actor: TeamActor,
  inviteId: string,
  options: Omit<InviteOptions, 'workspaceDomain'>
): Promise<CreatedInvite> {
  ownerOnly(actor)
  const now = options.now ?? new Date()
  const old = await tx.userInvite.findUnique({
    where: { id: inviteId },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
    },
  })
  if (!old) throw new SafeError(INVITE_TEXT.gone)
  const state = inviteState(old, now)
  if (state === 'used') throw new SafeError(INVITE_TEXT.used)
  if (state === 'revoked') throw new SafeError(INVITE_TEXT.revoked)
  const { count } = await tx.userInvite.updateMany({
    where: { id: old.id, acceptedAt: null, revokedAt: null },
    data: { revokedAt: now },
  })
  if (count === 0) throw new SafeError(INVITE_TEXT.gone)
  const expiresAt = inviteExpiry(now, options.inviteDays)
  const row = await newInviteRow(tx, {
    email: old.email,
    role: old.role,
    invitedById: actor.id,
    expiresAt,
  })
  await tx.authEvent.create({ data: { userId: actor.id, email: old.email, kind: 'invite_sent' } })
  return { inviteId: row.id, email: old.email, token: row.token, expiresAt, verdict: 'workspace' }
}

/** Revoke: the link stops working; the never-accepted `invited` row is set aside (removed). */
export async function revokeInvite(
  tx: Tx,
  actor: TeamActor,
  inviteId: string,
  now = new Date()
): Promise<'revoked' | 'already_revoked'> {
  ownerOnly(actor)
  const row = await tx.userInvite.findUnique({
    where: { id: inviteId },
    select: { id: true, email: true, acceptedAt: true, revokedAt: true },
  })
  if (!row) throw new SafeError(INVITE_TEXT.gone)
  if (row.acceptedAt) throw new SafeError(INVITE_TEXT.used)
  if (row.revokedAt) return 'already_revoked'
  await tx.userInvite.update({ where: { id: row.id }, data: { revokedAt: now } })
  await tx.user.updateMany({
    where: { email: row.email, status: 'invited' },
    data: { status: 'removed', removedAt: now },
  })
  await tx.authEvent.create({
    data: { userId: actor.id, email: row.email, kind: 'invite_revoked' },
  })
  return 'revoked'
}

/** Email the link (after the transaction committed). The stored copy has the link and token removed. */
export async function sendInviteEmail(
  invite: Pick<CreatedInvite, 'inviteId' | 'email' | 'token' | 'expiresAt'>,
  inviterName: string
): Promise<SystemEmailResult> {
  const link = opsUrl(`/sign-in/invite/${invite.token}`)
  return sendSystemEmail({
    kind: 'auth_invite',
    to: invite.email,
    ...inviteEmail({ inviterName, link, expires: formatDate(invite.expiresAt) }),
    idempotencyKey: `auth.invite:${invite.inviteId}`,
    redactions: [link, invite.token],
  })
}

// ── Opening the link ───────────────────────────────────────────────────────────────────────────

export type InviteView =
  | { state: 'unknown' }
  | {
      state: InviteState
      inviteId: string
      email: string
      role: OpsRole
      expiresAt: Date
      inviterName: string
    }

/** What /sign-in/invite/[token] shows. The token is looked up by its sha256. */
export async function inspectInvite(
  token: string,
  now = new Date(),
  db: Pick<Tx, 'userInvite'> = opsDb
): Promise<InviteView> {
  const row = await db.userInvite.findUnique({
    where: { tokenHash: sha256Hex(token) },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
      invitedBy: { select: { name: true } },
    },
  })
  if (!row) return { state: 'unknown' }
  return {
    state: inviteState(row, now),
    inviteId: row.id,
    email: row.email,
    role: row.role,
    expiresAt: row.expiresAt,
    inviterName: row.invitedBy.name,
  }
}

export type AcceptRefusal = 'unknown' | InviteState | 'email_mismatch' | 'helper_exists'

export type AcceptOutcome = { ok: true; userId: string } | { ok: false; reason: AcceptRefusal }

/**
 * Accept: stamp the invite (only while still open: two tabs cannot both accept), make the person's
 * row active with the invited role, and write auth_event invite_accepted. Shared by both ways in.
 */
async function accept(
  tx: Tx,
  invite: { id: string; email: string; role: OpsRole },
  method: 'google' | 'password',
  now: Date,
  name?: string | null
): Promise<AcceptOutcome> {
  const other = await tx.user.findFirst({
    where: { role: 'helper', status: 'active', email: { not: invite.email } },
    select: { id: true },
  })
  if (invite.role === 'helper' && other) return { ok: false, reason: 'helper_exists' }
  const { count } = await tx.userInvite.updateMany({
    where: { id: invite.id, ...OPEN(now) },
    data: { acceptedAt: now },
  })
  if (count === 0) return { ok: false, reason: 'used' }
  const existing = await tx.user.findUnique({
    where: { email: invite.email },
    select: { id: true, name: true },
  })
  const fullName = name?.trim() || existing?.name || nameFromEmail(invite.email)
  const data = {
    role: invite.role,
    status: 'active' as const,
    removedAt: null,
    name: fullName,
    initials: initialsOf(fullName),
  }
  const user = existing
    ? await tx.user.update({ where: { id: existing.id }, data, select: { id: true } })
    : await tx.user.create({ data: { email: invite.email, ...data }, select: { id: true } })
  await tx.authEvent.create({
    data: { userId: user.id, email: invite.email, kind: 'invite_accepted', method },
  })
  return { ok: true, userId: user.id }
}

/**
 * Google: the signIn callback calls this with the email Google verified. It must be the invited
 * address exactly (case-insensitive); anything else is refused and nothing changes.
 */
export async function acceptInviteWithGoogle(
  tx: Tx,
  input: { token: string; email: string; name?: string | null; now?: Date }
): Promise<AcceptOutcome> {
  const now = input.now ?? new Date()
  const view = await inspectInvite(input.token, now, tx)
  if (view.state === 'unknown') return { ok: false, reason: 'unknown' }
  if (view.state !== 'valid') return { ok: false, reason: view.state }
  if (normaliseEmail(input.email) !== view.email) return { ok: false, reason: 'email_mismatch' }
  return accept(
    tx,
    { id: view.inviteId, email: view.email, role: view.role },
    'google',
    now,
    input.name
  )
}

/** The signIn callback's call: acceptInviteWithGoogle in its own transaction. */
export function acceptGoogleInvite(input: {
  token: string
  email: string
  name?: string | null
}): Promise<AcceptOutcome> {
  return opsDb.$transaction((tx) => acceptInviteWithGoogle(tx, input))
}

/** finishTotpSetup's call: activateInvitedUser in its own transaction. */
export function activateInvitedUserNow(userId: string): Promise<AcceptOutcome> {
  return opsDb.$transaction((tx) => activateInvitedUser(tx, userId))
}

export type PasswordAcceptOutcome =
  | { ok: true; userId: string }
  | { ok: false; reason: AcceptRefusal }
  | { ok: false; reason: 'password'; message: string }

/**
 * Password, step one: the invite must be open; the password meets T01's policy (12+, strong, not
 * reused). It is stored on the still-`invited` row; the row turns active only once the authenticator
 * is enrolled (`activateInvitedUser`), so no session exists before both factors do.
 */
export async function acceptInviteWithPassword(input: {
  token: string
  password: string
  now?: Date
}): Promise<PasswordAcceptOutcome> {
  const now = input.now ?? new Date()
  const view = await inspectInvite(input.token, now)
  if (view.state === 'unknown') return { ok: false, reason: 'unknown' }
  if (view.state !== 'valid') return { ok: false, reason: view.state }
  const user = await opsDb.user.findUnique({
    where: { email: view.email },
    select: { id: true, status: true },
  })
  if (!user || user.status !== 'invited') return { ok: false, reason: 'used' }
  const policy = await checkNewPassword(user.id, input.password)
  if (!policy.ok)
    return { ok: false, reason: 'password', message: PASSWORD_PROBLEM_TEXT[policy.problem] }
  // Argon2id outside the transaction: it is slow and the transaction holds the only connection.
  const hash = await hashSecret(input.password)
  await opsDb.$transaction(async (tx) => {
    await setPasswordHash(user.id, hash, tx)
    await tx.authEvent.create({
      data: { userId: user.id, kind: 'password_set', method: 'password' },
    })
  })
  return { ok: true, userId: user.id }
}

/**
 * Password, last step (after the authenticator's first code verified): accept the person's open
 * invitation and make them active, in one transaction. False when the invitation was revoked,
 * expired or accepted in the meantime: then no session is created.
 */
export async function activateInvitedUser(
  tx: Tx,
  userId: string,
  now = new Date()
): Promise<AcceptOutcome> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { email: true, status: true },
  })
  if (!user) return { ok: false, reason: 'unknown' }
  if (user.status === 'active') return { ok: true, userId }
  if (user.status !== 'invited') return { ok: false, reason: 'revoked' }
  const invite = await tx.userInvite.findFirst({
    where: { email: user.email, ...OPEN(now) },
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, role: true },
  })
  if (!invite) return { ok: false, reason: 'expired' }
  return accept(tx, invite, 'password', now)
}
