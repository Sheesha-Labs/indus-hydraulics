import { describe, expect, it } from 'vitest'
import { BLOCKS } from './catalogue'
import { DEFAULT_SETTINGS, emptyDesign, newBlock } from './document'
import { recordKey, renderBlock, renderDesign, renderShell, type DesignRenderContext, type ResolvedRecord } from './render'
import { RECORD_LAYOUTS, type Design } from './types'

const SITE = 'https://indushydraulics.com'
const UNSUB = `${SITE}/newsletter/unsubscribe/tok123`
const REASON = 'You are receiving this because you subscribed to the Indus Hydraulics newsletter.'

const records: ResolvedRecord[] = [
  { kind: 'product', id: 'p1', title: '2SN hydraulic hose', subtitle: 'Two-wire braid', meta: 'IH-2SN-08', url: '/p/2sn-hose', imageUrl: 'https://cdn.example.com/hose.jpg', imageAlt: 'Coil of 2SN hose' },
  { kind: 'product', id: 'p2', title: 'JIC female swivel', url: `${SITE}/p/jic-swivel`, imageUrl: null },
  { kind: 'article', id: 'a1', title: 'How to read a hose layline', url: '/blog/hose-layline' },
]

const ctx = (over: Partial<DesignRenderContext> = {}): DesignRenderContext => ({
  siteUrl: SITE,
  subject: 'November update',
  preheader: 'New hose and fittings in stock',
  brand: { legalName: 'Indus Hydraulics', addressLines: ['Warehouse 1', 'Dubai, United Arab Emirates'] },
  records: new Map(records.map((r) => [recordKey(r.kind, r.id), r])),
  unsubscribeUrl: UNSUB,
  footerReason: REASON,
  ...over,
})

const design = (...blocks: Design['blocks']): Design => ({ ...emptyDesign(), blocks })

describe('renderDesign document', () => {
  it('is a full email document with the subject, preheader and a 600px column', () => {
    const { html } = renderDesign(design(newBlock('text')), ctx())
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<meta name="viewport"')
    expect(html).toContain('<title>November update</title>')
    expect(html).toMatch(/display:none[^>]*>New hose and fittings in stock</)
    expect(html).toContain('max-width:600px')
    expect(html).not.toMatch(/<style|<script|<link/i)
  })

  it('escapes the subject and preheader', () => {
    const { html } = renderDesign(emptyDesign(), ctx({ subject: '<b>x</b>', preheader: '"><img src=x>' }))
    expect(html).toContain('<title>&lt;b&gt;x&lt;/b&gt;</title>')
    expect(html).not.toContain('"><img src=x>')
  })
})

describe('legal footer', () => {
  const designs: [string, unknown][] = [
    ['empty', emptyDesign()],
    ['junk', 'not a design'],
    ['every block', design(...BLOCKS.map((b) => newBlock(b.type)))],
  ]

  it.each(designs)('is in the html and the text of the %s design', (_name, d) => {
    const out = renderDesign(d, ctx())
    expect(out.html).toContain('Indus Hydraulics')
    expect(out.html).toContain('Warehouse 1<br>Dubai, United Arab Emirates')
    expect(out.html).toContain(REASON)
    expect(out.html).toContain(`<a href="${UNSUB}"`)
    expect(out.html).toMatch(/>Unsubscribe<\/a>/)
    expect(out.text).toContain('Indus Hydraulics\nWarehouse 1\nDubai, United Arab Emirates')
    expect(out.text).toContain(REASON)
    expect(out.text).toContain(`Unsubscribe: ${UNSUB}`)
  })

  it('comes after every block', () => {
    const { html, text } = renderDesign(design(newBlock('text', { text: 'Last words' })), ctx())
    expect(html.indexOf('Last words')).toBeLessThan(html.indexOf(REASON))
    expect(text.indexOf('Last words')).toBeLessThan(text.indexOf(REASON))
  })

  it('links to "#" with the same text in a preview (no unsubscribe URL)', () => {
    const out = renderDesign(emptyDesign(), ctx({ unsubscribeUrl: null }))
    expect(out.html).toContain('<a href="#" style="color:#ffffff;text-decoration:underline;">Unsubscribe</a>')
    expect(out.text).toContain('Unsubscribe: #')
    expect(out.html).not.toContain('tok123')
  })

  it('escapes the legal name, address and reason', () => {
    const out = renderDesign(emptyDesign(), ctx({ brand: { legalName: '<i>Co</i>', addressLines: ['<b>'] }, footerReason: '<script>x</script>' }))
    expect(out.html).not.toMatch(/<i>Co|<b>|<script>/)
    expect(out.html).toContain('&lt;script&gt;x&lt;/script&gt;')
  })
})

