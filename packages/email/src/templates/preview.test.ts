import { describe, expect, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { renderQuoteSent } from './quote-sent'
import { renderRfqConfirmation } from './rfq-confirmation'

/**
 * Transactional emails had no test of any kind. They are rendered
 * server-side, sent to a customer, and never seen in development — the
 * failure mode is that nobody notices the brand is wrong until a customer
 * receives it, which is exactly what happened with the v1 palette.
 *
 * This asserts the two most important messages render, carry the v2 palette,
 * and contain no surviving v1 warm-stone values. Set EMAIL_HTML_OUT to also
 * dump the markup for eyeballing in a browser.
 */

const branding = {
  legalName: 'Indus Hydraulic Power Trading LLC',
  vatTrn: '100123456700003',
  registeredAddressLines: ['Warehouse 7, Street 14', 'Al Quoz Industrial 3', 'Dubai, UAE'],
  signatureName: 'K. Al Marzouqi',
  signatureTitle: 'Applications Engineer',
  signaturePhone: '+971 52 2477942',
  signatureEmail: 'sales@indushydraulics.me',
}

// The warm stone + sky blue the templates used to be built from.
const V1_COLOURS = ['#1c1917', '#44403c', '#78716c', '#e7e5e4', '#f5f5f4', '#fafaf9', '#0c4a6e', '#1a4dbe']

describe('transactional email rendering', () => {
  const quote = renderQuoteSent({
    customerName: 'Gulf Drilling Services',
    quoteCode: 'INDUS/Q26386',
    revisionLabel: 'R2',
    totalDisplay: 'AED 18,940.00',
    expiresOnDisplay: '15 September 2026',
    paymentTerms: '50% with order, balance against delivery note',
    engineerMessage: 'Both pumps are in Jebel Ali stock; the seal kits ship with them.',
    viewUrl: 'https://indushydraulics.com/quote/abc123',
    branding,
  })

  const rfq = renderRfqConfirmation({
    customerName: 'Gulf Drilling Services',
    rfqCode: 'RFQ-4821',
    lineCount: 4,
    urgency: 'priority',
    trackingUrl: 'https://indushydraulics.com/quote/RFQ-4821',
    branding,
  })

  it('renders a subject and a body', () => {
    expect(quote.subject).toBeTruthy()
    expect(quote.html).toContain('<!DOCTYPE html>')
    expect(rfq.subject).toBeTruthy()
    expect(rfq.html).toContain('<!DOCTYPE html>')
  })

  it('carries the v2 palette and no v1 survivors', () => {
    for (const html of [quote.html, rfq.html]) {
      // Cool paper ground and blue-black ink, from BRAND.
      expect(html).toContain('#f5f7fa')
      expect(html).toMatch(/#10151c|#30363e/)
      for (const dead of V1_COLOURS) {
        expect(html.toLowerCase()).not.toContain(dead)
      }
    }
  })

  it('never emits oklch, which no mail client parses', () => {
    expect(quote.html).not.toContain('oklch')
    expect(rfq.html).not.toContain('oklch')
  })

  it('writes previews when asked', () => {
    const out = process.env.EMAIL_HTML_OUT
    if (!out) return
    writeFileSync(out, [quote.html, rfq.html].join('\n<hr style="margin:48px 0;border:0;border-top:1px dashed #bec5cc" />\n'))
  })
})
