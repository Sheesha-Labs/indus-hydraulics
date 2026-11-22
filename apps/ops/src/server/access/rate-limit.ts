import 'server-only'
import { opsDb } from '@indus/ops-db'
import { sha256Hex } from '../../lib/crypto'

/**
 * Postgres fixed-window rate limits (architecture §4.11). `ops.hit_rate_limit` upserts the current
 * window's counter atomically and answers whether this hit is still within the limit. Keys carry
 * hashes only: an IP is the daily keyed `ipHash` of session-store, an email its sha256.
 */
export type RateLimitRule = { windowSeconds: number; max: number }

export const RATE_LIMITS = {
  /** Password step attempts from one address. */
  signinIp: { windowSeconds: 15 * 60, max: 20 },
  /** Reset requests from one address. */
  resetIp: { windowSeconds: 60 * 60, max: 5 },
  /** Reset emails to one address. */
  resetEmail: { windowSeconds: 60 * 60, max: 3 },
  /** Second-factor attempts for one user. */
  totpUser: { windowSeconds: 15 * 60, max: 10 },
} as const satisfies Record<string, RateLimitRule>

export const rateLimitKey = {
  signinIp: (ipHash: string) => `signin-ip:${ipHash}`,
  resetIp: (ipHash: string) => `reset-ip:${ipHash}`,
  resetEmail: (email: string) => `reset-email:${sha256Hex(email.trim().toLowerCase())}`,
  totpUser: (userId: string) => `totp-user:${userId}`,
}

type Runner = {
  $queryRaw: <T>(query: TemplateStringsArray, ...values: unknown[]) => Promise<T>
}

/**
 * A one-time marker: TRUE the first time `key` is spent, FALSE on every later call. The row's
 * windowStart is the moment the marker stops mattering (`until`), so the nightly purge of old
 * windows removes it only after the thing it guards has expired anyway.
 */
export async function spendOnce(key: string, until: Date): Promise<boolean> {
  const inserted = await opsDb.$executeRaw`
    INSERT INTO ops.rate_limit_counter ("key", "windowStart", "count")
    VALUES (${key}, ${until}, 1)
    ON CONFLICT ("key", "windowStart") DO NOTHING`
  return inserted === 1
}

/** TRUE while the hit is within the limit; FALSE once it is over. */
export async function hit(
  key: string,
  rule: RateLimitRule,
  db: Runner = opsDb as unknown as Runner
): Promise<boolean> {
  const rows = await db.$queryRaw<{ allowed: boolean }[]>`
    SELECT ops.hit_rate_limit(${key}::text, ${rule.windowSeconds}::int, ${rule.max}::int) AS allowed`
  return rows[0]?.allowed === true
}
