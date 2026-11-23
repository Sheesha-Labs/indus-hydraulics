import type { SettingValue } from '../server/settings/registry'

/**
 * Setup 1 (board 79) rules shared by the form (client) and the save action (server). Pure.
 */
export type CompanyProfile = SettingValue<'company.profile'>
export type CompanyAssets = SettingValue<'company.assets'>

/** One image tile of Setup 1: the logo, the stamp, or one person's signature. */
export type CompanyImageSlot =
  { kind: 'logo' } | { kind: 'stamp' } | { kind: 'signature'; userId: string }

/** Step 1 is done when the legal name, a valid TRN, an address and the logo are all present. */
export function companyComplete(profile: CompanyProfile, assets: CompanyAssets): boolean {
  return (
    profile.legalName.trim().length > 0 &&
    /^\d{15}$/.test(profile.trn) &&
    profile.addressLines.some((l) => l.trim().length > 0) &&
    assets.logoFileId !== null
  )
}

/** "Copied from previous setup — check" shows while the copy script's values are unconfirmed. */
export function copiedUnconfirmed(profile: CompanyProfile): boolean {
  return profile.copiedFrom !== null && profile.confirmedAt === null
}

/** A TRN as typed: spaces and hyphens dropped. Valid when empty or 15 digits. */
export function normaliseTrn(raw: string): string {
  return raw.replace(/[\s-]/g, '')
}

export function trnError(trn: string): string | null {
  return trn === '' || /^\d{15}$/.test(trn) ? null : 'A TRN is 15 digits.'
}

const MAX_LINES = 6

/**
 * The board draws the address as one field. It is stored as lines (the letterhead breaks it), so a comma
 * starts a new line; more than six parts fold into the sixth.
 */
export function addressLinesFrom(input: string): string[] {
  const parts = input
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.slice(0, 200))
  if (parts.length <= MAX_LINES) return parts
  return [
    ...parts.slice(0, MAX_LINES - 1),
    parts
      .slice(MAX_LINES - 1)
      .join(', ')
      .slice(0, 200),
  ]
}

export function addressText(lines: readonly string[]): string {
  return lines.join(', ')
}

/** The letterhead's two address rows: the first half of the lines, then the rest with the phone. */
export function letterheadRows(lines: readonly string[], phone: string): string[] {
  const cut = Math.ceil(lines.length / 2)
  const first = lines.slice(0, cut).join(', ')
  const second = [lines.slice(cut).join(', '), phone.trim()].filter(Boolean).join(' · ')
  return [first, second].filter(Boolean)
}
