import { NextRequest, NextResponse } from 'next/server'

// All admin routes except sign-in require staff_user session
const PUBLIC_ADMIN_PATHS = ['/sign-in']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(path))
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isPublicPath(pathname)) {
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
