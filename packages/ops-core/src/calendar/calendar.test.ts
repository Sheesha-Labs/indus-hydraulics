import { describe, expect, it } from 'vitest'
import {
  addWorkingDays,
  workingDaysBetween,
  isWorkingDay,
  nextWorkingDay,
  ramadanWindow,
  type HolidayRow,
  type WeekendTable,
} from './working-day'
import {
  dateKey,
  instantAt,
  localDateKey,
  nextDate,
  offsetMinutes,
  wallTime,
  weekdayOf,
} from './zoned'

const WEEKENDS: WeekendTable = { default: [6, 0], byCountry: { SA: [5, 6] } }
const HOLIDAYS: HolidayRow[] = [
  { country: 'AE', date: '2026-12-02', kind: 'public_holiday' },
  { country: 'AE', date: '2026-12-03', kind: 'public_holiday' },
  { country: 'AE', date: '2026-12-24', kind: 'closure' },
  { country: 'AE', date: '2027-02-08', kind: 'ramadan', hoursStart: '10:00', hoursEnd: '15:00' },
  { country: 'AE', date: '2027-02-09', kind: 'ramadan' },
]
const d = (s: string) => {
  const [year, month, day] = s.split('-').map(Number) as [number, number, number]
  return { year, month, day }
}

describe('zoned time', () => {
  it('reads wall time and offsets across zones and DST', () => {
    const at = new Date('2026-11-23T05:30:00Z')
    expect(wallTime(at, 'Asia/Dubai')).toMatchObject({
      year: 2026,
      month: 11,
      day: 23,
      hour: 9,
      minute: 30,
    })
    expect(offsetMinutes(at, 'Asia/Kolkata')).toBe(330)
    expect(offsetMinutes(new Date('2027-07-01T12:00:00Z'), 'Europe/Rome')).toBe(120)
    expect(offsetMinutes(new Date('2027-01-01T12:00:00Z'), 'Europe/Rome')).toBe(60)
    expect(instantAt(d('2026-11-23'), 8, 30, 'Asia/Dubai').toISOString()).toBe(
      '2026-11-23T04:30:00.000Z'
    )
    expect(localDateKey(new Date('2026-11-23T21:00:00Z'), 'Asia/Dubai')).toBe('2026-11-24')
  })

  it('walks dates across month and year ends; weekday 0 = Sunday', () => {
    expect(dateKey(nextDate(d('2026-12-31')))).toBe('2027-01-01')
    expect(dateKey(nextDate(d('2028-02-28')))).toBe('2028-02-29')
    expect(weekdayOf(d('2026-11-22'))).toBe(0)
    expect(weekdayOf(d('2026-11-27'))).toBe(5)
  })
})

describe('working days', () => {
  it.each([
    ['2026-11-23', 'AE', true],
    ['2026-11-21', 'AE', false],
    ['2026-11-22', 'AE', false],
    ['2026-11-22', 'SA', true],
    ['2026-11-27', 'SA', false],
    ['2026-12-02', 'AE', false],
    ['2026-12-02', 'SA', true],
    ['2026-12-24', 'AE', false],
    ['2027-02-08', 'AE', true],
    ['2026-11-21', 'IT', false],
  ] as const)('%s in %s working = %s', (date, country, expected) => {
    expect(isWorkingDay(d(date), country, HOLIDAYS, WEEKENDS)).toBe(expected)
  })

  it('finds the next working day and adds working days', () => {
    expect(dateKey(nextWorkingDay(d('2026-12-02'), 'AE', HOLIDAYS, WEEKENDS))).toBe('2026-12-04')
    expect(dateKey(addWorkingDays(d('2026-12-01'), 1, 'AE', HOLIDAYS, WEEKENDS))).toBe('2026-12-04')
    expect(dateKey(addWorkingDays(d('2026-12-01'), 3, 'AE', HOLIDAYS, WEEKENDS))).toBe('2026-12-08')
    expect(dateKey(addWorkingDays(d('2026-11-21'), 0, 'AE', HOLIDAYS, WEEKENDS))).toBe('2026-11-23')
  })

  it('reports Ramadan hours, defaulting to 10:00–15:00', () => {
    expect(ramadanWindow(d('2027-02-08'), 'AE', HOLIDAYS)).toEqual({ start: '10:00', end: '15:00' })
    expect(ramadanWindow(d('2027-02-09'), 'AE', HOLIDAYS)).toEqual({ start: '10:00', end: '15:00' })
    expect(ramadanWindow(d('2027-02-09'), 'SA', HOLIDAYS)).toBeNull()
    expect(ramadanWindow(d('2026-11-23'), 'AE', HOLIDAYS)).toBeNull()
  })
})

describe('workingDaysBetween', () => {
  it('counts working days after the start, up to the end', () => {
    const w = { default: [6, 0], byCountry: {} }
    // Thu 24 Sep 2026 → Mon 28 Sep 2026: Fri and Mon (Sat, Sun are the weekend) = 2.
    expect(
      workingDaysBetween(
        { year: 2026, month: 9, day: 24 },
        { year: 2026, month: 9, day: 28 },
        'AE',
        [],
        w
      )
    ).toBe(2)
    expect(
      workingDaysBetween(
        { year: 2026, month: 9, day: 24 },
        { year: 2026, month: 9, day: 24 },
        'AE',
        [],
        w
      )
    ).toBe(0)
    expect(
      workingDaysBetween(
        { year: 2026, month: 9, day: 24 },
        { year: 2026, month: 9, day: 1 },
        'AE',
        [],
        w
      )
    ).toBe(0)
  })
})
