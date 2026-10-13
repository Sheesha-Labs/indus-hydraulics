import { wordCount } from '@indus/domain'
import { describe, expect, it } from 'vitest'

import { HYDRAULICS } from './hydraulics'
import { LIFTING } from './lifting'
import { MOLYKOTE } from './molykote'
import { OFS_VALVES } from './ofs-valves'
import { isNoop, plan, stripTags, textScore, type Current } from './plan'
import type { Entry } from './types'

const ALL: Entry[] = [...OFS_VALVES, ...LIFTING, ...MOLYKOTE, ...HYDRAULICS]

const current = (over: Partial<Current> = {}): Current => ({
  id: 'p1',
  sku: 'SKU-1',
  title: 'Old title',
  slug: 'old-title',
  status: 'active',
  seoTitle: 'Old title',
  seoDescription: 'Old.',
  focusKeyword: 'old',
  mpn: null,
  descriptionShort: 'Short.',
  descriptionLong: '<p>Long.</p>',
  brandId: null,
  categoryId: 'c1',
  weightKg: null,
  countryOfOrigin: null,
  faqs: [{ id: 'f1', question: 'Q1?', answer: 'A1.', position: 0 }],
  specs: [
    {
      id: 's1',
      group: 'Identification',
      label: 'Product type',
      value: 'Thing',
      unit: null,
      position: 0,
    },
  ],
  counts: { crossReferences: 0, documents: 0, images: 1, variants: 0 },
  ...over,
})

describe('plan', () => {
  const entry: Entry = {
    sku: 'SKU-1',
    was: 'Old title',
    title: 'New title',
    slug: 'new-title',
    descriptionShort: 'New short.',
    addFaqs: [
      { question: 'Q1?', answer: 'Different answer, same question.' },
      { question: 'Q2?', answer: 'A2.' },
    ],
    addSpecs: [
      { group: 'Identification', label: 'Product type', value: 'Ignored: the label exists' },
      { group: 'Construction', label: 'Material', value: 'Steel' },
    ],
    sources: ['test'],
  }

  it('refuses a listing that is not the one the entry was written for', () => {
    expect(() => plan(current({ title: 'Someone else' }), entry)).toThrow(/expected "Old title"/)
    expect(() => plan(current({ status: 'draft' }), entry)).toThrow(/status is draft/)
  })

  it('adds only FAQs and spec rows whose question or label is new, and moves the slug', () => {
    const p = plan(current(), entry)
    expect(p.product).toEqual({
      title: 'New title',
      slug: 'new-title',
      descriptionShort: 'New short.',
    })
    expect(p.addFaqs.map((f) => f.question)).toEqual(['Q2?'])
    expect(p.addSpecs.map((s) => s.label)).toEqual(['Material'])
    expect(p.slugMove).toEqual({ from: 'old-title', to: 'new-title' })
  })

  it('is a no-op once applied', () => {
    const applied = current({
      title: 'New title',
      slug: 'new-title',
      descriptionShort: 'New short.',
      faqs: [
        { id: 'f1', question: 'Q1?', answer: 'A1.', position: 0 },
        { id: 'f2', question: 'Q2?', answer: 'A2.', position: 1 },
      ],
      specs: [
        {
          id: 's1',
          group: 'Identification',
          label: 'Product type',
          value: 'Thing',
          unit: null,
          position: 0,
        },
        {
          id: 's2',
          group: 'Construction',
          label: 'Material',
          value: 'Steel',
          unit: null,
          position: 1,
        },
      ],
    })
    expect(isNoop(plan(applied, entry))).toBe(true)
  })

  it('replaces FAQs and specs only when they differ', () => {
    const replace: Entry = {
      sku: 'SKU-1',
      was: 'Old title',
      faqs: [{ question: 'Q1?', answer: 'A1.' }],
      specs: [{ group: 'Identification', label: 'Product type', value: 'Thing' }],
      sources: ['test'],
    }
    expect(isNoop(plan(current(), replace))).toBe(true)
    const changed = plan(current(), {
      ...replace,
      specs: [{ group: 'Identification', label: 'Product type', value: 'Other' }],
    })
    expect(changed.specs).toHaveLength(1)
    expect(changed.faqs).toBeNull()
  })

  it('does not count HTML tags as words in the strict score', () => {
    const tags = `<p>${'<b>x</b> '.repeat(160)}</p>`
    expect(wordCount(tags)).toBeGreaterThan(wordCount(stripTags(tags)))
  })
})

describe('the entries', () => {
  it('name each listing once, with sources', () => {
    const skus = ALL.map((e) => e.sku)
    expect(new Set(skus).size).toBe(skus.length)
    for (const e of ALL) expect(e.sources.length, e.sku).toBeGreaterThan(0)
  })

  it('give every listing a short description of 30 words or more', () => {
    for (const e of ALL) {
      if (e.descriptionShort === undefined) continue
      expect(wordCount(e.descriptionShort), e.sku).toBeGreaterThanOrEqual(30)
    }
  })

  it('keep SEO descriptions within 160 characters', () => {
    for (const e of ALL)
      if (e.seoDescription) expect(e.seoDescription.length, e.sku).toBeLessThanOrEqual(160)
  })

  it('never invent a load rating for an unrated lifting family', () => {
    for (const e of LIFTING) {
      const text = [
        e.descriptionLong,
        e.descriptionShort,
        ...(e.faqs ?? []).map((f) => f.answer),
      ].join(' ')
      expect(text, e.sku).not.toMatch(/\bWLL\b|ratings/)
      expect(e.descriptionLong, e.sku).toMatch(
        /No load rating is published|publishes no breaking strengths/
      )
      expect(
        e.specs?.find((s) => s.label === 'Working load limit')?.value ?? 'Load rating on request',
        e.sku
      ).toBe('Load rating on request')
    }
  })

  it('carry no "Specification confirmed on quotation" placeholder', () => {
    for (const e of ALL) {
      const text = [e.descriptionLong, e.descriptionShort, e.seoDescription].join(' ')
      expect(text, e.sku).not.toMatch(/Specification confirmed on quotation/)
    }
  })

  it('lift the rewritten lifting pages over the gate on text alone', () => {
    // Today's counts for these families: one image, no brand, document or cross-reference.
    for (const e of LIFTING) {
      const s = textScore({
        descriptionShort: e.descriptionShort!,
        descriptionLong: e.descriptionLong!,
        faqCount: e.faqs!.length,
        specCount: e.specs!.length,
        crossReferences: 0,
        documents: 0,
        images: 1,
        brandId: null,
        categoryId: 'c',
        focusKeyword: 'kw',
        seoTitle: 'title',
        seoDescription: e.seoDescription!,
        weightKg: null,
        countryOfOrigin: null,
        mpn: null,
      })
      expect(s, e.sku).toBeGreaterThanOrEqual(30)
      expect(e.faqs!.length, e.sku).toBeGreaterThanOrEqual(5)
      expect(e.specs!.length, e.sku).toBeGreaterThanOrEqual(8)
    }
  })
})
