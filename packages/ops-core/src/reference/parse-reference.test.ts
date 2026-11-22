import { describe, expect, it } from 'vitest'
import {
  parseReference,
  parseReferences,
  partKey,
  REFERENCE_KIND_LABEL,
  type ReferenceKind,
  type ReferenceMatch,
} from './parse-reference'

/**
 * Every format on board 208 and in the numbering list (architecture C6, ADR-15), with neutral sample numbers.
 * Each row: what a person types → kind, canonical, match and (where it has one) revision. Every row is also
 * run lower-case and with stray spaces round the separators.
 */
const FORMATS: ReadonlyArray<{
  input: string
  kind: ReferenceKind
  canonical: string
  match?: ReferenceMatch
  revision?: number
  variant?: string
}> = [
  // Enquiry ENQ-{yyyy}-{nnnn}
  { input: 'ENQ-2026-0001', kind: 'enquiry', canonical: 'ENQ-2026-0001', variant: 'ENQ20260001' },
  { input: 'ENQ20260001', kind: 'enquiry', canonical: 'ENQ-2026-0001' },
  { input: 'ENQ 2026 0001', kind: 'enquiry', canonical: 'ENQ-2026-0001' },
  // Quotation INDUS/Q{n}, -R{n}; Q{n}; a bare five-digit number
  { input: 'INDUS/Q10001', kind: 'quotation', canonical: 'INDUS/Q10001', variant: 'Q10001' },
  {
    input: 'INDUS/Q10001-R2',
    kind: 'quotation',
    canonical: 'INDUS/Q10001-R2',
    revision: 2,
    variant: '10001-R2',
  },
  { input: 'INDUSQ10001-R2', kind: 'quotation', canonical: 'INDUS/Q10001-R2', revision: 2 },
  { input: 'INDUS Q10001', kind: 'quotation', canonical: 'INDUS/Q10001' },
  { input: 'Q10001', kind: 'quotation', canonical: 'INDUS/Q10001' },
  { input: 'Q10001-R2', kind: 'quotation', canonical: 'INDUS/Q10001-R2', revision: 2 },
  { input: 'Q10001 R2', kind: 'quotation', canonical: 'INDUS/Q10001-R2', revision: 2 },
  { input: '10001', kind: 'quotation', canonical: 'INDUS/Q10001', match: 'ambiguous' },
  {
    input: '10001-R1',
    kind: 'quotation',
    canonical: 'INDUS/Q10001-R1',
    match: 'ambiguous',
    revision: 1,
  },
  // Supplier RFQ IH-RFQ-{yymm}-P{nn}
  {
    input: 'IH-RFQ-2611-P01',
    kind: 'supplier_rfq',
    canonical: 'IH-RFQ-2611-P01',
    variant: 'IHRFQ2611P01',
  },
  { input: 'IHRFQ2611P01', kind: 'supplier_rfq', canonical: 'IH-RFQ-2611-P01' },
  { input: 'IH RFQ 2611 P01', kind: 'supplier_rfq', canonical: 'IH-RFQ-2611-P01' },
  // Order documents INDUS/<code>{n} (Round 1) and the Round 4 dashed forms
  { input: 'INDUS/PO10001', kind: 'supplier_po', canonical: 'INDUS/PO10001', variant: 'PO10001' },
  { input: 'INDUS/PO-10001', kind: 'supplier_po', canonical: 'INDUS/PO10001' },
  { input: 'INDUS/OA1001', kind: 'order_ack', canonical: 'INDUS/OA1001' },
  { input: 'INDUS/OA-0001-R1', kind: 'order_ack', canonical: 'INDUS/OA0001-R1', revision: 1 },
  { input: 'INDUS/PI1001', kind: 'proforma', canonical: 'INDUS/PI1001' },
  {
    input: 'INDUS/PI-0001-A1',
    kind: 'proforma',
    canonical: 'INDUS/PI0001-A1',
    variant: 'INDUS/PI-0001-A1',
  },
  { input: 'INDUS/PI0001-A1-R1', kind: 'proforma', canonical: 'INDUS/PI0001-A1-R1', revision: 1 },
  { input: 'INDUS/INV10001', kind: 'tax_invoice', canonical: 'INDUS/INV10001' },
  { input: 'INDUS/INV-0001-01', kind: 'tax_invoice', canonical: 'INDUS/INV0001-01' },
  { input: 'INDUS/CN1001', kind: 'credit_note', canonical: 'INDUS/CN1001' },
  { input: 'INDUS/DN1001', kind: 'delivery_note', canonical: 'INDUS/DN1001' },
  { input: 'INDUS/DN1001-02', kind: 'delivery_note', canonical: 'INDUS/DN1001-02' },
  { input: 'INDUS/PL1001-01', kind: 'packing_list', canonical: 'INDUS/PL1001-01' },
  { input: 'INDUSPL1001', kind: 'packing_list', canonical: 'INDUS/PL1001' },
  // Order SO-{nnnn}, a part order SO-{nnnn}-B
  { input: 'SO-0001', kind: 'order', canonical: 'SO-0001', variant: 'SO0001' },
  { input: 'SO-0001-B', kind: 'order', canonical: 'SO-0001-B' },
  { input: 'SO0001B', kind: 'order', canonical: 'SO-0001-B' },
  // Assistant action A-{yy}-{mm}-{dd}-{nnnn}
  { input: 'A-26-11-20-0001', kind: 'assistant_action', canonical: 'A-26-11-20-0001' },
  { input: 'A 26 11 20 0001', kind: 'assistant_action', canonical: 'A-26-11-20-0001' },
  // Technical query, lead, claim
  { input: 'TQ-01', kind: 'tender_query', canonical: 'TQ-01' },
  { input: 'TQ01', kind: 'tender_query', canonical: 'TQ-01' },
  { input: 'L-0001', kind: 'lead', canonical: 'L-0001' },
  { input: 'CL-0001-01', kind: 'claim', canonical: 'CL-0001-01' },
  { input: 'CL000101', kind: 'claim', canonical: 'CL-0001-01' },
  // Someone else's numbers: a client PO and a supplier quote number (resolved by search)
  { input: 'PO-SCL-10001', kind: 'external', canonical: 'PO-SCL-10001', match: 'search' },
  { input: 'EXV-10001', kind: 'external', canonical: 'EXV-10001', match: 'search' },
  { input: 'SCL/PR/26-0001', kind: 'external', canonical: 'SCL/PR/26-0001', match: 'search' },
  // Part numbers: the compact key is canonical
  { input: '6205-C3', kind: 'part', canonical: '6205C3', match: 'search', variant: '6205 C3' },
  { input: '6205C3', kind: 'part', canonical: '6205C3', match: 'search', variant: '6205-C3' },
  { input: '6205 C3', kind: 'part', canonical: '6205C3', match: 'search', variant: '6205-C3' },
  { input: '22210-E1-K', kind: 'part', canonical: '22210E1K', match: 'search' },
  { input: '1234', kind: 'part', canonical: '1234', match: 'search' },
]

