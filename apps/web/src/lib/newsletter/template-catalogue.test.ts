import { describe, expect, it } from 'vitest'
import { RECORD_KINDS } from './blocks/types'
import { BUILT_IN_TEMPLATES, BUILT_IN_TEMPLATE_IDS, NEEDS_LABEL, TEMPLATE_SECTIONS } from './template-catalogue'

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
      ['category-showcase', 'category'],
      ['brand-spotlight', 'brand'],
      ['case-study', 'service'],
      ['engineering-guide', 'article'],
      ['industry-focus', 'industry'],
    ])
    for (const [, kind] of needing) expect(NEEDS_LABEL[kind as keyof typeof NEEDS_LABEL].question).toMatch(/\?$/)
  })

  it('sit on a known shelf, with a sketch, and only ask for records the picker can search', () => {
    for (const t of BUILT_IN_TEMPLATES) {
      expect(TEMPLATE_SECTIONS).toContain(t.section)
      expect(t.sketch.length).toBeGreaterThan(0)
      if ('needs' in t) expect(RECORD_KINDS).toContain((t as { needs: string }).needs)
    }
    for (const section of TEMPLATE_SECTIONS) expect(BUILT_IN_TEMPLATES.some((t) => t.section === section)).toBe(true)
  })
})
