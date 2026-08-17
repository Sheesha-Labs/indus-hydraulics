import { db } from '@indus/db'
import type { RelatedArticle } from '../components/blog/RelatedReading'

/**
 * Articles that reference a given product or catalogue category.
 *
 * Reads the relation rows written by the article import, not the JSON bodies.
 * The same answer is derivable by scanning every `bodyBlocks` column, but that
 * is a sequential scan on every product page render; this is an index lookup
 * on `blog_post_products.productId`.
 */

const SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  readingMinutes: true,
  category: { select: { name: true, slug: true, isPublished: true } },
} as const

type Row = {
  slug: string
  title: string
  excerpt: string | null
  readingMinutes: number | null
  category: { name: string; slug: string; isPublished: boolean } | null
}

function toArticle(post: Row): RelatedArticle {
  const category = post.category?.isPublished ? post.category : null
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    readingMinutes: post.readingMinutes,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
  }
}

export async function getArticlesForProduct(
  productId: string,
  limit = 3,
): Promise<RelatedArticle[]> {
  const links = await db.blogPostProduct.findMany({
    where: { productId, post: { isPublished: true } },
    orderBy: [{ position: 'asc' }],
    take: limit,
    select: { post: { select: SELECT } },
  })
  return links.map((l) => toArticle(l.post))
}

export async function getArticlesForCategory(
  categoryId: string,
  limit = 3,
): Promise<RelatedArticle[]> {
  const links = await db.blogPostCategory.findMany({
    where: { categoryId, post: { isPublished: true } },
    orderBy: [{ position: 'asc' }],
    take: limit,
    select: { post: { select: SELECT } },
  })
  return links.map((l) => toArticle(l.post))
}
