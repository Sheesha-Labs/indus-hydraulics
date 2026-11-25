import { describe, expect, it } from 'vitest'
import { catalogueDefs } from './catalogue.fixture'
import { EARNED_STREAK, earnedSuggestion, nextLevelUp, type RunHistory } from './earned'

const DEFS = catalogueDefs()
const def = (key: string) => DEFS.find((d) => d.key === key)!
const at = (i: number) => new Date(Date.UTC(2026, 10, 1, 0, i))
const clean = (n: number, from = 100): RunHistory[] =>
  Array.from({ length: n }, (_, i) => ({
    approved: true,
    edited: false,
    rejected: false,
    undone: false,
    at: at(from + i),
  }))

describe('earnedSuggestion', () => {
  it('proposes one level up after 25 clean approvals', () => {
    expect(earnedSuggestion(clean(EARNED_STREAK), def('chase_suppliers'), 'draft_and_ask')).toEqual(
      { toLevel: 'do_and_tell', streak: 25 }
    )
  })
  it('24 is not enough', () => {
    expect(earnedSuggestion(clean(24), def('chase_suppliers'), 'draft_and_ask')).toBeNull()
  })
  it('an edit, reject or undo resets the streak; only runs after it count', () => {
    for (const flag of ['edited', 'rejected', 'undone'] as const) {
      const old = clean(30, 0)
      const bad: RunHistory = { ...clean(1, 50)[0]!, [flag]: true }
      const after = clean(24, 60)
      expect(
        earnedSuggestion([...old, bad, ...after], def('chase_suppliers'), 'draft_and_ask')
      ).toBeNull()
      expect(
        earnedSuggestion([...old, bad, ...clean(25, 60)], def('chase_suppliers'), 'draft_and_ask')
      ).toEqual({ toLevel: 'do_and_tell', streak: 25 })
    }
  })
  it('runs that were not approved do not count but do not break the streak', () => {
    const mixed = [
      ...clean(25, 0),
      { approved: false, edited: false, rejected: false, undone: false, at: at(40) },
    ]
    expect(earnedSuggestion(mixed, def('chase_suppliers'), 'draft_and_ask')?.streak).toBe(25)
  })
  it('never for #20, #28, #32 or any money action', () => {
    for (const key of [
      'send_quotation',
      'supplier_pos',
      'supplier_payments',
      'price_quotation',
      'order_ack_proforma',
      'advance_reminders',
      'payment_reminders',
    ]) {
      expect(earnedSuggestion(clean(40), def(key), 'draft_and_ask'), key).toBeNull()
    }
  })
  it('never above the max or past the top', () => {
    expect(nextLevelUp(def('correction_email'), 'draft_and_ask')).toBeNull()
    expect(nextLevelUp(def('classify_mail'), 'do_quietly')).toBeNull()
    expect(nextLevelUp(def('extract_lines'), 'off')).toBe('suggest')
    expect(nextLevelUp(def('extract_lines'), 'never')).toBeNull()
  })
  it('locked rows never get one', () => {
    expect(nextLevelUp(def('bank_change_alert'), 'do_and_tell')).toBeNull()
    expect(nextLevelUp(def('decide_equivalent'), 'draft_and_ask')).toBeNull()
  })
})
