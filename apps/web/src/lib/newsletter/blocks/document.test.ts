import { BRAND } from '@indus/domain'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  MAX_BLOCKS,
  SETTINGS_FIELDS,
  emptyDesign,
  isUsableLink,
  linkSlots,
  newBlock,
  normaliseDesign,
  normaliseSettings,
  placeholderIn,
  recordRefs,
} from './document'

describe('normaliseDesign', () => {
  it('turns junk into an empty design, never throwing', () => {
    for (const junk of [null, undefined, 42, 'x', [], { blocks: 'no' }, { blocks: [null, 1, 'a', { type: 3 }] }]) {
      expect(normaliseDesign(junk)).toEqual(emptyDesign())
    }
  })

  it('drops unknown block types and keeps the rest in order', () => {
    const d = normaliseDesign({ blocks: [{ type: 'nope', props: {} }, { type: 'text', props: {} }, { type: 'spacer', props: {} }] })
    expect(d.blocks.map((b) => b.type)).toEqual(['text', 'spacer'])
  })

  it('caps the block count', () => {
    const d = normaliseDesign({ blocks: Array.from({ length: MAX_BLOCKS + 15 }, () => ({ type: 'spacer', props: {} })) })
    expect(d.blocks).toHaveLength(MAX_BLOCKS)
  })

  it('falls back on bad colours, clamps numbers, checks selects and caps text', () => {
    const d = normaliseDesign({
      settings: { headingColor: 'red', buttonColor: '#123ABC', headingFont: 'comic' },
      blocks: [
        { type: 'heading', id: 'a', props: { heading: 'x'.repeat(1000), textColor: 'javascript:alert(1)', size: 'huge' } },
        { type: 'hero', id: 'b', props: { overlayColor: 'navy', overlayOpacity: 500, logoWidth: '-4' } },
        { type: 'spacer', id: 'c', props: { height: 'tall', background: '#fff' } },
      ],
    })
    const [heading, hero, spacer] = d.blocks
    expect(heading?.props.heading).toHaveLength(300)
    expect(heading?.props.textColor).toBe('')
    expect(heading?.props.size).toBe('l')
    expect(hero?.props.overlayColor).toBe(BRAND.navy)
    expect(hero?.props.overlayOpacity).toBe(90)
    expect(hero?.props.logoWidth).toBe(60)
    expect(spacer?.props.height).toBe(32)
    expect(spacer?.props.background).toBe('')
    expect(d.settings.headingColor).toBe(DEFAULT_SETTINGS.headingColor)
    expect(d.settings.buttonColor).toBe('#123abc')
    expect(d.settings.headingFont).toBe('serif')
  })

  it('drops prop keys the block does not define, at the top and inside items', () => {
    const d = normaliseDesign({
      blocks: [{ type: 'list', props: { heading: 'H', onclick: 'x', text_ar: 'ع', items: [{ text: 'a', evil: '<b>' }] } }],
    })
    const props = d.blocks[0]?.props ?? {}
    expect(props).not.toHaveProperty('onclick')
    expect(props).not.toHaveProperty('text_ar')
    expect(props.items).toEqual([{ text: 'a' }])
  })

  it('keeps only https or site-relative images', () => {
    const d = normaliseDesign({
      blocks: [
        { type: 'image', props: { image: { url: 'http://insecure/x.png' } } },
        { type: 'image', props: { image: { url: 'javascript:alert(1)' } } },
        { type: 'image', props: { image: { url: '//evil.com/x.png' } } },
        { type: 'image', props: { image: { url: 'https://cdn.example.com/a.jpg', alt: 'A', mediaId: 'm_1', extra: 1 } } },
        { type: 'image', props: { image: { url: '/media/a.jpg' } } },
      ],
    })
    expect(d.blocks.map((b) => b.props.image)).toEqual([
      null,
      null,
      null,
      { url: 'https://cdn.example.com/a.jpg', alt: 'A', mediaId: 'm_1' },
      { url: '/media/a.jpg', alt: '', mediaId: null },
    ])
  })

  it('regenerates bad ids and de-duplicates repeated ones', () => {
    const d = normaliseDesign({
      blocks: [
        { type: 'spacer', id: 'a' },
        { type: 'spacer', id: 'a' },
        { type: 'spacer', id: '<script>' },
        { type: 'spacer' },
      ],
    })
    const ids = d.blocks.map((b) => b.id)
    expect(ids[0]).toBe('a')
    expect(new Set(ids).size).toBe(4)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]{1,40}$/i)
  })

  it('cleans records: known kind, safe unique ids, labels paired, layout defaulted', () => {
    const d = normaliseDesign({
      blocks: [
        { type: 'records', props: { records: { kind: 'product', ids: ['a', 'a', 'b c', 7, 'b'], labels: ['A', 'A2', 'bad', 'n', 'B'], layout: 'carousel' } } },
        { type: 'records', props: { records: { kind: 'property', ids: ['x'] } } },
      ],
    })
    expect(d.blocks[0]?.props.records).toEqual({ kind: 'product', ids: ['a', 'b'], labels: ['A', 'B'], layout: 'grid' })
    expect(d.blocks[1]?.props.records).toBeNull()
  })

  it('normalises settings on their own, tolerating junk', () => {
    expect(normaliseSettings('x')).toEqual(DEFAULT_SETTINGS)
    expect(normaliseSettings({ bodyFont: 'serif', textColor: ' #ABCDEF ' })).toEqual({ ...DEFAULT_SETTINGS, bodyFont: 'serif', textColor: '#abcdef' })
    expect(SETTINGS_FIELDS.map((f) => f.key).sort()).toEqual(Object.keys(DEFAULT_SETTINGS).sort())
  })
})

