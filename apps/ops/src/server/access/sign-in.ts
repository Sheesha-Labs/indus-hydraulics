import 'server-only'
import { opsDb } from '@indus/ops-db'
import { sha256Hex } from '../../lib/crypto'
import { authSettings } from './auth-settings'
import { consumeBackupCode, normaliseBackupCode } from './backup-codes'
import { isLocked, minutesRemaining, recordFailure, recordSuccess } from './lockout'
import { dummyVerify, verifySecret } from './password'
import { openPending, type PendingTwoFactor } from './pending-2fa'
import { RATE_LIMITS, hit, rateLimitKey, spendOnce } from './rate-limit'
import { normaliseCode, verifyTotp } from './totp'

/**
 * The password path of board 77 (ADR-05, 07 §5.3), in two steps. A password is never enough:
 *
 *   1. `passwordStep` — email + password. Success only proves the password; the caller sets the
 *      sealed pending-2FA cookie and sends the person to /sign-in/two-factor.
 *   2. `secondFactorStep` — run by the `ops-password` Credentials provider's authorize: the pending
 *      cookie plus a TOTP code, a backup code, or (once) the proof of an enrolment or reset that has
 *      just verified a code. Only then does Auth.js issue a session.
 *
 * Enumeration: an unknown, inactive or password-less account takes the same Argon2id verify (against
 * a dummy hash), gets the same "don't match" answer and locks after the same number of tries (a
 * per-email counter stands in for the user row), so neither words nor timing reveal an account.
 */
export type RequestMeta = { ipHash: string; userAgent: string | null }

export type PasswordStepOutcome =
  | { kind: 'ok'; userId: string }
  | { kind: 'invalid' }
  | { kind: 'locked'; minutes: number }
  | { kind: 'rate_limited' }
  /** Password right, but no authenticator: password sign-in stays closed until one is set up. */
  | { kind: 'no_second_factor' }

const failureEvent = (email: string, meta: RequestMeta, userId?: string) =>
  opsDb.authEvent.create({
    data: {
      ...(userId ? { userId } : {}),
      email: email || null,
      kind: 'sign_in_failed',
      method: 'password',
      ipHash: meta.ipHash,
      userAgent: meta.userAgent,
    },
  })

/** Stand-in lock for addresses without a password account, so they lock like real ones. */
async function phantomFailure(email: string): Promise<PasswordStepOutcome> {
  const { lockAttempts, lockMinutes } = await authSettings()
  const key = `signin-email:${sha256Hex(email)}`
  const within = await hit(key, { windowSeconds: lockMinutes * 60, max: lockAttempts - 1 })
  return within ? { kind: 'invalid' } : { kind: 'locked', minutes: lockMinutes }
}

export async function passwordStep(input: {
  email: string
  password: string
  meta: RequestMeta
}): Promise<PasswordStepOutcome> {
  const email = input.email.trim().toLowerCase()
  if (!(await hit(rateLimitKey.signinIp(input.meta.ipHash), RATE_LIMITS.signinIp))) {
    return { kind: 'rate_limited' }
  }
  const user = email
    ? await opsDb.user.findUnique({
        where: { email },
        select: {
          id: true,
          status: true,
          passwordHash: true,
          lockedUntil: true,
          totpEnabledAt: true,
        },
      })
    : null

  if (!user || user.status !== 'active' || !user.passwordHash) {
    await dummyVerify(input.password)
    await failureEvent(email, input.meta)
    return phantomFailure(email)
  }
  if (isLocked(user.lockedUntil)) {
    await failureEvent(email, input.meta, user.id)
    return { kind: 'locked', minutes: minutesRemaining(user.lockedUntil!) }
  }
  if (!(await verifySecret(user.passwordHash, input.password))) {
    await failureEvent(email, input.meta, user.id)
    const failure = await recordFailure(user.id, input.meta)
    return failure.locked
      ? { kind: 'locked', minutes: minutesRemaining(failure.lockedUntil) }
      : { kind: 'invalid' }
  }
  if (!user.totpEnabledAt) return { kind: 'no_second_factor' }
  return { kind: 'ok', userId: user.id }
}

/** Why a second-factor attempt failed. These codes travel in the URL: none says more than this. */
export type SecondFactorFailure = 'expired' | 'wrong_code' | 'locked' | 'rate_limited'

export type SecondFactorOutcome =
  | {
      ok: true
      user: { id: string; email: string; name: string }
      usedBackupCode: boolean
    }
  | { ok: false; reason: SecondFactorFailure; minutes?: number }

export async function secondFactorStep(input: {
  pending: string
  code?: string | undefined
  backupCode?: string | undefined
  meta: RequestMeta
}): Promise<SecondFactorOutcome> {
  const pending: PendingTwoFactor | null = openPending(input.pending, { purpose: 'signin' })
  if (!pending) return { ok: false, reason: 'expired' }

  const user = await opsDb.user.findUnique({
    where: { id: pending.uid },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      lockedUntil: true,
      totpSecretEnc: true,
      totpEnabledAt: true,
      totpLastStep: true,
    },
  })
  if (!user || user.status !== 'active') return { ok: false, reason: 'expired' }
  if (isLocked(user.lockedUntil)) {
    return { ok: false, reason: 'locked', minutes: minutesRemaining(user.lockedUntil!) }
  }

  const fail = async (): Promise<SecondFactorOutcome> => {
    await failureEvent(user.email, input.meta, user.id)
    const failure = await recordFailure(user.id, input.meta)
    return failure.locked
      ? { ok: false, reason: 'locked', minutes: minutesRemaining(failure.lockedUntil) }
      : { ok: false, reason: 'wrong_code' }
  }
  const success = async (usedBackupCode: boolean): Promise<SecondFactorOutcome> => {
    await recordSuccess(user.id)
    if (usedBackupCode) {
      await opsDb.authEvent.create({
        data: {
          userId: user.id,
          kind: 'backup_code_used',
          method: 'password',
          ipHash: input.meta.ipHash,
          userAgent: input.meta.userAgent,
        },
      })
    }
    return { ok: true, user: { id: user.id, email: user.email, name: user.name }, usedBackupCode }
  }

  // An enrolment or a reset has just verified a code for this person: that was the second factor.
  // The proof works once (its nonce is spent) and only until the pending cookie expires.
  if (pending.proof) {
    const fresh = await spendOnce(`pending-proof:${pending.nonce}`, new Date(pending.exp))
    return fresh ? success(false) : { ok: false, reason: 'expired' }
  }

  if (!(await hit(rateLimitKey.totpUser(user.id), RATE_LIMITS.totpUser))) {
    return { ok: false, reason: 'rate_limited' }
  }

  if (input.backupCode) {
    if (!normaliseBackupCode(input.backupCode)) return fail()
    return (await consumeBackupCode(user.id, input.backupCode)) ? success(true) : fail()
  }

  const verdict = await verifyTotp(user, normaliseCode(input.code ?? ''))
  // Not enrolled cannot pass: the password step refuses before a pending cookie is ever set.
  return verdict === 'ok' ? success(false) : fail()
}
