import { describe, expect, test } from 'vitest'
import { deriveExcerpt, resolveBodyWrite } from './blog-body-save'

/**
 * A blank excerpt is not a neutral choice — the index card renders with no
 * blurb and the page ships with no meta description unless the SEO tab was
 * filled in separately. These pin what an author gets when they leave it
 * alone.
 */

const lead = (html: string) => ({ type: 'lead' as const, html })
const para = (html: string) => ({ type: 'paragraph' as const, html })

describe('deriveExcerpt', () => {
  test('what the author typed always wins', () => {
    expect(deriveExcerpt('  Hand-written summary.  ', [para('Body copy.')])).toBe(
      'Hand-written summary.',
    )
  })

  test('falls back to the article opening, with the markup stripped', () => {
    expect(deriveExcerpt('', [para('Seals on a <strong>flare</strong>, not the threads.')])).toBe(
      'Seals on a flare, not the threads.',
    )
  })

  test('skips headings and captions so the summary is prose', () => {
    const blocks = [
      { type: 'section_head', number: '/01', title: 'Start here', anchor: 'start-here' },
      { type: 'figure', imageId: null, caption: 'Fig. 01 — a crimped hose end' },
      para('The actual opening sentence of the article.'),
    ] as never
    expect(deriveExcerpt(null, blocks)).toBe('The actual opening sentence of the article.')
  })

  test('a lead block counts as the opening', () => {
    expect(deriveExcerpt(null, [lead('An opening line.'), para('Then the body.')])).toBe(
      'An opening line. Then the body.',
    )
  })

  test('cuts at a word boundary and marks the truncation', () => {
    const long = para(`${'word '.repeat(80)}end`)
    const excerpt = deriveExcerpt(null, [long]) ?? ''
    expect(excerpt.length).toBeLessThanOrEqual(241)
    expect(excerpt.endsWith('…')).toBe(true)
    // Mid-word truncation reads as a bug on the card and in search results.
    expect(excerpt).not.toMatch(/wor…$/)
  })

  test('an article with no prose yet yields null rather than an empty string', () => {
    expect(deriveExcerpt(null, [])).toBeNull()
    expect(deriveExcerpt('', [{ type: 'product_embed', skus: ['IH-1'] }] as never)).toBeNull()
  })
})

describe('resolveBodyWrite', () => {
  const estimate = () => 4

  test('an empty submission never blanks a legacy body', () => {
    // The failure this exists to prevent: a pre-block-editor post opened,
    // saved, and its only copy of the article replaced with an empty string.
    expect(
      resolveBodyWrite({
        blocks: [],
        existingBody: '<p>The whole article, in HTML.</p>',
        existingReadingMinutes: 7,
        estimateMinutes: estimate,
      }),
    ).toEqual({
      body: '<p>The whole article, in HTML.</p>',
      readingMinutes: 7,
      preservedLegacy: true,
    })
  })

  test('an empty submission on a row with no body does clear it', () => {
    expect(
      resolveBodyWrite({
        blocks: [],
        existingBody: '   ',
        existingReadingMinutes: 3,
        estimateMinutes: estimate,
      }),
    ).toEqual({ body: '', readingMinutes: null, preservedLegacy: false })
  })

  test('blocks replace the legacy body and re-estimate the reading time', () => {
    expect(
      resolveBodyWrite({
        blocks: [{ type: 'paragraph', html: 'Migrated across.' }],
        existingBody: '<p>Old HTML.</p>',
        existingReadingMinutes: 7,
        estimateMinutes: estimate,
      }),
    ).toEqual({ body: 'Migrated across.', readingMinutes: 4, preservedLegacy: false })
  })
})
