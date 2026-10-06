import type { PrismaClient } from '@prisma/client'
import { blogReferencedCategorySlugs, blogReferencedSkus, type BlogBlocks } from '@indus/domain'
import { db } from './index'

/**
 * Mirror an article's catalogue references into the link tables.
 *
 * `blog_post_products` and `blog_post_categories` are what product and
 * category pages read for their "Written about this part / range" lists — an
 * index lookup instead of scanning every article body on every render. They
 * are a projection of the `product_embed` and `category_link` blocks, so they
 * must be rewritten whenever the body is.
 *
 * Shared here, not left inside the import runner, because the admin editor
 * saves bodies too. It never called this: an article edited in /admin/blog
 * kept the links of whatever version was last imported, so product pages
 * advertised articles that no longer mentioned them and missed ones that now
 * did.
 *
 * Replaces both sets wholesale in one transaction, in block order, dropping a
 * SKU or slug that does not resolve rather than failing the save.
 */
export async function syncBlogPostLinks(
  postId: string,
  blocks: BlogBlocks,
  client: PrismaClient = db,
): Promise<void> {
  const skus = blogReferencedSkus(blocks)
  const categorySlugs = blogReferencedCategorySlugs(blocks)

  const [products, categories] = await Promise.all([
    skus.length
      ? client.product.findMany({ where: { sku: { in: skus } }, select: { id: true, sku: true } })
      : Promise.resolve([]),
    categorySlugs.length
      ? client.category.findMany({
          where: { slug: { in: categorySlugs } },
          select: { id: true, slug: true },
        })
      : Promise.resolve([]),
  ])

  const productIdBySku = new Map(products.map((p) => [p.sku, p.id]))
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]))

  await client.$transaction([
    client.blogPostProduct.deleteMany({ where: { postId } }),
    client.blogPostProduct.createMany({
      data: skus
        .map((sku, i) => ({ postId, productId: productIdBySku.get(sku), position: i }))
        .filter((row): row is { postId: string; productId: string; position: number } =>
          Boolean(row.productId),
        ),
      skipDuplicates: true,
    }),
    client.blogPostCategory.deleteMany({ where: { postId } }),
    client.blogPostCategory.createMany({
      data: categorySlugs
        .map((slug, i) => ({ postId, categoryId: categoryIdBySlug.get(slug), position: i }))
        .filter((row): row is { postId: string; categoryId: string; position: number } =>
          Boolean(row.categoryId),
        ),
      skipDuplicates: true,
    }),
  ])
}
