import { inngest } from './client'
import { db } from '@indus/db'
import { scoreEntity, type SeoEntityType } from '@indus/domain'

/**
 * Nightly recompute of `SeoHealthScore` rows. The site-wide health
 * dashboard at /seo/health computes scores live today (live computation
 * is fast at this catalogue size), but persisting nightly snapshots
 * unlocks trend charts (this week vs last week) and avoids the
 * dashboard having to re-score every URL on every page load once the
 * catalogue grows past a few thousand entities.
 *
 * Steps are explicit so a partial run can resume — Inngest retries on
 * step boundaries, not on the whole function.
 */
const SEO_SELECT = {
  id: true,
  slug: true,
  seoTitle: true,
  seoDescription: true,
  focusKeyword: true,
  canonicalUrl: true,
  robotsIndex: true,
  ogImageMediaId: true,
  excludeFromSitemap: true,
} as const

export const recomputeHealthScores = inngest.createFunction(
  { id: 'seo.health.recompute_all', concurrency: 1 },
  { cron: '0 4 * * *' }, // 04:00 every day, server time
  async ({ step }) => {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
      /\/$/,
      '',
    )
    const seoSetting = await step.run('load-seo-setting', () =>
      db.seoSetting.findFirst({ select: { ogDefaultImageId: true } }),
    )
    const defaultOgPresent = !!seoSetting?.ogDefaultImageId

    const products = await step.run('fetch-products', () =>
      db.product.findMany({
        select: { ...SEO_SELECT, title: true, status: true },
      }),
    )
    const categories = await step.run('fetch-categories', () =>
      db.category.findMany({ select: { ...SEO_SELECT, name: true, isPublished: true } }),
    )
    const brands = await step.run('fetch-brands', () =>
      db.brand.findMany({ select: { ...SEO_SELECT, name: true, isPublished: true } }),
    )
    const industries = await step.run('fetch-industries', () =>
      db.industry.findMany({ select: { ...SEO_SELECT, name: true, isPublished: true } }),
    )
    const blogPosts = await step.run('fetch-blog-posts', () =>
      db.blogPost.findMany({ select: { ...SEO_SELECT, title: true, isPublished: true } }),
    )
    const cmsPages = await step.run('fetch-cms-pages', () =>
      db.cmsPage.findMany({ select: { ...SEO_SELECT, title: true, isPublished: true } }),
    )

    const upserts: Array<{ entityType: SeoEntityType; entityId: string; score: number; breakdown: unknown }> = []
    for (const p of products) {
      const r = scoreEntity({
        title: p.seoTitle ?? p.title,
        description: p.seoDescription,
        focusKeyword: p.focusKeyword,
        url: `/${p.slug}`,
        hasStructuredData: true,
        isIndexable: p.robotsIndex && p.status === 'active' && !p.excludeFromSitemap,
        canonicalCorrect: !p.canonicalUrl || p.canonicalUrl === `${baseUrl}/p/${p.slug}`,
        ogComplete: !!p.ogImageMediaId || defaultOgPresent,
      })
      upserts.push({ entityType: 'product', entityId: p.id, score: r.score, breakdown: r.breakdown })
    }
    pushSimpleScores(upserts, categories, 'category', baseUrl, '/c/', defaultOgPresent)
    pushSimpleScores(upserts, brands, 'brand', baseUrl, '/brands/', defaultOgPresent)
    pushSimpleScores(upserts, industries, 'industry', baseUrl, '/industries/', defaultOgPresent)
    pushSimpleScores(upserts, blogPosts, 'blog_post', baseUrl, '/blog/', defaultOgPresent)
    pushSimpleScores(upserts, cmsPages, 'cms_page', baseUrl, '/', defaultOgPresent, false)

    // Chunk to keep individual transactions sane on large catalogues.
    const CHUNK = 500
    for (let i = 0; i < upserts.length; i += CHUNK) {
      const slice = upserts.slice(i, i + CHUNK)
      await step.run(`upsert-${i / CHUNK}`, async () => {
        for (const row of slice) {
          await db.seoHealthScore.upsert({
            where: { entityType_entityId: { entityType: row.entityType, entityId: row.entityId } },
            create: {
              entityType: row.entityType,
              entityId: row.entityId,
              score: row.score,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              breakdown: row.breakdown as any,
              computedAt: new Date(),
            },
            update: {
              score: row.score,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              breakdown: row.breakdown as any,
              computedAt: new Date(),
            },
          })
        }
      })
    }

    return { scored: upserts.length }
  },
)

type SimpleEntity = {
  id: string
  slug: string
  name?: string
  title?: string
  seoTitle: string | null
  seoDescription: string | null
  focusKeyword: string | null
  canonicalUrl: string | null
  robotsIndex: boolean
  ogImageMediaId: string | null
  excludeFromSitemap: boolean
  isPublished: boolean
}

function pushSimpleScores(
  out: Array<{ entityType: SeoEntityType; entityId: string; score: number; breakdown: unknown }>,
  list: SimpleEntity[],
  entityType: SeoEntityType,
  baseUrl: string,
  pathPrefix: string,
  defaultOgPresent: boolean,
  hasStructuredData = true,
) {
  for (const e of list) {
    const r = scoreEntity({
      title: e.seoTitle ?? e.name ?? e.title ?? '',
      description: e.seoDescription,
      focusKeyword: e.focusKeyword,
      url: `/${e.slug}`,
      hasStructuredData,
      isIndexable: e.robotsIndex && e.isPublished && !e.excludeFromSitemap,
      canonicalCorrect: !e.canonicalUrl || e.canonicalUrl === `${baseUrl}${pathPrefix}${e.slug}`,
      ogComplete: !!e.ogImageMediaId || defaultOgPresent,
    })
    out.push({ entityType, entityId: e.id, score: r.score, breakdown: r.breakdown })
  }
}

export const allFunctions = [recomputeHealthScores]
