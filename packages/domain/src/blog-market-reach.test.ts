import { describe, expect, it } from 'vitest'

import { MarketReachBlockSchema } from './blog-blocks'
import { MARKET_REACH_PROFILES, buildMarketReachBlock } from './blog-market-reach'

/**
 * The blog's wrapper only. Everything about the profiles themselves — honesty
 * rules, rotation, exclusions, region validity — is swept for all three
 * surfaces by `market-reach.test.ts`, which is where a new check belongs.
 *
 * What is left here is the one thing that is blog-specific: the blog STORES
 * its section as a `market_reach` block, so the builder's output has to be a
 * valid block and has to stay byte-identical between runs or every re-import
 * shows as a content diff on 93 articles.
 */

const SAMPLE_SLUGS = [
  'why-hydraulic-hoses-fail',
  'identify-any-hydraulic-fitting',
  'hydraulic-hose-in-uae-heat',
  'backhoe-hydraulic-hose',
  'hydraulic-hose-lead-times',
  'sae-100r-hose-types',
]

const CATEGORIES = Object.keys(MARKET_REACH_PROFILES)

describe('buildMarketReachBlock', () => {
  it('covers every blog category', () => {
    // Eleven after the hose programme; twelve once `gcc-compliance` was added
    // by the GCC supplier sprint, thirteen with `buying-hydraulic-fittings`
    // from the Africa fittings sprint (both 2026-09-01). The count is asserted
    // so a new category cannot ship without a profile — the failure mode being
    // a hub whose articles silently say nothing about delivery.
    // Fourteen with `hydraulic-fittings-by-industry` from the Africa fittings
    // sprint's third wave (2026-09-01).
    expect(CATEGORIES).toHaveLength(14)
  })

  it('returns null for a category with no profile, rather than guessing one', () => {
    expect(buildMarketReachBlock('some-article', 'a-category-nobody-wrote')).toBeNull()
  })

  it('produces a block the schema accepts, every time', () => {
    for (const category of CATEGORIES) {
      for (const slug of SAMPLE_SLUGS) {
        const parsed = MarketReachBlockSchema.safeParse(buildMarketReachBlock(slug, category))
        expect(
          parsed.success ? null : `${category}/${slug}: ${parsed.error.issues[0]?.message}`
        ).toBeNull()
      }
    }
  })

  it('is deterministic — a re-import must not show as a content diff', () => {
    for (const category of CATEGORIES) {
      for (const slug of SAMPLE_SLUGS) {
        expect(buildMarketReachBlock(slug, category)).toEqual(buildMarketReachBlock(slug, category))
      }
    }
  })

  it('carries the block discriminator, not just the reach fields', () => {
    expect(buildMarketReachBlock('why-hydraulic-hoses-fail', 'failure-analysis')?.type).toBe(
      'market_reach'
    )
  })
})
