import { notFound } from 'next/navigation'
import { isSitemapSectionId, sitemapSection } from '../../../lib/sitemap-sections'
import { SITEMAP_CONTENT_TYPE, renderUrlset } from '../../../lib/sitemap-xml'

/**
 * One child sitemap per section, served at `/sitemaps/<section>.xml`.
 *
 * The `.xml` suffix is part of the dynamic segment rather than a route folder
 * because Next treats a `sitemap.xml` directory name as the metadata
 * convention. Stripping it here keeps the public URLs conventional without
 * fighting the framework for the name.
 */
export const revalidate = 3600

/**
 * Empty on purpose: no section is built ahead. Each one reads the whole catalogue, and building them
 * during `next build` made every deploy depend on the database accepting connections at that moment —
 * a refused connection failed the deploy. An empty list keeps the route on the incremental cache; each
 * section renders on its first request and is cached for `revalidate` (and at the CDN by the header
 * below), so crawlers see the same thing a minute after a deploy.
 */
export function generateStaticParams(): { section: string }[] {
  return []
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ section: string }> },
): Promise<Response> {
  const { section } = await ctx.params
  const id = section.replace(/\.xml$/, '')

  // A bad section name is a 404, not an empty sitemap. An empty `<urlset>`
  // would look like a section that legitimately has no pages, and Search
  // Console would report it as such rather than as a mistake.
  if (!isSitemapSectionId(id)) notFound()

  const body = renderUrlset(await sitemapSection(id))

  return new Response(body, {
    headers: {
      'Content-Type': SITEMAP_CONTENT_TYPE,
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
