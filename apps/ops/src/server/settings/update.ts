import 'server-only'
import { revalidateTag } from 'next/cache'
import { opsDb, type Prisma } from '@indus/ops-db'
import type { FieldErrors } from '@indus/ops-core'
import { AccessError, can, type HelperFlag, type OpsUser } from '../../lib/access-core'
import { writeAudit } from '../../lib/audit'
import { opsTags } from '../../lib/ops-cache-tags'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import { isSettingKey, settingDef, type SettingKey, type SettingValue } from './registry'
import { settingSubjectId } from './subject-id'

export { settingSubjectId }

/**
 * Changing a setting (S03-T04): permission, schema, a version-checked UPDATE, the audit row in the
 * same transaction, then the cache tag. `updateSettingAction` (src/actions/settings.ts) is the
 * person-facing door; services and the setup wizard may call `updateSetting` directly, or
 * `updateSettingInTx` to save several keys in one transaction and `revalidateSettings` after it
 * commits.
 */

/** The action's transaction client. */
export type Tx = Prisma.TransactionClient

/** The same budget as defineAction's transactions (ADR-04: below statement_timeout). */
const TX_OPTIONS = { maxWait: 20_000, timeout: 10_000 } as const

export type SettingChange<K extends SettingKey = SettingKey> = {
  key: K
  /** The new version: pass it as `expectedVersion` for the next change. */
  version: number
  before: unknown
  after: SettingValue<K>
}

/** A value that fails its schema. Carries field errors keyed like `value.floorPct`. */
export class SettingInvalidError extends SafeError {
  constructor(readonly fieldErrors: FieldErrors) {
    super(SAFE_MESSAGES.invalid)
    this.name = 'SettingInvalidError'
  }
}

/** May this person change this key? Owner-only keys need `change_settings`. */
export function mayChangeSetting(
  user: Pick<OpsUser, 'role' | HelperFlag>,
  key: SettingKey,
  rowOwnerOnly = false
): boolean {
  const ownerOnly = settingDef(key).ownerOnly || rowOwnerOnly
  return !ownerOnly || can(user, 'change_settings')
}

/** Validate `value` for `key`; throws SettingInvalidError with `value.<path>` field errors. */
export function validateSettingValue<K extends SettingKey>(
  key: K,
  value: unknown
): SettingValue<K> {
  const parsed = settingDef(key).schema.safeParse(value)
  if (parsed.success) return parsed.data as SettingValue<K>
  const fieldErrors: FieldErrors = {}
  for (const issue of parsed.error.issues) {
    const path = ['value', ...issue.path.map(String)].join('.')
    if (!(path in fieldErrors)) fieldErrors[path] = issue.message
  }
  throw new SettingInvalidError(fieldErrors)
}

async function checkCurrencies(tx: Tx, key: SettingKey, value: unknown): Promise<void> {
  const codes = settingDef(key).currencies?.(value) ?? []
  if (codes.length === 0) return
  const wanted = [...new Set(codes)]
  const known = await tx.currency.findMany({
    where: { code: { in: wanted }, active: true },
    select: { code: true },
  })
  const knownSet = new Set(known.map((c) => c.code))
  const missing = wanted.filter((c) => !knownSet.has(c))
  if (missing.length > 0) {
    throw new SettingInvalidError({
      value: `Not a currency Indus Operations uses: ${missing.join(', ')}.`,
    })
  }
}

/**
 * Save `value` for `key` inside `tx` when the row is still at `expectedVersion`. Writes the
 * activity_event row in the same transaction. Does NOT purge the cache: call
 * `revalidateSettings([key])` after the transaction commits.
 */
export async function updateSettingInTx<K extends SettingKey>(
  tx: Tx,
  key: K,
  value: unknown,
  expectedVersion: number,
  user: OpsUser
): Promise<SettingChange<K>> {
  if (!isSettingKey(key)) throw new SafeError('That setting does not exist.')
  if (!mayChangeSetting(user, key)) throw new AccessError('forbidden')
  const after = validateSettingValue(key, value)
  await checkCurrencies(tx, key, after)

  const before = await tx.settingsEntry.findUnique({
    where: { key },
    select: { value: true, version: true, ownerOnly: true },
  })
  if (!before) throw new SafeError(SAFE_MESSAGES.gone)
  if (!mayChangeSetting(user, key, before.ownerOnly)) throw new AccessError('forbidden')
  if (before.version !== expectedVersion) throw new SafeError(SAFE_MESSAGES.conflict)

  const { count } = await tx.settingsEntry.updateMany({
    where: { key, version: expectedVersion },
    data: {
      value: after as Prisma.InputJsonValue,
      version: { increment: 1 },
      updatedById: user.id,
    },
  })
  // Someone else's update committed between our read and our write.
  if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)

  await writeAudit(tx, user.id, {
    subjectType: 'settings',
    subjectId: settingSubjectId(key),
    kind: 'settings',
    field: key,
    before: before.value as Prisma.InputJsonValue,
    after: after as Prisma.InputJsonValue,
    sensitive: settingDef(key).sensitive ?? false,
  })

  return { key, version: expectedVersion + 1, before: before.value, after }
}

/** Purge the cached rows of `keys`. Call only after the transaction that changed them commits. */
export function revalidateSettings(keys: readonly SettingKey[]): void {
  // expire 0: the next read goes to the database, also from a route handler or a job, where
  // updateTag (Server Actions only) is not allowed.
  for (const key of new Set(keys)) revalidateTag(opsTags.setting(key), { expire: 0 })
}

/**
 * Save one setting in its own transaction and purge its cache tag.
 *
 * Refusals (thrown, mapped to a sentence by defineAction): AccessError('forbidden') for a Helper on
 * an owner-only key; SettingInvalidError for a value outside its schema; SafeError with
 * "Someone changed this a moment ago. Reload and try again." when the row is no longer at
 * `expectedVersion`.
 */
export async function updateSetting<K extends SettingKey>(
  key: K,
  value: unknown,
  expectedVersion: number,
  user: OpsUser
): Promise<SettingChange<K>> {
  // Refuse what needs no database before taking the instance's one connection (ADR-04). The
  // transaction repeats both checks, against the row as well.
  if (!isSettingKey(key)) throw new SafeError('That setting does not exist.')
  if (!mayChangeSetting(user, key)) throw new AccessError('forbidden')
  validateSettingValue(key, value)
  const change = await opsDb.$transaction(
    (tx) => updateSettingInTx(tx, key, value, expectedVersion, user),
    TX_OPTIONS
  )
  revalidateSettings([key])
  return change
}
