import { describe, expect, test } from 'vitest'
import {
  LEGACY_SESSION_COOKIES,
  STAFF_SESSION_COOKIE,
  requireAuthSecret,
  staffCookies,
  type AuthCookieConfig,
} from './auth-cookies'

const ALL_KEYS: (keyof AuthCookieConfig)[] = [
  'sessionToken',
  'callbackUrl',
  'csrfToken',
  'pkceCodeVerifier',
  'state',
  'nonce',
]

describe('staff auth cookies', () => {
  test('every cookie key is named explicitly', () => {
    // @auth/core does merge(defaultCookies(), config.cookies) — an omitted key
    // silently keeps the shared Auth.js default name.
    for (const key of ALL_KEYS) {
      expect(staffCookies[key]?.name, `staff.${key}`).toBeTruthy()
    }
  })

  test('the session cookie is the one the proxy decrypts with', () => {
    // The name is the HKDF salt; proxy.ts passes STAFF_SESSION_COOKIE as both
    // cookieName and salt.
    expect(staffCookies.sessionToken.name).toBe(STAFF_SESSION_COOKIE)
  })

  test('no cookie keeps an Auth.js default name', () => {
    const names = ALL_KEYS.map((k) => staffCookies[k].name)
    expect(names.filter((n) => n.includes('authjs.') || n.includes('next-auth.'))).toEqual([])
  })

  test('no cookie uses the __Host- prefix', () => {
    // __Host- mandates Path=/, which would make the staff cookies unsettable
    // once they scope to /admin. Browsers reject the mismatch silently.
    const names = ALL_KEYS.map((k) => staffCookies[k].name)
    expect(names.filter((n) => n.startsWith('__Host-'))).toEqual([])
  })

  test('all cookies are httpOnly and lax', () => {
    for (const key of ALL_KEYS) {
      expect(staffCookies[key].options.httpOnly, `staff.${key}.httpOnly`).toBe(true)
      expect(staffCookies[key].options.sameSite, `staff.${key}.sameSite`).toBe('lax')
    }
  })

  test('legacy cookie names are listed for clearing, never reused', () => {
    // The proxy deletes every legacy name on every response, so reusing one
    // for a live cookie would sign every staff member out on each request.
    const live = ALL_KEYS.map((k) => staffCookies[k].name)
    for (const legacy of LEGACY_SESSION_COOKIES) {
      expect(live, `${legacy} must not be reused`).not.toContain(legacy)
    }
  })

  test('the retired customer session cookie is cleared', () => {
    expect(LEGACY_SESSION_COOKIES.some((n) => n.endsWith('indus.customer-session'))).toBe(true)
  })
})

describe('requireAuthSecret', () => {
  const KEY = 'STAFF_AUTH_SECRET' as const

  test('throws when the secret is absent', () => {
    const prev = process.env[KEY]
    delete process.env[KEY]
    expect(() => requireAuthSecret(KEY)).toThrow(/missing or shorter than 32/)
    if (prev !== undefined) process.env[KEY] = prev
  })

  test('throws when the secret is too short to be a real key', () => {
    const prev = process.env[KEY]
    process.env[KEY] = 'short'
    expect(() => requireAuthSecret(KEY)).toThrow(/missing or shorter than 32/)
    if (prev === undefined) delete process.env[KEY]
    else process.env[KEY] = prev
  })

  test('returns the value when it is long enough', () => {
    const prev = process.env[KEY]
    process.env[KEY] = 'x'.repeat(44)
    expect(requireAuthSecret(KEY)).toBe('x'.repeat(44))
    if (prev === undefined) delete process.env[KEY]
    else process.env[KEY] = prev
  })
})
