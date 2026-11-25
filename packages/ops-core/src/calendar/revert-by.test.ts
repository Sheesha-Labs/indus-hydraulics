import { describe, expect, it } from 'vitest'
import { computeRevertBy, dayMonth, type RevertByInput } from './revert-by'
import type { HolidayRow } from './working-day'

const RULE = {
  pricingDays: 0.5,
  bufferDays: 2,
  defaultSupplierReplyDays: 2,
  defaultNoDeadlineDays: 3,
}
const SAT_SUN = { default: [6, 0], byCountry: {} }
const d = (s: string) => {
  const [year, month, day] = s.split('-').map(Number)
  return { year: year!, month: month!, day: day! }
}
const base = (over: Partial<RevertByInput>): RevertByInput => ({
  received: d('2025-09-24'),
  deadline: d('2025-09-28'),
  supplierReply: null,
  rule: RULE,
  country: 'AE',
  holidays: [],
  weekends: SAT_SUN,
  ...over,
})

describe('computeRevertBy', () => {
  it('board 93: received Wed 24 Sep, closing Sun 28 Sep → promise Fri 26 Sep with 2 days’ margin', () => {
    const r = computeRevertBy(
      base({ supplierReply: { days: 2, rfqs: 20, trades: 'valves and seals' } })
    )
    expect(dayMonth(r.revertBy)).toBe('26 Sep')
    expect(r).toMatchObject({ basis: 'deadline', warn: null, margin: 2, supplierDefault: false })
    expect(r.steps).toEqual([
      { label: 'Client closing date', value: '28 Sep' },
      {
        label: 'Typical supplier reply for valves and seals',
        value: '2 working days',
        note: '(last 20 RFQs)',
      },
      { label: 'Pricing and your approval', value: 'half a day' },
      {
        label: 'So we promise',
        value: '26 Sep',
        note: 'leaving 2 days’ margin before the client’s date',
      },
    ])
  })

  it('fewer than five RFQs: the default supplier days, said so', () => {
    const r = computeRevertBy(base({ supplierReply: { days: 1, rfqs: 3, trades: 'hoses' } }))
    expect(r).toMatchObject({ supplierDays: 2, supplierDefault: true })
    expect(r.steps[1]).toMatchObject({
      label: 'Typical supplier reply',
      note: '(default until five RFQs are on record)',
    })
  })

  it('a deadline − margin that falls on a weekend moves back to the working day before', () => {
    // Closing Mon 6 Oct 2025 − 2 = Sat 4 Oct → Fri 3 Oct.
    const r = computeRevertBy(base({ received: d('2025-09-29'), deadline: d('2025-10-06') }))
    expect(dayMonth(r.revertBy)).toBe('3 Oct')
    expect(r.margin).toBe(3)
  })

  it('a UAE holiday is not a day to promise', () => {
    const holidays: HolidayRow[] = [{ country: 'AE', date: '2025-10-03', kind: 'public_holiday' }]
    const r = computeRevertBy(
      base({ received: d('2025-09-29'), deadline: d('2025-10-06'), holidays })
    )
    expect(dayMonth(r.revertBy)).toBe('2 Oct')
  })

  it('Ramadan rows change hours, not working days', () => {
    const holidays: HolidayRow[] = [
      {
        country: 'AE',
        date: '2025-09-26',
        kind: 'ramadan',
        hoursStart: '09:00',
        hoursEnd: '14:00',
      },
    ]
    expect(dayMonth(computeRevertBy(base({ holidays })).revertBy)).toBe('26 Sep')
  })

  it('a same-week deadline the work cannot fit: the last working day before it, with a warning', () => {
    // Received Wed 24 Sep, closing Fri 26 Sep: supplier 2 + pricing ½ cannot fit before 24 Sep (26 − 2).
    const r = computeRevertBy(base({ deadline: d('2025-09-26') }))
    expect(dayMonth(r.revertBy)).toBe('25 Sep')
    expect(r.warn).toBe('deadline_too_close')
    expect(r.steps.at(-1)!.note).toBe('the client’s date is too close for the usual margin')
  })

  it('a deadline tomorrow: never earlier than the next working day', () => {
    const r = computeRevertBy(base({ deadline: d('2025-09-25') }))
    expect(dayMonth(r.revertBy)).toBe('25 Sep')
    expect(r.warn).toBe('deadline_too_close')
  })

  it('a Friday/Saturday weekend (another country’s table) is honoured', () => {
    // Closing Sun 5 Oct − 2 = Fri 3 Oct: a weekend day there → Thu 2 Oct (with Sat/Sun it stays Fri 3 Oct).
    const fs = computeRevertBy(
      base({ weekends: { default: [5, 6], byCountry: {} }, deadline: d('2025-10-05') })
    )
    expect(dayMonth(fs.revertBy)).toBe('2 Oct')
    expect(dayMonth(computeRevertBy(base({ deadline: d('2025-10-05') })).revertBy)).toBe('3 Oct')
  })

  it('no deadline: three working days after it came in', () => {
    const r = computeRevertBy(base({ deadline: null }))
    // Wed 24 Sep → Thu 25, Fri 26, Mon 29.
    expect(dayMonth(r.revertBy)).toBe('29 Sep')
    expect(r).toMatchObject({ basis: 'default', margin: null })
    expect(r.steps[0]).toEqual({ label: 'Client closing date', value: 'not stated' })
  })
})
