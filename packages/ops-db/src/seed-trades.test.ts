import { describe, expect, it } from 'vitest'
import { TRADE_TAXONOMY } from './seed'

describe('trade taxonomy seed (S10-T06)', () => {
  it('is structure only: eleven trades, unique names, no brand words', () => {
    expect(TRADE_TAXONOMY).toHaveLength(11)
    const names = TRADE_TAXONOMY.flatMap(([n, c]) => [n, ...c])
    expect(new Set(names).size).toBe(names.length)
    for (const n of names) expect(n).toMatch(/^[A-Z][a-z ,]+$/)
  })
})
