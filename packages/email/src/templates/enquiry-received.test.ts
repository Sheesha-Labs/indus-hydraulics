import { describe, expect, it } from 'vitest'
import { renderEnquiryReceived, type EnquiryReceivedProps } from './enquiry-received'

const base: EnquiryReceivedProps = {
  reference: 'RFQ-2611-0042',
  formLabel: 'Contact form · Quotation request',
  senderName: 'Amal Haddad',
  senderEmail: 'amal@example.com',
  company: 'Gulf Drilling',
  details: [
    ['Phone', '+971 50 000 0000'],
    ['Industry', ''],
    ['Part numbers', null],
  ],
  message: '2 x SAE 100R2 1/2" assemblies',
  attachmentCount: 2,
  pageUrl: 'https://indushydraulics.com/contact',
  nextStep: 'An engineer will reply to this email, usually within 4 business hours.',
  branding: { legalName: 'Indus Hydraulic Power Trading LLC' },
}

describe('renderEnquiryReceived', () => {
  it('puts the reference, company and form in the subject', () => {
    expect(renderEnquiryReceived(base).subject).toBe('Enquiry RFQ-2611-0042 — Gulf Drilling — Contact form · Quotation request')
  })

  it('falls back to the name and a generic subject without company or reference', () => {
    const { subject } = renderEnquiryReceived({ ...base, reference: null, company: null })
    expect(subject).toBe('Enquiry received — Amal Haddad — Contact form · Quotation request')
  })

  it('thanks the sender by first name and repeats what they sent', () => {
    const { html, text } = renderEnquiryReceived(base)
    expect(text).toContain('Thank you, Amal. We have received your enquiry. Your reference is RFQ-2611-0042.')
    expect(text).toContain('Phone: +971 50 000 0000')
    expect(text).toContain('Attachments: 2 files')
    expect(html).toContain('2 x SAE 100R2 1/2&quot; assemblies')
  })

  it('drops empty details', () => {
    const { text } = renderEnquiryReceived(base)
    expect(text).not.toContain('Industry:')
    expect(text).not.toContain('Part numbers:')
  })

  it('escapes what the visitor typed', () => {
    const { html } = renderEnquiryReceived({ ...base, senderName: '<script>x</script>', message: '<a href="http://evil">click</a>' })
    expect(html).not.toContain('<script>x')
    expect(html).not.toContain('<a href="http://evil"')
  })

  it('carries no admin links', () => {
    expect(renderEnquiryReceived(base).html).not.toContain('/admin')
  })
})
