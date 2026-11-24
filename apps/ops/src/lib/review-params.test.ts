import { describe, expect, it } from 'vitest'
import { parseReviewSearch, reviewQuery } from './review-params'

describe('review params', () => {
  it('parses and falls back on anything malformed', () => {
    expect(
      parseReviewSearch({
        type: 'chasers',
        group: 'flat',
        sort: 'due',
        card: 'A-26-11-24-0001',
        edit: '1',
      })
    ).toEqual({
      type: 'chasers',
      record: undefined,
      group: 'flat',
      sort: 'due',
      card: 'A-26-11-24-0001',
      edit: true,
    })
    expect(parseReviewSearch({ type: 'nope', group: 'x', sort: 'y', card: '<script>' })).toEqual({
      type: undefined,
      record: undefined,
      group: 'record',
      sort: 'oldest',
      card: undefined,
      edit: false,
    })
  })
  it('builds links that keep the filters', () => {
    expect(reviewQuery({ type: 'mail', group: 'record', sort: 'oldest' }, { card: 'A-1-2' })).toBe(
      '?type=mail&card=A-1-2'
    )
    expect(reviewQuery({})).toBe('')
  })
})
