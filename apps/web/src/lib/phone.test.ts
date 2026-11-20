import { describe, expect, it } from 'vitest'
import { DIAL_COUNTRIES } from '@indus/domain'
import { composePhone, defaultPhoneCountry } from './phone'

describe('defaultPhoneCountry', () => {
  it('prefers the page country, then the geo country, then the UAE', () => {
    expect(defaultPhoneCountry(DIAL_COUNTRIES, 'om', 'IN')).toBe('OM')
    expect(defaultPhoneCountry(DIAL_COUNTRIES, null, 'IN')).toBe('IN')
    expect(defaultPhoneCountry(DIAL_COUNTRIES, null, null)).toBe('AE')
  })

  it('ignores a code that is not in the list', () => {
    expect(defaultPhoneCountry(DIAL_COUNTRIES, 'ZZ', 'QQ')).toBe('AE')
    expect(defaultPhoneCountry(DIAL_COUNTRIES, 'ZZ', 'AU')).toBe('AU')
  })
})

describe('composePhone', () => {
  it('formats a plausible number with its dial code, dropping a trunk zero', () => {
    expect(composePhone('+971', '052 123 4567')).toBe('+971 52 123 4567')
  })

  it('keeps what was typed when it is not a plausible number', () => {
    expect(composePhone('+44', '12 34')).toBe('+44 12 34')
  })

  it('is empty when no digits were typed', () => {
    expect(composePhone('+971', '  ')).toBe('')
    expect(composePhone('+971', 'n/a')).toBe('')
  })
})
