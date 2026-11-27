import { describe, expect, it } from 'vitest'
import { DOCUMENT_STATUSES } from './labels'
import { canTransitionDocument, documentEdges, isIssued, transitionDocument } from './document'

/** 100% transition coverage (CLAUDE.md §13.2): every pair of statuses, for an OA and for a tax invoice. */
const ALLOWED: Record<string, boolean> = {
  'draft>approved': true,
  'approved>sent': true,
  'draft>void': true,
  'approved>superseded': true,
  'sent>superseded': true,
  'approved>cancelled': true,
  'sent>cancelled': true,
  'received>superseded': true,
  'received>void': true,
}

describe('document machine', () => {
  it('has exactly the §9.8 edges', () => {
    expect(new Set(documentEdges().map(([a, b]) => `${a}>${b}`))).toEqual(
      new Set(Object.keys(ALLOWED))
    )
  })

  for (const from of DOCUMENT_STATUSES)
    for (const to of DOCUMENT_STATUSES)
      it(`${from} → ${to}`, () => {
        const edge = `${from}>${to}`
        const oa = canTransitionDocument(from, to, {
          kind: 'order_acknowledgement',
          reissueReason: 'typo',
        })
        expect(oa.ok).toBe(ALLOWED[edge] ?? false)
        const inv = canTransitionDocument(from, to, { kind: 'tax_invoice', reissueReason: 'typo' })
        const invAllowed =
          (ALLOWED[edge] ?? false) &&
          !(from === 'sent' && (to === 'cancelled' || to === 'superseded'))
        expect(inv.ok).toBe(invAllowed)
      })

  it('a sent tax invoice is corrected by a credit note; an approved one may still be reissued', () => {
    expect(canTransitionDocument('sent', 'cancelled', { kind: 'tax_invoice' })).toEqual({
      ok: false,
      reason: 'A sent tax invoice stays as issued: issue a credit note instead',
    })
    expect(
      canTransitionDocument('approved', 'superseded', {
        kind: 'tax_invoice',
        reissueReason: 'typo',
      }).ok
    ).toBe(true)
  })

  it('a reissue needs a reason; final statuses never move; the transition draft records the change', () => {
    expect(canTransitionDocument('approved', 'superseded', { kind: 'quotation' })).toEqual({
      ok: false,
      reason: 'Say why it is reissued',
    })
    expect(canTransitionDocument('cancelled', 'sent', { kind: 'quotation' }).ok).toBe(false)
    expect(canTransitionDocument('sent', 'sent', { kind: 'quotation' })).toEqual({
      ok: false,
      reason: 'It is already Sent',
    })
    expect(transitionDocument('draft', 'approved', { kind: 'quotation' })).toEqual({
      kind: 'status',
      field: 'status',
      before: 'draft',
      after: 'approved',
    })
    expect(() => transitionDocument('void', 'approved', { kind: 'quotation' })).toThrow()
    expect(isIssued('draft')).toBe(false)
    expect(isIssued('sent')).toBe(true)
  })
})
