import 'server-only'
import { opsDb } from '@indus/ops-db'
import { AccessError, type OpsUser } from '../../lib/access-core'
import { writeAudit } from '../../lib/audit'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import {
  isSettingKey,
  settingDef,
  SETTING_KEYS,
  type SettingKey,
  type SettingSection,
} from './registry'
import { revalidateSettings, settingSubjectId, type Tx } from './update'

/**
 * Sign-off of seeded defaults (ADR-28). A starred key ships `awaiting`; Settings shows
 * "Default · awaiting sign-off" beside it and Settings home lists it (`listAwaiting`) until the
 * Owner confirms it here. Only the Owner signs off, whatever the Helper's toggles.
 */

const TX_OPTIONS = { maxWait: 20_000, timeout: 10_000 } as const

export type SignedOff = { key: SettingKey; signedOffAt: string; alreadySignedOff: boolean }

export async function markSignedOffInTx(
  tx: Tx,
  key: SettingKey,
  user: OpsUser,
  expectedVersion?: number
): Promise<SignedOff> {
  if (user.role !== 'owner') throw new AccessError('forbidden')
  if (!isSettingKey(key)) throw new SafeError('That setting does not exist.')

  const row = await tx.settingsEntry.findUnique({
    where: { key },
    select: { version: true, signoffStatus: true, signedOffAt: true },
  })
  if (!row) throw new SafeError(SAFE_MESSAGES.gone)
  if (row.signoffStatus === 'signed_off' && row.signedOffAt) {
    return { key, signedOffAt: row.signedOffAt.toISOString(), alreadySignedOff: true }
  }
  if (row.signoffStatus === 'not_required') {
    throw new SafeError('This setting does not need a sign-off.')
  }
  // The Owner confirms the value they were shown, not one changed since.
  if (expectedVersion !== undefined && row.version !== expectedVersion) {
    throw new SafeError(SAFE_MESSAGES.conflict)
  }

  const at = new Date()
  const { count } = await tx.settingsEntry.updateMany({
    where: {
      key,
      signoffStatus: 'awaiting',
      ...(expectedVersion === undefined ? {} : { version: expectedVersion }),
    },
    data: { signoffStatus: 'signed_off', signedOffById: user.id, signedOffAt: at },
  })
  if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)

  await writeAudit(tx, user.id, {
    subjectType: 'settings',
    subjectId: settingSubjectId(key),
    kind: 'settings',
    field: `${key}.signoffStatus`,
    before: 'awaiting',
    after: 'signed_off',
    note: 'Default signed off',
  })
  return { key, signedOffAt: at.toISOString(), alreadySignedOff: false }
}

/** Sign off one key in its own transaction and purge its cache tag. Owner only. */
export async function markSignedOff(
  key: SettingKey,
  user: OpsUser,
  expectedVersion?: number
): Promise<SignedOff> {
  const out = await opsDb.$transaction(
    (tx) => markSignedOffInTx(tx, key, user, expectedVersion),
    TX_OPTIONS
  )
  if (!out.alreadySignedOff) revalidateSettings([key])
  return out
}

export type AwaitingSetting = {
  key: SettingKey
  label: string
  section: SettingSection
  version: number
  updatedAt: string
}

/**
 * Every setting still awaiting the Owner's sign-off, in registry order (Settings home). One query,
 * not cached: Settings home is dynamic and the list must drop a key the moment it is signed off.
 * Templates, terms, guardrails and Autopilot defaults join this list in the sprints that seed them.
 */
export async function listAwaiting(): Promise<AwaitingSetting[]> {
  const rows = await opsDb.settingsEntry.findMany({
    where: { signoffStatus: 'awaiting' },
    select: { key: true, version: true, updatedAt: true },
  })
  const byKey = new Map(rows.map((r) => [r.key, r]))
  return SETTING_KEYS.flatMap((key) => {
    const row = byKey.get(key)
    if (!row) return []
    const { label, section } = settingDef(key)
    return [{ key, label, section, version: row.version, updatedAt: row.updatedAt.toISOString() }]
  })
}
