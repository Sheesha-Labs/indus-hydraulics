import { describe, expect, it } from 'vitest'
import { buildSupplierDenyList, scanText } from '../../identity/scan'
import * as F from '../__fixtures__/inputs'
import {
  createClientSafeOrderDoc,
  createClientSafeQuotation,
  createSupplierSafePo,
  createSupplierSafeRfq,
} from '../safe'
import type { DocBlock, DocumentData, HouseDocument } from '../types'
import {
  buildCreditNote,
  buildDn,
  buildInvoice,
  buildOa,
  buildPi,
  buildPl,
  buildPo,
  buildQuotation,
  buildRfq,
} from './index'

const totalsOf = (d: HouseDocument) =>
  (d.blocks.find((b) => b.t === 'totals') as Extract<DocBlock, { t: 'totals' }>).rows
const tableOf = (d: HouseDocument) =>
  d.blocks.find((b) => b.t === 'table') as Extract<DocBlock, { t: 'table' }>

describe('buildQuotation (Estimate layout, C37)', () => {
  const doc = buildQuotation(createClientSafeQuotation(F.QUOTATION), F.CTX)

  it('totals 157,587.08 USD over twelve lines, zero-rated', () => {
    expect(doc.layout).toBe('estimate')
    expect(doc.items.rows).toHaveLength(12)
    expect(doc.totals).toEqual([
      { label: 'Sub total', value: '157,587.08' },
      { label: 'VAT · zero-rated export (0%)', value: '0.00' },
      { label: 'Total (USD)', value: '157,587.08', grand: true },
    ])
  })

  it('prints "Price to follow" and "Not quoted · reason" across the price columns', () => {
    const [toFollow, notQuoted] = doc.items.rows.slice(10)
    expect(toFollow!.flag).toBe('to-follow')
    expect(toFollow!.cells.at(-1)).toEqual({ v: 'Price to follow', span: 4 })
    expect(notQuoted!.cells.at(-1)).toEqual({
      v: 'Not quoted · Discontinued by the maker',
      span: 4,
    })
    expect(toFollow!.cells.reduce((n, c) => n + (c.span ?? 1), 0)).toBe(doc.items.cols.length)
  })

  it('keeps the base number with the revision; the client code sits under the description', () => {
    expect(doc.no).toBe('INDUS/Q10001')
    expect(doc.revision).toBe('R2')
    expect(doc.items.cols).toEqual([
      '#',
      'Item & description',
      'Qty',
      'UoM',
      'Rate',
      'Wks',
      'Tax',
      'Amount',
    ])
    expect(doc.items.rows[0]!.cells[1]).toEqual({
      v: 'Gate valve 2″ class 300, A105, flanged RF',
      sub: 'SAMPLE-V-0101',
    })
    expect(doc.notes.map((n) => n.label)).toEqual(['Payment', 'Delivery', 'Bank', 'Disclaimer'])
  })

  it('template columns: Origin and Your code on, price columns stay together with Amount last', () => {
    const d = buildQuotation(createClientSafeQuotation(F.QUOTATION), {
      ...F.CTX,
      template: {
        columns: ['no', 'description', 'clientPartNo', 'qty', 'uom', 'rate', 'origin', 'amount'],
      },
    })
    expect(d.items.cols).toEqual([
      '#',
      'Item & description',
      'Your code',
      'Qty',
      'UoM',
      'Origin',
      'Rate',
      'Amount',
    ])
  })

  it('a preview has no number; a supplementary quotation says so', () => {
    const { revision: _r, ...withoutRevision } = F.QUOTATION
    const d = buildQuotation(
      createClientSafeQuotation({ ...withoutRevision, number: null, supplementary: true }),
      { ...F.CTX, previewLabel: 'INDUS/Q — next free' }
    )
    expect(d.no).toBe('INDUS/Q — next free')
    expect(d.title).toBe('SUPPLEMENTARY QUOTATION')
    expect(d.revision).toBeUndefined()
  })

  it('mixed VAT per line, with the AED VAT line on a USD quotation', () => {
    const lines = F.C37_LINES.slice(0, 2).map((l, i) => ({
      ...l,
      vat: i === 0 ? ('standard' as const) : ('zero_rated' as const),
    }))
    const d = buildQuotation(
      createClientSafeQuotation({ ...F.QUOTATION, lines, aedRate: '3.6725' }),
      F.CTX
    )
    expect(d.totals.map((r) => [r.label, r.value])).toEqual([
      ['Export lines (0%)', '19,043.20'],
      ['Local lines', '9,900.00'],
      ['VAT 5% on local lines', '495.00'],
      ['Total (USD)', '29,438.20'],
      ['VAT in AED at 3.6725', 'AED 1,817.89'],
    ])
  })

  it('no bank block confirmed: the quotation says the bank details follow', () => {
    const d = buildQuotation(createClientSafeQuotation(F.QUOTATION), { ...F.CTX, bank: null })
    expect(d.notes.at(-2)).toEqual({
      label: 'Bank',
      text: 'Bank details to follow',
      part: 'bank',
    })
  })
})

