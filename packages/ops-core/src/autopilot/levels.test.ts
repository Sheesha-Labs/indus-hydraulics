import { describe, expect, it } from 'vitest'
import { AUTOPILOT_LEVELS } from '../state/labels'
import {
  AUTONOMY_ORDER,
  FIXED_RULES,
  LOCKED_LEVELS,
  MAX_LEVELS,
  autonomyRank,
  compareLevels,
  fixedRule,
  isAbove,
  lowerOf,
} from './levels'

describe('autonomy order', () => {
  it('is the stored vocabulary without never, least autonomous first', () => {
    expect(AUTONOMY_ORDER).toEqual(['off', 'suggest', 'draft_and_ask', 'do_and_tell', 'do_quietly'])
    expect(AUTOPILOT_LEVELS.filter((l) => l !== 'never')).toEqual([...AUTONOMY_ORDER])
  })

  it('ranks the ordered levels 0–4 and never not at all', () => {
    expect(AUTONOMY_ORDER.map(autonomyRank)).toEqual([0, 1, 2, 3, 4])
    expect(autonomyRank('never')).toBeNull()
  })

  it('compares levels, never below everything', () => {
    expect(compareLevels('suggest', 'do_and_tell')).toBeLessThan(0)
    expect(compareLevels('do_quietly', 'draft_and_ask')).toBeGreaterThan(0)
    expect(compareLevels('draft_and_ask', 'draft_and_ask')).toBe(0)
    expect(compareLevels('never', 'off')).toBeLessThan(0)
    expect(isAbove('do_and_tell', 'draft_and_ask')).toBe(true)
    expect(isAbove('draft_and_ask', 'draft_and_ask')).toBe(false)
    expect(lowerOf('do_quietly', 'suggest')).toBe('suggest')
  })
})

describe('fixed rules', () => {
  it('are #20 and #28 Draft and ask and #32 Never', () => {
    expect(FIXED_RULES).toEqual({
      send_quotation: 'draft_and_ask',
      supplier_pos: 'draft_and_ask',
      supplier_payments: 'never',
    })
    expect(fixedRule('send_quotation')).toBe('draft_and_ask')
    expect(fixedRule('chase_suppliers')).toBeNull()
  })

  it('are all locked rows, and no row is both locked and capped', () => {
    for (const [key, level] of Object.entries(FIXED_RULES)) {
      expect((LOCKED_LEVELS as Record<string, string>)[key]).toBe(level)
    }
    for (const key of Object.keys(MAX_LEVELS)) expect(Object.hasOwn(LOCKED_LEVELS, key)).toBe(false)
  })

  it('only #32 is Never', () => {
    expect(Object.entries(LOCKED_LEVELS).filter(([, l]) => l === 'never')).toEqual([
      ['supplier_payments', 'never'],
    ])
  })
})
