import { getStoreSettings } from '../../lib/store-settings'
import { resolveSearchIcon } from '../../lib/brand-identity'
import { BASE_URL } from '../../lib/seo'

/**
 * The brand mark a crawler reads, served from THIS origin at a URL that never
 * changes.
 *
 * Two things forced it, both measured against production rather than guessed:
 *
 * 1. Supabase Storage answers every public object with `x-robots-tag: none`,
 *    which is `noindex, nofollow`. The favicon links and the Organization
 *    JSON-LD `logo` pointed straight at storage, so Googlebot-Image was told
 *    not to index the one file the search result needs. Google's favicon
 *    documentation is explicit that Googlebot-Image must be able to crawl the
 *    file; a header that forbids indexing is exactly the case that leaves the
 *    generic globe in the result row. Nothing on the page can override a
 *    response header on another host — the bytes have to come from a response
 *    we control.
 *
 * 2. The same documentation asks for a *stable* favicon URL. Storage keys are
 *    minted `${Date.now()}-${filename}`, so every re-upload in
 *    /admin/settings?tab=brand changed the URL and restarted whatever
 *    evaluation Google had begun. This path is fixed; what it serves can
 *    change underneath it.
 *
 * Deliberately NOT `app/icon.png`: that file convention makes Next emit its
 * own `<link rel="icon">` unconditionally, which is the same duplicate-links
 * problem that keeps favicon.ico in `public/`. A plain route handler emits
 * nothing and is referenced only by the metadata that wants it.
 *
 * The proxy matcher excludes `.png`, so this path carries no CSP and no
 * `X-Robots-Tag` from middleware. `x-robots-tag: all` is set explicitly below
 * so a future global header cannot quietly reintroduce the bug this fixes.
 */

/** Serve from the CDN for a day, and keep serving while revalidating. */
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'

/** The bundled mark, which is what `public/favicon.ico` answers. */
const FALLBACK = `${BASE_URL.replace(/\/+$/, '')}/favicon.ico`

export async function GET(): Promise<Response> {
  const settings = await getStoreSettings()
  const upstream = resolveSearchIcon(settings, BASE_URL)

  // Nothing uploaded, or the object has gone missing: hand back the bundled
  // ICO rather than a 404. A crawler that gets a 404 here has no mark at all,
  // where a redirect still resolves to brand art.
  if (!upstream) return Response.redirect(FALLBACK, 307)

  let response: Response
  try {
    response = await fetch(upstream, { next: { revalidate: 3600 } })
  } catch {
    return Response.redirect(FALLBACK, 307)
  }
  if (!response.ok) return Response.redirect(FALLBACK, 307)

  const body = await response.arrayBuffer()
  return new Response(body, {
    headers: {
      'content-type': response.headers.get('content-type') ?? 'image/png',
      'cache-control': CACHE_CONTROL,
      'x-robots-tag': 'all',
    },
  })
}
