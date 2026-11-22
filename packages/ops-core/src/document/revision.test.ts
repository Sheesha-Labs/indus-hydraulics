import { describe, expect, it } from 'vitest'
import { documentNumber, revisionLabel, revisionNumber, revisionSuffix } from './revision'

describe('revision labels', () => {
  it.each([
    ['2', 2],
    ['R2', 2],
    ['r2', 2],
    ['-R2', 2],
    [' -r12 ', 12],
    ['', null],
    [undefined, null],
    ['R0', null],
    ['two', null],
  ])('revisionNumber(%p) = %p', (input, n) => {
    expect(revisionNumber(input)).toBe(n)
  })

  it('always renders "-R{n}", never "r{n}"', () => {
    for (const spelling of ['2', 'r2', 'R2', '-R2', '-r2'])
      expect(revisionSuffix(spelling)).toBe('-R2')
    expect(revisionSuffix(undefined)).toBe('')
  })

  it('adds the suffix to the base number once', () => {
    expect(documentNumber('INDUS/Q10001', 'r2')).toBe('INDUS/Q10001-R2')
    expect(documentNumber('INDUS/Q10001-R1', 'R2')).toBe('INDUS/Q10001-R2')
    expect(documentNumber('INDUS/Q10001-r2', '2')).toBe('INDUS/Q10001-R2')
    expect(documentNumber('INDUS/Q10001')).toBe('INDUS/Q10001')
  })

  it('labels the revision band', () => {
    expect(revisionLabel('R2')).toBe('Revision 2 — supersedes R1')
    expect(revisionLabel('1')).toBe('Revision 1')
    expect(revisionLabel(undefined)).toBe('')
  })
})
