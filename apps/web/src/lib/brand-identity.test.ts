import { describe, expect, it } from 'vitest'
import { asLogoStyle, DEFAULT_LOGO_STYLE, resolveSearchIcon } from './brand-identity'

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
