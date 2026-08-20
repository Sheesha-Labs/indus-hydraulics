import { describe, expect, it } from 'vitest'
import {
  asLogoStyle,
  buildIconMetadata,
  DEFAULT_LOGO_STYLE,
  resolveSearchIcon,
  searchIconUrl,
} from './brand-identity'

describe('asLogoStyle', () => {
  it('passes through the two styles the header can render', () => {
    expect(asLogoStyle('logo_only')).toBe('logo_only')
    expect(asLogoStyle('mark_and_name')).toBe('mark_and_name')
  })

  /**
   * The column is a plain text column with a CHECK constraint, not a Postgres
   * enum, so a value written around the app has to degrade to something the
   * header has a branch for. Falling through to the default means the logo
   * still draws; returning the raw string would render nothing at all.
   */
  it('falls back to the default for anything else', () => {
    expect(asLogoStyle('wordmark')).toBe(DEFAULT_LOGO_STYLE)
    expect(asLogoStyle('')).toBe(DEFAULT_LOGO_STYLE)
    expect(asLogoStyle(null)).toBe(DEFAULT_LOGO_STYLE)
    expect(asLogoStyle(undefined)).toBe(DEFAULT_LOGO_STYLE)
  })
})

describe('resolveSearchIcon', () => {
  const BASE = 'https://indushydraulics.com'

  it('prefers the search logo when one is set', () => {
    expect(
      resolveSearchIcon(
        {
          searchLogoUrl: 'https://cdn.test/search.png',
          faviconUrl: 'https://cdn.test/favicon.png',
          logoUrl: 'https://cdn.test/logo.png',
        },
        BASE,
      ),
    ).toBe('https://cdn.test/search.png')
  })

  it('falls back to the favicon, then the header logo', () => {
    expect(
      resolveSearchIcon(
        {
          searchLogoUrl: null,
          faviconUrl: 'https://cdn.test/favicon.png',
          logoUrl: 'https://cdn.test/logo.png',
        },
        BASE,
      ),
    ).toBe('https://cdn.test/favicon.png')

    expect(
      resolveSearchIcon(
        { searchLogoUrl: null, faviconUrl: null, logoUrl: 'https://cdn.test/logo.png' },
        BASE,
      ),
    ).toBe('https://cdn.test/logo.png')
  })

  /**
   * Null rather than a bare base URL: the caller uses null to mean "emit no
   * icon link at all", so the head stays byte-identical to what it was before
   * any of these fields existed.
   */
  it('is null when nothing at all is set', () => {
    expect(resolveSearchIcon({ searchLogoUrl: null, faviconUrl: null, logoUrl: null }, BASE)).toBeNull()
  })

  /**
   * Structured data and icon links are read by crawlers with no page context
   * to resolve a relative path against, so a same-origin path has to be
   * absolutised. A relative logo in the Organization block is one of the ways
   * a result row ends up with a blank generic mark.
   */
  it('absolutises a same-origin path', () => {
    expect(
      resolveSearchIcon({ searchLogoUrl: '/brand/mark.png', faviconUrl: null, logoUrl: null }, BASE),
    ).toBe('https://indushydraulics.com/brand/mark.png')
  })

  it('does not double the slash when the base URL carries a trailing one', () => {
    expect(
      resolveSearchIcon(
        { searchLogoUrl: '/brand/mark.png', faviconUrl: null, logoUrl: null },
        'https://indushydraulics.com/',
      ),
    ).toBe('https://indushydraulics.com/brand/mark.png')
  })

  it('leaves an absolute URL alone', () => {
    expect(
      resolveSearchIcon(
        { searchLogoUrl: 'https://xyz.supabase.co/storage/v1/object/public/x.png', faviconUrl: null, logoUrl: null },
        BASE,
      ),
    ).toBe('https://xyz.supabase.co/storage/v1/object/public/x.png')
  })
})

