import type { Metadata } from 'next'

/**
 * Admin surface layout.
 *
 * Two jobs, both load-bearing:
 *
 * 1. `robots: 'noindex, nofollow'`. This used to be a ROOT-layout export in
 *    the standalone admin app. On a shared root it would apply to the entire
 *    public storefront — an inversion, not merely a loss. Declared here it
 *    covers /admin and every descendant: Next resolves metadata root -> page
 *    and shallow-merges field by field, and no admin page sets `robots` in
 *    its own export (verified across all 134 admin files).
 *
 *    It is one of three independent layers, because metadata alone is a soft
 *    guarantee: the others are `Disallow: /admin` in robots.ts and an
 *    `X-Robots-Tag` response header set in proxy.ts, which survives even if
 *    someone overrides this export later.
 *
 * 2. `data-surface="admin"`. Carries the denser admin type scale — see the
 *    [data-surface='admin'] block in globals.css. font-size and line-height
 *    are inherited, so setting them on this wrapper cascades through the
 *    whole admin subtree without touching <body>, which the storefront owns.
 */
export const metadata: Metadata = {
  title: {
    default: 'Indus Hydraulics Admin',
    template: '%s | Admin',
  },
  robots: 'noindex, nofollow',
}

export default function AdminSurfaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-surface="admin" className="flex-1 min-h-0">
      {children}
    </div>
  )
}
