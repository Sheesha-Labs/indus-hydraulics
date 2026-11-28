import { describe, expect, it } from 'vitest'
import { classify, isClientPage, normalisePath, type PathKind } from './public-paths'

const CASES: Array<[string, PathKind]> = [
  // Auth pages: one prefix covers every sign-in screen.
  ['/sign-in', 'public-page'],
  ['/sign-in/forgot', 'public-page'],
  ['/sign-in/reset/abc123', 'public-page'],
  ['/sign-in/invite/tok', 'public-page'],
  ['/sign-in/two-factor', 'public-page'],
  // Client document pages: the route checks the signed token itself.
  ['/q/tok', 'public-page'],
  ['/d/tok', 'public-page'],
  ['/s/tok', 'public-page'],
  ['/u/tok', 'public-page'],
  // Public APIs that verify their own caller.
  ['/api/auth/callback/google', 'public-api'],
  ['/api/auth/session', 'public-api'],
  ['/api/files/abc', 'public-api'],
  ['/api/inngest', 'public-api'],
  ['/api/gmail/push', 'public-api'],
  ['/api/zoho/webhook', 'public-api'],
  ['/api/webhooks/resend', 'public-api'],
  ['/api/health/live', 'public-api'],
  // Static.
  ['/robots.txt', 'static'],
  ['/favicon.ico', 'static'],
  ['/_next/static/chunks/main.js', 'static'],
  ['/_next/image', 'static'],
  // Protected console pages.
  ['/', 'protected-page'],
  ['/today', 'protected-page'],
  ['/review', 'protected-page'],
  ['/enquiries/ENQ-2026-0001', 'protected-page'],
  ['/settings/team', 'protected-page'],
  // Protected APIs.
  ['/api/health', 'protected-api'],
  ['/api', 'protected-api'],
  ['/api/files', 'public-api'],
  // Traps: substrings and look-alikes are protected.
  ['/sign-inx', 'protected-page'],
  ['/sign-in-evil', 'protected-page'],
  ['/qa', 'protected-page'],
  ['/quotations', 'protected-page'],
  ['/data', 'protected-page'],
  ['/suppliers', 'protected-page'],
  ['/users', 'protected-page'],
  ['/api/inngestx', 'protected-api'],
  ['/api/inngest/../health', 'protected-api'],
  ['/api/health/live/extra', 'protected-api'],
  ['/api/authx', 'protected-api'],
  ['/robots.txt/x', 'protected-page'],
  // Traps: encoded slashes and dot segments are normalised first.
  ['/q/..%2Ftoday', 'protected-page'],
  ['/sign-in/%2e%2e/today', 'protected-page'],
  ['/sign-in/../settings', 'protected-page'],
  ['/q%2F..%2Ftoday', 'protected-page'],
  ['//sign-in', 'public-page'],
  ['/./today', 'protected-page'],
  ['/sign-in\\..\\today', 'protected-page'],
]

describe('classify', () => {
  it('covers at least 40 cases', () => {
    expect(CASES.length).toBeGreaterThanOrEqual(40)
  })

  for (const [path, kind] of CASES) {
    it(`${path} is ${kind}`, () => {
      expect(classify(path)).toBe(kind)
    })
  }

  it('opens /_kit only outside production with OPS_KIT=1', () => {
    expect(classify('/_kit', { appEnv: 'local', opsKit: '1' })).toBe('kit')
    expect(classify('/_kit/controls', { appEnv: 'preview', opsKit: '1' })).toBe('kit')
    expect(classify('/_kit', { appEnv: 'production', opsKit: '1' })).toBe('protected-page')
    expect(classify('/_kit', { appEnv: 'local' })).toBe('protected-page')
    // S11-T03: the kit's document PDFs, gated the same way.
    expect(classify('/api/kit/documents/oa/pdf', { appEnv: 'local', opsKit: '1' })).toBe('kit')
    expect(classify('/api/kit/documents/oa/pdf', { appEnv: 'production', opsKit: '1' })).toBe(
      'protected-api'
    )
    expect(classify('/api/kit/documents/oa/pdf', { appEnv: 'local' })).toBe('protected-api')
    expect(classify('/_kitx', { appEnv: 'local', opsKit: '1' })).toBe('protected-page')
  })
})

describe('normalisePath', () => {
  it('resolves dot segments, encodings and backslashes', () => {
    expect(normalisePath('/a/./b/../c')).toBe('/a/c')
    expect(normalisePath('/q/..%2Ftoday')).toBe('/today')
    expect(normalisePath('/%252e%252e/x')).toBe('/x')
    expect(normalisePath('/a\\b')).toBe('/a/b')
  })
})

describe('isClientPage', () => {
  it('matches only the four document prefixes', () => {
    expect(isClientPage('/q/tok')).toBe(true)
    expect(isClientPage('/u/tok')).toBe(true)
    expect(isClientPage('/quotations')).toBe(false)
    expect(isClientPage('/today')).toBe(false)
  })
})
