import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'
import {
  CATEGORY_REACH_PROFILES,
  DESIGNED_PAGE_REACH_PROFILES,
  INDUSTRY_REACH_PROFILES,
  MARKET_REACH_PROFILES,
  SERVICE_CASE_CATEGORIES_WITHOUT_REACH,
  SERVICE_CASE_REACH_PROFILES,
  designedIndustrySlugs,
} from '@indus/domain'

import CATEGORIES from './2026-08-17-blog-taxonomy/categories'
import { GULF_CATEGORY } from './2026-08-24-blog-wave-3-gulf/category'
import { GCC_COMPLIANCE_CATEGORY } from './2026-09-01-gcc-supplier-wave-1/category'
import { BUYING_FITTINGS_CATEGORY } from './2026-09-01-africa-fittings-wave-2/category'
import { FITTINGS_BY_INDUSTRY_CATEGORY } from './2026-09-01-africa-fittings-wave-3/category'

/**
 * The seam between the reach profiles, which live in `@indus/domain`, and the
 * taxonomies they are keyed by, which live here and in the Prisma schema.
 *
 * `market-reach.test.ts` in domain proves the engine is correct. This proves
 * it is wired to the right set of keys — the failure this catches is a new
 * blog category, service-case category or industry shipping with no profile,
 * which renders as a page that silently says nothing about delivery.
 */

/** Every blog category that has ever been seeded. */
const BLOG_CATEGORY_SLUGS = [
  ...CATEGORIES.map((c) => c.slug),
  GULF_CATEGORY.slug,
  GCC_COMPLIANCE_CATEGORY.slug,
  BUYING_FITTINGS_CATEGORY.slug,
  FITTINGS_BY_INDUSTRY_CATEGORY.slug,
]

/**
 * `ServiceCaseCategory` read out of the schema rather than imported.
 *
 * The generated Prisma client exports the enum as a value, but `@indus/domain`
 * deliberately does not depend on it, and importing it here only to compare
 * against a domain constant would make the test pass for the wrong reason if
 * the client were ever stale. The schema file is the authority both the client
 * and the database are generated from.
 */
function serviceCaseCategories(): string[] {
  const schema = readFileSync(join(__dirname, '../../prisma/schema.prisma'), 'utf8')
  const block = /enum ServiceCaseCategory \{([^}]*)\}/.exec(schema)
  if (!block) throw new Error('ServiceCaseCategory not found in schema.prisma')
  return block[1]!
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'))
}

describe('blog categories', () => {
  it('has a profile for every category, and no profile for a category that does not exist', () => {
    expect(BLOG_CATEGORY_SLUGS.filter((s) => !MARKET_REACH_PROFILES[s])).toEqual([])
    const known = new Set(BLOG_CATEGORY_SLUGS)
    expect(Object.keys(MARKET_REACH_PROFILES).filter((s) => !known.has(s))).toEqual([])
  })
})

describe('service case categories', () => {
  const categories = serviceCaseCategories()

  it('reads the enum out of the schema rather than trusting an empty match', () => {
    // A regex that silently matched nothing would report perfect coverage.
    expect(categories.length).toBeGreaterThan(5)
    expect(categories).toContain('field_service')
  })

  /**
   * Every category is either written or deliberately excluded. A category that
   * is neither is the failure this exists to catch: it renders a page that
   * says nothing about delivery, and nothing anywhere records whether that was
   * a decision.
   */
  it('accounts for every category in the enum, as a profile or as an exclusion', () => {
    const excluded = new Set(SERVICE_CASE_CATEGORIES_WITHOUT_REACH)
    expect(categories.filter((c) => !SERVICE_CASE_REACH_PROFILES[c] && !excluded.has(c))).toEqual(
      []
    )
  })

  it('never both writes and excludes the same category', () => {
    expect(
      SERVICE_CASE_CATEGORIES_WITHOUT_REACH.filter((c) => SERVICE_CASE_REACH_PROFILES[c])
    ).toEqual([])
  })

  it('names only real categories, in the profiles and in the exclusions', () => {
    const known = new Set(categories)
    expect(Object.keys(SERVICE_CASE_REACH_PROFILES).filter((c) => !known.has(c))).toEqual([])
    expect(SERVICE_CASE_CATEGORIES_WITHOUT_REACH.filter((c) => !known.has(c))).toEqual([])
  })

  /**
   * `field_service` sells labour delivered in the UAE — a crew day rate and a
   * well-control training course. Restoring a profile for it would put "where
   * we deliver this" and twelve countries above a classroom, which is the
   * false-presence claim markets.ts is written to prevent. If this test is
   * failing because someone added one, that is the conversation to have.
   */
  it('keeps field_service out', () => {
    expect(SERVICE_CASE_REACH_PROFILES['field_service']).toBeUndefined()
  })
})

