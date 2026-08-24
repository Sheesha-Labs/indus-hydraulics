import { describe, expect, it } from 'vitest'
import { DEFAULT_DISALLOW, FACET_DISALLOW, STATIC_SITEMAP_PATHS, isDisallowed, sitemapPathsBlockedByRobots } from './crawl-policy'

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

describe('FACET_DISALLOW', () => {
  /**
   * The rule these tests exist to protect: filter and sort URLs are blocked,
   * pagination is not. An earlier draft of this change used `/c/*?`, which
   * would have blocked pagination too — and 513 of the 1,480 active products
   * are reachable only through pagination.
   */
  const matches = (pattern: string, url: string): boolean => {
    const re = new RegExp(
      '^' + pattern.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*'),
    )
    return re.test(url)
  }
  const blocked = (url: string) => FACET_DISALLOW.some((p) => matches(p, url))

  it('blocks brand facet URLs', () => {
    expect(blocked('/c/hydraulic-hoses?brands=parker')).toBe(true)
    expect(blocked('/c/hydraulic-hoses?page=2&brands=parker')).toBe(true)
  })

  it('blocks sort URLs', () => {
    expect(blocked('/c/hydraulic-hoses?sort=price')).toBe(true)
  })

  it('does NOT block pagination', () => {
    // 513 products are reachable only this way. Blocking it would orphan them.
    expect(blocked('/c/hydraulic-hoses?page=2')).toBe(false)
    expect(blocked('/c/hydraulic-hoses?page=12')).toBe(false)
  })

  it('does NOT block clean category or product URLs', () => {
    expect(blocked('/c/hydraulic-hoses')).toBe(false)
    expect(blocked('/p/r12-four-spiral-high-pressure-hose')).toBe(false)
  })

  it('leaves every static sitemap path crawlable', () => {
    // Same invariant DEFAULT_DISALLOW is held to: nothing we submit may be
    // blocked. None of these carry a query string, but assert it rather than
    // assume it — that contradiction has shipped here once already.
    const blockedPaths = STATIC_SITEMAP_PATHS.filter((p) => blocked(p.path)).map((p) => p.path)
    expect(blockedPaths).toEqual([])
  })

  it('is kept out of DEFAULT_DISALLOW', () => {
    // DEFAULT_DISALLOW entries are prefixes compared with startsWith; these
    // are wildcard patterns. Mixing them breaks isDisallowed silently.
    for (const pattern of FACET_DISALLOW) {
      expect(DEFAULT_DISALLOW).not.toContain(pattern)
    }
  })
})
