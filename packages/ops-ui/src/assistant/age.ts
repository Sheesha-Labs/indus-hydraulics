// Relative age for the proposal header ("ASSISTANT · 12 min") and the Later labels, on the shared
// formatters in ../format.ts so a proposal reads its age like every activity row.
import { formatDate, formatRelative, formatTime } from '../format'
import type { LaterUntil } from './types'

/**
 * The proposal's age at `now`: "now", "12 min", "2 h", "3 d", then the date from a week (formatRelative).
 * A creation time ahead of `now` (a browser clock behind the server) reads "now", never "in 2 min".
 */
export function formatAge(createdAt: Date, now: Date): string {
  if (!Number.isFinite(createdAt.getTime()) || createdAt.getTime() >= now.getTime()) return 'now'
  return formatRelative(createdAt, { now })
}

/**
 * "in 1 hour", "tomorrow at 09:00", "Monday at 09:00", or "20 Nov, 14:30" (Asia/Dubai) for a picked time;
 * the year appears only when the picked time is not in `now`'s year.
 */
export function formatLaterUntil(until: LaterUntil, now: Date = new Date()): string {
  if (until === 'in-1h') return 'in 1 hour'
  if (until === 'tomorrow-0900') return 'tomorrow at 09:00'
  if (until === 'monday-0900') return 'Monday at 09:00'
  return `${formatDate(until, { now })}, ${formatTime(until)}`
}
