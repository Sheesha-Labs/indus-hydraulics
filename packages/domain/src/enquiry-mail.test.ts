import { describe, expect, it } from 'vitest'
import { ENQUIRY_EMAIL_CC, ENQUIRY_EMAIL_TO, ENQUIRY_RECIPIENTS, enquiryBody, enquiryMailto } from './enquiry-mail'

describe('enquiryMailto', () => {
  it('addresses sales with purchase in CC', () => {
    const href = enquiryMailto({ subject: 'Enquiry' })
    expect(href.startsWith('mailto:sales@indushydraulics.me?')).toBe(true)
    expect(href).toContain('cc=purchase%40indushydraulics.me')
  })

  it('percent-encodes the subject and sends line breaks as CRLF', () => {
    const href = enquiryMailto({ subject: 'Hose & fittings: 1/2" 2SN', body: 'a\nb' })
    expect(href).toContain('subject=Hose%20%26%20fittings%3A%201%2F2%22%202SN')
    expect(href).toContain('body=a%0D%0Ab')
    expect(href).not.toContain('+')
  })

  it('round-trips through URLSearchParams', () => {
    const href = enquiryMailto({ subject: 'Enquiry: SAE 100R2', body: 'Line 1\nLine 2' })
    const params = new URLSearchParams(href.split('?')[1])
    expect(params.get('subject')).toBe('Enquiry: SAE 100R2')
    expect(params.get('body')).toBe('Line 1\r\nLine 2')
    expect(params.get('cc')).toBe(ENQUIRY_EMAIL_CC)
  })
})

describe('enquiryBody', () => {
  it('names the item, part number and page, then the questions the desk asks', () => {
    const body = enquiryBody({ about: 'Bauer coupling', partNumber: 'IH-123', url: 'https://indushydraulics.com/p/x' })
    expect(body).toContain('I would like a quote for: Bauer coupling')
    expect(body).toContain('Part number: IH-123')
    expect(body).toContain('Page: https://indushydraulics.com/p/x')
    expect(body).toContain('Quantity:')
  })

  it('leaves the part number line out when there is none', () => {
    expect(enquiryBody({ about: 'Mining', url: 'u' })).not.toContain('Part number')
  })
})

describe('ENQUIRY_RECIPIENTS', () => {
  it('is sales then purchase', () => {
    expect(ENQUIRY_RECIPIENTS).toEqual([ENQUIRY_EMAIL_TO, ENQUIRY_EMAIL_CC])
  })
})
