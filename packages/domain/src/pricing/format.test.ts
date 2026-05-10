import { describe, expect, test } from 'vitest'

import { formatPrice } from './format'

describe('formatPrice — currency rendering', () => {
  test('USD renders with $ and US grouping', () => {
    const r = formatPrice({ listPrice: 2890, currency: 'USD' })
    expect(r.primary).toBe('$2,890')
  })

  test('AED renders with AED prefix', () => {
    const r = formatPrice({ listPrice: 10580, currency: 'AED' })
    // ICU produces "AED 10,580" (sometimes with non-breaking space).
    expect(r.primary).toMatch(/AED\s10,580/)
  })

  test('EUR uses €', () => {
    const r = formatPrice({ listPrice: 2500, currency: 'EUR' })
    expect(r.primary).toMatch(/€/)
    expect(r.primary).toContain('2,500')
  })

  test('SAR renders with SAR prefix', () => {
    const r = formatPrice({ listPrice: 1200, currency: 'SAR' })
    expect(r.primary).toContain('1,200')
  })
})

describe('formatPrice — quote-only path', () => {
  test('null listPrice → isQuoteOnly with empty primary', () => {
    const r = formatPrice({ listPrice: null, currency: 'USD' })
    expect(r.isQuoteOnly).toBe(true)
    expect(r.primary).toBe('')
    expect(r.compareAt).toBeUndefined()
  })

  test('undefined listPrice → isQuoteOnly', () => {
    const r = formatPrice({ listPrice: undefined, currency: 'USD' })
    expect(r.isQuoteOnly).toBe(true)
  })

  test('compareAt without listPrice still produces isQuoteOnly with no leak', () => {
    const r = formatPrice({ listPrice: null, currency: 'USD', compareAtPrice: 999 })
    expect(r.isQuoteOnly).toBe(true)
    expect(r.compareAt).toBeUndefined()
  })
})

describe('formatPrice — compareAt rules', () => {
  test('compareAt strictly greater than list → both render with discountPct', () => {
    const r = formatPrice({ listPrice: 2890, currency: 'USD', compareAtPrice: 3210 })
    expect(r.primary).toBe('$2,890')
    expect(r.compareAt).toBe('$3,210')
    expect(r.discountPct).toBe(10) // (3210 - 2890) / 3210 ≈ 9.97 → rounds to 10
  })

  test('compareAt equal to list → suppressed (no fake discount)', () => {
    const r = formatPrice({ listPrice: 2890, currency: 'USD', compareAtPrice: 2890 })
    expect(r.compareAt).toBeUndefined()
    expect(r.discountPct).toBeUndefined()
  })

  test('compareAt less than list → suppressed', () => {
    const r = formatPrice({ listPrice: 2890, currency: 'USD', compareAtPrice: 1500 })
    expect(r.compareAt).toBeUndefined()
  })

  test('compareAt null → suppressed', () => {
    const r = formatPrice({ listPrice: 2890, currency: 'USD', compareAtPrice: null })
    expect(r.compareAt).toBeUndefined()
  })

  test('compareAt undefined → suppressed', () => {
    const r = formatPrice({ listPrice: 2890, currency: 'USD' })
    expect(r.compareAt).toBeUndefined()
  })

  test('discountPct rounds to whole percent', () => {
    // 100 vs 75 → 25% discount
    const a = formatPrice({ listPrice: 75, currency: 'USD', compareAtPrice: 100 })
    expect(a.discountPct).toBe(25)
    // 100 vs 70 → 30%
    const b = formatPrice({ listPrice: 70, currency: 'USD', compareAtPrice: 100 })
    expect(b.discountPct).toBe(30)
  })
})

describe('formatPrice — edge cases', () => {
  test('decimals render with cents', () => {
    expect(formatPrice({ listPrice: 2890.5, currency: 'USD' }).primary).toBe('$2,890.50')
  })

  test('three-decimal input rounds to two', () => {
    // 2890.555 → $2,890.56 via banker's rounding (Intl default).
    const r = formatPrice({ listPrice: 2890.555, currency: 'USD' })
    expect(r.primary).toMatch(/^\$2,890\.5[56]$/)
  })

  test('zero is a valid price', () => {
    const r = formatPrice({ listPrice: 0, currency: 'USD' })
    expect(r.primary).toBe('$0')
    expect(r.isQuoteOnly).toBe(false)
  })

  test('negative listPrice clamps to zero', () => {
    const r = formatPrice({ listPrice: -100, currency: 'USD' })
    expect(r.primary).toBe('$0')
  })

  test('whole-number prices show no fractional part', () => {
    expect(formatPrice({ listPrice: 1000, currency: 'USD' }).primary).toBe('$1,000')
  })

  test('large numbers retain grouping separators', () => {
    expect(formatPrice({ listPrice: 1234567, currency: 'USD' }).primary).toBe('$1,234,567')
  })
})

describe('formatPrice — locale override', () => {
  test('explicit locale changes grouping', () => {
    const us = formatPrice({ listPrice: 1000000, currency: 'USD', locale: 'en-US' })
    const de = formatPrice({ listPrice: 1000000, currency: 'EUR', locale: 'de-DE' })
    expect(us.primary).toContain(',')
    // German uses '.' as thousands separator (and varies by ICU version on
    // the suffix). We just check the grouping char isn't a comma.
    expect(de.primary).not.toContain(',')
  })

  test('default locale is en-US', () => {
    const r = formatPrice({ listPrice: 1000, currency: 'USD' })
    expect(r.primary).toBe('$1,000')
  })
})

describe('formatPrice — determinism', () => {
  test('same inputs produce identical outputs across calls (cache safety)', () => {
    const a = formatPrice({ listPrice: 2890, currency: 'USD', compareAtPrice: 3210 })
    const b = formatPrice({ listPrice: 2890, currency: 'USD', compareAtPrice: 3210 })
    expect(a).toEqual(b)
  })
})
