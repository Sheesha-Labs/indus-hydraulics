import { describe, expect, it } from 'vitest'
import { BLOCKS, blockDef } from './catalogue'
import { emptyDesign, newBlock, normaliseProps } from './document'
import { PRESETS } from './presets'
import { recordKey, renderBlock, renderDesign, type DesignRenderContext, type ResolvedRecord } from './render'
import { BLOCK_CATEGORIES, type Props } from './types'

// Ported from Bazar (lib/newsletter/blocks/catalogue.test.ts) without the
// Arabic edition and the built-in templates, plus the defaults round-trip.

const img = (n: number) => ({ url: `https://cdn.example.com/${n}.jpg`, alt: `Photo ${n}`, mediaId: null })

const record: ResolvedRecord = {
  kind: 'product',
  id: 'p1',
  title: '2SN hydraulic hose',
  url: '/p/2sn-hose',
  imageUrl: 'https://cdn.example.com/hose.jpg',
}

const ctx = (): DesignRenderContext => ({
  siteUrl: 'https://indushydraulics.com',
  subject: 'Subject',
  brand: { legalName: 'Indus Hydraulics', addressLines: ['Dubai, United Arab Emirates'] },
  records: new Map([[recordKey('product', 'p1'), record]]),
  unsubscribeUrl: 'https://indushydraulics.com/newsletter/unsubscribe/tok',
  footerReason: 'You are receiving this because you subscribed to the Indus Hydraulics newsletter.',
})

/** Media every block can show, so the ones that draw nothing without a picture still draw. */
function withMedia(type: string, props: Props): Props {
  const out: Props = { ...props, image: img(1), photo: img(2), portrait: img(3) }
  if (type === 'gallery') out.items = [{ image: img(4), alt: 'a', link: '', caption: '' }, { image: img(5), alt: 'b', link: '', caption: '' }]
  if (type === 'image-grid') out.items = [{ image: img(6), alt: 'c', link: '', caption: 'Hose assembly' }, { image: img(7), alt: 'd', link: '', caption: '' }]
  if (type === 'records') out.records = { kind: 'product', ids: ['p1'], labels: ['2SN hose'], layout: 'grid' }
  return out
}

describe('block catalogue', () => {
  it('has unique types, known categories and a field for every default', () => {
    const types = BLOCKS.map((b) => b.type)
    expect(new Set(types).size).toBe(types.length)
    for (const def of BLOCKS) {
      expect(BLOCK_CATEGORIES, def.type).toContain(def.category)
      expect(Object.keys(def.defaults).sort(), def.type).toEqual(def.fields.map((f) => f.key).sort())
    }
  })

  it('features live records only from the records block and the offer card', () => {
    const records = BLOCKS.filter((b) => b.fields.some((f) => f.kind === 'records'))
    expect(records.map((b) => b.type).sort()).toEqual(['offer', 'records'])
    expect(blockDef('records')?.category).toBe('From the site')
  })

  it('resolves Bazar’s underscore spellings to the same block', () => {
    expect(blockDef('cta_band')?.type).toBe('cta-band')
    expect(blockDef('image_text')?.type).toBe('image-text')
    expect(blockDef('key_values')?.type).toBe('key-values')
    expect(blockDef('nope')).toBeUndefined()
  })

  it('keeps every block’s defaults unchanged through normaliseProps', () => {
    for (const def of BLOCKS) expect(normaliseProps(def, structuredClone(def.defaults)), def.type).toEqual(def.defaults)
  })

  it('renders every block with its defaults without throwing', () => {
    for (const def of BLOCKS) {
      const block = newBlock(def.type)
      expect(() => renderBlock(block, ctx()), def.type).not.toThrow()
      expect(renderDesign({ ...emptyDesign(), blocks: [block] }, ctx()).html, def.type).toContain('</html>')
    }
  })

  it('draws every block as a non-empty row once it has its pictures and records', () => {
    for (const def of BLOCKS) {
      const html = renderBlock(newBlock(def.type, withMedia(def.type, {})), ctx())
      expect(html, def.type).toMatch(/^<tr>[\s\S]*<\/tr>$/)
    }
  })

  it('draws only blocks that need a picture or a record as nothing on bare defaults', () => {
    const empty = BLOCKS.filter((def) => renderBlock(newBlock(def.type), ctx()) === '').map((d) => d.type)
    expect(empty.sort()).toEqual(['gallery', 'image', 'image-grid', 'records'])
  })
})

