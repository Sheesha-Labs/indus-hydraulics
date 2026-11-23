import {
  isWorkingDay,
  nextWorkingDay,
  ramadanWindow,
  type CalendarDate,
  type HolidayRow,
  type WeekendTable,
} from '../calendar/working-day'
import { instantAt, minutesOf, nextDate, wallTime } from '../calendar/zoned'

/**
 * When an email may leave (S04-T06, 08-map-integrations §1.10, boards 87, 99, 100). Pure: the caller passes the
 * timing settings, the holiday rows and the weekend table (all database content).
 *
 *   client (sales@, UAE)   a UAE working day from the 08:30 release to 18:00 sends now (Ramadan days: 10:00 to
 *                          15:00); otherwise the next release (08:30, or 10:00 on a Ramadan day) on a UAE working
 *                          day. Decision, flagged for sign-off (02-map entry 87 ⚠): guardrail hours first, then
 *                          the window, so 08:30–09:00 on a working day sends now (the release has opened).
 *   supplier, forwarder    the recipient's local morning 09:00–11:00 on a local working day (country weekend
 *                          table + that country's holiday rows), else the next local 09:00 on a working day.
 *   chaser                 as supplier; never on a local Friday after 15:00 or at the weekend; after a detected
 *                          out-of-office, from the first working day after the return date.
 *   internal               now (quiet hours belong to the notify dispatcher, S30).
 */
export type Audience = 'client' | 'supplier' | 'forwarder' | 'internal'

export type SendTimingRules = {
  clientHours: { start: string; end: string }
  window: { after: string; releaseAt: string }
  ramadanHours: { start: string; end: string }
  supplierMorning: { start: string; end: string }
  chaserNoFridayAfter: string
}

export type SlotReason =
  | 'now'
  | 'client_release'
  | 'client_ramadan_release'
  | 'supplier_morning'
  | 'chaser_friday'
  | 'out_of_office'
  | 'internal'

export type SlotInput = {
  now: Date
  kind: string
  audience: Audience
  recipient: { country: string; tz: string; outOfOfficeUntil?: string | null }
  rules: SendTimingRules
  holidays: readonly HolidayRow[]
  weekends: WeekendTable
}

export type Slot = { at: Date; reason: SlotReason; local: string }

export const INDUS_COUNTRY = 'AE'
export const INDUS_TZ = 'Asia/Dubai'

function fmt(at: Date, tz: string): string {
  const w = wallTime(at, tz)
  return `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')} ${String(w.hour).padStart(2, '0')}:${String(w.minute).padStart(2, '0')} ${tz}`
}

function today(now: Date, tz: string): CalendarDate {
  const w = wallTime(now, tz)
  return { year: w.year, month: w.month, day: w.day }
}

function at(date: CalendarDate, hhmm: string, tz: string): Date {
  const m = minutesOf(hhmm)
  return instantAt(date, Math.floor(m / 60), m % 60, tz)
}

function parseDate(key: string): CalendarDate {
  const [y, m, d] = key.split('-').map(Number)
  return { year: y ?? 1970, month: m ?? 1, day: d ?? 1 }
}

function clientSlot(input: SlotInput): Slot {
  const { now, rules, holidays, weekends } = input
  const tz = INDUS_TZ
  const day = today(now, tz)
  const w = wallTime(now, tz)
  const minute = w.hour * 60 + w.minute
  const windowFor = (d: CalendarDate) => {
    const ramadan = ramadanWindow(d, INDUS_COUNTRY, holidays)
    return ramadan
      ? { release: ramadan.start, end: ramadan.end, reason: 'client_ramadan_release' as const }
      : {
          release: rules.window.releaseAt,
          end: rules.clientHours.end,
          reason: 'client_release' as const,
        }
  }
  if (isWorkingDay(day, INDUS_COUNTRY, holidays, weekends)) {
    const win = windowFor(day)
    if (minute >= minutesOf(win.release) && minute < minutesOf(win.end))
      return { at: now, reason: 'now', local: fmt(now, tz) }
    if (minute < minutesOf(win.release)) {
      const slot = at(day, win.release, tz)
      return { at: slot, reason: win.reason, local: fmt(slot, tz) }
    }
  }
  const next = nextWorkingDay(nextDate(day), INDUS_COUNTRY, holidays, weekends)
  const win = windowFor(next)
  const slot = at(next, win.release, tz)
  return { at: slot, reason: win.reason, local: fmt(slot, tz) }
}

