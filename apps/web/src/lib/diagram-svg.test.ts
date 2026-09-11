import { describe, expect, it } from 'vitest'
import { sanitizeDiagramSvg } from './diagram-svg'

/**
 * The `diagram` block's SVG reaches the page through dangerouslySetInnerHTML.
 * These tests are the record of what the allow-list is actually for: each case
 * is a way SVG reaches script execution or an external fetch.
 */
describe('sanitizeDiagramSvg', () => {
  it('keeps ordinary drawing markup intact', () => {
    const svg =
      '<svg viewBox="0 0 100 50"><rect x="1" y="2" width="8" height="4" fill="#333"/>' +
      '<text x="4" y="20" font-size="11" text-anchor="middle">350 bar</text></svg>'
    const out = sanitizeDiagramSvg(svg)
    expect(out).toContain('viewBox="0 0 100 50"')
    expect(out).toContain('350 bar')
    expect(out).toContain('text-anchor="middle"')
  })

  /**
   * viewBox is case-sensitive, and a lower-cased one fails SILENTLY: the
   * diagram renders at raw pixel size and overflows the column rather than
   * throwing. This is the test that catches a parser-option regression.
   */
  it('preserves camelCase attribute names', () => {
    expect(sanitizeDiagramSvg('<svg viewBox="0 0 10 10"><g/></svg>')).toContain('viewBox=')
  })

  it('strips script elements and their contents', () => {
    const out = sanitizeDiagramSvg('<svg viewBox="0 0 1 1"><script>alert(1)</script></svg>')
    expect(out).not.toContain('script')
    // The contents go too. Otherwise `alert(1)` survives as a visible text node.
    expect(out).not.toContain('alert(1)')
  })

  it('strips event handler attributes', () => {
    const out = sanitizeDiagramSvg('<svg viewBox="0 0 1 1"><rect onload="alert(1)" x="0"/></svg>')
    expect(out).not.toContain('onload')
    expect(out).toContain('x="0"')
  })

  it('strips foreignObject, which smuggles arbitrary HTML into an SVG context', () => {
    const out = sanitizeDiagramSvg(
      '<svg viewBox="0 0 1 1"><foreignObject><iframe src="https://evil.test"></iframe></foreignObject></svg>'
    )
    expect(out).not.toContain('foreignObject')
    expect(out).not.toContain('iframe')
  })

  it('strips use and image, which fetch external documents', () => {
    const out = sanitizeDiagramSvg(
      '<svg viewBox="0 0 1 1"><use href="https://evil.test/x#y"/><image href="https://evil.test/p.png"/></svg>'
    )
    expect(out).not.toContain('<use')
    expect(out).not.toContain('<image')
    expect(out).not.toContain('evil.test')
  })

  it('strips anchors, closing the javascript: URL route', () => {
    const out = sanitizeDiagramSvg(
      '<svg viewBox="0 0 1 1"><a href="javascript:alert(1)"><rect x="0"/></a></svg>'
    )
    expect(out).not.toContain('javascript:')
    expect(out).not.toContain('<a ')
  })

  it('strips animation elements, which can retarget attributes after sanitisation', () => {
    const out = sanitizeDiagramSvg(
      '<svg viewBox="0 0 1 1"><rect x="0"><set attributeName="onload" to="alert(1)"/></rect></svg>'
    )
    expect(out).not.toContain('<set')
    expect(out).not.toContain('alert(1)')
  })

  it('strips the style attribute, which accepts url()', () => {
    const out = sanitizeDiagramSvg(
      '<svg viewBox="0 0 1 1"><rect style="background:url(https://evil.test/x)" x="0"/></svg>'
    )
    expect(out).not.toContain('style=')
    expect(out).not.toContain('evil.test')
  })

  /**
   * Returning the orphaned children of a stripped root would inject loose
   * <text> nodes straight into the article body.
   */
  it('returns empty when the root element does not survive', () => {
    expect(sanitizeDiagramSvg('<div><text>not a diagram</text></div>')).toBe('')
    expect(sanitizeDiagramSvg('')).toBe('')
  })

  it('is idempotent, so a second pass anywhere is harmless', () => {
    const svg = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="2" fill="#000"/></svg>'
    const once = sanitizeDiagramSvg(svg)
    expect(sanitizeDiagramSvg(once)).toBe(once)
  })
})
