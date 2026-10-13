/**
 * Same-origin URLs for the images we hand to crawlers.
 *
 * Supabase Storage answers every public object with `x-robots-tag: none` —
 * measured on production 2026-10-05 against a product image named in a live
 * Product JSON-LD block and `og:image`. That header is `noindex, nofollow` for
 * the file itself: Googlebot-Image is told not to index the picture a page's
 * structured data says is the product, and no markup on the page can override
 * a response header on another host. The brand marks already hit this and were
 * moved behind `/brand-icon.png`; product, blog and service images had not.
 *
 * `/media/<bucket>/<key>` (app/media/[...path]/route.ts) re-serves the same
 * bytes from a response this app controls. Only the structured-data, Open
 * Graph and image-sitemap URLs are rewritten. On-page `<Image>` elements keep
 * their storage source, because `/_next/image` already answers without the
 * header and pointing it at this route would only add a hop.
 *
 * Kept free of `./seo` so `pageMetadata` can use it without an import cycle.
 */

/** The public buckets whose objects may be re-served. Never the private ones. */
export const CRAWLABLE_MEDIA_BUCKETS = [
  'product-images',
  'blog-images',
  'service-images',
  'industry-images',
] as const

/** URL prefix of the re-serving route. */
export const CRAWLABLE_MEDIA_PREFIX = '/media'

const STORAGE_PUBLIC_PATH = '/storage/v1/object/public/'

/**
 * Raster image extensions only, all lowercase.
 *
 * Two reasons for the list. The proxy matcher (src/proxy.ts) skips exactly
 * these extensions, so a `/media/…` request never runs the storefront proxy.
 * And SVG is deliberately absent: an uploaded SVG can carry script, and serving
 * one from this origin would run it with the site's cookies in scope.
 */
const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp|gif)$/

function storageHost(supabaseUrl: string | undefined): string | null {
  if (!supabaseUrl) return null
  try {
    return new URL(supabaseUrl).host
  } catch {
    return null
  }
}

function isCrawlableBucket(bucket: string): boolean {
  return (CRAWLABLE_MEDIA_BUCKETS as readonly string[]).includes(bucket)
}

/**
 * The same-origin URL for a public storage image, or the input unchanged when
 * it is anything else — an external URL a supplier hosts, a document, an SVG,
 * a private-bucket path, or another project's storage.
 */
export function toCrawlableMediaUrl(
  url: string,
  baseUrl: string,
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
): string {
  if (!url) return url
  const host = storageHost(supabaseUrl)
  if (!host) return url

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }
  if (parsed.protocol !== 'https:' || parsed.host !== host) return url
  if (!parsed.pathname.startsWith(STORAGE_PUBLIC_PATH)) return url

  const rest = parsed.pathname.slice(STORAGE_PUBLIC_PATH.length)
  const slash = rest.indexOf('/')
  if (slash <= 0) return url
  const bucket = rest.slice(0, slash)
  const key = rest.slice(slash + 1)
  // Case-sensitive on purpose: an upper-case extension would miss the proxy
  // matcher. None exist today (checked 2026-10-06), and an image that keeps
  // its storage URL is the status quo rather than a break.
  if (!isCrawlableBucket(bucket) || !key || !IMAGE_EXTENSION.test(key)) return url

  // `pathname` is already percent-encoded by the URL parser, so the key is
  // carried across byte for byte.
  return `${baseUrl.replace(/\/+$/, '')}${CRAWLABLE_MEDIA_PREFIX}/${bucket}/${key}`
}

/**
 * The storage URL the route should fetch for `/media/<segments…>`, or null
 * when the request names anything we do not re-serve.
 *
 * `segments` arrive decoded from the route params; each is re-encoded, and any
 * empty, `.` or `..` segment is refused, so a request cannot climb out of the
 * bucket or reach a private one.
 */
export function storageUrlForMediaPath(
  segments: readonly string[],
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
): string | null {
  if (!supabaseUrl || segments.length < 2) return null
  const [bucket, ...key] = segments
  if (!bucket || !isCrawlableBucket(bucket)) return null
  if (key.some((s) => !s || s === '.' || s === '..' || s.includes('/') || s.includes('\\'))) {
    return null
  }
  const last = key[key.length - 1]!
  if (!IMAGE_EXTENSION.test(last)) return null
  const base = supabaseUrl.replace(/\/+$/, '')
  return `${base}${STORAGE_PUBLIC_PATH}${bucket}/${key.map(encodeURIComponent).join('/')}`
}
