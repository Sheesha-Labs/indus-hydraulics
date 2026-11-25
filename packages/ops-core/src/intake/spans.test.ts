import { describe, expect, it } from 'vitest'
import { findQuote, normaliseForMatch, unionBoxes } from './spans'

describe('normaliseForMatch', () => {
  it('folds quotes, dashes and spaces, keeps a map to the original', () => {
    const src = 'Valve  “DN50” – PN40'
    const n = normaliseForMatch(src)
    expect(n.text).toBe('valve "dn50" - pn40')
    expect(src[n.map[n.text.indexOf('dn50')]!]).toBe('D')
  })
  it('NFKC: full-width digits and ligatures', () => {
    expect(normaliseForMatch('１０ pcs ﬁtting').text).toBe('10 pcs fitting')
  })
})

describe('findQuote', () => {
  const body = 'Dear team,\nPlease quote 12 nos of\nball valve 2" ANSI 300 — delivery by 28 Sep.\n'
  const cases: Array<[string, string, 'exact' | 'fuzzy' | null]> = [
    ['plain exact', '12 nos of ball valve', 'exact'],
    ['line break inside the quote', 'nos of ball valve 2"', 'exact'],
    ['smart quotes in the source, straight in the quote', 'ANSI 300 - delivery', 'exact'],
    ['case and spacing', 'PLEASE   QUOTE 12', 'exact'],
    ['one typo is fuzzy', 'delivery by 28 Sept.', 'fuzzy'],
    ['a near miss fails', 'delivery by 30 Oct', null],
    ['too short', 'x', null],
  ]
  it.each(cases)('%s', (_n, quote, method) => {
    const hit = findQuote(body, quote)
    if (method === null) expect(hit).toBeNull()
    else {
      expect(hit?.method).toBe(method)
      expect(body.slice(hit!.start, hit!.end).length).toBeGreaterThan(0)
    }
  })
  it('offsets point into the original text', () => {
    const hit = findQuote(body, 'ball valve 2"')!
    expect(body.slice(hit.start, hit.end)).toBe('ball valve 2"')
  })
})

describe('unionBoxes', () => {
  it('none is null; several give their hull', () => {
    expect(unionBoxes([])).toBeNull()
    expect(
      unionBoxes([
        { x: 10, y: 20, w: 5, h: 5 },
        { x: 30, y: 10, w: 10, h: 2 },
      ])
    ).toEqual({ x: 10, y: 10, w: 30, h: 15 })
  })
})
