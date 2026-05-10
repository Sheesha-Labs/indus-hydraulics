import { describe, it, expect } from 'vitest'
import { buildReplacementCollectionLd } from './replacement-jsonld'

describe('buildReplacementCollectionLd', () => {
  it('emits CollectionPage with ItemList of Product references', () => {
    const ld = buildReplacementCollectionLd({
      competitorBrand: 'Parker',
      competitorMpn: 'PV16-T-1-2',
      pageUrl: 'https://example.com/replacement/parker/pv16-t-1-2',
      matches: [
        {
          productUrl: 'https://example.com/p/bosch-rexroth-a10vso-71cc-pump',
          productName: 'Bosch Rexroth A10VSO 71cc Pump',
          imageUrl: 'https://cdn/x.jpg',
          compatibility: 'direct',
        },
      ],
      sellerId: 'https://example.com#organization',
    })
    expect(ld['@type']).toBe('CollectionPage')
    expect(ld.url).toBe('https://example.com/replacement/parker/pv16-t-1-2')
    const itemList = ld.mainEntity as Record<string, unknown>
    expect(itemList['@type']).toBe('ItemList')
    expect(itemList.numberOfItems).toBe(1)

    const items = itemList.itemListElement as Array<Record<string, unknown>>
    expect(items[0]?.position).toBe(1)
    const product = items[0]?.item as Record<string, unknown>
    expect(product['@type']).toBe('Product')
    expect(product.url).toBe('https://example.com/p/bosch-rexroth-a10vso-71cc-pump')
    expect(product.image).toBe('https://cdn/x.jpg')
    expect(product.description).toMatch(/Direct replacement/)
    const offer = product.offers as Record<string, unknown>
    expect(offer['@type']).toBe('Offer')
    expect((offer.seller as Record<string, unknown>)['@id']).toBe('https://example.com#organization')
  })

  it('positions multiple matches sequentially and counts them in numberOfItems', () => {
    const ld = buildReplacementCollectionLd({
      competitorBrand: 'Eaton',
      competitorMpn: 'V2010',
      pageUrl: 'https://example.com/replacement/eaton/v2010',
      matches: [
        { productUrl: 'https://example.com/p/a', productName: 'A', compatibility: 'direct' },
        { productUrl: 'https://example.com/p/b', productName: 'B', compatibility: 'compatible' },
        { productUrl: 'https://example.com/p/c', productName: 'C', compatibility: 'superseded_by_us' },
      ],
    })
    const itemList = ld.mainEntity as Record<string, unknown>
    expect(itemList.numberOfItems).toBe(3)
    const items = itemList.itemListElement as Array<Record<string, unknown>>
    expect(items.map((i) => i.position)).toEqual([1, 2, 3])
  })

  it('uses singular description copy for a single match', () => {
    const ld = buildReplacementCollectionLd({
      competitorBrand: 'Parker',
      competitorMpn: 'PV16',
      pageUrl: 'https://example.com/replacement/parker/pv16',
      matches: [{ productUrl: 'u', productName: 'n', compatibility: 'direct' }],
    })
    expect(ld.description).toContain('a verified equivalent')
  })

  it('uses plural description copy for multiple matches', () => {
    const ld = buildReplacementCollectionLd({
      competitorBrand: 'Parker',
      competitorMpn: 'PV16',
      pageUrl: 'https://example.com/replacement/parker/pv16',
      matches: [
        { productUrl: 'u1', productName: 'n1', compatibility: 'direct' },
        { productUrl: 'u2', productName: 'n2', compatibility: 'direct' },
      ],
    })
    expect(ld.description).toContain('2 verified equivalents')
  })

  it('omits the Offer block when no sellerId is provided', () => {
    const ld = buildReplacementCollectionLd({
      competitorBrand: 'Parker',
      competitorMpn: 'PV16',
      pageUrl: 'https://example.com/replacement/parker/pv16',
      matches: [{ productUrl: 'u', productName: 'n', compatibility: 'direct' }],
    })
    const product = ((ld.mainEntity as Record<string, unknown>).itemListElement as Array<
      Record<string, unknown>
    >)[0]?.item as Record<string, unknown>
    expect(product.offers).toBeUndefined()
  })
})
