/**
 * Session-cookie identity for the two Auth.js instances.
 *
 * The storefront (customer) and admin (staff) surfaces are being merged onto a
 * single origin. Today they are kept apart only by living on different hosts,
 * which is not a property of the code — it is a property of the deployment.
 * This module makes the separation structural, so it survives the merge.
 *
 * ── Why the cookie NAME is load-bearing ────────────────────────────────────
 *
 * `@auth/core` uses `options.cookies.sessionToken.name` as the HKDF salt when
 * it derives the JWE encryption key (see `@auth/core/jwt.js`, called from
 * `lib/utils/session.js` and every encode/decode site):
 *
 *     hkdf('sha256', secret, salt = cookieName,
 *          `Auth.js Generated Encryption Key (${salt})`, 64)
 *
 * Two instances with different session-cookie names therefore derive different
 * keys **even under an identical secret**. A token minted by one is not
 * decryptable by the other: `jwtDecrypt` throws, and `auth()` returns null.
 *
 * That is a cryptographic fail-closed, not a check a future refactor can
 * forget to write. We pair it with distinct secrets anyway — defence in depth,
 * and it means neither property alone is doing all the work.
 *
 * ── Two invariants this module exists to hold ──────────────────────────────
 *
 * 1. Neither session-cookie name may be a prefix of the other. `SessionStore`
 *    reassembles chunked cookies by `name.startsWith(prefix)`, so a prefix
 *    relationship would let one store swallow the other's cookie as a chunk.
 * 2. Every cookie key must be named explicitly. `@auth/core` does
 *    `merge(defaultCookies(...), config.cookies)`, so any key omitted from the
 *    config silently keeps the shared Auth.js default name — and collides.
 *
 * Both are asserted in `auth-cookies.test.ts`.
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

/** Customer (storefront `account_contact`) session cookie. */
export const CUSTOMER_SESSION_COOKIE = `${PREFIX}indus.customer-session`

/**
 * A readable marker saying "a customer session cookie was present".
 *
 * The session cookie itself is httpOnly, so the browser cannot see whether
 * anyone is signed in — which is why the header asked `/api/me` on EVERY page
 * load, for every visitor including the anonymous majority. That is one
 * function invocation and one database lookup per pageview, sitewide, to be
 * told "signed out" almost every time.
 *
 * This carries no identity and grants nothing: it is a boolean hint, kept in
 * sync by the proxy, and every protected route still checks the real session
 * server-side. Deliberately NOT httpOnly — being readable from JavaScript is
 * the entire purpose.
 */
export const VIEWER_HINT_COOKIE = 'indus.viewer'

/** Staff (admin `staff_user`) session cookie. */
export const STAFF_SESSION_COOKIE = `${PREFIX}indus.staff-session`

/**
 * Auth.js cookie names that predate this split. Both surfaces used these
 * defaults with a shared `AUTH_SECRET`, which is exactly the combination that
 * would let a customer token decrypt as a staff session on one origin. They
 * are never accepted — only cleared, so stale copies stop confusing debugging.
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

export const customerCookies: AuthCookieConfig = {
  sessionToken: { name: CUSTOMER_SESSION_COOKIE, options: base('/') },
  callbackUrl: { name: `${PREFIX}indus.customer-callback`, options: base('/') },
  // Deliberately not `__Host-`: that prefix mandates Path=/ and would make the
  // staff counterpart unsettable once it moves to Path=/admin. `__Secure-`
  // still enforces https-only, and the double-submit CSRF pair is unaffected.
  csrfToken: { name: `${PREFIX}indus.customer-csrf`, options: base('/') },
  pkceCodeVerifier: { name: `${PREFIX}indus.customer-pkce`, options: { ...base('/api/auth'), maxAge: 900 } },
  state: { name: `${PREFIX}indus.customer-state`, options: { ...base('/api/auth'), maxAge: 900 } },
  nonce: { name: `${PREFIX}indus.customer-nonce`, options: base('/api/auth') },
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
 * Read a surface's signing secret, failing loudly when it is absent.
 *
 * Auth.js falls back to `process.env.AUTH_SECRET` when a config omits
 * `secret` (`next-auth/lib/env.js`: `config.secret ??= process.env.AUTH_SECRET`).
 * If that fallback ever fired for both surfaces they would share a secret
 * again, with no visible symptom. Throwing here means a missing value is a
 * build failure rather than a silent security regression.
 */
export function requireAuthSecret(name: 'CUSTOMER_AUTH_SECRET' | 'STAFF_AUTH_SECRET'): string {
  const value = process.env[name]
  if (!value || value.length < 32) {
    throw new Error(
      `${name} is missing or shorter than 32 characters. The customer and staff ` +
        `surfaces require two independently generated secrets — reusing one ` +
        `defeats the session isolation. Generate with: openssl rand -base64 32`,
    )
  }
  return value
}
