import { describe, expect, it } from 'vitest'
import { renderNewsletterConfirmation } from './newsletter-confirmation'
import { renderNewsletterWelcome } from './newsletter-welcome'

const branding = {
  legalName: 'Indus Hydraulic Power Trading LLC',
  registeredAddressLines: ['Office 310, Al Nahda Street', 'Dubai', 'United Arab Emirates'],
}

describe('newsletter confirmation email', () => {
  const confirmUrl = `https://indushydraulics.com/newsletter/confirm/${'a'.repeat(48)}`
  const email = renderNewsletterConfirmation({ confirmUrl, validityWindow: '14 days', branding })

  it('links the confirm page in both parts', () => {
    expect(email.html).toContain(confirmUrl)
    expect(email.text).toContain(confirmUrl)
  })

  it('carries the legal footer — name, address, why it was sent', () => {
    for (const part of [email.html, email.text]) {
      expect(part).toContain('Indus Hydraulic Power Trading LLC')
      expect(part).toContain('Al Nahda Street')
      expect(part).toMatch(/newsletter sign-up at indushydraulics\.com/)
    }
  })

  it('has no unsubscribe link: there is no subscription yet', () => {
    expect(email.html).not.toMatch(/Unsubscribe<\/a>/)
    expect(email.text).not.toMatch(/Unsubscribe:/)
  })
})

describe('newsletter welcome email', () => {
  const unsubscribeUrl = `https://indushydraulics.com/newsletter/unsubscribe/${'b'.repeat(48)}`
  const email = renderNewsletterWelcome({ unsubscribeUrl, siteUrl: 'https://indushydraulics.com', branding })

  it('links the permanent unsubscribe page in the body, the footer and the text part', () => {
    expect(email.html.split(unsubscribeUrl).length - 1).toBeGreaterThanOrEqual(2)
    expect(email.text).toContain(`Unsubscribe: ${unsubscribeUrl}`)
  })

  it('carries the legal footer', () => {
    for (const part of [email.html, email.text]) {
      expect(part).toContain('Indus Hydraulic Power Trading LLC')
      expect(part).toContain('United Arab Emirates')
    }
  })

  it('escapes what it interpolates', () => {
    const hostile = renderNewsletterWelcome({
      unsubscribeUrl: 'https://x.test/"><script>',
      siteUrl: 'https://indushydraulics.com',
      branding,
    })
    expect(hostile.html).not.toContain('<script>')
  })
})
