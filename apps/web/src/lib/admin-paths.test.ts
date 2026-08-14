import { describe, expect, test } from 'vitest'
import { deriveCrumbs } from '../components/admin/admin-routes'
import { ADMIN_PREFIX, adminPath, isAdminPath, stripAdminPrefix } from './admin-paths'

describe('stripAdminPrefix', () => {
  test('the prefix root becomes /', () => {
    expect(stripAdminPrefix('/admin')).toBe('/')
  })

  test('nested paths lose the prefix', () => {
    expect(stripAdminPrefix('/admin/products')).toBe('/products')
    expect(stripAdminPrefix('/admin/seo/search/queries')).toBe('/seo/search/queries')
    expect(stripAdminPrefix('/admin/rfqs/RFQ-2026-0001')).toBe('/rfqs/RFQ-2026-0001')
  })

  test('is segment-safe', () => {
    // A naive startsWith('/admin') would maul these.
    expect(stripAdminPrefix('/administrator')).toBe('/administrator')
    expect(stripAdminPrefix('/admin-tools')).toBe('/admin-tools')
  })

  test('leaves non-admin paths alone, so it is safe to apply unconditionally', () => {
    expect(stripAdminPrefix('/products')).toBe('/products')
    expect(stripAdminPrefix('/')).toBe('/')
  })

  test('the first segment after stripping is the section key the UI expects', () => {
    // This is the property the breadcrumb/sidebar/tab components depend on.
    // Without the strip it would be the literal 'admin' on every route.
    const section = (p: string) => stripAdminPrefix(p).split('/').filter(Boolean)[0]
    expect(section('/admin/products/abc/edit')).toBe('products')
    expect(section('/admin/seo/redirects')).toBe('seo')
    expect(section('/admin')).toBeUndefined()
  })
})

describe('adminPath', () => {
  test('prefixes absolute paths', () => {
    expect(adminPath('/products')).toBe('/admin/products')
    expect(adminPath('/')).toBe('/admin')
  })

  test('tolerates a missing leading slash', () => {
    expect(adminPath('products')).toBe('/admin/products')
  })

  test('round-trips with stripAdminPrefix', () => {
    for (const p of ['/', '/products', '/seo/search/queries', '/rfqs/RFQ-1']) {
      expect(stripAdminPrefix(adminPath(p))).toBe(p)
    }
  })
})

describe('isAdminPath', () => {
  test('matches the prefix and its descendants only', () => {
    expect(isAdminPath(ADMIN_PREFIX)).toBe(true)
    expect(isAdminPath('/admin/products')).toBe(true)
    expect(isAdminPath('/administrator')).toBe(false)
    expect(isAdminPath('/products')).toBe(false)
    expect(isAdminPath('/')).toBe(false)
  })
})

describe('deriveCrumbs under the /admin prefix', () => {
  // The highest-risk silent breakage in the move: deriveCrumbs reads
  // segments[0] as the section key. Un-stripped, that is always the literal
  // 'admin', which is in no ROUTE_LABELS entry — so every trail on every page
  // would collapse to one "Admin" crumb, with no error anywhere.
  test('the dashboard is a single Dashboard crumb', () => {
    expect(deriveCrumbs('/admin').map((c) => c.label)).toEqual(['Dashboard'])
  })

  test('a section root names its section, not "Admin"', () => {
    const labels = deriveCrumbs('/admin/products').map((c) => c.label)
    expect(labels).not.toEqual(['Admin'])
    expect(labels.length).toBeGreaterThan(1)
  })

  test('a nested route produces a trail, and its link is /admin-prefixed', () => {
    const crumbs = deriveCrumbs('/admin/seo/search/queries')
    expect(crumbs.length).toBeGreaterThan(2)
    for (const c of crumbs) {
      if (c.href) expect(c.href.startsWith('/admin')).toBe(true)
    }
  })

  test('id-like segments are still skipped', () => {
    const withId = deriveCrumbs('/admin/products/8f14e45f-ceea-467a-9a3d-1b2c3d4e5f60/edit')
    expect(withId.some((c) => c.label.includes('8f14e45f'))).toBe(false)
  })
})
