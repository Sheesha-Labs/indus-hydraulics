import { expect, test } from '@playwright/test'

/**
 * The proxy is default-deny: every protected path bounces to sign-in (pages) or
 * 401s (APIs), every allowlisted path gets through to its own route, and every
 * response is noindex with a nonce CSP.
 */
const PROTECTED_PAGES = [
  '/',
  '/today',
  '/enquiries/ENQ-2026-0001',
  '/settings/team',
  '/_kit',
  '/sign-inx',
  '/qa',
]
const PROTECTED_APIS = ['/api/health', '/api/enquiries', '/api/inngestx']
const PUBLIC = [
  '/sign-in',
  '/sign-in/forgot',
  '/q/example-token',
  '/d/example-token',
  '/s/example-token',
  '/u/example-token',
  '/api/auth/session',
  '/api/inngest',
  '/api/gmail/push',
  '/api/zoho/webhook',
  '/api/webhooks/resend',
  '/api/health/live',
  '/api/files/example',
  '/robots.txt',
]

function expectHardened(headers: Record<string, string>) {
  expect(headers['x-robots-tag']).toContain('noindex')
  expect(headers['content-security-policy']).toMatch(/'nonce-[A-Za-z0-9+/=]+'/)
  expect(headers['x-frame-options']).toBe('DENY')
}

test.describe('proxy', () => {
  for (const path of PROTECTED_PAGES) {
    test(`${path} redirects to sign-in with next preserved`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 })
      expect(res.status()).toBe(307)
      const location = new URL(res.headers()['location']!, 'http://x')
      expect(location.pathname).toBe('/sign-in')
      if (path !== '/') expect(location.searchParams.get('next')).toBe(path)
      expectHardened(res.headers())
    })
  }

  for (const path of PROTECTED_APIS) {
    test(`${path} answers 401`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 })
      expect(res.status()).toBe(401)
      expect(await res.json()).toEqual({ error: 'Sign in required' })
      expectHardened(res.headers())
    })
  }

  for (const path of PUBLIC) {
    test(`${path} is let through`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 })
      // The route itself may 404/405 until it exists; the proxy must not block it.
      expect(res.status()).not.toBe(401)
      if (res.status() === 307) {
        expect(new URL(res.headers()['location']!, 'http://x').pathname).not.toBe('/sign-in')
      }
      expectHardened(res.headers())
    })
  }

  test('client document pages send no referrer', async ({ request }) => {
    const res = await request.get('/q/example-token', { maxRedirects: 0 })
    expect(res.headers()['referrer-policy']).toBe('no-referrer')
    // Cache-Control: private, no-store is unit-tested in security-headers.test.ts.
    // Next.js sets its own Cache-Control on a 404, and /q/[token] is a 404 until
    // S18 builds it; that sprint's e2e asserts no-store on a real document page.
  })

  test('robots.txt disallows everything', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(await res.text()).toContain('Disallow: /')
  })
})
