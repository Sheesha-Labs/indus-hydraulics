import type { MetadataRoute } from 'next'

/**
 * Sitemap serialisation, done by hand.
 *
 * WHY NOT `generateSitemaps()`
 *
 * Next's own helper does split a sitemap, but it moves the output to
 * `/sitemap/<id>.xml` and **removes `/sitemap.xml` entirely** — verified by
 * building it: the route list came back with `/sitemap/catalogue.xml` and
 * `/sitemap/editorial.xml` and no `/sitemap.xml` at all.
 *
 * That URL is already submitted to Search Console and is the one named in
 * robots.txt. Breaking it to gain a split would cost more than the split is
 * worth, so the index is emitted explicitly and `/sitemap.xml` keeps meaning
 * what it has always meant.
 *
 * The `MetadataRoute.Sitemap` shape is kept as the input type so the section
 * builders are unchanged from when Next was serialising them.
 */

/** XML text escaping. URLs here are slugs, but ampersands are cheap to get wrong. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIsoDate(value: Date | string | undefined): string | null {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** A `<urlset>` document — one section's worth of URLs. */
export function renderUrlset(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.url)}</loc>`]
      const lastmod = toIsoDate(entry.lastModified as Date | string | undefined)
      if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`)
      if (entry.changeFrequency) parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`)
      if (typeof entry.priority === 'number') {
        parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`)
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export type SitemapIndexChild = { url: string; lastModified?: Date | string }

/** A `<sitemapindex>` document — the list of child sitemaps. */
export function renderSitemapIndex(children: SitemapIndexChild[]): string {
  const items = children
    .map((child) => {
      const parts = [`    <loc>${escapeXml(child.url)}</loc>`]
      const lastmod = toIsoDate(child.lastModified)
      if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`)
      return `  <sitemap>\n${parts.join('\n')}\n  </sitemap>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`
}

export const SITEMAP_CONTENT_TYPE = 'application/xml; charset=utf-8'

/**
 * Newest `lastModified` across a set of sitemap entries, or undefined when
 * none of them carry one.
 *
 * Used to date a child in the sitemap index. A section whose entries all omit
 * the field — the designed industry pages do so deliberately — yields no date
 * rather than today's: a date taken from the request clock would tell a
 * crawler the section changed every time it looked.
 */
export function newestLastModified(
  entries: ReadonlyArray<{ lastModified?: string | Date }>
): Date | undefined {
  let newest: number | undefined
  for (const entry of entries) {
    if (!entry.lastModified) continue
    const time = new Date(entry.lastModified).getTime()
    if (Number.isNaN(time)) continue
    if (newest === undefined || time > newest) newest = time
  }
  return newest === undefined ? undefined : new Date(newest)
}
