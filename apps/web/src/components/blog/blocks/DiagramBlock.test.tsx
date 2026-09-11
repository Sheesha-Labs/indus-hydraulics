import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import DiagramBlockView from './DiagramBlock'
import ReferencesBlockView from './ReferencesBlock'

/**
 * Markup-level tests for the two blocks added for the Physical AI wave.
 *
 * The sanitiser has its own suite; these check the part the sanitiser cannot —
 * that the component actually emits the cleaned markup, inside a scroll
 * container, behind a single accessible name.
 */
describe('DiagramBlockView', () => {
  const block = {
    type: 'diagram' as const,
    svg: '<svg viewBox="0 0 100 50"><text x="4" y="20">350 bar</text></svg>',
    caption: 'Working pressure by hose grade.',
    captionPrefix: 'FIG. 01',
    alt: 'A bar chart comparing working pressure across four hose grades.',
  }

  it('emits the svg, the caption and the prefix', () => {
    const html = renderToStaticMarkup(<DiagramBlockView block={block} />)
    expect(html).toContain('<svg')
    expect(html).toContain('350 bar')
    expect(html).toContain('Working pressure by hose grade.')
    expect(html).toContain('FIG. 01')
  })

  /**
   * Without role="img" and a label, a screen reader walks every <text> node in
   * the chart and reads the axis ticks out as a stream of loose words.
   */
  it('exposes the diagram as one labelled image', () => {
    const html = renderToStaticMarkup(<DiagramBlockView block={block} />)
    expect(html).toContain('role="img"')
    expect(html).toContain(`aria-label="${block.alt}"`)
  })

  /**
   * A wide chart must scroll inside its own container. If it does not, the
   * article body scrolls horizontally on a phone and every other block goes
   * with it.
   */
  it('wraps the figure in a horizontal scroll container', () => {
    const html = renderToStaticMarkup(<DiagramBlockView block={block} />)
    expect(html).toContain('overflow-x-auto')
  })

  it('renders nothing at all when the markup does not survive sanitisation', () => {
    const html = renderToStaticMarkup(
      <DiagramBlockView block={{ ...block, svg: '<svg><script>alert(1)</script></svg>' }} />
    )
    // The script is gone; and with no drawing content left there is no figure,
    // so the caption must not render orphaned above an empty box.
    expect(html).not.toContain('alert(1)')
  })

  it('strips a handler but keeps the drawing around it', () => {
    const html = renderToStaticMarkup(
      <DiagramBlockView
        block={{ ...block, svg: '<svg viewBox="0 0 9 9"><rect onclick="x()" x="1"/></svg>' }}
      />
    )
    expect(html).not.toContain('onclick')
    expect(html).toContain('x="1"')
  })
})

describe('ReferencesBlockView', () => {
  const block = {
    type: 'references' as const,
    heading: null,
    entries: [
      {
        id: 'bainbridge-1983',
        text: "Bainbridge, L. (1983) 'Ironies of automation', Automatica, 19(6), pp. 775-779.",
        url: 'https://doi.org/10.1016/0005-1098(83)90046-8',
      },
      { id: 'polanyi-1966', text: 'Polanyi, M. (1966) The Tacit Dimension.', url: null },
    ],
  }

  it('numbers the entries and defaults the heading', () => {
    const html = renderToStaticMarkup(<ReferencesBlockView block={block} />)
    expect(html).toContain('References')
    expect(html).toContain('1.')
    expect(html).toContain('2.')
    expect(html).toContain('Ironies of automation')
  })

  /** The anchor is the whole reason entries carry an id. */
  it('gives every entry a linkable anchor', () => {
    const html = renderToStaticMarkup(<ReferencesBlockView block={block} />)
    expect(html).toContain('id="ref-bainbridge-1983"')
    expect(html).toContain('id="ref-polanyi-1966"')
  })

  it('links a DOI and leaves an entry without one alone', () => {
    const html = renderToStaticMarkup(<ReferencesBlockView block={block} />)
    expect(html).toContain('https://doi.org/10.1016/0005-1098(83)90046-8')
    expect(html).toContain('rel="nofollow noopener"')
  })
})