describe('newBlock', () => {
  it('lays props over the defaults, normalised', () => {
    const b = newBlock('heading', { heading: 'Hi', size: 'nope' })
    expect(b.props.heading).toBe('Hi')
    expect(b.props.size).toBe('l')
    expect(b.id).toMatch(/^[a-z0-9]{8}$/)
  })

  it('throws on an unknown type', () => {
    expect(() => newBlock('nope')).toThrow(/Unknown block type/)
  })
})

describe('recordRefs and linkSlots', () => {
  it('collects every records value with ids, in block order', () => {
    const design = {
      ...emptyDesign(),
      blocks: [
        newBlock('records', { records: { kind: 'product', ids: ['p1', 'p2'], labels: [], layout: 'grid' } }),
        newBlock('text'),
        newBlock('records', { records: { kind: 'article', ids: ['a1'], labels: ['A'], layout: 'list' } }),
        newBlock('records', { records: { kind: 'category', ids: [], labels: [], layout: 'list' } }),
        newBlock('records'),
      ],
    }
    expect(recordRefs(design)).toEqual([
      { kind: 'product', ids: ['p1', 'p2'] },
      { kind: 'article', ids: ['a1'] },
    ])
  })

  it('lists every filled link field with where it is', () => {
    const design = { ...emptyDesign(), blocks: [newBlock('button', { url: '/contact' }), newBlock('contact', { links: [{ label: 'A', url: 'javascript:x' }] })] }
    expect(linkSlots(design)).toEqual([
      { blockLabel: '1. Button', label: 'Link', value: '/contact' },
      { blockLabel: '2. Contact details', label: 'Link 1 › Link', value: 'javascript:x' },
    ])
  })
})

describe('isUsableLink', () => {
  it.each([
    ['https://indushydraulics.com/c/hoses', true],
    ['http://example.com', true],
    ['mailto:sales@indushydraulics.com', true],
    ['tel:+97140000000', true],
    ['/c/hydraulic-hoses', true],
    ['/', true],
    ['{{site_url}}/blog', true],
    ['', true],
    ['javascript:alert(1)', false],
    ['JavaScript:alert(1)', false],
    ['data:text/html;base64,PHNjcmlwdD4=', false],
    ['//evil.com', false],
    ['https://', false],
    ['https:///evil', false],
    ['www.example.com', false],
    ['c/hoses', false],
    ['https://example.com/a b', false],
    ['{{nope}}/x', false],
  ])('%s → %s', (value, expected) => {
    expect(isUsableLink(value)).toBe(expected)
  })
})

describe('placeholderIn', () => {
  it.each([
    ['[Your headline]', true],
    ['[Write the intro here]', true],
    ['Lorem ipsum dolor sit amet', true],
    ['TODO: add the price', true],
    ['Price: XXX AED', true],
    ['Hello {{first_name}}', true],
    ['{{ unknown }}', true],
    ['New in stock', false],
    ['See [our catalogue](/c) for more', false],
    ['Unsubscribe at {{unsubscribe_url}}', false],
    ['{{site_url}}/blog', false],
    ['Sizes [mm] in the table', false],
    ['todo list', false],
    ['', false],
  ])('%s → %s', (value, expected) => {
    expect(placeholderIn(value)).toBe(expected)
  })
})
