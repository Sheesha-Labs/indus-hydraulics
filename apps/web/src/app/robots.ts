import type { MetadataRoute } from 'next'
import { db } from '@indus/db'
import { BASE_URL } from '../lib/seo'
import { DEFAULT_DISALLOW } from '../lib/crawl-policy'

/**
 * Serves /robots.txt from the admin-managed `SeoSetting.robotsTxt` value.
 * The previous build wrote to that field but never exposed it — this route
 * closes that gap.
 *
 * If `robotsTxt` is empty, we emit a permissive default that points at the
 * dynamic sitemap.
 */
export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const setting = await db.seoSetting.findFirst({
    select: {
      robotsTxt: true,
      robotsTxtAutoAppendSitemap: true,
    },
  })

  const sitemapUrl = `${BASE_URL}/sitemap.xml`

  // If the admin has provided custom robots.txt content, parse the simplest
  // case: User-agent + Allow/Disallow blocks. The Next.js MetadataRoute.Robots
  // type is structured rather than free-form, so we try to interpret the
  // textarea content where possible and fall back to a safe default.
  if (setting?.robotsTxt && setting.robotsTxt.trim().length > 0) {
    const parsed = parseRobotsText(setting.robotsTxt)
    return {
      // The staff panel is served from this same origin now, and this field
      // is editable from the SEO console — so the admin disallow is appended
      // unconditionally rather than trusted to survive whatever someone types
      // into the textarea.
      rules: withReservedDisallow(parsed.rules),
      sitemap: setting.robotsTxtAutoAppendSitemap === false ? parsed.sitemap : sitemapUrl,
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Crawl budget hygiene — the list lives in lib/crawl-policy beside the
      // sitemap's static paths, so the two cannot contradict each other. They
      // did: /search was disallowed here and listed in the sitemap.
      disallow: [...DEFAULT_DISALLOW],
    },
    sitemap: sitemapUrl,
  }
}

type ParsedRobots = {
  rules: { userAgent: string; allow?: string[]; disallow?: string[] }[]
  sitemap?: string
}

/**
 * Minimal robots.txt parser — handles the common shape we surface in the
 * admin editor. Anything fancy (Crawl-delay, Sitemap directives) is also
 * captured; everything else is ignored.
 */
function parseRobotsText(text: string): ParsedRobots {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  const rules: ParsedRobots['rules'] = []
  let current: { userAgent: string; allow: string[]; disallow: string[] } | null = null
  let sitemap: string | undefined

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(':')
    if (!rawKey || rest.length === 0) continue
    const key = rawKey.trim().toLowerCase()
    const value = rest.join(':').trim()
    if (key === 'user-agent') {
      if (current) rules.push(toRule(current))
      current = { userAgent: value, allow: [], disallow: [] }
    } else if (key === 'allow' && current) {
      current.allow.push(value)
    } else if (key === 'disallow' && current) {
      current.disallow.push(value)
    } else if (key === 'sitemap') {
      sitemap = value
    }
  }
  if (current) rules.push(toRule(current))
  if (rules.length === 0) {
    rules.push({ userAgent: '*', allow: ['/'] })
  }
  return { rules, sitemap }
}

function toRule(c: { userAgent: string; allow: string[]; disallow: string[] }) {
  const rule: { userAgent: string; allow?: string[]; disallow?: string[] } = {
    userAgent: c.userAgent,
  }
  if (c.allow.length > 0) rule.allow = c.allow
  if (c.disallow.length > 0) rule.disallow = c.disallow
  return rule
}

/**
 * Paths that must be disallowed no matter what the admin-managed robots.txt
 * says. `/admin` is on the public origin after the storefront/admin merge, so
 * a robots.txt-only defence would be one careless textarea edit away from
 * evaporating. This is the second of three layers — the others are the
 * `robots` metadata on app/admin/layout.tsx and the X-Robots-Tag response
 * header set in proxy.ts.
 */
// `/design` is the internal design-language specimen board. It is reserved
// rather than merely listed in the default rule because the default rule is
// editable from the SEO console, and an internal page drifting into the index
// is the kind of thing nobody notices until it ranks.
const RESERVED_DISALLOW = ['/admin', '/admin/', '/design']

/**
 * `MetadataRoute.Robots['rules']` is `Rule | RuleWithRequiredUserAgent[]`, so
 * the two branches are typed separately rather than through one shared alias.
 */
type Rules = MetadataRoute.Robots['rules']
type RuleList = Extract<Rules, readonly unknown[]>

function withDisallow<T extends { disallow?: string | string[] }>(rule: T): T {
  const existing =
    rule.disallow == null ? [] : Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
  const missing = RESERVED_DISALLOW.filter((p) => !existing.includes(p))
  return missing.length ? { ...rule, disallow: [...existing, ...missing] } : rule
}

function withReservedDisallow(rules: Rules): Rules {
  return Array.isArray(rules) ? (rules.map(withDisallow) as RuleList) : withDisallow(rules)
}
