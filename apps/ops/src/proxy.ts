import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { opsCookieNames, secureCookiesEnabled } from './lib/auth-cookies'
import { classify, isClientPage } from './lib/public-paths'
import { safeNextPath } from './lib/safe-next-path'
import { isSessionRevoked } from './lib/session-revocation'
import { buildHeaders } from './lib/security-headers'

/**
 * Default-deny proxy for both Ops surfaces (ADR-05, §2.4).
 *
 * Every path is protected unless lib/public-paths lists it, and each public route
 * verifies its own caller. Public routes never touch the database from here. A
 * protected request needs a verified Ops session token: cookie presence proves
 * nothing, so the JWT is decoded and its `kind` must be 'ops'.
 */
const SECURE = secureCookiesEnabled()
const SESSION_COOKIE = opsCookieNames(SECURE).session

type SessionState = 'ok' | 'none' | 'revoked'

/**
 * A verified Ops token whose `sid` is not revoked. Revocation is read from a 60 s in-memory set
 * (lib/session-revocation.ts): never one query per request. requireOpsUser re-checks the row on every
 * page and action, so a revocation the cache has not seen yet is still refused there.
 */
async function sessionState(request: NextRequest): Promise<SessionState> {
  const secret = process.env.OPS_AUTH_SECRET
  if (!secret) return 'none'
  const token = await getToken({
    req: request,
    secret,
    cookieName: SESSION_COOKIE,
    // Must equal cookieName: Auth.js uses the cookie name as the HKDF salt.
    salt: SESSION_COOKIE,
    secureCookie: SECURE,
  })
  if (!token?.sub || token.kind !== 'ops' || typeof token.sid !== 'string') return 'none'
  return (await isSessionRevoked(token.sid)) ? 'revoked' : 'ok'
}

function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: SECURE,
    maxAge: 0,
  })
  return res
}

function nonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const kind = classify(pathname, { appEnv: process.env.APP_ENV, opsKit: process.env.OPS_KIT })
  const n = nonce()
  const headers = buildHeaders({
    nonce: n,
    kind: isClientPage(pathname) ? 'client' : 'console',
    env: {
      supabaseUrl: process.env.SUPABASE_URL,
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      dev: process.env.NODE_ENV === 'development',
    },
  })
  const done = (res: NextResponse) => {
    for (const [name, value] of Object.entries(headers)) res.headers.set(name, value)
    return res
  }

  const isProtected = kind === 'protected-page' || kind === 'protected-api'
  const state = isProtected ? await sessionState(request) : 'ok'
  if (state === 'revoked') {
    // Signed out from Devices (or by the Owner): say so, and drop the cookie that no longer works.
    if (kind === 'protected-api') {
      return done(
        clearSessionCookie(NextResponse.json({ error: 'Sign in required' }, { status: 401 }))
      )
    }
    const url = new URL('/sign-in', request.url)
    url.searchParams.set('reason', 'session_revoked')
    return done(clearSessionCookie(NextResponse.redirect(url, 307)))
  }
  if (state === 'none') {
    if (kind === 'protected-api') {
      return done(NextResponse.json({ error: 'Sign in required' }, { status: 401 }))
    }
    const url = new URL('/sign-in', request.url)
    const next = safeNextPath(pathname + search)
    // A session cookie that no longer verifies is a session that ended (8 hours, board 77 "Session
    // ended"). Say so once: the stale cookie is cleared with the redirect.
    if (next && next !== '/') url.searchParams.set('next', next)
    const stale = request.cookies.has(SESSION_COOKIE)
    if (stale) url.searchParams.set('reason', 'session_ended')
    const res = NextResponse.redirect(url, 307)
    return done(stale ? clearSessionCookie(res) : res)
  }

  // Next.js reads the nonce from the request's CSP header and applies it to the
  // scripts it renders; pages can read x-nonce for their own.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', n)
  requestHeaders.set('Content-Security-Policy', headers['Content-Security-Policy']!)
  return done(NextResponse.next({ request: { headers: requestHeaders } }))
}

export const config = {
  // Only static assets skip the proxy. API routes are NOT exempted here: the
  // allowlist in lib/public-paths decides, path by path.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
