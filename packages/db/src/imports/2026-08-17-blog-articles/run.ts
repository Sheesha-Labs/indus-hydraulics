/**
 * Blog article import.
 *
 * Validates every article against BlogBlocksSchema before writing anything,
 * then upserts by slug. Idempotent.
 *
 * Two checks that exist because of how this content is used:
 *
 *  - Every referenced product SKU and category slug is resolved against the
 *    live catalogue up front. A product_embed pointing at a dead SKU renders
 *    as nothing, silently, so the article would quietly lose the commercial
 *    link that justifies it. Better to fail the import.
 *
 *  - publishedAt is preserved on re-run. Re-importing an edited article must
 *    not re-date it, for the same reason the editor must not: datePublished
 *    feeds every downstream consumer.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-17-blog-articles/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-17-blog-articles/run.ts
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
import ARTICLE_01 from './articles/identify-any-hydraulic-fitting'
import ARTICLE_02 from './articles/hydraulic-fluid-injection-injury'
import ARTICLE_03 from './articles/bspp-vs-bspt'
import ARTICLE_04 from './articles/why-hydraulic-hoses-fail'
import ARTICLE_05 from './articles/jic-vs-orfs-vs-npt-vs-bsp'
import ARTICLE_06 from './articles/getting-a-hydraulic-hose-made'
import ARTICLE_07 from './articles/hydraulic-hose-inspection'
import ARTICLE_08 from './articles/hose-routing-bend-radius-twist'
import ARTICLE_09 from './articles/industrial-hose-is-not-hydraulic-hose'
import ARTICLE_10 from './articles/excavator-hydraulic-hose-replacement'
import ARTICLE_11 from './articles/chemical-transfer-hose-selection'
import ARTICLE_12 from './articles/steam-hose-safety'
import ARTICLE_13 from './articles/food-grade-hose-compliance'
import ARTICLE_14 from './articles/forklift-hydraulic-hose-replacement'
import ARTICLE_15 from './articles/tipper-and-transit-mixer-hose'

const ARTICLES: BlogArticleSeed[] = [
  ARTICLE_01,
  ARTICLE_02,
  ARTICLE_03,
  ARTICLE_04,
  ARTICLE_05,
  ARTICLE_06,
  ARTICLE_07,
  ARTICLE_08,
  ARTICLE_09,
  ARTICLE_10,
  ARTICLE_11,
  ARTICLE_12,
  ARTICLE_13,
  ARTICLE_14,
  ARTICLE_15,
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const errors: string[] = []
  const seenSlugs = new Set<string>()

  // Parse once, then work from the PARSED blocks. Seeds are authored as
  // BlogBlocksInput, where defaulted fields are optional; every helper
  // downstream expects them present. Validating first is also the only
  // honest order — counting SKUs in a block that might be malformed is
  // reading data that has not been checked.
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

  // Referenced entities must exist. A dead SKU renders as nothing at all —
  // the article silently loses the product link it was written around.
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
    // Store the PARSED blocks so defaults are materialised in the database
    // rather than re-applied on every read.
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
      // `body` is the legacy HTML column and is NOT NULL. Block-authored
      // articles leave it empty, which is exactly the signal the storefront
      // template reads to choose the block renderer over the prose fallback.
      body: '',
    }

    const saved = await db.blogPost.upsert({
      where: { slug: article.slug },
      // publishedAt is create-only: re-importing an edited article must not
      // re-date it, for the same reason the editor must not.
      update: shared,
      create: { ...shared, slug: article.slug, publishedAt: new Date(article.publishedAt) },
      select: { id: true },
    })

    await syncArticleLinks(saved.id, blocks)
    console.log(`  ✓ /blog/${article.slug}`)
  }

  console.log('done')
}

/**
 * Mirror the article's outbound links into relation rows.
 *
 * The blocks already carry the links, so this is duplication — deliberately.
 * Without it a product page cannot ask "which articles mention me" without
 * scanning every JSON body in the table, and that reverse direction is the
 * half of the loop that makes editorial pay. Reading it out of a relation is
 * an index lookup; reading it out of JSONB is a sequential scan.
 *
 * Rewritten wholesale on every import rather than diffed: an edit that
 * REMOVES a product embed has to remove the row too, and a diff that only
 * ever adds would leave the article advertising a part it no longer mentions.
 */
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
