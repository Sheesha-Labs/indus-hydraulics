import { dateKey, minutesOf, nextDate, wallTime, weekdayOf } from './zoned'

/**
 * Working days per country (S04-T06): a day is working unless it is a weekend day for the country or a
 * public_holiday / closure row for it. Ramadan rows do not close a day; they change its hours. Pure: holidays
 * and weekends are passed in (they are database content).
 */
export type HolidayRow = {
  country: string
  /** YYYY-MM-DD */
  date: string
  kind: 'public_holiday' | 'ramadan' | 'closure'
  hoursStart?: string | null
  hoursEnd?: string | null
}

export type WeekendTable = {
  default: readonly number[]
  byCountry: Readonly<Record<string, readonly number[]>>
}

export type CalendarDate = { year: number; month: number; day: number }

export function weekendDays(country: string, weekends: WeekendTable): readonly number[] {
  return weekends.byCountry[country] ?? weekends.default
}

export function isWorkingDay(
  date: CalendarDate,
  country: string,
  holidays: readonly HolidayRow[],
  weekends: WeekendTable
): boolean {
  if (weekendDays(country, weekends).includes(weekdayOf(date))) return false
  const key = dateKey(date)
  return !holidays.some(
    (h) =>
      h.country === country &&
      h.date === key &&
      (h.kind === 'public_holiday' || h.kind === 'closure')
  )
}

/** The first working day on or after `date` (looks ahead at most a year). */
export function nextWorkingDay(
  date: CalendarDate,
  country: string,
  holidays: readonly HolidayRow[],
  weekends: WeekendTable
): CalendarDate {
  let d = date
  for (let i = 0; i < 370; i += 1) {
    if (isWorkingDay(d, country, holidays, weekends)) return d
    d = nextDate(d)
  }
  return d
}

/** `n` working days after `date` (n = 0 → the date itself if working, else the next working day). */
export function addWorkingDays(
  date: CalendarDate,
  n: number,
  country: string,
  holidays: readonly HolidayRow[],
  weekends: WeekendTable
): CalendarDate {
  let d = nextWorkingDay(date, country, holidays, weekends)
  for (let i = 0; i < n; i += 1) d = nextWorkingDay(nextDate(d), country, holidays, weekends)
  return d
}

/** The Ramadan hours for a date in a country, or null when it is not a Ramadan day. */
export function ramadanWindow(
  date: CalendarDate,
  country: string,
  holidays: readonly HolidayRow[]
): { start: string; end: string } | null {
  const key = dateKey(date)
  const row = holidays.find((h) => h.country === country && h.date === key && h.kind === 'ramadan')
  if (!row) return null
  return { start: row.hoursStart ?? '10:00', end: row.hoursEnd ?? '15:00' }
}

/**
 * Desk hours (S04-T09): a UAE working day from 08:00 to 19:00 GST. Health alerts that would wake nobody useful
 * are held to these hours.
 */
export const DESK_HOURS: Readonly<{ start: string; end: string }> = { start: '08:00', end: '19:00' }

export function isDeskHours(
  now: Date,
  holidays: readonly HolidayRow[],
  weekends: WeekendTable,
  hours: Readonly<{ start: string; end: string }> = DESK_HOURS
): boolean {
  const w = wallTime(now, 'Asia/Dubai')
  const day = { year: w.year, month: w.month, day: w.day }
  if (!isWorkingDay(day, 'AE', holidays, weekends)) return false
  const minute = w.hour * 60 + w.minute
  return minute >= minutesOf(hours.start) && minute < minutesOf(hours.end)
}
