import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { draftPreview } from './draft-preview'

const html = (s: string) => renderToStaticMarkup(<div>{draftPreview(s)}</div>)

describe('draftPreview', () => {
  it('renders the editor tag set as elements', () => {
    expect(html('<p>Dear <strong>Sam</strong>,</p><ul><li><em>one</em></li></ul>')).toBe(
      '<div><p>Dear <strong>Sam</strong>,</p><ul><li><em>one</em></li></ul></div>'
    )
    expect(html('<p>a<br>b</p>')).toBe('<div><p>a<br/>b</p></div>')
  })

  it('keeps safe links and drops unsafe hrefs', () => {
    expect(html('<a href="https://example.com/x?a=1&amp;b=2">x</a>')).toBe(
      '<div><a href="https://example.com/x?a=1&amp;b=2">x</a></div>'
    )
    expect(html('<a href="javascript:alert(1)">x</a>')).toBe('<div><a>x</a></div>')
  })

  it('drops every other tag and attribute, keeps text escaped', () => {
    const out = html(
      '<p onclick="x()" style="color:red">Hi</p><script>alert(1)</script><img src="https://t.example/p.gif" onerror="x()">&lt;b&gt;'
    )
    expect(out).toBe('<div><p>Hi</p>&lt;b&gt;</div>')
    expect(out).not.toMatch(/<script|<img|onclick|onerror|style=/)
  })

  it('closes unbalanced tags', () => {
    expect(html('<p>open <strong>bold')).toBe('<div><p>open <strong>bold</strong></p></div>')
  })
})