describe('client order documents', () => {
  it('OA: 5% VAT with the AED line and the amount in words', () => {
    const d = buildOa(createClientSafeOrderDoc(F.OA), F.CTX)
    expect(totalsOf(d).map((r) => r.value)).toEqual([
      '220,500.00',
      '11,025.00',
      '231,525.00',
      'AED 40,489.31',
    ])
    const totals = d.blocks.find((b) => b.t === 'totals') as Extract<DocBlock, { t: 'totals' }>
    expect(totals.words).toBe(
      'US Dollars Two Hundred Thirty-One Thousand Five Hundred Twenty-Five only'
    )
  })

  it('PI: the advance due now is the percentage of the order total', () => {
    const d = buildPi(createClientSafeOrderDoc(F.PI), F.CTX)
    expect(totalsOf(d).slice(-2)).toEqual([
      { label: 'Advance 30%', value: '69,457.50' },
      { label: 'Due now (USD)', value: '69,457.50', grand: true },
    ])
  })

  it('tax invoice: advance deducted; the AED rate is required when VAT applies', () => {
    const d = buildInvoice(createClientSafeOrderDoc(F.INVOICE), F.CTX)
    expect(totalsOf(d).slice(-2)).toEqual([
      { label: 'Less advance INDUS/PI1001', value: '(69,457.50)' },
      { label: 'Balance due (USD)', value: '162,067.50', grand: true },
    ])
    const { aedRate: _a, ...noRate } = F.INVOICE
    expect(() => buildInvoice(createClientSafeOrderDoc(noRate), F.CTX)).toThrow(/AED rate/)
  })

  it('credit note references the invoice and states the reason', () => {
    const d = buildCreditNote(createClientSafeOrderDoc(F.CREDIT_NOTE), F.CTX)
    expect(d.meta).toContainEqual({ label: 'Against invoice', value: 'INDUS/INV10001' })
    expect(d.blocks).toContainEqual({ t: 'remark', text: 'One trim set returned unused.' })
    expect(totalsOf(d).find((r) => r.grand)?.value).toBe('38,587.50')
  })

  it('delivery note and packing list carry the shipment suffix and no prices', () => {
    const dn = buildDn(createClientSafeOrderDoc(F.DELIVERY_NOTE), F.CTX)
    const pl = buildPl(createClientSafeOrderDoc(F.PACKING_LIST), F.CTX)
    expect(dn.no).toBe('INDUS/X0001-01')
    expect(pl.no).toBe('INDUS/X0001-02')
    expect(dn.title).toBe('Delivery note')
    expect(pl.title).toBe('Packing list')
    expect(tableOf(dn).cols).toEqual(['#', 'Description', 'Qty', 'Package'])
    expect(JSON.stringify(dn)).not.toContain('36,750')
  })
})

describe('supplier documents', () => {
  it('RFQ: our refs, no prices, the delivery point', () => {
    const d = buildRfq(createSupplierSafeRfq(F.RFQ), F.CTX)
    expect(d.no).toBe('IH-RFQ-2611-P01')
    expect(tableOf(d).rows[0]!.cells).toEqual([
      { v: '01' },
      { v: 'Control valve trim 3″ class 600, 13Cr', sub: 'Ref 2611-01' },
      { v: '6' },
      { v: 'set' },
      { v: '—' },
      { v: '10 wks' },
    ])
    expect(d.subject?.text).toContain('DUBAI, UAE')
  })

  it("PO: the supplier's own prices and total", () => {
    const d = buildPo(createSupplierSafePo(F.PO), F.CTX)
    expect(totalsOf(d).at(-1)).toEqual({ label: 'Total (EUR)', value: '17,050.00', grand: true })
    expect(d.meta).toContainEqual({ label: 'Your offer', value: 'EVC-Q-0001' })
  })
})

describe('identities never cross (runtime scan of every output)', () => {
  const clientDeny = [
    { term: 'sample client', kind: 'client name' },
    { term: 'sample/rfq-0001', kind: 'client ref' },
    { term: 'sample/po-0001', kind: 'client po' },
    { term: 'sample-v-0101', kind: 'client part number' },
    { term: 'enq-', kind: 'enquiry ref' },
  ]
  const supplierDeny = buildSupplierDenyList([
    {
      name: 'Example Valve Co',
      aliases: ['EVC'],
      refs: ['EVC-Q-0001'],
      domains: ['example-valve.test'],
    },
  ])

  const supplierDocs: DocumentData[] = [
    buildRfq(createSupplierSafeRfq(F.RFQ), F.CTX),
    buildPo(createSupplierSafePo(F.PO), F.CTX),
  ]
  const clientDocs: DocumentData[] = [
    buildQuotation(createClientSafeQuotation(F.QUOTATION), F.CTX),
    buildOa(createClientSafeOrderDoc(F.OA), F.CTX),
    buildPi(createClientSafeOrderDoc(F.PI), F.CTX),
    buildInvoice(createClientSafeOrderDoc(F.INVOICE), F.CTX),
    buildCreditNote(createClientSafeOrderDoc(F.CREDIT_NOTE), F.CTX),
    buildDn(createClientSafeOrderDoc(F.DELIVERY_NOTE), F.CTX),
    buildPl(createClientSafeOrderDoc(F.PACKING_LIST), F.CTX),
  ]

  it('supplier documents name nothing of the client', () => {
    for (const d of supplierDocs) {
      const text = JSON.stringify(d).toLowerCase()
      for (const t of clientDeny) expect(text.includes(t.term), `${d.kind}: ${t.kind}`).toBe(false)
    }
  })

  it('client documents name nothing of the supplier', () => {
    for (const d of clientDocs) expect(scanText(JSON.stringify(d), supplierDeny)).toEqual([])
  })

  it('the factories refuse a forbidden key smuggled in at run time, at any depth', () => {
    const smuggled = { ...F.RFQ, lines: [{ ...F.RFQ.lines[0]!, clientName: 'Sample Client LLC' }] }
    expect(() => createSupplierSafeRfq(smuggled as never)).toThrow(/clientName/)
    expect(() => createClientSafeQuotation({ ...F.QUOTATION, marginPct: '18' } as never)).toThrow(
      /marginPct/
    )
    expect(() =>
      createClientSafeOrderDoc({
        ...F.OA,
        lines: [{ ...F.OA.lines[0]!, landedCost: '1' }],
      } as never)
    ).toThrow(/landedCost/)
  })
})
