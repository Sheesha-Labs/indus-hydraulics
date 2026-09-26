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

/**
 * The content score a product page needs before it is worth submitting to a
 * search engine.
 *
 * Measured on production 2026-09-24, the 1,487 active products split cleanly
 * at this line. The 74 below it score 6–19 and are stubs: 17–67 words of long
 * description, almost no images, no size table. Everything from 31 upward
 * carries 150+ words, and most of it a size table as well. Nothing scores
 * between 20 and 30, so the gate does not have to be tuned to the unit.
 *
 * Why it matters on this domain: Search Console holds ~1,733 URLs in
 * "Discovered – currently not indexed", never fetched. Google's crawl-budget
 * guidance for sites in that state is to stop offering low-value URLs,
 * because Google judges how much of a host is worth crawling by sampling it.
 *
 * This is the gate for both the sitemap and the page's own robots meta, so the
 * two can never disagree — the same arrangement as
 * `REPLACEMENT_INDEX_MIN_MATCHES`. It is data, not a date: a product re-enters
 * both the moment an edit lifts its score over the line, with no code change.
 */
export const PRODUCT_INDEX_MIN_CONTENT_SCORE = 30

/**
 * Size-table rows that make a page substantial on their own — 2026-09-26.
 *
 * `scoreProductContent` scores prose, FAQs, specs, images and commerce
 * fields. It never sees the size table (`product_variants`), and that table is
 * what the gate above was drawn to catch the absence of: "stubs … no size
 * table". The Lifting & Rigging families launched on 2026-09-25 are the case
 * the score misses. They carry a size table with an Indus part number and
 * dimensions on every row, and dimension drawings, but they are sold without a
 * brand and have short prose, so they score 10–28. Measured on production on
 * 2026-09-26, 692 of the 744 lifting families were held back as thin; 610 of
 * those have a real table (median 8 rows).
 *
 * Three rows is a table rather than one product listed as a size. It admits
 * those 610 and nothing else in the catalogue: every other held product has
 * fewer than three rows.
 */
export const PRODUCT_INDEX_MIN_SIZE_ROWS = 3

/**
 * Whether a product page should be offered for indexing.
 *
 * An editor's explicit `robotsIndex: false` always wins. A thin page is held
 * back even when the flag is true, because the flag defaults to true and says
 * nothing about whether anyone looked. A page is not thin when it clears the
 * content score OR carries a real size table.
 *
 * `sizeRows` is required so that no caller can forget the table and quietly
 * fall back to the score alone. That was the failure mode this argument
 * exists to fix.
 */
export function isProductIndexable(product: {
  robotsIndex: boolean
  contentScore: number
  /** Rows in the product's size table (`product_variants`). */
  sizeRows: number
}): boolean {
  if (!product.robotsIndex) return false
  return (
    product.contentScore >= PRODUCT_INDEX_MIN_CONTENT_SCORE ||
    product.sizeRows >= PRODUCT_INDEX_MIN_SIZE_ROWS
  )
}
