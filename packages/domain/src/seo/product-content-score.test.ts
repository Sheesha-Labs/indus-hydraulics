import { describe, it, expect } from 'vitest'
import {
  PRODUCT_CONTENT_THRESHOLDS,
  PRODUCT_INDEX_MIN_CONTENT_SCORE,
  PRODUCT_INDEX_MIN_SIZE_ROWS,
  isProductIndexable,
  scoreProductContent,
  wordCount,
  type ProductContentScoreInput,
} from './product-content-score'

const t = PRODUCT_CONTENT_THRESHOLDS

const baseFull: ProductContentScoreInput = {
  descriptionShortWords: t.descriptionShortMinWords,
  descriptionLongWords: t.descriptionLongMinWords,
  faqCount: t.minFaqs,
  specCount: t.minSpecs,
  crossReferenceCount: t.minCrossReferences,
  documentCount: t.minDocuments,
  imageCount: t.minImages,
  hasBrand: true,
  hasCategory: true,
  hasFocusKeyword: true,
  hasSeoTitleAndDescription: true,
  hasCommerceAttributes: true,
}

const baseEmpty: ProductContentScoreInput = {
  descriptionShortWords: 0,
  descriptionLongWords: 0,
  faqCount: 0,
  specCount: 0,
  crossReferenceCount: 0,
  documentCount: 0,
  imageCount: 0,
  hasBrand: false,
  hasCategory: false,
  hasFocusKeyword: false,
  hasSeoTitleAndDescription: false,
  hasCommerceAttributes: false,
}

describe('scoreProductContent', () => {
  it('scores 100 when every threshold is met', () => {
    const result = scoreProductContent(baseFull)
    expect(result.score).toBe(100)
    expect(result.breakdown.every((c) => c.pass)).toBe(true)
  })

  it('scores 0 when nothing is filled', () => {
    const result = scoreProductContent(baseEmpty)
    expect(result.score).toBe(0)
    expect(result.breakdown.every((c) => !c.pass)).toBe(true)
  })

  it('still passes when counts exceed the thresholds', () => {
    const result = scoreProductContent({
      ...baseFull,
      descriptionLongWords: 5000,
      faqCount: 50,
      imageCount: 30,
    })
    expect(result.score).toBe(100)
  })

  it('flags thin long description below the 300-word floor', () => {
    const result = scoreProductContent({ ...baseFull, descriptionLongWords: 100 })
    const c = result.breakdown.find((x) => x.id === 'descriptionLong')
    expect(c?.pass).toBe(false)
    expect(c?.message).toContain('100 words')
  })

  it('flags thin short description', () => {
    const result = scoreProductContent({ ...baseFull, descriptionShortWords: 5 })
    expect(result.breakdown.find((x) => x.id === 'descriptionShort')?.pass).toBe(false)
  })

  it('flags fewer than 5 FAQs', () => {
    const result = scoreProductContent({ ...baseFull, faqCount: 2 })
    const c = result.breakdown.find((x) => x.id === 'faqCount')
    expect(c?.pass).toBe(false)
    expect(c?.message).toMatch(/2\/5/)
  })

  it('flags fewer than 8 specs', () => {
    const result = scoreProductContent({ ...baseFull, specCount: 3 })
    expect(result.breakdown.find((x) => x.id === 'specCount')?.pass).toBe(false)
  })

  it('flags zero cross-references', () => {
    const result = scoreProductContent({ ...baseFull, crossReferenceCount: 0 })
    expect(result.breakdown.find((x) => x.id === 'crossReferenceCount')?.pass).toBe(false)
  })

  it('flags zero documents', () => {
    const result = scoreProductContent({ ...baseFull, documentCount: 0 })
    expect(result.breakdown.find((x) => x.id === 'documentCount')?.pass).toBe(false)
  })

  it('flags fewer than 3 images', () => {
    const result = scoreProductContent({ ...baseFull, imageCount: 1 })
    expect(result.breakdown.find((x) => x.id === 'imageCount')?.pass).toBe(false)
  })

  it('reports missing brand specifically when category is set', () => {
    const result = scoreProductContent({ ...baseFull, hasBrand: false })
    const c = result.breakdown.find((x) => x.id === 'brandAndCategory')
    expect(c?.pass).toBe(false)
    expect(c?.message).toMatch(/Brand is missing/)
  })

  it('reports missing category specifically when brand is set', () => {
    const result = scoreProductContent({ ...baseFull, hasCategory: false })
    const c = result.breakdown.find((x) => x.id === 'brandAndCategory')
    expect(c?.pass).toBe(false)
    expect(c?.message).toMatch(/Category is missing/)
  })

  it('flags missing commerce attributes (weight + country + mpn)', () => {
    const result = scoreProductContent({ ...baseFull, hasCommerceAttributes: false })
    expect(result.breakdown.find((x) => x.id === 'commerceAttributes')?.pass).toBe(false)
  })

  it('produces a partial score for a typical mid-quality product', () => {
    // A product with everything except the long description and the
    // FAQ requirement — i.e. has specs, images, brand/category, but the
    // editor never wrote prose. Score should be in the warn band.
    const result = scoreProductContent({
      ...baseFull,
      descriptionLongWords: 50,
      faqCount: 0,
    })
    expect(result.score).toBeGreaterThan(40)
    expect(result.score).toBeLessThan(80)
  })
})

