import { describe, expect, it } from 'vitest'
import {
  add,
  compare,
  formatDecimal,
  isNegative,
  isWhole,
  isZero,
  mul,
  parseDecimal,
  round,
  sub,
  toDecimalString,
} from './decimal'

describe('parseDecimal', () => {
  it.each([
    ['0', 0n],
    ['12', 120000n],
    ['12.5', 125000n],
    ['-1283.00', -12830000n],
    ['+3.6725', 36725n],
    ['3.67250000', 36725n],
    [' 7.1 ', 71000n],
  ])('%s → %s', (input, expected) => {
    expect(parseDecimal(input)).toBe(expected)
  })

  it.each(['', 'abc', '1e5', '1,000.00', '.5', '1.', '1.23456', '0.00001'])(
    'refuses %j',
    (input) => {
      expect(() => parseDecimal(input)).toThrow(RangeError)
    }
  )
})

describe('arithmetic', () => {
  it('adds and subtracts without float error', () => {
    expect(toDecimalString(add('0.1', '0.2'))).toBe('0.3000')
    expect(toDecimalString(sub('12400.00', '4960.00'), 2)).toBe('7440.00')
  })

  it('multiplies and rounds the product half-up to 4 dp', () => {
    expect(toDecimalString(mul('8420.00', '3.9789'))).toBe('33502.3380')
    expect(toDecimalString(mul('620.00', '3.6725'), 2)).toBe('2276.95')
    expect(toDecimalString(mul('0.0001', '0.5'))).toBe('0.0001')
    expect(toDecimalString(mul('-0.0001', '0.5'))).toBe('-0.0001')
  })

  it.each([
    ['2.345', '2.35'],
    ['2.344', '2.34'],
    ['2.3449', '2.34'],
    ['-2.345', '-2.35'],
    ['-2.344', '-2.34'],
    ['61.725', '61.73'],
    ['0.005', '0.01'],
    ['0.0049', '0.00'],
  ])('rounds %s half-up to %s at 2 dp', (input, expected) => {
    expect(toDecimalString(round(input, 2), 2)).toBe(expected)
  })

  it('rounds to whole units', () => {
    expect(toDecimalString(round('1234.5', 0), 0)).toBe('1235')
    expect(() => round('1', 5)).toThrow(RangeError)
  })

  it('compares and classifies', () => {
    expect(compare('1.10', '1.1')).toBe(0)
    expect(compare('-1', '0')).toBe(-1)
    expect(compare('2', '1.9999')).toBe(1)
    expect(isNegative('-0.01')).toBe(true)
    expect(isNegative('-0.00')).toBe(false)
    expect(isZero('0.0000')).toBe(true)
    expect(isWhole('12400.00')).toBe(true)
    expect(isWhole('12400.50')).toBe(false)
  })
})

describe('formatDecimal', () => {
  it.each([
    ['12400', 2, false, '12,400.00'],
    ['1234567.891', 2, false, '1,234,567.89'],
    ['-1283', 2, true, '1,283.00'],
    ['999.995', 2, false, '1,000.00'],
    ['12400.4', 0, false, '12,400'],
    ['0', 2, false, '0.00'],
    ['-0.001', 2, false, '0.00'],
  ])('%s at %i dp', (input, dp, negative, digits) => {
    expect(formatDecimal(input, dp)).toEqual({ negative, digits })
  })
})
