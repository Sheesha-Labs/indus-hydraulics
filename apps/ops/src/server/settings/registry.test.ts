import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SETTINGS, SETTING_KEYS, isSettingKey, settingDef, type SettingKey } from './registry'

/**
 * The registry against the seed migration, without a database: every seeded row has a registry
 * entry with the same ownerOnly and sign-off flags, and every seeded value parses. The DB-backed
 * twin (settings.db.test.ts) proves the same through getSetting after the migration is applied.
 */

const MIGRATIONS = resolve(import.meta.dirname, '../../../../../packages/ops-db/migrations')

type SeedRow = { key: string; value: unknown; ownerOnly: boolean; signoffStatus: string }

function seedRows(): SeedRow[] {
  // Every settings seed migration: S03-T04's defaults and each later sprint's own (`…_settings_seed.sql`).
  const files = readdirSync(MIGRATIONS).filter((f) => /_ops_\w*settings\w*_seed\.sql$/.test(f))
  if (!files.length) throw new Error('settings seed migrations not found')
  const sql = files.map((f) => readFileSync(join(MIGRATIONS, f), 'utf8')).join('\n')
  const rows: SeedRow[] = []
  const re = /\('([a-z_.]+)',\s*'(\{.*?\})',\s*0,\s*(true|false),\s*'(\w+)',\s*now\(\)\)/gs
  for (const m of sql.matchAll(re)) {
    rows.push({
      key: m[1]!,
      value: JSON.parse(m[2]!),
      ownerOnly: m[3] === 'true',
      signoffStatus: m[4]!,
    })
  }
  return rows
}

/** The starred keys of the S03-T04 settings table. */
const AWAITING: readonly SettingKey[] = [
  'fx',
  'vat',
  'pricing.defaults',
  'landed.defaults',
  'assistant.budget',
  'research.cap',
  'links',
  'intake',
  'retention',
  'auth',
  'system_email.sender',
  'mail.label_names',
  'mailbox.consent',
  'mail.backfill_exclusions',
  'send.timing',
  'calendar.country_weekends',
  'send.attachment_names',
  'assistant.internal_undo_minutes', // S05-T02
  'ack.revert_by', // S08-T07
  'qualify.free_mail_domains', // S09-T04
  'qualify.rdap_enabled', // S09-T06
  'questions.clock', // S09-T07
]

function seeded(key: SettingKey): unknown {
  const row = seedRows().find((r) => r.key === key)
  if (!row) throw new Error(`no seed row for ${key}`)
  return structuredClone(row.value)
}

function issues(key: SettingKey, value: unknown): string[] {
  const r = settingDef(key).schema.safeParse(value)
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
}

describe('settings registry vs the seed migration', () => {
  const rows = seedRows()

  it('seeds exactly the registered keys', () => {
    expect(rows.map((r) => r.key).sort()).toEqual([...SETTING_KEYS].sort())
    expect(SETTING_KEYS).toHaveLength(31)
  })

  it('every seeded value parses with its schema', () => {
    for (const row of rows) {
      expect(isSettingKey(row.key)).toBe(true)
      expect({ key: row.key, issues: issues(row.key as SettingKey, row.value) }).toEqual({
        key: row.key,
        issues: [],
      })
    }
  })

  it('flags the starred keys awaiting, the rest not_required, in the registry and the seed', () => {
    for (const row of rows) {
      const key = row.key as SettingKey
      const starred = AWAITING.includes(key)
      expect({ key, signoff: SETTINGS[key].signoff }).toEqual({ key, signoff: starred })
      expect({ key, status: row.signoffStatus }).toEqual({
        key,
        status: starred ? 'awaiting' : 'not_required',
      })
    }
  })

  it('makes every key ownerOnly except setup.progress, in the registry and the seed', () => {
    for (const row of rows) {
      const key = row.key as SettingKey
      const expected = key !== 'setup.progress'
      expect({ key, registry: SETTINGS[key].ownerOnly, seed: row.ownerOnly }).toEqual({
        key,
        registry: expected,
        seed: expected,
      })
    }
  })

  it('seeds the company profile with empty strings only (no company data in the repository)', () => {
    expect(seeded('company.profile')).toEqual({
      legalName: '',
      tradingName: '',
      trn: '',
      addressLines: [],
      phone: '',
      website: '',
      copiedFrom: null,
      confirmedAt: null,
    })
  })
})

