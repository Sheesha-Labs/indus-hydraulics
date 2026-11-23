import { hash, verify } from '@node-rs/argon2'
import { ZxcvbnFactory } from '@zxcvbn-ts/core'
import { adjacencyGraphs, dictionary } from '@zxcvbn-ts/language-common'

/**
 * Password hashing and the new-password rule (ADR-05, board 77 "12+ characters · not used before ·
 * strong"). No database here, so the rule is unit-testable on its own; `password.ts` stores.
 *
 * Argon2id at OWASP's second profile: 19 MiB, 2 passes, 1 lane.
 */
export const ARGON2_OPTIONS = {
  algorithm: 2, // Argon2id
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const

export const MIN_PASSWORD_LENGTH = 12
export const MIN_STRENGTH_SCORE = 3
export const PASSWORD_HISTORY = 5

export function hashSecret(secret: string): Promise<string> {
  return hash(secret, ARGON2_OPTIONS)
}

/** False for a malformed hash as well as a mismatch: never throws on stored data. */
export async function verifySecret(stored: string, secret: string): Promise<boolean> {
  try {
    return await verify(stored, secret)
  } catch {
    return false
  }
}

/**
 * A fixed Argon2id hash of a random string, verified when the account does not exist or has no
 * password, so the password step costs the same either way and its timing does not reveal accounts.
 */
let dummy: Promise<string> | undefined
export async function dummyVerify(secret: string): Promise<void> {
  dummy ??= hashSecret(`no-account-${Math.random()}`)
  await verifySecret(await dummy, secret)
}

let zxcvbn: ZxcvbnFactory | undefined
function strength(password: string, userInputs: string[]): number {
  zxcvbn ??= new ZxcvbnFactory({ dictionary, graphs: adjacencyGraphs })
  // "owner.example@x" and "Owner Example" count whole and word by word.
  const words = userInputs.flatMap((s) => [
    s.toLowerCase(),
    ...s
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3),
  ])
  return zxcvbn.check(password, words).score
}

export type PasswordProblem = 'too_short' | 'too_weak' | 'reused'

export const PASSWORD_PROBLEM_TEXT: Record<PasswordProblem, string> = {
  too_short: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  too_weak: 'That password is easy to guess. Add words or characters.',
  reused: 'You have used that password before. Choose a new one.',
}

/**
 * The rule for a new password: 12+ characters, zxcvbn score ≥ 3 (with the person's email and name
 * as context), and not equal to the current password or any of the last five.
 */
export async function validateNewPassword(
  password: string,
  history: readonly string[],
  context: string[] = []
): Promise<{ ok: true } | { ok: false; problem: PasswordProblem }> {
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, problem: 'too_short' }
  if (strength(password, context) < MIN_STRENGTH_SCORE) return { ok: false, problem: 'too_weak' }
  for (const old of history.slice(0, PASSWORD_HISTORY)) {
    if (await verifySecret(old, password)) return { ok: false, problem: 'reused' }
  }
  return { ok: true }
}

/** Score 0–4 for the board's four-segment meter (filled segments = score, at least one once typed). */
export function strengthScore(password: string, context: string[] = []): number {
  return password ? strength(password, context) : 0
}
