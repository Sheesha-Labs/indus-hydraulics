import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'
import { variantDimensionColumns, variantEndColumns, variantTableKind } from '@indus/domain'

import { applyEdits, setFaqLead, setLine, setSizeLine, specText, withTable } from './run'

const payload = JSON.parse(
  readFileSync(join(__dirname, '../../../data/sunpool-size-tables/payload.json'), 'utf8')
) as Record<
  string,
  {
    variants: Array<{
      partNumber: string
      hoseInch: string | null
      portLabel: string | null
      port2Label: string | null
    }>
    tableHtml: string | null
    sizeRange: string | null
  }
>

describe('withTable', () => {
  const table = '<!-- sunpool-sizes:start --><h3>Sunpool sizes</h3><!-- sunpool-sizes:end -->'

  it('appends the block once, then replaces it in place', () => {
    const first = withTable('<p>Intro</p>', table)
    expect(first).toBe(`<p>Intro</p>\n${table}`)
    const next = table.replace('Sunpool sizes', 'Sunpool sizes (new)')
    expect(withTable(first, next)).toBe(`<p>Intro</p>\n${next}`)
  })
})

describe('setSizeLine', () => {
  const html =
    '<ul><li><strong>Size range:</strong> 1", 1-1/2", 6"</li><li><strong>Material:</strong> Brass</li></ul>'

  it('replaces the one size line and reports what it said', () => {
    const out = setSizeLine(html, '3/4"–4"')
    expect(out?.was).toBe('1", 1-1/2", 6"')
    expect(out?.html).toContain('<li><strong>Size range:</strong> 3/4"–4"</li>')
    expect(out?.html).toContain('<li><strong>Material:</strong> Brass</li>')
  })

  it('refuses a description with no size line, or two', () => {
    expect(setSizeLine('<p>none</p>', '1"')).toBeNull()
    expect(setSizeLine(html + html, '1"')).toBeNull()
  })
})

describe('setLine', () => {
  it('sets a labelled line, leaving the others', () => {
    const html =
      '<li><strong>Material:</strong> Brass or Aluminum</li><li><strong>Working pressure:</strong> Up to 16 bar</li>'
    const out = setLine(html, 'Material', 'Aluminum; Stainless Steel')
    expect(out?.was).toBe('Brass or Aluminum')
    expect(out?.html).toBe(
      '<li><strong>Material:</strong> Aluminum; Stainless Steel</li><li><strong>Working pressure:</strong> Up to 16 bar</li>'
    )
  })

  it('takes a dollar sign in the value literally', () => {
    expect(setLine('<li><strong>Material:</strong> x</li>', 'Material', '$& $1')?.html).toBe(
      '<li><strong>Material:</strong> $& $1</li>'
    )
  })
})

describe('specText', () => {
  it("tidies the importer's joins and a repeated label", () => {
    expect(
      specText(
        'Materials Available',
        'Fitting & Hose Clamps:; Aluminum with Hard Anodized; Connection Ring:; Carbon Steel'
      )
    ).toBe('Fitting & Hose Clamps: Aluminum with Hard Anodized; Connection Ring: Carbon Steel')
    expect(specText('Working Pressure', 'Working Pressure: 250 PSI.')).toBe('250 PSI')
    expect(specText('Working Pressure', '300 PSI')).toBe('300 PSI')
  })
})

describe('setFaqLead', () => {
  it('swaps the range and keeps the rest of the answer', () => {
    const out = setFaqLead(
      '1", 2". Specify the exact size on the RFQ — lead time depends on size.',
      '2"–12"'
    )
    expect(out?.was).toBe('1", 2"')
    expect(out?.answer).toBe(
      '2"–12". Specify the exact size on the RFQ — lead time depends on size.'
    )
  })
})

describe('applyEdits', () => {
  it('replaces every occurrence and counts them', () => {
    const out = applyEdits('A. Sizes 1"–6". B. Sizes 1"–6". C.', [
      { find: 'Sizes 1"–6". ', replace: '' },
    ])
    expect(out).toEqual({ text: 'A. B. C.', hits: 2 })
  })
})

describe('the Sunpool payload', () => {
  it('names every size row under its own listing, once', () => {
    const all = Object.entries(payload).flatMap(([sku, v]) =>
      v.variants.map((x) => ({ sku, pn: x.partNumber }))
    )
    for (const { sku, pn } of all) expect(pn.startsWith(`${sku}-`)).toBe(true)
    expect(new Set(all.map((x) => x.pn)).size).toBe(all.length)
  })

  it('renders as a fitting table with no dimension columns', () => {
    for (const v of Object.values(payload)) {
      if (!v.variants.length) continue
      expect(variantTableKind(v.variants)).toBe('fitting')
      expect(variantDimensionColumns(v.variants)).toEqual([])
    }
  })

  it('gives every row a size, or two numbered ends', () => {
    for (const v of Object.values(payload)) {
      for (const x of v.variants) {
        expect(Boolean(x.hoseInch) || Boolean(x.portLabel && x.port2Label)).toBe(true)
      }
      // One shape per listing: a size column or end columns, never a lone port.
      if (v.variants.some((x) => x.port2Label))
        expect(variantEndColumns(v.variants)).toHaveLength(2)
      else expect(v.variants.every((x) => !x.portLabel)).toBe(true)
    }
  })

  it('keeps every Sunpool block between its markers', () => {
    for (const v of Object.values(payload)) {
      if (!v.tableHtml) continue
      expect(v.tableHtml.startsWith('<!-- sunpool-sizes:start -->')).toBe(true)
      expect(v.tableHtml.endsWith('<!-- sunpool-sizes:end -->')).toBe(true)
    }
  })
})
