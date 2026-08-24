import { describe, expect, it } from 'vitest'
import { BLOG_SEO } from './blog-seo'

/**
 * The four properties `scoreEntity` charges for, asserted for all 93 articles.
 *
 * These are not style preferences. A focus keyword that fails `keywordInTitle`
 * or `keywordInUrl` adds 13 to the score denominator and nothing to the
 * numerator, so it scores worse than no keyword at all. Before this file, 57
 * of 93 articles were in that state.
 */

// Mirrors TITLE_RANGE and DESCRIPTION_RANGE in @indus/domain.
const TITLE = { min: 30, max: 60 }
const DESCRIPTION = { min: 120, max: 160 }

describe('BLOG_SEO', () => {
  const entries = Object.entries(BLOG_SEO)

  it('covers the whole blog exactly once', () => {
    expect(entries.length).toBe(93)
  })

  it('keeps every title inside the scored range', () => {
    for (const [slug, seo] of entries) {
      expect(seo.seoTitle.length, `${slug}: "${seo.seoTitle}"`).toBeGreaterThanOrEqual(TITLE.min)
      expect(seo.seoTitle.length, `${slug}: "${seo.seoTitle}"`).toBeLessThanOrEqual(TITLE.max)
    }
  })

  it('keeps every description inside the scored range', () => {
    for (const [slug, seo] of entries) {
      expect(seo.seoDescription.length, `${slug}`).toBeGreaterThanOrEqual(DESCRIPTION.min)
      expect(seo.seoDescription.length, `${slug}`).toBeLessThanOrEqual(DESCRIPTION.max)
    }
  })

  it('puts the focus keyword in the title — keywordInTitle, weight 8', () => {
    for (const [slug, seo] of entries) {
      expect(
        seo.seoTitle.toLowerCase().includes(seo.focusKeyword.toLowerCase()),
        `${slug}: "${seo.focusKeyword}" not in "${seo.seoTitle}"`,
      ).toBe(true)
    }
  })

  it('puts the focus keyword in the URL — keywordInUrl, weight 5', () => {
    for (const [slug, seo] of entries) {
      const hyphenated = seo.focusKeyword.toLowerCase().replace(/\s+/g, '-')
      expect(slug.includes(hyphenated), `${slug}: does not contain "${hyphenated}"`).toBe(true)
    }
  })

  it('uses keywords specific enough to be worth having', () => {
    for (const [slug, seo] of entries) {
      expect(seo.focusKeyword.trim().split(/\s+/).length, `${slug}`).toBeGreaterThanOrEqual(2)
    }
  })

  it('never repeats a focus keyword across two articles', () => {
    const seen = new Map<string, string>()
    for (const [slug, seo] of entries) {
      const existing = seen.get(seo.focusKeyword)
      expect(existing, `${slug} shares "${seo.focusKeyword}" with ${existing}`).toBeUndefined()
      seen.set(seo.focusKeyword, slug)
    }
  })

  it('leaves the site name to the storefront', () => {
    for (const [slug, seo] of entries) {
      expect(seo.seoTitle.toLowerCase(), slug).not.toContain('indus hydraulics')
    }
  })
})
