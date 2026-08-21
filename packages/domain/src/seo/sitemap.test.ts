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

  // The root `loc` has to be byte-identical to what the home page renders in
  // `<link rel="canonical">` / `og:url`. That is the bare origin: the home
  // page sets `alternates.canonical = BASE_URL`, and `buildMetadata` strips a
  // trailing slash off any canonical it is handed, so no trailing-slash form
  // is reachable on the canonical side. A sitemap entry of
  // "https://example.com/" would therefore point at a page whose canonical
  // disagrees with it.
  //
  // Every other entry in the sitemap is likewise slash-free — `entityUrl`
  // ends on a slug and the other static paths end on a segment — so the bare
  // origin is the consistent spelling, not the outlier.
  it('emits the root without a trailing slash, matching the home canonical', () => {
    const [home] = buildStaticEntries('https://example.com', [
      { path: '', priority: 1, changeFrequency: 'weekly' },
    ])
    expect(home?.url).toBe('https://example.com')
    expect(home?.url.endsWith('/')).toBe(false)
  })

  it("treats '/' as the root and normalises it to the same bare origin", () => {
    const [slash] = buildStaticEntries('https://example.com', [
      { path: '/', priority: 1, changeFrequency: 'weekly' },
    ])
    expect(slash?.url).toBe('https://example.com')
  })

  it('strips a trailing slash from the origin before building the root', () => {
    const [home] = buildStaticEntries('https://example.com/', [
      { path: '', priority: 1, changeFrequency: 'weekly' },
    ])
    expect(home?.url).toBe('https://example.com')
  })

  it('leaves non-root paths untouched and slash-free', () => {
    const entries = buildStaticEntries('https://example.com', [
      { path: '', priority: 1, changeFrequency: 'weekly' },
      { path: '/c', priority: 0.8, changeFrequency: 'weekly' },
      { path: '/tools/dash-size-chart', priority: 0.6, changeFrequency: 'monthly' },
    ])
    expect(entries.map((e) => e.url)).toEqual([
      'https://example.com',
      'https://example.com/c',
      'https://example.com/tools/dash-size-chart',
    ])
    for (const entry of entries) {
      expect(entry.url.endsWith('/')).toBe(false)
    }
  })
})