describe('industries', () => {
  /**
   * The six table-backed industries are named here rather than queried,
   * because this suite has no database. They are a closed, slow-moving set;
   * adding a seventh means editing this list, which is the prompt to write its
   * paragraph. `designedIndustrySlugs()` is unioned in because a designed
   * industry page is a slug in code that the `industries` table cannot see —
   * the same trap `blog-article-import.ts` documents for page links.
   */
  const TABLE_BACKED = ['oil-gas', 'marine', 'mining', 'construction', 'power', 'steel']
  const ALL = [...TABLE_BACKED, ...designedIndustrySlugs()]

  it('has a profile for every industry page, table-backed or designed', () => {
    expect(ALL.filter((s) => !INDUSTRY_REACH_PROFILES[s])).toEqual([])
  })

  it('has no profile for an industry page that does not exist', () => {
    const known = new Set(ALL)
    expect(Object.keys(INDUSTRY_REACH_PROFILES).filter((s) => !known.has(s))).toEqual([])
  })

  it('covers the designed pages, so the union is doing work rather than decorating', () => {
    expect(designedIndustrySlugs().length).toBeGreaterThan(0)
  })
})

describe('catalogue root categories', () => {
  /**
   * The 17 published roots, named here rather than queried because this suite
   * has no database. Unlike the industries list this one is worth stating in
   * full: a root category is a shelf a buyer lands on from search, and adding
   * an eighteenth without a delivery paragraph would ship a hub that says
   * nothing about export. Editing this list is the prompt to write it.
   *
   * Sub-categories are deliberately absent — all 194 inherit their root's
   * profile and seed on their own slug, so there is nothing per-child to check.
   */
  const ROOTS = [
    'hydraulic-hose-fittings-suppliers-uae',
    'industrial-hose-suppliers-uae',
    'oilfield-valve-suppliers-uae',
    'instrumentation-controls',
    'well-testing-equipment',
    'flow-iron-wellhead-equipment-uae',
    'fracturing-equipment',
    'blowout-preventers',
    'drilling-workover-systems',
    'cementing-equipment',
    'industrial-lubricant-suppliers-uae',
    'stimulation-equipment',
    'oil-gas-hoses',
    'valves-manifolds',
    'seals-accessories',
    'hydraulic-pumps',
    'cylinders',
  ]

  it('has a profile for every published root category', () => {
    expect(ROOTS.filter((s) => !CATEGORY_REACH_PROFILES[s])).toEqual([])
  })

  it('has no profile for a root that does not exist', () => {
    const known = new Set(ROOTS)
    expect(Object.keys(CATEGORY_REACH_PROFILES).filter((s) => !known.has(s))).toEqual([])
  })
})

describe('designed capability pages', () => {
  /**
   * The static routes under `apps/web/src/app/(storefront)/`. The third member
   * of the designed-pages family, `/industries/data-center-liquid-cooling`,
   * belongs to the industry map instead because it dispatches through
   * `industries/[slug]` — see the note in `designed-page-market-reach.ts`.
   */
  const PAGES = ['manufacturing', 'quality-control']

  it('has a profile for both pages', () => {
    expect(PAGES.filter((p) => !DESIGNED_PAGE_REACH_PROFILES[p])).toEqual([])
  })

  it('has no profile for a page that does not exist', () => {
    const known = new Set(PAGES)
    expect(Object.keys(DESIGNED_PAGE_REACH_PROFILES).filter((p) => !known.has(p))).toEqual([])
  })

  it('does not double-key the data-centre page, which is an industry', () => {
    expect(DESIGNED_PAGE_REACH_PROFILES['data-center-liquid-cooling']).toBeUndefined()
  })
})
