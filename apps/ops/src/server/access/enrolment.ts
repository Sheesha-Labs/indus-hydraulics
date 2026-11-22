import 'server-only'
import { opsDb } from '@indus/ops-db'
import { prepareBackupCodes, storeBackupCodes } from './backup-codes'
import { PENDING_TTL_MS, newPending, type PendingTwoFactor } from './pending-2fa'
import { RATE_LIMITS, hit, rateLimitKey } from './rate-limit'
import { enableTotp, newTotpSecret, normaliseCode } from './totp'
import { matchStep } from './totp-core'

/**
 * Authenticator enrolment (/sign-in/two-factor/setup): a new secret waits, sealed in the pending-2FA
 * cookie (purpose `enrol`), until its first code verifies. Then, in one transaction, the secret is
 * stored encrypted, the code's step is recorded (so it cannot be replayed to sign in), ten backup
 * codes replace any old ones, and auth_event `totp_enabled` is written. The codes are returned to be
 * shown once.
 *
 * Who may start one: a signed-in user (Settings › Security) or the invite acceptance flow (S03-T03,
 * `signInAfter`). The password step never starts one: a stolen password must not be able to enrol
 * its own authenticator.
 */
export function beginEnrolment(input: {
  userId: string
  next?: string
  signInAfter?: boolean
}): PendingTwoFactor {
  return newPending({
    uid: input.userId,
    purpose: 'enrol',
    pendingSecret: newTotpSecret(),
    ...(input.next ? { next: input.next } : {}),
    ...(input.signInAfter ? { signInAfter: true } : {}),
  })
}

/**
 * Was this enrolment confirmed? True when the user's authenticator was enabled after the pending
 * value was issued. The invite flow uses it before turning the enrolment into a sign-in proof.
 */
export async function confirmedSince(pending: PendingTwoFactor): Promise<boolean> {
  const issuedAt = new Date(pending.exp - PENDING_TTL_MS)
  const user = await opsDb.user.findUnique({
    where: { id: pending.uid },
    select: { totpEnabledAt: true },
  })
  return !!user?.totpEnabledAt && user.totpEnabledAt.getTime() >= issuedAt.getTime()
}

export type EnrolmentResult =
  | { ok: true; backupCodes: string[] }
  | { ok: false; reason: 'wrong_code' | 'rate_limited' | 'expired' }

export async function confirmEnrolment(
  pending: PendingTwoFactor,
  rawCode: string,
  options: { epochSeconds?: number; meta?: { ipHash?: string; userAgent?: string | null } } = {}
): Promise<EnrolmentResult> {
  if (pending.purpose !== 'enrol' || !pending.pendingSecret) return { ok: false, reason: 'expired' }
  const user = await opsDb.user.findUnique({
    where: { id: pending.uid },
    select: { id: true, status: true },
  })
  if (!user || (user.status !== 'active' && !pending.signInAfter)) {
    return { ok: false, reason: 'expired' }
  }
  if (!(await hit(rateLimitKey.totpUser(user.id), RATE_LIMITS.totpUser))) {
    return { ok: false, reason: 'rate_limited' }
  }
  const step = matchStep(
    pending.pendingSecret,
    normaliseCode(rawCode),
    options.epochSeconds === undefined ? {} : { epochSeconds: options.epochSeconds }
  )
  if (step === null) return { ok: false, reason: 'wrong_code' }

  const secret = pending.pendingSecret
  const prepared = await prepareBackupCodes()
  const backupCodes = await opsDb.$transaction(async (tx) => {
    await enableTotp(user.id, secret, step, tx)
    const codes = await storeBackupCodes(user.id, prepared, tx)
    await tx.authEvent.create({
      data: {
        userId: user.id,
        kind: 'totp_enabled',
        method: 'password',
        ipHash: options.meta?.ipHash ?? null,
        userAgent: options.meta?.userAgent ?? null,
      },
    })
    return codes
  })
  return { ok: true, backupCodes }
}
