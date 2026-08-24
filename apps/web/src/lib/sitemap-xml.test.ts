import { describe, expect, it } from 'vitest'
import { renderSitemapIndex, renderUrlset } from './sitemap-xml'

describe('renderUrlset', () => {
  it('emits a valid urlset with the sitemaps.org namespace', () => {
    const xml = renderUrlset([{ url: 'https://x.test/a' }])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('<loc>https://x.test/a</loc>')
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
  })

  it('omits optional fields rather than emitting empty tags', () => {
    const xml = renderUrlset([{ url: 'https://x.test/a' }])
    expect(xml).not.toContain('<lastmod>')
    expect(xml).not.toContain('<changefreq>')
    expect(xml).not.toContain('<priority>')
  })

  it('emits lastmod, changefreq and priority when present', () => {
    const xml = renderUrlset([
      {
        url: 'https://x.test/a',
        lastModified: new Date('2026-08-24T10:00:00.000Z'),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ])
    expect(xml).toContain('<lastmod>2026-08-24T10:00:00.000Z</lastmod>')
    expect(xml).toContain('<changefreq>weekly</changefreq>')
    expect(xml).toContain('<priority>0.7</priority>')
  })

  it('drops an unparseable lastModified rather than emitting Invalid Date', () => {
    const xml = renderUrlset([{ url: 'https://x.test/a', lastModified: 'not-a-date' }])
    expect(xml).not.toContain('lastmod')
    expect(xml).not.toContain('Invalid')
  })

  it('escapes ampersands in URLs', () => {
    // No sitemap URL should carry a query string, but an unescaped & makes the
    // whole document invalid XML — Search Console rejects the file, not the row.
    const xml = renderUrlset([{ url: 'https://x.test/a?b=1&c=2' }])
    expect(xml).toContain('&amp;')
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/)
  })

  it('renders an empty section as a valid empty document', () => {
    const xml = renderUrlset([])
    expect(xml).toContain('<urlset')
    expect(xml).toContain('</urlset>')
    expect(xml).not.toContain('<url>')
  })
})

describe('renderSitemapIndex', () => {
  it('emits a sitemapindex, not a urlset', () => {
    const xml = renderSitemapIndex([{ url: 'https://x.test/sitemaps/products.xml' }])
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('<sitemap>')
    expect(xml).toContain('<loc>https://x.test/sitemaps/products.xml</loc>')
    expect(xml).not.toContain('<urlset')
    expect(xml).not.toContain('<url>')
  })

  it('carries lastmod per child when supplied', () => {
    const xml = renderSitemapIndex([
      { url: 'https://x.test/sitemaps/blog.xml', lastModified: new Date('2026-08-24T00:00:00.000Z') },
    ])
    expect(xml).toContain('<lastmod>2026-08-24T00:00:00.000Z</lastmod>')
  })
})
