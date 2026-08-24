/**
 * Wave 3, Gulf-conditions cluster — the category and eight articles.
 *
 * Same contract as the 2026-08-17 import: validate every block, resolve every
 * referenced SKU and category against the live catalogue, then upsert by slug
 * with publishedAt create-only. Idempotent.
 *
 * The validation and link-sync logic is imported rather than copied. There was
 * one article importer and there should stay one — a forked copy is how the
 * two drift, and the half that drifts is always the one that silently stops
 * checking something.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-wave-3-gulf/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-24-blog-wave-3-gulf/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { db } from '../../index'
import {
  BlogBlocksSchema,
  blogReferencedCategorySlugs,
  blogReferencedSkus,
  estimateReadingMinutes,
} from '@indus/domain'

import type { BlogBlocks } from '@indus/domain'
import type { BlogArticleSeed } from './shared'
import ARTICLE_01 from './articles/hydraulic-hose-in-uae-heat'
import ARTICLE_02 from './articles/hydraulic-hose-uv-and-ozone'
import ARTICLE_03 from './articles/hydraulic-hose-sand-abrasion'
import ARTICLE_04 from './articles/hydraulic-hose-coastal-corrosion'
import ARTICLE_05 from './articles/offshore-hydraulic-hose'
import ARTICLE_06 from './articles/hydraulic-hose-shelf-life-storage'
import ARTICLE_07 from './articles/why-summer-is-harder-on-hydraulic-hose'
import ARTICLE_08 from './articles/desalination-and-water-treatment-hose'
import { GULF_CATEGORY } from './category'

const ARTICLES: BlogArticleSeed[] = [
  ARTICLE_01,
  ARTICLE_02,
  ARTICLE_03,
  ARTICLE_04,
  ARTICLE_05,
  ARTICLE_06,
  ARTICLE_07,
  ARTICLE_08,
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const errors: string[] = []

  // The category has to exist before the articles are validated against it,
  // and it has to carry its body from the start — the nine hubs that shipped
  // empty in August needed a whole retrofit in wave 2 to fix exactly that.
  const categoryBlocks = BlogBlocksSchema.safeParse(GULF_CATEGORY.bodyBlocks)
  if (!categoryBlocks.success) {
    for (const issue of categoryBlocks.error.issues) {
      errors.push(`[category] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
    }
  } else if (!DRY_RUN) {
    const { bodyBlocks: _seedBlocks, ...categoryFields } = GULF_CATEGORY
    const stored = JSON.parse(JSON.stringify(categoryBlocks.data)) as Prisma.InputJsonValue
    await db.blogCategory.upsert({
      where: { slug: GULF_CATEGORY.slug },
      update: { ...categoryFields, bodyBlocks: stored },
      create: { ...categoryFields, bodyBlocks: stored },
    })
    console.log(`  \u2713 /blog/c/${GULF_CATEGORY.slug} (category)`)
  } else {
    console.log(
      `[dry-run] category ${GULF_CATEGORY.slug} \u2014 ${categoryBlocks.data.length} blocks \u2014 "${GULF_CATEGORY.focusKeyword}"`,
    )
  }
  const seenSlugs = new Set<string>()
  const parsedBlocks = new Map<string, BlogBlocks>()

  for (const article of ARTICLES) {
    if (seenSlugs.has(article.slug)) errors.push(`duplicate slug: ${article.slug}`)
    seenSlugs.add(article.slug)

    const parsed = BlogBlocksSchema.safeParse(article.bodyBlocks)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`[${article.slug}] bodyBlocks.${issue.path.join('.')}: ${issue.message}`)
      }
      continue
    }
    parsedBlocks.set(article.slug, parsed.data)
  }

  const allParsed = [...parsedBlocks.values()]
  const allSkus = [...new Set(allParsed.flatMap((blocks) => blogReferencedSkus(blocks)))]
  const allCategoryLinks = [
    ...new Set(
      allParsed.flatMap((blocks) =>
        blocks.flatMap((b) => (b.type === 'category_link' ? [b.slug] : [])),
      ),
    ),
  ]

  const [foundSkus, foundCategories, blogCategories, blogAuthors] = await Promise.all([
    allSkus.length
      ? db.product.findMany({ where: { sku: { in: allSkus } }, select: { sku: true } })
      : Promise.resolve([]),
    allCategoryLinks.length
      ? db.category.findMany({
          where: { slug: { in: allCategoryLinks }, isPublished: true },
          select: { slug: true },
        })
      : Promise.resolve([]),
    db.blogCategory.findMany({ select: { id: true, slug: true } }),
    db.blogAuthor.findMany({ select: { id: true, slug: true } }),
  ])

  const skuSet = new Set(foundSkus.map((p) => p.sku))
  for (const sku of allSkus) if (!skuSet.has(sku)) errors.push(`unknown product SKU: ${sku}`)

  const catSet = new Set(foundCategories.map((c) => c.slug))
  for (const slug of allCategoryLinks) {
    if (!catSet.has(slug)) errors.push(`unknown or unpublished catalogue category: ${slug}`)
  }

  const blogCatBySlug = new Map(blogCategories.map((c) => [c.slug, c.id]))
  // On a dry run the category has not been written, so it is legitimately
  // absent from the query above. Seeding a placeholder id keeps the article
  // check meaningful for every OTHER category slug instead of drowning the
  // real errors in eight false ones.
  if (DRY_RUN && !blogCatBySlug.has(GULF_CATEGORY.slug)) {
    blogCatBySlug.set(GULF_CATEGORY.slug, '<dry-run>')
  }
  const blogAuthorBySlug = new Map(blogAuthors.map((a) => [a.slug, a.id]))
  for (const article of ARTICLES) {
    if (!blogCatBySlug.has(article.categorySlug)) {
      errors.push(`[${article.slug}] unknown blog category: ${article.categorySlug}`)
    }
    if (!blogAuthorBySlug.has(article.authorSlug)) {
      errors.push(`[${article.slug}] unknown blog author: ${article.authorSlug}`)
    }
  }

  if (errors.length) {
    console.error(`${errors.length} problem(s):`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${ARTICLES.length} article(s) validated`)
  for (const a of ARTICLES) {
    const blocks = parsedBlocks.get(a.slug)!
    console.log(
      `  /blog/${a.slug} — ${blocks.length} blocks, ~${estimateReadingMinutes(blocks)} min`,
    )
  }
  if (DRY_RUN) return

  for (const article of ARTICLES) {
    const blocks = parsedBlocks.get(article.slug)!
    const readingMinutes = estimateReadingMinutes(blocks)
    const bodyBlocks = JSON.parse(JSON.stringify(blocks)) as Prisma.InputJsonValue

    const shared = {
      title: article.title,
      excerpt: article.excerpt,
      bodyBlocks,
      readingMinutes,
      categoryId: blogCatBySlug.get(article.categorySlug)!,
      blogAuthorId: blogAuthorBySlug.get(article.authorSlug)!,
      seoTitle: article.seoTitle ?? null,
      seoDescription: article.seoDescription ?? null,
      focusKeyword: article.focusKeyword ?? null,
      isPublished: true,
      status: 'published' as const,
      body: '',
    }

    const saved = await db.blogPost.upsert({
      where: { slug: article.slug },
      update: shared,
      create: { ...shared, slug: article.slug, publishedAt: new Date(article.publishedAt) },
      select: { id: true },
    })

    await syncArticleLinks(saved.id, blocks)
    console.log(`  ✓ /blog/${article.slug}`)
  }

  console.log('done')
}

async function syncArticleLinks(postId: string, blocks: BlogBlocks): Promise<void> {
  const skus = blogReferencedSkus(blocks)
  const categorySlugs = blogReferencedCategorySlugs(blocks)

  const [products, categories] = await Promise.all([
    skus.length
      ? db.product.findMany({ where: { sku: { in: skus } }, select: { id: true, sku: true } })
      : Promise.resolve([]),
    categorySlugs.length
      ? db.category.findMany({
          where: { slug: { in: categorySlugs } },
          select: { id: true, slug: true },
        })
      : Promise.resolve([]),
  ])

  const productIdBySku = new Map(products.map((p) => [p.sku, p.id]))
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]))

  await db.$transaction([
    db.blogPostProduct.deleteMany({ where: { postId } }),
    db.blogPostProduct.createMany({
      data: skus
        .map((sku, i) => ({ postId, productId: productIdBySku.get(sku), position: i }))
        .filter((row): row is { postId: string; productId: string; position: number } =>
          Boolean(row.productId),
        ),
      skipDuplicates: true,
    }),
    db.blogPostCategory.deleteMany({ where: { postId } }),
    db.blogPostCategory.createMany({
      data: categorySlugs
        .map((slug, i) => ({ postId, categoryId: categoryIdBySlug.get(slug), position: i }))
        .filter((row): row is { postId: string; categoryId: string; position: number } =>
          Boolean(row.categoryId),
        ),
      skipDuplicates: true,
    }),
  ])
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
