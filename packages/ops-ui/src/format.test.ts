import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatFx,
  formatMoney,
  formatQty,
  formatRelative,
  formatTime,
  listDecimals,
  quotationFromSlug,
  quotationSlug,
} from './format'

const NOW = new Date('2026-11-20T06:00:00Z')

describe('formatMoney', () => {
  it.each([
    ['USD', '218760', 'doc', 'USD 218,760.00', false],
    ['USD', '218760.0000', 'list', 'USD 218,760', false],
    ['USD', '157587.5', 'list', 'USD 157,587.50', false],
    ['AED', '-1283', 'doc', 'AED (1,283.00)', true],
    ['AED', '-1283', 'list', 'AED (1,283)', true],
    ['EUR', '0.005', 'doc', 'EUR 0.01', false],
    ['EUR', '-0.004', 'doc', 'EUR 0.00', false],
    ['JPY', '15800', 'doc', 'JPY 15,800.00', false],
    ['USD', '1234567.8949', 'doc', 'USD 1,234,567.89', false],
  ] as const)('%s %s (%s) → %s', (ccy, amount, decimals, text, negative) => {
    const m = formatMoney(ccy, amount, { decimals })
    expect(m.text).toBe(text)
    expect(m.negative).toBe(negative)
    expect(m.empty).toBe(false)
    expect(m.text.endsWith(m.amount)).toBe(true)
  })

  it.each([[''], ['   '], [null], [undefined]])('empty %p → —', (amount) => {
    expect(formatMoney('USD', amount)).toEqual({
      text: '—',
      amount: '—',
      negative: false,
      empty: true,
    })
  })

  it('refuses a string that is not a decimal instead of guessing', () => {
    expect(() => formatMoney('USD', '1,234.00')).toThrow(RangeError)
    expect(() => formatMoney('USD', '1e3')).toThrow(RangeError)
  })

  it('listDecimals drops decimals only when every value is whole', () => {
    expect(listDecimals(['157587', '12395.0000', ''])).toBe('list')
    expect(listDecimals(['157587', '12395.50'])).toBe('doc')
  })
})

describe('formatFx', () => {
  it('reads as one unit of the currency in AED, with the lock date', () => {
    expect(formatFx('EUR', '3.9789000000', '2026-10-02T08:00:00Z', { now: NOW })).toBe(
      'EUR 1 = AED 3.9789 · locked 2 Oct'
    )
    expect(formatFx('USD', '3.6725')).toBe('USD 1 = AED 3.6725')
  })

  it('rounds a 10-place rate half-up to 4 places on its digits', () => {
    expect(formatFx('GBP', '4.6677500001')).toBe('GBP 1 = AED 4.6678')
    expect(formatFx('GBP', '4.6677499999')).toBe('GBP 1 = AED 4.6677')
    expect(formatFx('JPY', '0.0245')).toBe('JPY 1 = AED 0.0245')
  })

  it('shows the year when the rate was locked in another year', () => {
    expect(formatFx('EUR', '3.9', '2025-12-30T08:00:00Z', { now: NOW })).toBe(
      'EUR 1 = AED 3.9000 · locked 30 Dec 2025'
    )
  })
})

describe('formatQty', () => {
  it.each([
    ['24', undefined, '24'],
    ['24.0000', 'ea', '24 ea'],
    ['1200', 'm', '1,200 m'],
    ['2.5000', 'set', '2.5 set'],
    ['0.125', undefined, '0.125'],
    ['-3', undefined, '-3'],
    ['', 'ea', '—'],
  ] as const)('%s %s → %s', (qty, uom, out) => {
    expect(formatQty(qty, uom)).toBe(out)
  })
})

describe('formatDate and formatTime (Asia/Dubai)', () => {
  it('omits the year inside the current year and prints it otherwise', () => {
    expect(formatDate('2026-09-14T08:00:00Z', { now: NOW })).toBe('14 Sep')
    expect(formatDate('2025-09-30T08:00:00Z', { now: NOW })).toBe('30 Sep 2025')
    expect(formatDate('2026-09-30T08:00:00Z', { now: NOW, year: 'always' })).toBe('30 Sep 2026')
  })

  it('reads both the date and "this year" in Dubai, across the year boundary', () => {
    // 31 Dec 2026 21:30 UTC is 1 Jan 2027 01:30 in Dubai.
    const newYearDubai = new Date('2026-12-31T21:30:00Z')
    expect(formatDate(newYearDubai, { now: newYearDubai })).toBe('1 Jan')
    expect(formatDate('2026-12-31T19:00:00Z', { now: newYearDubai })).toBe('31 Dec 2026')
    expect(formatDate(newYearDubai, { now: NOW })).toBe('1 Jan 2027')
  })

  it('uses its own month names, so September is "Sep" on every ICU build', () => {
    expect(formatDate('2026-09-01T08:00:00Z', { now: NOW })).toBe('1 Sep')
  })

  it('formats 24-hour time in Dubai', () => {
    expect(formatTime('2026-11-20T05:12:00Z')).toBe('09:12')
    expect(formatTime('2026-11-20T20:05:00Z')).toBe('00:05')
  })

  it('refuses an invalid date', () => {
    expect(() => formatDate('not a date')).toThrow(RangeError)
  })
})

describe('formatRelative', () => {
  const ago = (ms: number) => new Date(NOW.getTime() - ms)
  it.each([
    [20_000, 'now'],
    [12 * 60_000, '12 min'],
    [3 * 3_600_000 + 59 * 60_000, '3 h'],
    [2 * 86_400_000, '2 d'],
    [-12 * 60_000, 'in 12 min'],
    [8 * 86_400_000, '12 Nov'],
  ])('%i ms ago → %s', (ms, out) => {
    expect(formatRelative(ago(ms), { now: NOW })).toBe(out)
  })
})

describe('quotation slugs', () => {
  it.each(['INDUS/Q10001', 'INDUS/Q10001-R2', 'INDUS/Q1-R12'])('%s round-trips', (no) => {
    expect(quotationFromSlug(quotationSlug(no))).toBe(no)
  })

  it('maps INDUS/Q10001-R2 to Q10001-R2', () => {
    expect(quotationSlug('INDUS/Q10001-R2')).toBe('Q10001-R2')
  })

  it.each(['Q10001-', 'INDUS/Q10001', 'q10001', 'Q10001/R2', '../Q1', ''])(
    'rejects slug %p',
    (slug) => {
      expect(quotationFromSlug(slug)).toBeNull()
    }
  )

  it('throws on a number that is not a quotation', () => {
    expect(() => quotationSlug('IH-RFQ-2611-P01')).toThrow(RangeError)
  })
})
