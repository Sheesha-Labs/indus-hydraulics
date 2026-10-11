import type { Prisma } from '@indus/db'

/**
 * The picture a product without a photograph borrows: the studio shot of the
 * nearest category in its chain that has one — its own shelf first, then the
 * parent, then the top-level category. Every top-level category has a studio
 * shot, so a published product always resolves to something.
 *
 * It is shown muted and tagged "Category image" wherever it appears, and it is
 * never put in the product's JSON-LD, Open Graph tags or image sitemap: it is a
 * picture of the range, not of this part.
 */

const IMAGE = { select: { storagePath: true } } as const

/** Include for a product's `category`, three levels deep (the tree is three deep), with each image. */
export const CATEGORY_WITH_IMAGE_CHAIN = {
  include: {
    image: IMAGE,
    parent: { include: { image: IMAGE, parent: { include: { image: IMAGE } } } },
  },
} as const satisfies Prisma.CategoryDefaultArgs

type ChainLink = {
  name: string
  image?: { storagePath: string } | null
  parent?: ChainLink | null
} | null | undefined

export type CategoryFallback = { src: string; categoryName: string }

export function nearestCategoryImage(category: ChainLink): CategoryFallback | null {
  for (let c = category; c; c = c.parent) {
    if (c.image?.storagePath) return { src: c.image.storagePath, categoryName: c.name }
  }
  return null
}
