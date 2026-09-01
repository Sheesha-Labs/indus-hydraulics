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
  blogReferencedArticleSlugs,
  blogReferencedCategorySlugs,
  blogReferencedPageLinks,
  blogReferencedSkus,
  buildMarketReachBlock,
  designedIndustrySlugs,
  estimateReadingMinutes,
  marketsOrdered,
} from '@indus/domain'

import { db } from '../index'
import { BLOG_CROSS_LINKS } from './blog-cross-links'
import { BLOG_SEO } from './blog-seo'
import { BLOG_FIGURES } from './blog-figures'

import type { BlogBlocks, BlogBlocksInput } from '@indus/domain'
import type { BlogArticleSeed } from './2026-08-17-blog-articles/shared'

/**
 * Inserts each article's in-article photographs.
 *
 * `afterSection` is 1-based over the article's own `section_head` blocks and
 * the figure goes immediately after that heading, so a picture always opens a
 * section rather than cutting an argument in half. A figure whose target
 * section does not exist is dropped rather than appended somewhere arbitrary —
 * silently moving a picture to the end of an article is worse than omitting it.
 *
 * `heroIdBySlug` maps the borrowed article's slug to its hero Media id, which
 * is what `imageId` holds. See the note in ./blog-figures.ts for why that is a
 * media id and not a storage path.
 *
 * Existing figures are stripped first, so a re-import replaces the set rather
 * than stacking a second copy underneath.
 */
export function withFigures(
  slug: string,
  blocks: BlogBlocksInput,
  heroIdBySlug: Map<string, string>
): BlogBlocksInput {
  const figures = BLOG_FIGURES[slug]
  const base = blocks.filter((b) => b.type !== 'figure')
  if (!figures?.length) return base

  // Insert from the last target backwards, so earlier indices stay valid.
  const ordered = [...figures].sort((a, b) => b.afterSection - a.afterSection)
  let out: BlogBlocksInput = base

  for (const figure of ordered) {
    // A figure with no `from` is a reserved slot: the block is written with a
    // null id and renders as nothing until an image pass fills it. A figure
    // that names an article whose hero cannot be resolved is a mistake rather
    // than an intention, so that one is still skipped.
    const imageId = figure.from ? (heroIdBySlug.get(figure.from) ?? null) : null
    if (figure.from && !imageId) continue

    let seen = 0
    let at = -1
    out.forEach((block, i) => {
      if (block.type !== 'section_head') return
      seen += 1
      if (seen === figure.afterSection && at === -1) at = i
    })
    if (at === -1) continue

    out = [
      ...out.slice(0, at + 1),
      {
        type: 'figure',
        imageId,
        caption: figure.caption,
        aspectRatio: figure.aspectRatio ?? '16/9',
        ...(figure.placeholderLabel ? { placeholderLabel: figure.placeholderLabel } : {}),
        ...(figure.captionPrefix ? { captionPrefix: figure.captionPrefix } : {}),
      },
      ...out.slice(at + 1),
    ]
  }

  return out
}

/**
 * Composes an article's seed blocks with its entry in the link graph, and with
 * the delivery-reach section derived from its blog category.
 *
 * The generated blocks go immediately before the closing `cta_block`, which
 * every article carries: related reading, onward links and "where we ship
 * this" belong at the end of the argument, not interrupting it. An article
 * with no CTA gets them appended.
 *
 * `skus` is a fallback rather than an addition — an article that embeds its own
 * products keeps exactly those, because the author picked them against the
 * specific thing the article says.
 *
 * `categorySlug` is optional, and its absence means "leave any existing reach
 * section alone" rather than "this article has none". The distinction is load
 * bearing: the 2026-08-25 cross-links script calls this without a category, and
 * an unconditional strip would have it quietly delete the reach block off all
 * 93 articles the next time anyone re-ran it.
 */
