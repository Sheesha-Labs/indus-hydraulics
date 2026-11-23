import { instantAt, minutesOf, nextDate, wallTime } from '../calendar/zoned'
import { INDUS_TZ } from './next-send-slot'

/**
 * Daily console send caps per mailbox (S04-T06, §1.10; board 89 "resets 04:00 GST"). An Ops counter, not
 * Google's rolling window. Pure.
 */
export function capWindow(now: Date, reset = '04:00', tz = INDUS_TZ): { start: Date; next: Date } {
  const w = wallTime(now, tz)
  const m = minutesOf(reset)
  const todayReset = instantAt(
    { year: w.year, month: w.month, day: w.day },
    Math.floor(m / 60),
    m % 60,
    tz
  )
  if (now.getTime() >= todayReset.getTime()) {
    const tomorrow = nextDate({ year: w.year, month: w.month, day: w.day })
    return { start: todayReset, next: instantAt(tomorrow, Math.floor(m / 60), m % 60, tz) }
  }
  const prev = new Date(Date.UTC(w.year, w.month - 1, w.day - 1))
  const start = instantAt(
    { year: prev.getUTCFullYear(), month: prev.getUTCMonth() + 1, day: prev.getUTCDate() },
    Math.floor(m / 60),
    m % 60,
    tz
  )
  return { start, next: todayReset }
}

export function overCap(sentToday: number, cap: number): boolean {
  return cap > 0 && sentToday >= cap
}

/** Default cap by mailbox role (board 89: sales@ 40, purchase@ 80). */
export function defaultDailyCap(role: string): number {
  return role === 'supplier' ? 80 : 40
}
