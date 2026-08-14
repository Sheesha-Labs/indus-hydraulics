/**
 * Query parameters that carry a bearer credential and must never leave the
 * origin in an analytics payload.
 *
 * `token` is the quote-access token: HMAC-signed, 60-day TTL, and on its own
 * sufficient to read a customer's pricing, terms and contact details at
 * /quote/[code] and to download the quote PDF — no sign-in required. Every
 * visit to such a link was shipping the full URL to PostHog as `$current_url`,
 * i.e. an active third-party disclosure of a live credential.
 *
 * `preview` is the product-preview token: shorter-lived (15 minutes) and lower
 * impact, but it unhides draft products, so it is scrubbed too.
 */
const SENSITIVE_PARAMS = ['token', 'preview'] as const

/**
 * Build the analytics URL for a route, with credential-bearing parameters
 * removed. Retains the other parameters — `q`, `page`, `sort` and the utm_*
 * family are the ones analytics actually exists to measure.
 */
export function scrubUrl(pathname: string, searchParams: URLSearchParams | null | undefined): string {
  if (!searchParams) return pathname

  const cleaned = new URLSearchParams(searchParams)
  for (const param of SENSITIVE_PARAMS) cleaned.delete(param)

  const search = cleaned.toString()
  return search ? `${pathname}?${search}` : pathname
}
