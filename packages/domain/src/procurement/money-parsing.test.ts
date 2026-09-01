import { describe, expect, it } from 'vitest'

import {
  classifyNumber,
  crossCheckLineTotal,
  detectDecimalConvention,
  isPriceOutlier,
  parseMoney,
  parseMoneyDocument,
} from './money-parsing'

/**
 * The failure this file exists to prevent: `1.234,56` read as one-point-two
 * instead of twelve hundred. It does not throw. It produces a plausible number
 * that is wrong by 1000× and flows into a customer quote.
 */

describe('classifyNumber — what a single value can prove', () => {
  it('proves comma-decimal when both separators appear, comma last', () => {
    expect(classifyNumber('1.234,56')).toBe('comma')
  })

  it('proves dot-decimal when both separators appear, dot last', () => {
    expect(classifyNumber('1,234.56')).toBe('dot')
  })

  it('proves nothing from a lone 3-digit group — this is the trap', () => {
    expect(classifyNumber('1.234')).toBe('ambiguous')
    expect(classifyNumber('1,234')).toBe('ambiguous')
  })

  it('proves decimal when 1 or 2 digits follow the separator', () => {
    expect(classifyNumber('12.5')).toBe('dot')
    expect(classifyNumber('12,50')).toBe('comma')
  })

  it('proves grouping when the same separator repeats', () => {
    expect(classifyNumber('1.234.567')).toBe('comma')
    expect(classifyNumber('1,234,567')).toBe('dot')
  })

  it('reads a leading zero as a decimal, not a group', () => {
    expect(classifyNumber('0.500')).toBe('dot')
    expect(classifyNumber('0,500')).toBe('comma')
  })

  it('ignores currency symbols and spacing', () => {
    expect(classifyNumber('€ 1.234,56')).toBe('comma')
    expect(classifyNumber('AED 1 234,56')).toBe('comma')
    expect(classifyNumber('$1,234.56')).toBe('dot')
  })

  it('proves nothing from a bare integer', () => {
    expect(classifyNumber('1234')).toBe('ambiguous')
  })
})

describe('detectDecimalConvention — voting across a document', () => {
  it('lets one decisive value settle the whole document', () => {
    expect(detectDecimalConvention(['1.234', '5.678', '9.876,50'])).toBe('comma')
  })

  it('votes with the majority', () => {
    expect(detectDecimalConvention(['12.5', '30.75', '1.234.567'])).toBe('dot')
  })

  it('returns ambiguous on a tie rather than picking a default', () => {
    expect(detectDecimalConvention(['1.234,56', '1,234.56'])).toBe('ambiguous')
  })

  it('returns ambiguous when nothing is decisive', () => {
    expect(detectDecimalConvention(['1.234', '5.678', '9000'])).toBe('ambiguous')
  })

  it('returns ambiguous for an empty document', () => {
    expect(detectDecimalConvention([])).toBe('ambiguous')
  })
})

describe('parseMoney', () => {
  it('parses European format', () => {
    expect(parseMoney('1.234,56', 'comma')).toBe(1234.56)
  })

  it('parses US format', () => {
    expect(parseMoney('1,234.56', 'dot')).toBe(1234.56)
  })

  it('parses a space-grouped European number', () => {
    expect(parseMoney('1 234,56', 'comma')).toBe(1234.56)
  })

  it('parses a non-breaking-space grouped number', () => {
    expect(parseMoney('1 234,56', 'comma')).toBe(1234.56)
  })

  it('strips currency codes and symbols', () => {
    expect(parseMoney('AED 1,234.56', 'dot')).toBe(1234.56)
    expect(parseMoney('€1.234,56', 'comma')).toBe(1234.56)
    expect(parseMoney('₹1,234.56', 'dot')).toBe(1234.56)
  })

  it('reads the SAME string differently under each convention — the whole point', () => {
    expect(parseMoney('1.234', 'comma')).toBe(1234)
    expect(parseMoney('1.234', 'dot')).toBe(1.234)
  })

  it('returns null rather than guessing when nothing settles it', () => {
    expect(parseMoney('1.234', 'ambiguous')).toBeNull()
  })

  it('still parses a self-decisive value under an ambiguous document', () => {
    expect(parseMoney('1.234,56', 'ambiguous')).toBe(1234.56)
  })

  it('lets the value override a wrong document convention', () => {
    // "1,234.56" proves dot on its own even if the document voted comma.
    expect(parseMoney('1,234.56', 'comma')).toBe(1234.56)
  })

  it('handles negatives', () => {
    expect(parseMoney('-1.234,56', 'comma')).toBe(-1234.56)
  })

  it('rejects text that is not a number', () => {
    expect(parseMoney('on request', 'dot')).toBeNull()
    expect(parseMoney('', 'dot')).toBeNull()
    expect(parseMoney('POA', 'dot')).toBeNull()
  })

  it('rejects a malformed value with two decimal separators', () => {
    expect(parseMoney('1.2.3', 'dot')).toBeNull()
  })
})

