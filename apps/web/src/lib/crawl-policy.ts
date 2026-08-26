/**
 * The two halves of this site's crawl instructions, in one file so they cannot
 * contradict each other.
 *
 * They did. `/search` was listed in the sitemap at priority 0.4 while
 * robots.txt disallowed it — the site telling Google "index this page" and
 * "do not fetch this page" about the same URL. Search Console reports that as
 * a warning against the sitemap, and it spends crawl budget arguing with
 * itself instead of on the 1,277 product pages. Found on 2026-08-21, the day
 * the sitemap was first submitted; the contradiction had shipped since the
 * sitemap route was written.
 *
 * `assertSitemapRespectsRobots` below is what stops it recurring: adding a
 * path to one list and forgetting the other now fails a test rather than a
 * Search Console report nobody is reading.
 *
 * Deliberately free of `@indus/db` and of `next` imports so both consumers —
 * app/robots.ts and app/sitemap.ts — and a plain unit test can read it.
 */

/**
 * Paths kept out of the index entirely. None are useful as landing pages:
 * account/quote/RFQ need auth or session state, API routes return JSON, and
 * /search and /compare are session-coupled or thin duplicative content.
 */
export const DEFAULT_DISALLOW = [
  // Reserved — see RESERVED_DISALLOW in app/robots.ts, which re-appends these
  // even when an operator overwrites robots.txt from the SEO console.
  '/admin',
  '/admin/',
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
  '/design',
] as const

/**
 * Query-string patterns kept out of the CRAWL, not just out of the index.
 *
 * Category pages expose filter and sort controls, and each one is a link. A
 * single category page offers roughly 62 of them — brand facets crossed with
 * sort orders — and there are 171 categories with products. Every one of those
 * URLs already returns `noindex` with a canonical pointing back at the clean
 * category, so none of them can ever be indexed. Google still fetches them.
 *
 * On a domain Google is rationing hard — 72 of 2,040 URLs indexed as of
 * 2026-08-24 — thousands of fetches that cannot produce an indexable page is
 * budget taken directly from the product pages that could.
 *
 * WHY THIS IS NOT `Disallow: /c/*?`
 *
 * That was the first version and it would have done real damage. Pagination
 * lives on the same query string: a category page links 12 products and the
 * rest are reached through `?page=2` and beyond. 513 of the 1,480 active
 * products sit ONLY behind pagination, so blocking every `/c/` query string
 * would have cut the sole internal-link path to a third of the catalogue —
 * on a site whose problem is already that too little gets crawled.
 *
 * So the patterns below name the two parameters that produce nothing
 * indexable, and leave `?page=` alone.
 *
 * `?page=` is now a redirect rather than a page in its own right: unfiltered
 * pagination lives at `/c/<slug>/page/N`, and the proxy 308s the query form
 * there. Still not disallowed, and deliberately so — a blocked URL cannot be
 * followed to its redirect target, which would re-create exactly the problem
 * described above.
 *
 * These are wildcard MATCH patterns, not path prefixes. They are deliberately
 * kept out of `DEFAULT_DISALLOW`, whose entries are prefixes that
 * `isDisallowed` compares with `startsWith` — mixing the two kinds in one list
 * would silently break that helper and the sitemap-contradiction test built on
 * it.
 */
export const FACET_DISALLOW = [
  '/c/*brands=',
  '/c/*sort=',
] as const

/** One hand-listed sitemap entry: a site-relative path and its hints. */
export type StaticSitemapPath = {
  path: string
  priority: number
  changeFrequency: 'weekly' | 'monthly' | 'yearly'
}

/**
 * The hand-listed sitemap entries — everything not generated from a database
 * row. Entity pages (products, categories, brands, posts) are built from
 * Postgres in app/sitemap.ts.
 */
export const STATIC_SITEMAP_PATHS: StaticSitemapPath[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  // /c became a real category index in the v2 migration — it previously
  // redirected to whichever category sorted first, so it was deliberately
  // absent here.
  { path: '/c', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/brands', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/industries', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.8, changeFrequency: 'weekly' },
  // The manufacturing capability page. Priority matches /services because it
  // answers the supplier-evaluation question the whole services surface exists
  // for — how are these parts actually made — and it is the page the technical
  // long-tail ("ASME B16.11 forged fitting manufacturer") lands on. It changes
  // only when the partner's measured capability does, hence yearly.
  { path: '/manufacturing', priority: 0.8, changeFrequency: 'yearly' },
  // The quality-control page. Same priority and cadence as manufacturing — it
  // answers the other half of the supplier-evaluation question ("how do you
  // prove it?") and changes only when the partner's inspection regime does.
  { path: '/quality-control', priority: 0.8, changeFrequency: 'yearly' },
  // NOT /search. It is in DEFAULT_DISALLOW, and a sitemap entry for a
  // disallowed path is a contradiction, not a hedge. See the file header.
  //
  // Reference tools. Static, evergreen and the kind of utility page
  // technicians bookmark and forums link to, so they carry a higher
  // priority than most non-catalogue pages.
  { path: '/tools', priority: 0.7, changeFrequency: 'monthly' },
  // On-site service areas. High-intent local surface ("hydraulic hose
  // repair sharjah"), so they carry the same priority as the tools.
  { path: '/locations', priority: 0.7, changeFrequency: 'monthly' },
  // Export markets. Same high-intent local surface as /locations, one level
  // out: "hydraulic hose supplier in saudi arabia" rather than "in sharjah".
  { path: '/markets', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tools/thread-identifier', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tools/pressure-converter', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/tools/dash-size-chart', priority: 0.6, changeFrequency: 'monthly' },
  // Programmatic replacement landing pages — high-intent search
  // surface ("parker pv16 replacement") that AI agents cite well.
  { path: '/replacement', priority: 0.7, changeFrequency: 'weekly' },
  // Company pages. Both were missing entirely: neither is in
  // STATIC_SITEMAP_PATHS and neither has a CmsPage row to generate an
  // entry, so the two pages carrying our credibility signals — founding
  // year, facility, certifications, leadership, real address — were in no
  // sitemap at all. They rank for supplier-evaluation queries and feed the
  // Organization/LocalBusiness entity, so they sit above the policy pages.
  { path: '/hydraulic-components-supplier-uae', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  // Legal / policy pages render from hardcoded content unless an
  // editor publishes a CmsPage row to override. Listing them here so
  // they're crawlable from day 1 without depending on a CMS row.
  { path: '/shipping', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/returns', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/warranty', priority: 0.4, changeFrequency: 'yearly' },
]

/**
 * True when `path` is covered by a robots.txt disallow rule.
 *
 * Prefix matching, because that is what robots.txt means: `Disallow: /admin`
 * blocks /admin, /admin/, /admin/settings and anything else beneath it. The
 * empty path (the home page) is the one entry that can never match, and is
 * handled explicitly rather than left to `''.startsWith('/admin')`.
 */
export function isDisallowed(path: string, disallow: readonly string[] = DEFAULT_DISALLOW): boolean {
  if (path === '') return false
  return disallow.some((rule) => path === rule || path.startsWith(rule))
}

/**
 * Every static sitemap path that robots.txt blocks. Empty is the only correct
 * answer; the test asserts on the list rather than a boolean so a failure
 * names the offending path.
 */
export function sitemapPathsBlockedByRobots(
  paths: readonly StaticSitemapPath[] = STATIC_SITEMAP_PATHS,
  disallow: readonly string[] = DEFAULT_DISALLOW,
): string[] {
  return paths.filter((p) => isDisallowed(p.path, disallow)).map((p) => p.path)
}
