import { storageUrlForMediaPath } from '../../../lib/crawlable-media'

/**
 * `/media/<bucket>/<key>` — a public storage image, re-served from this origin
 * so crawlers may index it.
 *
 * See `lib/crawlable-media.ts` for why: Supabase Storage answers every public
 * object with `x-robots-tag: none`, which told Googlebot-Image not to index the
 * images our Product, Article and Open Graph markup point at.
 *
 * Streams the upstream body rather than buffering it, and caches hard at the
 * CDN — a crawler fetches each image rarely, and the edge answers repeats
 * without reaching this function. The proxy matcher skips image extensions, so
 * no middleware runs here, and `x-robots-tag: all` is set explicitly so a
 * future global header cannot quietly reintroduce the problem.
 */

/**
 * A day in browsers, 30 days at the CDN, and a stale copy while revalidating.
 * Not `immutable`: the scraper writes some objects at fixed names, so the
 * bytes behind a key can change.
 */
const CACHE_CONTROL = 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400'

/** A missing object is remembered briefly, so a 404 storm does not reach storage. */
const MISS_CACHE_CONTROL = 'public, max-age=60, s-maxage=300'

function miss(status: 404 | 502): Response {
  return new Response(null, {
    status,
    headers: {
      'cache-control': status === 404 ? MISS_CACHE_CONTROL : 'no-store',
      'x-robots-tag': 'noindex',
    },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params
  const upstream = storageUrlForMediaPath(path)
  if (!upstream) return miss(404)

  let response: Response
  try {
    // `no-store`: the bytes belong in the CDN, not in the Data Cache, where
    // every image would be an incremental-cache write.
    response = await fetch(upstream, { cache: 'no-store' })
  } catch {
    return miss(502)
  }
  if (response.status === 404 || response.status === 400) return miss(404)
  if (!response.ok || !response.body) return miss(502)

  // Only ever pass an image through, and never an SVG — the extension check
  // in `storageUrlForMediaPath` is the first gate, this is the second.
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/') || contentType.includes('svg')) return miss(404)

  const headers = new Headers({
    'content-type': contentType,
    'cache-control': CACHE_CONTROL,
    'x-robots-tag': 'all',
    'x-content-type-options': 'nosniff',
  })
  const length = response.headers.get('content-length')
  if (length) headers.set('content-length', length)
  const etag = response.headers.get('etag')
  if (etag) headers.set('etag', etag)
  const lastModified = response.headers.get('last-modified')
  if (lastModified) headers.set('last-modified', lastModified)

  return new Response(response.body, { status: 200, headers })
}
