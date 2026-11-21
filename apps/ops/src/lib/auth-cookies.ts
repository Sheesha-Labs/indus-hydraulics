/**
 * Cookie names for the Ops Auth.js instance (ADR-05). Named explicitly so they
 * can never collide with the website admin's cookies, and the session cookie
 * name doubles as the JWT salt in proxy.ts and lib/auth.ts — they must agree.
 *
 * `__Host-` and `__Secure-` prefixes require HTTPS, so local development on
 * http://localhost uses the same names without the prefix.
 */
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

/** Secure cookies everywhere except plain-http local development. */
export function secureCookiesEnabled(
  baseUrl = process.env.NEXT_PUBLIC_OPS_BASE_URL ?? ''
): boolean {
  return baseUrl.startsWith('https://')
}
