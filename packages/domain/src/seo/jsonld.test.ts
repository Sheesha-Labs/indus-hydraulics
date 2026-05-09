import { describe, it, expect } from 'vitest'
import {
  buildProductLd,
  buildBreadcrumbLd,
  buildFaqLd,
  buildCollectionLd,
  buildLocalBusinessLd,
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

  it('emits manufacturer, gtin, weight, countryOfOrigin', () => {
    const ld = buildProductLd({
      name: 'Bosch Rexroth A10VSO Pump',
      sku: 'IH-AP71',
      mpn: 'A10VSO 71 DR /31R-VPA12N00',
      gtin13: '4047024876541',
      url: 'https://example.com/p/foo',
      imageUrls: [],
      brand: { name: 'Bosch Rexroth' },
      manufacturer: { name: 'Bosch Rexroth AG', url: 'https://boschrexroth.com' },
      weightKg: 18.4,
      countryOfOrigin: 'DE',
    })
    expect(ld.gtin13).toBe('4047024876541')
    expect((ld.manufacturer as Record<string, unknown>).name).toBe('Bosch Rexroth AG')
    expect((ld.weight as Record<string, unknown>).value).toBe(18.4)
    expect((ld.weight as Record<string, unknown>).unitCode).toBe('KGM')
    expect(ld.countryOfOrigin).toBe('DE')
  })

  it('always emits Offer with availability + seller even without a price (RFQ products)', () => {
    const ld = buildProductLd({
      name: 'RFQ-Only Pump',
      sku: 'IH-RFQ-01',
      url: 'https://example.com/p/rfq',
      imageUrls: [],
      offers: {
        availability: 'in_stock',
        url: 'https://example.com/p/rfq',
        sellerId: 'https://example.com#organization',
        sellerName: 'Indus Hydraulics',
      },
    })
    const offer = ld.offers as Record<string, unknown>
    expect(offer['@type']).toBe('Offer')
    expect(offer.availability).toBe('https://schema.org/InStock')
    expect(offer.price).toBeUndefined()
    expect(offer.priceCurrency).toBeUndefined()
    expect((offer.seller as Record<string, unknown>)['@id']).toBe('https://example.com#organization')
  })

  it('emits priceValidUntil and itemCondition when provided', () => {
    const ld = buildProductLd({
      name: 'Foo',
      sku: 'X',
      url: 'https://example.com/p/x',
      imageUrls: [],
      offers: {
        price: 99.99,
        currency: 'AED',
        availability: 'in_stock',
        priceValidUntil: '2026-12-31',
        itemCondition: 'new',
      },
    })
    const offer = ld.offers as Record<string, unknown>
    expect(offer.price).toBe('99.99')
    expect(offer.priceCurrency).toBe('AED')
    expect(offer.priceValidUntil).toBe('2026-12-31')
    expect(offer.itemCondition).toBe('https://schema.org/NewCondition')
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

  it('emits an extended Organization with @id, address, sameAs, areaServed', () => {
    const ld = buildOrgLd({
      id: 'https://example.com#organization',
      name: 'Indus Hydraulics',
      legalName: 'Indus Hydraulic Power Trading LLC',
      url: 'https://example.com',
      foundingDate: '2003',
      sameAs: ['https://linkedin.com/company/indus'],
      address: {
        streetAddress: 'Andheri East',
        addressLocality: 'Mumbai',
        addressRegion: 'Maharashtra',
        postalCode: '400 059',
        addressCountry: 'IN',
      },
      contact: { email: 'sales@example.com', telephone: '+91-22-4000-0000' },
      areaServed: ['IN', 'AE', 'SG'],
    })
    expect(ld['@id']).toBe('https://example.com#organization')
    expect(ld.legalName).toBe('Indus Hydraulic Power Trading LLC')
    expect(ld.foundingDate).toBe('2003')
    expect(ld.sameAs).toEqual(['https://linkedin.com/company/indus'])
    expect((ld.address as Record<string, unknown>).addressCountry).toBe('IN')
    expect((ld.contactPoint as Record<string, unknown>).contactType).toBe('customer service')
    expect((ld.contactPoint as Record<string, unknown>).areaServed).toEqual(['IN', 'AE', 'SG'])
    expect(ld.areaServed).toEqual(['IN', 'AE', 'SG'])
  })

  it('omits address entirely when no fields are populated', () => {
    const ld = buildOrgLd({
      name: 'Indus',
      url: 'https://example.com',
      address: { streetAddress: null, addressLocality: null },
    })
    expect(ld.address).toBeUndefined()
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

describe('buildLocalBusinessLd', () => {
  it('emits LocalBusiness with PostalAddress and parent reference', () => {
    const ld = buildLocalBusinessLd({
      id: 'https://example.com#location-mumbai-hq',
      name: 'Indus Hydraulics — Mumbai HQ',
      url: 'https://example.com/contact',
      telephone: '+91-22-4000-0000',
      email: 'mumbai@example.com',
      address: {
        streetAddress: 'Andheri East',
        addressLocality: 'Mumbai',
        addressRegion: 'Maharashtra',
        postalCode: '400 059',
        addressCountry: 'IN',
      },
      openingHours: ['Mo-Sa 09:00-18:30'],
      parentOrganization: { id: 'https://example.com#organization', name: 'Indus Hydraulics' },
    })
    expect(ld['@type']).toBe('LocalBusiness')
    expect(ld['@id']).toBe('https://example.com#location-mumbai-hq')
    expect((ld.address as Record<string, unknown>).addressLocality).toBe('Mumbai')
    expect(ld.openingHours).toEqual(['Mo-Sa 09:00-18:30'])
    expect((ld.parentOrganization as Record<string, unknown>)['@id']).toBe('https://example.com#organization')
  })

  it('honours custom subtype', () => {
    const ld = buildLocalBusinessLd({
      type: 'WholesaleStore',
      name: 'Indus Wholesale',
      address: { addressLocality: 'Mumbai', addressCountry: 'IN' },
    })
    expect(ld['@type']).toBe('WholesaleStore')
  })

  it('omits parentOrganization when no identifiers provided', () => {
    const ld = buildLocalBusinessLd({
      name: 'Indus',
      address: { addressLocality: 'Mumbai', addressCountry: 'IN' },
      parentOrganization: {},
    })
    expect(ld.parentOrganization).toBeUndefined()
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
