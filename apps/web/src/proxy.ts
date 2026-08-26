import {
  CUSTOMER_SESSION_COOKIE,
  HERO_GEO_FALLBACK_CODE,
  LEGACY_SESSION_COOKIES,
  STAFF_SESSION_COOKIE,
  USE_SECURE_COOKIES,
  requireAuthSecret,
  resolveHeroGeoCode,
} from '@indus/domain'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { isStaffRole } from './lib/rbac'
import { findRedirect, recordRedirectHit } from './lib/redirects'

/**
 * One middleware, two surfaces.
 *
 * Storefront paths are an ALLOWLIST — only /account requires a session.
 * Admin paths are a DENYLIST — everything under /admin requires a staff
 * session except two paths. The two surfaces also need different security
 * headers, which on a shared origin can no longer be a per-app constant.
 */

const ADMIN_PREFIX = '/admin'
const DESIGN_PREFIX = '/design'

/**
 * The only paths under /admin reachable without a staff session.
 *
 * /activate and /forgot-password are public by necessity: the visitor has no
 * session, and getting one is precisely what they are there to do. Both are
 * safe to expose — activate requires a single-use token whose sha256 must
 * match a live row, and forgot-password answers identically whether or not
 * the address exists.
 */
const ADMIN_PUBLIC_PATHS = [
  '/admin/sign-in',
  '/admin/api/auth',
  '/admin/activate',
  '/admin/forgot-password',
]

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

// Google Analytics origins are listed HERE and deliberately not in ADMIN_CSP.
// (storefront)/layout.tsx mounts <GoogleAnalytics> whenever GA_MEASUREMENT_ID
// is set, and without googletagmanager.com on script-src the browser refuses
// gtag/js outright — the tag never loads and GA4 records nothing at all. The
// only symptom is a CSP violation in the console, so the site looks fine and
// the analytics dashboard is simply empty.
//
// connect-src needs the collect endpoints as well: script-src alone loads the
// tag but every beacon it then sends is blocked, which fails the same way.
const GA_SCRIPT_ORIGINS = 'https://www.googletagmanager.com'
const GA_CONNECT_ORIGINS =
  'https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com'

// /contact embeds the head-office location as a keyless Google Maps iframe.
// There is no `frame-src` in SHARED_CSP, so without this line it falls back to
// `default-src 'self'` and the browser refuses the frame outright — the band
// renders as an empty bordered box with only a console violation to say why.
// Listed on the storefront only: nothing under /admin embeds a third party,
// and admin URLs carry customer ids that must not reach one.
const MAP_FRAME_ORIGINS = 'https://www.google.com'

