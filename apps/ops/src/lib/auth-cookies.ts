/**
 * Cookies for the Ops Auth.js instance (ADR-05).
 *
 * Every cookie is named explicitly, so none can collide with the website admin's
 * (`indus.staff-*`) or inherit an Auth.js default. The session cookie name is
 * also the JWT salt: proxy.ts decodes with cookieName === salt === this name, and
 * lib/auth.ts issues with it. They must agree or every request looks signed out.
 *
 * `__Host-` and `__Secure-` require HTTPS, so plain-http local development uses
 * the same names without the prefix. No cookie ever carries a Domain attribute:
 * a `__Host-` cookie cannot, and the others must not reach indushydraulics.com.
 */
export function secureCookiesEnabled(
  baseUrl = process.env.NEXT_PUBLIC_OPS_BASE_URL ?? ''
): boolean {
  return baseUrl.startsWith('https://')
}

export function opsCookieNames(secure: boolean) {
  const host = secure ? '__Host-' : ''
  const sec = secure ? '__Secure-' : ''
  return {
    session: `${host}indus.ops-session`,
    csrf: `${host}indus.ops-csrf`,
    callbackUrl: `${sec}indus.ops-callback`,
    pkce: `${sec}indus.ops-pkce`,
    state: `${sec}indus.ops-state`,
    nonce: `${sec}indus.ops-nonce`,
  } as const
}

type CookieOption = {
  name: string
  options: { httpOnly: true; sameSite: 'lax'; path: '/'; secure: boolean }
}

/** The six cookies Auth.js may set, in its config shape. */
export function opsCookieOptions(
  secure: boolean
): Record<
  'sessionToken' | 'csrfToken' | 'callbackUrl' | 'pkceCodeVerifier' | 'state' | 'nonce',
  CookieOption
> {
  const names = opsCookieNames(secure)
  const options = { httpOnly: true, sameSite: 'lax', path: '/', secure } as const
  return {
    sessionToken: { name: names.session, options },
    csrfToken: { name: names.csrf, options },
    callbackUrl: { name: names.callbackUrl, options },
    pkceCodeVerifier: { name: names.pkce, options },
    state: { name: names.state, options },
    nonce: { name: names.nonce, options },
  }
}

export const OPS_SESSION_COOKIE = opsCookieNames(secureCookiesEnabled()).session

/** The Ops JWT secret. Separate from the website's STAFF_AUTH_SECRET. */
export function requireOpsSecret(value = process.env.OPS_AUTH_SECRET): string {
  if (!value || value.length < 32) {
    throw new Error('OPS_AUTH_SECRET is missing or shorter than 32 characters')
  }
  return value
}
