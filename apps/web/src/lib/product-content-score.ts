import {
  scoreProductContent,
  wordCount,
  type SeoHealthScore,
} from '@indus/domain'

/**
 * Adapter shape for the product content scorer. Accepts the loosely-
 * typed bag of fields the admin already has from Prisma includes (the
 * list page uses `_count`, the editor uses full relations). Keeping
 * this duck-typed avoids a Prisma dependency in `@indus/domain`
 * (where the scorer lives).
 */
export type ProductScoreSource = {
  descriptionShort: string | null
  descriptionLong: string | null
  brandId: string | null
  categoryId: string | null
  focusKeyword: string | null
  seoTitle: string | null
  seoDescription: string | null
  weightKg: { toString(): string } | number | null
  countryOfOrigin: string | null
  mpn: string | null
  // Either pass full counts, or supply pre-computed lengths via the
  // `_count` field that Prisma's `include._count` produces.
  faqCount?: number
  specCount?: number
  crossReferenceCount?: number
  documentCount?: number
  imageCount?: number
  _count?: {
    faqs?: number
    specs?: number
    crossReferences?: number
    documents?: number
    images?: number
  }
}

export function scoreFromProduct(p: ProductScoreSource): SeoHealthScore {
  const counts = p._count ?? {}
  return scoreProductContent({
    descriptionShortWords: wordCount(p.descriptionShort),
    descriptionLongWords: wordCount(p.descriptionLong),
    faqCount: p.faqCount ?? counts.faqs ?? 0,
    specCount: p.specCount ?? counts.specs ?? 0,
    crossReferenceCount: p.crossReferenceCount ?? counts.crossReferences ?? 0,
    documentCount: p.documentCount ?? counts.documents ?? 0,
    imageCount: p.imageCount ?? counts.images ?? 0,
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
  })
}
