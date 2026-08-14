import {
  LEGACY_SESSION_COOKIES,
  STAFF_SESSION_COOKIE,
  USE_SECURE_COOKIES,
  requireAuthSecret,
} from '@indus/domain'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { isStaffRole } from './lib/rbac'

// All admin routes except sign-in require a staff_user session
const PUBLIC_ADMIN_PATHS = ['/sign-in', '/api/auth']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

// CSP for the admin. Same shape as storefront minus Vercel Analytics
// / Speed Insights (admin doesn't render those), and frame-ancestors
// is 'none' since the admin should never be embedded in an iframe.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://*.ingest.sentry.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

function applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Admin URLs embed customer ids, RFQ codes and quote codes — never leak a
  // full URL to an external target, even same-scheme.
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  // Structural noindex: cannot be undone by a staff member editing the
  // robots.txt field in the SEO console.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')

  // Clear the pre-split Auth.js cookies. They are never accepted, but stale
  // copies at Path=/ make debugging confusing. Remove this block once the
  // 8h maxAge has expired every session minted before the cutover.
  for (const name of LEGACY_SESSION_COOKIES) {
    if (request.cookies.has(name)) response.cookies.delete({ name, path: '/' })
  }
  return response
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isPublicPath(pathname)) {
    // Verify the token, don't just look for a cookie. Cookie presence proves
    // nothing — not signature, not expiry, not which surface minted it. Once
    // the storefront and admin share an origin, a customer's cookie is present
    // on every admin request, so a presence check would pass for every
    // signed-in customer.
    //
    // getToken over auth(): it is HKDF + one AES decrypt with no DB access and
    // no provider config, whereas auth() would pull the Credentials provider's
    // `await import('@indus/db')` — and Prisma's cold start — into the request
    // path for every matched route, including static pages.
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
      const next = pathname + (request.nextUrl.search ?? '')
      const redirectUrl = new URL(`/sign-in`, request.url)
      redirectUrl.searchParams.set('next', next)
      return applySecurityHeaders(NextResponse.redirect(redirectUrl), request)
    }
  }

  return applySecurityHeaders(NextResponse.next(), request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
