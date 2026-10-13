import { db } from '@indus/db'
import type { RelatedArticle } from '../components/blog/RelatedReading'

/**
 * Articles that reference a given product or catalogue category.
 *
 * Reads the relation rows written by the article import and the admin editor
 * (see `syncBlogPostLinks`), not the JSON bodies. The same answer is derivable
 * by scanning every `bodyBlocks` column, but that is a sequential scan on every
 * product page render; this is an index lookup on the link tables.
 *
 * This is the return leg of the internal-link loop: articles link down into
 * the catalogue, and these lists send readers and link equity back up.
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

/** First occurrence wins, so earlier (more specific) sources keep their place. */
function dedupe(rows: Row[], limit: number): RelatedArticle[] {
  const seen = new Set<string>()
  const out: RelatedArticle[] = []
  for (const row of rows) {
    if (seen.has(row.slug)) continue
    seen.add(row.slug)
    out.push(toArticle(row))
    if (out.length >= limit) break
  }
  return out
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

/**
 * The category and every category beneath it, to two levels — the depth of
 * the catalogue tree (root › range › leaf).
 */
async function categoryAndDescendantIds(categoryId: string): Promise<string[]> {
  const descendants = await db.category.findMany({
    where: {
      isPublished: true,
      OR: [{ parentId: categoryId }, { parent: { parentId: categoryId } }],
    },
    select: { id: true },
  })
  return [categoryId, ...descendants.map((c) => c.id)]
}

/**
 * Articles about a shelf.
 *
 * Three sources, most specific first:
 *   1. articles that link to this category itself;
 *   2. articles that link to a category beneath it;
 *   3. articles that embed a product on the shelf or beneath it.
 *
 * Only the first used to count, so a parent shelf showed nothing however much
 * had been written about its children, and an article that embedded a coupling
 * without also linking its category never appeared on that category at all.
 * On 2026-10-05, 158 of 212 leaf shelves with products showed no reading.
 */
export async function getArticlesForCategory(
  categoryId: string,
  limit = 3,
): Promise<RelatedArticle[]> {
  const ids = await categoryAndDescendantIds(categoryId)

  const categoryLinks = await db.blogPostCategory.findMany({
    where: { categoryId: { in: ids }, post: { isPublished: true } },
    orderBy: [{ position: 'asc' }],
    // Enough to fill the list after own-category links are sorted to the front.
    take: limit * 4,
    select: { categoryId: true, post: { select: SELECT } },
  })
  const own = categoryLinks.filter((l) => l.categoryId === categoryId)
  const below = categoryLinks.filter((l) => l.categoryId !== categoryId)
  const fromCategories = dedupe([...own, ...below].map((l) => l.post), limit)
  if (fromCategories.length >= limit) return fromCategories

  const productLinks = await db.blogPostProduct.findMany({
    where: {
      post: { isPublished: true },
      product: { status: 'active', categoryId: { in: ids } },
    },
    orderBy: [{ position: 'asc' }],
    take: limit * 4,
    select: { post: { select: SELECT } },
  })
  return dedupe(
    [...[...own, ...below].map((l) => l.post), ...productLinks.map((l) => l.post)],
    limit,
  )
}

/**
 * Reading for a product page, with the heading that honestly describes it.
 *
 * Articles that embed this exact part come first. When there are none, the
 * shelf's reading stands in under a heading that says so: an article about
 * the range is still the context a buyer needs, and a product page with no
 * route into the blog is a dead end for crawlers as well as readers.
 */
export async function getRelatedReadingForProduct(
  product: { id: string; categoryId: string | null },
  limit = 3,
): Promise<{ articles: RelatedArticle[]; heading: string }> {
  const direct = await getArticlesForProduct(product.id, limit)
  if (direct.length > 0 || !product.categoryId) {
    return { articles: direct, heading: 'Written about this part' }
  }
  return {
    articles: await getArticlesForCategory(product.categoryId, limit),
    heading: 'Written about this range',
  }
}

/**
 * More articles from the same blog topic, newest first, for the foot of an
 * article — skipping the article itself and anything it already links to in a
 * `related_articles` block, so the two lists never repeat each other.
 */
export async function getMoreFromBlogCategory(
  blogCategoryId: string,
  exclude: readonly string[],
  limit = 3,
): Promise<RelatedArticle[]> {
  const rows = await db.blogPost.findMany({
    where: {
      categoryId: blogCategoryId,
      isPublished: true,
      slug: { notIn: [...exclude] },
    },
    orderBy: [{ publishedAt: 'desc' }],
    take: limit,
    select: SELECT,
  })
  return rows.map(toArticle)
}
