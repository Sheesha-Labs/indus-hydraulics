import { describe, expect, it } from 'vitest'
import { clientIp } from './request-origin'

/**
 * `clientIp` decides who gets rate-limited. Its ordering is the security
 * property, so each rule is pinned rather than left to a future tidy-up.
 *
 * The bug this replaces read the FIRST `x-forwarded-for` hop, which is
 * whatever the caller sent — so the per-IP limit on the unauthenticated upload
 * signer could be reset by changing a header.
 */
const h = (values: Record<string, string>) => new Headers(values)

describe('clientIp', () => {
  it('prefers cf-connecting-ip over everything else', () => {
    // Cloudflare sets this itself and a client cannot forge it through them.
    expect(
      clientIp(h({ 'cf-connecting-ip': '203.0.113.7', 'x-forwarded-for': '10.0.0.1', 'x-real-ip': '10.0.0.2' })),
    ).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip when Cloudflare is not in front', () => {
    expect(clientIp(h({ 'x-real-ip': '198.51.100.4', 'x-forwarded-for': '10.0.0.1' }))).toBe('198.51.100.4')
  })

  it('takes the LAST x-forwarded-for hop, not the first', () => {
    // The whole point. The first entry is caller-supplied; the last is what our
    // own proxy appended.
    expect(clientIp(h({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 198.51.100.9' }))).toBe('198.51.100.9')
  })

  it('cannot be steered by a forged first hop', () => {
    const forged = clientIp(h({ 'x-forwarded-for': 'not-an-ip-i-chose, 198.51.100.9' }))
    expect(forged).toBe('198.51.100.9')
    expect(forged).not.toBe('not-an-ip-i-chose')
  })

  it('gives every request the same bucket when there is no usable address', () => {
    // Degrades to one shared limit rather than to none — a proxy
    // misconfiguration must not silently disable rate limiting.
    expect(clientIp(h({}))).toBe('unknown')
    expect(clientIp(h({ 'x-forwarded-for': '  ,  ' }))).toBe('unknown')
  })

  it('trims whitespace around a single value', () => {
    expect(clientIp(h({ 'cf-connecting-ip': '  203.0.113.7  ' }))).toBe('203.0.113.7')
  })
})
