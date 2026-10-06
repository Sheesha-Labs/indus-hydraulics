import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'
import { variantDimensionColumns, variantTableKind } from '@indus/domain'

import { withTable } from './run'

const payload = JSON.parse(
  readFileSync(join(__dirname, '../../../data/sealfast-size-tables/payload.json'), 'utf8')
) as Record<
  string,
  {
    variants: Array<{ partNumber: string; dimensions: Record<string, number> | null }>
    tableHtml: string
  }
>

describe('withTable', () => {
  const table =
    '<!-- sealfast-sizes:start --><h3>Sealfast part numbers</h3><!-- sealfast-sizes:end -->'

  it('appends the table once, then replaces it in place', () => {
    const first = withTable('<p>Intro</p>', table)
    expect(first).toBe(`<p>Intro</p>\n${table}`)
    const next = table.replace('part numbers', 'part numbers (new)')
    expect(withTable(first, next)).toBe(`<p>Intro</p>\n${next}`)
  })
})

describe('the Sealfast payload', () => {
  it('names every size row under its own listing, once', () => {
    const all = Object.entries(payload).flatMap(([sku, v]) =>
      v.variants.map((x) => ({ sku, pn: x.partNumber }))
    )
    for (const { sku, pn } of all) expect(pn.startsWith(`${sku}-`)).toBe(true)
    expect(new Set(all.map((x) => x.pn)).size).toBe(all.length)
  })

  it('renders as a fitting table with only lettered dimension columns, never W', () => {
    for (const v of Object.values(payload)) {
      if (!v.variants.length) continue
      expect(variantTableKind(v.variants)).toBe('fitting')
      for (const c of variantDimensionColumns(v.variants))
        expect(c.key).toMatch(/^(D[1-4]?|H|L[1-6]?|[A-F])$/)
    }
  })

  it('keeps every description table between its markers', () => {
    for (const v of Object.values(payload)) {
      expect(v.tableHtml.startsWith('<!-- sealfast-sizes:start -->')).toBe(true)
      expect(v.tableHtml.endsWith('<!-- sealfast-sizes:end -->')).toBe(true)
    }
  })
})
