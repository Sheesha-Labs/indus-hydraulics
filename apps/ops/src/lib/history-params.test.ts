import { describe, expect, it } from 'vitest'
import { historyQuery, parseHistorySearch } from './history-params'

describe('history params', () => {
  it('defaults and falls back on junk', () => {
    expect(parseHistorySearch({})).toEqual({ kind: 'all', view: 'history' })
    expect(parseHistorySearch({ kind: 'nope', view: 'x', cursor: ['a', 'b'] })).toEqual({
      kind: 'all',
      view: 'history',
      cursor: 'a',
    })
    expect(parseHistorySearch({ kind: 'money', view: 'timeline' })).toMatchObject({
      kind: 'money',
      view: 'timeline',
    })
  })

  it('writes only what differs from the default, keeping a page’s own params', () => {
    expect(historyQuery({ kind: 'all' })).toBe('')
    expect(historyQuery({ kind: 'documents', cursor: 'c1' })).toBe('?kind=documents&cursor=c1')
    expect(historyQuery({ kind: 'money' }, { view: 'history' })).toBe('?view=history&kind=money')
    expect(historyQuery({ view: 'timeline' })).toBe('?view=timeline')
  })
})
