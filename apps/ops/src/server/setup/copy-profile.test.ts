import { describe, expect, it } from 'vitest'
import {
  isLocalHost,
  migrationUrlRefusal,
  planProfileCopy,
  profileFromStoreSettings,
  type CompanyProfile,
} from './copy-profile'

/** Refusal rules of scripts/copy-company-profile.ts. Neutral values only. */

const EMPTY: CompanyProfile = {
  legalName: '',
  tradingName: '',
  trn: '',
  addressLines: [],
  phone: '',
  website: '',
  copiedFrom: null,
  confirmedAt: null,
}

const ROW = {
  id: 'x',
  name: 'Example Valve',
  legalName: 'Example Valve Co',
  vatTrn: '000 000 000 000 000',
  registeredAddressLines: ['Unit 1', 'Example Street', 'Dubai'],
  contactPhone: '+971 0 000 0000',
  bankIban: 'never copied',
}

describe('OPS_MIGRATION_URL', () => {
  it('must be set, a postgres URL, and never the ops_app role', () => {
    expect(migrationUrlRefusal(undefined)).toMatch(/not set/)
    expect(migrationUrlRefusal('not a url')).toMatch(/not a URL/)
    expect(migrationUrlRefusal('https://example.test/db')).toMatch(/not a postgres URL/)
    expect(migrationUrlRefusal('postgresql://ops_app:x@localhost:5432/db')).toMatch(/ops_app/)
    // The pooler spells the role as <role>.<project ref>.
    expect(migrationUrlRefusal('postgresql://ops_app.abcd:x@pooler.example.test:5432/db')).toMatch(
      /ops_app/
    )
    expect(migrationUrlRefusal('postgresql://postgres:x@localhost:54329/db')).toBeNull()
  })

  it('knows a local host (no Vercel check needed)', () => {
    expect(isLocalHost('postgresql://postgres:x@localhost:54329/db')).toBe(true)
    expect(isLocalHost('postgresql://postgres:x@db.example.test:5432/db')).toBe(false)
  })
})

describe('profileFromStoreSettings', () => {
  it('maps the website columns and names the fields copied (never values)', () => {
    const { profile, copied } = profileFromStoreSettings(ROW)
    expect(profile).toEqual({
      legalName: 'Example Valve Co',
      tradingName: 'Example Valve',
      trn: '000000000000000',
      addressLines: ['Unit 1', 'Example Street', 'Dubai'],
      phone: '+971 0 000 0000',
      website: '',
      copiedFrom: 'website',
      confirmedAt: null,
    })
    expect(copied).toEqual(['legalName', 'tradingName', 'trn', 'addressLines', 'phone'])
    expect(JSON.stringify(profile)).not.toContain('never copied')
  })

  it('copies website only when the column exists, and leaves a malformed TRN empty', () => {
    const { profile, copied } = profileFromStoreSettings({
      ...ROW,
      website: 'example.test',
      vatTrn: '12345',
    })
    expect(profile.website).toBe('example.test')
    expect(profile.trn).toBe('')
    expect(copied).not.toContain('trn')
  })
})

describe('planProfileCopy refusals', () => {
  it('refuses when copiedFrom is already set (copied once, never again)', () => {
    const plan = planProfileCopy({ ...EMPTY, copiedFrom: 'website' }, ROW)
    expect(plan).toEqual({ ok: false, reason: expect.stringMatching(/already copied once/) })
  })

  it('refuses to overwrite values typed in Ops', () => {
    for (const typed of [
      { legalName: 'Typed' },
      { trn: '000000000000000' },
      { addressLines: ['Typed'] },
      { website: 'typed.test' },
    ]) {
      const plan = planProfileCopy({ ...EMPTY, ...typed }, ROW)
      expect(plan).toEqual({ ok: false, reason: expect.stringMatching(/entered in Ops/) })
    }
  })

  it('refuses when the website has no row, or nothing worth copying', () => {
    expect(planProfileCopy(EMPTY, null)).toEqual({
      ok: false,
      reason: expect.stringMatching(/no row/),
    })
    expect(planProfileCopy(EMPTY, { id: 'x' })).toEqual({
      ok: false,
      reason: expect.stringMatching(/no company details/),
    })
  })

  it('otherwise returns a schema-valid profile tagged copiedFrom website, unconfirmed', () => {
    const plan = planProfileCopy(EMPTY, ROW)
    expect(plan.ok).toBe(true)
    if (plan.ok) {
      expect(plan.profile.copiedFrom).toBe('website')
      expect(plan.profile.confirmedAt).toBeNull()
    }
  })
})
