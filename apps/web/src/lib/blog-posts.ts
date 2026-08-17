import { db, type Prisma } from '@indus/db'
import type { BlogPostCardData } from '../components/blog/BlogPostCard'

/**
 * Shared list query for the blog index, category hubs and author pages.
 *
 * One select shape means the three surfaces cannot drift into showing
 * different metadata for the same article, and it keeps the card component's
 * prop type honest — it is derived from this, not maintained alongside it.
 */
const LIST_SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
  readingMinutes: true,
  hero: { select: { storagePath: true, alt: true } },
  category: { select: { name: true, slug: true, isPublished: true } },
  blogAuthor: { select: { name: true, isPublished: true } },
  author: { select: { name: true } },
} satisfies Prisma.BlogPostSelect

type ListRow = Prisma.BlogPostGetPayload<{ select: typeof LIST_SELECT }>

function toCard(post: ListRow): BlogPostCardData {
  const category = post.category?.isPublished ? post.category : null
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    readingMinutes: post.readingMinutes,
    heroPath: post.hero?.storagePath ?? null,
    heroAlt: post.hero?.alt ?? null,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    authorName: post.blogAuthor?.name ?? post.author?.name ?? null,
  }
}

export async function listBlogPosts(options: {
  categoryId?: string
  blogAuthorId?: string
  excludeSlug?: string
  take?: number
  skip?: number
}): Promise<BlogPostCardData[]> {
  const posts = await db.blogPost.findMany({
    where: {
      isPublished: true,
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options.blogAuthorId ? { blogAuthorId: options.blogAuthorId } : {}),
      ...(options.excludeSlug ? { slug: { not: options.excludeSlug } } : {}),
    },
    select: LIST_SELECT,
    orderBy: { publishedAt: 'desc' },
    take: options.take,
    skip: options.skip,
  })
  return posts.map(toCard)
}

export async function countBlogPosts(options: {
  categoryId?: string
  blogAuthorId?: string
}): Promise<number> {
  return db.blogPost.count({
    where: {
      isPublished: true,
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options.blogAuthorId ? { blogAuthorId: options.blogAuthorId } : {}),
    },
  })
}
