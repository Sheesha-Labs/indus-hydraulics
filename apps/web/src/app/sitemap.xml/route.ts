import { unstable_cache } from 'next/cache'
import { SITEMAP_SECTION_IDS, sitemapSection, sitemapSectionUrl } from '../../lib/sitemap-sections'
import { SITEMAP_CONTENT_TYPE, newestLastModified, renderSitemapIndex } from '../../lib/sitemap-xml'

/**
 * The sitemap index.
 *
 * This URL used to be produced by `app/sitemap.ts` and held all 2,040 entries
 * in one document. It is now an index pointing at one child per section, so
 * Search Console reports coverage per section instead of one averaged number.
 *
 * It stays at exactly this URL because it is already submitted to Search
 * Console and named in robots.txt. Next's own `generateSitemaps()` would have
 * moved it to `/sitemap/<id>.xml` and left nothing here — confirmed by
 * building it — which is why the index is emitted by hand.
 *
 * Each child carries a `lastmod`, which is the whole point of an index: a
 * crawler that sees one can skip the seven sections that have not changed and
 * fetch only the two that have. Without it, discovering that the catalogue is
 * unchanged costs a fetch of 1,480 entries.
 *
 * The dates come from `sitemapSection` rather than from a lighter
 * `max(updatedAt)` query per table: a second source for "what feeds this
 * section" is a second thing to keep in step.
 *
 * That means dating the index costs a full pass over every section, catalogue
 * included, so the pass is wrapped in `unstable_cache` at an hour. The
 * `export const revalidate = 3600` below does NOT bound it — the build
 * manifest resolves this route to 300 seconds regardless, while the children
 * under /sitemaps get the 3600 they ask for. Without the cache the index would
 * re-read 1,480 products every five minutes to compute nine dates.
 */
export const revalidate = 3600

const sectionDates = unstable_cache(
  async () =>
    Promise.all(
      SITEMAP_SECTION_IDS.map(async (id) => ({
        url: sitemapSectionUrl(id),
        lastModified: newestLastModified(await sitemapSection(id)),
      }))
    ),
  ['sitemap-index-lastmod'],
  { revalidate: 3600 }
)

export async function GET(): Promise<Response> {
  const body = renderSitemapIndex(await sectionDates())

  return new Response(body, {
    headers: {
      'Content-Type': SITEMAP_CONTENT_TYPE,
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
