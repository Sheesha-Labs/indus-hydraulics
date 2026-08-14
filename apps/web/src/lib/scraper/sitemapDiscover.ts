/**
 * Sitemap discovery for the competitor scraper.
 *
 * B2B catalogue sites almost always publish a sitemap.xml that lists every
 * product URL. We support two shapes:
 *
 *   1. `<urlset>` — flat list of `<url><loc>…</loc></url>`
 *   2. `<sitemapindex>` — index of child sitemaps; we recursively fetch
 *      each `<sitemap><loc>…</loc></sitemap>` and union the results.
 *
 * `filterUrlsToProductPages` is a heuristic that drops obviously non-product
 * URLs (e.g. category landing pages, blog posts) based on a path-pattern
 * hint. Adapters can override this with their own filter.
 */

import * as cheerio from 'cheerio'

/** Hard cap on recursion to avoid pathological sitemap-index loops. */
const MAX_SITEMAP_DEPTH = 4
/** Cap on number of URLs returned from one discovery — sanity bound. */
export const MAX_DISCOVERED_URLS = 2000

export type SitemapEntry = {
  loc: string
  lastmod?: string
}

export type DiscoverDeps = {
  fetchXml: (url: string) => Promise<{ status: number; xml: string }>
}

/**
 * Recursively discover URLs from a sitemap URL. Detects `<sitemapindex>` vs
 * `<urlset>` automatically. Returns absolute URL strings in document order,
 * deduplicated.
 */
export async function discoverFromSitemap(
  sitemapUrl: string,
  deps: DiscoverDeps,
  depth = 0,
): Promise<SitemapEntry[]> {
  if (depth > MAX_SITEMAP_DEPTH) return []

  const { status, xml } = await deps.fetchXml(sitemapUrl)
  if (status !== 200 || !xml) return []

  const parsed = parseSitemapXml(xml)

  if (parsed.kind === 'urlset') return parsed.entries
  if (parsed.kind === 'empty') return []

  // sitemapindex — recurse
  const collected: SitemapEntry[] = []
  const seen = new Set<string>()
  for (const child of parsed.sitemaps) {
    if (collected.length >= MAX_DISCOVERED_URLS) break
    const childEntries = await discoverFromSitemap(child, deps, depth + 1)
    for (const entry of childEntries) {
      if (seen.has(entry.loc)) continue
      seen.add(entry.loc)
      collected.push(entry)
      if (collected.length >= MAX_DISCOVERED_URLS) break
    }
  }
  return collected
}

export type ParsedSitemap =
  | { kind: 'urlset'; entries: SitemapEntry[] }
  | { kind: 'sitemapindex'; sitemaps: string[] }
  | { kind: 'empty' }

export function parseSitemapXml(xml: string): ParsedSitemap {
  const $ = cheerio.load(xml, { xml: { xmlMode: true } })

  // sitemapindex first — some sites label both elements
  const sitemaps: string[] = []
  $('sitemapindex sitemap > loc').each((_, el) => {
    const text = $(el).text().trim()
    if (text) sitemaps.push(text)
  })
  if (sitemaps.length > 0) return { kind: 'sitemapindex', sitemaps }

  const entries: SitemapEntry[] = []
  $('urlset url').each((_, el) => {
    const loc = $(el).find('> loc').first().text().trim()
    if (!loc) return
    const lastmod = $(el).find('> lastmod').first().text().trim() || undefined
    entries.push({ loc, lastmod })
  })
  if (entries.length > 0) return { kind: 'urlset', entries }

  return { kind: 'empty' }
}

/**
 * Heuristic filter for "this URL is plausibly a product detail page". Used
 * when the user paste-imports a sitemap rather than naming an adapter that
 * has its own URL classifier.
 *
 * Patterns are case-insensitive substrings. Defaults match common ecommerce
 * URL shapes (`/products/`, `/product/`, `/p/`, `/item/`). When the
 * adapter knows better, pass an explicit `includePatterns` array.
 */
export function filterUrlsToProductPages(
  urls: string[],
  options: { includePatterns?: string[]; excludePatterns?: string[] } = {},
): string[] {
  const include = (options.includePatterns ?? ['/products/', '/product/', '/p/', '/item/', '/items/']).map((s) =>
    s.toLowerCase(),
  )
  const exclude = (options.excludePatterns ?? ['/category/', '/categories/', '/c/', '/blog/', '/news/']).map((s) =>
    s.toLowerCase(),
  )

  return urls.filter((u) => {
    const lower = u.toLowerCase()
    if (exclude.some((p) => lower.includes(p))) return false
    if (include.length === 0) return true
    return include.some((p) => lower.includes(p))
  })
}
