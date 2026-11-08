import { describe, expect, it } from 'vitest'
import { pickProductMix, type MixCandidate, type MixCategory } from './home-product-mix'

/** Deterministic random source cycling through the given values. */
const seq = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]!
}

const categories: MixCategory[] = [
  { id: 'hoses', parentId: null, isPublished: true },
  { id: 'hoses-sub', parentId: 'hoses', isPublished: true },
  { id: 'hoses-leaf', parentId: 'hoses-sub', isPublished: true },
  { id: 'marine', parentId: null, isPublished: true },
  { id: 'marine-sub', parentId: 'marine', isPublished: true },
  { id: 'hidden', parentId: null, isPublished: false },
  { id: 'hidden-sub', parentId: 'hidden', isPublished: true },
]

const candidates: MixCandidate[] = [
  { id: 'p1', categoryId: 'hoses-leaf' },
  { id: 'p2', categoryId: 'hoses-sub' },
  { id: 'p3', categoryId: 'marine-sub' },
  { id: 'p4', categoryId: 'hidden-sub' },
  { id: 'p5', categoryId: null },
]

describe('pickProductMix', () => {
  it('takes at most one product per top-level category', () => {
    const picks = pickProductMix(candidates, categories, 10, seq(0.1, 0.9, 0.5))
    const roots = picks.map((p) => p.rootId)
    expect(new Set(roots).size).toBe(roots.length)
    expect(roots.sort()).toEqual(['hoses', 'marine'])
  })

  it('never picks from an unpublished root or an uncategorised product', () => {
    const picks = pickProductMix(candidates, categories, 10, seq(0.3, 0.7))
    expect(picks.map((p) => p.productId)).not.toContain('p4')
    expect(picks.map((p) => p.productId)).not.toContain('p5')
  })

  it('rolls deep categories up to their root', () => {
    const picks = pickProductMix([{ id: 'p1', categoryId: 'hoses-leaf' }], categories, 5)
    expect(picks).toEqual([{ rootId: 'hoses', productId: 'p1' }])
  })

  it('respects the requested count', () => {
    expect(pickProductMix(candidates, categories, 1, seq(0.2))).toHaveLength(1)
  })

  it('varies with the random source', () => {
    const many: MixCandidate[] = Array.from({ length: 20 }, (_, i) => ({ id: `h${i}`, categoryId: 'hoses-leaf' }))
    const a = pickProductMix(many, categories, 1, seq(0.01))[0]!.productId
    const b = pickProductMix(many, categories, 1, seq(0.99))[0]!.productId
    expect(a).not.toBe(b)
  })
})
