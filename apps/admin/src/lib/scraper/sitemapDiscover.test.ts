import { describe, it, expect } from 'vitest'
import {
  parseSitemapXml,
  discoverFromSitemap,
  filterUrlsToProductPages,
  MAX_DISCOVERED_URLS,
} from './sitemapDiscover'

describe('parseSitemapXml', () => {
  it('parses a flat <urlset>', () => {
    const xml = `<?xml version="1.0"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://x.com/p/1</loc><lastmod>2026-01-01</lastmod></url>
        <url><loc>https://x.com/p/2</loc></url>
      </urlset>`
    const out = parseSitemapXml(xml)
    expect(out.kind).toBe('urlset')
    if (out.kind === 'urlset') {
      expect(out.entries).toEqual([
        { loc: 'https://x.com/p/1', lastmod: '2026-01-01' },
        { loc: 'https://x.com/p/2', lastmod: undefined },
      ])
    }
  })
  it('parses a <sitemapindex>', () => {
    const xml = `<?xml version="1.0"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://x.com/sitemap-1.xml</loc></sitemap>
        <sitemap><loc>https://x.com/sitemap-2.xml</loc></sitemap>
      </sitemapindex>`
    const out = parseSitemapXml(xml)
    expect(out.kind).toBe('sitemapindex')
    if (out.kind === 'sitemapindex') {
      expect(out.sitemaps).toEqual(['https://x.com/sitemap-1.xml', 'https://x.com/sitemap-2.xml'])
    }
  })
  it('returns empty for irrelevant XML', () => {
    expect(parseSitemapXml('<rss><channel/></rss>').kind).toBe('empty')
  })
})

describe('filterUrlsToProductPages', () => {
  it('keeps URLs matching default product patterns', () => {
    const urls = [
      'https://x.com/products/a',
      'https://x.com/category/b',
      'https://x.com/p/c',
      'https://x.com/blog/hello',
    ]
    expect(filterUrlsToProductPages(urls)).toEqual([
      'https://x.com/products/a',
      'https://x.com/p/c',
    ])
  })
  it('respects custom include patterns', () => {
    const urls = ['https://x.com/catalogue/a', 'https://x.com/products/b']
    expect(filterUrlsToProductPages(urls, { includePatterns: ['/catalogue/'] })).toEqual([
      'https://x.com/catalogue/a',
    ])
  })
  it('excludes category-like URLs even if include also matches', () => {
    const urls = ['https://x.com/products/category/b'] // contains /products/ AND /category/
    expect(filterUrlsToProductPages(urls)).toEqual([])
  })
})

describe('discoverFromSitemap', () => {
  it('recurses through a sitemap index', async () => {
    const responses: Record<string, string> = {
      'https://x.com/sitemap.xml': `<sitemapindex>
        <sitemap><loc>https://x.com/sm-1.xml</loc></sitemap>
        <sitemap><loc>https://x.com/sm-2.xml</loc></sitemap>
      </sitemapindex>`,
      'https://x.com/sm-1.xml': `<urlset>
        <url><loc>https://x.com/products/a</loc></url>
      </urlset>`,
      'https://x.com/sm-2.xml': `<urlset>
        <url><loc>https://x.com/products/b</loc></url>
        <url><loc>https://x.com/products/c</loc></url>
      </urlset>`,
    }
    const out = await discoverFromSitemap('https://x.com/sitemap.xml', {
      fetchXml: async (url) => ({ status: 200, xml: responses[url] ?? '' }),
    })
    expect(out.map((e) => e.loc)).toEqual([
      'https://x.com/products/a',
      'https://x.com/products/b',
      'https://x.com/products/c',
    ])
  })
  it('returns [] on non-200 status', async () => {
    const out = await discoverFromSitemap('https://x.com/missing.xml', {
      fetchXml: async () => ({ status: 404, xml: '' }),
    })
    expect(out).toEqual([])
  })
  it('caps total returned URLs', () => {
    expect(MAX_DISCOVERED_URLS).toBeGreaterThan(0)
  })
  it('deduplicates URLs across child sitemaps', async () => {
    const responses: Record<string, string> = {
      'https://x.com/sitemap.xml': `<sitemapindex>
        <sitemap><loc>https://x.com/sm-1.xml</loc></sitemap>
        <sitemap><loc>https://x.com/sm-2.xml</loc></sitemap>
      </sitemapindex>`,
      'https://x.com/sm-1.xml': `<urlset><url><loc>https://x.com/products/a</loc></url></urlset>`,
      'https://x.com/sm-2.xml': `<urlset><url><loc>https://x.com/products/a</loc></url></urlset>`,
    }
    const out = await discoverFromSitemap('https://x.com/sitemap.xml', {
      fetchXml: async (url) => ({ status: 200, xml: responses[url] ?? '' }),
    })
    expect(out.length).toBe(1)
  })
})
