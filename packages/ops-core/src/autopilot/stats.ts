import { instantAt, wallTime } from '../calendar/zoned'
import type { RunHistory } from './earned'

/**
 * Board 98 "This week" (S07-T02): pure aggregation over two grouped queries (actions by key and state, the
 * people's decisions by state), Monday 00:00 Asia/Dubai to now. Time saved is an estimate: each action done
 * or drafted × the minutes the Owner logged for the same task (`autopilot_action_def.minutesSaved`).
 */

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** Monday 00:00 in `tz` of the week `now` is in. */
export function weekStart(now: Date, tz = 'Asia/Dubai'): Date {
  const w = wallTime(now, tz)
  const back = (w.weekday + 6) % 7
  const monday = new Date(Date.UTC(w.year, w.month - 1, w.day - back))
  return instantAt(
    { year: monday.getUTCFullYear(), month: monday.getUTCMonth() + 1, day: monday.getUTCDate() },
    0,
    0,
    tz
  )
}

/** "MON 21 – WED 23 SEP" (the card's eyebrow, upper case as drawn). */
export function weekLabel(now: Date, tz = 'Asia/Dubai'): string {
  const a = wallTime(weekStart(now, tz), tz)
  const b = wallTime(now, tz)
  const left = `${DAYS[a.weekday]} ${a.day}${a.month === b.month ? '' : ` ${MONTHS[a.month - 1]}`}`
  return a.day === b.day && a.month === b.month
    ? `${left} ${MONTHS[b.month - 1]}`
    : `${left} – ${DAYS[b.weekday]} ${b.day} ${MONTHS[b.month - 1]}`
}

export interface ActionCountRow {
  actionKey: string
  state: string
  count: number
}
export interface DecisionCountRow {
  toState: string
  count: number
}

export interface WeekStats {
  emailsRead: number
  actionsDone: number
  approved: number
  rejected: number
  undone: number
  /** Minutes, an estimate (never shown without "An estimate, not a measurement"). */
  minutesSaved: number
}

const DONE = new Set(['done', 'queued', 'running', 'approved', 'edited_approved', 'corrected'])
const DRAFTED = new Set(['proposed', 'later'])

export function weekStats(
  actions: readonly ActionCountRow[],
  decisions: readonly DecisionCountRow[],
  minutesSaved: Readonly<Record<string, number | null>>
): WeekStats {
  let emailsRead = 0
  let actionsDone = 0
  let minutes = 0
  for (const r of actions) {
    if (r.actionKey === 'classify_mail') emailsRead += r.count
    if (DONE.has(r.state)) actionsDone += r.count
    if (DONE.has(r.state) || DRAFTED.has(r.state))
      minutes += r.count * (minutesSaved[r.actionKey] ?? 0)
  }
  const by = (states: string[]) =>
    decisions.filter((d) => states.includes(d.toState)).reduce((n, d) => n + d.count, 0)
  return {
    emailsRead,
    actionsDone,
    approved: by(['approved', 'edited_approved']),
    rejected: by(['rejected']),
    undone: by(['undone', 'reverted']),
    minutesSaved: Math.round(minutes),
  }
}

/** "≈ 6 h", "≈ 40 min", "0 min" for the card. */
export function savedText(minutes: number): string {
  if (minutes <= 0) return '0 min'
  if (minutes < 60) return `≈ ${minutes} min`
  const h = minutes / 60
  return `≈ ${h >= 10 ? Math.round(h) : Math.round(h * 2) / 2} h`
}

/** One stored action as the earned-suggestion history sees it (approved by a person or run and kept). */
export function runHistoryOf(row: {
  state: string
  decidedById: string | null
  editDiff: unknown
  createdAt: Date
}): RunHistory {
  const edited =
    row.state === 'edited_approved' || (row.editDiff !== null && row.editDiff !== undefined)
  const rejected = row.state === 'rejected'
  const undone = row.state === 'undone' || row.state === 'reverted' || row.state === 'corrected'
  const kept = ['approved', 'edited_approved', 'queued', 'running', 'done'].includes(row.state)
  return {
    approved: kept && !edited && (row.decidedById !== null || row.state === 'done'),
    edited,
    rejected,
    undone,
    at: row.createdAt,
  }
}
