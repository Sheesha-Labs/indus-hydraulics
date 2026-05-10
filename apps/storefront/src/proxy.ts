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
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.sentry.io https://*.ingest.sentry.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isProtectedAccountPath(pathname)) {
    // NextAuth v5 (Auth.js) uses 'authjs.session-token' on HTTP,
    // '__Secure-authjs.session-token' on HTTPS. Keep v4 names as fallback for
    // any cookies persisted across the v4 → v5 upgrade.
    const sessionToken =
      request.cookies.get('authjs.session-token') ??
      request.cookies.get('__Secure-authjs.session-token') ??
      request.cookies.get('next-auth.session-token') ??
      request.cookies.get('__Secure-next-auth.session-token')

    if (!sessionToken) {
      const next = pathname + (request.nextUrl.search ?? '')
      const redirectUrl = new URL(`/sign-in`, request.url)
      redirectUrl.searchParams.set('next', next)
      return applySecurityHeaders(NextResponse.redirect(redirectUrl))
    }
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