function supplierSlot(input: SlotInput, chaser: boolean): Slot {
  const { now, rules, holidays, weekends, recipient } = input
  const tz = recipient.tz
  const country = recipient.country
  const start = minutesOf(rules.supplierMorning.start)
  const end = minutesOf(rules.supplierMorning.end)
  let day = today(now, tz)
  const w = wallTime(now, tz)
  const minute = w.hour * 60 + w.minute
  let reason: SlotReason = 'supplier_morning'

  if (chaser && recipient.outOfOfficeUntil) {
    const back = parseDate(recipient.outOfOfficeUntil)
    const first = nextWorkingDay(nextDate(back), country, holidays, weekends)
    if (
      first.year * 10000 + first.month * 100 + first.day >
      day.year * 10000 + day.month * 100 + day.day
    ) {
      const slot = at(first, rules.supplierMorning.start, tz)
      return { at: slot, reason: 'out_of_office', local: fmt(slot, tz) }
    }
  }
  if (chaser && w.weekday === 5 && minute >= minutesOf(rules.chaserNoFridayAfter)) {
    day = nextWorkingDay(nextDate(day), country, holidays, weekends)
    const slot = at(day, rules.supplierMorning.start, tz)
    return { at: slot, reason: 'chaser_friday', local: fmt(slot, tz) }
  }
  if (isWorkingDay(day, country, holidays, weekends)) {
    if (minute >= start && minute < end) return { at: now, reason: 'now', local: fmt(now, tz) }
    if (minute < start) {
      const slot = at(day, rules.supplierMorning.start, tz)
      return { at: slot, reason, local: fmt(slot, tz) }
    }
  }
  day = nextWorkingDay(nextDate(day), country, holidays, weekends)
  reason = 'supplier_morning'
  const slot = at(day, rules.supplierMorning.start, tz)
  return { at: slot, reason, local: fmt(slot, tz) }
}

export function nextSendSlot(input: SlotInput): Slot {
  if (input.audience === 'internal')
    return { at: input.now, reason: 'internal', local: fmt(input.now, INDUS_TZ) }
  if (input.audience === 'client') return clientSlot(input)
  return supplierSlot(input, input.kind === 'supplier_chaser')
}

/** Which audience an outbound kind writes to (the sending rule's mailbox role decides client vs supplier). */
export function audienceForKind(kind: string): Audience {
  if (kind.startsWith('forwarder_')) return 'forwarder'
  if (kind.startsWith('supplier_')) return 'supplier'
  if (
    ['morning_brief', 'evening_summary', 'month_pack'].includes(kind) ||
    kind.startsWith('visitor_') ||
    kind.startsWith('auth_')
  ) {
    return 'internal'
  }
  return 'client'
}

/** Best-known IANA zone for a country, for suppliers without one on file (an override lives on the supplier). */
export const COUNTRY_TZ: Readonly<Record<string, string>> = {
  AE: 'Asia/Dubai',
  SA: 'Asia/Riyadh',
  OM: 'Asia/Muscat',
  KW: 'Asia/Kuwait',
  QA: 'Asia/Qatar',
  BH: 'Asia/Bahrain',
  EG: 'Africa/Cairo',
  IR: 'Asia/Tehran',
  IN: 'Asia/Kolkata',
  PK: 'Asia/Karachi',
  CN: 'Asia/Shanghai',
  HK: 'Asia/Hong_Kong',
  TW: 'Asia/Taipei',
  JP: 'Asia/Tokyo',
  KR: 'Asia/Seoul',
  SG: 'Asia/Singapore',
  MY: 'Asia/Kuala_Lumpur',
  TH: 'Asia/Bangkok',
  VN: 'Asia/Ho_Chi_Minh',
  ID: 'Asia/Jakarta',
  TR: 'Europe/Istanbul',
  IT: 'Europe/Rome',
  DE: 'Europe/Berlin',
  FR: 'Europe/Paris',
  ES: 'Europe/Madrid',
  NL: 'Europe/Amsterdam',
  BE: 'Europe/Brussels',
  CH: 'Europe/Zurich',
  AT: 'Europe/Vienna',
  SE: 'Europe/Stockholm',
  NO: 'Europe/Oslo',
  DK: 'Europe/Copenhagen',
  FI: 'Europe/Helsinki',
  PL: 'Europe/Warsaw',
  CZ: 'Europe/Prague',
  GB: 'Europe/London',
  IE: 'Europe/Dublin',
  PT: 'Europe/Lisbon',
  GR: 'Europe/Athens',
  RU: 'Europe/Moscow',
  US: 'America/Chicago',
  CA: 'America/Toronto',
  MX: 'America/Mexico_City',
  BR: 'America/Sao_Paulo',
  AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland',
  ZA: 'Africa/Johannesburg',
  NG: 'Africa/Lagos',
  KE: 'Africa/Nairobi',
}

export function tzForCountry(country: string | null | undefined): string {
  return (country && COUNTRY_TZ[country.toUpperCase()]) || INDUS_TZ
}
