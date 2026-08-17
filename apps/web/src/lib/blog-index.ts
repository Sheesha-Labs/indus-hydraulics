import { db } from '@indus/db'
import type { BlogTopic } from '../components/blog/BlogIndexView'
import { countBlogPosts, listBlogPosts } from './blog-posts'

/** Articles per page. Also the page size the RSS feed caps at. */
export const BLOG_PAGE_SIZE = 12

/**
 * Topic chips and the "browse by topic" list, with real counts.
 *
 * Counts come from a groupBy rather than N per-category count queries, and
 * categories with no published articles are dropped — an empty hub is a thin
 * page that dilutes the index it is linked from.
 */
export async function getBlogTopics(): Promise<BlogTopic[]> {
  const [categories, grouped] = await Promise.all([
    db.blogCategory.findMany({
      where: { isPublished: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: { slug: true, name: true, id: true },
    }),
    db.blogPost.groupBy({
      by: ['categoryId'],
      where: { isPublished: true, categoryId: { not: null } },
      _count: { _all: true },
    }),
  ])

  const counts = new Map(grouped.map((g) => [g.categoryId, g._count._all]))

  return categories
    .map((c) => ({ slug: c.slug, name: c.name, count: counts.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
}

export async function getBlogIndexPage(page: number) {
  const [posts, totalPosts, topics] = await Promise.all([
    listBlogPosts({ take: BLOG_PAGE_SIZE, skip: (page - 1) * BLOG_PAGE_SIZE }),
    countBlogPosts({}),
    getBlogTopics(),
  ])

  return {
    posts,
    topics,
    totalPosts,
    totalPages: Math.max(1, Math.ceil(totalPosts / BLOG_PAGE_SIZE)),
  }
}
