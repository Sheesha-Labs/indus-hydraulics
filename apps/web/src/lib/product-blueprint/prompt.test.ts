import { describe, expect, it } from 'vitest'
import { buildBlueprintPromptAuthoringRequest, normalizeAuthoredBlueprintPrompt } from './prompt'

describe('buildBlueprintPromptAuthoringRequest', () => {
  it('uses the title as the only product-specific input', () => {
    const request = buildBlueprintPromptAuthoringRequest(
      'INDUS 4SP Four-Spiral High-Pressure Hydraulic Hose',
      new Date('2026-06-14T00:00:00Z')
    )

    expect(request.input).toBe(
      'Author the ready-to-use INDUS blueprint image prompt for this product title:\nINDUS 4SP Four-Spiral High-Pressure Hydraulic Hose'
    )
    expect(request.instructions).toContain('product title is the only product-specific source')
    expect(request.instructions).toContain('1600 x 1200')
    expect(request.instructions).toContain('landscape 4:3')
    expect(request.instructions).toContain('Four to six lettered technical callouts')
    expect(request.instructions).toContain('Three right-side specification icons')
    expect(request.instructions).toContain('DATE — 2026-06')
    expect(request.instructions).toContain('INDUS QUALITY. ENGINEERED RELIABILITY.')
  })

  it('forbids unsupported exact specifications', () => {
    const request = buildBlueprintPromptAuthoringRequest(
      'Hydraulic Adapter',
      new Date('2026-06-14T00:00:00Z')
    )

    expect(request.instructions).toContain('Never invent exact dimensions')
    expect(request.instructions).toContain('standards, certifications')
    expect(request.instructions).toContain('use a truthful qualitative description or omit it')
  })
})

describe('normalizeAuthoredBlueprintPrompt', () => {
  it('removes common response wrappers', () => {
    expect(normalizeAuthoredBlueprintPrompt('```text\nCreate the plate.\n```')).toBe(
      'Create the plate.'
    )
    expect(normalizeAuthoredBlueprintPrompt('“Create the plate.”')).toBe('Create the plate.')
  })
})
