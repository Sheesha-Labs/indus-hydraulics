import { describe, expect, it } from 'vitest'
import {
  buildImageSearchQuery,
  preferredModelToken,
  rankImageResults,
  resolveImageSelections,
  type ResearchProduct,
} from './imageResearch'

const product: ResearchProduct = {
  id: 'p1',
  sku: 'EATON-FD83',
  mpn: null,
  slug: 'eaton-fd83',
  title: 'Eaton FD83 — Full-Flow Dual-Interlock Stainless Coupler',
  brandId: 'b1',
  brandName: 'Eaton Aeroquip',
  categoryId: 'c1',
  categoryName: 'Quick Couplers',
}

describe('image research', () => {
  it('derives a useful model token from catalogue SKUs', () => {
    expect(preferredModelToken(product)).toBe('FD83')
    expect(
      preferredModelToken({
        ...product,
        sku: 'IH-IH-A901GG',
        brandName: 'Dixon',
      }),
    ).toBe('A901GG')
  })

  it('builds a model-rich image query', () => {
    expect(buildImageSearchQuery(product)).toContain('FD83')
    expect(buildImageSearchQuery(product)).toContain('Eaton Aeroquip')
  })

  it('ranks an exact family image over generic brand artwork', () => {
    const ranked = rankImageResults(product, [
      {
        title: 'Eaton corporate logo',
        image: 'https://example.com/eaton-logo.png',
        url: 'https://example.com/eaton',
        width: 1000,
        height: 500,
      },
      {
        title: 'Danfoss Eaton FD83 full flow dual interlock coupling',
        image: 'https://www.robeckfluidpower.com/images/fd83-coupling.jpg',
        url: 'https://www.robeckfluidpower.com/fd83-series',
        width: 1200,
        height: 900,
      },
    ])

    expect(ranked[0]?.title).toContain('FD83')
    expect(ranked[0]?.score).toBeGreaterThan(50)
  })

  it('uses curated family assets for known catalogue gaps', () => {
    const [resolved] = resolveImageSelections([
      {
        product: {
          ...product,
          sku: 'EATON-FD14',
          title: 'Eaton FD14 Push-to-Connect Oil Drain Coupling',
        },
        query: 'Eaton FD14',
        candidates: [],
        selected: null,
      },
    ])
    expect(resolved?.selected?.title).toContain('FD14')
    expect(resolved?.selectionMethod).toBe('curated-override')
  })
})
