import { describe, expect, it } from 'vitest'
import {
  asLogoStyle,
  buildIconMetadata,
  DEFAULT_LOGO_STYLE,
  resolveSearchIcon,
  resolveTabIcon,
  searchIconUrl,
  tabIconUrl,
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

describe('resolveTabIcon', () => {
  const BASE = 'https://indushydraulics.com'

  /** The mirror of resolveSearchIcon: the file authored for the tab wins. */
  it('prefers the favicon, then the search mark, then the header logo', () => {
    expect(
      resolveTabIcon(
        {
          searchLogoUrl: 'https://cdn.test/search.png',
          faviconUrl: 'https://cdn.test/favicon.png',
          logoUrl: 'https://cdn.test/logo.png',
        },
        BASE,
      ),
    ).toBe('https://cdn.test/favicon.png')
    expect(
      resolveTabIcon(
        { searchLogoUrl: 'https://cdn.test/search.png', faviconUrl: null, logoUrl: 'https://cdn.test/logo.png' },
        BASE,
      ),
    ).toBe('https://cdn.test/search.png')
    expect(
      resolveTabIcon({ searchLogoUrl: null, faviconUrl: null, logoUrl: 'https://cdn.test/logo.png' }, BASE),
    ).toBe('https://cdn.test/logo.png')
  })

  it('is null when the operator has uploaded nothing', () => {
    expect(resolveTabIcon({ searchLogoUrl: null, faviconUrl: null, logoUrl: null }, BASE)).toBeNull()
  })
})

describe('tabIconUrl', () => {
  const BASE = 'https://indushydraulics.com'
  const STABLE = 'https://indushydraulics.com/tab-icon.png'

  /**
   * The reason the tab link stopped pointing at storage: Google reads every
   * `rel="icon"`, storage answers `x-robots-tag: none`, and the storage key
   * changes on every re-upload.
   */
  it('is this site\u2019s own route whichever field is set', () => {
    expect(
      tabIconUrl({ searchLogoUrl: null, faviconUrl: 'https://xyz.supabase.co/f.png', logoUrl: null }, BASE),
    ).toBe(STABLE)
    expect(
      tabIconUrl({ searchLogoUrl: 'https://xyz.supabase.co/s.png', faviconUrl: null, logoUrl: null }, BASE),
    ).toBe(STABLE)
    expect(tabIconUrl({ searchLogoUrl: null, faviconUrl: null, logoUrl: '/brand/mark.png' }, `${BASE}/`)).toBe(
      STABLE,
    )
  })

  it('is null when there is nothing behind it to serve', () => {
    expect(tabIconUrl({ searchLogoUrl: null, faviconUrl: null, logoUrl: null }, BASE)).toBeNull()
  })
})

describe('buildIconMetadata', () => {
  const BASE = 'https://indushydraulics.com'
  const SEARCH = 'https://indushydraulics.com/brand-icon.png'
  const TAB = 'https://indushydraulics.com/tab-icon.png'
  const NONE = { searchLogoUrl: null, faviconUrl: null, logoUrl: null }

  it('is undefined when the operator has uploaded nothing', () => {
    expect(buildIconMetadata(NONE, BASE)).toBeUndefined()
  })

  /**
   * The regression this file exists to hold: NO href in the emitted head may
   * be a storage URL. Google reads every `rel="icon"`, and storage answers
   * every public object with `x-robots-tag: none` — a mark the crawler has
   * been told to ignore — at a key that changes on each re-upload.
   */
  it('emits no storage URL anywhere, whichever files are uploaded', () => {
    for (const urls of [
      {
        searchLogoUrl: 'https://xyz.supabase.co/storage/search.png',
        faviconUrl: 'https://xyz.supabase.co/storage/favicon.png',
        logoUrl: 'https://xyz.supabase.co/storage/logo.png',
      },
      { searchLogoUrl: null, faviconUrl: 'https://xyz.supabase.co/storage/favicon.png', logoUrl: null },
      { searchLogoUrl: 'https://xyz.supabase.co/storage/search.png', faviconUrl: null, logoUrl: null },
      { searchLogoUrl: null, faviconUrl: null, logoUrl: 'https://xyz.supabase.co/storage/logo.png' },
    ]) {
      expect(JSON.stringify(buildIconMetadata(urls, BASE))).not.toContain('supabase.co')
    }
  })

  /**
   * Two sized links, not one: two `rel="icon"` tags that both omit `sizes` is
   * an ambiguity a crawler has to break for itself, two that declare different
   * sizes is the documented way to offer both a tab mark and a result mark.
   */
  it('emits the tab route unsized and the search route at 192px', () => {
    const icons = buildIconMetadata(
      {
        searchLogoUrl: 'https://xyz.supabase.co/storage/search.png',
        faviconUrl: 'https://xyz.supabase.co/storage/favicon.png',
        logoUrl: null,
      },
      BASE,
    )
    expect(icons?.icon).toEqual([
      { url: TAB, type: 'image/png' },
      { url: SEARCH, sizes: '192x192', type: 'image/png' },
    ])
    expect(icons?.shortcut).toBe(TAB)
    expect(icons?.apple).toBe(SEARCH)
  })

  /**
   * One uploaded file has to light up both links: the two chains fall back to
   * each other, so the routes serve the same bytes rather than one of them
   * 307-ing to the bundled ICO while the head claims a brand mark.
   */
  it('emits both links when the operator uploaded only a favicon', () => {
    const icons = buildIconMetadata(
      { searchLogoUrl: null, faviconUrl: 'https://xyz.supabase.co/storage/favicon.png', logoUrl: null },
      BASE,
    )
    expect(icons?.icon).toEqual([
      { url: TAB, type: 'image/png' },
      { url: SEARCH, sizes: '192x192', type: 'image/png' },
    ])
    expect(icons?.shortcut).toBe(TAB)
    expect(icons?.apple).toBe(SEARCH)
  })

  it('emits both links when the operator uploaded only a search mark', () => {
    const icons = buildIconMetadata(
      { searchLogoUrl: '/brand/mark.png', faviconUrl: null, logoUrl: null },
      BASE,
    )
    expect(icons?.icon).toEqual([
      { url: TAB, type: 'image/png' },
      { url: SEARCH, sizes: '192x192', type: 'image/png' },
    ])
    expect(icons?.apple).toBe(SEARCH)
  })
})
