import 'server-only'
import { opsDb } from '@indus/ops-db'
import { authSettings } from './auth-defaults'

/**
 * Lockout (board 77 "Locked after 5 attempts"; P01 sign-off: 5 attempts, 15 minutes). Wrong
 * passwords and wrong second-factor codes count alike. The attempt that reaches the limit sets
 * `lockedUntil`, resets the counter (so the next lock needs a fresh run of failures) and writes
 * auth_event `locked`, all in one statement plus the event. A success clears both.
 */
export function isLocked(lockedUntil: Date | null | undefined, now = new Date()): boolean {
  return !!lockedUntil && lockedUntil.getTime() > now.getTime()
}

/** Whole minutes left, rounded up: 14 min 1 s → 15; never below 1 while locked. */
export function minutesRemaining(lockedUntil: Date, now = new Date()): number {
  return Math.max(1, Math.ceil((lockedUntil.getTime() - now.getTime()) / 60_000))
}

export type FailureOutcome = { locked: false } | { locked: true; lockedUntil: Date }

export async function recordFailure(
  userId: string,
  meta: { ipHash?: string | null; userAgent?: string | null } = {}
): Promise<FailureOutcome> {
  const { lockAttempts, lockMinutes } = await authSettings()
  const rows = await opsDb.$queryRaw<{ lockedUntil: Date | null; locked: boolean }[]>`
    UPDATE ops."user"
       SET "failedAttempts" = CASE WHEN "failedAttempts" + 1 >= ${lockAttempts}::int THEN 0
                                   ELSE "failedAttempts" + 1 END,
           "lockedUntil"    = CASE WHEN "failedAttempts" + 1 >= ${lockAttempts}::int
                                   THEN now() + make_interval(mins => ${lockMinutes}::int)
                                   ELSE "lockedUntil" END
     WHERE id = ${userId}::uuid
 RETURNING "lockedUntil", ("failedAttempts" = 0 AND "lockedUntil" > now()) AS locked`
  const row = rows[0]
  if (!row?.locked || !row.lockedUntil) return { locked: false }
  await opsDb.authEvent.create({
    data: {
      userId,
      kind: 'locked',
      method: 'password',
      ipHash: meta.ipHash ?? null,
      userAgent: meta.userAgent ?? null,
    },
  })
  return { locked: true, lockedUntil: row.lockedUntil }
}

export async function recordSuccess(userId: string): Promise<void> {
  await opsDb.user.update({
    where: { id: userId },
    data: { failedAttempts: 0, lockedUntil: null },
  })
}
