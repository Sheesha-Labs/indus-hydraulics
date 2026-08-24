import { describe, expect, it } from 'vitest'
import { RELATED_PRODUCT_COUNT, relatedProductWindow } from './related-products'

const cat = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`)

describe('relatedProductWindow', () => {
  it('never includes the product itself', () => {
    for (const slug of cat(12)) {
      expect(relatedProductWindow(cat(12), slug)).not.toContain(slug)
    }
  })

  it('returns distinct slugs', () => {
    const out = relatedProductWindow(cat(12), 'p3')
    expect(new Set(out).size).toBe(out.length)
  })

  it('takes the products that follow, in order', () => {
    expect(relatedProductWindow(cat(20), 'p0', 4)).toEqual(['p1', 'p2', 'p3', 'p4'])
  })

  it('wraps at the end of the category', () => {
    expect(relatedProductWindow(cat(6), 'p4', 4)).toEqual(['p5', 'p0', 'p1', 'p2'])
  })

  it('links every product in the category at least once', () => {
    // The property that matters: this is a ring, so no product is orphaned.
    // The old `take: 4` with no ordering gave every product the same four
    // siblings and left the rest with no internal links at all.
    const all = cat(30)
    const linked = new Set<string>()
    for (const slug of all) for (const s of relatedProductWindow(all, slug)) linked.add(s)
    expect(linked.size).toBe(all.length)
  })

  it('is stable — the same input gives the same output', () => {
    // A page whose links reshuffle on every render looks to a crawler like a
    // page that changes on every fetch.
    expect(relatedProductWindow(cat(15), 'p7')).toEqual(relatedProductWindow(cat(15), 'p7'))
  })

  it('never returns more than the rest of the category', () => {
    expect(relatedProductWindow(cat(3), 'p0')).toHaveLength(2)
    expect(relatedProductWindow(cat(1), 'p0')).toEqual([])
  })

  it('handles a category of two', () => {
    expect(relatedProductWindow(cat(2), 'p0')).toEqual(['p1'])
    expect(relatedProductWindow(cat(2), 'p1')).toEqual(['p0'])
  })

  it('falls back to the head of the list when the product is missing', () => {
    // Happens if a draft flips between the two queries. Better a populated
    // block than an empty one.
    expect(relatedProductWindow(cat(10), 'nope', 3)).toEqual(['p0', 'p1', 'p2'])
  })

  it('caps at the requested count', () => {
    expect(relatedProductWindow(cat(50), 'p10')).toHaveLength(RELATED_PRODUCT_COUNT)
  })
})
