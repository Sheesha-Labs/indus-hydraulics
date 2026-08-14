import { describe, expect, test } from 'vitest'
import { scrubUrl } from './scrub-url'

const sp = (s: string) => new URLSearchParams(s)

describe('scrubUrl', () => {
  test('strips the quote-access token', () => {
    // The exact leak: a 60-day bearer credential shipped to PostHog as $current_url.
    expect(scrubUrl('/quote/RFQ-2026-0001', sp('token=abc.def'))).toBe('/quote/RFQ-2026-0001')
  })

  test('strips the product-preview token', () => {
    expect(scrubUrl('/p/ih-ap71', sp('preview=xyz.sig'))).toBe('/p/ih-ap71')
  })

  test('keeps the parameters analytics exists to measure', () => {
    expect(scrubUrl('/search', sp('q=pump&page=2&sort=relevance'))).toBe('/search?q=pump&page=2&sort=relevance')
    expect(scrubUrl('/', sp('utm_source=linkedin&utm_campaign=launch'))).toBe(
      '/?utm_source=linkedin&utm_campaign=launch',
    )
  })

  test('strips only the sensitive params when mixed', () => {
    expect(scrubUrl('/quote/RFQ-1', sp('token=secret&utm_source=email'))).toBe('/quote/RFQ-1?utm_source=email')
  })

  test('strips every repeat of a sensitive param', () => {
    expect(scrubUrl('/quote/RFQ-1', sp('token=a&token=b&q=x'))).toBe('/quote/RFQ-1?q=x')
  })

  test('drops the "?" when nothing survives', () => {
    expect(scrubUrl('/quote/RFQ-1', sp('token=secret'))).toBe('/quote/RFQ-1')
  })

  test('handles no query string at all', () => {
    expect(scrubUrl('/about', sp(''))).toBe('/about')
    expect(scrubUrl('/about', null)).toBe('/about')
    expect(scrubUrl('/about', undefined)).toBe('/about')
  })

  test('does not mutate the caller-supplied params', () => {
    const params = sp('token=secret&q=pump')
    scrubUrl('/quote/RFQ-1', params)
    expect(params.get('token')).toBe('secret')
  })
})
