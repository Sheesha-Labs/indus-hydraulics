import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ACCOUNT_PATHS = ['/account']

function isProtectedAccountPath(pathname: string): boolean {
  return PROTECTED_ACCOUNT_PATHS.some((path) => pathname.startsWith(path))
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
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