describe('settings schemas', () => {
  it('are strict: an unknown field is refused', () => {
    for (const key of SETTING_KEYS) {
      const value = seeded(key) as Record<string, unknown>
      expect({ key, ok: settingDef(key).schema.safeParse({ ...value, extra: 1 }).success }).toEqual(
        {
          key,
          ok: false,
        }
      )
    }
  })

  it('pricing: floor ≤ margin, hard minimum ≤ floor, margin below 100, steps positive', () => {
    const base = seeded('pricing.defaults') as {
      marginPct: number
      floorPct: number
      hardMinPct: number
      rounding: { stepAed: number; above: { thresholdAed: number; stepAed: number } }
    }
    expect(issues('pricing.defaults', { ...base, floorPct: 19 })).toEqual([
      'floorPct: The floor cannot be above the default margin.',
    ])
    expect(issues('pricing.defaults', { ...base, hardMinPct: 13 })).toEqual([
      'hardMinPct: The hard minimum cannot be above the floor.',
    ])
    expect(issues('pricing.defaults', { ...base, marginPct: 100, floorPct: 12 })).toEqual([
      'marginPct: Use a margin below 100%.',
    ])
    expect(issues('pricing.defaults', { ...base, floorPct: -1, hardMinPct: -2 })).toContain(
      'floorPct: Use a percentage from 0 to 100.'
    )
    expect(
      issues('pricing.defaults', { ...base, rounding: { ...base.rounding, stepAed: 0 } })
    ).toEqual(['rounding.stepAed: Use an amount above zero.'])
    expect(issues('pricing.defaults', { ...base, marginPct: '18' })).not.toEqual([])
  })

  it('currency: codes are three letters and the default is a quotation currency', () => {
    const base = seeded('currency') as { quotation: string[] }
    expect(issues('currency', { ...base, defaultQuotation: 'GBP' })).toEqual([
      'defaultQuotation: The default must be one of the quotation currencies.',
    ])
    expect(issues('currency', { ...base, book: 'aed' })).toEqual([
      'book: Use a three-letter currency code, e.g. AED.',
    ])
    expect(issues('currency', { ...base, quotation: ['AED', 'AED'] })).toEqual([
      'quotation: Each currency once.',
    ])
    expect(settingDef('currency').currencies?.(seeded('currency'))).toEqual([
      'AED',
      'AED',
      'USD',
      'EUR',
      'AED',
    ])
  })

  it('fx: fetch times are 24-hour, unique and in order; the time zone is real', () => {
    const base = seeded('fx') as Record<string, unknown>
    expect(issues('fx', { ...base, fetchTimes: ['10:00', '06:00'] })).toEqual([
      'fetchTimes: List each fetch time once, earliest first.',
    ])
    expect(issues('fx', { ...base, fetchTimes: ['6am'] })).toEqual([
      'fetchTimes.0: Use a 24-hour time, e.g. 06:00.',
    ])
    expect(issues('fx', { ...base, timezone: 'Mars/Base' })).toEqual([
      'timezone: Use a time zone such as Asia/Dubai.',
    ])
  })

  it('auth, intake and links stay within their ranges', () => {
    const authBase = seeded('auth') as Record<string, unknown>
    expect(issues('auth', { ...authBase, lockAttempts: 1 })).toEqual([
      'lockAttempts: Use 3 to 20 attempts.',
    ])
    expect(issues('auth', { ...authBase, inviteDays: 7.5 })).toEqual([
      'inviteDays: Use a whole number.',
    ])
    expect(issues('intake', { ...(seeded('intake') as object), maxUploadMb: 26 })).toEqual([
      'maxUploadMb: Use 1 to 25 MB.',
    ])
    expect(issues('links', { expiryDays: 0 })).toEqual(['expiryDays: Use 1 to 365 days.'])
  })

  it('system email sender: Name <address> or an address; reply-to is an address', () => {
    const ok = { from: 'Indus Operations <no-reply@example.test>', replyTo: 'sales@example.test' }
    expect(issues('system_email.sender', ok)).toEqual([])
    expect(issues('system_email.sender', { ...ok, from: 'no-reply@example.test' })).toEqual([])
    expect(issues('system_email.sender', { ...ok, from: 'Indus Operations' })).toEqual([
      'from: Use an address, or a name and an address: Name <address>.',
    ])
    expect(issues('system_email.sender', { ...ok, replyTo: 'sales' })).not.toEqual([])
  })

  it('company profile: a TRN is empty or 15 digits', () => {
    const base = seeded('company.profile') as Record<string, unknown>
    expect(issues('company.profile', { ...base, trn: '000000000000000' })).toEqual([])
    expect(issues('company.profile', { ...base, trn: '1234' })).toEqual([
      'trn: A TRN is 15 digits.',
    ])
  })

  it('gives every key a label and a section', () => {
    for (const key of SETTING_KEYS) {
      expect(SETTINGS[key].label.length).toBeGreaterThan(0)
      expect(SETTINGS[key].section.length).toBeGreaterThan(0)
    }
  })
})
