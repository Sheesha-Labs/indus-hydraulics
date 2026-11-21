import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { opsCookieNames, secureCookiesEnabled } from './lib/auth-cookies'
import { classify, isClientPage } from './lib/public-paths'
import { safeNextPath } from './lib/safe-next-path'
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

/**
 * Revoked sessions (Devices › Sign out). S03-T02 replaces this with a 60 s cache
 * over user_session; until then no session is revoked.
 */
export async function isSessionRevoked(_sid: string | undefined): Promise<boolean> {
  return false
}

async function hasOpsSession(request: NextRequest): Promise<boolean> {
  const secret = process.env.OPS_AUTH_SECRET
  if (!secret) return false
  const token = await getToken({
    req: request,
    secret,
    cookieName: SESSION_COOKIE,
    // Must equal cookieName: Auth.js uses the cookie name as the HKDF salt.
    salt: SESSION_COOKIE,
    secureCookie: SECURE,
  })
  if (!token?.sub || token.kind !== 'ops') return false
  return !(await isSessionRevoked(typeof token.sid === 'string' ? token.sid : undefined))
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
  if (isProtected && !(await hasOpsSession(request))) {
    if (kind === 'protected-api') {
      return done(NextResponse.json({ error: 'Sign in required' }, { status: 401 }))
    }
    const url = new URL('/sign-in', request.url)
    const next = safeNextPath(pathname + search)
    if (next && next !== '/') url.searchParams.set('next', next)
    return done(NextResponse.redirect(url, 307))
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
