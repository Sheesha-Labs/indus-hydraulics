import type { MetadataRoute } from 'next'
import { db } from '@indus/db'
import {
  buildSitemapEntries,
  buildStaticEntries,
  designedIndustrySlugs,
  marketsOrdered,
  serviceAreasOrdered,
  REPLACEMENT_INDEX_MIN_MATCHES,
} from '@indus/domain'
import { BASE_URL } from './seo'
import { getReplacementBrands, getReplacementSitemapKeys } from './replacement-data'
import { STATIC_SITEMAP_PATHS } from './crawl-policy'

/**
 * The sitemap, split by section.
 *
 * WHY IT IS SPLIT
 *
 * One sitemap of 2,040 URLs gives Search Console's coverage report exactly one
 * number to show, and that number averages fifteen hundred product pages
 * together with seventy-three articles. When 72 of 2,040 are indexed, that
 * single figure cannot tell you whether Google is rejecting the catalogue, the
 * editorial, or the export pages — which is the only question worth asking.
 *
 * Submitted as separate children, Search Console reports coverage per child.
 * The split is therefore diagnostic instrumentation rather than an SEO trick:
 * it does not make Google index more, it makes the refusals legible.
 *
 * The section boundaries follow how the pages are actually produced, because
 * that is the axis a fix would act along — the catalogue is imported, the
 * editorial is written, the market and location pages are generated from code.
 *
 * All content and ordering here is lifted unchanged from the single
 * `app/sitemap.ts` this replaces; only the grouping is new.
 */

export type SitemapSectionId =
  | 'pages'
  | 'products'
  | 'categories'
  | 'brands'
  | 'blog'
  | 'services'
  | 'industries'
  | 'locations'
  | 'replacement'

export const SITEMAP_SECTION_IDS: readonly SitemapSectionId[] = [
  'pages',
  'products',
  'categories',
  'brands',
  'blog',
  'services',
  'industries',
  'locations',
  'replacement',
] as const

export function isSitemapSectionId(value: string): value is SitemapSectionId {
  return (SITEMAP_SECTION_IDS as readonly string[]).includes(value)
}

/** Public URL of a child sitemap. */
export function sitemapSectionUrl(id: SitemapSectionId): string {
  return `${BASE_URL}/sitemaps/${id}.xml`
}

// ── Section builders ──────────────────────────────────────────────────────

async function pagesSection(): Promise<MetadataRoute.Sitemap> {
  const cmsPages = await db.cmsPage.findMany({
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
  })

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

  return [...buildStaticEntries(BASE_URL, STATIC_SITEMAP_PATHS), ...cmsEntries]
}

async function productsSection(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
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
  })

  return buildSitemapEntries(
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
}

/**
 * NO `lastmod` HERE, AND THAT IS DELIBERATE — 2026-09-04.
 *
 * 448 sitemap URLs across categories, brands, industries and locations carry no
 * `<lastmod>`, which is a real weakness: a crawler has nothing to schedule on,
 * and 1,733 URLs on this domain are sitting in "Discovered – currently not
 * indexed", never fetched.
 *
 * The fix is NOT to invent a date. `Category`, `Brand` and `Industry` have no
 * modification timestamp at all — only `seoUpdatedAt`, set when an editor opens
 * the SEO panel — and the two dates within reach are both lies: `now()` says
 * every shelf changed on every sitemap fetch, and a backfilled column says all
 * 194 changed the day the migration ran. A crawler that catches a sitemap
 * claiming daily change on a page that never changes learns to discount the
 * dates on this host, which costs more than the missing field.
 *
 * The honest fix is a real `updatedAt` on these tables, set by actual edits,
 * accumulating truthful dates from then on. That is a schema change and it is
 * tracked as follow-up work, not smuggled in here.
 */
async function categoriesSection(): Promise<MetadataRoute.Sitemap> {
  const categories = await db.category.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      seoUpdatedAt: true,
      excludeFromSitemap: true,
      robotsIndex: true,
      sitemapPriority: true,
      sitemapChangeFreq: true,
    },
  })

  return buildSitemapEntries(
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
}

async function brandsSection(): Promise<MetadataRoute.Sitemap> {
  const brands = await db.brand.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      seoUpdatedAt: true,
      excludeFromSitemap: true,
      robotsIndex: true,
      sitemapPriority: true,
      sitemapChangeFreq: true,
    },
  })

  return buildSitemapEntries(
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
}

/** Articles plus their category and author hubs — the whole editorial surface. */
async function blogSection(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, blogCategories, blogAuthors] = await Promise.all([
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
  ])

  const postEntries = buildSitemapEntries(
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

  // Category hubs carry a higher default priority than individual articles:
  // they accumulate internal links from every article filed under them, so
  // they are what a topic actually ranks on.
  const categoryEntries: MetadataRoute.Sitemap = blogCategories
    .filter((c) => !c.excludeFromSitemap && c.robotsIndex)
    .map((c) => ({
      url: `${BASE_URL}/blog/c/${c.slug}`,
      lastModified: c.seoUpdatedAt ?? c.updatedAt,
      changeFrequency: c.sitemapChangeFreq ?? ('weekly' as const),
      priority: c.sitemapPriority ? Number(c.sitemapPriority) : 0.6,
    }))

  const authorEntries: MetadataRoute.Sitemap = blogAuthors
    .filter((a) => !a.excludeFromSitemap && a.robotsIndex)
    .map((a) => ({
      url: `${BASE_URL}/blog/author/${a.slug}`,
      lastModified: a.seoUpdatedAt ?? a.updatedAt,
      changeFrequency: a.sitemapChangeFreq ?? ('monthly' as const),
      priority: a.sitemapPriority ? Number(a.sitemapPriority) : 0.4,
    }))

  return [...postEntries, ...categoryEntries, ...authorEntries]
}

