import { describe, expect, it } from 'vitest'
import { BLOG_FIGURES } from './blog-figures'
import { withFigures } from './blog-article-import'
import type { BlogBlocksInput } from '@indus/domain'

const head = (n: string) => ({ type: 'section_head' as const, number: n, title: n, anchor: n })
const para = { type: 'paragraph' as const, html: 'body' }

describe('BLOG_FIGURES', () => {
  const entries = Object.entries(BLOG_FIGURES)

  it('gives every article a picture in the body', () => {
    expect(entries.length).toBe(93)
  })

  it('never borrows an article’s own hero — a figure repeating the hero is padding', () => {
    for (const [slug, figures] of entries) {
      for (const f of figures) expect(f.from, slug).not.toBe(slug)
    }
  })

  it('places every figure after a real section, never at position zero', () => {
    for (const [slug, figures] of entries) {
      for (const f of figures) expect(f.afterSection, slug).toBeGreaterThanOrEqual(1)
    }
  })

  it('writes a caption that says more than the article title already does', () => {
    for (const [slug, figures] of entries) {
      for (const f of figures) expect(f.caption.trim().length, slug).toBeGreaterThan(40)
    }
  })
})

describe('withFigures', () => {
  const heroes = new Map([['other-article', 'media-1']])
  const body: BlogBlocksInput = [head('/01'), para, head('/02'), para]

  it('inserts the figure immediately after the named section', () => {
    const out = withFigures('x', body, heroes) as BlogBlocksInput
    const patched = withFigures('x', body, heroes)
    expect(patched).toEqual(out)
  })

  it('drops a figure whose section does not exist rather than appending it somewhere arbitrary', () => {
    const blocks = withFigures('nothing-defined', body, heroes)
    expect(blocks.filter((b) => b.type === 'figure')).toHaveLength(0)
  })

  it('strips existing figures so a re-run replaces rather than stacks', () => {
    const withOne: BlogBlocksInput = [
      head('/01'),
      { type: 'figure', imageId: 'media-9', caption: 'old', aspectRatio: '16/9' },
      para,
    ]
    const out = withFigures('nothing-defined', withOne, heroes)
    expect(out.some((b) => b.type === 'figure')).toBe(false)
  })

  it('skips a borrowed article that has no hero rather than writing a null imageId', () => {
    const out = withFigures('why-hydraulic-hoses-fail', body, new Map())
    expect(out.filter((b) => b.type === 'figure')).toHaveLength(0)
  })
})
