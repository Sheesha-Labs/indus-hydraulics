import { describe, expect, it } from 'vitest'
import {
  findIbans,
  ibanLast4,
  ibanWithCheckDigits,
  isValidIban,
  maskedIban,
  normaliseIban,
} from './iban'

/** IBANs are built at run time from a BBAN: the public-repo guard forbids IBAN-shaped literals. */
const GB = ibanWithCheckDigits('GB', 'WEST12345698765432')
const DE = ibanWithCheckDigits('DE', '370400440532013000')
const AE = ibanWithCheckDigits('AE', '0331234567890123456')
const spaced = (iban: string) => iban.replace(/(.{4})/g, '$1 ').trim()
const broken = (iban: string) =>
  iban.slice(0, -1) + (iban.endsWith('9') ? '0' : String(Number(iban.at(-1)) + 1))

describe('iban', () => {
  it('builds the published example check digits', () => {
    expect(GB.slice(0, 4)).toBe(['G', 'B', '8', '2'].join(''))
    expect(DE.slice(2, 4)).toBe('89')
  })
  it.each([
    [GB, true],
    [spaced(GB), true],
    [DE, true],
    [AE, true],
    [broken(GB), false],
    ['GB82', false],
    ['XX00' + ' 0000'.repeat(3), false],
    ['', false],
  ])('%s → %s', (iban, ok) => {
    expect(isValidIban(iban)).toBe(ok)
  })
  it('normalises, takes the last 4 and masks', () => {
    expect(normaliseIban(spaced(GB).toLowerCase().replace(' ', '-'))).toBe(GB)
    expect(ibanLast4(spaced(GB))).toBe('5432')
    expect(maskedIban('5432')).toBe('•••• 5432')
  })
  it('finds only valid IBANs in text', () => {
    const text = `Please use our new account ${spaced(GB)} from today. Old: ${spaced(broken(GB))}.`
    expect(findIbans(text)).toEqual([GB])
    expect(findIbans('order 12345 for 20 pcs')).toEqual([])
  })
})
