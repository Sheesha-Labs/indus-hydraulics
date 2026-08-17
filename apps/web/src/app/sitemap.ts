import type { MetadataRoute } from 'next'
import { db } from '@indus/db'
import { buildSitemapEntries, buildStaticEntries } from '@indus/domain'
import { BASE_URL } from '../lib/seo'
import { getReplacementBrands, getReplacementSitemapKeys } from '../lib/replacement-data'

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

// ISR: cache the rendered sitemap for 1 hour. Previously force-dynamic,
// which re-ran every Prisma query on every Googlebot fetch — at 1,800+
// SKUs and growing, that's wasteful and DDoS-able. Admin should call
// `revalidatePath('/sitemap.xml')` after large catalog operations to
// flush early; otherwise the natural 1h cycle is fine for SEO.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Industries became DB-backed in the Tier C migration. The detail
  // page reads from db.industry; we include published rows here so
  // Google can finally crawl them (they were excluded before because
  // the hardcoded slug map could 404 on DB-only slugs).
  const [
    products,
    categories,
    brands,
    blogPosts,
    blogCategories,
    blogAuthors,
    cmsPages,
    industries,
    serviceCases,
  ] = await Promise.all([
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
    db.blogCategory.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        seoUpdatedAt: true,
        updatedAt: true,
        excludeFromSitemap: true,
        robotsIndex: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
      },
    }),
    db.blogAuthor.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        seoUpdatedAt: true,
        updatedAt: true,
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
    db.industry.findMany({
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
    db.serviceCase.findMany({
      where: { status: 'published', publishedAt: { not: null, lte: new Date() } },
      select: {
        slug: true,
        publishedAt: true,
        seoUpdatedAt: true,
        updatedAt: true,
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

  // Industries — the buildSitemapEntries helper expects path prefixes
  // it knows about; industries weren't included previously so we emit
  // entries inline here using the same shape.
  const industryEntries: MetadataRoute.Sitemap = industries
    .filter((i) => !i.excludeFromSitemap && i.robotsIndex)
    .map((i) => ({
      url: `${BASE_URL}/industries/${i.slug}`,
      lastModified: i.seoUpdatedAt ?? undefined,
      changeFrequency:
        i.sitemapChangeFreq ?? ('monthly' as const),
      priority: i.sitemapPriority ? Number(i.sitemapPriority) : 0.6,
    }))

  // Service cases — emitted inline because buildSitemapEntries doesn't
  // know the /services/* prefix yet. Same shape as industries.
  const serviceCaseEntries: MetadataRoute.Sitemap = serviceCases
    .filter((c) => !c.excludeFromSitemap && c.robotsIndex)
    .map((c) => ({
      url: `${BASE_URL}/services/${c.slug}`,
      lastModified: c.seoUpdatedAt ?? c.publishedAt ?? c.updatedAt,
      changeFrequency: c.sitemapChangeFreq ?? ('monthly' as const),
      priority: c.sitemapPriority ? Number(c.sitemapPriority) : 0.7,
    }))

  // Blog category and author hubs — emitted inline for the same reason as
  // industries and service cases: buildSitemapEntries only knows the prefixes
  // in URL_SEGMENTS, and these two are not there.
  //
  // Category hubs carry a higher default priority than individual articles:
  // they are the pages that accumulate internal links from every article
  // filed under them, so they are what a topic actually ranks on.
  const blogCategoryEntries: MetadataRoute.Sitemap = blogCategories
    .filter((c) => !c.excludeFromSitemap && c.robotsIndex)
    .map((c) => ({
      url: `${BASE_URL}/blog/c/${c.slug}`,
      lastModified: c.seoUpdatedAt ?? c.updatedAt,
      changeFrequency: c.sitemapChangeFreq ?? ('weekly' as const),
      priority: c.sitemapPriority ? Number(c.sitemapPriority) : 0.6,
    }))

  const blogAuthorEntries: MetadataRoute.Sitemap = blogAuthors
    .filter((a) => !a.excludeFromSitemap && a.robotsIndex)
    .map((a) => ({
      url: `${BASE_URL}/blog/author/${a.slug}`,
      lastModified: a.seoUpdatedAt ?? a.updatedAt,
      changeFrequency: a.sitemapChangeFreq ?? ('monthly' as const),
      priority: a.sitemapPriority ? Number(a.sitemapPriority) : 0.4,
    }))

  const staticEntries = buildStaticEntries(BASE_URL, [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    // /c became a real category index in the v2 migration — it previously
    // redirected to whichever category sorted first, so it was deliberately
    // absent here.
    { path: '/c', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/brands', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/industries', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/services', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/search', priority: 0.4, changeFrequency: 'monthly' },
    // Programmatic replacement landing pages — high-intent search
    // surface ("parker pv16 replacement") that AI agents cite well.
    { path: '/replacement', priority: 0.7, changeFrequency: 'weekly' },
    // Legal / policy pages render from hardcoded content unless an
    // editor publishes a CmsPage row to override. Listing them here so
    // they're crawlable from day 1 without depending on a CMS row.
    { path: '/shipping', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/returns', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/warranty', priority: 0.4, changeFrequency: 'yearly' },
  ])

  // Per-(brand, mpn) replacement entries. The brand-level index pages
  // (/replacement/<brand>) are emitted from the same source so we
  // don't duplicate the data fetch.
  const [replacementKeys, replacementBrands] = await Promise.all([
    getReplacementSitemapKeys(),
    getReplacementBrands(),
  ])
  const replacementEntries: MetadataRoute.Sitemap = replacementKeys.map((k) => ({
    url: `${BASE_URL}/replacement/${k.brandSlug}/${k.mpnSlug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))
  const replacementBrandEntries: MetadataRoute.Sitemap = replacementBrands.map((b) => ({
    url: `${BASE_URL}/replacement/${b.brandSlug}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [
    ...staticEntries,
    ...productEntries,
    ...categoryEntries,
    ...brandEntries,
    ...blogEntries,
    ...cmsEntries,
    ...industryEntries,
    ...serviceCaseEntries,
    ...blogCategoryEntries,
    ...blogAuthorEntries,
    ...replacementBrandEntries,
    ...replacementEntries,
  ]
}
