import { describe, expect, it } from 'vitest'
import { findIbans, ibanLast4, isValidIban, maskedIban, normaliseIban } from './iban'

describe('iban', () => {
  it.each([
    ['GB82 WEST 1234 5698 7654 32', true],
    ['GB82WEST12345698765432', true],
    ['DE89 3704 0044 0532 0130 00', true],
    ['AE07 0331 2345 6789 0123 456', true],
    ['GB82 WEST 1234 5698 7654 33', false],
    ['GB82', false],
    ['XX00 0000 0000 0000', false],
    ['', false],
  ])('%s → %s', (iban, ok) => {
    expect(isValidIban(iban)).toBe(ok)
  })
  it('normalises, takes the last 4 and masks', () => {
    expect(normaliseIban('gb82 west-1234 5698 7654 32')).toBe('GB82WEST12345698765432')
    expect(ibanLast4('GB82 WEST 1234 5698 7654 32')).toBe('5432')
    expect(maskedIban('5432')).toBe('•••• 5432')
  })
  it('finds only valid IBANs in text', () => {
    const text =
      'Please use our new account GB82 WEST 1234 5698 7654 32 from today. Old: GB82 WEST 1234 5698 7654 33.'
    expect(findIbans(text)).toEqual(['GB82WEST12345698765432'])
    expect(findIbans('order 12345 for 20 pcs')).toEqual([])
  })
})
