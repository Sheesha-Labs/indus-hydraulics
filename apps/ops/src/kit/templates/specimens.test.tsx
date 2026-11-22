import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { COMPANIES, SAMPLE_LINES } from '../fixtures'
import T12A, { CLIENT_QUOTATION_COLUMNS, toClientLine } from './T12A'
import X1 from './X1'

/** The HTML between the opening tag that carries `marker` and its matching close (by tag name). */
function blocksIn(html: string, marker: string): string[] {
  const out: string[] = []
  let from = 0
  for (;;) {
    const at = html.indexOf(marker, from)
    if (at < 0) return out
    const start = html.lastIndexOf('<', at)
    const tag = html.slice(start + 1).match(/^[a-z0-9]+/)![0]
    let depth = 0
    const re = new RegExp(`<(/?)${tag}\\b`, 'g')
    re.lastIndex = start
    for (let m = re.exec(html); m; m = re.exec(html)) {
      depth += m[1] ? -1 : 1
      if (depth === 0) {
        out.push(html.slice(start, html.indexOf('>', m.index) + 1))
        break
      }
    }
    from = at + marker.length
  }
}

// S02-T05: the two specimen rules that are not layout. T12 shows a client only what the client is quoted
// (C36); X1 has one primary per drafted email and none of its own in the header.

describe('T12a client page (C36)', () => {
  const html = renderToStaticMarkup(<T12A />)
  const text = html.replace(/<[^>]+>/g, ' ')

  it('names no supplier from the line fixtures', () => {
    const suppliers = [...new Set(SAMPLE_LINES.map((l) => l.supplier).filter(Boolean))]
    expect(suppliers.length).toBeGreaterThan(0)
    for (const s of [...suppliers, COMPANIES.supplier]) expect(text).not.toContain(s)
  })

  it('has the client columns only: no supplier, state, cost or margin column', () => {
    expect(CLIENT_QUOTATION_COLUMNS.map((c) => c.label)).toEqual([
      '#',
      'Part',
      'Description',
      'Qty',
      'Unit',
      'Unit price',
      'Line total',
    ])
    const [head] = blocksIn(html, 'role="rowgroup"')
    const headers = head!
      .replace(/<[^>]+>/g, '|')
      .split('|')
      .map((t) => t.trim())
      .filter(Boolean)
    expect(headers).toEqual(CLIENT_QUOTATION_COLUMNS.map((c) => c.label))
    for (const banned of [/supplier/i, /state/i, /cost/i, /margin/i])
      expect(headers.filter((h) => banned.test(h))).toEqual([])
    // No line-state chip either (Quoted, Alternative offered, To source, Partial).
    expect(html).not.toContain('data-part="chip"')
    for (const s of ['Alternative offered', 'To source', 'Partial']) expect(text).not.toContain(s)
  })

  it('prints "Price to follow" for an unpriced line', () => {
    expect(text).toContain('Price to follow')
  })

  it('maps a line by copying the client fields only', () => {
    const line = toClientLine(SAMPLE_LINES[0]!)
    expect(Object.keys(line).sort()).toEqual(
      ['brand', 'desc', 'n', 'part', 'qty', 'total', 'unit', 'uom'].sort()
    )
  })

  it('uses the 44 client button size and links nowhere into the console', () => {
    expect(html.match(/data-size="client"/g)).toHaveLength(3)
    expect(html).not.toMatch(/href="\/(enquiries|quotations|orders|suppliers|clients|parts)/)
  })
})

describe('X1 exception page', () => {
  const html = renderToStaticMarkup(<X1 />)

  const primaries = (s: string) => (s.match(/data-variant="primary"/g) ?? []).length

  it('has no primary in the page header', () => {
    const [header] = blocksIn(html, 'data-part="page-header"')
    expect(primaries(header!)).toBe(0)
  })

  it('has exactly one primary in each drafted email, and none in the decision column', () => {
    const drafts = blocksIn(html, 'data-part="drafted-email"')
    expect(drafts.length).toBeGreaterThanOrEqual(2)
    for (const d of drafts) expect(primaries(d)).toBe(1)
    const [main] = blocksIn(html, 'data-slot="main"')
    expect(primaries(main!)).toBe(0)
    expect(primaries(html)).toBe(drafts.length)
  })
})
