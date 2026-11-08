/**
 * Session-cookie identity for the staff (admin) Auth.js instance.
 *
 * Until 2026-11 the app ran two Auth.js instances on one origin — customer
 * (storefront `account_contact`) and staff (admin `staff_user`) — and this
 * module kept them cryptographically apart. Customer accounts have since been
 * removed; only the staff instance remains. The customer cookie names are kept
 * in LEGACY_SESSION_COOKIES so the proxy clears stale copies.
 *
 * ── Why the cookie NAME is still load-bearing ──────────────────────────────
 *
 * `@auth/core` uses `options.cookies.sessionToken.name` as the HKDF salt when
 * it derives the JWE encryption key (see `@auth/core/jwt.js`, called from
 * `lib/utils/session.js` and every encode/decode site):
 *
 *     hkdf('sha256', secret, salt = cookieName,
 *          `Auth.js Generated Encryption Key (${salt})`, 64)
 *
 * The proxy's `getToken` call must pass the same name as `cookieName` AND
 * `salt`, or every staff token fails to decrypt and admin is unreachable.
 *
 * ── Invariant this module exists to hold ───────────────────────────────────
 *
 * Every cookie key must be named explicitly. `@auth/core` does
 * `merge(defaultCookies(...), config.cookies)`, so any key omitted from the
 * config silently keeps the shared Auth.js default name — one of the legacy
 * names below, which the proxy deletes on every response.
 *
 * Asserted in `auth-cookies.test.ts`.
 */

/**
 * `__Secure-` is rejected by browsers over plain http, so the prefix has to
 * track the actual scheme. Vercel (production and preview) is always https
 * with NODE_ENV=production; local dev is http.
 */
export const USE_SECURE_COOKIES = process.env.NODE_ENV === 'production'

const PREFIX = USE_SECURE_COOKIES ? '__Secure-' : ''

/**
 * Path the staff cookies are scoped to.
 *
 * Currently '/' because the admin app still serves its own routes from the
 * origin root. When the admin route tree moves under `/admin` this becomes
 * `/admin`, and the browser stops sending staff cookies to storefront routes
 * at all. RFC 6265 §5.1.4 path-matching is segment-safe: `/admin` matches
 * `/admin` and `/admin/...` but not `/administrator`.
 */
export const STAFF_COOKIE_PATH = '/'

/** Staff (admin `staff_user`) session cookie. */
export const STAFF_SESSION_COOKIE = `${PREFIX}indus.staff-session`

/**
 * Cookie names no code reads any more. Never accepted — only cleared by the
 * proxy, so stale copies stop confusing debugging.
 *
 * - The Auth.js defaults that predate the customer/staff split.
 * - The retired customer-session family and the readable "viewer" hint that
 *   went with it (customer accounts were removed in 2026-11). Only the cookies
 *   scoped to Path=/ are listed; the /api/auth-scoped PKCE/state/nonce
 *   cookies were never issued by a credentials-only instance.
 */
export const LEGACY_SESSION_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'authjs.callback-url',
  '__Secure-authjs.callback-url',
  'authjs.csrf-token',
  '__Host-authjs.csrf-token',
  `${PREFIX}indus.customer-session`,
  `${PREFIX}indus.customer-callback`,
  `${PREFIX}indus.customer-csrf`,
  'indus.viewer',
] as const

/** Structural mirror of Auth.js's cookie option shape, so this package stays dependency-free. */
export type AuthCookieOption = {
  name: string
  options: {
    httpOnly: boolean
    sameSite: 'lax'
    path: string
    secure: boolean
    maxAge?: number
  }
}

export type AuthCookieConfig = {
  sessionToken: AuthCookieOption
  callbackUrl: AuthCookieOption
  csrfToken: AuthCookieOption
  pkceCodeVerifier: AuthCookieOption
  state: AuthCookieOption
  nonce: AuthCookieOption
}

function base(path: string) {
  return { httpOnly: true, sameSite: 'lax' as const, path, secure: USE_SECURE_COOKIES }
}

export const staffCookies: AuthCookieConfig = {
  sessionToken: { name: STAFF_SESSION_COOKIE, options: base(STAFF_COOKIE_PATH) },
  callbackUrl: { name: `${PREFIX}indus.staff-callback`, options: base(STAFF_COOKIE_PATH) },
  csrfToken: { name: `${PREFIX}indus.staff-csrf`, options: base(STAFF_COOKIE_PATH) },
  // Credentials-only surface, so these are never issued. Named anyway, so that
  // adding an OAuth provider later cannot silently inherit a shared default.
  pkceCodeVerifier: { name: `${PREFIX}indus.staff-pkce`, options: { ...base(STAFF_COOKIE_PATH), maxAge: 900 } },
  state: { name: `${PREFIX}indus.staff-state`, options: { ...base(STAFF_COOKIE_PATH), maxAge: 900 } },
  nonce: { name: `${PREFIX}indus.staff-nonce`, options: base(STAFF_COOKIE_PATH) },
}

/**
 * Read the staff signing secret, failing loudly when it is absent.
 *
 * Auth.js falls back to `process.env.AUTH_SECRET` when a config omits
 * `secret` (`next-auth/lib/env.js`: `config.secret ??= process.env.AUTH_SECRET`),
 * and the proxy's `getToken` needs the identical value. Throwing here means a
 * missing or weak value is a build failure rather than an admin that silently
 * cannot verify its own sessions.
 */
export function requireAuthSecret(name: 'STAFF_AUTH_SECRET'): string {
  const value = process.env[name]
  if (!value || value.length < 32) {
    throw new Error(
      `${name} is missing or shorter than 32 characters. ` +
        `Generate with: openssl rand -base64 32`,
    )
  }
  return value
}
