import type { MetadataRoute } from 'next'
import { db } from '@indus/db'
import { BASE_URL } from '../lib/seo'

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
      rules: parsed.rules,
      sitemap: setting.robotsTxtAutoAppendSitemap === false ? parsed.sitemap : sitemapUrl,
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Crawl budget hygiene. None of these surfaces are useful as
      // landing pages: account/quote/RFQ require auth or session
      // state; API routes return JSON; /search, /compare and the
      // auth pages are session-coupled or thin/duplicative content.
      disallow: [
        '/account',
        '/account/',
        '/quote',
        '/quote/',
        '/api/',
        '/search',
        '/compare',
        '/sign-in',
        '/sign-up',
        '/forgot-password',
        '/reset-password',
        '/maintenance',
      ],
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
