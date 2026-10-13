import { describe, expect, it } from 'vitest'
import type { BlogBlock } from '@indus/domain'
import { byQuickest, groupByMonth, planHubBlocks, splitStartHere, type HubListItem } from './topic-hub'

const b = (type: string) => ({ type }) as unknown as BlogBlock

function item(slug: string, month: string | null, minutes: number | null): HubListItem {
  return {
    slug,
    title: slug,
    dateTime: null,
    dateLabel: null,
    monthKey: month,
    monthLabel: month ? `Label ${month}` : null,
    minutes,
  }
}

describe('planHubBlocks', () => {
  it('moves the first direct answer, every category link and every CTA out of the guide', () => {
    const plan = planHubBlocks([
      b('direct_answer'),
      b('paragraph'),
      b('category_link'),
      b('direct_answer'),
      b('cta_block'),
      b('category_link'),
      b('faq_block'),
    ])
    expect(plan.quickAnswer).toBe(0)
    expect(plan.categoryLinks).toEqual([2, 5])
    expect(plan.ctas).toEqual([4])
    expect([...plan.guideSkip].sort()).toEqual([0, 2, 4, 5])
    expect(plan.hasGuide).toBe(true)
  })

  it('reports no guide when every block has moved', () => {
    const plan = planHubBlocks([b('direct_answer'), b('cta_block')])
    expect(plan.hasGuide).toBe(false)
  })

  it('handles an empty body', () => {
    const plan = planHubBlocks([])
    expect(plan.quickAnswer).toBeNull()
    expect(plan.hasGuide).toBe(false)
  })
})

describe('splitStartHere', () => {
  it('takes the oldest (last) post as Start here and leaves the rest in order', () => {
    expect(splitStartHere(['new', 'mid', 'old'])).toEqual({ start: 'old', rest: ['new', 'mid'] })
  })
  it('leaves an empty list with one article', () => {
    expect(splitStartHere(['only'])).toEqual({ start: 'only', rest: [] })
  })
  it('has no Start here with no articles', () => {
    expect(splitStartHere([])).toEqual({ start: null, rest: [] })
  })
})

describe('groupByMonth', () => {
  it('groups newest-first rows by month in order', () => {
    const groups = groupByMonth([item('a', '2026-10', 3), item('b', '2026-10', 5), item('c', '2026-09', 4)])
    expect(groups.map((g) => [g.key, g.items.map((i) => i.slug)])).toEqual([
      ['2026-10', ['a', 'b']],
      ['2026-09', ['c']],
    ])
    expect(groups[0]?.label).toBe('Label 2026-10')
  })
})

describe('byQuickest', () => {
  it('sorts by minutes ascending, stable on ties, unknown last', () => {
    const sorted = byQuickest([item('a', null, 6), item('b', null, null), item('c', null, 3), item('d', null, 6)])
    expect(sorted.map((i) => i.slug)).toEqual(['c', 'a', 'd', 'b'])
  })
})
