import type { MetadataRoute } from 'next'
import { db } from '@indus/db'
import { buildSitemapEntries, buildStaticEntries } from '@indus/domain'
import { BASE_URL } from '../lib/seo'

/**
 * Public XML sitemap. Sources entity rows from Postgres and feeds them
 * through the shared `buildSitemapEntries` helper so the admin previewer
 * renders byte-identical output.
 *
 * Honors the SEO OS overrides on every entity:
 *   - excludeFromSitemap → skipped
 *   - sitemapPriority / sitemapChangeFreq → override defaults
 *   - robotsIndex=false → skipped
 *   - seoUpdatedAt → preferred over updatedAt for lastModified
 */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Note: industries are still rendered from a hardcoded in-file map in
  // industries/[slug]/page.tsx. They're omitted from the sitemap here until
  // that page migrates to db.industry — including DB rows would emit URLs
  // that 404 on slugs the hardcoded map doesn't know.
  const [products, categories, brands, blogPosts, cmsPages] = await Promise.all([
    db.product.findMany({
      where: { status: 'active' },
      select: {
        slug: true,
        updatedAt: true,
        seoUpdatedAt: true,
        excludeFromSitemap: true,
        robotsIndex: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
      },
    }),
    db.category.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        seoUpdatedAt: true,
        excludeFromSitemap: true,
        robotsIndex: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
      },
    }),
    db.brand.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        seoUpdatedAt: true,
        excludeFromSitemap: true,
        robotsIndex: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
      },
    }),
    db.blogPost.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        publishedAt: true,
        seoUpdatedAt: true,
        excludeFromSitemap: true,
        robotsIndex: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
      },
    }),
    db.cmsPage.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        seoUpdatedAt: true,
        excludeFromSitemap: true,
        robotsIndex: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
      },
    }),
  ])

  const productEntries = buildSitemapEntries(
    BASE_URL,
    'product',
    products.map((p) => ({
      slug: p.slug,
      lastModified: p.seoUpdatedAt ?? p.updatedAt,
      excludeFromSitemap: p.excludeFromSitemap,
      robotsIndex: p.robotsIndex,
      sitemapPriority: p.sitemapPriority ? Number(p.sitemapPriority) : null,
      sitemapChangeFreq: p.sitemapChangeFreq,
    })),
  )

  const categoryEntries = buildSitemapEntries(
    BASE_URL,
    'category',
    categories.map((c) => ({
      slug: c.slug,
      lastModified: c.seoUpdatedAt ?? undefined,
      excludeFromSitemap: c.excludeFromSitemap,
      robotsIndex: c.robotsIndex,
      sitemapPriority: c.sitemapPriority ? Number(c.sitemapPriority) : null,
      sitemapChangeFreq: c.sitemapChangeFreq,
    })),
  )

  const brandEntries = buildSitemapEntries(
    BASE_URL,
    'brand',
    brands.map((b) => ({
      slug: b.slug,
      lastModified: b.seoUpdatedAt ?? undefined,
      excludeFromSitemap: b.excludeFromSitemap,
      robotsIndex: b.robotsIndex,
      sitemapPriority: b.sitemapPriority ? Number(b.sitemapPriority) : null,
      sitemapChangeFreq: b.sitemapChangeFreq,
    })),
  )

  const blogEntries = buildSitemapEntries(
    BASE_URL,
    'blog_post',
    blogPosts.map((p) => ({
      slug: p.slug,
      lastModified: p.seoUpdatedAt ?? p.publishedAt ?? undefined,
      excludeFromSitemap: p.excludeFromSitemap,
      robotsIndex: p.robotsIndex,
      sitemapPriority: p.sitemapPriority ? Number(p.sitemapPriority) : null,
      sitemapChangeFreq: p.sitemapChangeFreq,
    })),
  )

  const cmsEntries = buildSitemapEntries(
    BASE_URL,
    'cms_page',
    cmsPages.map((p) => ({
      slug: p.slug,
      lastModified: p.seoUpdatedAt ?? p.updatedAt,
      excludeFromSitemap: p.excludeFromSitemap,
      robotsIndex: p.robotsIndex,
      sitemapPriority: p.sitemapPriority ? Number(p.sitemapPriority) : null,
      sitemapChangeFreq: p.sitemapChangeFreq,
    })),
  )

  const staticEntries = buildStaticEntries(BASE_URL, [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/brands', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/industries', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/search', priority: 0.4, changeFrequency: 'monthly' },
  ])

  return [
    ...staticEntries,
    ...productEntries,
    ...categoryEntries,
    ...brandEntries,
    ...blogEntries,
    ...cmsEntries,
  ]
}
