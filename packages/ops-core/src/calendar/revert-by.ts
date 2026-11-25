import {
  addWorkingDays,
  isWorkingDay,
  nextWorkingDay,
  type CalendarDate,
  type HolidayRow,
  type WeekendTable,
} from './working-day'
import { dateKey, nextDate } from './zoned'

/**
 * The "revert by" date in a client acknowledgement (S08-T07, board 93 "Why 26 Sep"). With a client deadline we
 * promise the deadline less a margin (bufferDays, calendar days, moved back onto a working day), provided the
 * work fits before it: supplier replies (the median for the lines' trades, or the default while there are fewer
 * than five RFQs) and pricing with your approval, counted in working days from the day the enquiry came in. When
 * it does not fit, we promise the last working day before the deadline and say so (warn). Without a deadline:
 * received + defaultNoDeadlineDays working days. Pure; the calendar (weekends, holidays) is passed in.
 */
export interface RevertByRule {
  pricingDays: number
  bufferDays: number
  defaultSupplierReplyDays: number
  defaultNoDeadlineDays: number
}

export interface RevertByInput {
  received: CalendarDate
  deadline: CalendarDate | null
  /** Median working days suppliers took for these trades, and how many RFQs it stands on. */
  supplierReply: { days: number; rfqs: number; trades: string } | null
  rule: RevertByRule
  country: string
  holidays: readonly HolidayRow[]
  weekends: WeekendTable
}

export interface RevertByStep {
  label: string
  value: string
  note?: string
}

export interface RevertBy {
  revertBy: CalendarDate
  basis: 'deadline' | 'default'
  warn: 'deadline_too_close' | null
  /** The supplier days used, and whether they are the default. */
  supplierDays: number
  supplierDefault: boolean
  /** Days between the promise and the client's date (calendar days). */
  margin: number | null
  steps: RevertByStep[]
}

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const dayMonth = (d: CalendarDate) => `${d.day} ${MONTH[d.month - 1]}`

function minusDays(d: CalendarDate, n: number): CalendarDate {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day - n))
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() }
}

function daysBetween(a: CalendarDate, b: CalendarDate): number {
  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000
  )
}

/** The working day on or before `d`. */
function previousWorkingDay(
  d: CalendarDate,
  country: string,
  holidays: readonly HolidayRow[],
  weekends: WeekendTable
): CalendarDate {
  let x = d
  for (let i = 0; i < 370 && !isWorkingDay(x, country, holidays, weekends); i += 1)
    x = minusDays(x, 1)
  return x
}

const dayWord = (n: number) => (n === 0.5 ? 'half a day' : `${n} working day${n === 1 ? '' : 's'}`)

export function computeRevertBy(i: RevertByInput): RevertBy {
  const { country, holidays, weekends, rule } = i
  const enough = !!i.supplierReply && i.supplierReply.rfqs >= 5
  const supplierDays = enough ? i.supplierReply!.days : rule.defaultSupplierReplyDays
  const supplierStep: RevertByStep = {
    label: enough
      ? `Typical supplier reply for ${i.supplierReply!.trades}`
      : 'Typical supplier reply',
    value: dayWord(supplierDays),
    note: enough
      ? `(last ${i.supplierReply!.rfqs} RFQs)`
      : '(default until five RFQs are on record)',
  }
  const pricingStep: RevertByStep = {
    label: 'Pricing and your approval',
    value: dayWord(rule.pricingDays),
  }
  if (!i.deadline) {
    const revertBy = addWorkingDays(
      nextDate(i.received),
      rule.defaultNoDeadlineDays - 1,
      country,
      holidays,
      weekends
    )
    return {
      revertBy,
      basis: 'default',
      warn: null,
      supplierDays,
      supplierDefault: !enough,
      margin: null,
      steps: [
        { label: 'Client closing date', value: 'not stated' },
        supplierStep,
        pricingStep,
        {
          label: 'So we promise',
          value: dayMonth(revertBy),
          note: `${rule.defaultNoDeadlineDays} working days after it came in`,
        },
      ],
    }
  }
  // The earliest we can revert: supplier replies, then pricing, from the day after receipt. Half a day of pricing
  // fits in the afternoon of the last supplier day; anything longer takes another working day.
  const workDays = Math.max(1, Math.ceil(supplierDays + rule.pricingDays - 0.5))
  const earliest = addWorkingDays(nextDate(i.received), workDays - 1, country, holidays, weekends)
  const floor = nextWorkingDay(nextDate(i.received), country, holidays, weekends)
  const latest = previousWorkingDay(
    minusDays(i.deadline, rule.bufferDays),
    country,
    holidays,
    weekends
  )
  const dayBefore = previousWorkingDay(minusDays(i.deadline, 1), country, holidays, weekends)
  let revertBy = latest
  let warn: RevertBy['warn'] = null
  if (dateKey(latest) < dateKey(earliest) || dateKey(latest) < dateKey(floor)) {
    revertBy = dateKey(dayBefore) < dateKey(floor) ? floor : dayBefore
    warn = 'deadline_too_close'
  }
  const margin = daysBetween(revertBy, i.deadline)
  return {
    revertBy,
    basis: 'deadline',
    warn,
    supplierDays,
    supplierDefault: !enough,
    margin,
    steps: [
      { label: 'Client closing date', value: dayMonth(i.deadline) },
      supplierStep,
      pricingStep,
      {
        label: 'So we promise',
        value: dayMonth(revertBy),
        note: warn
          ? 'the client’s date is too close for the usual margin'
          : `leaving ${margin} day${margin === 1 ? '' : 's'}’ margin before the client’s date`,
      },
    ],
  }
}
