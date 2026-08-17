import { db } from '@indus/db'
import {
  blogFaqPairs,
  blogReferencedSkus,
  blogTocEntries,
  parseBlogBlocks,
  type BlogBlocks,
} from '@indus/domain'

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
  /** Blocks that failed validation, for server-side logging. */
  dropped: Array<{ index: number; reason: string }>
}

export async function resolveBlogArticle(bodyBlocksRaw: unknown): Promise<ResolvedBlogArticle> {
  const { blocks, dropped } = parseBlogBlocks(bodyBlocksRaw)

  const skus = blogReferencedSkus(blocks)
  const categorySlugs = [
    ...new Set(blocks.flatMap((b) => (b.type === 'category_link' ? [b.slug] : []))),
  ]

  const [products, categories] = await Promise.all([
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
    ]),
  )

  const categoriesBySlug = new Map<string, EmbeddedCategory>(
    categories.map((c) => [c.slug, { slug: c.slug, name: c.name, shortDescription: c.shortDescription }]),
  )

  return {
    blocks,
    toc: blogTocEntries(blocks),
    faqs: blogFaqPairs(blocks),
    productsBySku,
    categoriesBySlug,
    dropped,
  }
}
