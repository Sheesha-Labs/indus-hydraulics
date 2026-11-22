// Display formatting for every Ops kit (05 §3.9, L0 money rules). Pure: no React, no I/O. Money and
// quantities go through ops-core's fixed-point helpers, never parseFloat. Dates and times are always shown
// in Asia/Dubai, whatever zone the server or browser runs in. Exported as `@indus/ops-ui/format`.
import { formatDecimal, isWhole, parseDecimal, toDecimalString } from '@indus/ops-core'
import type { DecimalString } from './types'

export const OPS_TIME_ZONE = 'Asia/Dubai'

/** Printed for an empty value (in ink-4 by the caller). */
export const EMPTY = '—'

// ---------------------------------------------------------------------------------------------------
// Money

/** doc: always 2 dp. list: no decimals when the value is whole (pass the list's choice from listDecimals). */
export type MoneyDecimals = 'doc' | 'list'

export interface FormattedMoney {
  /** "USD 218,760.00", "USD (1,283.00)", or "—" when empty. */
  text: string
  /** The amount without its currency: "218,760.00", "(1,283.00)", "—". */
  amount: string
  /** True for a negative amount: render it in io-bad. */
  negative: boolean
  empty: boolean
}

const isEmpty = (v: DecimalString | null | undefined): v is null | undefined | '' =>
  v === null || v === undefined || v.trim() === ''

/**
 * Money with its currency code first: formatMoney('USD', '218760') → "USD 218,760.00". Negatives are in
 * brackets with `negative` set; empty → "—". Throws RangeError on a string that is not a decimal (the
 * database never sends one; a silent "—" would hide a bug in a price).
 */
export function formatMoney(
  ccy: string,
  amount: DecimalString | null | undefined,
  { decimals = 'doc' }: { decimals?: MoneyDecimals } = {}
): FormattedMoney {
  if (isEmpty(amount)) return { text: EMPTY, amount: EMPTY, negative: false, empty: true }
  const dp = decimals === 'list' && isWhole(amount) ? 0 : 2
  const { negative, digits } = formatDecimal(amount, dp)
  const shown = negative ? `(${digits})` : digits
  return { text: `${ccy} ${shown}`, amount: shown, negative, empty: false }
}

/**
 * The decimals a list of amounts uses: 'list' (no decimals) only when every value is whole, so one column
 * never mixes "12,395" with "157,587.50".
 */
export function listDecimals(
  amounts: readonly (DecimalString | null | undefined)[]
): MoneyDecimals {
  return amounts.every((a) => isEmpty(a) || isWhole(a)) ? 'list' : 'doc'
}

const RATE = /^\+?(\d+)(?:\.(\d+))?$/

/**
 * A rate rounded half-up to `dp` places as a plain string. FX is numeric(20,10), more places than the
 * money helper accepts, so this rounds on the digits themselves (BigInt), never through a float.
 */
function roundRate(rate: DecimalString, dp: number): string {
  const m = RATE.exec(rate.trim())
  if (!m) throw new RangeError(`not a rate: "${rate}"`)
  const [, whole = '0', frac = ''] = m
  const scaled = BigInt(whole + frac.padEnd(dp + 1, '0').slice(0, dp + 1))
  const rounded = (scaled + 5n) / 10n
  const s = rounded.toString().padStart(dp + 1, '0')
  return `${s.slice(0, -dp)}.${s.slice(-dp)}`
}

/**
 * "EUR 1 = AED 3.9789 · locked 2 Oct"; without `lockedOn`, "EUR 1 = AED 3.9789". The rate is AED per
 * unit of `ccy`, shown at 4 dp.
 */
export function formatFx(
  ccy: string,
  rate: DecimalString,
  lockedOn?: Date | string,
  { now }: { now?: Date } = {}
): string {
  const pair = `${ccy} 1 = AED ${roundRate(rate, 4)}`
  if (lockedOn === undefined) return pair
  return `${pair} · locked ${formatDate(lockedOn, now ? { now } : {})}`
}

