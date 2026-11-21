/**
 * The real client address, for rate limiting.
 *
 * Copied from apps/web/src/lib/request-origin.ts (Ops may not import apps/web).
 * Order matters:
 *   1. `cf-connecting-ip` — set by Cloudflare, cannot be forged through it.
 *   2. `x-real-ip` — set by the platform from the peer address.
 *   3. the LAST entry of `x-forwarded-for`, never the first: the first is
 *      whatever the client sent; the last is what our own edge appended.
 */
export function clientIp(h: Headers): string {
  const cf = h.get('cf-connecting-ip')?.trim()
  if (cf) return cf

  const real = h.get('x-real-ip')?.trim()
  if (real) return real

  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    const hops = forwarded
      .split(',')
      .map((hop) => hop.trim())
      .filter(Boolean)
    const last = hops[hops.length - 1]
    if (last) return last
  }
  return 'unknown'
}