export function withCrossLinks(
  slug: string,
  blocks: BlogBlocksInput,
  categorySlug?: string
): BlogBlocksInput {
  const links = BLOG_CROSS_LINKS[slug]
  const reach = categorySlug ? buildMarketReachBlock(slug, categorySlug) : null
  if (!links && !reach) return blocks

  const generated: BlogBlocksInput = []

  const hasOwnProducts = blocks.some((b) => b.type === 'product_embed')
  if (links?.skus?.length && !hasOwnProducts) {
    generated.push({ type: 'product_embed', heading: 'Parts for this job', skus: links.skus })
  }
  for (const page of links?.pages ?? []) {
    generated.push({ type: 'page_link', ...page })
  }
  if (links?.related?.length) {
    generated.push({ type: 'related_articles', slugs: links.related })
  }
  // Last of the generated run, so the reader's final step before the quote
  // panel is "and we ship this to you" rather than "here is more to read".
  if (reach) generated.push(reach)

  if (generated.length === 0) return blocks

  // Strip any previously generated link blocks so a re-import replaces the
  // graph rather than stacking a second copy of it underneath the first.
  const base = blocks.filter(
    (b) =>
      b.type !== 'related_articles' &&
      b.type !== 'page_link' &&
      (b.type !== 'market_reach' || !reach)
  )

  let ctaIndex = -1
  base.forEach((b, i) => {
    if (b.type === 'cta_block') ctaIndex = i
  })
  if (ctaIndex === -1) return [...base, ...generated]
  return [...base.slice(0, ctaIndex), ...generated, ...base.slice(ctaIndex)]
}

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

  // Figures are composed here rather than by a one-shot script, so a re-import
  // reapplies them the same way it reapplies the link graph and the SEO
  // metadata. Before this, `withFigures` existed and nothing in the import path
  // called it: the 2026-08-25 script applied the figures once and any later
  // re-run of a wave silently dropped them.
  //
  // A borrowed figure resolves to the lending article's hero; a reserved slot
  // has no `from` and resolves to null, which renders as nothing until an image
  // pass fills it.
  const heroes = await db.blogPost.findMany({
    where: { heroId: { not: null } },
    select: { slug: true, heroId: true },
  })
  const heroIdBySlug = new Map<string, string>()
  for (const h of heroes) if (h.heroId) heroIdBySlug.set(h.slug, h.heroId)

  for (const article of articles) {
    if (seenSlugs.has(article.slug)) errors.push(`duplicate slug: ${article.slug}`)
    seenSlugs.add(article.slug)

    const parsed = BlogBlocksSchema.safeParse(
      withFigures(
        article.slug,
        withCrossLinks(article.slug, article.bodyBlocks, article.categorySlug),
        heroIdBySlug
      )
    )
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
  const allPageLinks = [
    ...new Map(
      allParsed
        .flatMap((blocks) => blogReferencedPageLinks(blocks))
        .map((l) => [`${l.kind}:${l.slug}`, l])
    ).values(),
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

  // page_link targets. Markets live in code, so that check is free and exact;
  // services and industries are rows — and a designed industry page is neither,
  // it is a slug in code that the `industries` table cannot see.
  const marketSlugs = new Set(marketsOrdered().map((m) => m.slug))
  const wantedServices = allPageLinks.filter((l) => l.kind === 'service').map((l) => l.slug)
  const wantedIndustries = allPageLinks.filter((l) => l.kind === 'industry').map((l) => l.slug)

  const [foundServices, foundIndustries] = await Promise.all([
    wantedServices.length
      ? db.serviceCase.findMany({
          where: { slug: { in: wantedServices }, status: 'published' },
          select: { slug: true },
        })
      : Promise.resolve([]),
    wantedIndustries.length
      ? db.industry.findMany({
          where: { slug: { in: wantedIndustries }, isPublished: true },
          select: { slug: true },
        })
      : Promise.resolve([]),
  ])

  const serviceSet = new Set(foundServices.map((row) => row.slug))
  const industrySet = new Set([...foundIndustries.map((i) => i.slug), ...designedIndustrySlugs()])

  for (const link of allPageLinks) {
    const ok =
      link.kind === 'market'
        ? marketSlugs.has(link.slug)
        : link.kind === 'service'
          ? serviceSet.has(link.slug)
          : industrySet.has(link.slug)
    if (!ok) errors.push(`unknown or unpublished ${link.kind} page: ${link.slug}`)
  }

  // related_articles. Resolved against the articles already live plus the ones
  // in this batch, so a wave can cross-link within itself on first import. An
  // article may not link to itself: it reads as a bug to everyone who clicks it.
  const wantedArticles = [
    ...new Set(allParsed.flatMap((blocks) => blogReferencedArticleSlugs(blocks))),
  ]
  if (wantedArticles.length) {
    const live = await db.blogPost.findMany({
      where: { slug: { in: wantedArticles }, isPublished: true, deletedAt: null },
      select: { slug: true },
    })
    const known = new Set([...live.map((row) => row.slug), ...articles.map((a) => a.slug)])
    for (const slug of wantedArticles) {
      if (!known.has(slug)) errors.push(`unknown or unpublished article: ${slug}`)
    }
  }
  for (const article of articles) {
    const blocks = parsedBlocks.get(article.slug)
    if (blocks && blogReferencedArticleSlugs(blocks).includes(article.slug)) {
      errors.push(`[${article.slug}] related_articles links to itself`)
    }
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
      // BLOG_SEO wins over the seed. The seed values predate the scoring
      // audit and 57 of them carried a keyword that appeared in neither the
      // title nor the URL, which costs score rather than earning it.
      seoTitle: BLOG_SEO[article.slug]?.seoTitle ?? article.seoTitle ?? null,
      seoDescription: BLOG_SEO[article.slug]?.seoDescription ?? article.seoDescription ?? null,
      focusKeyword: BLOG_SEO[article.slug]?.focusKeyword ?? article.focusKeyword ?? null,
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

export async function syncArticleLinks(postId: string, blocks: BlogBlocks): Promise<void> {
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
