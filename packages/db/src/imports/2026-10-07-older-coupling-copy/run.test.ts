import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe as group, expect, it } from 'vitest'

import {
  describe,
  endsAnswer,
  li,
  MARK,
  seoDescription,
  shortDescription,
  sizeBlocks,
  TEMPLATE_PHRASES,
  type Current,
  type Family,
  type Listing,
} from './run'

const payload = JSON.parse(
  readFileSync(join(__dirname, '../../../data/older-coupling-copy/payload.json'), 'utf8')
) as { families: Record<string, Family>; howToOrder: string; listings: Record<string, Listing> }

const TEMPLATE = `<p>The <strong>X</strong> is a Storz Coupling / Adapter from the Sunpool (Taiwan) industrial coupling range.</p>
<ul>
<li><strong>Coupling family:</strong> Storz Coupling / Adapter</li>
<li><strong>Coupling type:</strong> Storz Coupling &amp; Adapter — X</li>
<li><strong>End A:</strong> Coupling face — standard</li>
</ul>
<ul>
<li><strong>Size range:</strong> 1"–6"</li>
<li><strong>Material:</strong> Forged Aluminum: 6061 T6</li>
<li><strong>Working pressure:</strong> Not published by Sunpool.</li>
</ul>
<h3>Family context</h3>
<p>Storz couplings are…</p>
<!-- sunpool-sizes:start --><h3>Sunpool sizes</h3><!-- sunpool-sizes:end -->`

const current = (html: string): Current => ({
  title: 'AL Storz Adapter-Female Thread',
  brand: 'sunpool',
  family: li(html, 'Coupling family')!,
  type: li(html, 'Coupling type')!,
  size: li(html, 'Size range')!,
  material: li(html, 'Material', 'Materials available')!,
  pressure: li(html, 'Working pressure')!,
  blocks: sizeBlocks(html),
})

group('the description it builds', () => {
  const l = payload.listings['IH-STZ-STORZ-ADAPTER-FEMALE-THREAD']!
  const f = payload.families[l.family]!
  const html = describe(current(TEMPLATE), l, f, payload.howToOrder)

  it('keeps the corrected lines and the size block verbatim', () => {
    expect(html.startsWith(MARK)).toBe(true)
    expect(html).toContain('<li><strong>Size range:</strong> 1"–6"</li>')
    expect(html).toContain('<li><strong>Material:</strong> Forged Aluminum: 6061 T6</li>')
    expect(html).toContain('<li><strong>Working pressure:</strong> Not published by Sunpool.</li>')
    expect(html).toContain('Storz Coupling &amp; Adapter — X')
    expect(
      html.endsWith('<!-- sunpool-sizes:start --><h3>Sunpool sizes</h3><!-- sunpool-sizes:end -->')
    ).toBe(true)
  })

  it('drops the template and links the family guide', () => {
    for (const phrase of TEMPLATE_PHRASES) expect(html).not.toContain(phrase)
    expect(html).not.toContain('Family context')
    expect(html).toContain('<a href="/blog/storz-coupling-sizes">')
  })

  it('rebuilds to the same page from its own output', () => {
    expect(describe(current(html), l, f, payload.howToOrder)).toBe(html)
  })
})

group('short and SEO descriptions', () => {
  it('name one brand, and keep the SEO line within 160 characters', () => {
    for (const [sku, l] of Object.entries(payload.listings)) {
      const c: Current = {
        title: sku,
        brand: sku.startsWith('IH-STZ') || sku.startsWith('IH-KC') ? 'sunpool' : 'sealfast',
        family: 'F',
        type: 'T',
        size: '1"–4"',
        material: 'Aluminum',
        pressure: 'P',
        blocks: [],
      }
      expect(shortDescription(c, l)).not.toContain('Sealfast / Sunpool')
      expect(seoDescription(c, l).length).toBeLessThanOrEqual(160)
    }
  })
})

group('the payload', () => {
  it('covers 108 listings, each with a family it defines', () => {
    const listings = Object.entries(payload.listings)
    expect(listings).toHaveLength(108)
    for (const [, l] of listings) expect(payload.families[l.family]).toBeDefined()
  })

  it('writes no template phrase into any line', () => {
    const texts = [
      ...Object.values(payload.families).flatMap((f) => [f.about, f.selection]),
      ...Object.values(payload.listings).flatMap((l) =>
        [l.what, l.endA, l.endB, l.seal, l.standard, l.size, l.pressure, ...l.notes].filter(Boolean)
      ),
    ] as string[]
    for (const t of texts) for (const phrase of TEMPLATE_PHRASES) expect(t).not.toContain(phrase)
  })

  it('answers the ends question only when there are ends', () => {
    expect(endsAnswer({ ...payload.listings['IH-KC-FRAC-WATER']! })).toBeNull()
    expect(endsAnswer(payload.listings['IH-BC-FLANGE-FEMALE']!)).toBe(
      'End A: Bauer-type female. End B: ASA (ASME) Class 150 flange.'
    )
  })
})