// ---------------------------------------------------------------------------------------------------
// Quantities

/** "24", "1,200", "2.5", "24 ea": grouped, trailing zeros dropped. Empty → "—". */
export function formatQty(qty: DecimalString | null | undefined, uom?: string): string {
  if (isEmpty(qty)) return EMPTY
  const plain = toDecimalString(parseDecimal(qty))
  const [whole = '0', frac = ''] = plain.replace(/^-/, '').split('.')
  const trimmed = frac.replace(/0+$/, '')
  const sign = plain.startsWith('-') ? '-' : ''
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const n = `${sign}${grouped}${trimmed ? `.${trimmed}` : ''}`
  return uom ? `${n} ${uom}` : n
}

// ---------------------------------------------------------------------------------------------------
// Dates and times (Asia/Dubai)

// Month names are ours: en-GB's short September is "Sep" in some ICU builds and "Sept" in others, so
// server and browser would disagree.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: OPS_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function toDate(value: Date | string): Date {
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) throw new RangeError(`not a date: "${String(value)}"`)
  return d
}

/** The wall-clock fields of `d` in Asia/Dubai. */
function dubai(d: Date): {
  year: number
  month: number
  day: number
  hour: string
  minute: string
} {
  const p = Object.fromEntries(PARTS.formatToParts(d).map((x) => [x.type, x.value]))
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: p.hour ?? '00',
    minute: p.minute ?? '00',
  }
}

/**
 * "14 Sep" in the current year, "30 Sep 2026" otherwise (both years read in Asia/Dubai). `year: 'always'`
 * prints the year regardless, for documents.
 */
export function formatDate(
  value: Date | string,
  { now = new Date(), year = 'auto' }: { now?: Date; year?: 'auto' | 'always' } = {}
): string {
  const d = dubai(toDate(value))
  const short = `${d.day} ${MONTHS[d.month - 1]}`
  return year === 'auto' && d.year === dubai(now).year ? short : `${short} ${d.year}`
}

/** 24-hour "09:12" in Asia/Dubai. */
export function formatTime(value: Date | string): string {
  const d = dubai(toDate(value))
  return `${d.hour}:${d.minute}`
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Elapsed time for activity rows: "now", "12 min", "3 h", "2 d"; a week or more falls back to formatDate.
 * A time in the future reads "in 12 min".
 */
export function formatRelative(
  value: Date | string,
  { now = new Date() }: { now?: Date } = {}
): string {
  const d = toDate(value)
  const diff = now.getTime() - d.getTime()
  const abs = Math.abs(diff)
  let text: string
  if (abs < MINUTE) return 'now'
  if (abs < HOUR) text = `${Math.floor(abs / MINUTE)} min`
  else if (abs < DAY) text = `${Math.floor(abs / HOUR)} h`
  else if (abs < 7 * DAY) text = `${Math.floor(abs / DAY)} d`
  else return formatDate(d, { now })
  return diff < 0 ? `in ${text}` : text
}

// ---------------------------------------------------------------------------------------------------
// Quotation numbers in URLs

const QUOTATION = /^INDUS\/(Q\d+(?:-R\d+)?)$/
const QUOTATION_SLUG = /^Q\d+(?:-R\d+)?$/

/** "INDUS/Q10001-R2" → "Q10001-R2" (the slash cannot sit in a path segment). Throws on any other shape. */
export function quotationSlug(quotationNo: string): string {
  const m = QUOTATION.exec(quotationNo)
  if (!m) throw new RangeError(`not a quotation number: "${quotationNo}"`)
  return m[1]!
}

/** "Q10001-R2" → "INDUS/Q10001-R2"; null for anything else (a route param is untrusted input). */
export function quotationFromSlug(slug: string): string | null {
  return QUOTATION_SLUG.test(slug) ? `INDUS/${slug}` : null
}
