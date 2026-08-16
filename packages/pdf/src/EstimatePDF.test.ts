import { describe, expect, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { renderEstimatePdf } from './render'
import type { EstimateInput } from './types'

/**
 * Smoke test for the estimate renderer.
 *
 * The PDF had no test at all, which matters more than usual here: it is the
 * document that closes the sale, it is generated server-side where nobody
 * sees it during development, and @react-pdf fails at RENDER time for things
 * a type-check cannot catch — an unregistered font family, or a colour it
 * cannot parse. That second one is exactly the risk the v2 palette
 * introduced: the app's tokens are OKLCH and this renderer does not
 * implement it.
 *
 * Set ESTIMATE_PDF_OUT to also write the buffer somewhere for eyeballing.
 */

const INPUT: EstimateInput = {
  documentTitle: 'Estimate',
  code: 'INDUS/Q26386',
  revisionLabel: 'r2',
  estimateDate: new Date('2026-08-16T00:00:00Z'),
  expiryDate: new Date('2026-09-15T00:00:00Z'),
  referenceLine: 'REVISED OFFER FOR AXIAL PISTON PUMP REBUILD',
  subject: 'OFFER FOR A10VSO 71 SERIES 31 — DFR1 CONTROL',
  billTo: {
    name: 'Gulf Drilling Services LLC',
    addressLines: ['PO Box 44219', 'Jebel Ali Free Zone', 'Dubai, United Arab Emirates'],
  },
  lines: [
    { description: 'Axial Piston Pump A10VSO 71 DFR1/31R-PPA12N00 — Bosch Rexroth, genuine', qty: 2, rate: 8450 },
    { description: 'Seal kit, FKM (Viton) — A10VSO 71 series 31', qty: 4, rate: 385 },
    { description: 'Bench test to ISO 4413 with certificate — 1.5x MAWP, 30 min hold', qty: 2, rate: 640 },
  ],
  currency: 'AED',
  vatRatePct: 5,
  vatLabel: 'VAT @ 5%',
  notes: 'Lead time quoted from receipt of written purchase order. Stock subject to prior sale.',
  termsLines: [
    'Payment: 50% with order, balance against delivery note.',
    'Validity: 30 days from the date of this estimate.',
  ],
  disclaimer: 'This is an estimate, not a tax invoice. A tax invoice is issued on despatch.',
  branding: {
    legalName: 'Indus Hydraulic Power Trading LLC',
    vatTrn: '100123456700003',
    addressLines: ['Warehouse 7, Street 14', 'Al Quoz Industrial 3', 'Dubai, UAE'],
  },
  signature: {
    name: 'K. Al Marzouqi',
    title: 'Applications Engineer',
    company: 'Indus Hydraulic Power Trading LLC',
    phone: '+971 52 2477942',
    email: 'sales@indushydraulics.me',
  },
  bank: {
    accountName: 'Indus Hydraulic Power Trading LLC',
    accountNo: '0123456789012',
    bankName: 'Emirates NBD',
    iban: 'AE070331234567890123456',
    swift: 'EBILAEAD',
  },
}

describe('renderEstimatePdf', () => {
  it('renders a PDF the v2 palette does not break', async () => {
    const buf = await renderEstimatePdf(INPUT)

    // %PDF- magic. A renderer that threw would have rejected above; this
    // asserts we got a document rather than an empty buffer.
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    expect(buf.byteLength).toBeGreaterThan(10_000)

    const out = process.env.ESTIMATE_PDF_OUT
    if (out) writeFileSync(out, buf)
  }, 30_000)
})
