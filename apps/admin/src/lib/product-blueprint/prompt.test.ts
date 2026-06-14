import { describe, expect, it } from 'vitest'
import { buildProductBlueprintPrompt } from './prompt'

describe('buildProductBlueprintPrompt', () => {
  it('includes verified product facts and accuracy guardrails', () => {
    const result = buildProductBlueprintPrompt(
      {
        id: 'product-1',
        sku: 'IH-4SP',
        mpn: '4SP',
        title: '4SP Four-Spiral High-Pressure Hydraulic Hose',
        descriptionShort: 'Heavy-duty spiral reinforced hydraulic hose.',
        brandName: 'INDUS',
        categoryName: 'Hydraulic Hoses',
        specs: [
          {
            group: 'Performance',
            label: 'Working Pressure',
            value: 'Very high pressure',
            unit: null,
          },
        ],
      },
      'Show the four spiral reinforcement layers in a cutaway.',
      new Date('2026-06-14T00:00:00Z'),
    )

    expect(result.prompt).toContain('PRODUCT TITLE — 4SP Four-Spiral High-Pressure Hydraulic Hose')
    expect(result.prompt).toContain('PERFORMANCE / WORKING PRESSURE — Very high pressure')
    expect(result.prompt).toContain('Show the four spiral reinforcement layers in a cutaway.')
    expect(result.prompt).toContain('DATE — 2026-06')
    expect(result.prompt).toContain('1600 x 1200')
    expect(result.prompt).toContain('4:3 landscape aspect ratio')
    expect(result.prompt).toContain('Do not return a square image')
    expect(result.prompt).toContain('never invent materials, ratings, standards')
  })

  it('does not add absent brand or MPN facts', () => {
    const result = buildProductBlueprintPrompt(
      {
        id: 'product-2',
        sku: 'IH-001',
        mpn: null,
        title: 'Hydraulic Adapter',
        descriptionShort: null,
        brandName: null,
        categoryName: 'Adapters',
        specs: [],
      },
      null,
      new Date('2026-06-14T00:00:00Z'),
    )

    expect(result.prompt).not.toContain('MPN / SERIES')
    expect(result.prompt).not.toContain('MANUFACTURER / BRAND')
  })
})
