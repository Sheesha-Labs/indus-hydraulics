import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@indus/i18n'

const intlMiddleware = createMiddleware(routing)

// All admin routes except sign-in require staff_user session
const PUBLIC_ADMIN_PATHS = ['/sign-in']

function isPublicPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(en|ar)/, '')
  return PUBLIC_ADMIN_PATHS.some((path) => withoutLocale === path || withoutLocale.startsWith(path))
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isPublicPath(pathname)) {
    // NextAuth v5 (Auth.js) uses 'authjs.session-token' on HTTP, '__Secure-authjs.session-token' on HTTPS
    const sessionToken =
      request.cookies.get('authjs.session-token') ??
      request.cookies.get('__Secure-authjs.session-token') ??
      request.cookies.get('next-auth.session-token') ??
      request.cookies.get('__Secure-next-auth.session-token')

    if (!sessionToken) {
      const localeSeg = pathname.split('/')[1]
      const locale = localeSeg === 'ar' || localeSeg === 'en' ? localeSeg : 'en'
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
