import { describe, it, expect } from 'vitest'
import {
  buildProductLd,
  buildBreadcrumbLd,
  buildFaqLd,
  buildCollectionLd,
  buildOrgLd,
  buildWebsiteLd,
  mergeJsonLd,
} from './jsonld'

describe('buildProductLd', () => {
  it('emits the Product schema with offers and brand', () => {
    const ld = buildProductLd({
      name: 'Parker Fitting',
      sku: '10643-6-6',
      url: 'https://example.com/p/foo',
      imageUrls: ['https://cdn/x.jpg'],
      brand: { name: 'Parker' },
      offers: { price: 12.5, currency: 'USD', availability: 'in_stock' },
    })
    expect(ld['@type']).toBe('Product')
    expect((ld.offers as Record<string, unknown>).availability).toBe('https://schema.org/InStock')
    expect((ld.offers as Record<string, unknown>).price).toBe('12.50')
    expect((ld.brand as Record<string, unknown>).name).toBe('Parker')
  })

  it('respects override deep-merge', () => {
    const ld = buildProductLd({
      name: 'Parker Fitting',
      sku: '10643-6-6',
      url: 'https://example.com/p/foo',
      imageUrls: [],
      override: { aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.6' } },
    })
    expect((ld.aggregateRating as Record<string, unknown>).ratingValue).toBe('4.6')
  })
})

describe('buildBreadcrumbLd', () => {
  it('builds a numbered ItemList', () => {
    const ld = buildBreadcrumbLd({
      items: [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Hose Fittings', url: 'https://example.com/c/hose-fittings' },
      ],
    })
    expect(ld['@type']).toBe('BreadcrumbList')
    const items = ld.itemListElement as Array<{ position: number; name: string }>
    expect(items[0]).toMatchObject({ position: 1, name: 'Home' })
    expect(items[1]).toMatchObject({ position: 2, name: 'Hose Fittings' })
  })
})

describe('buildFaqLd', () => {
  it('returns null for empty FAQ list (so the page omits the script tag)', () => {
    expect(buildFaqLd({ faqs: [] })).toBeNull()
  })

  it('emits an FAQPage with Question/Answer entities', () => {
    const ld = buildFaqLd({
      faqs: [{ question: 'Q?', answer: 'A.' }],
    })
    expect(ld?.['@type']).toBe('FAQPage')
  })
})

describe('buildCollectionLd', () => {
  it('emits CollectionPage', () => {
    const ld = buildCollectionLd({
      name: 'Hose Fittings',
      url: 'https://example.com/c/hose-fittings',
    })
    expect(ld['@type']).toBe('CollectionPage')
  })
})

describe('buildOrgLd / buildWebsiteLd', () => {
  it('emits Organization with logo and contact', () => {
    const ld = buildOrgLd({
      name: 'Indus Hydraulics',
      url: 'https://example.com',
      logoUrl: 'https://cdn/logo.png',
      contact: { email: 'sales@example.com' },
    })
    expect(ld.logo).toBe('https://cdn/logo.png')
    expect((ld.contactPoint as Record<string, unknown>).email).toBe('sales@example.com')
  })

  it('emits WebSite with sitelinks searchbox when template provided', () => {
    const ld = buildWebsiteLd({
      name: 'Indus Hydraulics',
      url: 'https://example.com',
      searchUrlTemplate: 'https://example.com/search?q={search_term_string}',
    })
    expect((ld.potentialAction as Record<string, unknown>)['@type']).toBe('SearchAction')
  })
})

describe('mergeJsonLd', () => {
  it('deep merges nested objects', () => {
    const merged = mergeJsonLd({ a: { b: 1, c: 2 } } as Record<string, unknown>, {
      a: { c: 99, d: 3 },
    })
    expect(merged).toEqual({ a: { b: 1, c: 99, d: 3 } })
  })

  it('replaces arrays wholesale', () => {
    const merged = mergeJsonLd({ a: [1, 2, 3] } as Record<string, unknown>, {
      a: [4, 5],
    })
    expect(merged.a).toEqual([4, 5])
  })

  it('returns base when override is not a plain object', () => {
    expect(mergeJsonLd({ a: 1 } as Record<string, unknown>, undefined)).toEqual({ a: 1 })
    expect(mergeJsonLd({ a: 1 } as Record<string, unknown>, null)).toEqual({ a: 1 })
    expect(mergeJsonLd({ a: 1 } as Record<string, unknown>, [1, 2])).toEqual({ a: 1 })
  })
})
