import { describe, expect, it } from 'vitest'
import { buildCsp, buildHeaders } from './security-headers'

const ENV = {
  supabaseUrl: 'https://abcd.supabase.co',
  sentryDsn: 'https://key@o123.ingest.sentry.io/456',
}

describe('buildHeaders', () => {
  it('sets the headers every response carries', () => {
    for (const kind of ['console', 'client'] as const) {
      const h = buildHeaders({ nonce: 'n1', kind, env: ENV })
      expect(h['X-Robots-Tag']).toBe('noindex, nofollow, noarchive, nosnippet')
      expect(h['X-Frame-Options']).toBe('DENY')
      expect(h['X-Content-Type-Options']).toBe('nosniff')
      expect(h['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains; preload')
      expect(h['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()')
      expect(h['Content-Security-Policy']).toContain("'nonce-n1'")
    }
  })

  it('console pages: Supabase and Sentry in connect-src, normal referrer, cacheable by Next', () => {
    const h = buildHeaders({ nonce: 'n1', kind: 'console', env: ENV })
    const csp = h['Content-Security-Policy']!
    expect(csp).toContain(
      "connect-src 'self' https://abcd.supabase.co https://o123.ingest.sentry.io"
    )
    expect(csp).toContain("script-src 'self' 'nonce-n1' 'strict-dynamic'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("form-action 'self' https://accounts.google.com")
    expect(csp).not.toContain('unsafe-eval')
    expect(h['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(h['Cache-Control']).toBeUndefined()
  })

  it('client pages: no Supabase connect, no referrer, never cached', () => {
    const h = buildHeaders({ nonce: 'n2', kind: 'client', env: ENV })
    expect(h['Content-Security-Policy']).toContain(
      "connect-src 'self' https://o123.ingest.sentry.io"
    )
    expect(h['Content-Security-Policy']).not.toContain(
      "connect-src 'self' https://abcd.supabase.co"
    )
    expect(h['Referrer-Policy']).toBe('no-referrer')
    expect(h['Cache-Control']).toBe('private, no-store')
  })

  it('allows eval only in development, and drops upgrade-insecure-requests there', () => {
    expect(buildCsp('n', 'console', { dev: true })).toContain("'unsafe-eval'")
    expect(buildCsp('n', 'console', { dev: true })).not.toContain('upgrade-insecure-requests')
    expect(buildCsp('n', 'console', {})).toContain('upgrade-insecure-requests')
  })

  it('ignores malformed Supabase and Sentry values rather than emitting them', () => {
    const csp = buildCsp('n', 'console', { supabaseUrl: 'not a url', sentryDsn: '::' })
    expect(csp).toContain("connect-src 'self';")
  })
})
