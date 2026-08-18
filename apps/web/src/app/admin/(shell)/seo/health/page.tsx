import type { Metadata } from 'next'
import Link from 'next/link'
import { db, Prisma } from '@indus/db'
import { scoreEntity, type SeoEntityType } from '@indus/domain'
import { SeoHealthBadge } from '@indus/ui'
import { ADMIN_PREFIX } from '../../../../../lib/admin-paths'

export const metadata: Metadata = { title: 'SEO Health — Indus Admin' }

/**
 * Site-wide aggregate health. Computes scores live by running the same
 * `scoreEntity` evaluator the Inspector grid uses, then aggregates by
 * entity type. The cached `SeoHealthScore` table is populated by the
 * (Phase 3) Inngest fan-out — until then live computation works fine
 * for the catalogue's current size.
 *
 * Three views in one page:
 *   1. Per-type aggregate (avg score, % healthy)
 *   2. Worst-offender list across all entities
 *   3. 404 + redirect-chain quick stats (already shipped pages)
 */
const TYPE_LABELS: Record<SeoEntityType, string> = {
  product: 'Product',
  category: 'Category',
  brand: 'Brand',
  industry: 'Industry',
  cms_page: 'CMS Page',
  blog_post: 'Blog',
}

const SEO_SELECT = {
  id: true,
  slug: true,
  seoTitle: true,
  seoDescription: true,
  focusKeyword: true,
  canonicalUrl: true,
  robotsIndex: true,
  ogImageMediaId: true,
  excludeFromSitemap: true,
} as const

