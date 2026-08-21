/**
 * Pure sitemap entry builder. Used by BOTH:
 *   - apps/web/src/app/sitemap.ts (the public XML)
 *   - apps/admin /seo/sitemap previewer (so admin sees what the bots see)
 *
 * Inputs are entity rows; outputs are sitemap entries. No DB calls here.
 *
 * Honors the per-entity overrides added by the SEO OS:
 *   - excludeFromSitemap (skip the URL entirely)
 *   - sitemapPriority (override default)
 *   - sitemapChangeFreq (override default)
 *   - seoUpdatedAt > updatedAt for lastModified accuracy
 */

import {
  type ChangeFreq,
  type SeoEntityType,
  SITEMAP_DEFAULTS,
  URL_SEGMENTS,
} from './types'

export type SitemapInputRow = {
  slug: string
  /** Wall-clock timestamp of the most recent content/SEO change. */
  lastModified?: Date | null
  excludeFromSitemap?: boolean | null
  sitemapPriority?: number | null
  sitemapChangeFreq?: ChangeFreq | null
  /** Per-entity indexability — noindex pages are never sitemap-eligible. */
  robotsIndex?: boolean | null
  /** Type-level visibility (Product.status === 'active', etc.) — excluded if false. */
  isPublished?: boolean
}

export type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency: ChangeFreq
  priority: number
}

/**
 * Build the URL for an entity. CmsPage uses the raw slug at the root
 * ("/about", "/contact"); everything else is prefixed by URL_SEGMENTS.
 */
export function entityUrl(
  origin: string,
  entityType: SeoEntityType,
  slug: string,
): string {
  const trimmed = origin.replace(/\/$/, '')
  const segment = URL_SEGMENTS[entityType]
  if (!segment) return `${trimmed}/${slug}`
  return `${trimmed}/${segment}/${slug}`
}

export function buildSitemapEntries(
  origin: string,
  entityType: SeoEntityType,
  rows: SitemapInputRow[],
): SitemapEntry[] {
  const defaults = SITEMAP_DEFAULTS[entityType]
  const out: SitemapEntry[] = []
  for (const row of rows) {
    if (row.isPublished === false) continue
    if (row.excludeFromSitemap) continue
    if (row.robotsIndex === false) continue

    const entry: SitemapEntry = {
      url: entityUrl(origin, entityType, row.slug),
      changeFrequency: row.sitemapChangeFreq ?? defaults.changeFrequency,
      priority:
        typeof row.sitemapPriority === 'number'
          ? clamp01(row.sitemapPriority)
          : defaults.priority,
    }
    if (row.lastModified) entry.lastModified = row.lastModified
    out.push(entry)
  }
  return out
}

/**
 * For static / hardcoded landing pages (home, /search, /brands index).
 *
 * The home page is spelled as the bare origin ("https://example.com"), never
 * with a trailing slash. That is not cosmetic: the home page's canonical is
 * `BASE_URL` and `buildMetadata` strips any trailing slash from a canonical,
 * so the bare form is the only one that matches the `<link rel="canonical">`
 * and `og:url` the page actually renders. A `loc` that disagrees with the
 * canonical it points at is a self-contradicting sitemap.
 *
 * Both `''` and `'/'` are accepted spellings of the root and both normalise
 * to the bare origin, so adding `{ path: '/' }` to the static list cannot
 * reintroduce the mismatch.
 */
export function buildStaticEntries(
  origin: string,
  paths: { path: string; priority: number; changeFrequency: ChangeFreq }[],
): SitemapEntry[] {
  const trimmed = origin.replace(/\/$/, '')
  return paths.map((p) => ({
    url: isRootPath(p.path) ? trimmed : `${trimmed}${p.path}`,
    priority: clamp01(p.priority),
    changeFrequency: p.changeFrequency,
  }))
}

/** Both spellings of the site root. */
function isRootPath(path: string): boolean {
  return path === '' || path === '/'
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.5
  return Math.max(0, Math.min(1, n))
}
