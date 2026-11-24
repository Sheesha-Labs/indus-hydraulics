import { describe, expect, it } from 'vitest'
import {
  assistantNote,
  CLASSIFY_MODEL_CLASSES,
  classifySchema,
  computeClassifyConfidence,
  MAIL_CLASSES,
  roleConflict,
  type ConfidenceInput,
} from './classify'
import { decideLink, TIE_BREAK_MAX, type LinkCandidate } from './link'

const C = (over: Partial<ConfidenceInput>): ConfidenceInput => ({
  modelConfidence: 'sure',
  modelClass: 'client_enquiry',
  resolvedReasons: 1,
  senderRole: 'client',
  ...over,
})

describe('computed classify confidence (ADR-12)', () => {
  it.each([
    [C({}), 'sure'],
    [C({ senderRole: 'unknown' }), 'sure'],
    [C({ resolvedReasons: 0 }), 'likely'],
    [C({ modelClass: 'supplier_quote', senderRole: 'client' }), 'likely'],
    [C({ modelClass: 'supplier_quote', senderRole: 'client', resolvedReasons: 0 }), 'unsure'],
    [C({ modelConfidence: 'likely' }), 'likely'],
    [C({ modelConfidence: 'likely', resolvedReasons: 0 }), 'unsure'],
    [C({ modelConfidence: 'likely', modelClass: 'client_po', senderRole: 'supplier' }), 'unsure'],
    [C({ modelConfidence: 'unsure' }), 'unsure'],
    [C({ modelClass: 'unsure' }), 'unsure'],
    [C({ modelClass: 'supplier_quote', senderRole: 'supplier' }), 'sure'],
    [C({ modelClass: 'freight', senderRole: 'supplier' }), 'sure'],
  ] as const)('%o → %s', (input, expected) => {
    expect(computeClassifyConfidence(input).confidence).toBe(expected)
  })

  it('never makes the model more sure than it said', () => {
    for (const modelConfidence of ['sure', 'likely', 'unsure'] as const) {
      for (const modelClass of CLASSIFY_MODEL_CLASSES) {
        for (const senderRole of ['client', 'supplier', 'both', 'unknown'] as const) {
          for (const resolvedReasons of [0, 1, 3]) {
            const r = computeClassifyConfidence({
              modelConfidence,
              modelClass,
              senderRole,
              resolvedReasons,
            })
            const rank = { unsure: 0, likely: 1, sure: 2 }
            expect(rank[r.confidence]).toBeLessThanOrEqual(rank[modelConfidence])
          }
        }
      }
    }
  })

  it('a role conflict is a supplier class from a client, or a client class from a supplier', () => {
    expect(roleConflict('supplier_quote', 'client')).toBe(true)
    expect(roleConflict('client_po', 'supplier')).toBe(true)
    expect(roleConflict('client_po', 'both')).toBe(false)
    expect(roleConflict('freight', 'client')).toBe(false)
  })

  it('every model class except unsure is a stored class', () => {
    for (const c of CLASSIFY_MODEL_CLASSES.filter((x) => x !== 'unsure')) {
      expect(MAIL_CLASSES as readonly string[]).toContain(c)
    }
  })

  it('validates the model output strictly', () => {
    const good = {
      class: 'client_enquiry',
      confidence: 'sure',
      reasons: [{ text: 'Asks for a price', quote: 'please quote 10 pcs' }],
      alternatives: [],
    }
    expect(classifySchema.safeParse(good).success).toBe(true)
    expect(classifySchema.safeParse({ ...good, reasons: [] }).success).toBe(false)
    expect(classifySchema.safeParse({ ...good, class: 'auto_reply' }).success).toBe(false)
    expect(classifySchema.safeParse({ ...good, extra: 1 }).success).toBe(false)
  })

  it('writes the one-line Assistant note', () => {
    expect(assistantNote('client_enquiry', 'sure', 'from a known client domain')).toBe(
      'Client enquiry · Sure · from a known client domain'
    )
  })
})

const cand = (key: string, step: LinkCandidate['step']): LinkCandidate => ({
  key,
  subjectType: key.split(':')[0]!,
  subjectId: key.split(':')[1]!,
  enquiryId: null,
  label: key,
  step,
  reason: step,
})

describe('decideLink (precision over recall)', () => {
  it('the first strong step with one record wins, sure', () => {
    const d = decideLink({
      candidates: [
        cand('enquiry:b', 'sender_domain'),
        cand('enquiry:a', 'reference'),
        cand('enquiry:c', 'thread'),
      ],
      knownCompanyId: 'co',
    })
    expect(d).toMatchObject({ kind: 'link', confidence: 'sure', candidate: { key: 'enquiry:c' } })
  })

  it('two different records in one strong step are Unsure, never a guess', () => {
    const d = decideLink({
      candidates: [cand('supplier_rfq:a', 'reference'), cand('supplier_rfq:b', 'reference')],
      knownCompanyId: null,
    })
    expect(d.kind).toBe('unsure')
  })

  it('the same record twice in one step is one candidate', () => {
    const d = decideLink({
      candidates: [cand('enquiry:a', 'thread'), cand('enquiry:a', 'thread')],
      knownCompanyId: null,
    })
    expect(d).toMatchObject({ kind: 'link', confidence: 'sure' })
  })

  it('the sender domain alone: one record likely, 2–3 a tie-break, more Unsure', () => {
    expect(
      decideLink({ candidates: [cand('enquiry:a', 'sender_domain')], knownCompanyId: 'co' })
    ).toMatchObject({
      kind: 'link',
      confidence: 'likely',
    })
    const three = ['a', 'b', 'c'].map((x) => cand(`enquiry:${x}`, 'sender_domain'))
    expect(decideLink({ candidates: three, knownCompanyId: 'co' }).kind).toBe('tie_break')
    const four = ['a', 'b', 'c', 'd'].map((x) => cand(`enquiry:${x}`, 'sender_domain'))
    expect(four.length).toBeGreaterThan(TIE_BREAK_MAX)
    expect(decideLink({ candidates: four, knownCompanyId: 'co' })).toMatchObject({ kind: 'unsure' })
  })

  it('no candidates: a company link when the domain is known, else nothing', () => {
    expect(decideLink({ candidates: [], knownCompanyId: 'co' })).toEqual({
      kind: 'company_only',
      companyId: 'co',
    })
    expect(decideLink({ candidates: [], knownCompanyId: null })).toEqual({ kind: 'none' })
  })
})
