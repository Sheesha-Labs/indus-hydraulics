import { describe, expect, it } from 'vitest'
import { relativeTime } from './relative-time'

/**
 * Mid-afternoon UTC on the 17th, deliberately not near a day boundary, so a
 * test that means "3 hours ago" does not accidentally also cross midnight.
 */
const NOW = new Date('2026-08-17T14:00:00.000Z')

const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

/** A Date `ms` before the fixed NOW. */
const ago = (ms: number): Date => new Date(NOW.getTime() - ms)

describe('relativeTime — absent and unparseable values', () => {
  it('renders an em dash for null', () => {
    expect(relativeTime(null, NOW)).toBe('—')
  })

  it('renders an em dash for undefined', () => {
    expect(relativeTime(undefined, NOW)).toBe('—')
  })

  it('renders an em dash for an unparseable string rather than "Invalid Date"', () => {
    expect(relativeTime('not-a-date', NOW)).toBe('—')
  })

  it('renders an em dash for an Invalid Date object', () => {
    expect(relativeTime(new Date('nonsense'), NOW)).toBe('—')
  })

  it('renders an em dash for an empty string', () => {
    expect(relativeTime('', NOW)).toBe('—')
  })
})

describe('relativeTime — accepted input shapes', () => {
  it('accepts an ISO string as well as a Date', () => {
    expect(relativeTime('2026-08-17T11:00:00.000Z', NOW)).toBe('3h ago')
    expect(relativeTime(new Date('2026-08-17T11:00:00.000Z'), NOW)).toBe('3h ago')
  })
})

describe('relativeTime — the ladder', () => {
  it('reads sub-minute as "just now"', () => {
    expect(relativeTime(ago(0), NOW)).toBe('just now')
    expect(relativeTime(ago(30_000), NOW)).toBe('just now')
  })

  it('counts minutes', () => {
    expect(relativeTime(ago(MINUTE), NOW)).toBe('1m ago')
    expect(relativeTime(ago(45 * MINUTE), NOW)).toBe('45m ago')
  })

  it('counts hours', () => {
    expect(relativeTime(ago(HOUR), NOW)).toBe('1h ago')
    expect(relativeTime(ago(5 * HOUR), NOW)).toBe('5h ago')
  })

  it('reads "today" for an earlier point on the same UTC day', () => {
    // 14 hours back from 14:00 is 00:00 the same calendar day: past the 12h
    // hours rung, but no day boundary crossed.
    expect(relativeTime(ago(14 * HOUR), NOW)).toBe('today')
  })

  it('reads "yesterday" one calendar day back', () => {
    expect(relativeTime(new Date('2026-08-16T02:00:00.000Z'), NOW)).toBe('yesterday')
  })

  it('counts days', () => {
    expect(relativeTime(ago(2 * DAY), NOW)).toBe('2d ago')
    expect(relativeTime(ago(29 * DAY), NOW)).toBe('29d ago')
  })

  it('counts months', () => {
    expect(relativeTime(new Date('2026-05-17T14:00:00.000Z'), NOW)).toBe('3mo ago')
    expect(relativeTime(new Date('2025-09-17T14:00:00.000Z'), NOW)).toBe('11mo ago')
  })

  it('counts years', () => {
    expect(relativeTime(new Date('2025-08-17T14:00:00.000Z'), NOW)).toBe('1y ago')
    expect(relativeTime(new Date('2021-01-04T09:00:00.000Z'), NOW)).toBe('5y ago')
  })
})

describe('relativeTime — rung boundaries', () => {
  it('flips from "just now" to minutes at exactly 60s', () => {
    expect(relativeTime(ago(MINUTE - 1), NOW)).toBe('just now')
    expect(relativeTime(ago(MINUTE), NOW)).toBe('1m ago')
  })

  it('flips from minutes to hours at exactly 60m', () => {
    expect(relativeTime(ago(HOUR - 1), NOW)).toBe('59m ago')
    expect(relativeTime(ago(HOUR), NOW)).toBe('1h ago')
  })

  it('stops counting hours at 12h so the "today" rung is reachable', () => {
    expect(relativeTime(ago(12 * HOUR - 1), NOW)).toBe('11h ago')
    expect(relativeTime(ago(12 * HOUR), NOW)).toBe('today')
  })

  it('flips from "today" to "yesterday" on the UTC day boundary, not on 24h', () => {
    // 23:59:59 on the 16th is 14h01m back — one boundary crossed, so it is
    // yesterday even though a 24-hour rule would still call it today.
    expect(relativeTime(new Date('2026-08-16T23:59:59.000Z'), NOW)).toBe('yesterday')
    expect(relativeTime(new Date('2026-08-17T00:00:00.000Z'), NOW)).toBe('today')
  })

  it('flips from "yesterday" to days two boundaries back', () => {
    expect(relativeTime(new Date('2026-08-16T00:00:00.000Z'), NOW)).toBe('yesterday')
    expect(relativeTime(new Date('2026-08-15T23:59:59.000Z'), NOW)).toBe('2d ago')
  })

  it('flips from days to months at 30 days', () => {
    expect(relativeTime(ago(29 * DAY), NOW)).toBe('29d ago')
    expect(relativeTime(ago(30 * DAY), NOW)).toBe('1mo ago')
  })

  it('never reports "0mo ago" when 30 days spans less than a calendar month', () => {
    // 18 Jul → 17 Aug is 30 days but zero completed calendar months.
    expect(relativeTime(new Date('2026-07-18T14:00:00.000Z'), NOW)).toBe('1mo ago')
  })

  it('flips from months to years at twelve whole months', () => {
    expect(relativeTime(new Date('2025-08-18T14:00:00.000Z'), NOW)).toBe('11mo ago')
    expect(relativeTime(new Date('2025-08-17T14:00:00.000Z'), NOW)).toBe('1y ago')
  })

  it('holds a partial year at the lower year rather than rounding up', () => {
    expect(relativeTime(new Date('2024-09-17T14:00:00.000Z'), NOW)).toBe('1y ago')
    expect(relativeTime(new Date('2024-08-17T14:00:00.000Z'), NOW)).toBe('2y ago')
  })
})

describe('relativeTime — future values', () => {
  it('reports a future timestamp as "just now" rather than a negative count', () => {
    expect(relativeTime(new Date('2026-08-17T14:00:05.000Z'), NOW)).toBe('just now')
    expect(relativeTime(new Date('2026-12-25T00:00:00.000Z'), NOW)).toBe('just now')
  })
})

describe('relativeTime — determinism', () => {
  it('defaults `now` to the real clock', () => {
    expect(relativeTime(new Date())).toBe('just now')
  })

  it('produces locale-independent ASCII, the hydration hazard this replaces', () => {
    // Nothing in the output may come from Intl: a locale-resolved string
    // differs between the Node server and the browser and breaks hydration.
    const rendered = [
      relativeTime(ago(3 * HOUR), NOW),
      relativeTime(ago(3 * DAY), NOW),
      relativeTime(new Date('2024-01-01T00:00:00.000Z'), NOW),
    ]
    for (const value of rendered) {
      expect(value).toMatch(/^[a-z0-9 ]+$/)
    }
  })
})