const STOREFRONT_CSP = [
  ...SHARED_CSP,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${GA_SCRIPT_ORIGINS} https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.sentry.io https://*.ingest.sentry.io https://*.i.posthog.com https://*.posthog.com`,
  `connect-src 'self' https://*.supabase.co ${GA_CONNECT_ORIGINS} https://*.sentry.io https://*.ingest.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.i.posthog.com https://*.posthog.com`,
  `frame-src 'self' ${MAP_FRAME_ORIGINS}`,
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
  isStaffOnly: boolean,
): NextResponse {
  response.headers.set('Content-Security-Policy', isStaffOnly ? ADMIN_CSP : STOREFRONT_CSP)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', isStaffOnly ? 'DENY' : 'SAMEORIGIN')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  // Admin URLs embed customer ids and RFQ codes — never leak a full URL to an
  // external target, even same-scheme.
  response.headers.set(
    'Referrer-Policy',
    isStaffOnly ? 'no-referrer' : 'strict-origin-when-cross-origin',
  )
  if (isStaffOnly) {
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

/**
 * Paths that can never be a redirect target, skipped before the lookup.
 * Everything under /admin is already handled above.
 */
const REDIRECT_SKIP = /^\/(api|_next|design)(\/|$)|\.[a-z0-9]+$/i

/**
 * Serve a staff-created redirect, if the requested path has one.
 *
 * See lib/redirects.ts: the table was CRUD-managed but never read, so every
 * redirect created in the SEO console did nothing. The lookup is an in-memory
 * Map refreshed at most once a minute, so this costs no query per request.
 */
async function serveStoredRedirect(request: NextRequest): Promise<NextResponse | null> {
  const { pathname, search } = request.nextUrl
  if (REDIRECT_SKIP.test(pathname)) return null

  const hit = await findRedirect(pathname).catch(() => null)
  if (!hit) return null

  recordRedirectHit(hit.id) // fire-and-forget

  const url = new URL(hit.toPath, request.url)
  // Carry the query string across, so campaign tags survive the hop.
  if (search && !hit.toPath.includes('?')) url.search = search
  // 301/308 are permanent; anything else stays temporary, so a staff mistake
  // is not cached in visitors' browsers forever.
  const permanent = hit.statusCode === 301 || hit.statusCode === 308
  return NextResponse.redirect(url, permanent ? 308 : 307)
}

/**
 * Send `/` to the cached copy of the homepage for this visitor's country.
 *
 * The homepage headline opens with the visitor's country, which used to be
 * read inside the page via `headers()`. Reading request state there makes the
 * route dynamic: production served `/` with `no-store`, the CDN never held a
 * copy, and every visitor and every crawler cost a full render plus the bytes
 * to ship it. That was the single most expensive URL on the site.
 *
 * Resolving the country here instead turns one uncacheable page into a small
 * set of cacheable ones — `/h/AE`, `/h/SA`, `/h/XX` — each cached on its own
 * path. This is a REWRITE, not a redirect: the address bar still reads `/`,
 * every variant declares `/` as its canonical, and two countries still see
 * two different headlines on the same URL.
 *
 * `?geo=XX` keeps working as the way to review wording without leaving the
 * country. The query is deliberately NOT carried through to the rewrite
 * target — the variant is already in the path, and passing query strings on
 * would give every campaign tag its own cache entry.
 */
function rewriteHomeToGeoVariant(request: NextRequest): NextResponse | null {
  if (request.nextUrl.pathname !== '/') return null

  const override = request.nextUrl.searchParams.get('geo')
  const code = resolveHeroGeoCode(override ?? request.headers.get('x-vercel-ip-country'))

  // The fallback already lives at `/`, so there is nothing to rewrite to.
  if (code === HERO_GEO_FALLBACK_CODE) return null

  const url = request.nextUrl.clone()
  url.pathname = `/h/${code}`
  url.search = ''
  return NextResponse.rewrite(url)
}

/**
 * Send a filtered shelf to the dynamic twin of the category page.
 *
 * `/c/<slug>` is prerendered, which it can only be because it never reads
 * `searchParams` — one route cannot be both static and per-request. The facet
 * cases still have to work, so they are rewritten to `/c-filter/<slug>`, which
 * is the same view with the query string applied.
 *
 * This is a REWRITE: the address bar keeps the original URL, the canonical
 * keeps pointing at the clean shelf, and no existing link or bookmark changes.
 *
 * The condition matches `isFacetVariant` in category-view.tsx exactly — the
 * same set of parameters that already decides `noindex`. `?page=1` is not a
 * variant: it is the clean shelf under another name, and sending it to the
 * dynamic route would hand the most linked-to spelling of every category an
 * uncached render.
 */
const CATEGORY_PREFIX = '/c/'

function rewriteFilteredCategory(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl
  if (!pathname.startsWith(CATEGORY_PREFIX)) return null

  const slug = pathname.slice(CATEGORY_PREFIX.length)
  // Only the shelf itself, never anything nested below it.
  if (!slug || slug.includes('/')) return null

  const page = searchParams.get('page')
  const isFacetVariant =
    searchParams.has('brands') ||
    searchParams.has('spec') ||
    searchParams.has('sort') ||
    (page !== null && page !== '1')
  if (!isFacetVariant) return null

  const url = request.nextUrl.clone()
  url.pathname = `/c-filter/${slug}`
  return NextResponse.rewrite(url)
}

function redirectToSignIn(request: NextRequest, signInPath: string): NextResponse {
  const { pathname, search } = request.nextUrl
  const url = new URL(signInPath, request.url)
  url.searchParams.set('next', pathname + (search ?? ''))
  return NextResponse.redirect(url)
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  // /design is the component gallery. Its own docstring claimed it was
  // "staff-only via the proxy denylist" — it was not on any denylist and was
  // reachable by anyone who guessed the URL, which is also why noindex was
  // doing all the work. Gate it for real: same staff-token check as /admin,
  // same hardened headers.
  const isStaffOnly =
    underPrefix(pathname, ADMIN_PREFIX) || underPrefix(pathname, DESIGN_PREFIX)
  const done = (res: NextResponse) => applySecurityHeaders(res, request, isStaffOnly)

  if (isStaffOnly) {
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

  // Last, so a live route always wins over a stale redirect row pointing at it.
  const stored = await serveStoredRedirect(request)
  if (stored) return done(stored)

  // After the redirect lookup, so a redirect row for `/` still wins.
  const geoVariant = rewriteHomeToGeoVariant(request)
  if (geoVariant) return done(geoVariant)

  const filteredCategory = rewriteFilteredCategory(request)
  if (filteredCategory) return done(filteredCategory)

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
