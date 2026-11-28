import { describe, expect, it } from 'vitest'
import { formatNumber, parseNumber, revisedNumber, validatePattern } from './pattern'

/** C6 Round 1 sequences with an example value, as Settings › Numbering shows them. */
const C6 = [
  ['INDUS/Q{n}', 'global', '', 26941, 'INDUS/Q26941'],
  ['INDUS/OA{n}', 'global', '', 1001, 'INDUS/OA1001'],
  ['INDUS/PI{n}', 'global', '', 1001, 'INDUS/PI1001'],
  ['INDUS/PO{n}', 'global', '', 1001, 'INDUS/PO1001'],
  ['INDUS/INV{n}', 'global', '', 1001, 'INDUS/INV1001'],
  ['INDUS/CN{n}', 'global', '', 12, 'INDUS/CN12'],
  ['INDUS/DN{n}', 'global', '', 7, 'INDUS/DN7'],
  ['INDUS/PL{n}', 'global', '', 7, 'INDUS/PL7'],
  ['ENQ-{yyyy}-{nnnn}', 'year', '2026', 412, 'ENQ-2026-0412'],
  ['IH-RFQ-{yymm}-P{nn}', 'month', '2611', 7, 'IH-RFQ-2611-P07'],
  ['SO-{enq4}', 'parent', 'ENQ-2026-0412', 0, 'SO-0412'],
  ['A-{yy}-{mm}-{dd}-{nnnn}', 'day', '26-11-28', 49, 'A-26-11-28-0049'],
  ['L-{nnnn}', 'global', '', 146, 'L-0146'],
] as const

describe('number patterns', () => {
  it.each(C6)('%s is valid, formats and reads back', (pattern, kind, scope, value, formatted) => {
    expect(validatePattern(pattern, kind)).toEqual([])
    expect(formatNumber(pattern, value, scope, kind)).toBe(formatted)
    if (pattern.includes('{n')) {
      const back = parseNumber(pattern, `Re: Quotation ${formatted} for your RFQ`)
      if (!pattern.includes('{enq4}')) expect(back).toMatchObject({ value, formatted })
    }
  })

  it('refuses unknown tokens, counterparties, two counters, lower case and scope mismatches', () => {
    expect(validatePattern('INDUS/Q{n}-{supplier}', 'global')[0]).toMatch(/counterparty/)
    expect(validatePattern('PO-{client}{n}', 'global')[0]).toMatch(/counterparty/)
    expect(validatePattern('INDUS/Q{x}', 'global')).toContain('{x} is not a token.')
    expect(validatePattern('INDUS/Q{n}{nn}', 'global')).toContain(
      'A pattern has exactly one counter: {n}, {nn}, {nnn} or {nnnn}.'
    )
    expect(validatePattern('indus/q{n}', 'global')[0]).toMatch(/capital letters/)
    expect(validatePattern('ENQ-{yyyy}-{n}', 'global')[0]).toMatch(/needs a year/)
  })

  it('pads {n} to padTo; reads numbers from file names and ignores suffixes', () => {
    expect(formatNumber('INDUS/DN{n}', 7, '', 'global', 4)).toBe('INDUS/DN0007')
    expect(parseNumber('INDUS/Q{n}', 'INDUS-Q26941-R2.pdf'.replace('-Q', '/Q'))).toMatchObject({
      value: 26941,
    })
    expect(parseNumber('INDUS/Q{n}', 'nothing here')).toBeNull()
    expect(parseNumber('ENQ-{yyyy}-{nnnn}', 'Fwd: ENQ-2026-0412 valves')).toEqual({
      value: 412,
      formatted: 'ENQ-2026-0412',
      scope: '2026',
    })
    expect(parseNumber('INDUS/OA{n}', 'XINDUS/OA12')).toBeNull()
  })

  it('revisions: R1 has no suffix; the tax invoice never revises; DN/PL shipments are -{nn}', () => {
    expect(revisedNumber('INDUS/Q26941', 1, '-R{n}')).toBe('INDUS/Q26941')
    expect(revisedNumber('INDUS/Q26941', 2, '-R{n}')).toBe('INDUS/Q26941-R2')
    expect(revisedNumber('INDUS/DN7', 2, '-{nn}')).toBe('INDUS/DN7-02')
    expect(() => revisedNumber('INDUS/INV1001', 2, null)).toThrow(/never revises/)
  })
})
