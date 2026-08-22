// @vitest-environment jsdom
import { Editor } from '@tiptap/core'
import { describe, expect, test } from 'vitest'

import { richTextExtensions } from '../components/admin/rich-text/schema'
import { PRODUCT_DESCRIPTION_FIXTURES } from './__fixtures__/product-descriptions'
import { isBlankRichText, toEditorHtml, toStoredHtml } from './product-rich-text'

/**
 * What a save actually does to a description.
 *
 * The product description editor replaced a raw-HTML textarea. That swap is
 * only safe if opening a description and saving it hands back what was there:
 * 1,376 of these are written, and a schema that quietly drops an element
 * destroys the work on the first save, with no error and nothing in a diff to
 * notice. So the test drives a REAL editor over markup copied verbatim out of
 * production, rather than asserting against a schema assembled a second time
 * by hand.
 */
function save(stored: string): string {
  const element = document.createElement('div')
  const editor = new Editor({
    element,
    extensions: richTextExtensions,
    content: toEditorHtml(stored) || '<p></p>',
  })
  const out = toStoredHtml(editor.getHTML())
  editor.destroy()
  return out
}

/**
 * Every word the reader sees, with markup and whitespace differences removed.
 *
 * Tags become spaces rather than being closed over: the importers write a
 * newline between `</li>` and `<li>` and TipTap does not, so comparing raw
 * `textContent` would report the whole catalogue as having lost text when what
 * changed is the source formatting.
 */
function textOf(html: string): string {
  const doc = new DOMParser().parseFromString('<body></body>', 'text/html')
  doc.body.innerHTML = html.replace(/<[^>]+>/g, ' ')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/** How many of each element the markup contains. */
function tagCensus(html: string): Record<string, number> {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const census: Record<string, number> = {}
  for (const element of Array.from(doc.body.querySelectorAll('*'))) {
    const tag = element.tagName.toLowerCase()
    census[tag] = (census[tag] ?? 0) + 1
  }
  return census
}

describe('a description survives being opened and saved', () => {
  for (const fixture of PRODUCT_DESCRIPTION_FIXTURES) {
    describe(`${fixture.slug} — ${fixture.note}`, () => {
      test('loses no text', () => {
        expect(textOf(save(fixture.html))).toBe(textOf(fixture.html))
      })

      test('is idempotent — a second save changes nothing', () => {
        const once = save(fixture.html)
        expect(save(once)).toBe(once)
      })

      test('keeps every element it started with', () => {
        const before = tagCensus(fixture.html)
        const after = tagCensus(save(fixture.html))
        for (const [tag, count] of Object.entries(before)) {
          expect(after[tag] ?? 0, `<${tag}> lost on save`).toBeGreaterThanOrEqual(count)
        }
      })
    })
  }
})

describe('the shapes TipTap cannot carry on its own', () => {
  const ferrule = PRODUCT_DESCRIPTION_FIXTURES.find((f) => f.slug.startsWith('manuli'))!

  test('the table caption comes back as a real <caption>', () => {
    const original = /<caption>([^<]+)<\/caption>/.exec(ferrule.html)![1]
    expect(save(ferrule.html)).toContain(`<caption>${original}</caption>`)
  })

  test('the header band comes back as a real <thead>', () => {
    // prosemirror-tables renders every row into one <tbody>. `.ih-rich-text
    // thead th` in globals.css is what draws the header band, so a table that
    // loses its <thead> loses its styling on the product page.
    const saved = save(ferrule.html)
    expect(saved).toContain('<thead>')
    expect(/<thead><tr><th[^>]*>/.test(saved)).toBe(true)
  })

  test('header cells keep scope="col"', () => {
    expect(save(ferrule.html)).toContain('scope="col"')
  })

  test('the scroll rail survives', () => {
    expect(save(ferrule.html)).toContain('<div class="ih-table-scroll">')
  })

  test('the source note keeps its class', () => {
    const note = PRODUCT_DESCRIPTION_FIXTURES.find((f) => f.html.includes('source-note'))!
    expect(save(note.html)).toContain('<p class="source-note">')
  })
})

describe('the two things a save deliberately changes', () => {
  test('a table that was never wrapped gains the scroll rail', () => {
    // Six descriptions carry a bare <table>. Unwrapped, a nine-column part
    // matrix widens the whole product column instead of scrolling inside it.
    const bare = PRODUCT_DESCRIPTION_FIXTURES.find((f) => f.slug.startsWith('demco'))!
    expect(bare.html).toContain('<table>')
    const saved = save(bare.html)
    expect(saved).toContain('<div class="ih-table-scroll"><table class="ih-data-table">')
  })

  test('a description that is bare text becomes a paragraph', () => {
    // 21 descriptions are a naked sentence with no markup at all. They render
    // identically either way; the editor cannot hold text outside a block.
    const plain = PRODUCT_DESCRIPTION_FIXTURES.find((f) => !f.html.includes('<'))!
    expect(save(plain.html)).toBe(`<p>${plain.html}</p>`)
  })
})

describe('empty documents', () => {
  test('an untouched empty editor stores nothing, not an empty paragraph', () => {
    expect(toStoredHtml('<p></p>')).toBe('')
    expect(isBlankRichText('<p></p>')).toBe(true)
    expect(isBlankRichText('<p>x</p>')).toBe(false)
  })

  test('a null description opens as an empty editor', () => {
    expect(toEditorHtml(null)).toBe('')
    expect(toEditorHtml('   ')).toBe('')
  })

  test('the trailing paragraph ProseMirror keeps after a block is not stored', () => {
    expect(toStoredHtml('<p>Body.</p><p></p>')).toBe('<p>Body.</p>')
  })
})
