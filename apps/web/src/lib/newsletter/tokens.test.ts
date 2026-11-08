import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { isNewsletterToken } from '@indus/domain'
import { generateNewsletterToken, hashNewsletterToken, newsletterEmailHash, recipientAddress } from './tokens'
import {
  listUnsubscribeHeaders,
  newsletterConfirmUrl,
  newsletterOneClickUrl,
  newsletterUnsubscribePageUrl,
} from './links'

describe('generateNewsletterToken', () => {
  it('produces the 48-hex shape the routes accept', () => {
    expect(isNewsletterToken(generateNewsletterToken())).toBe(true)
  })
  it('never repeats', () => {
    const seen = new Set(Array.from({ length: 50 }, generateNewsletterToken))
    expect(seen.size).toBe(50)
  })
})

describe('hashNewsletterToken', () => {
  it('is a 64-hex SHA-256 that differs from the token', () => {
    const token = generateNewsletterToken()
    const hash = hashNewsletterToken(token)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).not.toContain(token)
  })
})

describe('newsletterEmailHash', () => {
  it('matches SQL newsletter_email_hash(): sha256(lower(trim(email))) as hex', () => {
    const expected = createHash('sha256').update('buyer@plant.ae').digest('hex')
    expect(newsletterEmailHash('  Buyer@Plant.AE ')).toBe(expected)
  })
})

describe('recipientAddress', () => {
  it('reads bare and display-name forms', () => {
    expect(recipientAddress('A@B.co')).toBe('a@b.co')
    expect(recipientAddress('Plant Buyer <Buyer@Plant.ae>')).toBe('buyer@plant.ae')
  })
  it('refuses something that is not an address', () => {
    expect(recipientAddress('nobody')).toBeNull()
  })
})

describe('newsletter links', () => {
  const t = 'c'.repeat(48)
  it('builds every URL from the base without double slashes', () => {
    expect(newsletterConfirmUrl('https://indushydraulics.com/', t)).toBe(`https://indushydraulics.com/newsletter/confirm/${t}`)
    expect(newsletterUnsubscribePageUrl('https://indushydraulics.com', t)).toBe(
      `https://indushydraulics.com/newsletter/unsubscribe/${t}`,
    )
    expect(newsletterOneClickUrl('https://indushydraulics.com', t)).toBe(
      `https://indushydraulics.com/api/newsletter/unsubscribe?token=${t}`,
    )
  })
  it('emits the RFC 8058 header pair', () => {
    const h = listUnsubscribeHeaders('https://indushydraulics.com', t)
    expect(h['List-Unsubscribe']).toBe(`<https://indushydraulics.com/api/newsletter/unsubscribe?token=${t}>`)
    expect(h['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
  })
})
