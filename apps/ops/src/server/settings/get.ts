import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { opsDb, type $Enums } from '@indus/ops-db'
import { opsTags } from '../../lib/ops-cache-tags'
import {
  settingDef,
  type CompanyProfile,
  type SettingKey,
  type SettingValue,
  type SignoffStatus,
} from './registry'

/**
 * Reading settings (S03-T04, ADR-01, 05-map-frontend §7.1).
 *
 *   getSetting(key)          one value, parsed with the registry schema
 *   getSettingEntry(key)     the value plus version (for an update), owner-only and sign-off state
 *   getSettings(keys)        several values in ONE query
 *   getSettingEntries(keys)  several entries in one query
 *
 * Two caches: React `cache()` dedupes within a request, and `unstable_cache` keeps the rows across
 * requests under the tags `opsTags.setting(key)` + `opsTags.settings`, purged by `updateSetting`
 * and `markSignedOff`. Rows are cached raw (JSON) and parsed on every read, so a bad row can never
 * be served as a valid one.
 *
 * A stored value that fails its schema THROWS `InvalidSettingError` (logged to Sentry with the key,
 * never the value). There is no silent fallback: a default lives in the database, not here.
 */

// The registry's SignoffStatus must stay the database enum.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
const signoffMatches: Same<SignoffStatus, $Enums.SignoffStatus> = true
void signoffMatches

/**
 * Safety net for rows changed outside `updateSetting` (a migration, a script): the cross-request
 * cache expires after this many seconds even if nobody purged its tag.
 */
export const SETTINGS_CACHE_SECONDS = 300

export type SettingEntry<K extends SettingKey = SettingKey> = {
  key: K
  value: SettingValue<K>
  version: number
  ownerOnly: boolean
  signoffStatus: SignoffStatus
  signedOffById: string | null
  /** ISO timestamps: entries cross the cache as JSON. */
  signedOffAt: string | null
  updatedById: string | null
  updatedAt: string
}

/** A row as stored in the cache: JSON-safe, value not yet parsed. */
export type RawSettingRow = Omit<SettingEntry, 'value' | 'key'> & { key: string; value: unknown }

export class MissingSettingError extends Error {
  constructor(readonly key: string) {
    super(`settings_entry '${key}' is missing; apply the settings_defaults_seed migration`)
    this.name = 'MissingSettingError'
  }
}

export class InvalidSettingError extends Error {
  constructor(
    readonly key: string,
    readonly paths: readonly string[]
  ) {
    // Paths only: a value may hold company details, which never go to logs.
    super(`settings_entry '${key}' does not match its schema at: ${paths.join(', ') || '(root)'}`)
    this.name = 'InvalidSettingError'
  }
}

function logged<E extends Error>(e: E): E {
  Sentry.withScope((scope) => {
    scope.setTag('setting', (e as unknown as { key?: string }).key ?? 'unknown')
    Sentry.captureException(e)
  })
  console.error(`[ops settings] ${e.message}`)
  return e
}

const SELECT = {
  key: true,
  value: true,
  version: true,
  ownerOnly: true,
  signoffStatus: true,
  signedOffById: true,
  signedOffAt: true,
  updatedById: true,
  updatedAt: true,
} as const

/** The rows for `keys`, in one query, straight from the database (no cache). */
export async function loadSettingRows(keys: readonly string[]): Promise<RawSettingRow[]> {
  const rows = await opsDb.settingsEntry.findMany({
    where: { key: { in: [...keys] } },
    select: SELECT,
  })
  return rows.map((r) => ({
    ...r,
    value: r.value as unknown,
    signedOffAt: r.signedOffAt?.toISOString() ?? null,
    updatedAt: r.updatedAt.toISOString(),
  }))
}

/** Parse one stored row with its registry schema; throw (logged) when it does not fit. */
export function parseSettingRow<K extends SettingKey>(key: K, row: RawSettingRow | undefined) {
  if (!row) throw logged(new MissingSettingError(key))
  const parsed = settingDef(key).schema.safeParse(row.value)
  if (!parsed.success) {
    const paths = parsed.error.issues.map((i) => i.path.map(String).join('.'))
    throw logged(new InvalidSettingError(key, paths))
  }
  return { ...row, key, value: parsed.data as SettingValue<K> } satisfies SettingEntry<K>
}

function sortedUnique(keys: readonly SettingKey[]): SettingKey[] {
  return [...new Set(keys)].sort()
}

/** Cross-request cache of the raw rows for one sorted key list. */
function cachedRows(keys: SettingKey[]): Promise<RawSettingRow[]> {
  return unstable_cache(() => loadSettingRows(keys), ['ops-settings', ...keys], {
    tags: [opsTags.settings, ...keys.map(opsTags.setting)],
    revalidate: SETTINGS_CACHE_SECONDS,
  })()
}

/** Per-request memo; the argument is the sorted keys joined, so equal lists share one entry. */
const rowsForRequest = cache((joined: string) => cachedRows(joined.split('|') as SettingKey[]))

async function entries<K extends SettingKey>(keys: readonly K[]): Promise<SettingEntry<K>[]> {
  const sorted = sortedUnique(keys)
  const rows = await rowsForRequest(sorted.join('|'))
  const byKey = new Map(rows.map((r) => [r.key, r]))
  return keys.map((k) => parseSettingRow(k, byKey.get(k)))
}

export async function getSettingEntry<K extends SettingKey>(key: K): Promise<SettingEntry<K>> {
  const [entry] = await entries([key])
  return entry as SettingEntry<K>
}

export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  return (await getSettingEntry(key)).value
}

export async function getSettingEntries<const K extends readonly SettingKey[]>(
  keys: K
): Promise<{ [I in keyof K]: SettingEntry<K[I]> }> {
  return (await entries(keys)) as { [I in keyof K]: SettingEntry<K[I]> }
}

/** Several values in one query: `const [vat, fx] = await getSettings(['vat', 'fx'] as const)`. */
export async function getSettings<const K extends readonly SettingKey[]>(
  keys: K
): Promise<{ [I in keyof K]: SettingValue<K[I]> }> {
  const list = await entries(keys)
  return list.map((e) => e.value) as { [I in keyof K]: SettingValue<K[I]> }
}

/**
 * The company's legal name for sign-in, mail footers and documents, or null while Setup 1 has not
 * filled it (the profile row seeds empty strings; the real name never lives in the repository).
 */
export async function getCompanyLegalName(): Promise<string | null> {
  const profile: CompanyProfile = await getSetting('company.profile')
  return profile.legalName.trim() || null
}

/**
 * S10: a setting read through the caller's transaction (no cache). Inside a transaction at connection_limit=1 a read
 * on the root client waits for the transaction's own connection and deadlocks; services that write in a
 * transaction read their thresholds here.
 */
export async function getSettingIn<K extends SettingKey>(
  tx: { settingsEntry: Pick<typeof opsDb.settingsEntry, 'findUnique'> },
  key: K
): Promise<SettingValue<K>> {
  const r = await tx.settingsEntry.findUnique({ where: { key }, select: SELECT })
  return parseSettingRow(
    key,
    r
      ? {
          ...r,
          value: r.value as unknown,
          signedOffAt: r.signedOffAt?.toISOString() ?? null,
          updatedAt: r.updatedAt.toISOString(),
        }
      : undefined
  ).value
}
