import { describe, expect, it } from 'vitest'
import { BLOG_FIGURES } from './blog-figures'
import { withFigures } from './blog-article-import'
import type { BlogBlocksInput } from '@indus/domain'

const head = (n: string) => ({ type: 'section_head' as const, number: n, title: n, anchor: n })
const para = { type: 'paragraph' as const, html: 'body' }

describe('BLOG_FIGURES', () => {
  const entries = Object.entries(BLOG_FIGURES)

  it('gives every article a picture in the body, or a slot reserved for one', () => {
    expect(entries.length).toBe(143)
  })

  /**
   * A reserved slot — no `from` — writes a figure with a null id, and
   * `BlogFigureBlockView` renders nothing for it. That is the whole point: the
   * article reads unchanged until an image exists. What a slot must carry is
   * the brief, because the slot is worthless to the image pass without one.
   */
  /** `placeholderLabel` is capped at 120 in the block schema. Three briefs hit
   *  it on first import; catching that here beats catching it at write time. */
  it('keeps every brief inside what the block schema accepts', () => {
    for (const [slug, figures] of entries) {
      for (const f of figures) {
        expect(f.placeholderLabel?.length ?? 0, `${slug}: brief too long`).toBeLessThanOrEqual(120)
      }
    }
  })

  it('gives every reserved slot a brief for the image pass', () => {
    for (const [slug, figures] of entries) {
      for (const f of figures) {
        if (f.from) continue
        expect(f.placeholderLabel?.trim().length ?? 0, `${slug}: reserved slot has no brief`).toBeGreaterThan(20)
      }
    }
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

  it('writes a reserved slot as a null-id figure carrying its brief', () => {
    // A real reserved slot from the 2026-09-01 sprints, so the test breaks if
    // the reserved-slot mechanism is ever removed from under them.
    const slug = 'saber-certificate-for-hydraulic-hose'
    expect(BLOG_FIGURES[slug]?.[0]?.from, 'expected a reserved slot').toBeUndefined()
    const out = withFigures(slug, [head('/01'), para], heroes) as BlogBlocksInput
    const fig = out.find((b) => b.type === 'figure') as Record<string, unknown> | undefined
    expect(fig).toBeDefined()
    expect(fig!.imageId).toBeNull()
    expect(String(fig!.placeholderLabel ?? '').length).toBeGreaterThan(20)
  })

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
