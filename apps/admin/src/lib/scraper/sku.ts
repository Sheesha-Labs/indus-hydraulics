/**
 * SKU helpers for the competitor scraper.
 *
 * Per the implementation plan: when an ingested product has no scraped SKU,
 * we derive one from the last non-empty path segment of the source URL.
 * Example: https://competitor.com/products/a10vso-axial-pump  →
 *   `a10vso-axial-pump`.
 *
 * The user accepted the cross-host collision risk: if two competitors
 * use the same product slug, the second ingest hits a unique-SKU conflict
 * and the operator renames it inline.
 */

/** Max length matches `Product.sku` schema constraint (64 chars). */
export const MAX_SKU_LENGTH = 64

export function slugifyLastPathSegment(rawUrl: string): string {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return ''
  }

  const segments = url.pathname.split('/').filter(Boolean)
  const last = segments[segments.length - 1] ?? ''

  return slugify(last)
}

/**
 * Generic slugifier: lowercase, replace any run of non-alphanumerics with a
 * single dash, trim leading/trailing dashes, cap at MAX_SKU_LENGTH.
 *
 * NOTE: this is intentionally simple. The existing product `uniqueSlug`
 * helper in products/actions.ts handles uniqueness; this just produces a
 * candidate.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SKU_LENGTH)
}
