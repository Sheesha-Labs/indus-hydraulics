import { describe, expect, it } from 'vitest'
import { MARKET_REACH_PROFILES, buildMarketReachBlock } from '@indus/domain'

import { withCrossLinks } from './blog-article-import'
import { BLOG_CROSS_LINKS } from './blog-cross-links'
import CATEGORIES from './2026-08-17-blog-taxonomy/categories'
import { GULF_CATEGORY } from './2026-08-24-blog-wave-3-gulf/category'
import { GCC_COMPLIANCE_CATEGORY } from './2026-09-01-gcc-supplier-wave-1/category'
import { BUYING_FITTINGS_CATEGORY } from './2026-09-01-africa-fittings-wave-2/category'

import type { BlogBlocksInput } from '@indus/domain'

/**
 * The seam between the reach profiles, which live in `@indus/domain`, and the
 * blog taxonomy, which lives here. `blog-market-reach.test.ts` in domain proves
 * the generator is correct; this proves it is wired to the right set of
 * categories and composed into the article in the right place.
 */

/** Every blog category that has ever been seeded. */
const ALL_CATEGORY_SLUGS = [
  ...CATEGORIES.map((c) => c.slug),
  GULF_CATEGORY.slug,
  GCC_COMPLIANCE_CATEGORY.slug,
  BUYING_FITTINGS_CATEGORY.slug,
]

describe('reach profile coverage', () => {
  it('has a profile for every blog category', () => {
    const missing = ALL_CATEGORY_SLUGS.filter((slug) => !MARKET_REACH_PROFILES[slug])
    expect(missing).toEqual([])
  })

  it('has no profile for a category that does not exist', () => {
    const known = new Set(ALL_CATEGORY_SLUGS)
    expect(Object.keys(MARKET_REACH_PROFILES).filter((slug) => !known.has(slug))).toEqual([])
  })
})

describe('withCrossLinks', () => {
  const slug = 'why-hydraulic-hoses-fail'
  const article: BlogBlocksInput = [
    { type: 'lead', html: '<p>Why hoses fail.</p>' },
    { type: 'cta_block', heading: 'Need one built?', body: 'Send us the measurements.' },
  ]

  it('adds nothing when no category is given', () => {
    const out = withCrossLinks(slug, article)
    expect(out.some((b) => b.type === 'market_reach')).toBe(false)
  })

  /**
   * The 2026-08-25 cross-links script calls `withCrossLinks` with no category.
   * If the strip were unconditional it would run clean, report "0 blocks
   * added", and delete the reach section off all 93 articles.
   */
  it('leaves an existing reach block alone when no category is given', () => {
    const existing = withCrossLinks(slug, article, 'failure-analysis')
    const again = withCrossLinks(slug, existing)
    expect(again.filter((b) => b.type === 'market_reach')).toHaveLength(1)
    expect(again.find((b) => b.type === 'market_reach')).toEqual(
      existing.find((b) => b.type === 'market_reach')
    )
  })

  it('adds exactly one reach block, and replaces it rather than stacking', () => {
    const once = withCrossLinks(slug, article, 'failure-analysis')
    const twice = withCrossLinks(slug, once, 'failure-analysis')
    expect(once.filter((b) => b.type === 'market_reach')).toHaveLength(1)
    expect(twice).toEqual(once)
  })

  it('puts the reach block last before the CTA', () => {
    const out = withCrossLinks(slug, article, 'failure-analysis')
    const types = out.map((b) => b.type)
    expect(types[types.length - 1]).toBe('cta_block')
    expect(types[types.length - 2]).toBe('market_reach')
    // Related reading comes before it, so the last thing above the quote panel
    // is "and we ship this to you".
    expect(types.indexOf('related_articles')).toBeLessThan(types.indexOf('market_reach'))
  })

  it('appends the reach block when an article has no CTA', () => {
    const out = withCrossLinks(slug, [{ type: 'lead', html: '<p>x</p>' }], 'failure-analysis')
    expect(out[out.length - 1]?.type).toBe('market_reach')
  })

  it('composes a block for every article in the link graph', () => {
    // Category is not on the cross-link map, so this checks the generator runs
    // clean over the real slug set rather than over the sample in domain.
    for (const articleSlug of Object.keys(BLOG_CROSS_LINKS)) {
      for (const category of ALL_CATEGORY_SLUGS) {
        expect(buildMarketReachBlock(articleSlug, category), `${articleSlug}/${category}`).not.toBe(
          null
        )
      }
    }
  })
})
