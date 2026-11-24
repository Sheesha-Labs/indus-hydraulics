import { instantAt, wallTime } from '../calendar/zoned'
import { isWorkingDay, type HolidayRow, type WeekendTable } from '../calendar/working-day'

/**
 * Today (S07-T06, boards 178 / 182). Pure: the greeting, the "came in since yesterday" window and the page's
 * state from the number of things that need a person.
 */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Good morning, Krishan · Thursday 14 Nov", by the clock in `tz`. */
export function todayGreeting(now: Date, firstName: string, tz = 'Asia/Dubai'): string {
  const w = wallTime(now, tz)
  const part = w.hour < 12 ? 'Good morning' : w.hour < 17 ? 'Good afternoon' : 'Good evening'
  return `${part}, ${firstName} · ${DAYS[w.weekday]} ${w.day} ${MONTHS[w.month - 1]}`
}

/**
 * The start of "came in since yesterday": 18:00 on the previous working day (UAE calendar), so Monday morning
 * includes the weekend and the day after a holiday includes it.
 */
export function cameInSince(
  now: Date,
  holidays: readonly HolidayRow[],
  weekends: WeekendTable,
  tz = 'Asia/Dubai'
): Date {
  const w = wallTime(now, tz)
  let d = new Date(Date.UTC(w.year, w.month - 1, w.day))
  for (let i = 0; i < 14; i += 1) {
    d = new Date(d.getTime() - 86_400_000)
    const day = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
    if (isWorkingDay(day, 'AE', holidays, weekends)) return instantAt(day, 18, 0, tz)
  }
  return new Date(now.getTime() - 86_400_000)
}

export const ON_FIRE_ABOVE = 10
export const NEEDS_YOU_SHOWN = 3

/** Calm when nothing needs a person, on fire above ten (board 182), otherwise normal. */
export function todayState(needsYou: number): 'calm' | 'normal' | 'on_fire' {
  if (needsYou === 0) return 'calm'
  return needsYou > ON_FIRE_ABOVE ? 'on_fire' : 'normal'
}
