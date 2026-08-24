/**
 * The footer, as a piece of editable content.
 *
 * Everything here is pure — no Prisma, no React — so the admin editor, the
 * server action that saves it and the storefront that renders it all agree
 * about what a social platform is and what the legal line says, without any
 * of the three importing the other two.
 */

// ─── Social profiles ────────────────────────────────────────────────────────

/**
 * The networks we can draw a mark for. `other` is not a fallback for "we
 * forgot to add one" — it is the honest answer for a profile on something we
 * have no icon for, and it renders as a plain external-link glyph rather than
 * a wrong logo.
 *
 * Mirrors nothing in the database: `footer_socials.platform` is a TEXT column,
 * because a Postgres enum would need a migration to add a network and the set
 * moves faster than the schema. `isFooterSocialPlatform` is the guard.
 */
export const FOOTER_SOCIAL_PLATFORMS = [
  'linkedin',
  'instagram',
  'facebook',
  'x',
  'youtube',
  'whatsapp',
  'other',
] as const

export type FooterSocialPlatform = (typeof FOOTER_SOCIAL_PLATFORMS)[number]

export const FOOTER_SOCIAL_PLATFORM_LABELS: Record<FooterSocialPlatform, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  other: 'Other',
}

export function isFooterSocialPlatform(value: unknown): value is FooterSocialPlatform {
  return typeof value === 'string' && (FOOTER_SOCIAL_PLATFORMS as readonly string[]).includes(value)
}

/**
 * Read a stored platform back, tolerating anything. A row written before a
 * platform was removed from the list — or by hand in SQL — resolves to
 * `other` and still renders, rather than crashing the whole footer on one bad
 * string.
 */
export function asFooterSocialPlatform(value: unknown): FooterSocialPlatform {
  return isFooterSocialPlatform(value) ? value : 'other'
}

const PLATFORM_HOSTS: [FooterSocialPlatform, readonly string[]][] = [
  ['linkedin', ['linkedin.com', 'lnkd.in']],
  ['instagram', ['instagram.com', 'instagr.am']],
  ['facebook', ['facebook.com', 'fb.com', 'fb.me']],
  ['x', ['x.com', 'twitter.com', 't.co']],
  ['youtube', ['youtube.com', 'youtu.be']],
  ['whatsapp', ['whatsapp.com', 'wa.me']],
]

/**
 * A first guess at the platform from a pasted URL, used to pre-fill the select
 * when an editor adds a row. Only ever a default — the stored value wins,
 * which is what lets a vanity domain or a link shortener carry the right mark.
 *
 * Matches the registrable host and its subdomains (`www.linkedin.com`,
 * `uk.linkedin.com`) but not a host that merely ends with the same letters, so
 * `notlinkedin.com` does not read as LinkedIn.
 */
export function guessFooterSocialPlatform(href: string): FooterSocialPlatform {
  let host: string
  try {
    host = new URL(href).hostname.toLowerCase()
  } catch {
    return 'other'
  }
  for (const [platform, hosts] of PLATFORM_HOSTS) {
    if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) return platform
  }
  return 'other'
}

/**
 * A social href must be absolute http(s).
 *
 * Not merely a tidiness rule: these URLs are emitted as the Organization
 * JSON-LD's `sameAs`, whose whole job is to point a search engine at profiles
 * on OTHER domains. A relative href there resolves back to this site and tells
 * the crawler the company is the same entity as itself.
 */
export function isValidSocialHref(href: string): boolean {
  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// ─── The legal line ─────────────────────────────────────────────────────────

/**
 * The `{year}` placeholder an editor may type into the legal line. Substituted
 * at render time so the line does not go stale on 1 January — a footer reading
 * "© 2026" throughout 2027 is the single most common dead giveaway that a site
 * is unmaintained.
 */
export const FOOTER_LEGAL_YEAR_TOKEN = '{year}'

/**
 * Resolve the footer's bottom-bar line.
 *
 * The fallback exists because this column arrived long after the site did, and
 * an operator who never opens /admin/footer must still get a correct line. It
 * prefers `legalName` over the trading `name` — "Indus Hydraulic Power Trading
 * LLC" over "Indus Hydraulics" — because the sentence is a legal assertion of
 * ownership, and the entity is who owns it.
 *
 * What it deliberately does NOT do is append a company suffix. The hardcoded
 * line this replaces read `© {year} {name} Pvt. Ltd.` — an Indian suffix on a
 * UAE LLC, on every page — precisely because a suffix cannot be derived from a
 * trading name. If one is wanted, it is typed into `legalName` or into the
 * line itself, by someone who knows which one is true.
 */
export function resolveFooterLegalLine(input: {
  footerLegalLine: string | null
  legalName: string | null
  name: string
  year: number
}): string {
  const custom = input.footerLegalLine?.trim()
  if (custom) return custom.split(FOOTER_LEGAL_YEAR_TOKEN).join(String(input.year))
  const entity = input.legalName?.trim() || input.name
  return `© ${input.year} ${entity}. All rights reserved.`
}
