import { describe, expect, it } from 'vitest'
import { parseQuantity, sameQty } from './qty'

describe('parseQuantity', () => {
  it.each<
    [string | null, 'dot' | 'comma' | 'ambiguous', number | null, string | null, string | null]
  >([
    ['10', 'ambiguous', 10, null, null],
    ['10 nos', 'ambiguous', 10, 'nos', null],
    ['50 MTR.', 'dot', 50, 'MTR.', null],
    ['1,000', 'dot', 1000, null, null],
    ['1.000', 'comma', 1000, null, null],
    ['1.000', 'ambiguous', null, null, 'ambiguous_separator'],
    ['2.5 m', 'ambiguous', 2.5, 'm', null],
    ['10+2 spare', 'dot', null, null, 'several_numbers'],
    ['5 x 10', 'dot', null, null, 'several_numbers'],
    ['approx. 10', 'dot', null, null, 'approximate'],
    ['as required', 'dot', null, null, 'not_stated'],
    ['', 'dot', null, null, 'not_stated'],
    [null, 'dot', null, null, 'not_stated'],
    ['0', 'dot', null, null, 'not_positive'],
  ])('%s (%s)', (printed, conv, value, unit, problem) => {
    expect(parseQuantity(printed, conv)).toEqual({ value, unitText: unit, problem })
  })
  it('sameQty', () => {
    expect(sameQty(10, 10)).toBe(true)
    expect(sameQty(10, 1000)).toBe(false)
    expect(sameQty(null, 10)).toBe(false)
  })
})
