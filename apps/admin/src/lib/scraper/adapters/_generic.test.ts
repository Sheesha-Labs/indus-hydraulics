import { describe, it, expect } from 'vitest'
import { parseGenericProductPage } from './_generic'

const PAGE = 'https://example.com/products/a10vso'

describe('parseGenericProductPage — JSON-LD path', () => {
  it('extracts title, sku, brand, description, images from JSON-LD Product', () => {
    const html = `<!doctype html><html><head>
      <script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'A10VSO Axial Piston Pump',
        sku: 'A10VSO-71',
        description: 'High-pressure axial piston pump.',
        brand: { '@type': 'Brand', name: 'Bosch Rexroth' },
        image: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg'],
      })}</script></head><body></body></html>`
    const draft = parseGenericProductPage(html, PAGE)
    expect(draft.title).toBe('A10VSO Axial Piston Pump')
    expect(draft.sku).toBe('A10VSO-71')
    expect(draft.brandText).toBe('Bosch Rexroth')
    expect(draft.description).toBe('High-pressure axial piston pump.')
    expect(draft.candidateImages.map((c) => c.url)).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg',
    ])
  })

  it('finds Product nested in @graph', () => {
    const html = `<!doctype html><html><head>
      <script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'BreadcrumbList', itemListElement: [] },
          { '@type': 'Product', name: 'Nested Product', image: 'https://cdn.example.com/x.jpg' },
        ],
      })}</script></head><body></body></html>`
    const draft = parseGenericProductPage(html, PAGE)
    expect(draft.title).toBe('Nested Product')
    expect(draft.candidateImages[0]?.url).toBe('https://cdn.example.com/x.jpg')
  })

  it('handles image as an ImageObject', () => {
    const html = `<!doctype html><html><head>
      <script type="application/ld+json">${JSON.stringify({
        '@type': 'Product',
        name: 'IO',
        image: { '@type': 'ImageObject', url: 'https://cdn.example.com/o.jpg' },
      })}</script></head><body></body></html>`
    const draft = parseGenericProductPage(html, PAGE)
    expect(draft.candidateImages[0]?.url).toBe('https://cdn.example.com/o.jpg')
  })

  it('tolerates broken JSON-LD and falls back to OG tags', () => {
    const html = `<!doctype html><html><head>
      <script type="application/ld+json">{ not valid json }</script>
      <meta property="og:title" content="OG Fallback">
      <meta property="og:description" content="From OG">
      <meta property="og:image" content="https://cdn.example.com/og.jpg">
    </head><body></body></html>`
    const draft = parseGenericProductPage(html, PAGE)
    expect(draft.title).toBe('OG Fallback')
    expect(draft.description).toBe('From OG')
    expect(draft.candidateImages.map((c) => c.url)).toContain('https://cdn.example.com/og.jpg')
  })
})

describe('parseGenericProductPage — OG / generic fallback', () => {
  it('uses og:title when no JSON-LD', () => {
    const html = `<!doctype html><html><head>
      <meta property="og:title" content="OG Only">
    </head><body></body></html>`
    expect(parseGenericProductPage(html, PAGE).title).toBe('OG Only')
  })

  it('falls back to <title> when no og:title', () => {
    const html = `<!doctype html><html><head><title>Title Only</title></head><body></body></html>`
    expect(parseGenericProductPage(html, PAGE).title).toBe('Title Only')
  })

  it('scans <img> tags in the body and resolves relative URLs', () => {
    const html = `<!doctype html><html><head><title>T</title></head><body>
      <img src="/img/a.jpg" alt="A" width="800" height="600">
      <img src="/img/b.jpg" alt="B" width="800" height="600">
    </body></html>`
    const draft = parseGenericProductPage(html, PAGE)
    expect(draft.candidateImages.map((c) => c.url)).toEqual([
      'https://example.com/img/a.jpg',
      'https://example.com/img/b.jpg',
    ])
  })

  it('does not duplicate images present in both JSON-LD and <img> tags', () => {
    const html = `<!doctype html><html><head>
      <script type="application/ld+json">${JSON.stringify({
        '@type': 'Product',
        name: 'X',
        image: ['https://cdn.example.com/a.jpg'],
      })}</script>
    </head><body>
      <img src="https://cdn.example.com/a.jpg" width="800" height="600">
      <img src="https://cdn.example.com/b.jpg" width="800" height="600">
    </body></html>`
    const draft = parseGenericProductPage(html, PAGE)
    expect(draft.candidateImages.map((c) => c.url)).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg',
    ])
  })

  it('extracts categoryText from breadcrumb nav', () => {
    const html = `<!doctype html><html><head><title>T</title></head><body>
      <nav class="breadcrumbs">
        <a href="/">Home</a>
        <a href="/c/pumps">Pumps</a>
        <a href="/c/pumps/axial">Axial Piston</a>
      </nav>
    </body></html>`
    expect(parseGenericProductPage(html, PAGE).categoryText).toBe('Axial Piston')
  })

  it('assigns ascending positions to images', () => {
    const html = `<!doctype html><html><head><title>T</title></head><body>
      <img src="/a.jpg" width="600" height="600">
      <img src="/b.jpg" width="600" height="600">
      <img src="/c.jpg" width="600" height="600">
    </body></html>`
    const draft = parseGenericProductPage(html, PAGE)
    expect(draft.candidateImages.map((c) => c.position)).toEqual([0, 1, 2])
  })
})
