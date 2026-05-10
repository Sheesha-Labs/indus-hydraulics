/**
 * Product content-depth scorer. Pure function, Prisma-free.
 *
 * Sits alongside the generic `scoreEntity` SEO scorer in `health.ts`.
 * Where `scoreEntity` checks meta-level health (title length, robots,
 * structured data presence), this function checks the **commerce
 * substance** of a product page — long description, FAQs, specs,
 * cross-references, datasheets — that determines whether a PDP can
 * earn citations from AI search engines or just rank as a thin stub.
 *
 * Used by:
 *   1. Admin product list — colour the content-depth column.
 *   2. Admin product editor — show which fields are missing.
 *   3. Inngest nightly recompute (alongside scoreEntity).
 *   4. (Optional, future) Storefront `noindex` toggle below threshold.
 *
 * Like `scoreEntity`, weights live here so the meaning of a score is
 * stable across the OS — adjust here, not at call sites.
 */

import type { SeoHealthCheck, SeoHealthScore } from './health'

export type ProductContentScoreInput = {
  /** Word count of `descriptionShort`. Caller does the counting. */
  descriptionShortWords: number
  /** Word count of `descriptionLong` (markdown stripped if you like). */
  descriptionLongWords: number
  faqCount: number
  specCount: number
  crossReferenceCount: number
  documentCount: number
  imageCount: number
  hasBrand: boolean
  hasCategory: boolean
  hasFocusKeyword: boolean
  /** True only when BOTH seoTitle and seoDescription are non-empty. */
  hasSeoTitleAndDescription: boolean
  /**
   * True only when ALL THREE commerce attributes (weightKg,
   * countryOfOrigin, mpn) are populated. These flow into the Product
   * JSON-LD; missing any one means a thinner schema-org payload.
   */
  hasCommerceAttributes: boolean
}

const WEIGHTS = {
  descriptionShort: 5,
  descriptionLong: 20,
  faqCount: 15,
  specCount: 10,
  crossReferenceCount: 8,
  documentCount: 8,
  imageCount: 8,
  brandAndCategory: 6,
  focusKeyword: 5,
  seoTitleAndDescription: 5,
  commerceAttributes: 10,
} as const

/** Thresholds at which each check passes. Centralised so tests + UI agree. */
export const PRODUCT_CONTENT_THRESHOLDS = {
  descriptionShortMinWords: 30,
  descriptionLongMinWords: 300,
  minFaqs: 5,
  minSpecs: 8,
  minCrossReferences: 1,
  minDocuments: 1,
  minImages: 3,
} as const

