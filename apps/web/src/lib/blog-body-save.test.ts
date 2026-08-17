import { describe, expect, test } from 'vitest'
import { blocksToPlainText, readBodyBlocks } from './blog-body-save'

describe('readBodyBlocks', () => {
  test('drops a script tag rather than storing it', () => {
    const blocks = readBodyBlocks(
      JSON.stringify([
        { type: 'paragraph', html: 'Safe.<script>alert(1)</script>' },
        { type: 'prose', html: '<p onclick="steal()">Hi</p><iframe src="//evil"></iframe>' },
      ]),
    )
    // `nonTextTags` matters here: without it the script's CONTENTS survive as a
    // bare `alert(1)` text node in the middle of the article.
    expect(blocks[0]).toEqual({ type: 'paragraph', html: 'Safe.' })
    expect(blocks[1]).toEqual({ type: 'prose', html: '<p>Hi</p>' })
  })

  test('a javascript: link loses its href', () => {
    const blocks = readBodyBlocks(
      JSON.stringify([{ type: 'paragraph', html: '<a href="javascript:alert(1)">x</a>' }]),
    )
    expect(blocks[0]).toEqual({ type: 'paragraph', html: '<a>x</a>' })
  })

  test('keeps the formatting the editor can actually produce', () => {
    const html =
      '<h3>Sub</h3><ul><li><strong>a</strong></li></ul>' +
      '<blockquote><p>q</p></blockquote><a href="https://x.test" target="_blank" rel="noopener noreferrer">l</a>'
    const blocks = readBodyBlocks(JSON.stringify([{ type: 'prose', html }]))
    expect(blocks[0]).toEqual({ type: 'prose', html })
  })

  test('one invalid block does not take the rest of the article with it', () => {
    const blocks = readBodyBlocks(
      JSON.stringify([
        { type: 'paragraph', html: 'Keeps.' },
        { type: 'comparison_table', columns: ['A'], rows: [] },
        { type: 'paragraph', html: 'Also keeps.' },
      ]),
    )
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'paragraph'])
  })

  test.each([['', 0], ['not json', 0], ['{}', 0], ['null', 0]])(
    'a payload of %j yields no blocks rather than throwing',
    (raw, expected) => {
      expect(readBodyBlocks(raw)).toHaveLength(expected as number)
    },
  )
})

describe('blocksToPlainText', () => {
  test('collects the words a reader sees, without the markup', () => {
    const text = blocksToPlainText([
      { type: 'section_head', number: '/01', title: 'The seat' },
      { type: 'paragraph', html: 'Seals on a <strong>flare</strong>, not the threads.' },
      { type: 'key_takeaways', items: ['One.', 'Two.'] },
      { type: 'product_embed', skus: ['IH-1'] },
    ] as never)
    expect(text).toBe('The seat\n\nSeals on a flare, not the threads.\n\nOne. Two.')
  })
})
