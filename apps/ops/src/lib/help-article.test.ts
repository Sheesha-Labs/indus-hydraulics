import { describe, expect, it } from 'vitest'
import { parseArticle } from './help-article'

describe('help article body', () => {
  it('reads the intro, the numbered points and the later note', () => {
    const body =
      'Intro line.\r\n\r\n1. First.\n2. Second point.\n\nLater: Side panel. Not part of this release.'
    expect(parseArticle(body)).toEqual({
      intro: 'Intro line.',
      points: ['First.', 'Second point.'],
      later: 'Side panel. Not part of this release.',
    })
    expect(parseArticle('Only an intro.')).toEqual({
      intro: 'Only an intro.',
      points: [],
      later: null,
    })
  })
})
