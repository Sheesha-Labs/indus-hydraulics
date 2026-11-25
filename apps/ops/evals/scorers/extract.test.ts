import { describe, expect, it } from 'vitest'
import { scoreExtract, similarity } from './extract'

describe('scoreExtract', () => {
  it('perfect read passes; Unsure where expected counts as right', () => {
    const s = scoreExtract([
      {
        id: 'a',
        expect: [
          { description: 'Ball valve 2" ANSI 300', qty: 10, partNo: 'TEST-1' },
          { description: 'O-rings same as last order', qty: null, partNo: null, unsure: true },
        ],
        predicted: [
          { description: 'Ball valve 2" ANSI 300', qty: 10, partNo: 'TEST-1', confidence: 'sure' },
          {
            description: 'O-rings, same as last order',
            qty: null,
            partNo: null,
            confidence: 'unsure',
          },
        ],
      },
    ])
    expect(s).toMatchObject({ f1: 1, qtyExactRate: 1, partExactRate: 1, passes: true, misses: [] })
    expect(s.unsureRate).toBe(0.5)
  })
  it('a wrong quantity fails the bar; an extra line and a miss lower F1', () => {
    const s = scoreExtract([
      {
        id: 'b',
        expect: [
          { description: 'Gate valve 4"', qty: 4, partNo: null },
          { description: 'Gasket 2" 300#', qty: 24, partNo: null },
        ],
        predicted: [
          { description: 'Gate valve 4"', qty: 40, partNo: null, confidence: 'likely' },
          { description: 'Totals', qty: 28, partNo: null, confidence: 'sure' },
        ],
      },
    ])
    expect(s.passes).toBe(false)
    expect(s.qtyExactRate).toBe(0)
    expect(s.misses.map((m) => m.kind).sort()).toEqual(['extra', 'missed', 'qty'])
  })
  it('a line that should be Unsure but was written is a miss', () => {
    const s = scoreExtract([
      {
        id: 'c',
        expect: [{ description: 'gauge', qty: null, partNo: null, unsure: true }],
        predicted: [{ description: 'gauge', qty: 8, partNo: null, confidence: 'sure' }],
      },
    ])
    expect(s.misses[0]!.kind).toBe('should_be_unsure')
    expect(s.f1).toBe(0)
  })
  it('similarity', () => {
    expect(similarity('Ball valve 2"', 'ball valve 2"')).toBe(1)
    expect(similarity('a b', 'c d')).toBe(0)
  })
})
