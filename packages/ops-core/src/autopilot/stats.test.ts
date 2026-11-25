import { describe, expect, it } from 'vitest'
import { runHistoryOf, savedText, weekLabel, weekStart, weekStats } from './stats'

const dubai = (iso: string) => new Date(`${iso}+04:00`)

describe('week window (Asia/Dubai)', () => {
  it('starts Monday 00:00 GST', () => {
    expect(weekStart(dubai('2026-11-26T10:00:00')).toISOString()).toBe('2026-11-22T20:00:00.000Z')
    expect(weekStart(dubai('2026-11-23T00:30:00')).toISOString()).toBe('2026-11-22T20:00:00.000Z')
    expect(weekStart(dubai('2026-11-29T23:00:00')).toISOString()).toBe('2026-11-22T20:00:00.000Z')
  })
  it('labels the days', () => {
    expect(weekLabel(dubai('2026-11-25T10:00:00'))).toBe('MON 23 – WED 25 NOV')
    expect(weekLabel(dubai('2026-11-23T10:00:00'))).toBe('MON 23 NOV')
    expect(weekLabel(dubai('2026-12-02T10:00:00'))).toBe('MON 30 NOV – WED 2 DEC')
  })
})

describe('weekStats', () => {
  it('counts emails read, done, decisions and the estimate', () => {
    const s = weekStats(
      [
        { actionKey: 'classify_mail', state: 'done', count: 200 },
        { actionKey: 'classify_mail', state: 'failed', count: 14 },
        { actionKey: 'extract_lines', state: 'proposed', count: 3 },
        { actionKey: 'chase_suppliers', state: 'done', count: 10 },
      ],
      [
        { toState: 'approved', count: 15 },
        { toState: 'edited_approved', count: 4 },
        { toState: 'rejected', count: 3 },
        { toState: 'undone', count: 0 },
      ],
      { classify_mail: 0.5, extract_lines: 6, chase_suppliers: 3 }
    )
    expect(s).toEqual({
      emailsRead: 214,
      actionsDone: 210,
      approved: 19,
      rejected: 3,
      undone: 0,
      minutesSaved: 148,
    })
    expect(savedText(s.minutesSaved)).toBe('≈ 2.5 h')
    expect(savedText(360)).toBe('≈ 6 h')
    expect(savedText(40)).toBe('≈ 40 min')
  })
  it('history: an approval without edits counts, an edit or reject does not', () => {
    const at = new Date()
    expect(
      runHistoryOf({ state: 'done', decidedById: 'u', editDiff: null, createdAt: at }).approved
    ).toBe(true)
    expect(
      runHistoryOf({ state: 'edited_approved', decidedById: 'u', editDiff: {}, createdAt: at })
    ).toMatchObject({ approved: false, edited: true })
    expect(
      runHistoryOf({ state: 'rejected', decidedById: 'u', editDiff: null, createdAt: at }).rejected
    ).toBe(true)
    expect(
      runHistoryOf({ state: 'proposed', decidedById: null, editDiff: null, createdAt: at }).approved
    ).toBe(false)
  })
})
