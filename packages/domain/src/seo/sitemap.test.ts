import { describe, it, expect } from 'vitest'
import { buildSitemapEntries, buildStaticEntries, entityUrl } from './sitemap'

describe('entityUrl', () => {
  it('uses URL_SEGMENTS for prefix-mapped entity types', () => {
    expect(entityUrl('https://example.com', 'product', 'foo')).toBe('https://example.com/p/foo')
    expect(entityUrl('https://example.com', 'category', 'bar')).toBe('https://example.com/c/bar')
    expect(entityUrl('https://example.com', 'brand', 'baz')).toBe('https://example.com/brands/baz')
  })

  it('puts cms_page slugs at the root', () => {
    expect(entityUrl('https://example.com', 'cms_page', 'about')).toBe('https://example.com/about')
  })

  it('strips trailing slash from origin', () => {
    expect(entityUrl('https://example.com/', 'product', 'foo')).toBe('https://example.com/p/foo')
  })
})

describe('buildSitemapEntries', () => {
  const origin = 'https://example.com'

  it('respects excludeFromSitemap and robotsIndex=false', () => {
    const entries = buildSitemapEntries(origin, 'product', [
      { slug: 'a' },
      { slug: 'b', excludeFromSitemap: true },
      { slug: 'c', robotsIndex: false },
      { slug: 'd', isPublished: false },
    ])
    expect(entries.map((e) => e.url)).toEqual(['https://example.com/p/a'])
  })

  it('honours per-entity priority and changeFrequency overrides', () => {
    const entries = buildSitemapEntries(origin, 'category', [
      { slug: 'foo', sitemapPriority: 0.9, sitemapChangeFreq: 'daily' },
      { slug: 'bar' },
    ])
    expect(entries[0]).toMatchObject({ priority: 0.9, changeFrequency: 'daily' })
    expect(entries[1]).toMatchObject({ priority: 0.7, changeFrequency: 'weekly' })
  })

  it('clamps priority into [0, 1]', () => {
    const [a, b] = buildSitemapEntries(origin, 'product', [
      { slug: 'x', sitemapPriority: 5 },
      { slug: 'y', sitemapPriority: -1 },
    ])
    expect(a?.priority).toBe(1)
    expect(b?.priority).toBe(0)
  })

  it('passes through lastModified when provided', () => {
    const date = new Date('2026-04-01T00:00:00Z')
    const [entry] = buildSitemapEntries(origin, 'blog_post', [{ slug: 'hello', lastModified: date }])
    expect(entry?.lastModified).toEqual(date)
  })
})

describe('buildStaticEntries', () => {
  it('maps the home path to bare origin', () => {
    const [home] = buildStaticEntries('https://example.com', [
      { path: '', priority: 1, changeFrequency: 'daily' },
    ])
    expect(home?.url).toBe('https://example.com')
  })
})
