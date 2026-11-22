import type { Route } from 'next'
import { describe, expect, it } from 'vitest'
import { hrefWith, queryWith } from './href-with'

const path = '/enquiries' as Route

describe('hrefWith', () => {
  it('replaces a key in place and keeps the other keys in order', () => {
    const current = new URLSearchParams('stage=open&sort=deadline&dir=asc')
    expect(hrefWith(path, current, { sort: 'value' })).toBe(
      '/enquiries?stage=open&sort=value&dir=asc'
    )
  })

  it('appends new keys in patch order', () => {
    const current = new URLSearchParams('stage=open')
    expect(hrefWith(path, current, { view: 'board', selected: 'ENQ-2026-0001' })).toBe(
      '/enquiries?stage=open&view=board&selected=ENQ-2026-0001'
    )
  })

  it('removes undefined, null and empty values', () => {
    const current = new URLSearchParams('stage=open&cursor=abc&q=valve&selected=x')
    expect(hrefWith(path, current, { cursor: undefined, q: '', selected: null })).toBe(
      '/enquiries?stage=open'
    )
  })

  it('returns the bare path when nothing is left', () => {
    expect(hrefWith(path, new URLSearchParams('cursor=abc'), { cursor: undefined })).toBe(
      '/enquiries'
    )
    expect(hrefWith(path, {})).toBe('/enquiries')
  })

  it("accepts Next's searchParams object, with multi-valued keys", () => {
    const current = { stage: 'open', tag: ['a', 'b'], q: undefined }
    expect(hrefWith(path, current, { stage: 'won' })).toBe('/enquiries?stage=won&tag=a&tag=b')
    expect(hrefWith(path, current, { tag: ['c'] })).toBe('/enquiries?stage=open&tag=c')
  })

  it('collapses repeated keys when patched, at the first position', () => {
    const current = new URLSearchParams('tag=a&stage=open&tag=b')
    expect(queryWith(current, { tag: ['x', 'y'] })).toBe('tag=x&tag=y&stage=open')
  })

  it('stringifies numbers and booleans and encodes reserved characters', () => {
    expect(queryWith({}, { page: 2, archived: true, q: 'a&b c' })).toBe(
      'page=2&archived=true&q=a%26b+c'
    )
  })

  it('is stable: the same input always gives the same href', () => {
    const current = new URLSearchParams('b=2&a=1')
    const first = hrefWith(path, current, { c: '3' })
    expect(hrefWith(path, current, { c: '3' })).toBe(first)
    expect(first).toBe('/enquiries?b=2&a=1&c=3')
  })
})
