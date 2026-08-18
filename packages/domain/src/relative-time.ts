/**
 * The one relative-time ladder for the admin (design language LT-12).
 *
 * This exists for correctness before it exists for consistency. The audit found
 * nine date renderings across the admin, four of them bare
 * `toLocaleDateString()` calls with no locale argument. Those resolve the
 * locale from the *host* — Node's ICU default on the server, the browser's
 * language on the client — so the same timestamp serialises to two different
 * strings in one render pass and React throws a hydration mismatch. Every
 * string this module returns is locale-independent ASCII, so a given
 * (value, now) pair produces the same characters everywhere.
 *
 * Two things the design document leaves open, decided here:
 *
 *  1. **Calendar days are counted in UTC, never local time.** "today" and
 *     "yesterday" are the only rungs that depend on where a day boundary falls,
 *     and taking that boundary from the runtime's timezone would reintroduce
 *     exactly the server/client divergence the helper is meant to remove — a
 *     Dubai browser and a UTC server disagree about the calendar day for four
 *     hours out of every twenty-four.
 *  2. **The hours rung stops at 12h.** The document lists both `{n}h ago` and
 *     `today`, which overlap; without a cap the hours rung swallows `today`
 *     entirely and that rung never renders. Twelve hours is the midpoint of a
 *     day, so a morning entry reads as hours all working day and settles to
 *     "today" by evening.
 *
 * Months are counted as whole calendar months rather than the `days / 30` the
 * local helper in the blog list used, which reported a 364-day-old row as
 * "12mo ago". `now` is injected so the ladder is unit-testable against a fixed
 * instant; it defaults to the real clock for call sites that do not care.
 */

/** Anything a Prisma column or a serialised payload hands a list cell. */
export type RelativeTimeValue = Date | string | null | undefined

/** What a null, undefined or unparseable value renders as (LT-12). */
const EMPTY = '—'

const MINUTE_MS = 60_000
const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

/** Whole hours before the ladder hands over to calendar days. See docblock (2). */
const HOURS_RUNG_LIMIT_MS = 12 * HOUR_MS

/** Days before the ladder hands over to months. Matches the previous helper. */
const DAYS_RUNG_LIMIT = 30

/**
 * Days elapsed since the epoch in UTC. Differencing two of these gives the
 * number of calendar-day boundaries crossed, which is what "yesterday" means —
 * as opposed to 24-hour blocks, under which 23:50 and 00:10 are "the same day".
 */
function utcDayIndex(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS)
}

/**
 * Whole calendar months between two instants, in UTC, floored at 1.
 *
 * The floor matters at the seam: 1 Jan → 31 Jan is 30 days, which clears the
 * days rung, but zero completed calendar months. "0mo ago" is not a thing a
 * table should ever show.
 */
function wholeCalendarMonths(from: Date, to: Date): number {
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth())
  if (to.getUTCDate() < from.getUTCDate()) months -= 1
  return Math.max(1, months)
}

/**
 * Render a timestamp as a compressed relative string: `just now`, `{n}m ago`,
 * `{n}h ago`, `today`, `yesterday`, `{n}d ago`, `{n}mo ago`, `{n}y ago`.
 *
 * Null, undefined and unparseable input all render `—`, so an Updated column
 * never collapses to zero width on a row that lacks the value.
 *
 * A future timestamp reports `just now` rather than a negative count. Clock
 * skew between the database and the web process is measured in seconds and a
 * row that reads "in 3s" looks like a bug to the person reading it; a genuinely
 * scheduled future date is a different presentation problem and belongs to the
 * caller, not to a list cell.
 */
export function relativeTime(value: RelativeTimeValue, now: Date = new Date()): string {
  if (value === null || value === undefined) return EMPTY

  const then = value instanceof Date ? value : new Date(value)
  const thenMs = then.getTime()
  if (Number.isNaN(thenMs)) return EMPTY

  const nowMs = now.getTime()
  if (Number.isNaN(nowMs)) return EMPTY

  const elapsedMs = nowMs - thenMs

  // Negative elapsed (future, or clock skew) falls through here deliberately.
  if (elapsedMs < MINUTE_MS) return 'just now'
  if (elapsedMs < HOUR_MS) return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`
  if (elapsedMs < HOURS_RUNG_LIMIT_MS) return `${Math.floor(elapsedMs / HOUR_MS)}h ago`

  const days = utcDayIndex(now) - utcDayIndex(then)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < DAYS_RUNG_LIMIT) return `${days}d ago`

  const months = wholeCalendarMonths(then, now)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
