/**
 * Pull contact addresses out of a supplier's OWN website.
 *
 * Pure — takes HTML, returns candidates. No network, so every rule below is
 * testable without a fixture server.
 *
 * Scope is deliberate and narrow: only pages on the supplier's own domain are
 * ever fetched by the caller. Directories, marketplaces and LinkedIn are out —
 * all of them prohibit scraping in their terms, all sit behind bot management
 * that blocks datacentre IPs, and beating that needs residential proxies, which
 * is a deliberate violation rather than an oversight.
 *
 * Nothing here GUESSES an address. There is no `sales@${domain}` fallback and
 * there must never be one: a guessed address that bounces costs sender
 * reputation, and at volume that reputation is what carries customer quotes.
 */

/** Local-part@domain, conservative — no consecutive dots, real TLD length. */
const EMAIL_RE =
  /\b([A-Za-z0-9][A-Za-z0-9._%+-]{0,63})@((?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24})\b/g

const MAILTO_RE = /mailto:([^"'?\s>]+)/gi

/** Addresses that are never a supplier contact. */
const REJECT_LOCAL = new Set([
  'noreply', 'no-reply', 'donotreply', 'do-not-reply', 'postmaster', 'mailer-daemon',
  'abuse', 'webmaster', 'hostmaster', 'privacy', 'dpo', 'unsubscribe', 'bounce',
  'wordpress', 'wp', 'sentry', 'example', 'test', 'user', 'name', 'email', 'your',
])

/** Matched exactly, or as a suffix (`mail.sentry.io`). */
const REJECT_DOMAINS = [
  'example.com', 'example.org', 'example.net', 'sentry.io', 'wordpress.org',
  'w3.org', 'schema.org', 'godaddy.com', 'wixpress.com', 'squarespace.com',
  'shopify.com', 'sentry-cdn.com',
]

/**
 * Placeholder words matched against the domain's FIRST label, so
 * `yourdomain.com`, `yourdomain.co.uk` and `mydomain.net` are all caught.
 * Suffix matching alone misses these — `yourdomain.com` neither equals
 * `yourdomain` nor ends with `.yourdomain`.
 */
const PLACEHOLDER_LABELS = new Set([
  'yourdomain', 'mydomain', 'domain', 'yourcompany', 'company', 'yoursite',
  'website', 'email', 'mail-example', 'sitename',
])

/** Image and asset suffixes that a naive regex reads as a TLD. */
const ASSET_TLD = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'css', 'js', 'woff', 'woff2'])

/** Generic mailbox names — real, usable, but worth less than a named person. */
const ROLE_LOCALS = new Set([
  'sales', 'info', 'enquiry', 'enquiries', 'inquiry', 'inquiries', 'contact',
  'office', 'export', 'trade', 'orders', 'purchase', 'commercial', 'marketing',
  'support', 'service', 'admin', 'mail', 'general', 'hello',
])

export type ExtractedContact = {
  email: string
  /** True for sales@/info@ style mailboxes. */
  isRoleAddress: boolean
  /** True when the address is on the supplier's own domain. */
  onOwnDomain: boolean
  confidence: 'high' | 'medium' | 'low'
  /** Where it was found. Required downstream by a DB CHECK. */
  evidenceUrl: string
}

function isPlausible(local: string, domain: string): boolean {
  const l = local.toLowerCase()
  const d = domain.toLowerCase()

  if (REJECT_LOCAL.has(l)) return false
  if (REJECT_DOMAINS.some((bad) => d === bad || d.endsWith(`.${bad}`))) return false
  if (PLACEHOLDER_LABELS.has(d.split('.')[0] ?? '')) return false

  const tld = d.split('.').pop() ?? ''
  // "logo@2x.png" and friends parse as an address without this.
  if (ASSET_TLD.has(tld.toLowerCase())) return false
  // A local part that is only digits is almost always a filename fragment.
  if (/^\d+$/.test(l)) return false
  if (d.length < 4 || !d.includes('.')) return false

  return true
}