describe('searchIconUrl', () => {
  const BASE = 'https://indushydraulics.com'

  /**
   * The point of the indirection: whatever the operator uploaded, crawlers are
   * pointed at this app's own route. Supabase Storage answers every public
   * object with `x-robots-tag: none`, so a storage URL here is a mark Google
   * is told not to index.
   */
  it('is this site\u2019s own icon route whichever field is set', () => {
    const stable = 'https://indushydraulics.com/brand-icon.png'
    expect(
      searchIconUrl(
        { searchLogoUrl: 'https://xyz.supabase.co/storage/mark.png', faviconUrl: null, logoUrl: null },
        BASE,
      ),
    ).toBe(stable)
    expect(
      searchIconUrl({ searchLogoUrl: null, faviconUrl: 'https://xyz.supabase.co/f.png', logoUrl: null }, BASE),
    ).toBe(stable)
    expect(
      searchIconUrl({ searchLogoUrl: null, faviconUrl: null, logoUrl: 'https://xyz.supabase.co/l.png' }, BASE),
    ).toBe(stable)
  })

  it('is null when there is nothing behind it to serve', () => {
    expect(searchIconUrl({ searchLogoUrl: null, faviconUrl: null, logoUrl: null }, BASE)).toBeNull()
  })

  it('does not double the slash on a base URL with a trailing one', () => {
    expect(
      searchIconUrl({ searchLogoUrl: '/brand/mark.png', faviconUrl: null, logoUrl: null }, `${BASE}/`),
    ).toBe('https://indushydraulics.com/brand-icon.png')
  })
})

describe('buildIconMetadata', () => {
  const BASE = 'https://indushydraulics.com'
  const STABLE = 'https://indushydraulics.com/brand-icon.png'
  const NONE = { searchLogoUrl: null, faviconUrl: null, logoUrl: null }

  it('is undefined when the operator has uploaded nothing', () => {
    expect(buildIconMetadata(NONE, BASE)).toBeUndefined()
  })

  /**
   * Two links by design. The tab favicon keeps the storage URL — browsers do
   * not read `x-robots-tag`, and a URL that changes on re-upload busts their
   * cache, which is what you want there. The sized entry is the one Google
   * reads, so it goes through the crawlable route.
   */
  it('emits the uploaded favicon for the tab and the crawlable route for search', () => {
    const icons = buildIconMetadata(
      {
        searchLogoUrl: 'https://xyz.supabase.co/storage/search.png',
        faviconUrl: 'https://xyz.supabase.co/storage/favicon.png',
        logoUrl: null,
      },
      BASE,
    )
    expect(icons?.icon).toEqual([
      { url: 'https://xyz.supabase.co/storage/favicon.png' },
      { url: STABLE, sizes: '192x192' },
    ])
    expect(icons?.shortcut).toBe('https://xyz.supabase.co/storage/favicon.png')
    expect(icons?.apple).toBe(STABLE)
  })

  /**
   * Regression guard for the bug this replaced: with only a favicon set, the
   * search entry used to resolve back to the same storage URL and collapse to
   * one link — leaving Google with nothing but a noindexed file.
   */
  it('still emits a sized crawlable entry when only the favicon is set', () => {
    const icons = buildIconMetadata(
      { searchLogoUrl: null, faviconUrl: 'https://xyz.supabase.co/storage/favicon.png', logoUrl: null },
      BASE,
    )
    expect(icons?.icon).toEqual([
      { url: 'https://xyz.supabase.co/storage/favicon.png' },
      { url: STABLE, sizes: '192x192' },
    ])
    expect(icons?.apple).toBe(STABLE)
  })

  it('serves search and apple from the route even with no favicon uploaded', () => {
    const icons = buildIconMetadata(
      { searchLogoUrl: '/brand/mark.png', faviconUrl: null, logoUrl: null },
      BASE,
    )
    expect(icons?.icon).toEqual([{ url: STABLE, sizes: '192x192' }])
    expect(icons?.apple).toBe(STABLE)
    // No favicon uploaded, so nothing claims the unsized slot and the browser
    // still has /favicon.ico to fall back to.
    expect(icons?.shortcut).toBeUndefined()
  })
})
