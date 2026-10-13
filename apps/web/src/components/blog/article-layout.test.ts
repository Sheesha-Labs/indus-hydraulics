import { describe, expect, it } from 'vitest'
import type { BlogBlock } from '@indus/domain'
import { layoutArticle, stepNumber } from './article-layout'

const b = (type: string, extra: Record<string, unknown> = {}) => ({ type, ...extra }) as unknown as BlogBlock

describe('layoutArticle', () => {
  it('lifts the first takeaways and stamp, and gathers every foot block', () => {
    const blocks = [
      b('lead'),
      b('key_takeaways'),
      b('section_head'),
      b('category_link'),
      b('paragraph'),
      b('as_of_stamp'),
      b('category_link'),
      b('related_articles'),
      b('market_reach'),
      b('cta_block'),
    ]
    const layout = layoutArticle(blocks)
    expect(layout.takeaways).toBe(1)
    expect(layout.stamp).toBe(5)
    expect(layout.categoryLinks).toEqual([3, 6])
    expect(layout.related).toEqual([7])
    expect(layout.markets).toEqual([8])
    expect(layout.ctas).toEqual([9])
    expect([...layout.skip].sort((x, y) => x - y)).toEqual([1, 3, 5, 6, 7, 8, 9])
  })

  it('leaves a second takeaways or stamp inline where it sits', () => {
    const layout = layoutArticle([b('key_takeaways'), b('as_of_stamp'), b('paragraph'), b('key_takeaways'), b('as_of_stamp')])
    expect(layout.takeaways).toBe(0)
    expect(layout.stamp).toBe(1)
    expect(layout.skip.has(3)).toBe(false)
    expect(layout.skip.has(4)).toBe(false)
  })

  it('skips nothing in an article with no foot blocks', () => {
    const layout = layoutArticle([b('lead'), b('paragraph'), b('faq_block')])
    expect(layout.takeaways).toBeNull()
    expect(layout.stamp).toBeNull()
    expect(layout.skip.size).toBe(0)
  })
})

describe('stepNumber', () => {
  it('pads to two digits from 01', () => {
    expect(stepNumber(0)).toBe('01')
    expect(stepNumber(2)).toBe('03')
  })
})