describe('renderShell', () => {
  it('wraps inner html verbatim in the document, with the footer and unsubscribe link', () => {
    const inner = { html: '<p style="padding:0 32px">Rich <em>text</em> body</p>', text: 'Rich text body' }
    const out = renderShell(inner, DEFAULT_SETTINGS, ctx())
    expect(out.html).toContain(inner.html)
    expect(out.html).toContain('<!DOCTYPE html>')
    expect(out.html).toContain(REASON)
    expect(out.html).toContain(`<a href="${UNSUB}"`)
    expect(out.html.indexOf(inner.html)).toBeLessThan(out.html.indexOf(REASON))
    expect(out.text.startsWith('Rich text body\n\n--')).toBe(true)
    expect(out.text).toContain(`Unsubscribe: ${UNSUB}`)
  })

  it('is what renderDesign draws through', () => {
    const out = renderDesign(design(newBlock('heading', { heading: 'Same shell' })), ctx())
    const shell = renderShell({ html: '', text: '' }, DEFAULT_SETTINGS, ctx())
    // Same chrome either side of the content: everything before the content cell, and the footer onwards.
    const cell = '<tr><td style="padding:0;'
    const footer = '<tr><td bgcolor="#122942"'
    expect(out.html.slice(0, out.html.indexOf(cell))).toBe(shell.html.slice(0, shell.html.indexOf(cell)))
    expect(out.html.slice(out.html.indexOf(footer))).toBe(shell.html.slice(shell.html.indexOf(footer)))
    expect(out.html.slice(out.html.indexOf(cell), out.html.indexOf(footer))).toContain('Same shell')
  })
})

describe('escaping', () => {
  it('escapes a script in a heading, in the html', () => {
    const { html, text } = renderDesign(design(newBlock('heading', { heading: '<script>alert(1)</script>' })), ctx())
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(text).toContain('<script>alert(1)</script>')
  })

  it('escapes an attribute-breaking alt', () => {
    const evil = '"><img onerror=x>'
    const { html } = renderDesign(design(newBlock('image', { image: { url: 'https://cdn.example.com/a.jpg' }, alt: evil })), ctx())
    expect(html).not.toContain(evil)
    expect(html).not.toContain('<img onerror')
    expect(html).toContain('alt="&quot;&gt;&lt;img onerror=x&gt;"')
  })

  it('never emits raw HTML from a textarea, and keeps paragraphs and line breaks', () => {
    const { html } = renderDesign(design(newBlock('text', { text: '<b>one</b>\nline two\n\n**para** two' })), ctx())
    expect(html).not.toContain('<b>one</b>')
    expect(html).toContain('&lt;b&gt;one&lt;/b&gt;<br>line two</p>')
    expect(html).toMatch(/<p [^>]*><strong>para<\/strong> two<\/p>/)
  })
})

describe('links', () => {
  const bad = ['javascript:alert(1)', 'data:text/html;base64,PHNjcmlwdD4=', '//evil.com', 'vbscript:x']

  it.each(bad)('never emits %s as an href, anywhere a link can go', (url) => {
    const d = design(
      newBlock('button', { label: 'Go', url }),
      newBlock('text', { text: `See [this](${url})` }),
      newBlock('image', { image: { url: 'https://cdn.example.com/a.jpg' }, alt: 'A', link: url }),
      newBlock('social', { items: [{ network: 'website', url }] }),
      newBlock('contact', { links: [{ label: 'L', url }] }),
      newBlock('cta-band', { primaryUrl: url, secondaryUrl: url }),
    )
    const { html, text } = renderDesign(d, ctx())
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1])
    for (const h of hrefs) expect(h).not.toMatch(/^(javascript|data|vbscript):|^\/\//i)
    expect(html).not.toMatch(/href="(javascript|data|vbscript):/i)
    expect(text).not.toContain(`: ${url}`)
  })

  it('makes a site path absolute', () => {
    const { html, text } = renderDesign(design(newBlock('button', { label: 'Hoses', url: '/c/hoses' })), ctx())
    expect(html).toContain('href="https://indushydraulics.com/c/hoses"')
    expect(text).toContain('Hoses: https://indushydraulics.com/c/hoses')
  })

  it('keeps mailto, tel and https, and fills the known tokens', () => {
    const d = design(
      newBlock('text', { text: '[Mail](mailto:sales@indushydraulics.com) [Call](tel:+97140000000) [Blog]({{site_url}}/blog) [Leave]({{unsubscribe_url}})' }),
    )
    const { html } = renderDesign(d, ctx())
    expect(html).toContain('href="mailto:sales@indushydraulics.com"')
    expect(html).toContain('href="tel:+97140000000"')
    expect(html).toContain('href="https://indushydraulics.com/blog"')
    expect(html).toContain(`href="${UNSUB}"`)
  })

  it('draws an unusable link as plain text', () => {
    const { html } = renderDesign(design(newBlock('text', { text: 'See [our page](vbscript:x) now' })), ctx())
    expect(html).toContain('See our page now')
  })
})

