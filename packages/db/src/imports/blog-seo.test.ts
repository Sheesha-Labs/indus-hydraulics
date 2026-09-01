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

/**
 * The 93 articles whose titles were written before the rendered-length rule.
 * Each renders longer than 60 characters once the storefront appends the site
 * name. Shrinking this list is a content task, not a code one.
 */
const PRE_SUFFIX_RULE = new Set([
  'why-hydraulic-hoses-fail',
  'hose-routing-bend-radius-twist',
  'hose-burst-at-the-fitting',
  'hydraulic-hose-cover-blistering',
  'hydraulic-hose-wire-corrosion',
  'hydraulic-hose-abrasion-failure',
  'hydraulic-hose-installed-with-a-twist',
  'hydraulic-hose-kinked',
  'hydraulic-hose-tube-swelling',
  'hydraulic-hose-cover-cracking',
  'hydraulic-hose-crimp-faults',
  'hose-failure-post-mortem',
  'new-hydraulic-hose-weeping',
  'cross-threaded-hydraulic-port',
  'split-female-quick-coupler',
  'identify-any-hydraulic-fitting',
  'bspp-vs-bspt',
  'jic-vs-orfs-vs-npt-vs-bsp',
  'hydraulic-thread-size-and-pitch-reference',
  'photographing-a-hydraulic-fitting',
  'bspp-bonded-seal-sizing',
  'stacking-hydraulic-adapters',
  'hydraulic-hose-in-uae-heat',
  'hydraulic-hose-uv-and-ozone',
  'hydraulic-hose-sand-abrasion',
  'hydraulic-hose-coastal-corrosion',
  'offshore-hydraulic-hose',
  'hydraulic-hose-shelf-life-storage',
  'why-summer-is-harder-on-hydraulic-hose',
  'desalination-and-water-treatment-hose',
  'getting-a-hydraulic-hose-made',
  'skiving-and-fitting-selection',
  'on-site-hydraulic-hose-service-uae',
  'hose-service-northern-emirates',
  'bulk-hose-refit-and-tagging',
  'how-to-measure-a-hydraulic-hose',
  'hydraulic-quick-couplers-iso-7241',
  'hydraulic-fitting-make-up-torque',
  'field-re-hosing-kit',
  'industrial-hose-is-not-hydraulic-hose',
  'chemical-transfer-hose-selection',
  'steam-hose-safety',
  'food-grade-hose-compliance',
  'water-suction-and-dewatering-hose',
  'excavator-hydraulic-hose-replacement',
  'forklift-hydraulic-hose-replacement',
  'tipper-and-transit-mixer-hose',
  'wheel-loader-hydraulic-hose',
  'mobile-crane-hydraulic-hose',
  'backhoe-hydraulic-hose',
  'skid-steer-hydraulic-hose',
  'truck-crane-hydraulic-hose',
  'boom-lift-hydraulic-hose',
  'port-equipment-hydraulic-hose',
  'tractor-hydraulic-hose',
  'concrete-pump-hydraulic-hose',
  'injection-moulding-hydraulic-hose',
  'refuse-truck-hydraulic-hose',
  'removing-a-seized-hydraulic-fitting',
  'log-splitter-and-shop-press-hose',
  'detaching-a-hose-on-a-modern-machine',
  'hydraulic-hose-inspection',
  'hose-register-and-replacement-programme',
  'contamination-during-a-hose-change',
  'grease-and-zerk-fittings',
  'mini-excavator-hose-maintenance',
  'api-7k-16c-16d-which-standard',
  'api-16c-choke-and-kill-lines',
  'bop-control-hose-fire-resistance',
  'api-7k-rotary-vibrator-hose',
  'rig-site-hose-replacement-abu-dhabi',
  'how-to-cross-reference-a-hydraulic-hose',
  'what-to-send-for-a-hose-quote',
  'hydraulic-hose-assembly-cost',
  'hydraulic-hose-stocking-policy',
  'hydraulic-hose-lead-times',
  'bulk-hose-or-finished-assemblies',
  'unbranded-hydraulic-fittings',
  'hydraulic-hose-kits-for-a-fleet',
  'should-you-buy-a-hose-crimper',
  'hydraulic-fluid-injection-injury',
  'hose-whip-restraint-and-burst-protection',
  'trapped-pressure-quick-coupler',
  'hydraulic-hose-pressure-by-size',
  'braid-vs-spiral-hydraulic-hose',
  'compact-hose-1sc-2sc',
  'sae-100r-hose-types',
  'en-853-856-857-vs-sae-100r',
  'hydraulic-hose-dash-sizes',
  'how-to-read-a-hose-layline',
  'stopping-an-npt-thread-leak',
  'sae-j518-code-61-code-62-flanges',
  'where-jic-is-the-wrong-choice',
])

describe('BLOG_SEO', () => {
  const entries = Object.entries(BLOG_SEO)

  it('covers the whole blog exactly once', () => {
    expect(entries.length).toBe(143)
  })

  /**
   * The scored range is 30–60 and the storefront appends ' | Indus Hydraulics'
   * — 19 characters the range does not know about. A 60-character title
   * therefore renders at 79 and is truncated in the result page, which is a
   * real loss the internal score cannot see.
   *
   * The 40 articles from the 2026-09-01 sprints are written to a 40-character
   * cap so the rendered title fits. The 93 that predate the rule are listed as
   * a known exception rather than silently excluded: fixing them is a title
   * rewrite of the whole back catalogue and is its own piece of work.
   */
  it('keeps the rendered title under 60 for entries written to the cap', () => {
    const SUFFIX = ' | Indus Hydraulics'.length
    for (const [slug, seo] of entries) {
      if (PRE_SUFFIX_RULE.has(slug)) continue
      expect(seo.seoTitle.length + SUFFIX, `${slug}: "${seo.seoTitle}"`).toBeLessThanOrEqual(60)
    }
  })

  it('has an exception list that only shrinks', () => {
    expect(PRE_SUFFIX_RULE.size).toBeLessThanOrEqual(93)
    for (const slug of PRE_SUFFIX_RULE) {
      expect(Object.keys(BLOG_SEO), `${slug} is not a real entry`).toContain(slug)
    }
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
