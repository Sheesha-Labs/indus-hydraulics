import {
  CUSTOMER_SESSION_COOKIE,
  LEGACY_SESSION_COOKIES,
  STAFF_SESSION_COOKIE,
  USE_SECURE_COOKIES,
  requireAuthSecret,
} from '@indus/domain'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { isStaffRole } from './lib/rbac'

/**
 * One middleware, two surfaces.
 *
 * Storefront paths are an ALLOWLIST — only /account requires a session.
 * Admin paths are a DENYLIST — everything under /admin requires a staff
 * session except two paths. The two surfaces also need different security
 * headers, which on a shared origin can no longer be a per-app constant.
 */

const ADMIN_PREFIX = '/admin'

/** The only two paths under /admin reachable without a staff session. */
const ADMIN_PUBLIC_PATHS = ['/admin/sign-in', '/admin/api/auth']

/** Storefront paths requiring a customer session. */
const PROTECTED_ACCOUNT_PATHS = ['/account']

/** RFC 6265 §5.1.4-style segment match: /admin matches /admin and /admin/x, not /administrator. */
function underPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

// CSP + supporting security headers. We set them in middleware (not
// next.config.ts `headers()`) because the latter is inconsistent under
// Turbopack dev, and middleware runs uniformly across dev / build /
// edge / node runtimes. `unsafe-inline` + `unsafe-eval` on script-src
// remain in place — Next.js's RSC runtime relies on both; tightening
// to nonced scripts is a separate hardening project.
const SHARED_CSP = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
]

const STOREFRONT_CSP = [
  ...SHARED_CSP,
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.sentry.io https://*.ingest.sentry.io https://*.i.posthog.com https://*.posthog.com",
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.i.posthog.com https://*.posthog.com",
  "frame-ancestors 'self'",
].join('; ')

// Admin gets NO PostHog and NO Vercel Analytics origins. Admin URLs embed
// customer ids, RFQ codes and quote codes; a future stray analytics import
// must not be able to ship them to a third party.
const ADMIN_CSP = [
  ...SHARED_CSP,
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://*.ingest.sentry.io",
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io",
  "frame-ancestors 'none'",
].join('; ')

function applySecurityHeaders(
  response: NextResponse,
  request: NextRequest,
  isAdmin: boolean,
): NextResponse {
  response.headers.set('Content-Security-Policy', isAdmin ? ADMIN_CSP : STOREFRONT_CSP)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', isAdmin ? 'DENY' : 'SAMEORIGIN')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  // Admin URLs embed customer ids and RFQ codes — never leak a full URL to an
  // external target, even same-scheme.
  response.headers.set(
    'Referrer-Policy',
    isAdmin ? 'no-referrer' : 'strict-origin-when-cross-origin',
  )
  if (isAdmin) {
    // Structural noindex. Third and last layer, after the `robots` metadata on
    // app/admin/layout.tsx and `Disallow: /admin` in robots.ts — and the only
    // one that survives a staff member editing the robots.txt field in the
    // SEO console.
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  }

  // Clear the pre-split Auth.js cookies. They are never accepted, but stale
  // copies at Path=/ make debugging confusing. Remove this block once the
  // 8h maxAge has expired every session minted before the cutover.
  for (const name of LEGACY_SESSION_COOKIES) {
    if (request.cookies.has(name)) response.cookies.delete({ name, path: '/' })
  }
  return response
}

function redirectToSignIn(request: NextRequest, signInPath: string): NextResponse {
  const { pathname, search } = request.nextUrl
  const url = new URL(signInPath, request.url)
  url.searchParams.set('next', pathname + (search ?? ''))
  return NextResponse.redirect(url)
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdmin = underPrefix(pathname, ADMIN_PREFIX)
  const done = (res: NextResponse) => applySecurityHeaders(res, request, isAdmin)

  if (isAdmin) {
    if (ADMIN_PUBLIC_PATHS.some((p) => underPrefix(pathname, p))) {
      return done(NextResponse.next())
    }

    // Verify the token, don't just look for a cookie. Cookie presence proves
    // nothing — not signature, not expiry, not which surface minted it — and
    // now that the surfaces share an origin, a signed-in customer's cookie is
    // present on every single /admin request.
    const token = await getToken({
      req: request,
      secret: requireAuthSecret('STAFF_AUTH_SECRET'),
      cookieName: STAFF_SESSION_COOKIE,
      // Must equal cookieName: @auth/core uses the cookie name as the HKDF salt.
      salt: STAFF_SESSION_COOKIE,
      secureCookie: USE_SECURE_COOKIES,
    })

    const isStaff = !!token?.sub && token.kind === 'staff' && isStaffRole(token.role)
    if (!isStaff) {
      // API surfaces get a status; HTML surfaces get a redirect.
      if (underPrefix(pathname, '/admin/api')) {
        return done(new NextResponse('Unauthorized', { status: 401 }))
      }
      return done(redirectToSignIn(request, '/admin/sign-in'))
    }
    return done(NextResponse.next())
  }

  if (PROTECTED_ACCOUNT_PATHS.some((p) => underPrefix(pathname, p))) {
    const token = await getToken({
      req: request,
      secret: requireAuthSecret('CUSTOMER_AUTH_SECRET'),
      cookieName: CUSTOMER_SESSION_COOKIE,
      salt: CUSTOMER_SESSION_COOKIE,
      secureCookie: USE_SECURE_COOKIES,
    })

    // accountId is the storefront's real authorization signal — every account
    // query is scoped by it — so an empty one is not a usable session.
    const isCustomer =
      !!token?.sub &&
      token.kind === 'customer' &&
      typeof token.accountId === 'string' &&
      token.accountId.length > 0

    if (!isCustomer) return done(redirectToSignIn(request, '/sign-in'))
  }

  return done(NextResponse.next())
}

export const config = {
  matcher: [
    // The lookahead is anchored right after the leading '/', so `api` exempts
    // ONLY top-level /api/*. `admin/api` must be listed separately or
    // /admin/api/auth/* is caught by the denylist above and 302'd to
    // /admin/sign-in — an unbreakable sign-in redirect loop with no error
    // message. Both are exempt here because /admin/api/auth is the sign-in
    // endpoint itself and the admin API routes self-guard with hasRole().
    '/((?!api|admin/api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