/** Lower case, and spaces round every separator. */
function spaced(s: string): string {
  return ` ${s.replace(/([/-])/g, ' $1 ')} `
}

describe('parseReference: every format', () => {
  for (const row of FORMATS) {
    for (const [label, input] of [
      ['as typed', row.input],
      ['lower case', row.input.toLowerCase()],
      ['spaced', spaced(row.input.toLowerCase())],
    ] as const) {
      it(`${row.input} (${label}) → ${row.kind} ${row.canonical}`, () => {
        const r = parseReference(input)
        expect(r).not.toBeNull()
        expect(r!.kind).toBe(row.kind)
        expect(r!.canonical).toBe(row.canonical)
        expect(r!.match).toBe(row.match ?? 'known_format')
        expect(r!.revision).toBe(row.revision)
        expect(r!.variants[0]).toBe(row.canonical)
        expect(new Set(r!.variants).size).toBe(r!.variants.length)
        if (row.variant) expect(r!.variants).toContain(row.variant)
      })
    }
  }
})

describe('parseReference: near-misses and words return null', () => {
  const NULLS = [
    '',
    '   ',
    'who quoted 6205-C3 last',
    'what is overdue',
    'hello',
    'ab',
    // Our own prefixes that do not fit their format are never someone else's reference.
    'ENQ-26-0001',
    'ENQ-2026-001',
    'ENQ-2026-00011',
    'ENQ-ABCD-0001',
    'INDUS/X10001',
    'INDUS/Q',
    'INDUS/Q12',
    'INDUS/INV10001-1',
    'INDUS/CN1001-01',
    'INDUS/PI1001-B1',
    'IH-RFQ-2611-01',
    'IH-RFQ-261-P01',
    'SO-24',
    'SO-0001-BB',
    'A-26-13-20-0001',
    'A-26-11-32-0001',
    'A-26-11-20-01',
    'TQ-1',
    'L-01',
    'CL-0001',
    'Q12',
    'Q10001-RX',
  ]
  for (const input of NULLS) {
    it(`"${input}" → null`, () => {
      expect(parseReference(input)).toBeNull()
      expect(parseReferences(input)).toEqual([])
    })
  }
})

describe('parseReference: ambiguity', () => {
  it('a bare five-digit number is a quotation first and a part number second', () => {
    const r = parseReference('10001')!
    expect(r.kind).toBe('quotation')
    expect(r.match).toBe('ambiguous')
    expect(r.variants).toEqual(expect.arrayContaining(['INDUS/Q10001', 'Q10001', '10001']))
    expect(r.alternatives).toHaveLength(1)
    expect(r.alternatives[0]).toMatchObject({ kind: 'part', canonical: '10001', match: 'search' })
  })

  it('a bare number with a revision is only a quotation', () => {
    expect(parseReference('10001-R2')!.alternatives).toEqual([])
  })

  it('a letter-led document number keeps a part reading as the alternative', () => {
    const r = parseReference('EXV-10001')!
    expect(r.kind).toBe('external')
    expect(r.alternatives.map((a) => a.kind)).toEqual(['part'])
  })

  it('a known format has no alternatives', () => {
    expect(parseReference('INDUS/Q10001-R2')!.alternatives).toEqual([])
    expect(parseReference('ENQ-2026-0001')!.alternatives).toEqual([])
  })
})

describe('part numbers', () => {
  it('6205-C3, 6205C3 and 6205 C3 are one part with the same key', () => {
    const keys = ['6205-C3', '6205C3', '6205 C3', '6205 - c3'].map((p) => parseReference(p)!)
    expect(new Set(keys.map((k) => k.canonical))).toEqual(new Set(['6205C3']))
    for (const k of keys)
      expect(k.variants).toEqual(expect.arrayContaining(['6205-C3', '6205C3', '6205 C3']))
  })

  it('partKey keeps letters and digits only', () => {
    expect(partKey(' 22210-e1-k ')).toBe('22210E1K')
  })
})

it('every kind has a label', () => {
  for (const row of FORMATS) expect(REFERENCE_KIND_LABEL[row.kind]).toBeTruthy()
})
