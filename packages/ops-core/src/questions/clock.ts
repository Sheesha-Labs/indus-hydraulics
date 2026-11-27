import {
  addWorkingDays,
  isWorkingDay,
  type CalendarDate,
  type HolidayRow,
  type WeekendTable,
} from '../calendar/working-day'
import { instantAt, minutesOf, wallTime } from '../calendar/zoned'

/**
 * The clock on client questions (S09-T07, board 171). Pure; one working-day calendar (Asia/Dubai, the AE weekends
 * and holidays passed in).
 *
 *   reminderDueAt      day N after the questions left (default 2), 09:00 → a reminder proposal (#8)
 *   callTaskAt         the working day after the reminder, at callTaskHour (default 10:00) → a call task on Today
 *   lastDayToSendHeld  the last day the held lines can still go to suppliers: the quote target (the client's
 *                      deadline, else our revert-by) less the supplier lead, which is that many FULL working days
 *                      between the send day and the target (lead 4, target Fri 25 Sep → send by Fri 18 Sep)
 *   fallbackAt         the working day before that, 10:00 → the fallback proposal (assume / leave out / wait)
 *
 * Without a deadline or a revert-by: fallbackAt = sent + 4 working days at 10:00, and the last day the day after.
 */
export interface QuestionClockInput {
  sentAt: Date
  deadline?: Date | null
  revertBy?: Date | null
  calendar: { holidays: readonly HolidayRow[]; weekends: WeekendTable; country?: string }
  reminderWorkingDays?: number
  callTaskHour?: string
  supplierLeadWorkingDays?: number
}

export interface QuestionClock {
  reminderDueAt: Date
  callTaskAt: Date
  lastDayToSendHeld: Date
  fallbackAt: Date
  /** What the last day is counted back from: the client's deadline, our revert-by, or neither. */
  basis: 'deadline' | 'revert_by' | 'none'
}

const TZ = 'Asia/Dubai'
const REMINDER_HOUR = '09:00'
const NO_TARGET_FALLBACK_DAYS = 4

function dayOf(instant: Date): CalendarDate {
  const w = wallTime(instant, TZ)
  return { year: w.year, month: w.month, day: w.day }
}

function prevDate(d: CalendarDate): CalendarDate {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day) - 86_400_000)
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() }
}

/** `n` working days before `date` (n ≥ 1), stepping back over weekends and holidays. */
export function subtractWorkingDays(
  date: CalendarDate,
  n: number,
  country: string,
  holidays: readonly HolidayRow[],
  weekends: WeekendTable
): CalendarDate {
  let d = date
  let left = n
  for (let i = 0; i < 800 && left > 0; i += 1) {
    d = prevDate(d)
    if (isWorkingDay(d, country, holidays, weekends)) left -= 1
  }
  return d
}

function at(date: CalendarDate, hhmm: string): Date {
  const m = minutesOf(hhmm)
  return instantAt(date, Math.floor(m / 60), m % 60, TZ)
}

export function planQuestionClock(i: QuestionClockInput): QuestionClock {
  const country = i.calendar.country ?? 'AE'
  const { holidays, weekends } = i.calendar
  const remindDays = i.reminderWorkingDays ?? 2
  const callHour = i.callTaskHour ?? '10:00'
  const lead = i.supplierLeadWorkingDays ?? 4
  const sent = dayOf(i.sentAt)

  const reminderDay = addWorkingDays(sent, remindDays, country, holidays, weekends)
  const callDay = addWorkingDays(sent, remindDays + 1, country, holidays, weekends)
  const target = i.deadline ?? i.revertBy ?? null
  const basis: QuestionClock['basis'] = i.deadline ? 'deadline' : i.revertBy ? 'revert_by' : 'none'

  let lastDay: CalendarDate
  let fallbackDay: CalendarDate
  if (target) {
    lastDay = subtractWorkingDays(dayOf(target), lead + 1, country, holidays, weekends)
    fallbackDay = subtractWorkingDays(lastDay, 1, country, holidays, weekends)
  } else {
    fallbackDay = addWorkingDays(sent, NO_TARGET_FALLBACK_DAYS, country, holidays, weekends)
    lastDay = addWorkingDays(fallbackDay, 1, country, holidays, weekends)
  }
  return {
    reminderDueAt: at(reminderDay, REMINDER_HOUR),
    callTaskAt: at(callDay, callHour),
    lastDayToSendHeld: at(lastDay, '17:00'),
    fallbackAt: at(fallbackDay, '10:00'),
    basis,
  }
}

/** "Day 2", "Day 3": the working day of the clock a date falls on, counted from the send day (day 0). */
export function questionDay(
  sentAt: Date,
  when: Date,
  calendar: { holidays: readonly HolidayRow[]; weekends: WeekendTable; country?: string }
): number {
  const country = calendar.country ?? 'AE'
  const from = dayOf(sentAt)
  const to = dayOf(when)
  let n = 0
  let d = from
  for (let i = 0; i < 400; i += 1) {
    if (d.year === to.year && d.month === to.month && d.day === to.day) return n
    d = addWorkingDays(d, 1, country, calendar.holidays, calendar.weekends)
    n += 1
    if (Date.UTC(d.year, d.month - 1, d.day) > Date.UTC(to.year, to.month - 1, to.day)) return n
  }
  return n
}
