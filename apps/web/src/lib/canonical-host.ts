/**
 * Public hostnames that serve this app but are not its address.
 *
 * `indus-hydraulics.vercel.app` is the project's default production alias.
 * Measured 2026-09-24, it answered every storefront path with a 200 — the
 * full site on a second host, no redirect and no `X-Robots-Tag` — and it
 * appears in the production request logs fetching `/sitemap.xml`. Each page
 * canonicalises to the real domain, so Google should fold the two together,
 * but every fetch it spends learning that is one it does not spend on the
 * 1,733 URLs it has discovered and never crawled.
 *
 * An explicit list, not a `*.vercel.app` pattern. The per-deployment and
 * per-branch hosts are previews: they sit behind Vercel's SSO wall with
 * `noindex` already, and a reviewer opening one must stay on it rather than be
 * bounced to production.
 */
export const NON_CANONICAL_HOSTS: readonly string[] = ['indus-hydraulics.vercel.app']

/**
 * Where a request on a non-canonical host should go, or null to serve it.
 *
 * Path and query are carried across untouched, so a crawler's fetch of any
 * URL lands on the same URL at the real address.
 */
export function canonicalHostRedirect(
  host: string | null,
  pathname: string,
  search: string,
  baseUrl: string,
): string | null {
  if (!host) return null
  const hostname = host.toLowerCase().replace(/:\d+$/, '')
  if (!NON_CANONICAL_HOSTS.includes(hostname)) return null
  return `${baseUrl.replace(/\/$/, '')}${pathname}${search}`
}
