import 'server-only'

import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import { STOREFRONT_TAGS } from './cache-tags'
import { getCategoryTree, indexTree, rollUpCounts } from './category-tree'
import { mediaUrl } from './media'

/**
 * Catalogue reads for the service-area pages.
 *
 * Both are cross-request cached against tags admin already purges, so a
 * location page costs no more database time than a market page, and a range
 * renamed or re-imaged in admin shows up here with no code change.
 */

export type LocationRangeCard = {
  slug: string
  name: string
  description: string | null
  /** Active products on the shelf and everything beneath it. */
  productCount: number
  imageUrl: string | null
  imageAlt: string | null
}

/**
 * Active-product counts for every category, rolled up the tree, plus one
 * product photograph per category subtree for shelves that have no image of
 * their own. One grouped count and one image query, whatever the page asks
 * for — the per-page work is then a lookup.
 */
const loadRangeIndex = unstable_cache(
  async () => {
    const [tree, direct, categories] = await Promise.all([
      getCategoryTree(),
      db.product.groupBy({
        by: ['categoryId'],
        where: { status: 'active', categoryId: { not: null } },
        _count: { _all: true },
      }),
      db.category.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          image: { select: { storagePath: true, alt: true } },
        },
      }),
    ])

    const parentOf = new Map(tree.map((n) => [n.id, n.parentId]))
    const counts = rollUpCounts(
      parentOf,
      new Map(direct.map((row) => [row.categoryId as string, row._count._all]))
    )

    return {
      counts: Object.fromEntries(counts),
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.shortDescription,
        imageUrl: c.image ? mediaUrl(c.image.storagePath) : null,
        imageAlt: c.image?.alt ?? null,
      })),
    }
  },
  ['location-range-index-v1'],
  { revalidate: 3600, tags: [STOREFRONT_TAGS.categories, STOREFRONT_TAGS.products] }
)

/**
 * A product photograph from somewhere in a category's subtree, for a shelf
 * card whose category has no image. Shown with the product's own alt text,
 * which describes that product — never re-captioned as the range.
 */
const loadSubtreePhoto = unstable_cache(
  async (categoryId: string) => {
    const tree = await getCategoryTree()
    const { children } = indexTree(tree)
    const ids: string[] = []
    const stack = [categoryId]
    while (stack.length > 0 && ids.length < 400) {
      const id = stack.pop()!
      ids.push(id)
      for (const child of children.get(id) ?? []) stack.push(child.id)
    }
    const product = await db.product.findFirst({
      where: { status: 'active', categoryId: { in: ids }, images: { some: {} } },
      orderBy: { updatedAt: 'desc' },
      select: {
        title: true,
        images: {
          orderBy: { position: 'asc' },
          take: 1,
          select: { alt: true, media: { select: { storagePath: true, alt: true } } },
        },
      },
    })
    const image = product?.images[0]
    if (!image) return null
    return {
      url: mediaUrl(image.media.storagePath),
      alt: image.alt ?? image.media.alt ?? product.title,
    }
  },
  ['location-subtree-photo-v1'],
  { revalidate: 3600, tags: [STOREFRONT_TAGS.categories, STOREFRONT_TAGS.products] }
)

/** Range cards for the given category slugs, in that order, published only. */
export async function getLocationRangeCards(
  slugs: readonly string[]
): Promise<LocationRangeCard[]> {
  const index = await loadRangeIndex()
  const bySlug = new Map(index.categories.map((c) => [c.slug, c]))
  const picked = slugs
    .map((slug) => bySlug.get(slug))
    .filter((c): c is NonNullable<typeof c> => c != null)

  return Promise.all(
    picked.map(async (c) => {
      const photo = c.imageUrl ? null : await loadSubtreePhoto(c.id)
      return {
        slug: c.slug,
        name: c.name,
        description: c.description,
        productCount: index.counts[c.id] ?? 0,
        imageUrl: c.imageUrl ?? photo?.url ?? null,
        imageAlt: c.imageUrl ? (c.imageAlt ?? c.name) : (photo?.alt ?? null),
      }
    })
  )
}

export type LocationArticleCard = {
  slug: string
  title: string
  excerpt: string | null
  readingMinutes: number | null
  imageUrl: string | null
  imageAlt: string | null
}

/** Published articles by slug, in the order given. */
export async function getLocationArticles(
  slugs: readonly string[]
): Promise<LocationArticleCard[]> {
  if (slugs.length === 0) return []
  const rows = await db.blogPost.findMany({
    where: { slug: { in: [...slugs] }, isPublished: true },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      readingMinutes: true,
      hero: { select: { storagePath: true, alt: true } },
    },
  })
  const bySlug = new Map(rows.map((r) => [r.slug, r]))
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((r): r is NonNullable<typeof r> => r != null)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      readingMinutes: r.readingMinutes,
      imageUrl: r.hero ? mediaUrl(r.hero.storagePath) : null,
      imageAlt: r.hero?.alt ?? null,
    }))
}

/** Storage path of a picked media row — for Open Graph and JSON-LD. */
export async function mediaStoragePath(mediaId: string | null): Promise<string | null> {
  if (!mediaId) return null
  const row = await db.media.findFirst({
    where: { id: mediaId, deletedAt: null },
    select: { storagePath: true },
  })
  return row?.storagePath ?? null
}
