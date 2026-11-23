import 'server-only'
import { opsDb } from '@indus/ops-db'
import { randomToken, sha256Hex } from '../../lib/crypto'
import { opsUrl, sendSystemEmail } from '../mail/system-email'
import { googleOnlyEmail, passwordResetEmail } from '../mail/system-templates'
import { authSettings } from './auth-settings'
import { isLocked, minutesRemaining, recordFailure } from './lockout'
import { checkNewPassword, hashSecret, setPasswordHash, type PasswordProblem } from './password'
import { RATE_LIMITS, hit, rateLimitKey } from './rate-limit'
import { normaliseCode, verifyTotp } from './totp'

/**
 * Forgot / new password (board 77, ADR-05, 07 §5.3).
 *
 * `requestPasswordReset` decides what to email; the page always shows the same sentence, and the
 * action runs this after the response (`after()`), so neither the words nor the timing tell an
 * unknown address from a Google-only or a password account. A Google-only account is told by EMAIL
 * that it signs in with Google (decision: the board's on-screen message would reveal the account).
 *
 * The link token is 32 random bytes; only its sha256 is stored. It works once, for
 * `auth.resetMinutes` (default 30). Completing a reset sets the password, marks the token used,
 * signs out every session of the user (revokeReason `password_reset`), clears a lock and writes
 * auth_event `password_reset`, in one transaction.
 */
export type ResetRequestOutcome = 'reset_link' | 'google_only' | 'none' | 'rate_limited'

export async function requestPasswordReset(
  rawEmail: string,
  meta: { ipHash: string }
): Promise<ResetRequestOutcome> {
  const email = rawEmail.trim().toLowerCase()
  const ipOk = await hit(rateLimitKey.resetIp(meta.ipHash), RATE_LIMITS.resetIp)
  const emailOk = email ? await hit(rateLimitKey.resetEmail(email), RATE_LIMITS.resetEmail) : false
  if (!ipOk || !emailOk) return 'rate_limited'

  const user = await opsDb.user.findUnique({
    where: { email },
    select: { id: true, email: true, status: true, passwordHash: true },
  })
  if (!user || user.status !== 'active') return 'none'

  if (!user.passwordHash) {
    const mail = googleOnlyEmail({ signInUrl: opsUrl('/sign-in') })
    await sendSystemEmail({
      kind: 'auth_security_notice',
      to: user.email,
      ...mail,
      // One reminder per address per hour is plenty (the rate limit allows three requests).
      idempotencyKey: `auth.google_only:${user.id}:${Math.floor(Date.now() / 3_600_000)}`,
    })
    return 'google_only'
  }

  const { resetMinutes } = await authSettings()
  const token = randomToken(32)
  const row = await opsDb.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(token),
      expiresAt: new Date(Date.now() + resetMinutes * 60_000),
    },
    select: { id: true },
  })
  const link = opsUrl(`/sign-in/reset/${token}`)
  await sendSystemEmail({
    kind: 'auth_password_reset',
    to: user.email,
    ...passwordResetEmail({ link, minutes: resetMinutes }),
    idempotencyKey: `auth.reset:${row.id}`,
    redactions: [link, token],
  })
  return 'reset_link'
}

export type ResetTokenState =
  | { state: 'valid'; tokenId: string; userId: string; needsCode: boolean }
  | { state: 'expired' | 'used' | 'unknown' }

export async function inspectResetToken(token: string, now = new Date()): Promise<ResetTokenState> {
  const row = await opsDb.passwordResetToken.findUnique({
    where: { tokenHash: sha256Hex(token) },
    select: {
      id: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { id: true, status: true, totpEnabledAt: true } },
    },
  })
  if (!row || row.user.status !== 'active') return { state: 'unknown' }
  if (row.usedAt) return { state: 'used' }
  if (row.expiresAt.getTime() <= now.getTime()) return { state: 'expired' }
  return {
    state: 'valid',
    tokenId: row.id,
    userId: row.user.id,
    needsCode: row.user.totpEnabledAt !== null,
  }
}

export type ResetCompletion =
  | { ok: true; userId: string; secondFactorVerified: boolean }
  | { ok: false; error: 'link'; state: 'expired' | 'used' | 'unknown' }
  | { ok: false; error: 'password'; problem: PasswordProblem }
  | { ok: false; error: 'code' }
  | { ok: false; error: 'locked'; minutes: number }

export async function completePasswordReset(input: {
  token: string
  password: string
  code: string
  meta?: { ipHash?: string | null; userAgent?: string | null }
}): Promise<ResetCompletion> {
  const link = await inspectResetToken(input.token)
  if (link.state !== 'valid') return { ok: false, error: 'link', state: link.state }

  const user = await opsDb.user.findUniqueOrThrow({
    where: { id: link.userId },
    select: {
      id: true,
      lockedUntil: true,
      totpSecretEnc: true,
      totpEnabledAt: true,
      totpLastStep: true,
    },
  })
  if (isLocked(user.lockedUntil)) {
    return { ok: false, error: 'locked', minutes: minutesRemaining(user.lockedUntil!) }
  }

  const policy = await checkNewPassword(user.id, input.password)
  if (!policy.ok) return { ok: false, error: 'password', problem: policy.problem }

  if (link.needsCode) {
    const allowed = await hit(rateLimitKey.totpUser(user.id), RATE_LIMITS.totpUser)
    const verdict = allowed ? await verifyTotp(user, normaliseCode(input.code)) : 'wrong'
    if (verdict !== 'ok') {
      const failure = await recordFailure(user.id, input.meta)
      return failure.locked
        ? { ok: false, error: 'locked', minutes: minutesRemaining(failure.lockedUntil) }
        : { ok: false, error: 'code' }
    }
  }

  const nextHash = await hashSecret(input.password)
  const done = await opsDb.$transaction(async (tx) => {
    const used = await tx.passwordResetToken.updateMany({
      where: { id: link.tokenId, usedAt: null },
      data: { usedAt: new Date() },
    })
    if (used.count !== 1) return false
    await setPasswordHash(user.id, nextHash, tx)
    await tx.userSession.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: 'password_reset' },
    })
    await tx.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    })
    await tx.authEvent.create({
      data: {
        userId: user.id,
        kind: 'password_reset',
        method: 'password',
        ipHash: input.meta?.ipHash ?? null,
        userAgent: input.meta?.userAgent ?? null,
      },
    })
    return true
  })
  if (!done) return { ok: false, error: 'link', state: 'used' }
  return { ok: true, userId: user.id, secondFactorVerified: link.needsCode }
}
