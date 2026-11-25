import { describe, expect, it } from 'vitest'
import {
  lookalikeVariants,
  looksLikePartNumber,
  MAX_LOOKALIKE_VARIANTS,
  partNoNorm,
} from './normalise'

describe('partNoNorm', () => {
  it.each([
    ['6316-C3', '6316C3'],
    ['6316C3', '6316C3'],
    ['6316 c3', '6316C3'],
    ['  test/0001.a ', 'TEST0001A'],
    [null, ''],
    [undefined, ''],
  ])('%s → %s', (raw, norm) => expect(partNoNorm(raw)).toBe(norm))
})

describe('lookalikeVariants', () => {
  it('one swap at a time first', () => {
    expect(lookalikeVariants('1O')).toEqual(expect.arrayContaining(['IO', 'LO', '10']))
    expect(lookalikeVariants('1O')).not.toContain('1O')
  })
  it('bounded to eight', () => {
    expect(lookalikeVariants('OISB0158Z2').length).toBeLessThanOrEqual(MAX_LOOKALIKE_VARIANTS)
  })
  it('nothing to swap', () => {
    expect(lookalikeVariants('XYZ')).toEqual(['XY2'])
    expect(lookalikeVariants('ACDE')).toEqual([])
  })
  it('pairs once singles run out', () => {
    expect(lookalikeVariants('O5')).toEqual(['05', 'OS', '0S'])
  })
})

describe('looksLikePartNumber', () => {
  it.each([
    ['6316-C3', true],
    ['TEST-0001', true],
    ['10', false],
    ['1000', true],
    ['VALVE', false],
    ['A1', false],
    ['X'.repeat(31) + '12', false],
  ])('%s → %s', (s, ok) => expect(looksLikePartNumber(s)).toBe(ok))
})
