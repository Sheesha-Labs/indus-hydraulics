import { describe, expect, it } from 'vitest'
import {
  addressLinesFrom,
  addressText,
  companyComplete,
  copiedUnconfirmed,
  letterheadRows,
  normaliseTrn,
  trnError,
  type CompanyAssets,
  type CompanyProfile,
} from './company-profile'

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
const NO_ASSETS: CompanyAssets = { logoFileId: null, stampFileId: null, signatures: {} }
const FILLED: CompanyProfile = {
  ...EMPTY,
  legalName: 'Example Valve Co',
  trn: '000000000000000',
  addressLines: ['Unit 1', 'Example Street', 'Dubai'],
}
const LOGO: CompanyAssets = { ...NO_ASSETS, logoFileId: '0193a5b2-7c1d-7e3f-8a9b-0c1d2e3f4a5b' }

describe('companyComplete (marks checklist company done)', () => {
  it('needs legal name, a 15-digit TRN, an address and the logo', () => {
    expect(companyComplete(FILLED, LOGO)).toBe(true)
    expect(companyComplete(FILLED, NO_ASSETS)).toBe(false)
    expect(companyComplete({ ...FILLED, legalName: '  ' }, LOGO)).toBe(false)
    expect(companyComplete({ ...FILLED, trn: '' }, LOGO)).toBe(false)
    expect(companyComplete({ ...FILLED, addressLines: [] }, LOGO)).toBe(false)
  })
})

describe('copied tags', () => {
  it('show while copiedFrom is set and the values are not confirmed', () => {
    expect(copiedUnconfirmed(EMPTY)).toBe(false)
    expect(copiedUnconfirmed({ ...FILLED, copiedFrom: 'website' })).toBe(true)
    expect(
      copiedUnconfirmed({ ...FILLED, copiedFrom: 'website', confirmedAt: '2026-11-23T08:00:00Z' })
    ).toBe(false)
  })
})

describe('TRN', () => {
  it('is 15 digits or empty; spaces and hyphens are dropped as typed', () => {
    expect(normaliseTrn('000 0000-0000 0000')).toBe('000000000000000')
    expect(trnError('')).toBeNull()
    expect(trnError('000000000000000')).toBeNull()
    expect(trnError('00000000000000')).toBe('A TRN is 15 digits.')
    expect(trnError('00000000000000A')).toBe('A TRN is 15 digits.')
  })
})

describe('address', () => {
  it('a comma starts a line; round-trips; more than six parts fold into the sixth', () => {
    expect(addressLinesFrom('Unit 1, Example Street,, Dubai ')).toEqual([
      'Unit 1',
      'Example Street',
      'Dubai',
    ])
    expect(addressText(['Unit 1', 'Example Street', 'Dubai'])).toBe('Unit 1, Example Street, Dubai')
    expect(addressLinesFrom('a, b, c, d, e, f, g, h')).toEqual(['a', 'b', 'c', 'd', 'e', 'f, g, h'])
    expect(addressLinesFrom('')).toEqual([])
  })

  it('the letterhead draws the lines in two rows, the phone after the second', () => {
    expect(
      letterheadRows(['Unit 1', 'Example Street', 'Area', 'Dubai'], '+971 0 000 0000')
    ).toEqual(['Unit 1, Example Street', 'Area, Dubai · +971 0 000 0000'])
    expect(letterheadRows(['Dubai'], '')).toEqual(['Dubai'])
    expect(letterheadRows([], '+971 0 000 0000')).toEqual(['+971 0 000 0000'])
  })
})
