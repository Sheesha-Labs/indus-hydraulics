/**
 * One-shot backfill — compute and persist `Product.contentScore` for
 * every product in the DB. Run after the column is added (see
 * migration `product_content_score_column`). Idempotent: re-running
 * just refreshes the column with the latest scorer output.
 *
 * Usage:
 *   pnpm --filter @indus/db tsx src/scripts/backfill-product-content-scores.ts
 */
import { PrismaClient } from '@prisma/client'
import { scoreProductContent, wordCount } from '@indus/domain'

const db = new PrismaClient()

async function main() {
  const products = await db.product.findMany({
    select: {
      id: true,
      sku: true,
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

  console.log(`🔢 Backfilling contentScore for ${products.length} products…`)
  let updated = 0
  for (const p of products) {
    const score = scoreProductContent({
      descriptionShortWords: wordCount(p.descriptionShort),
      descriptionLongWords: wordCount(p.descriptionLong),
      faqCount: p._count.faqs,
      specCount: p._count.specs,
      crossReferenceCount: p._count.crossReferences,
      documentCount: p._count.documents,
      imageCount: p._count.images,
      hasBrand: p.brandId != null,
      hasCategory: p.categoryId != null,
      hasFocusKeyword: !!(p.focusKeyword && p.focusKeyword.trim().length > 0),
      hasSeoTitleAndDescription:
        !!(p.seoTitle && p.seoTitle.trim().length > 0) &&
        !!(p.seoDescription && p.seoDescription.trim().length > 0),
      hasCommerceAttributes:
        p.weightKg != null &&
        !!(p.countryOfOrigin && p.countryOfOrigin.trim().length > 0) &&
        !!(p.mpn && p.mpn.trim().length > 0),
    }).score
    await db.product.update({
      where: { id: p.id },
      data: { contentScore: score },
    })
    updated++
    if (updated % 50 === 0) console.log(`  …${updated}/${products.length}`)
  }
  console.log(`✅ Backfilled ${updated} product scores.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
