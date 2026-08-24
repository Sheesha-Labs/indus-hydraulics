/**
 * The blog article importer, extracted.
 *
 * Waves 1 to 5 each carried their own copy of this function, and by wave 5 the
 * copies were identical apart from the article list. The comment at the top of
 * each of them said a forked copy is how two importers drift and the half that
 * drifts is the one that silently stops checking something — which was true,
 * and was being written directly above a fork. This is that comment taken
 * seriously.
 *
 * The already-executed wave runners are left exactly as they ran. They are
 * one-shot scripts against a database that has their output in it, and
 * rewriting them buys nothing. New waves import this instead.
 *
 * Contract, unchanged from the 2026-08-17 import: validate every block against
 * BlogBlocksSchema, resolve every referenced SKU and catalogue category against
 * the live catalogue, refuse to write anything if any article has a problem,
 * then upsert by slug with `publishedAt` create-only so a re-import never moves
 * a publication date. Idempotent.
 */
import { Prisma } from '@prisma/client'
import {
  BlogBlocksSchema,
  blogReferencedCategorySlugs,
  blogReferencedSkus,
  estimateReadingMinutes,
} from '@indus/domain'

import { db } from '../index'

import type { BlogBlocks } from '@indus/domain'
import type { BlogArticleSeed } from './2026-08-17-blog-articles/shared'

export type BlogArticleImportOptions = {
  articles: BlogArticleSeed[]
  /** Validate and report without writing. */
  dryRun?: boolean
}

export async function runBlogArticleImport({
  articles,
  dryRun = false,
}: BlogArticleImportOptions): Promise<void> {
  const errors: string[] = []
  const seenSlugs = new Set<string>()
  const parsedBlocks = new Map<string, BlogBlocks>()

  for (const article of articles) {
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
        blocks.flatMap((b) => (b.type === 'category_link' ? [b.slug] : []))
      )
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
  for (const article of articles) {
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

  console.log(`${dryRun ? '[dry-run] ' : ''}${articles.length} article(s) validated`)
  for (const a of articles) {
    const blocks = parsedBlocks.get(a.slug)!
    console.log(
      `  /blog/${a.slug} — ${blocks.length} blocks, ~${estimateReadingMinutes(blocks)} min`
    )
  }
  if (dryRun) return

  for (const article of articles) {
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
          Boolean(row.productId)
        ),
      skipDuplicates: true,
    }),
    db.blogPostCategory.deleteMany({ where: { postId } }),
    db.blogPostCategory.createMany({
      data: categorySlugs
        .map((slug, i) => ({ postId, categoryId: categoryIdBySlug.get(slug), position: i }))
        .filter((row): row is { postId: string; categoryId: string; position: number } =>
          Boolean(row.categoryId)
        ),
      skipDuplicates: true,
    }),
  ])
}
