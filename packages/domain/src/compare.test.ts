import { describe, it, expect } from 'vitest'
import {
  MAX_COMPARE,
  validateCompareSet,
  buildCompareRows,
  type CompareProductInput,
  type CompareTemplate,
} from './compare'

function product(sku: string, overrides: Partial<CompareProductInput> = {}): CompareProductInput {
  return {
    id: `id-${sku}`,
    sku,
    title: `Product ${sku}`,
    categoryId: 'cat-pumps',
    specTemplateId: 'tpl-pump',
    specs: [],
    ...overrides,
  }
}

describe('MAX_COMPARE', () => {
  it('is 4 — the design contract', () => {
    expect(MAX_COMPARE).toBe(4)
  })
})

describe('validateCompareSet', () => {
  it('accepts a single same-category, same-template product', () => {
    const result = validateCompareSet([product('A')])
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.categoryId).toBe('cat-pumps')
      expect(result.specTemplateId).toBe('tpl-pump')
    }
  })

  it('accepts up to MAX_COMPARE products in the same set', () => {
    const result = validateCompareSet([product('A'), product('B'), product('C'), product('D')])
    expect(result.ok).toBe(true)
  })

  it('rejects an empty set', () => {
    const result = validateCompareSet([])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('empty')
  })

  it('rejects more than MAX_COMPARE products', () => {
    const result = validateCompareSet([
      product('A'), product('B'), product('C'), product('D'), product('E'),
    ])
    expect(result.ok).toBe(false)
    if (!result.ok && result.reason === 'too_many') {
      expect(result.count).toBe(5)
      expect(result.max).toBe(MAX_COMPARE)
    }
  })

  it('rejects when any product is missing a spec template', () => {
    const result = validateCompareSet([
      product('A'),
      product('B', { specTemplateId: null }),
    ])
    expect(result.ok).toBe(false)
    if (!result.ok && result.reason === 'missing_template') {
      expect(result.offendingSkus).toEqual(['B'])
    }
  })

  it('rejects when products span multiple categories', () => {
    const result = validateCompareSet([
      product('PUMP-1'),
      product('VALVE-1', { categoryId: 'cat-valves' }),
    ])
    expect(result.ok).toBe(false)
    if (!result.ok && result.reason === 'mixed_category') {
      expect(result.categoryIds).toHaveLength(2)
      const pumps = result.categoryIds.find((g) => g.categoryId === 'cat-pumps')
      const valves = result.categoryIds.find((g) => g.categoryId === 'cat-valves')
      expect(pumps?.skus).toEqual(['PUMP-1'])
      expect(valves?.skus).toEqual(['VALVE-1'])
    }
  })

  it('rejects when products use different spec templates within the same category', () => {
    const result = validateCompareSet([
      product('A'),
      product('B', { specTemplateId: 'tpl-pump-variable' }),
    ])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('mixed_template')
  })

  it('reports mixed_category before mixed_template when both fail', () => {
    // Category mismatch is the more user-actionable error — surface it first.
    const result = validateCompareSet([
      product('A'),
      product('B', { categoryId: 'cat-valves', specTemplateId: 'tpl-valve' }),
    ])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('mixed_category')
  })

  it('reports missing_template before mixed_category when both fail', () => {
    // A null template is a data-integrity issue — flag it before secondary mismatches.
    const result = validateCompareSet([
      product('A'),
      product('B', { categoryId: 'cat-valves', specTemplateId: null }),
    ])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('missing_template')
  })
})

describe('buildCompareRows', () => {
  const template: CompareTemplate = {
    id: 'tpl-pump',
    name: 'Variable axial pump',
    fields: [
      { id: 'f-disp', key: 'displacement', label: 'Displacement', unit: 'cc/rev', group: 'Hydraulic performance', position: 0 },
      { id: 'f-pressure', key: 'nominal_pressure', label: 'Nominal pressure', unit: 'bar', group: 'Hydraulic performance', position: 1 },
      { id: 'f-weight', key: 'weight', label: 'Weight', unit: 'kg', group: 'Mechanical', position: 0 },
    ],
  }

  it('groups rows by template field group, ordered by position within a group', () => {
    const sections = buildCompareRows(
      [
        product('A', {
          specs: [
            { templateFieldId: 'f-disp', value: '71', unit: null },
            { templateFieldId: 'f-pressure', value: '350', unit: null },
            { templateFieldId: 'f-weight', value: '28.5', unit: null },
          ],
        }),
      ],
      template,
    )
    expect(sections.map((s) => s.group)).toEqual(['Hydraulic performance', 'Mechanical'])
    expect(sections[0]?.rows.map((r) => r.fieldKey)).toEqual(['displacement', 'nominal_pressure'])
    expect(sections[1]?.rows.map((r) => r.fieldKey)).toEqual(['weight'])
  })

  it('produces one cell per product per row in input order', () => {
    const sections = buildCompareRows(
      [
        product('A', { specs: [{ templateFieldId: 'f-disp', value: '71', unit: null }] }),
        product('B', { specs: [{ templateFieldId: 'f-disp', value: '180', unit: null }] }),
        product('C', { specs: [{ templateFieldId: 'f-disp', value: '71', unit: null }] }),
      ],
      template,
    )
    const dispRow = sections[0]?.rows[0]
    expect(dispRow?.cells.map((c) => c.rawValue)).toEqual(['71', '180', '71'])
  })

  it('falls back to the template field unit when a product spec has no unit', () => {
    const sections = buildCompareRows(
      [product('A', { specs: [{ templateFieldId: 'f-disp', value: '71', unit: null }] })],
      template,
    )
    expect(sections[0]?.rows[0]?.cells[0]?.display).toBe('71 cc/rev')
  })

  it('prefers the per-product spec unit over the template field unit', () => {
    const sections = buildCompareRows(
      [product('A', { specs: [{ templateFieldId: 'f-disp', value: '71', unit: 'cm³/rev' }] })],
      template,
    )
    expect(sections[0]?.rows[0]?.cells[0]?.display).toBe('71 cm³/rev')
  })

  it('renders null cells when a product is missing a spec for a template field', () => {
    const sections = buildCompareRows(
      [
        product('A', { specs: [{ templateFieldId: 'f-disp', value: '71', unit: null }] }),
        product('B', { specs: [] }),
      ],
      template,
    )
    expect(sections[0]?.rows[0]?.cells[1]).toEqual({ display: null, rawValue: null })
  })

  it('ignores free-form specs (templateFieldId = null) — they have no aligned row', () => {
    const sections = buildCompareRows(
      [
        product('A', {
          specs: [
            { templateFieldId: 'f-disp', value: '71', unit: null },
            { templateFieldId: null, value: 'extra info', unit: null },
          ],
        }),
      ],
      template,
    )
    const allRowKeys = sections.flatMap((s) => s.rows.map((r) => r.fieldKey))
    expect(allRowKeys).toEqual(['displacement', 'nominal_pressure', 'weight'])
  })

  it('treats a missing/empty group name as "General"', () => {
    const tpl: CompareTemplate = {
      ...template,
      fields: [{ id: 'f-misc', key: 'misc', label: 'Misc', unit: null, group: null, position: 0 }],
    }
    const sections = buildCompareRows(
      [product('A', { specs: [{ templateFieldId: 'f-misc', value: 'x', unit: null }] })],
      tpl,
    )
    expect(sections[0]?.group).toBe('General')
  })
})
