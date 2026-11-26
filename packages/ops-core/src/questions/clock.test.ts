import { describe, expect, it } from 'vitest'
import type { HolidayRow, WeekendTable } from '../calendar/working-day'
import { planQuestionClock, questionDay, subtractWorkingDays } from './clock'

const weekends: WeekendTable = { default: [6, 0], byCountry: {} }
const none: HolidayRow[] = []
const dubai = (iso: string) => new Date(`${iso}+04:00`)
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "Wed 16 Sep, 09:00" in Dubai (fixed UTC+4), independent of the runtime's ICU wording. */
const local = (d: Date) => {
  const t = new Date(d.getTime() + 4 * 3_600_000)
  const hh = String(t.getUTCHours()).padStart(2, '0')
  const mm = String(t.getUTCMinutes()).padStart(2, '0')
  return `${DAYS[t.getUTCDay()]} ${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]}, ${hh}:${mm}`
}

describe('planQuestionClock (board 171)', () => {
  it('the board fixture: sent Mon 14 Sep 11:20, quote by Fri 25 Sep → 16, 17, 17 and 18 Sep', () => {
    const c = planQuestionClock({
      sentAt: dubai('2026-09-14T11:20:00'),
      revertBy: dubai('2026-09-25T18:00:00'),
      calendar: { holidays: none, weekends },
    })
    expect(local(c.reminderDueAt)).toBe('Wed 16 Sep, 09:00')
    expect(local(c.callTaskAt)).toBe('Thu 17 Sep, 10:00')
    expect(local(c.fallbackAt)).toBe('Thu 17 Sep, 10:00')
    expect(local(c.lastDayToSendHeld)).toBe('Fri 18 Sep, 17:00')
    expect(c.basis).toBe('revert_by')
  })

  it('the client deadline wins over the revert-by', () => {
    const c = planQuestionClock({
      sentAt: dubai('2026-09-14T11:20:00'),
      deadline: dubai('2026-09-30T12:00:00'),
      revertBy: dubai('2026-09-25T18:00:00'),
      calendar: { holidays: none, weekends },
    })
    expect(c.basis).toBe('deadline')
    // Wed 30 Sep less 5 working days → Wed 23 Sep; the fallback the day before.
    expect(local(c.lastDayToSendHeld)).toBe('Wed 23 Sep, 17:00')
    expect(local(c.fallbackAt)).toBe('Tue 22 Sep, 10:00')
  })

  it('weekends and holidays are skipped both ways', () => {
    const holidays: HolidayRow[] = [
      { country: 'AE', date: '2026-09-16', kind: 'public_holiday' },
      { country: 'AE', date: '2026-09-17', kind: 'ramadan' },
    ]
    const c = planQuestionClock({
      sentAt: dubai('2026-09-14T11:20:00'),
      revertBy: dubai('2026-09-25T18:00:00'),
      calendar: { holidays, weekends },
    })
    // A holiday on day 2 moves the reminder to Thu; a Ramadan day is still a working day.
    expect(local(c.reminderDueAt)).toBe('Thu 17 Sep, 09:00')
    expect(local(c.callTaskAt)).toBe('Fri 18 Sep, 10:00')
    // Counting back from Fri 25 Sep over the Wed holiday: 24, 23, 22, 21, 18 → Fri 18; fallback Thu 17.
    expect(local(c.lastDayToSendHeld)).toBe('Fri 18 Sep, 17:00')
    expect(local(c.fallbackAt)).toBe('Thu 17 Sep, 10:00')
    // Sent on a Friday: day 2 is Tuesday.
    const fri = planQuestionClock({
      sentAt: dubai('2026-09-18T16:00:00'),
      calendar: { holidays: none, weekends },
    })
    expect(local(fri.reminderDueAt)).toBe('Tue 22 Sep, 09:00')
  })

  it('no deadline and no revert-by: fallback on day 4, last day the day after', () => {
    const c = planQuestionClock({
      sentAt: dubai('2026-09-14T11:20:00'),
      calendar: { holidays: none, weekends },
      reminderWorkingDays: 3,
      callTaskHour: '11:30',
    })
    expect(c.basis).toBe('none')
    expect(local(c.reminderDueAt)).toBe('Thu 17 Sep, 09:00')
    expect(local(c.callTaskAt)).toBe('Fri 18 Sep, 11:30')
    expect(local(c.fallbackAt)).toBe('Fri 18 Sep, 10:00')
    expect(local(c.lastDayToSendHeld)).toBe('Mon 21 Sep, 17:00')
  })

  it('subtractWorkingDays and questionDay', () => {
    expect(subtractWorkingDays({ year: 2026, month: 9, day: 21 }, 1, 'AE', none, weekends)).toEqual(
      {
        year: 2026,
        month: 9,
        day: 18,
      }
    )
    const sent = dubai('2026-09-14T11:20:00')
    expect(questionDay(sent, dubai('2026-09-14T15:00:00'), { holidays: none, weekends })).toBe(0)
    expect(questionDay(sent, dubai('2026-09-16T09:00:00'), { holidays: none, weekends })).toBe(2)
    expect(questionDay(sent, dubai('2026-09-21T09:00:00'), { holidays: none, weekends })).toBe(5)
  })
})
