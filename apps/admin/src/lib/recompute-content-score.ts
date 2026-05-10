import 'server-only'
import { db } from '@indus/db'
import { scoreFromProduct } from './product-content-score'

/**
 * Recompute and persist the content-depth score on `product.contentScore`.
 * Call after any product mutation (create / update / description edit /
 * relation change) so the column always reflects the latest state.
 *
 * Idempotent. Returns the new score so callers can include it in audit
 * logs or admin responses if they want. Swallows "not found" so a
 * post-delete call is a no-op.
 */
export async function recomputeContentScore(productId: string): Promise<number | null> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      descriptionShort: true,
      descriptionLong: true,
      brandId: true,
      categoryId: true,
      focusKeyword: true,
      seoTitle: true,
      seoDescription: true,
      weightKg: true,
      countryOfOrigin: true,
      mpn: true,
      _count: {
        select: {
          faqs: true,
          specs: true,
          crossReferences: true,
          documents: true,
          images: true,
        },
      },
    },
  })
  if (!product) return null

  const score = scoreFromProduct(product).score
  await db.product.update({
    where: { id: productId },
    data: { contentScore: score },
  })
  return score
}
