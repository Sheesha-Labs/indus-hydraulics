/**
 * Asset URL resolution + candidate-image extraction for the scraper.
 *
 * Real-world product pages decorate <img> tags in many ways:
 *   - relative or protocol-relative URLs
 *   - data-src / data-lazy-src / data-original for lazy-loading
 *   - srcset with multiple resolutions
 *   - inline SVG sprites + tiny icons we want to filter out
 *
 * `extractImageCandidates` normalises all of that into absolute URLs with
 * resolved positions. Adapters call this; the orchestrator does not.
 */

import type { CheerioAPI } from 'cheerio'

/** Filter threshold: anything narrower OR shorter than this is an icon. */
const MIN_IMAGE_DIMENSION = 100

/** MIME types we keep as candidates. SVGs are filtered out (logos/icons). */
const KEEP_MIME_PREFIXES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export type ExtractedImage = {
  url: string
  alt?: string
}

/**
 * Resolve a possibly-relative asset URL against the page URL it was found
 * on. Returns `null` for unresolvable input (bad URL, javascript:, etc.).
 */
export function resolveAsset(pageUrl: string, raw: string | undefined | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Reject data:, javascript:, mailto:, etc. — only http(s) and protocol-relative.
  if (/^(javascript|data|mailto|tel|blob):/i.test(trimmed)) return null

  try {
    return new URL(trimmed, pageUrl).toString()
  } catch {
    return null
  }
}

/**
 * Parse a srcset attribute and return the highest-resolution URL. We rank
 * by the `w` descriptor when present; otherwise the last entry wins (CSS
 * picks the last when no descriptor — pages often order ascending).
 *
 * Returns `null` if the srcset is empty or unparseable.
 */
export function pickFromSrcset(srcset: string): string | null {
  const candidates = srcset
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [url, descriptor] = entry.split(/\s+/, 2)
      if (!url) return null
      const width = descriptor && descriptor.endsWith('w') ? Number(descriptor.slice(0, -1)) : 0
      return { url, width: Number.isFinite(width) ? width : 0 }
    })
    .filter((c): c is { url: string; width: number } => c !== null)

  if (candidates.length === 0) return null
  // Highest-width wins. On ties (including all-0 when descriptors are
  // absent), the LAST entry wins — matches the common convention of
  // ordering srcset ascending with the final entry being the canonical
  // image.
  const sorted = candidates
    .map((c, idx) => ({ ...c, idx }))
    .sort((a, b) => {
      if (a.width !== b.width) return b.width - a.width
      return b.idx - a.idx
    })
  return sorted[0]!.url
}

/**
 * Scrape image candidates from a parsed HTML document.
 *
 * Lookup order per <img>:
 *   1. srcset (highest-resolution wins)
 *   2. data-src / data-lazy-src / data-original (lazy-loading)
 *   3. src
 *
 * Filters:
 *   - SVGs (icon sprites, logos) by extension
 *   - <img> with width or height attribute < MIN_IMAGE_DIMENSION
 *   - duplicates (same resolved URL)
 *
 * Optional scope selector limits extraction to a sub-tree (e.g. a product
 * gallery). When omitted, scans the whole document.
 */
export function extractImageCandidates(
  $: CheerioAPI,
  pageUrl: string,
  scopeSelector?: string,
): ExtractedImage[] {
  const root = scopeSelector ? $(scopeSelector) : $.root()
  const seen = new Set<string>()
  const out: ExtractedImage[] = []

  root.find('img').each((_, el) => {
    const $img = $(el)

    // Icon-size heuristic
    const w = numericAttr($img.attr('width'))
    const h = numericAttr($img.attr('height'))
    if ((w !== null && w < MIN_IMAGE_DIMENSION) || (h !== null && h < MIN_IMAGE_DIMENSION)) return

    const srcset = $img.attr('srcset') ?? $img.attr('data-srcset')
    const lazy = $img.attr('data-src') ?? $img.attr('data-lazy-src') ?? $img.attr('data-original')
    const src = $img.attr('src')

    const raw = (srcset && pickFromSrcset(srcset)) || lazy || src
    const resolved = resolveAsset(pageUrl, raw)
    if (!resolved) return

    // Filter SVGs by extension; some sites also serve image/svg+xml via a
    // generic .image path — content-type HEAD probe will catch those later.
    if (/\.svg(?:\?|#|$)/i.test(resolved)) return

    if (seen.has(resolved)) return
    seen.add(resolved)
    out.push({ url: resolved, alt: $img.attr('alt')?.trim() || undefined })
  })

  return out
}

/**
 * Filter image-probe results. Caller HEAD-probes each URL; we then drop any
 * non-image content-types (catches `.jpg`-extension URLs that 404 to HTML).
 */
export function isProbedImageAcceptable(contentType: string | undefined): boolean {
  if (!contentType) return true // unknown — keep, let ingest revalidate
  const ct = contentType.toLowerCase().split(';')[0]!.trim()
  return KEEP_MIME_PREFIXES.includes(ct)
}

function numericAttr(value: string | undefined): number | null {
  if (!value) return null
  // Allow "640" or "640px"
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}
