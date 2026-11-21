// Relative age for the proposal header ("ASSISTANT · 12 min") and the Later labels.
// TODO(S01-T10): replace formatAge with formatRelative and formatLaterUntil's clock with formatTime from
// @indus/ops-ui/format (S01-T05 adds format.ts); neither was in this task's base commit.
import type { LaterUntil } from './types'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/**
 * "now" under a minute, "12 min", "2 h", "2 h 10 min" under a day, then whole days ("3 d"). A negative
 * age (a clock ahead of the server) reads "now".
 */
export function formatAge(ms: number): string {
  if (!Number.isFinite(ms) || ms < MIN) return 'now'
  if (ms < HOUR) return `${Math.floor(ms / MIN)} min`
  if (ms < DAY) {
    const h = Math.floor(ms / HOUR)
    const m = Math.floor((ms % HOUR) / MIN)
    return m === 0 ? `${h} h` : `${h} h ${m} min`
  }
  return `${Math.floor(ms / DAY)} d`
}

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Dubai',
})

/** "in 1 hour", "tomorrow at 09:00", "Monday at 09:00", or "20 Nov, 14:30" (Dubai time) for a picked time. */
export function formatLaterUntil(until: LaterUntil): string {
  if (until === 'in-1h') return 'in 1 hour'
  if (until === 'tomorrow-0900') return 'tomorrow at 09:00'
  if (until === 'monday-0900') return 'Monday at 09:00'
  // Assembled from parts: the joining words of a formatted string differ between ICU versions.
  const part = (t: Intl.DateTimeFormatPartTypes) =>
    CLOCK.formatToParts(until).find((p) => p.type === t)?.value ?? ''
  return `${part('day')} ${part('month')}, ${part('hour')}:${part('minute')}`
}
