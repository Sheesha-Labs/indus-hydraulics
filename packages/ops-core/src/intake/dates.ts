/**
 * Printed dates in enquiries (S08-T02/T06): closing dates, "needed by", the date in a forward header. The model
 * quotes the date; code reads it, with the email's sent date as the anchor for a date without a year. A numeric
 * date whose day and month could swap (04/05/2026) is read day-first, as written in the Gulf, and marked ambiguous.
 */
const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
}

export interface PrintedDate {
  /** YYYY-MM-DD */
  date: string
  ambiguous: boolean
}

function valid(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

function year(raw: string | undefined, m: number, d: number, anchor: Date): number {
  if (raw) {
    const n = Number(raw)
    return raw.length <= 2 ? 2000 + n : n
  }
  // No year: the next occurrence on or after the anchor's day.
  const ay = anchor.getUTCFullYear()
  const candidate = Date.UTC(ay, m - 1, d)
  const anchorDay = Date.UTC(ay, anchor.getUTCMonth(), anchor.getUTCDate())
  return candidate >= anchorDay ? ay : ay + 1
}

export function parsePrintedDate(
  text: string | null | undefined,
  anchor: Date
): PrintedDate | null {
  if (!text) return null
  const s = text
    .toLowerCase()
    .replace(/(\d)(st|nd|rd|th)\b/g, '$1')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  let m = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/.exec(s)
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
    return valid(y, mo, d) ? { date: iso(y, mo, d), ambiguous: false } : null
  }
  m = /\b(\d{1,2})[\s./-]+([a-z]{3,9})\.?[\s./-]*(\d{2,4})?\b/.exec(s)
  if (m && MONTHS[m[2]!]) {
    const d = Number(m[1])
    const mo = MONTHS[m[2]!]!
    const y = year(m[3], mo, d, anchor)
    return valid(y, mo, d) ? { date: iso(y, mo, d), ambiguous: false } : null
  }
  m = /\b([a-z]{3,9})\.?\s+(\d{1,2})(?:\s+(\d{2,4}))?\b/.exec(s)
  if (m && MONTHS[m[1]!]) {
    const mo = MONTHS[m[1]!]!
    const d = Number(m[2])
    const y = year(m[3], mo, d, anchor)
    return valid(y, mo, d) ? { date: iso(y, mo, d), ambiguous: false } : null
  }
  m = /\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/.exec(s)
  if (m) {
    const a = Number(m[1])
    const b = Number(m[2])
    const y = year(m[3], b, a, anchor)
    if (valid(y, b, a)) return { date: iso(y, b, a), ambiguous: a <= 12 && b <= 12 && a !== b }
    if (valid(y, a, b)) return { date: iso(y, a, b), ambiguous: false }
  }
  return null
}

/** A YYYY-MM-DD day as the end of that working day in Dubai (18:00, UTC+4): when a "needed by" date runs out. */
export function dubaiEndOfDay(date: string): Date {
  return new Date(`${date}T14:00:00.000Z`)
}
