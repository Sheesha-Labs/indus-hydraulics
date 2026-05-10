/**
 * Deterministic slugifier for competitor brands and MPNs used by the
 * `/replacement/<brand>/<mpn>` route. The function is the single source
 * of truth so the route handler, the sitemap, and the link emitters in
 * the PDP all agree on what URL a given (brand, mpn) pair maps to.
 *
 * Rules:
 *   - lower-case
 *   - non-alphanumeric runs collapse to a single dash
 *   - leading and trailing dashes are stripped
 *   - empty input is rejected (caller guards) — returns "" so the URL
 *     builder can refuse to emit an unsafe link.
 *
 * MPNs are particularly noisy: real competitor part numbers contain
 * slashes (`A10VSO 71/31R`), spaces, hyphens, and the occasional
 * trademark / colon. The collapse-to-dash strategy is lossy but stable
 * — the same input always produces the same output, and we never use
 * the slug to round-trip back to the original (we look up the original
 * by querying the DB). Tests pin down the awkward edge-cases.
 */

export function competitorBrandSlug(brand: string | null | undefined): string {
  return basicSlug(brand)
}

export function competitorMpnSlug(mpn: string | null | undefined): string {
  return basicSlug(mpn)
}

function basicSlug(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Convenience used by sitemap + link emitters. Returns null when either slug is empty. */
export function replacementUrlPath(brand: string, mpn: string): string | null {
  const b = competitorBrandSlug(brand)
  const m = competitorMpnSlug(mpn)
  if (!b || !m) return null
  return `/replacement/${b}/${m}`
}
