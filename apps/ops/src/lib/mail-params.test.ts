import { describe, expect, it } from 'vitest'
import { mailQuery, parseMailSearch } from './mail-params'

describe('mail search params', () => {
  it('parses every param and falls back on anything malformed', () => {
    expect(
      parseMailSearch({
        type: 'supplier-quote',
        q: ' valves ',
        past: '1',
        link: '1',
        all: '1',
        cursor: 'abc',
      })
    ).toEqual({
      type: 'supplier-quote',
      q: 'valves',
      past: true,
      link: true,
      all: true,
      cursor: 'abc',
    })
    expect(parseMailSearch({ type: 'nonsense', past: 'yes', link: '2' })).toEqual({
      type: undefined,
      q: undefined,
      cursor: undefined,
      past: false,
      link: false,
      all: false,
    })
  })

  it('builds folder links that keep the search and never carry the modal', () => {
    expect(mailQuery({ type: 'freight', q: 'a b', past: true, link: true })).toBe(
      '?type=freight&q=a+b&past=1'
    )
    expect(mailQuery({}, {})).toBe('')
  })
})