async function servicesSection(): Promise<MetadataRoute.Sitemap> {
  const serviceCases = await db.serviceCase.findMany({
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
  })

  return serviceCases
    .filter((c) => !c.excludeFromSitemap && c.robotsIndex)
    .map((c) => ({
      url: `${BASE_URL}/services/${c.slug}`,
      lastModified: c.seoUpdatedAt ?? c.publishedAt ?? c.updatedAt,
      changeFrequency: c.sitemapChangeFreq ?? ('monthly' as const),
      priority: c.sitemapPriority ? Number(c.sitemapPriority) : 0.7,
    }))
}

async function industriesSection(): Promise<MetadataRoute.Sitemap> {
  const industries = await db.industry.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      seoUpdatedAt: true,
      excludeFromSitemap: true,
      robotsIndex: true,
      sitemapPriority: true,
      sitemapChangeFreq: true,
    },
  })

  const dbEntries: MetadataRoute.Sitemap = industries
    .filter((i) => !i.excludeFromSitemap && i.robotsIndex)
    .map((i) => ({
      url: `${BASE_URL}/industries/${i.slug}`,
      lastModified: i.seoUpdatedAt ?? undefined,
      changeFrequency: i.sitemapChangeFreq ?? ('monthly' as const),
      priority: i.sitemapPriority ? Number(i.sitemapPriority) : 0.6,
    }))

  // Designed industry pages live in code, not in the `industries` table, so
  // the query cannot see them. Higher priority because these are built to rank
  // for a specific buying intent. No `lastModified`: the content changes on
  // deploy, and a date from the request clock would tell a crawler the page
  // changed every time it fetched the sitemap.
  const designedEntries: MetadataRoute.Sitemap = designedIndustrySlugs().map((slug) => ({
    url: `${BASE_URL}/industries/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...dbEntries, ...designedEntries]
}

/** Service areas and export markets — both generated from static data. */
function locationsSection(): MetadataRoute.Sitemap {
  const serviceAreas: MetadataRoute.Sitemap = serviceAreasOrdered().map((a) => ({
    url: `${BASE_URL}/locations/${a.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const markets: MetadataRoute.Sitemap = marketsOrdered().map((m) => ({
    url: `${BASE_URL}/markets/${m.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...serviceAreas, ...markets]
}

/**
 * Replacement pages — brand hubs only, until a part page has something to say.
 *
 * WHY THE PART PAGES CAME OUT (2026-09-04)
 *
 * Every one of the 71 `/replacement/<brand>/<mpn>` pages resolves to exactly
 * ONE cross-reference row. Measured on production: 245 and 251 visible words on
 * two of them, and a **71% six-gram overlap** between the pair. That is one
 * template with a part number swapped in, published 71 times.
 *
 * Submitting 71 near-identical pages in a sitemap is not a neutral act on a
 * site Google is already rationing. The whole domain sat at 1,733 URLs in
 * "Discovered – currently not indexed" — 83% of it never fetched at all — and a
 * cluster like this is exactly the sample Google draws on when it decides how
 * much of a host is worth crawling.
 *
 * So the hubs stay in (they list every MPN we cover for a brand and are
 * genuinely useful), and the leaves come out. They are NOT deleted and NOT
 * blocked in robots.txt: they stay reachable, internally linked and crawlable,
 * carrying `noindex, follow` from the page itself. See the note in
 * `replacement/[brand]/[mpn]/page.tsx`.
 *
 * THE GATE IS DATA, NOT A DATE. A part page re-enters the sitemap and the index
 * the moment it carries `REPLACEMENT_INDEX_MIN_MATCHES` verified equivalents,
 * because at that point it is a comparison rather than a stub. Nothing here has
 * to be revisited by hand when the catalogue grows.
 */
async function replacementSection(): Promise<MetadataRoute.Sitemap> {
  const [keys, brands] = await Promise.all([
    getReplacementSitemapKeys(),
    getReplacementBrands(),
  ])

  const brandEntries: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE_URL}/replacement/${b.brandSlug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  const partEntries: MetadataRoute.Sitemap = keys
    .filter((k) => k.matches >= REPLACEMENT_INDEX_MIN_MATCHES)
    .map((k) => ({
      url: `${BASE_URL}/replacement/${k.brandSlug}/${k.mpnSlug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  return [...brandEntries, ...partEntries]
}

/** Entries for one section. */
export async function sitemapSection(id: SitemapSectionId): Promise<MetadataRoute.Sitemap> {
  switch (id) {
    case 'pages':
      return pagesSection()
    case 'products':
      return productsSection()
    case 'categories':
      return categoriesSection()
    case 'brands':
      return brandsSection()
    case 'blog':
      return blogSection()
    case 'services':
      return servicesSection()
    case 'industries':
      return industriesSection()
    case 'locations':
      return locationsSection()
    case 'replacement':
      return replacementSection()
  }
}
