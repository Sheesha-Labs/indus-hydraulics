import { describe, expect, it } from 'vitest'
import { monthKey, monthLabel, shortDate } from './blog-dates'

describe('blog dates', () => {
  it('prints September as Sep, not the ICU "Sept"', () => {
    expect(shortDate(new Date('2026-09-01T08:00:00Z'))).toBe('1 Sep 2026')
    expect(shortDate(new Date('2026-10-06T08:00:00Z'))).toBe('6 Oct 2026')
  })

  it('formats in UTC, so late-evening timestamps keep their day', () => {
    expect(shortDate(new Date('2026-08-31T23:30:00Z'))).toBe('31 Aug 2026')
    expect(monthKey(new Date('2026-08-31T23:30:00Z'))).toBe('2026-08')
  })

  it('names and keys months', () => {
    expect(monthLabel(new Date('2026-09-14T00:00:00Z'))).toBe('September 2026')
    expect(monthKey(new Date('2026-01-02T00:00:00Z'))).toBe('2026-01')
  })
})
