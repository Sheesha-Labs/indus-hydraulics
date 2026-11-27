import { describe, expect, it } from 'vitest'
import { normaliseClientColumns } from './columns'
import { documentTotals, lineAmount, money, percentOf, qty, vatMode } from './totals'
import { amountInWords, integerInWords } from './words'

describe('document totals', () => {
  it('line amounts round half-up to 2 dp; money brackets negatives; qty drops trailing zeros', () => {
    expect(lineAmount('3', '2716.6667')).toBe('8150.00')
    expect(lineAmount('7', '0.005')).toBe('0.04')
    expect(money('-1283')).toBe('(1,283.00)')
    expect(qty('2.5000')).toBe('2.5')
    expect(qty('24')).toBe('24')
  })

  it('VAT mode follows the priced lines', () => {
    expect(vatMode([{ amount: '1' }, { amount: null, vat: 'zero_rated' }])).toBe('standard')
    expect(vatMode([{ amount: '1', vat: 'zero_rated' }])).toBe('zero_rated_export')
    expect(vatMode([{ amount: '1' }, { amount: '1', vat: 'zero_rated' }])).toBe('mixed')
  })

  it('standard 5%, with a discount and freight', () => {
    const t = documentTotals({
      lines: [{ amount: '1000.00' }, { amount: null }],
      currency: 'AED',
      discount: '100',
      freight: '50',
    })
    expect(t).toMatchObject({
      subTotal: '1000.00',
      net: '950.00',
      vat: '47.50',
      total: '997.50',
      vatAed: null,
    })
  })

  it('refuses a discount on a mixed-VAT document and a discount above the sub total', () => {
    expect(() =>
      documentTotals({
        lines: [{ amount: '1' }, { amount: '1', vat: 'zero_rated' }],
        currency: 'AED',
        discount: '1',
      })
    ).toThrow(/split by line/)
    expect(() =>
      documentTotals({ lines: [{ amount: '1' }], currency: 'AED', discount: '2' })
    ).toThrow(/larger/)
  })

  it('percentOf', () => {
    expect(percentOf('231525.00', '30')).toBe('69457.50')
    expect(percentOf('1000', '12.5')).toBe('125.00')
  })
})

describe('amount in words', () => {
  it('writes the C37 total and AED with fils', () => {
    expect(amountInWords('157587.08', 'USD')).toBe(
      'US Dollars One Hundred Fifty-Seven Thousand Five Hundred Eighty-Seven and Eight Cents only'
    )
    expect(amountInWords('12000.50', 'AED')).toBe('UAE Dirham Twelve Thousand and Fifty Fils only')
    expect(amountInWords('0', 'EUR')).toBe('Euro Zero only')
    expect(amountInWords('5', 'XYZ')).toBe('XYZ Five only')
  })

  it('scales and teens', () => {
    expect(integerInWords(1_000_000_011n)).toBe('One Billion Eleven')
    expect(integerInWords(2_300_000n)).toBe('Two Million Three Hundred Thousand')
    expect(() => amountInWords('-1', 'USD')).toThrow()
  })
})

describe('column normalisation', () => {
  it('keeps price columns together, amount last, ignores unknown keys', () => {
    expect(normaliseClientColumns(['amount', 'origin', 'rate', 'supplier', 'no'])).toEqual([
      'no',
      'description',
      'qty',
      'origin',
      'rate',
      'amount',
    ])
    expect(normaliseClientColumns(['no', 'description', 'qty', 'uom'])).toEqual([
      'no',
      'description',
      'qty',
      'uom',
    ])
  })
})
