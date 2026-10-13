/**
 * Dates on the blog's listing surfaces — cards, the topic hub's article list.
 *
 * Fixed month names rather than `toLocaleDateString('en-GB', { month: 'short' })`,
 * which since ICU 72 prints September as "Sept" — "1 Sept 2026" beside
 * "6 Oct 2026" in the same list. And UTC throughout, so a date formatted on the
 * server and one formatted while hydrating can never land on different days.
 */
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "6 Oct 2026" */
export function shortDate(date: Date): string {
  return `${date.getUTCDate()} ${SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

/** "2026-09" — sortable key for grouping by month. */
export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

/** "September 2026" */
export function monthLabel(date: Date): string {
  return `${LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}