describe('presets', () => {
  it('has a preset for every block, and every preset names a real block', () => {
    for (const def of BLOCKS) expect(PRESETS.some((p) => p.type === def.type), def.type).toBe(true)
    for (const p of PRESETS) expect(blockDef(p.type), p.id).toBeDefined()
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(PRESETS.length)
  })

  it('only sets keys its block defines', () => {
    for (const p of PRESETS) {
      const keys = new Set(blockDef(p.type)?.fields.map((f) => f.key))
      for (const k of Object.keys(p.props)) expect(keys.has(k), `${p.id}.${k}`).toBe(true)
    }
  })

  it('renders every preset without throwing, with the legal footer', () => {
    for (const p of PRESETS) {
      const design = { ...emptyDesign(), blocks: [newBlock(p.type, withMedia(p.type, p.props))] }
      const out = renderDesign(design, ctx())
      expect(out.html, p.id).toContain('<!DOCTYPE html>')
      expect(out.html, p.id).toContain('Unsubscribe')
      expect(out.text, p.id).toContain('Unsubscribe: https://indushydraulics.com/newsletter/unsubscribe/tok')
    }
  })

  it('draws ==marked== words in the block’s highlight colour, and drops the marks from the text part', () => {
    const block = newBlock('heading', { heading: 'Repaired. ==Certified.==', highlightColor: '#6d9fc2', caps: true })
    const html = renderBlock(block, ctx())
    expect(html).toContain('<span style="color:#6d9fc2">Certified.</span>')
    expect(html).toContain('text-transform:uppercase')
    expect(html).not.toContain('==')
    const out = renderDesign({ ...emptyDesign(), blocks: [block] }, ctx())
    expect(out.text).toContain('Repaired. Certified.')
  })

  it('draws records as alternating rows with a button each, and as tiles ending in the “view all” tile', () => {
    const rows = renderBlock(newBlock('records', { records: { kind: 'product', ids: ['p1'], labels: ['x'], layout: 'rows' }, itemLabel: 'Discover', buttonLabel: '' }), ctx())
    expect(rows).toContain('Discover')
    expect(rows).toContain('https://indushydraulics.com/p/2sn-hose')
    const tiles = renderBlock(newBlock('records', { records: { kind: 'product', ids: ['p1'], labels: ['x'], layout: 'tiles' }, buttonLabel: 'And many more', buttonUrl: '/c' }), ctx())
    expect(tiles).toContain('And many more')
    expect(tiles).toContain('Discover &rarr;')
    // The "view all" link is the last tile, not a second button under the tiles.
    expect(tiles.match(/href="https:\/\/indushydraulics.com\/c"/g)?.length).toBe(2)
  })

  it('uses the white logo on dark bands and falls back to the name without one', () => {
    const mast = newBlock('masthead', { logo: 'brand-light', watermark: 'Product news' })
    expect(renderBlock(mast, { ...ctx(), brand: { legalName: 'Indus Hydraulics', addressLines: [], logoOnDarkUrl: 'https://cdn.example.com/white.png' } })).toContain(
      'src="https://cdn.example.com/white.png"',
    )
    const plain = renderBlock(mast, ctx())
    expect(plain).toContain('Indus Hydraulics')
    // The faint word is a solid blend of white into navy, not opacity.
    expect(plain).toMatch(/aria-hidden="true"[^>]*color:#[0-9a-f]{6}">Product news/)
  })
})
