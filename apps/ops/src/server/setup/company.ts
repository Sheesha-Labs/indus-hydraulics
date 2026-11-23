import 'server-only'
import type { ActionContext, Tx } from '../../lib/define-action'
import {
  companyComplete,
  type CompanyAssets,
  type CompanyImageSlot,
  type CompanyProfile,
} from '../../lib/company-profile'
import { SafeError } from '../../lib/safe-message'
import { SETTINGS } from '../settings/registry'
import { revalidateSettings, updateSettingInTx } from '../settings/update'
import { recordStoredFile, type VerifiedObject } from '../storage/uploads'
import { markStep } from './progress'

/**
 * Setup 1 saves (board 79). Each save is one transaction: the version-checked settings update and its
 * activity_event (updateSettingInTx), then the checklist row 'company' — done when the legal name, the
 * TRN, an address and the logo are all present, back to to-do otherwise. The cache tags are purged after
 * the commit.
 */

export type CompanySaveResult = { version: number; complete: boolean; savedAt: string }

async function readProfile(tx: Tx): Promise<CompanyProfile> {
  return parseRow(tx, 'company.profile', SETTINGS['company.profile'].schema)
}

async function readAssets(tx: Tx): Promise<CompanyAssets> {
  return parseRow(tx, 'company.assets', SETTINGS['company.assets'].schema)
}

async function parseRow<T>(
  tx: Tx,
  key: string,
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } }
): Promise<T> {
  const row = await tx.settingsEntry.findUnique({ where: { key }, select: { value: true } })
  const parsed = schema.safeParse(row?.value)
  if (!parsed.success) {
    throw new SafeError('Setup could not read the company details. Reload and try again.')
  }
  return parsed.data
}

async function settleStep(tx: Tx, profile: CompanyProfile, assets: CompanyAssets, userId: string) {
  const complete = companyComplete(profile, assets)
  await markStep('company', complete ? 'done' : 'todo', userId, tx)
  return complete
}

export async function saveCompanyProfile(
  ctx: ActionContext,
  input: CompanyProfile,
  expectedVersion: number,
  confirm: boolean
): Promise<CompanySaveResult> {
  const result = await ctx.withTx(async (tx) => {
    const stored = await readProfile(tx)
    // copiedFrom is the copy script's mark: the form can neither set nor clear it.
    const profile: CompanyProfile = {
      ...input,
      copiedFrom: stored.copiedFrom,
      confirmedAt: confirm ? new Date().toISOString() : stored.confirmedAt,
    }
    const change = await updateSettingInTx(
      tx,
      'company.profile',
      profile,
      expectedVersion,
      ctx.user
    )
    const assets = await readAssets(tx)
    const complete = await settleStep(tx, change.after, assets, ctx.user.id)
    return { version: change.version, complete, savedAt: new Date().toISOString() }
  })
  revalidateSettings(['company.profile'])
  return result
}

export type CompanyAssetResult = CompanySaveResult & { fileId: string; filename: string }

export async function saveCompanyAssets(
  ctx: ActionContext,
  slot: CompanyImageSlot,
  object: VerifiedObject,
  filename: string,
  expectedVersion: number
): Promise<CompanyAssetResult> {
  const result = await ctx.withTx(async (tx) => {
    if (slot.kind === 'signature') {
      const person = await tx.user.findFirst({
        where: { id: slot.userId, removedAt: null, status: { in: ['invited', 'active'] } },
        select: { id: true },
      })
      if (!person)
        throw new SafeError('That person is not on the team any more. Reload and try again.')
    }
    const file = await recordStoredFile(tx, object, filename, ctx.user.id)
    const current = await readAssets(tx)
    const next: CompanyAssets =
      slot.kind === 'logo'
        ? { ...current, logoFileId: file.fileId }
        : slot.kind === 'stamp'
          ? { ...current, stampFileId: file.fileId }
          : { ...current, signatures: { ...current.signatures, [slot.userId]: file.fileId } }
    const change = await updateSettingInTx(tx, 'company.assets', next, expectedVersion, ctx.user)
    const profile = await readProfile(tx)
    const complete = await settleStep(tx, profile, change.after, ctx.user.id)
    return { ...file, version: change.version, complete, savedAt: new Date().toISOString() }
  })
  revalidateSettings(['company.assets'])
  return result
}
