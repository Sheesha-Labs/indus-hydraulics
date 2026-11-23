import 'server-only'
import { opsDb } from '@indus/ops-db'
import { cache } from 'react'
import type { CompanyAssets, CompanyProfile } from '../lib/company-profile'
import { firstName } from '../lib/setup-steps'
import { getSetting, getSettingEntries, type SettingEntry } from '../server/settings/get'
import type { SettingKey, SettingValue } from '../server/settings/registry'
import type { SetupProgress } from '../server/setup/progress-core'
import { getSetupProgress, isWelcomeSeen } from '../server/setup/progress'

/**
 * Page reads for the first run (boards 78, 79 and the setup rail; Today's "Finish setup" banner).
 * Settings come through the settings cache; the other reads are at most two queries per request.
 */

export type { SetupProgress }

/** The setup checklist, once per request (the rail, the footer and Today share it). */
export const setupProgress = cache(() => getSetupProgress())

/** Today and Welcome: has the Owner seen the welcome, and how far is setup? Two queries. */
export async function getFirstRunState(
  userId: string
): Promise<{ welcomeSeen: boolean; progress: SetupProgress }> {
  const [welcomeSeen, progress] = await Promise.all([isWelcomeSeen(userId), setupProgress()])
  return { welcomeSeen, progress }
}

export type SetupPerson = { id: string; name: string; firstName: string; role: 'owner' | 'helper' }

/** The Owner and the Helper (invited or active), Owner first. Signatures are kept per person. */
export const setupPeople = cache(async (): Promise<SetupPerson[]> => {
  const rows = await opsDb.user.findMany({
    where: { removedAt: null, status: { in: ['invited', 'active'] } },
    select: { id: true, name: true, role: true },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    firstName: firstName(r.name),
    role: r.role,
  }))
})

export type CompanyStepData = {
  profile: CompanyProfile
  profileVersion: number
  assets: CompanyAssets
  assetsVersion: number
  /** ISO time of the newer of the two settings' last saves. */
  savedAt: string
  /** File names for the asset ids, for "logo.png · Replace". */
  fileNames: Record<string, string>
  people: SetupPerson[]
  maxUploadMb: number
}

/** Setup 1: both company settings (cache), the people (one query) and the asset file names (one). */
export async function getCompanyStep(): Promise<CompanyStepData> {
  const [[profile, assets], intake, people] = await Promise.all([
    getSettingEntries(['company.profile', 'company.assets'] as const),
    getSetting('intake'),
    setupPeople(),
  ])
  const ids = [
    assets.value.logoFileId,
    assets.value.stampFileId,
    ...Object.values(assets.value.signatures),
  ].filter((id): id is string => id !== null)
  const files = ids.length
    ? await opsDb.storedFile.findMany({
        where: { id: { in: ids }, purgedAt: null },
        select: { id: true, filename: true },
      })
    : []
  return {
    profile: profile.value,
    profileVersion: profile.version,
    assets: assets.value,
    assetsVersion: assets.version,
    savedAt: profile.updatedAt > assets.updatedAt ? profile.updatedAt : assets.updatedAt,
    fileNames: Object.fromEntries(files.map((f) => [f.id, f.filename])),
    people,
    maxUploadMb: intake.maxUploadMb,
  }
}

/** A Setup 4 value with what its autosave and its sign-off tag need. */
export type MoneyEntry<T> = { value: T; version: number; awaiting: boolean }

export type MoneyStepData = {
  currency: MoneyEntry<SettingValue<'currency'>>
  fx: MoneyEntry<SettingValue<'fx'>>
  vat: MoneyEntry<SettingValue<'vat'>>
  pricing: MoneyEntry<SettingValue<'pricing.defaults'>>
  /** ISO time of the newest save of the four, or null when none was ever saved. */
  savedAt: string | null
}

function moneyEntry<K extends SettingKey>(e: SettingEntry<K>): MoneyEntry<SettingValue<K>> {
  return { value: e.value, version: e.version, awaiting: e.signoffStatus === 'awaiting' }
}

/** Setup 4: the four money settings in one query (through the settings cache). */
export async function getMoneyStep(): Promise<MoneyStepData> {
  const [currency, fx, vat, pricing] = await getSettingEntries([
    'currency',
    'fx',
    'vat',
    'pricing.defaults',
  ] as const)
  const saved = [currency, fx, vat, pricing].filter((e) => e.version > 0).map((e) => e.updatedAt)
  return {
    currency: moneyEntry(currency),
    fx: moneyEntry(fx),
    vat: moneyEntry(vat),
    pricing: moneyEntry(pricing),
    savedAt: saved.length ? saved.reduce((a, b) => (a > b ? a : b)) : null,
  }
}

export type AssistantStepData = {
  mode: SettingValue<'assistant.mode'>['mode']
  version: number
  savedAt: string | null
  /** The Helper's first name for "Next: invite <name>", or null when there is no Helper yet. */
  helperFirstName: string | null
  /** The undo window of the mode-change toast (the `undo` setting). */
  undoMs: number
}

/** Setup 5: the mode and the undo window (settings cache) and the Helper's name (one query). */
export async function getAssistantStep(): Promise<AssistantStepData> {
  const [[mode, undo], people] = await Promise.all([
    getSettingEntries(['assistant.mode', 'undo'] as const),
    setupPeople(),
  ])
  return {
    mode: mode.value.mode,
    version: mode.version,
    savedAt: mode.version > 0 ? mode.updatedAt : null,
    helperFirstName: people.find((p) => p.role === 'helper')?.firstName ?? null,
    undoMs: undo.value.sendWindowMinutes * 60_000,
  }
}
