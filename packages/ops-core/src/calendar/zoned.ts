/**
 * Wall-clock time in an IANA zone, with the built-in Intl API only (S04-T06). ops-core imports nothing but Zod
 * (purity test), so no date library: Intl.DateTimeFormat does the zone maths, DST included. Every value that
 * crosses this module is a UTC instant (Date) plus a zone name; there is no zone-less Date arithmetic.
 */
export type WallTime = {
  year: number
  month: number // 1–12
  day: number
  hour: number
  minute: number
  /** 0 = Sunday … 6 = Saturday, in the zone. */
  weekday: number
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(tz: string): Intl.DateTimeFormat {
  let f = formatters.get(tz)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      weekday: 'short',
    })
    formatters.set(tz, f)
  }
  return f
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export function wallTime(instant: Date, tz: string): WallTime {
  const parts = Object.fromEntries(
    formatter(tz)
      .formatToParts(instant)
      .map((p) => [p.type, p.value])
  )
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    weekday: WEEKDAYS[parts.weekday ?? 'Sun'] ?? 0,
  }
}

/** The zone's offset from UTC at an instant, in minutes. */
export function offsetMinutes(instant: Date, tz: string): number {
  const w = wallTime(instant, tz)
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute)
  return Math.round((asUtc - Math.floor(instant.getTime() / 60_000) * 60_000) / 60_000)
}

/**
 * The instant at which the zone's clock reads year-month-day hour:minute. In a spring-forward gap the clock
 * time does not exist; the result is the first instant after it (the time the clock jumps to).
 */
export function instantAt(
  date: { year: number; month: number; day: number },
  hour: number,
  minute: number,
  tz: string
): Date {
  const guess = Date.UTC(date.year, date.month - 1, date.day, hour, minute)
  let instant = guess - offsetMinutes(new Date(guess), tz) * 60_000
  // Second pass settles the offset when the first guess sat on the other side of a DST change.
  instant = guess - offsetMinutes(new Date(instant), tz) * 60_000
  const check = wallTime(new Date(instant), tz)
  if (check.hour !== hour || check.minute !== minute) {
    // Gap: move forward to the first valid minute after the requested time.
    const after = guess - offsetMinutes(new Date(instant + 3_600_000), tz) * 60_000
    return new Date(Math.max(instant, after))
  }
  return new Date(instant)
}

/** The calendar date in the zone, as `YYYY-MM-DD`. */
export function localDateKey(instant: Date, tz: string): string {
  const w = wallTime(instant, tz)
  return `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`
}

/** The next calendar date after `date` (pure calendar arithmetic, no zone involved). */
export function nextDate(date: { year: number; month: number; day: number }): {
  year: number
  month: number
  day: number
} {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + 1))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

export function dateKey(date: { year: number; month: number; day: number }): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

/** Weekday of a calendar date (0 = Sunday). */
export function weekdayOf(date: { year: number; month: number; day: number }): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()
}

/** "HH:MM" → minutes since midnight. */
export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}
