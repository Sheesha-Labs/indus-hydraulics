import { BASE_URL } from './seo'

/**
 * Where the site lives, and who is asking — derived safely.
 *
 * Both answers used to come from forwarded headers. On Vercel that was safe
 * because the edge overwrote them before the function ever saw them. Behind our
 * own reverse proxy and Cloudflare they are attacker-controlled unless the proxy
 * is configured exactly right, and "unless the proxy is configured exactly
 * right" is not a security boundary.
 */

/**
 * The origin to put in an emailed link.
 *
 * Always the configured base URL, never the request's own Host. A staff
 * password-reset link built from `x-forwarded-host` is a password-reset link
 * pointed wherever the requester asked — send one to a real staff address and
 * the token travels to the attacker's host. The old helper preferred the header
 * and only fell back to `NEXT_PUBLIC_BASE_URL`; this inverts that.
 *
 * The cost is that links on a preview or a custom domain now point at the
 * canonical host, which is the correct trade for a credential-bearing URL.
 */
export function linkOrigin(): string {
  return BASE_URL
}

/**
 * The real client address, for rate limiting and IP hashing.
 *
 * Order matters and is the whole point:
 *
 *   1. `cf-connecting-ip` — set by Cloudflare, cannot be forged through it.
 *   2. `x-real-ip` — set by our own reverse proxy from the peer address.
 *   3. the LAST entry of `x-forwarded-for` — never the first.
 *
 * XFF is append-only: each proxy adds the address it saw. The FIRST entry is
 * whatever the original client sent, so a caller can put anything there and get
 * a fresh rate-limit bucket per request. The last entry is the one our own
 * infrastructure appended. Reading the first is the bug this replaces.
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

  // No usable address. Callers rate-limit this bucket like any other, so a
  // proxy misconfiguration degrades to one shared limit rather than to none.
  return 'unknown'
}
