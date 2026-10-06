import { describe, expect, it } from 'vitest'
import { fixAstm, SHANK_GUIDANCE, SHELF_MERGES } from './merge-and-asme'

describe('fixAstm', () => {
  it('corrects the standards body, keeping the spacing it found', () => {
    expect(fixAstm('Blind Flange ASTM B16.5 150/300 lbs')).toBe('Blind Flange ASME B16.5 150/300 lbs')
    expect(fixAstm('per ASTM B 16.5 and ASTM B16.5')).toBe('per ASME B 16.5 and ASME B16.5')
    expect(fixAstm('ASME B16.5 already')).toBe('ASME B16.5 already')
    expect(fixAstm(null)).toBeNull()
  })

  it('leaves other ASTM standards alone', () => {
    expect(fixAstm('ASTM A105 forged body')).toBe('ASTM A105 forged body')
  })
})

describe('SHELF_MERGES', () => {
  it('never merges into a shelf that is itself being merged', () => {
    const sources = new Set(SHELF_MERGES.map((m) => m.from))
    for (const m of SHELF_MERGES) expect(sources.has(m.into)).toBe(false)
  })

  it('keeps the updated shank copy inside the 700-character field limit', () => {
    expect(SHANK_GUIDANCE.length).toBeLessThanOrEqual(700)
  })
})
