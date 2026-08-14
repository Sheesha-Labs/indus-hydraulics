import { describe, expect, test } from 'vitest'
import {
  CUSTOMER_SESSION_COOKIE,
  LEGACY_SESSION_COOKIES,
  STAFF_SESSION_COOKIE,
  customerCookies,
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

describe('auth cookie isolation', () => {
  test('the two session cookies have different names', () => {
    // The name is the HKDF salt. Same name => same derived key => a customer
    // token decrypts as a staff session.
    expect(CUSTOMER_SESSION_COOKIE).not.toBe(STAFF_SESSION_COOKIE)
  })

  test('neither session cookie name is a prefix of the other', () => {
    // SessionStore reassembles chunked cookies by `name.startsWith(prefix)`,
    // so a prefix relationship lets one store swallow the other's cookie.
    expect(CUSTOMER_SESSION_COOKIE.startsWith(STAFF_SESSION_COOKIE)).toBe(false)
    expect(STAFF_SESSION_COOKIE.startsWith(CUSTOMER_SESSION_COOKIE)).toBe(false)
  })

  test('every cookie key is named explicitly on both surfaces', () => {
    // @auth/core does merge(defaultCookies(), config.cookies) — an omitted key
    // silently keeps the shared Auth.js default name and collides.
    for (const key of ALL_KEYS) {
      expect(customerCookies[key]?.name, `customer.${key}`).toBeTruthy()
      expect(staffCookies[key]?.name, `staff.${key}`).toBeTruthy()
    }
  })

  test('no cookie name is shared between the two surfaces', () => {
    const customer = ALL_KEYS.map((k) => customerCookies[k].name)
    const staff = ALL_KEYS.map((k) => staffCookies[k].name)
    expect(customer.filter((n) => staff.includes(n))).toEqual([])
  })

  test('no cookie keeps an Auth.js default name', () => {
    const names = [...ALL_KEYS.map((k) => customerCookies[k].name), ...ALL_KEYS.map((k) => staffCookies[k].name)]
    expect(names.filter((n) => n.includes('authjs.') || n.includes('next-auth.'))).toEqual([])
  })

  test('no cookie uses the __Host- prefix', () => {
    // __Host- mandates Path=/, which would make the staff cookies unsettable
    // once they scope to /admin. Browsers reject the mismatch silently.
    const names = [...ALL_KEYS.map((k) => customerCookies[k].name), ...ALL_KEYS.map((k) => staffCookies[k].name)]
    expect(names.filter((n) => n.startsWith('__Host-'))).toEqual([])
  })

  test('all cookies are httpOnly and lax', () => {
    for (const key of ALL_KEYS) {
      for (const [surface, cfg] of [
        ['customer', customerCookies],
        ['staff', staffCookies],
      ] as const) {
        expect(cfg[key].options.httpOnly, `${surface}.${key}.httpOnly`).toBe(true)
        expect(cfg[key].options.sameSite, `${surface}.${key}.sameSite`).toBe('lax')
      }
    }
  })

  test('legacy Auth.js cookie names are listed for clearing, never reused', () => {
    const live = [...ALL_KEYS.map((k) => customerCookies[k].name), ...ALL_KEYS.map((k) => staffCookies[k].name)]
    for (const legacy of LEGACY_SESSION_COOKIES) {
      expect(live, `${legacy} must not be reused`).not.toContain(legacy)
    }
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
