import { describe, expect, it } from 'vitest'
import { ageText, familyOf, isBatchableFamily, REVIEW_FAMILIES } from './families'

describe('review families', () => {
  it('maps action keys to the board chips, the rest to Mail', () => {
    expect(familyOf('chase_suppliers')).toBe('chasers')
    expect(familyOf('send_quotation')).toBe('quotations')
    expect(familyOf('ask_open_copy')).toBe('supplier-asks')
    expect(familyOf('manual_reply')).toBe('mail')
    expect(REVIEW_FAMILIES).toHaveLength(8)
  })
  it('only chasers and captures batch', () => {
    expect(REVIEW_FAMILIES.filter(isBatchableFamily)).toEqual(['chasers', 'captured'])
  })
  it('ages read like the board', () => {
    const t = Date.UTC(2026, 10, 24, 10, 0)
    expect(ageText(t - 12 * 60_000, t)).toBe('12 min')
    expect(ageText(t - 130 * 60_000, t)).toBe('2 h 10 min')
    expect(ageText(t - 120 * 60_000, t)).toBe('2 h')
    expect(ageText(t - 3 * 86_400_000, t)).toBe('3 d')
  })
})
