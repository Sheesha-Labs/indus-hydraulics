import { BASE_URL } from './seo'

/**
 * Re-serve an uploaded brand mark from THIS origin, at a URL that never
 * changes.
 *
 * Shared by the two icon routes (`/brand-icon.png`, `/tab-icon.png`) because
 * the two things that forced the indirection apply to both of them, and were
 * measured against production rather than guessed:
 *
 * 1. Supabase Storage answers every public object with `x-robots-tag: none`,
 *    which is `noindex, nofollow`. Google's favicon documentation is explicit
 *    that Googlebot-Image must be able to crawl the file, and Google reads
 *    every `rel="icon"` on the page — not only the sized one — so a storage
 *    URL in any icon link is a mark a crawler has been told to ignore. Nothing
 *    on the page can override a response header on another host; the bytes
 *    have to come from a response we control.
 *
 * 2. The same documentation asks for a *stable* favicon URL. Storage keys are
 *    minted `${Date.now()}-${filename}`, so every re-upload in
 *    /admin/settings?tab=brand changed the URL and restarted whatever
 *    evaluation Google had begun. These paths are fixed; what they serve can
 *    change underneath them.
 *
 * Deliberately NOT the `app/icon.png` / `app/favicon.ico` file conventions:
 * those make Next emit its own `<link rel="icon">` unconditionally, which is
 * the duplicate-links problem that keeps favicon.ico in `public/`. A plain
 * route handler emits nothing and is referenced only by the metadata that
 * wants it.
 *
 * The proxy matcher excludes `.png`, so these paths carry no CSP and no
 * `X-Robots-Tag` from middleware. `x-robots-tag: all` is set explicitly below
 * so a future global header cannot quietly reintroduce the bug this fixes.
 */

/** Serve from the CDN for a day, and keep serving while revalidating. */
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'

/** The bundled mark, which is what `public/favicon.ico` answers. */
const FALLBACK = `${BASE_URL.replace(/\/+$/, '')}/favicon.ico`

export async function serveBrandMark(upstream: string | null): Promise<Response> {
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
