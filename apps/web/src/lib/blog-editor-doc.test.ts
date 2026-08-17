import { describe, expect, test } from 'vitest'
import { parseBlogBlocks, type BlogBlocks } from '@indus/domain'
import {
  blocksToEditorHtml,
  editorDocToBlocks,
  slugifyAnchor,
  type EditorNode,
} from './blog-editor-doc'

/**
 * The editor rewrites `bodyBlocks` wholesale on every save. A bug in either
 * direction of this translation therefore does not fail loudly — it silently
 * replaces a published article with a lesser version of itself, and the author
 * finds out when a reader does.
 *
 * These tests pin the two things that would be invisible otherwise: that a
 * block type the editor has no form for still survives a round trip, and that
 * plain paragraphs stay `paragraph` blocks rather than being rewritten into
 * `prose` the first time anyone opens an existing article.
 */

const p = (text: string): EditorNode => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

const doc = (...content: EditorNode[]): EditorNode => ({ type: 'doc', content })

describe('editorDocToBlocks', () => {
  test('a lone paragraph stays a paragraph block', () => {
    expect(editorDocToBlocks(doc(p('Hello.')))).toEqual([{ type: 'paragraph', html: 'Hello.' }])
  })

  test('paragraphs stay separate blocks; a list becomes prose beside them', () => {
    const blocks = editorDocToBlocks(
      doc(p('First.'), p('Second.'), {
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [p('One')] },
          { type: 'listItem', content: [p('Two')] },
        ],
      }),
    )
    // Folding the two paragraphs together would rewrite the body of every
    // article written before this editor existed, all of which is `paragraph`.
    expect(blocks).toEqual([
      { type: 'paragraph', html: 'First.' },
      { type: 'paragraph', html: 'Second.' },
      { type: 'prose', html: '<ul><li>One</li><li>Two</li></ul>' },
    ])
  })

  test('marks serialise, and text is escaped', () => {
    const blocks = editorDocToBlocks(
      doc({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'a < b & ' },
          { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
          {
            type: 'text',
            text: 'link',
            marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
          },
        ],
      }),
    )
    expect(blocks).toEqual([
      {
        type: 'paragraph',
        html:
          'a &lt; b &amp; <strong>bold</strong>' +
          '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>',
      },
    ])
  })

  test('an h2 becomes a numbered section head with a derived anchor', () => {
    const blocks = editorDocToBlocks(
      doc(
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Start here.' }] },
        p('Body.'),
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Start here.' }] },
      ),
    )
    expect(blocks[0]).toEqual({
      type: 'section_head',
      number: '/01',
      title: 'Start here.',
      anchor: 'start-here',
    })
    // Second heading with the same title must not reuse the anchor — every
    // TOC link would target the first one.
    expect(blocks[2]).toMatchObject({ number: '/02', anchor: 'start-here-2' })
  })

  test('an existing anchor is preserved rather than re-derived', () => {
    const blocks = editorDocToBlocks(
      doc({
        type: 'heading',
        attrs: { level: 2, anchor: 'published-fragment' },
        content: [{ type: 'text', text: 'Renamed after publication' }],
      }),
    )
    expect(blocks[0]).toMatchObject({ anchor: 'published-fragment' })
  })

  test('an h3 becomes a prose block, not a section head', () => {
    const blocks = editorDocToBlocks(
      doc(
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Sub' }] },
        { type: 'blockquote', content: [p('Quoted.')] },
        p('x'),
      ),
    )
    expect(blocks).toEqual([
      { type: 'prose', html: '<h3>Sub</h3><blockquote><p>Quoted.</p></blockquote>' },
      { type: 'paragraph', html: 'x' },
    ])
  })

  test('a lead paragraph round-trips as a lead block', () => {
    const blocks = editorDocToBlocks(
      doc({ type: 'leadParagraph', content: [{ type: 'text', text: 'Opening line.' }] }),
    )
    expect(blocks).toEqual([{ type: 'lead', html: 'Opening line.' }])
  })

  test('empty paragraphs are dropped', () => {
    expect(editorDocToBlocks(doc({ type: 'paragraph' }, { type: 'paragraph', content: [] }))).toEqual(
      [],
    )
  })

  test('a structured block carries its data through verbatim', () => {
    const data = { type: 'callout', tone: 'warning', title: 'Careful', body: 'Mind the seat.' }
    const blocks = editorDocToBlocks(
      doc(p('Before.'), { type: 'structuredBlock', attrs: { data } }, p('After.')),
    )
    expect(blocks).toEqual([
      { type: 'paragraph', html: 'Before.' },
      data,
      { type: 'paragraph', html: 'After.' },
    ])
  })

  test('a figure keeps its storage path, caption and ratio', () => {
    const blocks = editorDocToBlocks(
      doc({
        type: 'figureImage',
        attrs: { storagePath: 'blog/body/hose.jpg', captionPrefix: 'FIG. 01', aspectRatio: '4/3' },
        content: [{ type: 'text', text: 'A crimped hose end.' }],
      }),
    )
    expect(blocks).toEqual([
      {
        type: 'figure',
        imageId: 'blog/body/hose.jpg',
        caption: 'A crimped hose end.',
        captionPrefix: 'FIG. 01',
        placeholderLabel: null,
        aspectRatio: '4/3',
      },
    ])
  })
})

