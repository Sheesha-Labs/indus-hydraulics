/**
 * The admin surface's URL prefix, and the helper for reading a pathname
 * relative to it.
 *
 * Every admin route now lives under `/admin`. Several components derive UI
 * state by splitting `usePathname()` and treating the first segment as the
 * section key — `deriveCrumbs` in `components/admin-routes.ts`, the sidebar's
 * active-item test, and the SEO / search / scraper tab navs. After the move
 * that first segment is always the literal `'admin'`, so those components
 * would keep rendering, keep type-checking, and quietly produce wrong output:
 * every breadcrumb trail collapsing to a single "Admin" crumb, no sidebar item
 * ever marked active. Silent, not loud — which is exactly why it goes through
 * one helper rather than ad-hoc slicing at five call sites.
 */
export const ADMIN_PREFIX = '/admin'

/**
 * Strip the `/admin` prefix from a pathname, yielding the path as the
 * pre-move code saw it. `/admin` itself becomes `/`.
 *
 * Segment-safe: `/administrator` is not under `/admin` and is returned
 * unchanged. A pathname that isn't under the prefix at all is also returned
 * unchanged, so this is safe to apply unconditionally.
 */
export function stripAdminPrefix(pathname: string): string {
  if (pathname === ADMIN_PREFIX) return '/'
  if (pathname.startsWith(`${ADMIN_PREFIX}/`)) return pathname.slice(ADMIN_PREFIX.length)
  return pathname
}

/** Prefix an admin-relative path. `adminPath('/products')` -> `/admin/products`. */
export function adminPath(path: string): string {
  if (path === '/') return ADMIN_PREFIX
  return path.startsWith('/') ? `${ADMIN_PREFIX}${path}` : `${ADMIN_PREFIX}/${path}`
}

/** True when a pathname belongs to the admin surface. */
export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)
}