export default async function SeoHealthPage() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
    /\/$/,
    '',
  )

  // Server component renders once per request — Date.now is the right
  // call for "events in the last 7 days" relative to the request time.
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    products,
    categories,
    brands,
    industries,
    blogPosts,
    cmsPages,
    seoSetting,
    unresolved404,
    totalRedirects,
    topQueries,
    zeroResultQueries,
  ] = await Promise.all([
      db.product.findMany({
        select: { ...SEO_SELECT, title: true, status: true },
      }),
      db.category.findMany({
        select: { ...SEO_SELECT, name: true, isPublished: true },
      }),
      db.brand.findMany({
        select: { ...SEO_SELECT, name: true, isPublished: true },
      }),
      db.industry.findMany({
        select: { ...SEO_SELECT, name: true, isPublished: true },
      }),
      db.blogPost.findMany({
        // Trashed posts are off the site, so an SEO warning about one is noise.
        where: { deletedAt: null },
        select: { ...SEO_SELECT, title: true, isPublished: true },
      }),
      db.cmsPage.findMany({
        select: { ...SEO_SELECT, title: true, isPublished: true },
      }),
      db.seoSetting.findFirst({ select: { ogDefaultImageId: true } }),
      db.notFoundLog.count({ where: { resolvedRedirectId: null } }),
      db.redirect.count({ where: { isActive: true } }),
      db.$queryRaw<Array<{ normalized: string; count: bigint }>>(Prisma.sql`
        SELECT normalized, COUNT(*)::bigint AS count
        FROM search_query_logs
        WHERE "createdAt" >= ${since}
        GROUP BY normalized
        ORDER BY count DESC
        LIMIT 10
      `),
      db.$queryRaw<Array<{ normalized: string; count: bigint }>>(Prisma.sql`
        SELECT normalized, COUNT(*)::bigint AS count
        FROM search_query_logs
        WHERE "createdAt" >= ${since} AND "resultsCount" = 0
        GROUP BY normalized
        ORDER BY count DESC
        LIMIT 10
      `),
    ])

  const defaultOgPresent = !!seoSetting?.ogDefaultImageId

  type Row = {
    entityType: SeoEntityType
    entityId: string
    title: string
    slug: string
    score: number
    isPublished: boolean
  }

  const rows: Row[] = []
  for (const p of products) {
    rows.push({
      entityType: 'product',
      entityId: p.id,
      title: p.title,
      slug: p.slug,
      isPublished: p.status === 'active',
      score: scoreEntity({
        title: p.seoTitle ?? p.title,
        description: p.seoDescription,
        focusKeyword: p.focusKeyword,
        url: `/${p.slug}`,
        hasStructuredData: true,
        isIndexable: p.robotsIndex && p.status === 'active' && !p.excludeFromSitemap,
        canonicalCorrect: !p.canonicalUrl || p.canonicalUrl === `${baseUrl}/p/${p.slug}`,
        ogComplete: !!p.ogImageMediaId || defaultOgPresent,
      }).score,
    })
  }
  pushSimple(rows, categories, 'category', baseUrl, '/c/', defaultOgPresent)
  pushSimple(rows, brands, 'brand', baseUrl, '/brands/', defaultOgPresent)
  pushSimple(rows, industries, 'industry', baseUrl, '/industries/', defaultOgPresent)
  pushSimple(rows, blogPosts, 'blog_post', baseUrl, '/blog/', defaultOgPresent, true)
  pushSimple(rows, cmsPages, 'cms_page', baseUrl, '/', defaultOgPresent, false)

  const summary = computeSummary(rows)
  const worstOffenders = rows
    .filter((r) => r.isPublished)
    .sort((a, b) => a.score - b.score)
    .slice(0, 25)

  return (
    <div className="max-w-[1080px]">
      {/* Top tiles */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Tile label="URLs scored" value={rows.length.toLocaleString()} />
        <Tile label="Avg score" value={summary.avg.toFixed(0)} accent={summary.avg >= 80} />
        <Tile
          label="Critical (< 50)"
          value={summary.critical.toLocaleString()}
          danger={summary.critical > 0}
        />
        <Tile label="Healthy (≥ 80)" value={summary.healthy.toLocaleString()} accent={summary.healthy > summary.critical} />
      </div>

      {/* Per-type breakdown */}
      <Section title="By entity type">
        <div className="border border-ih-border overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ih-border bg-ih-surface-2">
                <Th>Type</Th>
                <Th>Total</Th>
                <Th>Avg score</Th>
                <Th>Healthy</Th>
                <Th>Needs work</Th>
                <Th>Critical</Th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byType).map(([type, s]) => (
                <tr
                  key={type}
                  className="border-b border-ih-border last:border-0 hover:bg-ih-surface-2"
                >
                  <td className="px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ih-ink-2">
                    {TYPE_LABELS[type as SeoEntityType]}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] tabular-nums">{s.total}</td>
                  <td className="px-3 py-2.5">
                    <SeoHealthBadge score={Math.round(s.avg)} size="sm" />
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] tabular-nums text-ih-success-ink">
                    {s.healthy}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] tabular-nums text-ih-warning-ink">
                    {s.warn}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] tabular-nums text-ih-danger-ink">
                    {s.critical}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Worst offenders */}
      <Section title="Worst offenders (published only)">
        {worstOffenders.length === 0 ? (
          <Empty>Nothing critical right now.</Empty>
        ) : (
          <div className="border border-ih-border overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-ih-border bg-ih-surface-2">
                  <Th>Score</Th>
                  <Th>Type</Th>
                  <Th>Title</Th>
                </tr>
              </thead>
              <tbody>
                {worstOffenders.map((r) => {
                  const path = editPathFor(r.entityType, r.entityId)
                  return (
                    <tr
                      key={`${r.entityType}-${r.entityId}`}
                      className="border-b border-ih-border last:border-0 hover:bg-ih-surface-2"
                    >
                      <td className="px-3 py-2.5">
                        <SeoHealthBadge score={r.score} size="sm" />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-muted">
                        {TYPE_LABELS[r.entityType]}
                      </td>
                      <td className="px-3 py-2.5">
                        {path ? (
                          <Link href={path} className="text-ih-ink-2 hover:text-ih-accent">
                            {r.title}
                          </Link>
                        ) : (
                          <span className="text-ih-ink-2">{r.title}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Infrastructure stats */}
      <Section title="Infrastructure">
        <div className="grid grid-cols-2 gap-3 max-w-[640px]">
          <Link
            href="/admin/seo/redirects"
            className="border border-ih-border bg-ih-surface p-4 hover:bg-ih-surface-2 transition-colors"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
              Active redirects
            </p>
            <p className="text-[28px] font-medium mt-1">{totalRedirects}</p>
          </Link>
          <Link
            href="/admin/seo/redirects/not-found"
            className="border border-ih-border bg-ih-surface p-4 hover:bg-ih-surface-2 transition-colors"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
              Unresolved 404s
            </p>
            <p
              className={`text-[28px] font-medium mt-1 ${
                unresolved404 > 0 ? 'text-ih-danger-ink' : ''
              }`}
            >
              {unresolved404}
            </p>
          </Link>
        </div>
      </Section>

      {/* Search activity (last 7 days) */}
      <Section title="Search activity (last 7 days)">
        <div className="grid grid-cols-2 gap-4">
          <SearchPanel
            heading="Top queries"
            empty="No searches yet."
            ctaHref="/seo/search/queries"
            ctaLabel="Full analytics →"
            rows={topQueries.map((q) => ({
              label: q.normalized,
              value: Number(q.count).toLocaleString(),
            }))}
          />
          <SearchPanel
            heading="Zero-result queries"
            empty="No zero-result queries — every search found something."
            ctaHref="/seo/search/synonyms"
            ctaLabel="Define synonyms →"
            rows={zeroResultQueries.map((q) => ({
              label: q.normalized,
              value: Number(q.count).toLocaleString(),
            }))}
            warn={zeroResultQueries.length > 0}
          />
        </div>
      </Section>
    </div>
  )
}

function SearchPanel({
  heading,
  empty,
  rows,
  ctaHref,
  ctaLabel,
  warn,
}: {
  heading: string
  empty: string
  rows: Array<{ label: string; value: string }>
  ctaHref: string
  ctaLabel: string
  warn?: boolean
}) {
  return (
    <div className="border border-ih-border bg-ih-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
          {heading}
        </p>
        <Link
          href={ctaHref}
          className="font-mono text-[11px] text-ih-accent hover:underline"
        >
          {ctaLabel}
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-[12px] text-ih-muted py-4 text-center">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex items-baseline justify-between gap-3 font-mono text-[12px]"
            >
              <span
                className={`truncate ${
                  warn ? 'text-ih-danger-ink' : 'text-ih-ink-2'
                }`}
                title={r.label}
              >
                {r.label}
              </span>
              <span className="text-ih-muted tabular-nums whitespace-nowrap">
                {r.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type SimpleEntity = {
  id: string
  slug: string
  name?: string
  title?: string
  seoTitle: string | null
  seoDescription: string | null
  focusKeyword: string | null
  canonicalUrl: string | null
  robotsIndex: boolean
  ogImageMediaId: string | null
  excludeFromSitemap: boolean
  isPublished: boolean
}

function pushSimple(
  rows: Array<{
    entityType: SeoEntityType
    entityId: string
    title: string
    slug: string
    score: number
    isPublished: boolean
  }>,
  list: SimpleEntity[],
  entityType: SeoEntityType,
  baseUrl: string,
  pathPrefix: string,
  defaultOgPresent: boolean,
  hasStructuredData: boolean | null = true,
) {
  for (const e of list) {
    const title = e.name ?? e.title ?? ''
    rows.push({
      entityType,
      entityId: e.id,
      title,
      slug: e.slug,
      isPublished: e.isPublished,
      score: scoreEntity({
        title: e.seoTitle ?? title,
        description: e.seoDescription,
        focusKeyword: e.focusKeyword,
        url: `/${e.slug}`,
        hasStructuredData: hasStructuredData ?? false,
        isIndexable: e.robotsIndex && e.isPublished && !e.excludeFromSitemap,
        canonicalCorrect:
          !e.canonicalUrl || e.canonicalUrl === `${baseUrl}${pathPrefix}${e.slug}`,
        ogComplete: !!e.ogImageMediaId || defaultOgPresent,
      }).score,
    })
  }
}

type TypeSummary = { total: number; avg: number; healthy: number; warn: number; critical: number }

function computeSummary(
  rows: Array<{ entityType: SeoEntityType; score: number }>,
): {
  avg: number
  healthy: number
  warn: number
  critical: number
  byType: Record<string, TypeSummary>
} {
  const byType: Record<string, TypeSummary> = {}
  let totalScore = 0
  let healthy = 0
  let warn = 0
  let critical = 0

  for (const r of rows) {
    if (!byType[r.entityType]) {
      byType[r.entityType] = { total: 0, avg: 0, healthy: 0, warn: 0, critical: 0 }
    }
    const s = byType[r.entityType]!
    s.total += 1
    s.avg += r.score
    totalScore += r.score
    if (r.score >= 80) {
      s.healthy += 1
      healthy += 1
    } else if (r.score >= 50) {
      s.warn += 1
      warn += 1
    } else {
      s.critical += 1
      critical += 1
    }
  }
  for (const s of Object.values(byType)) {
    s.avg = s.total === 0 ? 0 : s.avg / s.total
  }
  return {
    avg: rows.length === 0 ? 0 : totalScore / rows.length,
    healthy,
    warn,
    critical,
    byType,
  }
}

function editPathFor(entityType: SeoEntityType, entityId: string): string | null {
  switch (entityType) {
    case 'product':
      return `${ADMIN_PREFIX}/products/${entityId}/edit?tab=seo`
    case 'category':
      return `${ADMIN_PREFIX}/categories/${entityId}/edit`
    case 'brand':
      return `${ADMIN_PREFIX}/brands/${entityId}/edit`
    case 'industry':
      return `${ADMIN_PREFIX}/industries/${entityId}/edit`
    case 'blog_post':
      return `${ADMIN_PREFIX}/blog/${entityId}?tab=seo`
    case 'cms_page':
      return `${ADMIN_PREFIX}/cms/pages/${entityId}?tab=seo`
    default:
      return null
  }
}

function Tile({
  label,
  value,
  accent,
  danger,
}: {
  label: string
  value: string
  accent?: boolean
  danger?: boolean
}) {
  return (
    <div className="border border-ih-border bg-ih-surface p-4">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
        {label}
      </div>
      <div
        className={`text-[28px] font-medium mt-1 ${
          danger
            ? 'text-ih-danger-ink'
            : accent
              ? 'text-ih-accent'
              : ''
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 text-center rounded-lg border border-ih-border text-[13px] text-ih-muted">
      {children}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
      {children}
    </th>
  )
}
