import 'server-only'
import { opsDb } from '@indus/ops-db'
import { cache } from 'react'
import type { CompanyAssets, CompanyProfile } from '../lib/company-profile'
import { firstName } from '../lib/setup-steps'
import { getSetting, getSettingEntries } from '../server/settings/get'
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
