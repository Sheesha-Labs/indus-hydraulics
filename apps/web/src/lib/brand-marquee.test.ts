import { describe, expect, it } from 'vitest'
import { marqueeDurationClass, selectMarqueeBrands, type MarqueeBrandRow } from './brand-marquee'

const logo = (id: string, alt: string, bytes = 1000, width = 400, height = 100) => ({
  id,
  storagePath: `https://cdn.example/${id}.png`,
  alt,
  width,
  height,
  bytes,
})

const row = (slug: string, name: string, skuCount: number, l: MarqueeBrandRow['logo']): MarqueeBrandRow => ({
  slug,
  name,
  skuCount,
  logo: l,
})

describe('selectMarqueeBrands', () => {
  it('drops brands without a logo and the house brand', () => {
    const out = selectMarqueeBrands([
      row('parker', 'Parker Hannifin', 797, logo('p', 'Parker Hannifin logo', 1)),
      row('hydril', 'Hydril', 3, null),
      row('indus', 'Indus Hydraulics', 1898, logo('i', 'Indus Hydraulics logo', 2)),
    ])
    expect(out.map((b) => b.slug)).toEqual(['parker'])
  })

  it('shows a shared logo once, on the brand the logo names', () => {
    const nov = logo('nov-media', 'National Oilwell Varco logo')
    const out = selectMarqueeBrands([
      row('anson', 'Anson', 23, nov),
      row('nov', 'National Oilwell Varco', 4, nov),
    ])
    expect(out.map((b) => b.slug)).toEqual(['nov'])
  })

  it('falls back to the best-stocked brand when no sharer is named by the logo', () => {
    const danfoss = logo('danfoss', 'Danfoss logo')
    const out = selectMarqueeBrands([
      row('cessna', 'Cessna', 3, danfoss),
      row('char-lynn', 'Char-Lynn', 4, danfoss),
      row('eaton-aeroquip', 'Eaton Aeroquip', 196, danfoss),
      row('eaton-winner', 'Eaton Winner', 4, danfoss),
    ])
    expect(out.map((b) => b.slug)).toEqual(['eaton-aeroquip'])
  })

  it('treats the same file under two storage keys as one picture', () => {
    const out = selectMarqueeBrands([
      row('dixon', 'Dixon', 7, logo('d1', 'Dixon logo', 13462, 290, 132)),
      row('dixon-valve', 'Dixon Valve & Coupling', 405, logo('d2', 'Dixon Valve & Coupling logo', 13462, 290, 132)),
    ])
    expect(out.map((b) => b.slug)).toEqual(['dixon-valve'])
  })

  it('orders by active SKUs, then name', () => {
    const out = selectMarqueeBrands([
      row('b', 'Beta', 5, logo('b', 'Beta logo', 1)),
      row('a', 'Alpha', 5, logo('a', 'Alpha logo', 2)),
      row('c', 'Gamma', 50, logo('c', 'Gamma logo', 3)),
    ])
    expect(out.map((b) => b.slug)).toEqual(['c', 'a', 'b'])
  })
})

describe('marqueeDurationClass', () => {
  it('scales with the brand count in steps of ten', () => {
    expect(marqueeDurationClass(61)).toBe('[animation-duration:390s]')
    expect(marqueeDurationClass(3)).toBe('[animation-duration:65s]')
    expect(marqueeDurationClass(500)).toBe('[animation-duration:650s]')
  })
})
