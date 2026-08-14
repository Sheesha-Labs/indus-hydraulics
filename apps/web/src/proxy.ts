import {
  CUSTOMER_SESSION_COOKIE,
  LEGACY_SESSION_COOKIES,
  USE_SECURE_COOKIES,
  requireAuthSecret,
} from '@indus/domain'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ACCOUNT_PATHS = ['/account']

function isProtectedAccountPath(pathname: string): boolean {
  return PROTECTED_ACCOUNT_PATHS.some((path) => pathname.startsWith(path))
}

// CSP + supporting security headers. We set them in middleware (not
// next.config.ts `headers()`) because the latter is inconsistent under
// Turbopack dev, and middleware runs uniformly across dev / build /
// edge / node runtimes. `unsafe-inline` + `unsafe-eval` on script-src
// remain in place — Next.js's RSC runtime relies on both; tightening
// to nonced scripts is a separate hardening project.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.sentry.io https://*.ingest.sentry.io https://*.i.posthog.com https://*.posthog.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.i.posthog.com https://*.posthog.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

function applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

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

  if (isProtectedAccountPath(pathname)) {
    // Verify the token, don't just look for a cookie. Cookie presence proves
    // nothing — not signature, not expiry, not which surface minted it.
    // getToken is HKDF + one AES decrypt with no DB access, unlike auth(),
    // which would drag the Credentials provider's Prisma import into every
    // matched request.
    const token = await getToken({
      req: request,
      secret: requireAuthSecret('CUSTOMER_AUTH_SECRET'),
      cookieName: CUSTOMER_SESSION_COOKIE,
      // Must equal cookieName: @auth/core uses the cookie name as the HKDF salt.
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

    if (!isCustomer) {
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
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
