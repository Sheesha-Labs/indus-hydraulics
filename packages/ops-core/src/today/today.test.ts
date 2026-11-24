import { describe, expect, it } from 'vitest'
import { cameInSince, todayGreeting, todayState } from './index'

const dubai = (iso: string) => new Date(`${iso}+04:00`)
const WEEKENDS = { default: [0, 6], byCountry: { AE: [0, 6] } }

describe('Today', () => {
  it('greets by the Dubai clock', () => {
    expect(todayGreeting(dubai('2026-11-26T08:10:00'), 'Krishan')).toBe(
      'Good morning, Krishan · Thursday 26 Nov'
    )
    expect(todayGreeting(dubai('2026-11-26T13:10:00'), 'Krishan')).toMatch(/^Good afternoon/)
    expect(todayGreeting(dubai('2026-11-26T19:10:00'), 'Krishan')).toMatch(/^Good evening/)
  })
  it('came in since 18:00 on the previous working day', () => {
    expect(cameInSince(dubai('2026-11-26T08:00:00'), [], WEEKENDS).toISOString()).toBe(
      '2026-11-25T14:00:00.000Z'
    )
    // Monday: since Friday 18:00
    expect(cameInSince(dubai('2026-11-30T08:00:00'), [], WEEKENDS).toISOString()).toBe(
      '2026-11-27T14:00:00.000Z'
    )
    // the day after a holiday reaches back over it
    const holidays = [{ country: 'AE', date: '2026-12-02', kind: 'public_holiday' as const }]
    expect(cameInSince(dubai('2026-12-03T08:00:00'), holidays, WEEKENDS).toISOString()).toBe(
      '2026-12-01T14:00:00.000Z'
    )
  })
  it('calm, normal, on fire', () => {
    expect(todayState(0)).toBe('calm')
    expect(todayState(10)).toBe('normal')
    expect(todayState(11)).toBe('on_fire')
  })
})
