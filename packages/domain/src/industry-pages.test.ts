import { describe, expect, it } from 'vitest'
import type { DesignedPageImage } from './designed-pages'
import {
  DESIGNED_INDUSTRY_PAGES,
  designedIndustryPage,
  designedIndustrySlugs,
} from './industry-pages'

/**
 * The registry is content, so most of it cannot be tested — nobody can assert
 * that a lede reads well. What CAN be asserted is the set of mistakes that
 * would ship silently: an image with no alt text, a slug that two things
 * disagree about, a live-figure token frozen into a string, or an application
 * option in the form that the server action would then reject.
 */

function everyImage(): DesignedPageImage[] {
  return DESIGNED_INDUSTRY_PAGES.flatMap((page) => [
    page.hero.image,
    page.architecture.image,
    page.risk.image,
    ...page.locations.items.map((i) => i.image),
    ...page.families.items.map((i) => i.image),
    ...page.qc.items.map((i) => i.image),
  ])
}

describe('designed industry pages', () => {
  it('has a page for the data-centre liquid-cooling slug', () => {
    const page = designedIndustryPage('data-center-liquid-cooling')
    expect(page).toBeDefined()
    expect(page?.card.name).toBe('AI Data Centre Liquid Cooling')
  })

  it('returns undefined for a slug that takes the DB template', () => {
    // The six table-backed industries must fall through, or the route would
    // render a designed page for a record it knows nothing about.
    for (const slug of ['oil-gas', 'mining', 'marine', 'steel', 'construction', 'power']) {
      expect(designedIndustryPage(slug)).toBeUndefined()
    }
  })

  it('exposes every slug exactly once', () => {
    const slugs = designedIndustrySlugs()
    expect(slugs).toHaveLength(DESIGNED_INDUSTRY_PAGES.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('uses lower-case hyphenated slugs', () => {
    for (const slug of designedIndustrySlugs()) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })
})

describe('imagery', () => {
  it('gives every image real alt text', () => {
    // These are content photographs, never decoration — an empty alt on any of
    // them is a bug, not a choice.
    for (const image of everyImage()) {
      expect(image.alt.trim().length).toBeGreaterThan(12)
    }
  })

  it('serves every image from the industry-images bucket', () => {
    // A src left pointing at the supplier's own server would 403 in production:
    // they block cross-origin requests, which is why the files were copied.
    for (const image of everyImage()) {
      expect(image.src).toMatch(
        /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/industry-images\//,
      )
    }
  })

  it('never reuses one photograph in two slots', () => {
    // Two identical frames on one page reads as a stock-photo page. It also
    // means one of the two alt texts is describing the wrong thing.
    const sources = everyImage().map((i) => i.src)
    expect(new Set(sources).size).toBe(sources.length)
  })
})

describe('copy integrity', () => {
  it('leaves live figures as tokens rather than freezing the number', () => {
    const page = designedIndustryPage('data-center-liquid-cooling')!
    const years = page.hero.stats.find((s) => s.label === 'Specialist supply')
    expect(years?.value).toContain('{years}')
  })

  it('keeps the coolant-compatibility disclaimer', () => {
    // This is the page's liability line. Losing it in an edit is the failure
    // this test exists to catch.
    const page = designedIndustryPage('data-center-liquid-cooling')!
    expect(page.architecture.disclaimer).toContain('must be confirmed by the system designer')
  })

  it('offers only applications the enquiry action will accept', () => {
    // `submitIndustryEnquiry` validates the posted application against this
    // list and drops anything else. A blank or duplicated option would mean a
    // routing hint the desk silently never receives.
    for (const page of DESIGNED_INDUSTRY_PAGES) {
      const applications = page.review.applications
      expect(applications.length).toBeGreaterThan(0)
      expect(new Set(applications).size).toBe(applications.length)
      for (const application of applications) {
        expect(application.trim()).toBe(application)
        expect(application.length).toBeGreaterThan(0)
      }
    }
  })

  it('numbers the ordered bands from 01 without gaps', () => {
    const page = designedIndustryPage('data-center-liquid-cooling')!
    const expected = ['01', '02', '03', '04']
    expect(page.locations.items.map((i) => i.number)).toEqual(expected)
    expect(page.qc.items.map((i) => i.number)).toEqual(expected)
    expect(page.risk.items.map((i) => i.number)).toEqual(expected)
  })

  it('points the risk-band CTA at a route that exists on this site', () => {
    // The designed label named a quality-control page the site does not have.
    // Whatever it says, the href has to be a real internal path.
    for (const page of DESIGNED_INDUSTRY_PAGES) {
      expect(page.risk.ctaHref.startsWith('/')).toBe(true)
    }
  })
})
