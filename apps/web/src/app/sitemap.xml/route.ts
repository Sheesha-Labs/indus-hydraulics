import {
  SITEMAP_SECTION_IDS,
  sitemapSectionUrl,
} from '../../lib/sitemap-sections'
import { SITEMAP_CONTENT_TYPE, renderSitemapIndex } from '../../lib/sitemap-xml'

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
 */
export const revalidate = 3600

export async function GET(): Promise<Response> {
  const body = renderSitemapIndex(
    SITEMAP_SECTION_IDS.map((id) => ({ url: sitemapSectionUrl(id) })),
  )

  return new Response(body, {
    headers: {
      'Content-Type': SITEMAP_CONTENT_TYPE,
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
