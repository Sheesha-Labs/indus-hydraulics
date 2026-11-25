import { describe, expect, it } from 'vitest'
import { defaultGuardrails } from './catalogue.fixture'
import {
  GUARDRAIL_DEFAULTS,
  GUARDRAIL_KINDS,
  evaluateGuardrails,
  parseGuardrailParams,
  workingHoursState,
} from './guardrails'
import type { HolidayRow } from '../calendar/working-day'

const HOURS = { days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00', queueUntil: '08:30' }
const CAL = { country: 'AE', ramadanStart: '10:00', ramadanEnd: '15:00' }
/** Dubai is UTC+4: 05:00Z = 09:00 GST. */
const dubai = (iso: string) => new Date(`${iso}+04:00`)

describe('guardrail params', () => {
  it('every seeded default validates for its kind', () => {
    for (const g of GUARDRAIL_DEFAULTS) {
      expect(parseGuardrailParams(g.kind, g.params).ok, g.key).toBe(true)
    }
  })
  it('every kind has a seeded row', () => {
    expect(new Set(GUARDRAIL_DEFAULTS.map((g) => g.kind))).toEqual(new Set(GUARDRAIL_KINDS))
  })
  it('refuses bad values', () => {
    expect(parseGuardrailParams('margin_floor', { floorPct: 4, hardMinPct: 5 }).ok).toBe(false)
    expect(parseGuardrailParams('working_hours', { ...HOURS, start: '19:00' }).ok).toBe(false)
    expect(parseGuardrailParams('working_hours', { ...HOURS, queueUntil: '8:30' }).ok).toBe(false)
    expect(
      parseGuardrailParams('value_threshold', { appliesTo: 'rfq', currency: 'USD', amount: -1 }).ok
    ).toBe(false)
    expect(parseGuardrailParams('first_contact', { extra: 1 }).ok).toBe(false)
  })
})

describe('evaluateGuardrails texts', () => {
  const g = defaultGuardrails()
  it('prints what the card says', () => {
    const hits = evaluateGuardrails(
      { key: 'send_supplier_rfqs', external: true },
      {
        valueAed: 200_001,
        counterpartyIsNew: true,
        counterpartyName: 'Example Valve Co',
        minMarginPct: 9.8,
        clientOnCreditHold: true,
      },
      g
    ).map((h) => h.text)
    expect(hits).toEqual([
      'Value above AED 200,000',
      'First email to Example Valve Co',
      'Margin 9.8% is below the 12% floor',
      'Client on credit hold',
    ])
  })
  it('at the threshold exactly does not ask', () => {
    expect(evaluateGuardrails({ key: 'x', external: true }, { valueAed: 200_000 }, g)).toEqual([])
  })
  it('credit hold, hours and caps only touch sends', () => {
    const hits = evaluateGuardrails(
      { key: 'extract_lines', external: false },
      { clientOnCreditHold: true, outsideHours: 'hours', overDailyCap: true },
      g
    )
    expect(hits).toEqual([])
  })
})

describe('workingHoursState', () => {
  const holidays: HolidayRow[] = [
    { country: 'AE', date: '2026-12-02', kind: 'public_holiday' },
    { country: 'AE', date: '2027-02-10', kind: 'ramadan', hoursStart: '10:00', hoursEnd: '15:00' },
  ]
  it('inside Mon–Fri 09:00–18:00 is null', () => {
    expect(workingHoursState(dubai('2026-11-26T10:00:00'), HOURS, CAL, holidays)).toBeNull()
    expect(workingHoursState(dubai('2026-11-26T09:00:00'), HOURS, CAL, holidays)).toBeNull()
  })
  it('before 09:00, after 18:00 and at the weekend is outside hours', () => {
    expect(workingHoursState(dubai('2026-11-26T08:59:00'), HOURS, CAL, holidays)).toBe('hours')
    expect(workingHoursState(dubai('2026-11-26T18:00:00'), HOURS, CAL, holidays)).toBe('hours')
    expect(workingHoursState(dubai('2026-11-28T11:00:00'), HOURS, CAL, holidays)).toBe('hours')
  })
  it('a UAE public holiday is a holiday', () => {
    expect(workingHoursState(dubai('2026-12-02T11:00:00'), HOURS, CAL, holidays)).toBe('holiday')
    expect(workingHoursState(dubai('2026-12-02T11:00:00'), HOURS, null, holidays)).toBeNull()
  })
  it('Ramadan hours replace the day', () => {
    expect(workingHoursState(dubai('2027-02-10T11:00:00'), HOURS, CAL, holidays)).toBeNull()
    expect(workingHoursState(dubai('2027-02-10T16:00:00'), HOURS, CAL, holidays)).toBe('ramadan')
  })
})
