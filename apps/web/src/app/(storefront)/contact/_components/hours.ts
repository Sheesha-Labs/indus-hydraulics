/**
 * Opening-hours model for /contact.
 *
 * The source of truth is `Office.openingHours` in lib/site-locations.ts, which
 * is already written in the Schema.org shape ("Mo-Fr 09:00-18:00") because the
 * same array feeds the LocalBusiness JSON-LD. Rather than store the week twice
 * — once for humans, once for Google — this parses that array into seven rows.
 * A day no specifier covers is closed; a specifier we can't read is skipped
 * rather than guessed at, so a typo yields "Closed", never a wrong time.
 *
 * The office is in Dubai, so "now" is always Asia/Dubai (UTC+4, no DST)
 * regardless of where the reader is. The status is computed on the CLIENT: the
 * page is statically revalidated (revalidate = 3600) and CDN-cached, so a
 * server-rendered "Open now" would be stale by up to an hour.
 */

export type HoursRow = {
  /** 0 = Sunday … 6 = Saturday, matching `Date#getDay`. */
  index: number
  /** "Monday". */
  day: string
  /** Minutes from midnight, or null on a closed day. */
  openMinutes: number | null
  closeMinutes: number | null
  /** "9 AM–6 PM" or "Closed". */
  display: string
}

export type HoursStatus = {
  open: boolean
  /** "Open" / "Closed". */
  state: string
  /** "Closes 6 PM", "Opens Mon 9 AM" — null when nothing can be said. */
  detail: string | null
}

/** Schema.org day tokens, indexed to `Date#getDay`. */
const DAY_TOKENS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** "09:00" → 540. Null for anything that isn't a 24-hour clock time. */
export function parseMinutes(value: string | null | undefined): number | null {
  if (!value) return null
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const hours = Number(m[1])
  const minutes = Number(m[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

/** 540 → "9 AM", 1170 → "7:30 PM". */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60) % 24
  const minutes = total % 60
  const suffix = hours < 12 ? 'AM' : 'PM'
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  return minutes === 0 ? `${h12} ${suffix}` : `${h12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

/** "Mo" / "mon" / "Monday" → 1. Null when the token isn't a weekday. */
function dayIndex(token: string): number | null {
  const key = token.trim().toLowerCase().slice(0, 2)
  const i = DAY_TOKENS.indexOf(key)
  return i === -1 ? null : i
}

/**
 * Expand one day specifier into the indices it covers.
 * Accepts "Mo", "Mo-Fr", "Mo,We,Fr" and mixtures of the two. A range that
 * wraps the week ("Sa-Su") is walked forward from its start, so it yields
 * Saturday and Sunday rather than an empty set.
 */
function expandDays(spec: string): number[] {
  const out = new Set<number>()
  for (const part of spec.split(',')) {
    const range = part.split('-')
    if (range.length === 2) {
      const from = dayIndex(range[0] ?? '')
      const to = dayIndex(range[1] ?? '')
      if (from === null || to === null) continue
      for (let step = 0; step <= (to - from + 7) % 7; step++) out.add((from + step) % 7)
    } else {
      const only = dayIndex(part)
      if (only !== null) out.add(only)
    }
  }
  return [...out]
}

/**
 * Parse the Schema.org `openingHours` array into seven rows, Sunday first.
 * Days no specifier mentions come back closed.
 */
export function parseOpeningHours(specs: readonly string[]): HoursRow[] {
  const times = new Map<number, { open: number; close: number }>()

  for (const spec of specs) {
    // "Mo-Fr 09:00-18:00" — days first, then the clock range. Anything that
    // doesn't match that shape (a 24/7 marker, free text) is skipped.
    const m = /^\s*([A-Za-z,\-\s]+?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/.exec(spec)
    if (!m) continue
    const open = parseMinutes(m[2])
    const close = parseMinutes(m[3])
    // An overnight or zero-length shift can't be summarised honestly, so it is
    // dropped rather than rendered backwards.
    if (open === null || close === null || close <= open) continue
    for (const day of expandDays(m[1] ?? '')) {
      // First specifier wins, so a later blanket line can't overwrite a
      // day-specific one written above it.
      if (!times.has(day)) times.set(day, { open, close })
    }
  }

  return DAY_NAMES.map((day, index) => {
    const t = times.get(index)
    return {
      index,
      day,
      openMinutes: t ? t.open : null,
      closeMinutes: t ? t.close : null,
      display: t ? `${formatMinutes(t.open)}–${formatMinutes(t.close)}` : 'Closed',
    }
  })
}

/** The current weekday and minute-of-day in Dubai. */
export function dubaiNow(date: Date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dubai',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  // `hour12: false` yields "24" for midnight on some ICU versions.
  const hour = Number(get('hour')) % 24
  return {
    day: dayIndex(get('weekday')) ?? 0,
    minutes: hour * 60 + Number(get('minute')),
  }
}

/** Rows in the order they should read: today first, then the rest of the week. */
export function rotateToToday(rows: HoursRow[], today: number | null): HoursRow[] {
  if (today === null) return rows
  return [...rows].sort((a, b) => ((a.index - today + 7) % 7) - ((b.index - today + 7) % 7))
}

/**
 * The Google-style summary line: open now and when it closes, or shut and when
 * it next opens. Null when no row carries usable times.
 */
export function statusFor(rows: HoursRow[], now: { day: number; minutes: number }): HoursStatus | null {
  const byDay = new Map<number, HoursRow>()
  for (const row of rows) if (!byDay.has(row.index)) byDay.set(row.index, row)
  if (![...byDay.values()].some((r) => r.openMinutes !== null)) return null

  const today = byDay.get(now.day)
  if (
    today?.openMinutes != null &&
    today.closeMinutes != null &&
    now.minutes >= today.openMinutes &&
    now.minutes < today.closeMinutes
  ) {
    return { open: true, state: 'Open', detail: `Closes ${formatMinutes(today.closeMinutes)}` }
  }

  if (today?.openMinutes != null && now.minutes < today.openMinutes) {
    return { open: false, state: 'Closed', detail: `Opens ${formatMinutes(today.openMinutes)}` }
  }

  for (let step = 1; step <= 7; step++) {
    const next = byDay.get((now.day + step) % 7)
    if (next?.openMinutes == null) continue
    const label = step === 1 ? 'tomorrow' : DAY_SHORT[(now.day + step) % 7]
    return { open: false, state: 'Closed', detail: `Opens ${label} ${formatMinutes(next.openMinutes)}` }
  }

  // Every row is closed — say so without inventing a time.
  return { open: false, state: 'Closed', detail: null }
}
