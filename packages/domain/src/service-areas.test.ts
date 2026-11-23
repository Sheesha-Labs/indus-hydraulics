import { describe, expect, it } from 'vitest'
import {
  HOSE_BAY_COORDS,
  SERVICE_AREAS,
  hoseBayDistanceKm,
  kmBetween,
  nearestServiceAreas,
  serviceAreaBySlug,
  serviceAreaNames,
  serviceAreasOrdered,
} from './service-areas'
import {
  LOCATION_BUILT_IN_PREPARE,
  locationBuiltInOptions,
  locationBuiltInServices,
} from './location-copy'
import { LOCATION_INDUSTRY_OPTIONS, LOCATION_SECTIONS } from './page-sections/subpages'
import { LOCATIONS_PAGE } from './page-sections/pages'

/**
 * Every sentence a location page can render without anyone writing it: the
 * area records, the template's built-in band copy and the hub's defaults.
 */
function allLocationProse(): string {
  const hubDefaults = LOCATIONS_PAGE.sections.flatMap((section) =>
    Object.values(section.defaults).flatMap((value) =>
      typeof value === 'string'
        ? [value]
        : Array.isArray(value)
          ? value.flatMap((row) =>
              Object.values(row).filter((v): v is string => typeof v === 'string')
            )
          : []
    )
  )
  return [
    ...SERVICE_AREAS.flatMap((a) => [
      a.summary,
      a.intro,
      a.metaDescription ?? '',
      a.constraint.label,
      a.constraint.detail,
      ...a.demand,
      ...locationBuiltInOptions(a).flatMap((o) => [o.name, o.desc]),
      ...locationBuiltInServices(a).flatMap((o) => [o.name, o.desc]),
    ]),
    ...LOCATION_BUILT_IN_PREPARE,
    ...hubDefaults,
  ].join(' ')
}

describe('service areas', () => {
  it('covers the seven emirates, the Habshan gas fields and Al Ain', () => {
    expect(SERVICE_AREAS).toHaveLength(9)
    expect(serviceAreasOrdered().map((a) => a.slug)).toEqual([
      'dubai',
      'abu-dhabi',
      'habshan',
      'sharjah',
      'ajman',
      'umm-al-quwain',
      'ras-al-khaimah',
      'fujairah',
      'al-ain',
    ])
  })

  it('has unique slugs and positions', () => {
    expect(new Set(SERVICE_AREAS.map((a) => a.slug)).size).toBe(SERVICE_AREAS.length)
    expect(new Set(SERVICE_AREAS.map((a) => a.position)).size).toBe(SERVICE_AREAS.length)
  })

  it('uses kebab-case slugs so they are valid URL segments', () => {
    for (const area of SERVICE_AREAS) {
      expect(area.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  it('gives every area substantive content rather than a stub', () => {
    for (const area of SERVICE_AREAS) {
      expect(area.zones.length).toBeGreaterThan(0)
      expect(area.demand.length).toBeGreaterThan(1)
      expect(area.relatedArticles.length).toBeGreaterThan(0)
      // The stocked-ranges band is the page's hand-off to the catalogue; two
      // cards (the old count) left most buyers with nothing to click.
      expect(area.relatedCategories.length).toBeGreaterThanOrEqual(6)
      expect(area.relatedArticles.length).toBeGreaterThanOrEqual(4)
      expect(area.intro.length).toBeGreaterThan(80)
      expect(area.constraint.detail.length).toBeGreaterThan(60)
    }
  })

  it('never claims premises — copy says service, not branch', () => {
    // The whole point of this dataset. site-locations.ts warns that asserting
    // an unverified location risks a false-business-presence penalty, and
    // there is exactly one verified office.
    const prose = allLocationProse()
    expect(prose).not.toMatch(/\bour (branch|office|depot|premises)\b/i)
    expect(prose).not.toMatch(/\bbranch in\b/i)
  })

  it('publishes no response-time commitment', () => {
    // Zone arrival times are operational promises; an unmet one is worse than
    // none, and assistants repeat them back to customers.
    const prose = allLocationProse()
    expect(prose).not.toMatch(/\b\d+\s*(?:-|\s)?(?:minute|hour|hr)s?\b/i)
    expect(prose).not.toMatch(/\b24\/7\b/)
  })

  it('resolves by slug and returns undefined for an unknown one', () => {
    expect(serviceAreaBySlug('fujairah')?.name).toBe('Fujairah')
    expect(serviceAreaBySlug('doha')).toBeUndefined()
  })

  it('exposes names for areaServed', () => {
    expect(serviceAreaNames()).toContain('Habshan and Al Dhafra')
  })

  it('places every area inside the UAE, and the bay in Al Qusais', () => {
    for (const area of SERVICE_AREAS) {
      const [lon, lat] = area.coords
      expect(lon, area.slug).toBeGreaterThan(51.5)
      expect(lon, area.slug).toBeLessThan(56.45)
      expect(lat, area.slug).toBeGreaterThan(22.6)
      expect(lat, area.slug).toBeLessThan(26.1)
    }
    expect(HOSE_BAY_COORDS[0]).toBeCloseTo(55.38, 1)
    expect(HOSE_BAY_COORDS[1]).toBeCloseTo(25.28, 1)
  })

  it('measures straight-line distance from the bay sensibly', () => {
    // Mussafah is ~130 km from Al Qusais as the crow flies; Sharjah is next door.
    expect(hoseBayDistanceKm(serviceAreaBySlug('abu-dhabi')!)).toBeGreaterThanOrEqual(120)
    expect(hoseBayDistanceKm(serviceAreaBySlug('abu-dhabi')!)).toBeLessThanOrEqual(145)
    expect(hoseBayDistanceKm(serviceAreaBySlug('sharjah')!)).toBeLessThanOrEqual(15)
    expect(kmBetween([55, 25], [55, 25])).toBe(0)
  })

  it('lists the nearest areas, nearest first, never itself', () => {
    const ajman = serviceAreaBySlug('ajman')!
    const near = nearestServiceAreas(ajman, 3).map((a) => a.slug)
    expect(near).not.toContain('ajman')
    expect(near).toHaveLength(3)
    expect(near[0]).toBe('sharjah')
  })

  it('links industries that exist and Wikipedia pages for every area', () => {
    const industries = new Set<string>(LOCATION_INDUSTRY_OPTIONS.map((o) => o.value))
    for (const area of SERVICE_AREAS) {
      expect(area.industries.length, area.slug).toBeGreaterThan(0)
      for (const slug of area.industries)
        expect(industries.has(slug), `${area.slug}: ${slug}`).toBe(true)
      expect(area.wikipedia).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\/[A-Za-z_]+$/)
    }
  })

  it('keeps every location-template override blank by default', () => {
    // A sub-page field is an OVERRIDE: a non-null default would freeze one
    // area's wording onto all nine pages.
    for (const section of LOCATION_SECTIONS) {
      for (const [key, value] of Object.entries(section.defaults)) {
        const blank =
          value === null ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' &&
            value !== null &&
            'mediaId' in value &&
            value.mediaId === null)
        expect(blank, `${section.key}.${key}`).toBe(true)
      }
    }
  })
})
