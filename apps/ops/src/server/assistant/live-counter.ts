import 'server-only'
import { opsDb, Prisma } from '@indus/ops-db'

/**
 * Live counters (S05-T02, C24): the numbers behind the shell's badges, one row per key in `ops.live_counter`.
 * Writers either bump a key by a delta (one upsert) or set it from a fresh count (the mail pipeline recounts
 * after each change, so a missed bump never drifts for long). Readers read every key in one indexed query.
 *
 * Keys written now: mail.unsure, mail.not_linked, mail.needs_you, mail.today, mailbox.worst,
 * assistant.paused, assistant.skipped.
 */
export const COUNTER_KEYS = [
  'mail.unsure',
  'mail.not_linked',
  'mail.needs_you',
  'mail.today',
  'mailbox.worst',
  'assistant.paused',
  'assistant.skipped',
  'review.pending',
  // S05-T09: the pipeline latency window (seconds; n = samples).
  'mail.latency_p50_s',
  'mail.latency_p95_s',
  'mail.latency_n',
] as const
export type CounterKey = (typeof COUNTER_KEYS)[number] | `record:${string}`

/**
 * The stored key for a record's counter: `ops.live_counter.key` is lower case without '/' (its CHECK), so
 * `record:ENQ-2026-0001` is stored as `record:enq-2026-0001`. The live-counts read maps the same way.
 */
export function recordCounterKey(ref: string): `record:${string}` {
  return `record:${ref.toLowerCase().replaceAll('/', '_')}`
}

type Db = Pick<Prisma.TransactionClient, '$executeRaw'> | typeof opsDb

/** Adds `delta` to each key (creating it at `delta`, never below zero). */
export async function bumpCounters(
  keys: readonly CounterKey[],
  delta = 1,
  db: Db = opsDb
): Promise<void> {
  if (keys.length === 0 || delta === 0) return
  // One statement for every key: INSERT … ON CONFLICT DO UPDATE. $executeRaw because Prisma's upsert is one
  // row per call; values are bound parameters.
  await db.$executeRaw`
    INSERT INTO ops.live_counter ("key", "value", "updatedAt")
    SELECT k, GREATEST(${delta}::int, 0), now() FROM unnest(${[...keys]}::text[]) AS k
    ON CONFLICT ("key") DO UPDATE
      SET "value" = GREATEST(ops.live_counter."value" + ${delta}::int, 0), "updatedAt" = now()`
}

/** Sets each key to its value. */
export async function setCounters(
  values: Partial<Record<CounterKey, number>>,
  db: Db = opsDb
): Promise<void> {
  const entries = Object.entries(values).filter(
    (e): e is [string, number] => typeof e[1] === 'number'
  )
  if (entries.length === 0) return
  const keys = entries.map(([k]) => k)
  const vals = entries.map(([, v]) => Math.max(0, Math.trunc(v)))
  await db.$executeRaw`
    INSERT INTO ops.live_counter ("key", "value", "updatedAt")
    SELECT k, v, now() FROM unnest(${keys}::text[], ${vals}::int[]) AS t(k, v)
    ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now()`
}

/** The values of `keys` (missing keys read as 0), one indexed query. */
export async function readCounters(keys: readonly string[]): Promise<Record<string, number>> {
  if (keys.length === 0) return {}
  const rows = await opsDb.liveCounter.findMany({
    where: { key: { in: [...new Set(keys)] } },
    select: { key: true, value: true },
  })
  const out: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]))
  for (const r of rows) out[r.key] = r.value
  return out
}
