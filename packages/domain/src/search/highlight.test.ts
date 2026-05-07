import { describe, expect, test } from 'vitest'

import { sanitiseHighlight } from './highlight'

describe('sanitiseHighlight — allow-list', () => {
  test('plain text round-trips unchanged', () => {
    expect(sanitiseHighlight('hello world')).toBe('hello world')
  })

  test('plain `<mark>` survives', () => {
    expect(sanitiseHighlight('<mark>foo</mark>')).toBe('<mark>foo</mark>')
  })

  test('multiple `<mark>` survive', () => {
    expect(sanitiseHighlight('<mark>foo</mark> and <mark>bar</mark>')).toBe(
      '<mark>foo</mark> and <mark>bar</mark>',
    )
  })

  test('case-insensitive mark tags', () => {
    expect(sanitiseHighlight('<MARK>foo</MARK>')).toBe('<mark>foo</mark>')
    expect(sanitiseHighlight('<Mark>foo</Mark>')).toBe('<mark>foo</mark>')
  })

  test('null / undefined / empty → empty string', () => {
    expect(sanitiseHighlight(null)).toBe('')
    expect(sanitiseHighlight(undefined)).toBe('')
    expect(sanitiseHighlight('')).toBe('')
  })
})

describe('sanitiseHighlight — XSS surface', () => {
  test('script tag escaped', () => {
    expect(sanitiseHighlight('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    )
  })

  test('img onerror escaped', () => {
    const r = sanitiseHighlight('<img src=x onerror=alert(1)>')
    // The dangerous `<img>` tag is escaped — browsers render the whole
    // thing as literal text, including the onerror= substring. That IS
    // safe; what matters is no real `<img` element gets rendered.
    expect(r).not.toContain('<img')
    expect(r).toContain('&lt;img')
    expect(r).toContain('&gt;')
  })

  test('a href escaped', () => {
    expect(sanitiseHighlight('<a href="evil">click</a>')).toBe(
      '&lt;a href=&quot;evil&quot;&gt;click&lt;/a&gt;',
    )
  })

  test('mark with attributes is rejected (escaped)', () => {
    // The opening `<mark class="x">` doesn't match the strict allow-list
    // pattern, so it stays escaped. The trailing `</mark>` is also kept
    // escaped because we only restore BALANCED pairs — orphaned close
    // tags would be confusing in the output.
    const r = sanitiseHighlight('<mark class="x">foo</mark>')
    expect(r).not.toContain('<mark')
    expect(r).toContain('&lt;mark class=&quot;x&quot;&gt;')
    expect(r).toContain('foo')
    expect(r).toContain('&lt;/mark&gt;')
  })

  test('mark with onclick attribute escaped', () => {
    const r = sanitiseHighlight('<mark onclick="alert(1)">foo</mark>')
    expect(r).not.toContain('<mark onclick')
    expect(r).toContain('&lt;mark onclick=')
  })

  test('self-closing mark variant is rejected', () => {
    expect(sanitiseHighlight('<mark/>foo')).toBe('&lt;mark/&gt;foo')
  })

  test('extra characters after mark name are rejected', () => {
    expect(sanitiseHighlight('<markX>foo</markX>')).toBe('&lt;markX&gt;foo&lt;/markX&gt;')
  })

  test('quotes inside text are escaped', () => {
    expect(sanitiseHighlight(`"hello"`)).toBe('&quot;hello&quot;')
    expect(sanitiseHighlight("it's")).toBe('it&#39;s')
  })

  test('ampersand pre-escaped (no double-escape regression)', () => {
    // `&amp;` becomes `&amp;amp;` — that's correct and expected because
    // the input is treated as plain text, not HTML. ts_headline never
    // emits pre-escaped entities; if it ever does, we want them to
    // render as the literal text the user wrote.
    expect(sanitiseHighlight('A &amp; B')).toBe('A &amp;amp; B')
  })

  test('mixed legitimate + malicious — only mark passes', () => {
    expect(sanitiseHighlight('<mark>foo</mark><script>x</script>')).toBe(
      '<mark>foo</mark>&lt;script&gt;x&lt;/script&gt;',
    )
  })

  test('text that resembles internal placeholder strings is not exploitable', () => {
    // The implementation doesn't rely on placeholders any more, but we
    // keep the test as a regression guard — if the strategy is ever
    // changed back to a placeholder approach, plain user text that
    // matches the placeholder mustn't be promoted to a real `<mark>`.
    const r = sanitiseHighlight('I have MARK_OPEN markers')
    expect(r).toContain('MARK_OPEN')
    expect(r).not.toContain('<mark>')
  })
})

describe('sanitiseHighlight — robustness', () => {
  test('orphaned open `<mark>` is escaped (no balanced pair to restore)', () => {
    expect(sanitiseHighlight('<mark>foo')).toBe('&lt;mark&gt;foo')
  })

  test('orphaned close `</mark>` is escaped (no balanced pair to restore)', () => {
    expect(sanitiseHighlight('foo</mark>')).toBe('foo&lt;/mark&gt;')
  })

  test('whitespace inside tag rejected', () => {
    expect(sanitiseHighlight('< mark >foo< /mark >')).toBe(
      '&lt; mark &gt;foo&lt; /mark &gt;',
    )
  })

  test('repeated allowed tags', () => {
    expect(sanitiseHighlight('<mark>a</mark><mark>b</mark><mark>c</mark>')).toBe(
      '<mark>a</mark><mark>b</mark><mark>c</mark>',
    )
  })
})
