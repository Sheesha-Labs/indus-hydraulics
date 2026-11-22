import { describe, expect, it } from 'vitest'
import {
  enquiryRef,
  invoiceNo,
  legacyQuoteCode,
  linkToken,
  mailFolder,
  month,
  orderExceptionKind,
  orderRef,
  quotationNo,
  quotationRev,
  recordId,
  rfqRef,
  routeParam,
  setupStep,
  supplierSection,
  tenderSection,
  wizardSteps,
} from './route-params'

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) =>
  schema.safeParse(v).success

describe('route params', () => {
  it('enquiryRef: ENQ-yyyy-nnnn, upper-cased', () => {
    expect(enquiryRef.parse('ENQ-2026-0001')).toBe('ENQ-2026-0001')
    expect(enquiryRef.parse('enq-2026-0001')).toBe('ENQ-2026-0001')
    expect(enquiryRef.parse('ENQ-2026-12345')).toBe('ENQ-2026-12345')
    for (const bad of [
      'ENQ-26-0001',
      'ENQ-2026-001',
      'ENQ2026-0001',
      'SO-0001',
      '',
      'ENQ-2026-0001/x',
    ])
      expect([bad, ok(enquiryRef, bad)]).toEqual([bad, false])
  })

  it('orderRef: SO-nnnn and a part order SO-nnnn-B', () => {
    expect(orderRef.parse('SO-0001')).toBe('SO-0001')
    expect(orderRef.parse('so-0001-b')).toBe('SO-0001-B')
    expect(orderRef.parse('SO-12345')).toBe('SO-12345')
    for (const bad of ['SO-001', 'SO-0001-BB', 'SO-0001-1', 'ENQ-2026-0001', 'SO0001'])
      expect([bad, ok(orderRef, bad)]).toEqual([bad, false])
  })

  it('rfqRef: IH-RFQ-yymm-Pnn', () => {
    expect(rfqRef.parse('IH-RFQ-2611-P01')).toBe('IH-RFQ-2611-P01')
    expect(rfqRef.parse('ih-rfq-2611-p123')).toBe('IH-RFQ-2611-P123')
    for (const bad of ['IH-RFQ-2611-P1', 'IH-RFQ-261-P01', 'RFQ-2611-P01'])
      expect([bad, ok(rfqRef, bad)]).toEqual([bad, false])
  })

  it('quotationNo: the slug without INDUS/ parses to the stored number', () => {
    expect(quotationNo.parse('Q10001-R2')).toBe('INDUS/Q10001-R2')
    expect(quotationNo.parse('q10001')).toBe('INDUS/Q10001')
    for (const bad of ['INDUS/Q10001', 'Q10001-2', '10001', 'Q-10001'])
      expect([bad, ok(quotationNo, bad)]).toEqual([bad, false])
  })

  it('quotationRev and invoiceNo', () => {
    expect(quotationRev.parse('r2')).toBe('R2')
    expect(ok(quotationRev, 'R')).toBe(false)
    expect(ok(quotationRev, 'R123')).toBe(false)
    expect(invoiceNo.parse('INV10001')).toBe('INDUS/INV10001')
    expect(invoiceNo.parse('inv10001-02')).toBe('INDUS/INV10001-02')
    expect(ok(invoiceNo, 'INDUS/INV10001')).toBe(false)
    expect(ok(invoiceNo, 'INV10001-2')).toBe(false)
  })

  it('recordId: a UUID', () => {
    expect(ok(recordId, '00000000-0000-7000-8000-000000000001')).toBe(true)
    expect(ok(recordId, '0198f0a2-7c1e-7b3a-9d2c-1a2b3c4d5e6f')).toBe(true)
    expect(ok(recordId, 'not-a-uuid')).toBe(false)
    expect(ok(recordId, '00000000000070008000000000000001')).toBe(false)
  })

  it('month: yyyy-mm with a real month', () => {
    expect(ok(month, '2026-11')).toBe(true)
    expect(ok(month, '2026-1')).toBe(false)
    expect(ok(month, '2026-13')).toBe(false)
    expect(ok(month, '2026-00')).toBe(false)
  })

  it('the enums: mail folder, setup step, tender section, order exception, supplier section', () => {
    expect(mailFolder.options).toEqual([
      'all',
      'needs-you',
      'unsure',
      'not-linked',
      'suppliers',
      'clients',
      'sent',
      'sales',
      'purchase',
      'handled',
    ])
    expect(setupStep.options).toEqual([
      'company',
      'mailboxes',
      'history',
      'money',
      'assistant',
      'invite',
    ])
    expect(tenderSection.options).toEqual(['timeline', 'requirements', 'queries', 'vendors', 'bid'])
    expect(orderExceptionKind.options).toEqual([
      'collection',
      'failed-inspection',
      'cannot-deliver',
      'client-change',
      'claim',
      'supplier-documents',
      'reissue',
    ])
    expect(ok(supplierSection, 'contacts')).toBe(true)
    for (const [schema, bad] of [
      [mailFolder, 'inbox'],
      [setupStep, 'welcome'],
      [tenderSection, 'Bid'],
      [orderExceptionKind, 'other'],
      [supplierSection, 'overview'],
    ] as const)
      expect([bad, ok(schema, bad)]).toEqual([bad, false])
  })

  it('linkToken: base64url within bounds', () => {
    expect(ok(linkToken, 'abcDEF012_-abcDEF012_-')).toBe(true)
    expect(ok(linkToken, 'short')).toBe(false)
    expect(ok(linkToken, 'a'.repeat(513))).toBe(false)
    expect(ok(linkToken, 'abcdefghijklmnop.qrs')).toBe(false)
    expect(ok(linkToken, 'abcdefghijklmnop+/=')).toBe(false)
    expect(ok(legacyQuoteCode, 'Q-2026-ABCD')).toBe(true)
    expect(ok(legacyQuoteCode, '../etc')).toBe(false)
  })

  it('wizardSteps: absent, slugs or ids, at most three', () => {
    expect(ok(wizardSteps, undefined)).toBe(true)
    expect(ok(wizardSteps, ['company'])).toBe(true)
    expect(ok(wizardSteps, ['00000000-0000-7000-8000-000000000001', 'vetting'])).toBe(true)
    expect(ok(wizardSteps, ['a', 'b', 'c', 'd'])).toBe(false)
    expect(ok(wizardSteps, ['Company'])).toBe(false)
    expect(ok(wizardSteps, ['..'])).toBe(false)
  })

  it('routeParam returns the parsed value, and calls notFound() on a mismatch', () => {
    expect(routeParam(enquiryRef, 'enq-2026-0001')).toBe('ENQ-2026-0001')
    let thrown: unknown
    try {
      routeParam(enquiryRef, 'ENQ-26-1')
    } catch (error) {
      thrown = error
    }
    // notFound() throws Next's HTTP-fallback error (digest NEXT_HTTP_ERROR_FALLBACK;404).
    expect((thrown as { digest?: string } | undefined)?.digest).toMatch(/404/)
  })
})
