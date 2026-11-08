import { describe, expect, it } from 'vitest'
import {
  NEWSLETTER_CONSENT,
  isDotPaddedGmail,
  isNewsletterToken,
  maskEmail,
  newsletterSource,
  normaliseNewsletterEmail,
} from './newsletter'

describe('normaliseNewsletterEmail', () => {
  it('trims and lowercases', () => {
    expect(normaliseNewsletterEmail('  Buyer@Plant.AE  ')).toBe('buyer@plant.ae')
  })
})

describe('newsletterSource', () => {
  it('keeps a source the site renders', () => {
    expect(newsletterSource('blog_index')).toBe('blog_index')
  })
  it('defaults an empty source to the home tile', () => {
    expect(newsletterSource('')).toBe('homepage_footer')
    expect(newsletterSource(null)).toBe('homepage_footer')
  })
  it('records anything else as other, never the raw value', () => {
    expect(newsletterSource('<script>')).toBe('other')
    expect(newsletterSource('twitter')).toBe('other')
  })
})

describe('isDotPaddedGmail', () => {
  it('flags the list-bombing pattern', () => {
    expect(isDotPaddedGmail('j.o.h.n.smith@gmail.com')).toBe(true)
    expect(isDotPaddedGmail('a.b.c.d+x@googlemail.com')).toBe(true)
  })
  it('leaves real addresses alone', () => {
    expect(isDotPaddedGmail('john.smith@gmail.com')).toBe(false)
    expect(isDotPaddedGmail('first.middle.last@gmail.com')).toBe(false)
    expect(isDotPaddedGmail('j.o.h.n@company.com')).toBe(false)
    expect(isDotPaddedGmail('no-at-sign')).toBe(false)
  })
})

describe('isNewsletterToken', () => {
  it('accepts 48 lower-case hex characters only', () => {
    expect(isNewsletterToken('a'.repeat(48))).toBe(true)
    expect(isNewsletterToken('A'.repeat(48))).toBe(false)
    expect(isNewsletterToken('a'.repeat(47))).toBe(false)
    expect(isNewsletterToken(`${'a'.repeat(47)}'`)).toBe(false)
    expect(isNewsletterToken(undefined)).toBe(false)
  })
})

describe('maskEmail', () => {
  it('shows the first character and the domain', () => {
    expect(maskEmail('buyer@plant.ae')).toBe('b…@plant.ae')
  })
})

describe('NEWSLETTER_CONSENT', () => {
  it('names what is sent and how to leave', () => {
    expect(NEWSLETTER_CONSENT.text).toMatch(/newsletter/)
    expect(NEWSLETTER_CONSENT.text).toMatch(/privacy policy/)
    expect(NEWSLETTER_CONSENT.text).toMatch(/[Uu]nsubscribe/)
    expect(NEWSLETTER_CONSENT.version).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
