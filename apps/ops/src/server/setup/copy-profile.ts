import { SETTINGS, type SettingValue } from '../settings/registry'

/**
 * The rules of `scripts/copy-company-profile.ts` (S03-T05, P01): copy the company's legal details ONCE
 * from the website's `public.store_settings` into the Ops setting `company.profile`, tagged
 * `copiedFrom: 'website'` and unconfirmed, after which Ops owns them. Pure, so every refusal is tested.
 *
 * Refusals, in the order the script checks them:
 *   1. OPS_MIGRATION_URL unset, not a postgres URL, or connecting as `ops_app` (no rights on `public`).
 *   2. (non-local host) a Vercel build is running (checked by the script itself).
 *   3. `company.profile` already has `copiedFrom` set: it was copied once; never again.
 *   4. `company.profile` already holds a value someone typed (any non-empty field): never overwrite.
 *   5. the website row is missing, or none of its fields has a value worth copying.
 *   6. the result does not satisfy the registry schema (e.g. no field fits).
 * A website TRN that is not 15 digits is NOT copied (the field stays empty for the Owner to fill).
 */

export type CompanyProfile = SettingValue<'company.profile'>

export const COPIED_FROM = 'website'

export function migrationUrlRefusal(raw: string | undefined): string | null {
  if (!raw) return 'OPS_MIGRATION_URL is not set (the postgres role URL, never ops_app).'
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return 'OPS_MIGRATION_URL is not a URL.'
  }
  if (!/^postgres(ql)?:$/.test(url.protocol)) return 'OPS_MIGRATION_URL is not a postgres URL.'
  const user = decodeURIComponent(url.username).split('.')[0]
  if (user === 'ops_app') {
    return 'OPS_MIGRATION_URL connects as ops_app, which has no rights on public. Use the postgres role.'
  }
  return null
}

export function isLocalHost(raw: string): boolean {
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(raw).hostname)
  } catch {
    return false
  }
}

/** Why the current Ops value must not be overwritten, or null. */
export function profileRefusal(current: CompanyProfile): string | null {
  if (current.copiedFrom !== null) {
    return 'company.profile was already copied once (copiedFrom is set). Nothing changed.'
  }
  const typed =
    current.legalName.trim() ||
    current.tradingName.trim() ||
    current.trn ||
    current.addressLines.length > 0 ||
    current.phone.trim() ||
    current.website.trim()
  if (typed) {
    return 'company.profile already holds values entered in Ops. Nothing changed.'
  }
  return null
}

const text = (v: unknown, max = 200): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

/**
 * Map one `store_settings` row (as `to_jsonb(row)`, so a column the website lacks is simply absent)
 * to a company profile. Returns the profile and the NAMES of the fields that received a value; the
 * script prints only those names, never a value.
 */
export function profileFromStoreSettings(row: Record<string, unknown> | null): {
  profile: CompanyProfile
  copied: string[]
} {
  const r = row ?? {}
  const trnRaw = text(r['vatTrn']).replace(/[\s-]/g, '')
  const lines = Array.isArray(r['registeredAddressLines'])
    ? (r['registeredAddressLines'] as unknown[])
        .map((l) => text(l))
        .filter(Boolean)
        .slice(0, 6)
    : []
  const profile: CompanyProfile = {
    legalName: text(r['legalName']),
    tradingName: text(r['name']),
    trn: /^\d{15}$/.test(trnRaw) ? trnRaw : '',
    addressLines: lines,
    phone: text(r['contactPhone'], 40),
    website: text(r['website']),
    copiedFrom: COPIED_FROM,
    confirmedAt: null,
  }
  const copied = (
    [
      ['legalName', profile.legalName],
      ['tradingName', profile.tradingName],
      ['trn', profile.trn],
      ['addressLines', profile.addressLines.length ? 'x' : ''],
      ['phone', profile.phone],
      ['website', profile.website],
    ] as const
  )
    .filter(([, v]) => v !== '')
    .map(([k]) => k)
  return { profile, copied }
}

/**
 * The whole decision: the profile to write, or the reason not to. `current` is the Ops value as stored
 * (parsed with the registry schema by the caller).
 */
export function planProfileCopy(
  current: CompanyProfile,
  row: Record<string, unknown> | null
): { ok: true; profile: CompanyProfile; copied: string[] } | { ok: false; reason: string } {
  const refused = profileRefusal(current)
  if (refused) return { ok: false, reason: refused }
  if (!row) return { ok: false, reason: 'public.store_settings has no row. Nothing changed.' }
  const { profile, copied } = profileFromStoreSettings(row)
  if (copied.length === 0) {
    return { ok: false, reason: 'The website row has no company details to copy. Nothing changed.' }
  }
  const parsed = SETTINGS['company.profile'].schema.safeParse(profile)
  if (!parsed.success) {
    const paths = parsed.error.issues.map((i) => i.path.join('.')).join(', ')
    return { ok: false, reason: `The copied values do not fit company.profile at: ${paths}.` }
  }
  return { ok: true, profile: parsed.data, copied }
}
