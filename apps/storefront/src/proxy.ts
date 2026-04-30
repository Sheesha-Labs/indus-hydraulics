import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@indus/i18n'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_ACCOUNT_PATHS = ['/account']

function isProtectedAccountPath(pathname: string): boolean {
  return PROTECTED_ACCOUNT_PATHS.some((path) => {
    // Strip locale prefix to check path
    const withoutLocale = pathname.replace(/^\/(en|ar)/, '')
    return withoutLocale.startsWith(path)
  })
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check auth for protected account routes
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
      const localeSeg = pathname.split('/')[1]
      const locale = localeSeg === 'ar' || localeSeg === 'en' ? localeSeg : 'en'
      // Preserve the originally requested URL so we can bounce back after sign-in.
      const next = pathname + (request.nextUrl.search ?? '')
      const redirectUrl = new URL(`/${locale}/sign-in`, request.url)
      redirectUrl.searchParams.set('next', next)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
