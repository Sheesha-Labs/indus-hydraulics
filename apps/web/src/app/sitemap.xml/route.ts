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
 * included, so the pass is wrapped in `unstable_cache` at an hour.
 *
 * RENDERED ON REQUEST, CACHED BY THE CDN — 2026-09-24.
 *
 * This route used to export `revalidate = 3600` and trust ISR to refresh it.
 * It did not. Measured on production 2026-09-24: the index carried a
 * `last-modified` of 2026-09-11 18:32 UTC and an `age` of 12.6 days — it
 * regenerated once, sixteen hours after the deploy, and never again — while
 * the children under /sitemaps, with the same `revalidate`, were an hour old.
 * The runtime logs show the requests and no error. Whatever the cause, every
 * date in the index was frozen: a post published from the CMS reached
 * `blog.xml` and never moved the index's `<lastmod>` for it, which is the one
 * signal the index exists to carry.
 *
 * `force-dynamic` takes the route out of the prerender, and the response's own
 * `s-maxage` has the CDN hold it for the hour ISR was supposed to. The cost is
 * one function invocation per hour per edge region, and the section pass
 * inside it is itself cached.
 */
export const dynamic = 'force-dynamic'

const CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

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

/**
 * The index without dates — still a complete, valid index.
 *
 * Served when the section pass fails, typically a database timeout. An index
 * that answers 500 tells Search Console the sitemap is broken; one without
 * `<lastmod>` only tells it to fetch every child, which is what it did before
 * the dates existed. Held for a minute rather than an hour so the next request
 * retries.
 */
function undatedIndex(): Response {
  return new Response(
    renderSitemapIndex(SITEMAP_SECTION_IDS.map((id) => ({ url: sitemapSectionUrl(id) }))),
    {
      headers: {
        'Content-Type': SITEMAP_CONTENT_TYPE,
        'Cache-Control': 'public, max-age=0, s-maxage=60',
      },
    }
  )
}

export async function GET(): Promise<Response> {
  let children
  try {
    children = await sectionDates()
  } catch (error) {
    console.error('[sitemap] dating the index failed; serving it undated', error)
    return undatedIndex()
  }

  return new Response(renderSitemapIndex(children), {
    headers: {
      'Content-Type': SITEMAP_CONTENT_TYPE,
      'Cache-Control': CACHE_CONTROL,
    },
  })
}
