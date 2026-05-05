import { describe, expect, test } from 'vitest'

import { extractExactSkuQuery } from './exact-sku'

describe('extractExactSkuQuery — accepts SKU-like tokens', () => {
  test('typical hyphenated SKU → uppercased', () => {
    expect(extractExactSkuQuery('IH-AP71-D-R-V')).toBe('IH-AP71-D-R-V')
    expect(extractExactSkuQuery('ih-ap71-d-r-v')).toBe('IH-AP71-D-R-V')
  })

  test('alphanumeric without hyphen but with digits → accepted', () => {
    expect(extractExactSkuQuery('A10VSO71')).toBe('A10VSO71')
    expect(extractExactSkuQuery('a10vso71')).toBe('A10VSO71')
  })

  test('hyphenated identifier without digits → accepted (e.g. PUMP-X)', () => {
    expect(extractExactSkuQuery('PUMP-X')).toBe('PUMP-X')
  })

  test('preserves case-folded uppercase', () => {
    expect(extractExactSkuQuery('Mixed-Case-SKU-1')).toBe('MIXED-CASE-SKU-1')
  })

  test('strips leading/trailing whitespace', () => {
    expect(extractExactSkuQuery('  IH-AP71  ')).toBe('IH-AP71')
  })
})

describe('extractExactSkuQuery — rejects descriptive queries', () => {
  test('multi-word query → null', () => {
    expect(extractExactSkuQuery('axial piston pump')).toBeNull()
    expect(extractExactSkuQuery('A10VSO 71cc')).toBeNull() // contains a space
  })

  test('pure-letter single word → null (descriptive)', () => {
    expect(extractExactSkuQuery('pump')).toBeNull()
    expect(extractExactSkuQuery('valve')).toBeNull()
    expect(extractExactSkuQuery('hose')).toBeNull()
  })

  test('too short → null', () => {
    expect(extractExactSkuQuery('')).toBeNull()
    expect(extractExactSkuQuery('a')).toBeNull()
    expect(extractExactSkuQuery('AB')).toBeNull()
  })

  test('too long → null (defensive against pasted garbage)', () => {
    const long = 'A'.repeat(65) + '1' // 66 chars with a digit — should still reject
    expect(extractExactSkuQuery(long)).toBeNull()
  })

  test('whitespace anywhere inside → null', () => {
    expect(extractExactSkuQuery('A10VSO 71')).toBeNull()
    expect(extractExactSkuQuery('A10\t71')).toBeNull()
    expect(extractExactSkuQuery('A10\n71')).toBeNull()
  })
})

describe('extractExactSkuQuery — boundary cases', () => {
  test('exactly minimum length with digit → accepted', () => {
    expect(extractExactSkuQuery('A1B')).toBe('A1B')
  })

  test('exactly maximum length → accepted', () => {
    const exact = 'A'.repeat(63) + '1' // 64 chars
    expect(extractExactSkuQuery(exact)).toBe(exact.toUpperCase())
  })

  test('one over maximum → null', () => {
    const over = 'A'.repeat(64) + '1' // 65 chars
    expect(extractExactSkuQuery(over)).toBeNull()
  })

  test('digits-only is still SKU-like', () => {
    expect(extractExactSkuQuery('12345')).toBe('12345')
  })

  test('hyphens-only is too sparse to be a SKU but our heuristic accepts it (caller will 404)', () => {
    // Documented as known false-positive — the caller does an exact-SKU
    // lookup; if no row matches, the page falls through to the FTS path.
    expect(extractExactSkuQuery('---')).toBe('---')
  })
})
