import { describe, it, expect } from 'vitest'
import { buildReplacementCollectionLd } from './replacement-jsonld'

describe('buildReplacementCollectionLd', () => {
  it('emits CollectionPage with an ItemList of plain links to the PDPs', () => {
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
    })
    expect(ld['@type']).toBe('CollectionPage')
    expect(ld.url).toBe('https://example.com/replacement/parker/pv16-t-1-2')
    const itemList = ld.mainEntity as Record<string, unknown>
    expect(itemList['@type']).toBe('ItemList')
    expect(itemList.numberOfItems).toBe(1)

    const items = itemList.itemListElement as Array<Record<string, unknown>>
    const first = items[0]!
    expect(first.position).toBe(1)
    // A ListItem, never a Product: a Product stub is validated as a product of
    // its own, and these carried no price.
    expect(first['@type']).toBe('ListItem')
    expect(first.item).toBeUndefined()
    expect(first.url).toBe('https://example.com/p/bosch-rexroth-a10vso-71cc-pump')
    expect(first.name).toBe('Bosch Rexroth A10VSO 71cc Pump')
    expect(first.image).toBe('https://cdn/x.jpg')
    expect(first.description).toMatch(/Direct replacement/)
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

  it('never claims availability — the PDP owns that', () => {
    const ld = buildReplacementCollectionLd({
      competitorBrand: 'Parker',
      competitorMpn: 'PV16',
      pageUrl: 'https://example.com/replacement/parker/pv16',
      matches: [{ productUrl: 'u', productName: 'n', compatibility: 'direct' }],
    })
    expect(JSON.stringify(ld)).not.toMatch(/Offer|InStock|availability/)
  })
})