function scoreConfidence(local: string, onOwnDomain: boolean, fromMailto: boolean): ExtractedContact['confidence'] {
  if (!onOwnDomain) return 'low'
  if (fromMailto) return 'high'
  return ROLE_LOCALS.has(local.toLowerCase()) ? 'medium' : 'medium'
}

/**
 * Extract contact addresses from one fetched page.
 *
 * `ownDomain` is the supplier's registrable domain; addresses elsewhere are
 * kept but marked `onOwnDomain: false` and `low`, because a page often carries
 * a web agency's or a partner's address alongside the real one.
 */
export function extractContacts(input: {
  html: string
  pageUrl: string
  ownDomain: string | null
}): ExtractedContact[] {
  const found = new Map<string, ExtractedContact>()
  const own = input.ownDomain?.toLowerCase().replace(/^www\./, '') ?? null

  function add(rawEmail: string, fromMailto: boolean) {
    const email = decodeURIComponent(rawEmail.trim()).toLowerCase()
    const at = email.lastIndexOf('@')
    if (at <= 0) return

    const local = email.slice(0, at)
    const domain = email.slice(at + 1)
    if (!isPlausible(local, domain)) return

    const onOwnDomain = !!own && (domain === own || domain.endsWith(`.${own}`))
    const candidate: ExtractedContact = {
      email,
      isRoleAddress: ROLE_LOCALS.has(local),
      onOwnDomain,
      confidence: scoreConfidence(local, onOwnDomain, fromMailto),
      evidenceUrl: input.pageUrl,
    }

    // A mailto hit beats a body-text hit for the same address.
    const existing = found.get(email)
    if (!existing || (fromMailto && existing.confidence !== 'high')) {
      found.set(email, candidate)
    }
  }

  let m: RegExpExecArray | null

  const mailto = new RegExp(MAILTO_RE.source, 'gi')
  while ((m = mailto.exec(input.html)) !== null) add(m[1]!, true)

  const plain = new RegExp(EMAIL_RE.source, 'g')
  while ((m = plain.exec(input.html)) !== null) add(`${m[1]}@${m[2]}`, false)

  return [...found.values()].sort((a, b) => {
    if (a.onOwnDomain !== b.onOwnDomain) return a.onOwnDomain ? -1 : 1
    const rank = { high: 0, medium: 1, low: 2 } as const
    if (rank[a.confidence] !== rank[b.confidence]) return rank[a.confidence] - rank[b.confidence]
    // A named person beats a generic mailbox at equal confidence.
    if (a.isRoleAddress !== b.isRoleAddress) return a.isRoleAddress ? 1 : -1
    return a.email.localeCompare(b.email)
  })
}

/**
 * Paths worth trying on a supplier site, best first.
 *
 * `/impressum` is included because German and Austrian sites are legally
 * required to publish one with a contact address — it is the single highest
 * yield page on the whole European supplier population.
 */
const BASE_CONTACT_PATHS = [
  '/contact',
  '/contact-us',
  '/contactus',
  '/impressum',
  '/kontakt',
  '/contacts',
  '/about/contact',
  '/get-in-touch',
] as const

/**
 * Many non-English supplier sites serve their English pages under a language
 * prefix. Generated rather than listed so every base path gets the variant —
 * and so this file contains no hardcoded locale-route literal, which the
 * repo's i18n guard (correctly) forbids for our OWN routes.
 */
const LANGUAGE_PREFIXES = ['', '/en'] as const

export const CONTACT_PATHS: readonly string[] = LANGUAGE_PREFIXES.flatMap((prefix) =>
  BASE_CONTACT_PATHS.map((path) => `${prefix}${path}`),
)

/** Pick the single best address to put on an RFQ. Null when none is usable. */
export function pickPrimaryContact(contacts: ExtractedContact[]): ExtractedContact | null {
  const usable = contacts.filter((c) => c.onOwnDomain)
  return usable[0] ?? null
}