export function scoreProductContent(input: ProductContentScoreInput): SeoHealthScore {
  const t = PRODUCT_CONTENT_THRESHOLDS
  const checks: SeoHealthCheck[] = [
    {
      id: 'descriptionShort',
      pass: input.descriptionShortWords >= t.descriptionShortMinWords,
      weight: WEIGHTS.descriptionShort,
      message:
        input.descriptionShortWords >= t.descriptionShortMinWords
          ? `Short description is substantive (${input.descriptionShortWords} words)`
          : `Short description is thin (${input.descriptionShortWords} words; aim for ≥ ${t.descriptionShortMinWords})`,
    },
    {
      id: 'descriptionLong',
      pass: input.descriptionLongWords >= t.descriptionLongMinWords,
      weight: WEIGHTS.descriptionLong,
      message:
        input.descriptionLongWords >= t.descriptionLongMinWords
          ? `Long description is substantive (${input.descriptionLongWords} words)`
          : `Long description is thin (${input.descriptionLongWords} words; aim for ≥ ${t.descriptionLongMinWords})`,
    },
    {
      id: 'faqCount',
      pass: input.faqCount >= t.minFaqs,
      weight: WEIGHTS.faqCount,
      message:
        input.faqCount >= t.minFaqs
          ? `Has ${input.faqCount} FAQ${input.faqCount === 1 ? '' : 's'}`
          : `Add more FAQs (${input.faqCount}/${t.minFaqs})`,
    },
    {
      id: 'specCount',
      pass: input.specCount >= t.minSpecs,
      weight: WEIGHTS.specCount,
      message:
        input.specCount >= t.minSpecs
          ? `Has ${input.specCount} spec${input.specCount === 1 ? '' : 's'}`
          : `Fill more specs (${input.specCount}/${t.minSpecs})`,
    },
    {
      id: 'crossReferenceCount',
      pass: input.crossReferenceCount >= t.minCrossReferences,
      weight: WEIGHTS.crossReferenceCount,
      message:
        input.crossReferenceCount >= t.minCrossReferences
          ? `Has ${input.crossReferenceCount} cross-reference${input.crossReferenceCount === 1 ? '' : 's'}`
          : 'Add at least one competitor cross-reference',
    },
    {
      id: 'documentCount',
      pass: input.documentCount >= t.minDocuments,
      weight: WEIGHTS.documentCount,
      message:
        input.documentCount >= t.minDocuments
          ? `Has ${input.documentCount} datasheet${input.documentCount === 1 ? '' : 's'} / document${input.documentCount === 1 ? '' : 's'}`
          : 'Attach at least one datasheet or document',
    },
    {
      id: 'imageCount',
      pass: input.imageCount >= t.minImages,
      weight: WEIGHTS.imageCount,
      message:
        input.imageCount >= t.minImages
          ? `Has ${input.imageCount} images`
          : `Add more images (${input.imageCount}/${t.minImages})`,
    },
    {
      id: 'brandAndCategory',
      pass: input.hasBrand && input.hasCategory,
      weight: WEIGHTS.brandAndCategory,
      message:
        input.hasBrand && input.hasCategory
          ? 'Brand and category are set'
          : !input.hasBrand && !input.hasCategory
            ? 'Brand and category are missing'
            : !input.hasBrand
              ? 'Brand is missing'
              : 'Category is missing',
    },
    {
      id: 'focusKeyword',
      pass: input.hasFocusKeyword,
      weight: WEIGHTS.focusKeyword,
      message: input.hasFocusKeyword
        ? 'Focus keyword is set'
        : 'Set a focus keyword for the SEO scorer',
    },
    {
      id: 'seoTitleAndDescription',
      pass: input.hasSeoTitleAndDescription,
      weight: WEIGHTS.seoTitleAndDescription,
      message: input.hasSeoTitleAndDescription
        ? 'SEO title and description are set'
        : 'SEO title or description is missing',
    },
    {
      id: 'commerceAttributes',
      pass: input.hasCommerceAttributes,
      weight: WEIGHTS.commerceAttributes,
      message: input.hasCommerceAttributes
        ? 'Weight, country of origin, and MPN are all set'
        : 'Weight, country of origin, and MPN must all be set (they flow into Product JSON-LD)',
    },
  ]

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0)
  const weightedPass = checks.filter((c) => c.pass).reduce((sum, c) => sum + c.weight, 0)
  const score = totalWeight === 0 ? 0 : Math.round((100 * weightedPass) / totalWeight)

  return { score, breakdown: checks }
}

/**
 * Count words in a string the same way every caller should — single
 * source of truth so the admin word counter and the scorer always
 * agree on what the descriptionLong score is based on.
 *
 * Strips simple Markdown emphasis / link syntax so an editor isn't
 * rewarded for typing `**foo**` instead of `foo`.
 */
export function wordCount(text: string | null | undefined): number {
  if (!text) return 0
  const stripped = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [label](url) → label
    .replace(/[*_`#>~]/g, ' ') // emphasis / heading / blockquote / code markers
    .replace(/\s+/g, ' ')
    .trim()
  if (!stripped) return 0
  return stripped.split(' ').filter(Boolean).length
}
