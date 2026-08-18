import { describe, expect, it } from 'vitest'
import {
  SERVICE_AREAS,
  serviceAreaBySlug,
  serviceAreaNames,
  serviceAreasOrdered,
} from './service-areas'

describe('service areas', () => {
  it('covers the seven areas we actually service', () => {
    expect(SERVICE_AREAS).toHaveLength(7)
    expect(serviceAreasOrdered().map((a) => a.slug)).toEqual([
      'dubai',
      'abu-dhabi',
      'habshan',
      'sharjah',
      'ajman',
      'ras-al-khaimah',
      'fujairah',
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
      expect(area.relatedCategories.length).toBeGreaterThan(0)
      expect(area.intro.length).toBeGreaterThan(80)
      expect(area.constraint.detail.length).toBeGreaterThan(60)
    }
  })

  it('never claims premises — copy says service, not branch', () => {
    // The whole point of this dataset. site-locations.ts warns that asserting
    // an unverified location risks a false-business-presence penalty, and
    // there is exactly one verified office.
    const prose = SERVICE_AREAS.flatMap((a) => [a.summary, a.intro, a.constraint.detail]).join(' ')
    expect(prose).not.toMatch(/\bour (branch|office|depot|premises)\b/i)
    expect(prose).not.toMatch(/\bbranch in\b/i)
  })

  it('publishes no response-time commitment', () => {
    // Zone arrival times are operational promises; an unmet one is worse than
    // none, and assistants repeat them back to customers.
    const prose = SERVICE_AREAS.flatMap((a) => [a.summary, a.intro, a.constraint.detail]).join(' ')
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
})
