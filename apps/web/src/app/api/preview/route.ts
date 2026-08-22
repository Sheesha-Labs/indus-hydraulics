import { NextResponse } from 'next/server'
import { draftMode } from 'next/headers'
import { verifyPreviewToken } from '@indus/domain'
import { requireStaff } from '../../../lib/staff-session'

/**
 * Enter preview (draft) mode for the storefront.
 *
 * The PDP used to take `?preview=<token>` as a search param and check it
 * during the render. Reading `searchParams` is a per-request read, so that one
 * feature made /p/[slug] permanently dynamic — it could never be prerendered
 * or CDN-cached, for anyone, ever, so that admins could look at drafts.
 *
 * Draft mode inverts that. The check happens once, here; Next then sets its
 * `__prerender_bypass` cookie, and requests carrying it skip the static cache
 * and render fresh. The PDP just asks `draftMode()` whether it is on, which
 * does not opt the route out of static generation.
 *
 * TWO gates, deliberately, and this is stricter than what it replaces:
 *
 *   1. A valid staff session. Draft mode is not scoped to one product — once
 *      on, it reveals every draft page — so it must not be reachable by
 *      whoever happens to hold a URL. Previously a forwarded preview link
 *      worked for anyone; now it works only for signed-in staff.
 *   2. The signed token, still verified against the SKU. `requireStaff`
 *      already establishes who the caller is; the token establishes that they
 *      arrived from a real preview link rather than by guessing this path.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Redirects to the admin sign-in when there is no staff session.
  await requireStaff()

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const sku = searchParams.get('sku')
  const slug = searchParams.get('slug')

  if (!token || !sku || !slug) {
    return new NextResponse('Missing token, sku or slug', { status: 400 })
  }

  let valid = false
  try {
    valid = verifyPreviewToken(token, sku).valid
  } catch {
    valid = false
  }
  if (!valid) return new NextResponse('Invalid or expired preview token', { status: 401 })

  const draft = await draftMode()
  draft.enable()

  // Relative redirect, so this cannot be turned into an open redirect by a
  // crafted `slug`. encodeURIComponent keeps a slug with odd characters from
  // escaping the path segment.
  return NextResponse.redirect(new URL(`/p/${encodeURIComponent(slug)}`, request.url), { status: 307 })
}
