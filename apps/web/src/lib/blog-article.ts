import { db } from '@indus/db'
import {
  blogFaqPairs,
  blogReferencedArticleSlugs,
  blogReferencedPageLinks,
  blogReferencedSkus,
  blogTocEntries,
  designedIndustrySlugs,
  marketsOrdered,
  parseBlogBlocks,
  type BlogBlocks,
} from '@indus/domain'

import type { RelatedArticle } from '../components/blog/RelatedReading'

/**
 * Server-side resolution for a blog article body.
 *
 * Blocks reference products by SKU and categories by slug rather than by id,
 * so an author can write one without a database lookup. That means the page
 * has to resolve them — and it does so in two queries for the whole article,
 * not one per block. `blogReferencedSkus` de-duplicates first, so an article
 * that embeds the same hose in three sections still costs one round trip.
 *
 * Anything that fails to resolve is simply absent from the map. The renderer
 * skips those rather than rendering a dead card: a deleted SKU should leave a
 * gap in an article, never a link to a 404.
 */

export type EmbeddedProduct = {
  sku: string
  slug: string
  title: string
  descriptionShort: string | null
  brandName: string | null
  imagePath: string | null
  imageAlt: string | null
}

export type EmbeddedFigure = {
  storagePath: string
  alt: string | null
}

export type EmbeddedCategory = {
  slug: string
  name: string
  shortDescription: string | null
}

export interface ResolvedBlogArticle {
  blocks: BlogBlocks
  toc: Array<{ anchor: string; title: string }>
  faqs: Array<{ question: string; answer: string }>
  productsBySku: Map<string, EmbeddedProduct>
  categoriesBySlug: Map<string, EmbeddedCategory>
  /** Articles referenced by `related_articles`, keyed by slug. */
  articlesBySlug: Map<string, RelatedArticle>
  /** `kind:slug` for every `page_link` target that actually exists. */
  livePageLinks: Set<string>
  /** Media referenced by `figure` blocks, keyed by media id. */
  figuresById: Map<string, EmbeddedFigure>
  /** Blocks that failed validation, for server-side logging. */
  dropped: Array<{ index: number; reason: string }>
}

/**
 * @param selfSlug the article being rendered, so a `related_articles` block
 *   that names it is dropped rather than rendering a link back to the page the
 *   reader is already on.
 */
export async function resolveBlogArticle(
  bodyBlocksRaw: unknown,
  selfSlug?: string
): Promise<ResolvedBlogArticle> {
  const { blocks, dropped } = parseBlogBlocks(bodyBlocksRaw)

  const skus = blogReferencedSkus(blocks)
  const categorySlugs = [
    ...new Set(blocks.flatMap((b) => (b.type === 'category_link' ? [b.slug] : []))),
  ]

  // `figure.imageId` is a Media id — that is what `collectMediaIdsFromBlocks`
  // in @indus/domain indexes it as, and therefore what stops the media library
  // trashing a picture an article is using. It has to be resolved to a storage
  // path here; handing the id itself to an <img> is what the shared
  // service-case view does, and it is why no figure has ever rendered.
  const figureIds = [
    ...new Set(
      blocks.flatMap((b) => (b.type === 'figure' && b.imageId ? [b.imageId] : [])),
    ),
  ]

  const articleSlugs = blogReferencedArticleSlugs(blocks).filter((slug) => slug !== selfSlug)
  const pageLinks = blogReferencedPageLinks(blocks)
  const wantedServices = pageLinks.filter((l) => l.kind === 'service').map((l) => l.slug)
  const wantedIndustries = pageLinks.filter((l) => l.kind === 'industry').map((l) => l.slug)

  const [products, categories, relatedPosts, services, industries, figureMedia] =
    await Promise.all([
    skus.length
      ? db.product.findMany({
          where: { sku: { in: skus }, status: 'active' },
          select: {
            sku: true,
            slug: true,
            title: true,
            descriptionShort: true,
            brand: { select: { name: true } },
            images: {
              orderBy: { position: 'asc' },
              take: 1,
              select: { alt: true, media: { select: { storagePath: true, alt: true } } },
            },
          },
        })
      : Promise.resolve([]),
    categorySlugs.length
      ? db.category.findMany({
          where: { slug: { in: categorySlugs }, isPublished: true },
          select: { slug: true, name: true, shortDescription: true },
        })
      : Promise.resolve([]),
    articleSlugs.length
      ? db.blogPost.findMany({
          where: { slug: { in: articleSlugs }, isPublished: true, deletedAt: null },
          select: {
            slug: true,
            title: true,
            excerpt: true,
            readingMinutes: true,
            category: { select: { name: true, slug: true, isPublished: true } },
          },
        })
      : Promise.resolve([]),
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
    figureIds.length
      ? db.media.findMany({
          where: { id: { in: figureIds }, deletedAt: null },
          select: { id: true, storagePath: true, alt: true },
        })
      : Promise.resolve([]),
  ])

  const productsBySku = new Map<string, EmbeddedProduct>(
    products.map((p) => [
      p.sku,
      {
        sku: p.sku,
        slug: p.slug,
        title: p.title,
        descriptionShort: p.descriptionShort,
        brandName: p.brand?.name ?? null,
        imagePath: p.images[0]?.media.storagePath ?? null,
        imageAlt: p.images[0]?.alt ?? p.images[0]?.media.alt ?? null,
      },
    ])
  )

  const categoriesBySlug = new Map<string, EmbeddedCategory>(
    categories.map((c) => [
      c.slug,
      { slug: c.slug, name: c.name, shortDescription: c.shortDescription },
    ])
  )

  const articlesBySlug = new Map<string, RelatedArticle>(
    relatedPosts.map((post) => {
      const category = post.category?.isPublished ? post.category : null
      return [
        post.slug,
        {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          readingMinutes: post.readingMinutes,
          categoryName: category?.name ?? null,
          categorySlug: category?.slug ?? null,
        },
      ]
    })
  )

  // Markets are code, so membership is exact and free. Designed industry pages
  // are also code and invisible to the `industries` table — omitting them here
  // would silently drop every link to /industries/manufacturing and friends.
  const marketSlugs = new Set(marketsOrdered().map((m) => m.slug))
  const industrySlugs = new Set([...industries.map((i) => i.slug), ...designedIndustrySlugs()])
  const serviceSlugs = new Set(services.map((c) => c.slug))
  const livePageLinks = new Set(
    pageLinks
      .filter((l) =>
        l.kind === 'market'
          ? marketSlugs.has(l.slug)
          : l.kind === 'service'
            ? serviceSlugs.has(l.slug)
            : industrySlugs.has(l.slug)
      )
      .map((l) => `${l.kind}:${l.slug}`)
  )

  const figuresById = new Map<string, EmbeddedFigure>(
    figureMedia.map((m) => [m.id, { storagePath: m.storagePath, alt: m.alt }]),
  )

  return {
    blocks,
    toc: blogTocEntries(blocks),
    faqs: blogFaqPairs(blocks),
    productsBySku,
    categoriesBySlug,
    articlesBySlug,
    livePageLinks,
    figuresById,
    dropped,
  }
}
