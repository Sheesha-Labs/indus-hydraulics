import { describe, expect, it } from 'vitest'
import { computeLineConfidence, type LineConfidenceInput } from './confidence'

const SURE: LineConfidenceInput = {
  evidence: { description: 'resolved', qty: 'resolved', uom: 'resolved', partNumber: 'resolved' },
  qty: { value: 10, problem: null },
  qtyConflict: false,
  uomMethod: 'alias',
  partNumber: 'TEST-0001',
  partMatch: 'exact',
  lookalikeAmbiguous: false,
  doubtFields: [],
  alternativeMake: false,
}
const run = (over: Partial<LineConfidenceInput>) => computeLineConfidence({ ...SURE, ...over })

describe('computeLineConfidence', () => {
  it('sure when everything holds (exact and pattern part matches)', () => {
    expect(run({})).toEqual({ confidence: 'sure', reasons: [] })
    expect(run({ partMatch: 'pattern', uomMethod: 'exact' }).confidence).toBe('sure')
    for (const m of ['alias', 'catalogue', 'cross_ref', 'history'] as const)
      expect(run({ partMatch: m }).confidence).toBe('sure')
  })

  it.each<[string, Partial<LineConfidenceInput>, string]>([
    [
      'description unresolved',
      { evidence: { ...SURE.evidence, description: 'unresolved' } },
      'Description not found in the document',
    ],
    [
      'qty evidence missing',
      { evidence: { ...SURE.evidence, qty: 'missing' } },
      'Quantity not found in the document',
    ],
    ['qty not stated', { qty: { value: null, problem: 'not_stated' } }, 'Quantity not stated'],
    [
      'several numbers',
      { qty: { value: null, problem: 'several_numbers' } },
      'Quantity has more than one number',
    ],
    ['approximate', { qty: { value: null, problem: 'approximate' } }, 'Quantity is approximate'],
    [
      'ambiguous separator',
      { qty: { value: null, problem: 'ambiguous_separator' } },
      'Quantity separator is ambiguous (1.000 or 1,000)',
    ],
    [
      'not positive',
      { qty: { value: null, problem: 'not_positive' } },
      'Quantity is not a positive number',
    ],
    ['qty conflict', { qtyConflict: true }, 'Printed quantity and the reading disagree'],
    ['lookalike', { lookalikeAmbiguous: true }, 'Part no. has look-alike readings'],
    ['core doubt', { doubtFields: ['qty', 'qty'] }, 'Doubt about qty'],
    [
      'part evidence unresolved',
      { evidence: { ...SURE.evidence, partNumber: 'unresolved' }, partMatch: 'none' },
      'Part no. not found in the document',
    ],
  ])('unsure: %s', (_n, over, reason) => {
    const r = run(over)
    expect(r.confidence).toBe('unsure')
    expect(r.reasons).toContain(reason)
  })

  it.each<[string, Partial<LineConfidenceInput>, string]>([
    ['unit from header', { uomMethod: 'header' }, 'Unit read from the column header'],
    ['no unit', { uomMethod: 'missing' }, 'No unit given · EA assumed'],
    ['unknown unit', { uomMethod: 'unknown' }, 'Unit not in the unit table'],
    [
      'unit evidence unresolved',
      { evidence: { ...SURE.evidence, uom: 'unresolved' } },
      'Unit not found in the document',
    ],
    ['no part number', { partNumber: null }, 'No part no. · matched by description'],
    ['fuzzy part', { partMatch: 'fuzzy' }, 'Part no. matched loosely'],
    ['new part', { partMatch: 'none' }, 'Part no. not seen before'],
    ['alternative make', { alternativeMake: true }, 'Alternative make offered'],
    [
      'scanned',
      {
        evidence: {
          description: 'page_only',
          qty: 'page_only',
          uom: 'page_only',
          partNumber: 'page_only',
        },
      },
      'Read from a scanned page',
    ],
    ['soft doubt', { doubtFields: ['spec'] }, 'Doubt about spec'],
  ])('likely: %s', (_n, over, reason) => {
    const r = run(over)
    expect(r.confidence).toBe('likely')
    expect(r.reasons).toContain(reason)
  })

  it('unsure reasons come first, then the soft ones', () => {
    expect(run({ qtyConflict: true, uomMethod: 'header' }).reasons).toEqual([
      'Printed quantity and the reading disagree',
      'Unit read from the column header',
    ])
  })
})