describe('images', () => {
  it('loads only https or site images, always with an alt and a fluid width', () => {
    const d = design(
      newBlock('image', { image: { url: 'https://cdn.example.com/a.jpg', alt: 'From the library' } }),
      newBlock('image', { image: { url: '/media/b.jpg' }, alt: 'Site photo' }),
    )
    const { html } = renderDesign(d, ctx())
    const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0])
    expect(imgs).toHaveLength(2)
    for (const tag of imgs) {
      expect(tag).toMatch(/ alt="[^"]+"/)
      expect(tag).toContain('max-width:')
      expect(tag).toMatch(/src="https:\/\//)
    }
    expect(html).toContain('src="https://indushydraulics.com/media/b.jpg"')
    expect(html).toContain('alt="From the library"')
  })

  it('draws an image block with no usable picture as nothing', () => {
    expect(renderBlock(newBlock('image', { image: { url: 'http://insecure/x.jpg' } }), ctx())).toBe('')
  })
})

describe('records block', () => {
  const block = (layout: string, ids = ['p1', 'missing', 'p2']) =>
    newBlock('records', { heading: 'New in stock', records: { kind: 'product', ids, labels: ids.map(() => ''), layout } })

  it.each(RECORD_LAYOUTS)('draws resolved records with their urls in the %s layout, skipping missing ids', (layout) => {
    const { html, text } = renderDesign(design(block(layout)), ctx())
    expect(html).toContain('New in stock')
    expect(html).toContain('2SN hydraulic hose')
    expect(html).toContain('JIC female swivel')
    expect(html).toContain('href="https://indushydraulics.com/p/2sn-hose"')
    expect(html).toContain('href="https://indushydraulics.com/p/jic-swivel"')
    expect(html).toContain('alt="Coil of 2SN hose"')
    expect(html).not.toContain('missing')
    expect(text).toContain('2SN hydraulic hose — Two-wire braid\nhttps://indushydraulics.com/p/2sn-hose')
    expect(text).toContain('JIC female swivel\nhttps://indushydraulics.com/p/jic-swivel')
    expect(html.indexOf('2SN hydraulic hose')).toBeLessThan(html.indexOf('JIC female swivel'))
  })

  it('reads only records of its own kind', () => {
    const { html } = renderDesign(design(newBlock('records', { records: { kind: 'article', ids: ['p1', 'a1'], labels: [], layout: 'list' } })), ctx())
    expect(html).toContain('How to read a hose layline')
    expect(html).not.toContain('2SN hydraulic hose')
  })

  it('leaves the whole block out when none of its records resolve', () => {
    expect(renderBlock(block('grid', ['gone']), ctx())).toBe('')
    expect(renderBlock(newBlock('records'), ctx())).toBe('')
  })

  it('draws the "view all" button under the records', () => {
    const { html, text } = renderDesign(design(block('list')), ctx())
    expect(html).toContain('View the catalogue')
    expect(text).toContain('View the catalogue: https://indushydraulics.com/c')
  })
})

describe('text alternative', () => {
  it('carries headings, prose and links as "label: url"', () => {
    const d = design(newBlock('heading', { heading: 'This month' }), newBlock('text', { text: 'Read [the guide](/blog/x).' }), newBlock('button'))
    const { text } = renderDesign(d, ctx())
    expect(text).toContain('This month')
    expect(text).toContain('Read the guide: https://indushydraulics.com/blog/x.')
    expect(text).toContain('Request a quote: https://indushydraulics.com/contact')
    expect(text).not.toMatch(/<[a-z]/i)
  })
})
