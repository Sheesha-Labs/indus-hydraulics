import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  DN_HOUSE,
  ESTIMATE_LINES,
  INVOICE_HOUSE,
  NEUTRAL_LETTERHEAD,
  QUOTATION_ESTIMATE,
  QUOTATION_HOUSE,
  RFQ_HOUSE,
  RFQ_LINES,
} from '../__fixtures__/documents'
import DocumentPage, { type DocumentPageProps } from './DocumentPage'
import DocumentViewer from './DocumentViewer'

const render = (props: Partial<DocumentPageProps> & Pick<DocumentPageProps, 'data'>) =>
  renderToStaticMarkup(<DocumentPage letterhead={NEUTRAL_LETTERHEAD} {...props} />)

/** Visible text in document order (tags dropped, entities left as they are). */
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Integer cents from a formatted amount: never floats for money. */
const cents = (s: string) => Number(s.replace(/[^\d]/g, ''))

describe('DocumentPage', () => {
  it('renders the grand total text', () => {
    expect(text(render({ data: QUOTATION_ESTIMATE }))).toContain('Total USD 157,587.08')
    expect(text(render({ data: INVOICE_HOUSE }))).toContain('Balance due (USD) 165,375.00')
    expect(render({ data: QUOTATION_HOUSE })).toMatch(/data-doc-total="grand"[^]*?35,314\.00/)
  })

  it('the Estimate fixture adds up to the Round 3 total (C37)', () => {
    const sum = ESTIMATE_LINES.reduce((n, l) => n + (l.amount ? cents(l.amount) : 0), 0)
    expect(sum).toBe(cents('157,587.08'))
  })

  it('shows the revision as "-R2", never "r2"', () => {
    const html = render({ data: QUOTATION_ESTIMATE })
    expect(text(html)).toContain('# INDUS/Q10001-R2')
    expect(text(html)).toContain('Revision 2 — supersedes R1')
    expect(html).not.toMatch(/Q10001r2|Q10001-r2/)
  })

  it('marks exactly the highlighted rows (1-based)', () => {
    for (const data of [QUOTATION_HOUSE, QUOTATION_ESTIMATE]) {
      const html = render({ data, highlightRows: [3, 5] })
      const marked = [...html.matchAll(/data-row="(\d+)"[^>]*data-highlighted="true"/g)].map((m) =>
        Number(m[1])
      )
      expect(marked).toEqual([3, 5])
    }
    expect(render({ data: QUOTATION_HOUSE })).not.toContain('data-highlighted')
  })

  it('renders stamps as overlays after the document content', () => {
    for (const data of [INVOICE_HOUSE, QUOTATION_ESTIMATE]) {
      const html = render({ data, stamp: 'Paid' })
      const at = html.indexOf('data-doc-stamp="Paid"')
      expect(at).toBeGreaterThan(-1)
      // Everything before the stamp is the document; the word is not part of its text.
      expect(text(html.slice(0, at))).not.toContain('Paid')
      expect(html.slice(at)).toMatch(/absolute[^"]*print:hidden/)
    }
    expect(render({ data: DN_HOUSE })).not.toContain('data-doc-stamp')
  })

  it('puts the letterhead from the Letterhead prop, not from code', () => {
    const html = text(render({ data: RFQ_HOUSE }))
    expect(html).toContain('Example Trading LLC')
    expect(html).toContain('TRN 000000000000000')
    const est = text(render({ data: QUOTATION_ESTIMATE }))
    expect(est).toContain('Dubai, UAE · TRN 000000000000000')
    expect(est).toContain('+971 00 000 0000')
  })

  it('builds the RFQ only from supplier-safe lines', () => {
    const html = text(render({ data: RFQ_HOUSE }))
    for (const l of RFQ_LINES) expect(html).toContain(l.ourRef)
    expect(html).not.toContain('Sample Client')
    expect(html).not.toContain('SAMPLE/')
  })

  it.each([
    ['full', 'w-[794px]', 'shadow-io-e-page'],
    ['m', 'w-[476px]', 'scale-[.6]'],
    ['w', 'w-[440px]', 'scale-[.5542]'],
    ['thumb', 'w-[150px]', 'scale-[.189]'],
    ['z', 'w-[556px]', 'scale-[.7]'],
  ] as const)('scale %s uses fixed classes, never inline style', (scale, frame, page) => {
    const html = render({ data: QUOTATION_HOUSE, scale })
    expect(html).toContain(frame)
    expect(html).toContain(page)
    expect(html).not.toContain('style=')
  })

  it('defaults to m for house and z for the Estimate', () => {
    expect(render({ data: RFQ_HOUSE })).toContain('data-doc-frame="m"')
    expect(render({ data: QUOTATION_ESTIMATE })).toContain('data-doc-frame="z"')
  })

  it('uses the compact spacing only at scale m', () => {
    expect(render({ data: QUOTATION_HOUSE, scale: 'm' })).toContain('text-[40px]')
    expect(render({ data: QUOTATION_HOUSE, scale: 'w' })).toContain('text-[48px]')
  })
})

describe('DocumentViewer', () => {
  it('labels its page navigation and marks the current page', () => {
    const html = renderToStaticMarkup(
      <DocumentViewer fileName="INDUS-Q10001.pdf" pageCount={2} defaultPage={1}>
        <p>page</p>
      </DocumentViewer>
    )
    expect(html).toContain('aria-label="Pages"')
    expect(html).toMatch(/aria-label="Page 1 of 2" aria-current="page"/)
    expect(html).not.toMatch(/aria-label="Page 2 of 2" aria-current/)
    expect(text(html)).toContain('INDUS-Q10001.pdf')
  })

  it('follows a controlled page', () => {
    const html = renderToStaticMarkup(
      <DocumentViewer fileName="x.pdf" pageCount={3} page={3}>
        <p>page</p>
      </DocumentViewer>
    )
    expect(html).toMatch(/aria-label="Page 3 of 3" aria-current="page"/)
  })
})
