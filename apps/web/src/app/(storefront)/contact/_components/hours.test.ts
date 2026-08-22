import { describe, expect, it } from 'vitest'
import {
  dubaiNow,
  formatMinutes,
  parseMinutes,
  parseOpeningHours,
  rotateToToday,
  statusFor,
} from './hours'

const WEEK = parseOpeningHours(['Mo-Fr 09:00-18:00'])

describe('parseMinutes', () => {
  it('reads 24-hour times', () => {
    expect(parseMinutes('09:00')).toBe(540)
    expect(parseMinutes('9:05')).toBe(545)
    expect(parseMinutes('00:00')).toBe(0)
  })

  it('rejects anything that is not a clock time', () => {
    expect(parseMinutes('By appointment')).toBeNull()
    expect(parseMinutes('25:00')).toBeNull()
    expect(parseMinutes('09:60')).toBeNull()
    expect(parseMinutes(null)).toBeNull()
  })
})

describe('formatMinutes', () => {
  it('renders 12-hour clock labels', () => {
    expect(formatMinutes(540)).toBe('9 AM')
    expect(formatMinutes(1080)).toBe('6 PM')
    expect(formatMinutes(1170)).toBe('7:30 PM')
    expect(formatMinutes(0)).toBe('12 AM')
    expect(formatMinutes(720)).toBe('12 PM')
  })
})

describe('parseOpeningHours', () => {
  it('always returns seven rows, Sunday first', () => {
    expect(WEEK).toHaveLength(7)
    expect(WEEK[0]?.day).toBe('Sunday')
    expect(WEEK[6]?.day).toBe('Saturday')
  })

  it('expands a day range', () => {
    expect(WEEK[1]?.display).toBe('9 AM–6 PM')
    expect(WEEK[5]?.display).toBe('9 AM–6 PM')
  })

  it('closes days no specifier covers', () => {
    expect(WEEK[6]?.display).toBe('Closed')
    expect(WEEK[6]?.openMinutes).toBeNull()
    expect(WEEK[0]?.display).toBe('Closed')
  })

  it('reads comma lists and single days', () => {
    const rows = parseOpeningHours(['Mo,We 08:00-12:00', 'Sa 10:00-14:00'])
    expect(rows[1]?.display).toBe('8 AM–12 PM')
    expect(rows[3]?.display).toBe('8 AM–12 PM')
    expect(rows[2]?.display).toBe('Closed')
    expect(rows[6]?.display).toBe('10 AM–2 PM')
  })

  it('wraps a range across the week boundary', () => {
    const rows = parseOpeningHours(['Sa-Su 10:00-14:00'])
    expect(rows[6]?.display).toBe('10 AM–2 PM')
    expect(rows[0]?.display).toBe('10 AM–2 PM')
    expect(rows[1]?.display).toBe('Closed')
  })

  it('lets the first specifier win so a blanket line cannot overwrite a specific one', () => {
    const rows = parseOpeningHours(['Fr 09:00-12:00', 'Mo-Fr 09:00-18:00'])
    expect(rows[5]?.display).toBe('9 AM–12 PM')
    expect(rows[1]?.display).toBe('9 AM–6 PM')
  })

  it('skips malformed, overnight and zero-length specifiers rather than guessing', () => {
    expect(parseOpeningHours(['Mo-Fr'])[1]?.display).toBe('Closed')
    expect(parseOpeningHours(['Xx-Yy 09:00-18:00'])[1]?.display).toBe('Closed')
    expect(parseOpeningHours(['Mo 22:00-02:00'])[1]?.display).toBe('Closed')
    expect(parseOpeningHours(['Mo 09:00-09:00'])[1]?.display).toBe('Closed')
    expect(parseOpeningHours([])).toHaveLength(7)
  })
})

describe('statusFor', () => {
  it('reports open with a closing time', () => {
    // Wednesday 10:00.
    expect(statusFor(WEEK, { day: 3, minutes: 600 })).toEqual({
      open: true,
      state: 'Open',
      detail: 'Closes 6 PM',
    })
  })

  it('reports closed before opening on a working day', () => {
    expect(statusFor(WEEK, { day: 3, minutes: 480 })).toEqual({
      open: false,
      state: 'Closed',
      detail: 'Opens 9 AM',
    })
  })

  it('points at tomorrow after closing', () => {
    // Wednesday 19:00 → Thursday.
    expect(statusFor(WEEK, { day: 3, minutes: 1140 })).toEqual({
      open: false,
      state: 'Closed',
      detail: 'Opens tomorrow 9 AM',
    })
  })

  it('names the next working day across a weekend', () => {
    // Saturday: next open day is Monday, which is not "tomorrow".
    expect(statusFor(WEEK, { day: 6, minutes: 600 })).toEqual({
      open: false,
      state: 'Closed',
      detail: 'Opens Mon 9 AM',
    })
  })

  it('is exclusive at the closing minute', () => {
    expect(statusFor(WEEK, { day: 3, minutes: 1080 })?.open).toBe(false)
    expect(statusFor(WEEK, { day: 3, minutes: 1079 })?.open).toBe(true)
  })

  it('returns null when no row carries usable times', () => {
    expect(statusFor(parseOpeningHours([]), { day: 1, minutes: 600 })).toBeNull()
  })
})

describe('rotateToToday', () => {
  it('puts today first and keeps the week in order after it', () => {
    const rotated = rotateToToday(WEEK, 4)
    expect(rotated.map((r) => r.index)).toEqual([4, 5, 6, 0, 1, 2, 3])
  })

  it('leaves the order alone before the clock is known', () => {
    expect(rotateToToday(WEEK, null).map((r) => r.index)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('dubaiNow', () => {
  it('reads the wall clock in Dubai, not the host timezone', () => {
    // 2026-08-19T06:30:00Z is Wednesday 10:30 in Dubai (UTC+4).
    expect(dubaiNow(new Date('2026-08-19T06:30:00Z'))).toEqual({ day: 3, minutes: 630 })
  })

  it('rolls the day over at Dubai midnight, not UTC midnight', () => {
    // 21:00Z Wednesday is already Thursday 01:00 in Dubai.
    expect(dubaiNow(new Date('2026-08-19T21:00:00Z'))).toEqual({ day: 4, minutes: 60 })
  })
})
