import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  opsCookieNames,
  opsCookieOptions,
  requireOpsSecret,
  secureCookiesEnabled,
} from './auth-cookies'

const WEBSITE_COOKIES = readFileSync(
  join(import.meta.dirname, '../../../../packages/domain/src/auth-cookies.ts'),
  'utf8'
)

describe('Ops cookies', () => {
  it('names all six Auth.js cookies explicitly', () => {
    const options = opsCookieOptions(true)
    expect(Object.keys(options).sort()).toEqual(
      ['callbackUrl', 'csrfToken', 'nonce', 'pkceCodeVerifier', 'sessionToken', 'state'].sort()
    )
    for (const option of Object.values(options)) expect(option.name).toMatch(/indus\.ops-/)
  })

  it('uses __Host- for session and CSRF on HTTPS, no prefix on local http', () => {
    expect(opsCookieNames(true).session).toBe('__Host-indus.ops-session')
    expect(opsCookieNames(true).csrf).toBe('__Host-indus.ops-csrf')
    expect(opsCookieNames(true).state).toBe('__Secure-indus.ops-state')
    expect(opsCookieNames(false).session).toBe('indus.ops-session')
  })

  it('never sets a Domain attribute, and is secure exactly on HTTPS', () => {
    for (const secure of [true, false]) {
      for (const option of Object.values(opsCookieOptions(secure))) {
        expect(option.options).not.toHaveProperty('domain')
        expect(option.options.secure).toBe(secure)
        expect(option.options.httpOnly).toBe(true)
        expect(option.options.path).toBe('/')
      }
    }
  })

  it('never reuses a website cookie name', () => {
    for (const secure of [true, false]) {
      for (const name of Object.values(opsCookieNames(secure))) {
        const bare = name.replace(/^__(Host|Secure)-/, '')
        expect(WEBSITE_COOKIES).not.toContain(bare)
      }
    }
  })

  it('treats only an https base URL as secure', () => {
    expect(secureCookiesEnabled('https://operations.example.test')).toBe(true)
    expect(secureCookiesEnabled('http://localhost:3100')).toBe(false)
    expect(secureCookiesEnabled('')).toBe(false)
  })

  it('refuses a missing or short secret without echoing it', () => {
    expect(() => requireOpsSecret(undefined)).toThrow('OPS_AUTH_SECRET')
    expect(() => requireOpsSecret('short-secret')).toThrow(/^OPS_AUTH_SECRET is missing/)
    expect(requireOpsSecret('x'.repeat(32))).toHaveLength(32)
  })
})