describe('parseMoneyDocument', () => {
  it('applies one voted convention across every value', () => {
    const { convention, parsed } = parseMoneyDocument(['1.234,56', '890', '2.500'])
    expect(convention).toBe('comma')
    expect(parsed).toEqual([1234.56, 890, 2500])
  })

  it('nulls the ambiguous values rather than defaulting them', () => {
    const { convention, parsed } = parseMoneyDocument(['1.234', '5.678'])
    expect(convention).toBe('ambiguous')
    expect(parsed).toEqual([null, null])
  })
})

describe('crossCheckLineTotal — the second line of defence', () => {
  it('accepts a consistent line', () => {
    expect(crossCheckLineTotal({ qty: 4, unitPrice: 250, statedTotal: 1000 }).ok).toBe(true)
  })

  it('catches a 1000x unit-price misparse', () => {
    const check = crossCheckLineTotal({ qty: 4, unitPrice: 0.25, statedTotal: 1000 })
    expect(check.ok).toBe(false)
    expect(check.reason).toBe('total_mismatch')
    expect(check.expectedTotal).toBe(1)
  })

  it('absorbs rounding within tolerance', () => {
    expect(crossCheckLineTotal({ qty: 3, unitPrice: 33.33, statedTotal: 100 }).ok).toBe(true)
  })

  it('rejects a discrepancy beyond tolerance', () => {
    expect(crossCheckLineTotal({ qty: 3, unitPrice: 33.33, statedTotal: 120 }).ok).toBe(false)
  })

  it('does not fail a line that simply lacks a total', () => {
    const check = crossCheckLineTotal({ qty: 4, unitPrice: 250, statedTotal: null })
    expect(check.ok).toBe(true)
    expect(check.reason).toBe('insufficient_data')
  })

  it('handles an all-zero line without dividing by zero', () => {
    expect(crossCheckLineTotal({ qty: 0, unitPrice: 0, statedTotal: 0 }).ok).toBe(true)
  })
})

describe('isPriceOutlier — the last catch', () => {
  it('flags a 1000x outlier against its peers', () => {
    expect(isPriceOutlier(40000, [38, 41, 39, 42])).toBe(true)
  })

  it('flags an implausibly low outlier too', () => {
    expect(isPriceOutlier(0.04, [38, 41, 39, 42])).toBe(true)
  })

  it('does not flag ordinary price spread', () => {
    expect(isPriceOutlier(55, [38, 41, 39, 42])).toBe(false)
  })

  it('uses the median, so one huge outlier cannot hide behind the mean', () => {
    // A mean over [38,41,39,42,40000] is ~8032; 40000 is under 20x that and
    // would NOT be flagged. The median (41) flags it.
    expect(isPriceOutlier(40000, [38, 41, 39, 42, 40000])).toBe(true)
  })

  it('stays silent when there are too few peers to judge', () => {
    expect(isPriceOutlier(40000, [38])).toBe(false)
    expect(isPriceOutlier(40000, [])).toBe(false)
  })
})
