import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DISALLOW,
  isDisallowed,
  sitemapPathsBlockedByRobots,
  STATIC_SITEMAP_PATHS,
} from './crawl-policy'

describe('crawl policy', () => {
  /**
   * The regression this file exists for. /search shipped in the sitemap at
   * priority 0.4 while robots.txt disallowed it — found on 2026-08-21, the day
   * the sitemap was first submitted to Search Console. A sitemap entry for a
   * disallowed path is not a hedge; it is the site contradicting itself, and
   * Google reports it as a warning against the whole sitemap.
   */
  it('lists no sitemap path that robots.txt blocks', () => {
    expect(sitemapPathsBlockedByRobots()).toEqual([])
  })

  it('still keeps /search out of the index', () => {
    expect(DEFAULT_DISALLOW).toContain('/search')
    expect(STATIC_SITEMAP_PATHS.map((p) => p.path)).not.toContain('/search')
  })

  it('keeps the pages that earn their place in the sitemap', () => {
    const paths = STATIC_SITEMAP_PATHS.map((p) => p.path)
    // The home page, the catalogue index and the high-intent surfaces. If a
    // future edit drops one of these, that is a traffic loss, not a tidy-up.
    for (const kept of ['', '/c', '/blog', '/brands', '/services', '/tools', '/replacement']) {
      expect(paths).toContain(kept)
    }
  })

  /** robots.txt disallow rules are prefixes, not exact matches. */
  it('treats a disallow rule as covering everything beneath it', () => {
    expect(isDisallowed('/admin')).toBe(true)
    expect(isDisallowed('/admin/settings')).toBe(true)
    expect(isDisallowed('/account/profile')).toBe(true)
    expect(isDisallowed('/products')).toBe(false)
  })

  /**
   * The home page is '' and every rule starts with '/', so the naive
   * `startsWith` reading would be fine — but an empty-prefix rule added later
   * would silently blocklist the whole site. Pinned explicitly.
   */
  it('never reports the home page as blocked', () => {
    expect(isDisallowed('')).toBe(false)
    expect(isDisallowed('', ['', '/admin'])).toBe(false)
  })

  it('names the offending path when there is one, rather than just failing', () => {
    expect(sitemapPathsBlockedByRobots([{ path: '/compare', priority: 0.5, changeFrequency: 'weekly' }])).toEqual(
      ['/compare'],
    )
  })
})
