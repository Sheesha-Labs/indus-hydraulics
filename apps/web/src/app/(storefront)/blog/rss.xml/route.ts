import { db } from '@indus/db'
import { BASE_URL, SITE_NAME } from '../../../../lib/seo'

export const revalidate = 3600

/**
 * RSS 2.0 feed for the blog.
 *
 * Worth having for a technical audience specifically: engineers and
 * maintenance planners still read feeds, and a feed is also a cheap,
 * machine-readable index of everything published — useful to any crawler
 * that prefers structure to HTML.
 *
 * Capped at 50 items. A feed is a recency surface, not an archive; the
 * sitemap is the complete list.
 */
export async function GET(): Promise<Response> {
  const posts = await db.blogPost.findMany({
    where: { isPublished: true, robotsIndex: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: { slug: true, title: true, excerpt: true, publishedAt: true, updatedAt: true },
  })

  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`
      const date = (post.publishedAt ?? post.updatedAt).toUTCString()
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${date}</pubDate>`,
        post.excerpt ? `      <description>${escapeXml(post.excerpt)}</description>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Field notes, sizing guides and component teardowns for hydraulic systems.</description>
    <language>en</language>
    <atom:link href="${BASE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

/**
 * Escape the five XML predefined entities. A single unescaped ampersand in a
 * post title — "Hoses & fittings" is the obvious one here — makes the whole
 * feed a parse error, not just that item.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
