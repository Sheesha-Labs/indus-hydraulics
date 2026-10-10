import { describe, expect, it } from 'vitest'
import { applyMarketCopy, marketCopyValues, marketMeta } from './market-copy'
import { MARKET_PAGES } from './market-pages'
import { MARKET_SECTIONS } from './page-sections/subpages'
import { validateSections } from './page-sections/resolve'
import type { SectionValues } from './page-sections/types'

const page = Object.values(MARKET_PAGES)[0]!
const empty = () => ({}) as SectionValues
const from = (doc: Record<string, SectionValues>) => (k: string) => doc[k] ?? {}

describe('applyMarketCopy', () => {
  it('renders the record unchanged when nothing is stored', () => {
    expect(applyMarketCopy(page, empty)).toEqual(page)
  })

  it('is an exact round trip through the seed values', () => {
    expect(applyMarketCopy(page, from(marketCopyValues(page)))).toEqual(page)
  })

  it('takes complete overrides', () => {
    const doc = marketCopyValues(page)
    doc.hero = { ...doc.hero!, lede: 'A new lede.' }
    ;(doc.faq!.items as Array<{ q: string; a: string }>)[0] = {
      q: 'New question?',
      a: 'New answer.',
    }
    const out = applyMarketCopy(page, from(doc))
    expect(out.lede).toBe('A new lede.')
    expect(out.faqs[0]).toEqual({ question: 'New question?', answer: 'New answer.' })
    expect(out.faqs).toHaveLength(page.faqs.length)
  })

  it('ignores incomplete lists and keeps the record', () => {
    const doc = marketCopyValues(page)
    doc.hero = {
      ...doc.hero,
      facts: (doc.hero!.facts as Array<Record<string, string>>).slice(0, 3),
    }
    doc.faq = { items: [{ q: 'Only one?', a: 'Yes.' }] }
    doc.freight = {
      ...doc.freight!,
      modes: [{ name: 'Sea', transit: '', route: 'x', useCase: 'y' }],
    }
    const items = (doc.sectors!.items as Array<{ slug: string }>).map((x) => ({
      ...x,
      slug: 'marine',
    }))
    doc.sectors = { items }
    const out = applyMarketCopy(page, from(doc))
    expect(out.facts).toBe(page.facts)
    expect(out.faqs).toBe(page.faqs)
    expect(out.freight).toBe(page.freight)
    expect(out.sectors).toBe(page.sectors)
  })

  it('reads meta overrides', () => {
    expect(marketMeta(empty)).toEqual({ title: null, description: null })
    expect(marketMeta(from({ hero: { meta_title: 'T', meta_description: 'D' } }))).toEqual({
      title: 'T',
      description: 'D',
    })
  })
})

describe('seeded market documents', () => {
  it('pass the Pages & Blocks field limits for every market record', () => {
    const def = {
      key: 'm',
      label: 'm',
      path: '/markets/m',
      description: '',
      sections: [...MARKET_SECTIONS],
    }
    for (const p of Object.values(MARKET_PAGES)) {
      const values = marketCopyValues(p)
      const doc = MARKET_SECTIONS.map((sec) => ({
        key: sec.key,
        enabled: true,
        values: values[sec.key] ?? {},
      }))
      const result = validateSections(def, doc)
      expect(
        result.ok ? [] : result.issues.map((i) => `${p.slug} ${i.section}.${i.field}: ${i.message}`)
      ).toEqual([])
    }
  })
})