describe('wordCount', () => {
  it('returns 0 for null / undefined / empty', () => {
    expect(wordCount(null)).toBe(0)
    expect(wordCount(undefined)).toBe(0)
    expect(wordCount('')).toBe(0)
    expect(wordCount('   ')).toBe(0)
  })

  it('counts plain prose', () => {
    expect(wordCount('Hydraulic axial piston pump')).toBe(4)
    expect(wordCount('A B C D E')).toBe(5)
  })

  it('strips markdown emphasis without inflating the count', () => {
    expect(wordCount('**axial** piston *pump*')).toBe(3)
    expect(wordCount('this `code` block')).toBe(3)
  })

  it('reduces a markdown link to its label', () => {
    expect(wordCount('see [datasheet](https://example.com/foo) for details')).toBe(4)
  })

  it('collapses whitespace and newlines', () => {
    expect(wordCount('one\n\ntwo\t three\r\nfour')).toBe(4)
  })
})

describe('isProductIndexable', () => {
  it('holds back a page below the content gate with no size table', () => {
    expect(
      isProductIndexable({ robotsIndex: true, contentScore: PRODUCT_INDEX_MIN_CONTENT_SCORE - 1, sizeRows: 0 }),
    ).toBe(false)
  })

  it('offers a page at the gate', () => {
    expect(
      isProductIndexable({ robotsIndex: true, contentScore: PRODUCT_INDEX_MIN_CONTENT_SCORE, sizeRows: 0 }),
    ).toBe(true)
  })

  it('lets an explicit noindex win over a high score', () => {
    expect(isProductIndexable({ robotsIndex: false, contentScore: 100, sizeRows: 0 })).toBe(false)
  })

  // The score never sees product_variants. A lifting family with short prose,
  // no brand and an 8-row size table scored 10 and was noindexed.
  it('offers a low-scoring page that carries a real size table', () => {
    expect(
      isProductIndexable({ robotsIndex: true, contentScore: 10, sizeRows: PRODUCT_INDEX_MIN_SIZE_ROWS }),
    ).toBe(true)
  })

  it('holds back a low-scoring page with no size table at all', () => {
    expect(isProductIndexable({ robotsIndex: true, contentScore: 10, sizeRows: 0 })).toBe(false)
  })

  // A single-size family still has its rating and dimensions in a table row;
  // only the complete absence of a table marks a stub.
  it('counts a single-row size table', () => {
    expect(PRODUCT_INDEX_MIN_SIZE_ROWS).toBe(1)
  })

  it('lets an explicit noindex win over a size table', () => {
    expect(isProductIndexable({ robotsIndex: false, contentScore: 10, sizeRows: 50 })).toBe(false)
  })

  // The production split this gate was drawn on: stubs at 6–19, real pages
  // from 31. If the gate drifts into either band it is no longer the line the
  // data drew.
  it('sits in the gap between the measured stub and content bands', () => {
    expect(PRODUCT_INDEX_MIN_CONTENT_SCORE).toBeGreaterThan(19)
    expect(PRODUCT_INDEX_MIN_CONTENT_SCORE).toBeLessThanOrEqual(31)
  })
})
