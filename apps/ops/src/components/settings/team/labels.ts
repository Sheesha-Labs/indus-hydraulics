import { formatDate, formatTime } from '@indus/ops-ui/format'

/**
 * Board 84's words for when a device was last active and when someone signed in. Pure: the page passes
 * `now`, so the server render is the only clock. All times are Asia/Dubai.
 */
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** lastSeenAt is stamped at most every 5 minutes, so anything within that reads "Active now". */
export const ACTIVE_NOW_MS = 5 * MINUTE

/** "Active now", "12 min ago", "3 h ago", "Yesterday", "3 days ago", then "14 Sep". */
export function activityLabel(lastSeenAt: Date, now: Date, current = false): string {
  const ago = now.getTime() - lastSeenAt.getTime()
  if (current || ago < ACTIVE_NOW_MS) return 'Active now'
  if (ago < HOUR) return `${Math.floor(ago / MINUTE)} min ago`
  if (ago < DAY) return `${Math.floor(ago / HOUR)} h ago`
  const days = Math.floor(ago / DAY)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(lastSeenAt, { now })
}

/** The calendar day in Dubai, as a comparable number. */
function dubaiDay(d: Date): number {
  const [day, month, year] = formatDate(d, { year: 'always', now: d }).split(' ')
  const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
  return Number(year) * 10_000 + (months.indexOf(month ?? '') + 1) * 100 + Number(day)
}

/** "Today 08:41", "Yesterday 18:02", "14 Sep 09:12". */
export function whenLabel(at: Date, now: Date): string {
  const time = formatTime(at)
  const today = dubaiDay(now)
  const day = dubaiDay(at)
  if (day === today) return `Today ${time}`
  const yesterday = dubaiDay(new Date(now.getTime() - DAY))
  if (day === yesterday) return `Yesterday ${time}`
  return `${formatDate(at, { now })} ${time}`
}

const METHOD: Record<'google' | 'password', string> = { google: 'Google', password: 'Password' }

/** "Today 08:41 · Google · Dubai" (the city when known). */
export function signInLabel(
  record: { at: Date; method: 'google' | 'password' | null; city: string | null },
  now: Date
): string {
  return [whenLabel(record.at, now), record.method ? METHOD[record.method] : null, record.city]
    .filter(Boolean)
    .join(' · ')
}

/** "Active now · Dubai" under a device's name. */
export function deviceSub(
  device: { lastSeenAt: Date; city: string | null; current: boolean },
  now: Date
): string {
  return [activityLabel(device.lastSeenAt, now, device.current), device.city]
    .filter(Boolean)
    .join(' · ')
}

/** A form field's text (a File or a missing field reads as ''). */
export function formText(form: FormData, name: string): string {
  const value = form.get(name)
  return typeof value === 'string' ? value : ''
}