describe('blocksToEditorHtml', () => {
  test('renders each block type into markup the editor can parse back', () => {
    const { blocks } = parseBlogBlocks([
      { type: 'section_head', number: '/01', title: 'One', anchor: 'one' },
      { type: 'lead', html: 'Opening line.' },
      { type: 'paragraph', html: 'Body <strong>text</strong>.' },
      { type: 'prose', html: '<h3>Sub</h3><ul><li>a</li></ul>' },
      { type: 'figure', imageId: 'blog/x.jpg', caption: 'Cap', aspectRatio: '16/9' },
      { type: 'callout', tone: 'warning', title: 'T', body: 'B' },
    ])
    const html = blocksToEditorHtml(blocks)
    expect(html).toContain('<h2 data-anchor="one">One</h2>')
    expect(html).toContain('<p data-lead="">Opening line.</p>')
    expect(html).toContain('<p>Body <strong>text</strong>.</p>')
    expect(html).toContain('<h3>Sub</h3><ul><li>a</li></ul>')
    expect(html).toContain('data-storage-path="blog/x.jpg"')
    expect(html).toContain('<figcaption>Cap</figcaption>')
    expect(html).toContain('data-blog-block="callout"')
  })

  test('a caption carrying markup characters cannot break out of the figure', () => {
    const { blocks } = parseBlogBlocks([
      { type: 'figure', imageId: null, caption: '<img onerror="alert(1)">' },
    ])
    expect(blocksToEditorHtml(blocks)).toContain('&lt;img onerror=&quot;alert(1)&quot;&gt;')
  })
})

describe('slugifyAnchor', () => {
  test.each([
    ['How to identify a fitting', 'how-to-identify-a-fitting'],
    ['  Spaces  &  symbols!  ', 'spaces-symbols'],
    ['—', 'section'],
  ])('%s → %s', (input, expected) => {
    expect(slugifyAnchor(input)).toBe(expected)
  })

  test('a long heading is cut at a word boundary, not mid-word', () => {
    const anchor = slugifyAnchor(
      'The one worth dwelling on is abrasion because it accounts for a large share of failures',
    )
    expect(anchor.length).toBeLessThanOrEqual(80)
    expect(anchor.endsWith('-')).toBe(false)
    expect(anchor).toBe('the-one-worth-dwelling-on-is-abrasion-because-it-accounts-for-a-large-share-of')
  })
})

describe('round trip', () => {
  test('blocks survive a pass through the editor document unchanged', () => {
    const original: BlogBlocks = parseBlogBlocks([
      { type: 'section_head', number: '/01', title: 'Start here', anchor: 'start-here' },
      { type: 'paragraph', html: 'Plain body copy.' },
      { type: 'comparison_table', columns: ['A', 'B'], rows: [{ cells: ['1', '2'] }] },
      { type: 'paragraph', html: 'Closing copy.' },
    ]).blocks

    // Stand-in for what TipTap produces from `blocksToEditorHtml(original)`;
    // the parse itself is the browser's, so what is asserted here is that the
    // shape it yields serialises back to the same blocks.
    const parsed = doc(
      {
        type: 'heading',
        attrs: { level: 2, anchor: 'start-here' },
        content: [{ type: 'text', text: 'Start here' }],
      },
      p('Plain body copy.'),
      { type: 'structuredBlock', attrs: { data: original[2] } },
      p('Closing copy.'),
    )

    expect(parseBlogBlocks(editorDocToBlocks(parsed)).blocks).toEqual(original)
  })
})
