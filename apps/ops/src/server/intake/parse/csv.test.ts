import { describe, expect, it } from 'vitest'
import { parseCsv } from './csv'
import { fixture } from './fixtures'

describe('parseCsv', () => {
  it('sniffs semicolons and keeps every value as written', () => {
    const doc = parseCsv(fixture('semicolons.csv'))
    if (doc.kind !== 'sheet') throw new Error(doc.kind)
    expect(doc.grid.sheets[0]!.name).toBe('CSV')
    expect(doc.text).toContain('R1\tA:No\tB:Description\tC:Part no.\tD:Qty\tE:UoM')
    // A European "1.000" stays a string for the number parser to judge.
    expect(doc.text).toContain('D:1.000')
  })
  it('empty is unreadable', () => {
    expect(parseCsv(new Uint8Array()).kind).toBe('unreadable')
  })
})
