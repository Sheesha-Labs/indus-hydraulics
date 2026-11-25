import { describe, expect, it } from 'vitest'
import { descriptionSimilarity, findDuplicates } from './similarity'

describe('descriptionSimilarity', () => {
  it('word overlap, case-insensitive', () => {
    expect(
      descriptionSimilarity('Hydraulic hose 1/2" 2SN, 3 m', 'hydraulic hose 1/2" 2sn 3 m')
    ).toBe(1)
    expect(descriptionSimilarity('a b', 'c d')).toBe(0)
    expect(descriptionSimilarity('', 'x')).toBe(0)
  })
})

describe('findDuplicates', () => {
  it('same part and description; a different part is not a duplicate', () => {
    const d = findDuplicates([
      { id: '1', partNoNorm: 'HH082SN3000', description: 'Hydraulic hose 1/2" 2SN, 3 m' },
      { id: '2', partNoNorm: 'HH124SH2000', description: 'Hydraulic hose 3/4" 4SH, 2 m' },
      { id: '9', partNoNorm: 'HH082SN3000', description: 'Hydraulic hose 1/2" 2SN 3 m' },
      { id: '10', partNoNorm: null, description: 'Hose clamp' },
      { id: '11', partNoNorm: null, description: 'hose clamp' },
      { id: '12', partNoNorm: 'HH082SN3000', description: 'Something else entirely' },
    ])
    expect([...d.entries()]).toEqual([
      ['9', '1'],
      ['11', '10'],
    ])
  })
})
