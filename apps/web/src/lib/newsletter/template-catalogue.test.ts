import { describe, expect, it } from 'vitest'
import { BUILT_IN_TEMPLATES, BUILT_IN_TEMPLATE_IDS, NEEDS_LABEL } from './template-catalogue'

describe('built-in newsletter templates', () => {
  it('have unique ids', () => {
    expect(new Set(BUILT_IN_TEMPLATE_IDS).size).toBe(BUILT_IN_TEMPLATE_IDS.length)
  })

  it('offer block templates and rich-text ones, with a blank of each kind', () => {
    const ids = BUILT_IN_TEMPLATES.map((t) => `${t.group}:${t.id}`)
    expect(ids).toContain('blocks:build-your-own')
    expect(ids).toContain('rich:rich-blank')
  })

  it('ask for one record only where the template is built around it', () => {
    const needing = BUILT_IN_TEMPLATES.filter((t) => 'needs' in t).map((t) => [t.id, (t as { needs: string }).needs])
    expect(needing).toEqual([
      ['product-launch', 'product'],
      ['brand-spotlight', 'brand'],
      ['industry-focus', 'industry'],
    ])
    for (const [, kind] of needing) expect(NEEDS_LABEL[kind as keyof typeof NEEDS_LABEL].question).toMatch(/\?$/)
  })
})
