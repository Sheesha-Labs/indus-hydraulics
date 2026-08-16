import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import {
  scoreEntity,
  TITLE_RANGE,
  DESCRIPTION_RANGE,
  type SeoEntityType,
} from '@indus/domain'
import { Input, Select, SeoHealthBadge } from '@indus/ui'
import { ADMIN_PREFIX } from '../../../../../lib/admin-paths'

export const metadata: Metadata = { title: 'SEO Inspector — Indus Admin' }

type EntityRow = {
  entityType: SeoEntityType
  entityId: string
  slug: string
  title: string
  seoTitle: string | null
  seoDescription: string | null
  url: string
  robotsIndex: boolean
  ogImagePresent: boolean
  hasStructuredData: boolean
  isPublished: boolean
  excludeFromSitemap: boolean
  lastModified: Date | null
  score: number
}

type SearchParams = Promise<{
  q?: string
  type?: string
  status?: 'ok' | 'warn' | 'danger'
  sort?: 'score' | 'title' | 'updated'
}>

const TYPE_LABELS: Record<SeoEntityType, string> = {
  product: 'Product',
  category: 'Category',
  brand: 'Brand',
  industry: 'Industry',
  cms_page: 'CMS Page',
  blog_post: 'Blog',
}

export default async function SeoInspectorPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const rows = await loadAllRows()

  const filtered = rows
    .filter((r) => (sp.type ? r.entityType === sp.type : true))
    .filter((r) =>
      sp.q
        ? `${r.title} ${r.seoTitle ?? ''} ${r.seoDescription ?? ''} ${r.slug}`
            .toLowerCase()
            .includes(sp.q.toLowerCase())
        : true,
    )
    .filter((r) =>
      sp.status === 'ok'
        ? r.score >= 80
        : sp.status === 'warn'
          ? r.score >= 50 && r.score < 80
          : sp.status === 'danger'
            ? r.score < 50
            : true,
    )

  const sort = sp.sort ?? 'score'
  filtered.sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title)
    if (sort === 'updated')
      return (b.lastModified?.getTime() ?? 0) - (a.lastModified?.getTime() ?? 0)
    return a.score - b.score // score: lowest first (most needs attention)
  })

  const counts = {
    total: rows.length,
    ok: rows.filter((r) => r.score >= 80).length,
    warn: rows.filter((r) => r.score >= 50 && r.score < 80).length,
    danger: rows.filter((r) => r.score < 50).length,
  }

  return (
    <div>
      {/* Summary tiles */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <SummaryTile label="Total URLs" value={counts.total} tone="muted" />
        <SummaryTile label="Healthy (≥ 80)" value={counts.ok} tone="good" />
        <SummaryTile label="Needs work (50–79)" value={counts.warn} tone="warn" />
        <SummaryTile label="Critical (< 50)" value={counts.danger} tone="danger" />
      </div>

      {/* Filters */}
      <form className="flex gap-3 items-end mb-4 flex-wrap" method="get">
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="inspector-q" className="block font-mono text-[10px] uppercase text-ih-muted mb-1">
            Search
          </label>
          {/* h-9 to match the selects and buttons in this items-end row. */}
          <Input
            id="inspector-q"
            className="h-9"
            type="text"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Title, slug, description…" />
        </div>
        <SelectFilter name="type" label="Type" value={sp.type ?? ''}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </SelectFilter>
        <SelectFilter name="status" label="Health" value={sp.status ?? ''}>
          <option value="">All</option>
          <option value="ok">Healthy</option>
          <option value="warn">Needs work</option>
          <option value="danger">Critical</option>
        </SelectFilter>
        <SelectFilter name="sort" label="Sort" value={sort}>
          <option value="score">Lowest score</option>
          <option value="title">Title A→Z</option>
          <option value="updated">Recently edited</option>
        </SelectFilter>
        <button
          type="submit"
          className="h-9 px-4 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90"
        >
          Apply
        </button>
        <Link
          href="/admin/seo/inspector"
          className="h-9 px-4 grid place-items-center border border-ih-border font-mono text-[12px] text-ih-muted hover:text-ih-ink-2"
        >
          Reset
        </Link>
      </form>

      {/* Grid */}
      <div className="border border-ih-border overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ih-border bg-ih-surface-2 text-left">
              <Th>Health</Th>
              <Th>Type</Th>
              <Th>Title (length)</Th>
              <Th>Description (length)</Th>
              <Th>Robots</Th>
              <Th>OG</Th>
              <Th>Schema</Th>
              <Th>URL</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-ih-muted">
                  No URLs match those filters.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={`${row.entityType}-${row.entityId}`}
                  className="border-b border-ih-border last:border-0 hover:bg-ih-surface-2"
                >
                  <td className="px-3 py-2">
                    <SeoHealthBadge score={row.score} size="sm" />
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ih-muted">
                      {TYPE_LABELS[row.entityType]}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-[280px]">
                    {(() => {
                      const editPath = editPathFor(row.entityType, row.entityId)
                      const titleText = row.seoTitle ?? row.title
                      return editPath ? (
                        <Link
                          href={editPath}
                          className="truncate block text-ih-ink-2 hover:text-ih-accent"
                          title={titleText}
                        >
                          {titleText}
                        </Link>
                      ) : (
                        <div className="truncate text-ih-ink-2" title={titleText}>
                          {titleText}
                        </div>
                      )
                    })()}
                    <LengthHint
                      len={(row.seoTitle ?? row.title ?? '').length}
                      min={TITLE_RANGE.min}
                      max={TITLE_RANGE.max}
                    />
                  </td>
                  <td className="px-3 py-2 max-w-[320px]">
                    <div className="truncate text-ih-muted" title={row.seoDescription ?? ''}>
                      {row.seoDescription ?? <em className="opacity-60">missing</em>}
                    </div>
                    <LengthHint
                      len={(row.seoDescription ?? '').length}
                      min={DESCRIPTION_RANGE.min}
                      max={DESCRIPTION_RANGE.max}
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {row.robotsIndex ? (
                      <span className="text-[oklch(0.4_0.14_145)]">index</span>
                    ) : (
                      <span className="text-[oklch(0.5_0.18_25)]">noindex</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {row.ogImagePresent ? '✓' : <span className="text-ih-muted">—</span>}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {row.hasStructuredData ? '✓' : <span className="text-ih-muted">—</span>}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-ih-muted max-w-[260px]">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener"
                      className="hover:text-ih-accent truncate inline-block max-w-full align-bottom"
                      title={row.url}
                    >
                      {row.url.replace(/^https?:\/\//, '')}
                    </a>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-ih-muted whitespace-nowrap">
                    {row.lastModified
                      ? row.lastModified.toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-mono text-[10px] text-ih-muted">
        Showing {filtered.length} of {rows.length} URL(s). Health score is recomputed on every page load.
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Data loaders
// ─────────────────────────────────────────────────────────────────────────────

async function loadAllRows(): Promise<EntityRow[]> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(/\/$/, '')

  const [products, categories, brands, industries, blogPosts, cmsPages, seoSetting] = await Promise.all([
    db.product.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        seoTitle: true,
        seoDescription: true,
        focusKeyword: true,
        canonicalUrl: true,
        robotsIndex: true,
        robotsFollow: true,
        ogImageMediaId: true,
        excludeFromSitemap: true,
        seoUpdatedAt: true,
        updatedAt: true,
        status: true,
      },
    }),
    db.category.findMany({
      select: seoSelectNamed(),
    }),
    db.brand.findMany({ select: seoSelectNamed() }),
    db.industry.findMany({ select: seoSelectNamed() }),
    db.blogPost.findMany({
      select: {
        ...seoSelectTitled(),
        publishedAt: true,
      },
    }),
    db.cmsPage.findMany({
      select: {
        ...seoSelectTitled(),
        updatedAt: true,
      },
    }),
    db.seoSetting.findFirst({ select: { ogDefaultImageId: true } }),
  ])

  const defaultOgPresent = !!seoSetting?.ogDefaultImageId

  const rows: EntityRow[] = []

  for (const p of products) {
    rows.push(
      buildRow({
        entityType: 'product',
        entityId: p.id,
        slug: p.slug,
        title: p.title,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        focusKeyword: p.focusKeyword,
        canonicalUrl: p.canonicalUrl,
        robotsIndex: p.robotsIndex,
        ogImageMediaId: p.ogImageMediaId,
        excludeFromSitemap: p.excludeFromSitemap,
        lastModified: p.seoUpdatedAt ?? p.updatedAt,
        isPublished: p.status === 'active',
        url: `${baseUrl}/p/${p.slug}`,
        defaultOgPresent,
        // Product gets full Product+Breadcrumb+(FAQ) JSON-LD; assume true.
        hasStructuredData: true,
      }),
    )
  }
  for (const c of categories) pushSimple(rows, c, 'category', `${baseUrl}/c/${c.slug}`, defaultOgPresent)
  for (const b of brands) pushSimple(rows, b, 'brand', `${baseUrl}/brands/${b.slug}`, defaultOgPresent)
  for (const i of industries) pushSimple(rows, i, 'industry', `${baseUrl}/industries/${i.slug}`, defaultOgPresent)
  for (const bp of blogPosts) {
    rows.push(
      buildRow({
        entityType: 'blog_post',
        entityId: bp.id,
        slug: bp.slug,
        title: bp.title,
        seoTitle: bp.seoTitle,
        seoDescription: bp.seoDescription,
        focusKeyword: bp.focusKeyword,
        canonicalUrl: bp.canonicalUrl,
        robotsIndex: bp.robotsIndex,
        ogImageMediaId: bp.ogImageMediaId,
        excludeFromSitemap: bp.excludeFromSitemap,
        lastModified: bp.seoUpdatedAt ?? bp.publishedAt,
        isPublished: bp.isPublished,
        url: `${baseUrl}/blog/${bp.slug}`,
        defaultOgPresent,
        hasStructuredData: true,
      }),
    )
  }
  for (const cp of cmsPages) {
    rows.push(
      buildRow({
        entityType: 'cms_page',
        entityId: cp.id,
        slug: cp.slug,
        title: cp.title,
        seoTitle: cp.seoTitle,
        seoDescription: cp.seoDescription,
        focusKeyword: cp.focusKeyword,
        canonicalUrl: cp.canonicalUrl,
        robotsIndex: cp.robotsIndex,
        ogImageMediaId: cp.ogImageMediaId,
        excludeFromSitemap: cp.excludeFromSitemap,
        lastModified: cp.seoUpdatedAt ?? cp.updatedAt,
        isPublished: cp.isPublished,
        url: `${baseUrl}/${cp.slug}`,
        defaultOgPresent,
        hasStructuredData: false, // CMS pages don't emit JSON-LD yet.
      }),
    )
  }

  return rows
}

function seoSelectNamed() {
  return {
    id: true,
    slug: true,
    name: true,
    seoTitle: true,
    seoDescription: true,
    focusKeyword: true,
    canonicalUrl: true,
    robotsIndex: true,
    robotsFollow: true,
    ogImageMediaId: true,
    excludeFromSitemap: true,
    seoUpdatedAt: true,
    isPublished: true,
  } as const
}

function seoSelectTitled() {
  return {
    id: true,
    slug: true,
    title: true,
    seoTitle: true,
    seoDescription: true,
    focusKeyword: true,
    canonicalUrl: true,
    robotsIndex: true,
    robotsFollow: true,
    ogImageMediaId: true,
    excludeFromSitemap: true,
    seoUpdatedAt: true,
    isPublished: true,
  } as const
}

function pushSimple(
  rows: EntityRow[],
  e: {
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
    seoUpdatedAt: Date | null
    isPublished: boolean
  },
  entityType: SeoEntityType,
  url: string,
  defaultOgPresent: boolean,
) {
  rows.push(
    buildRow({
      entityType,
      entityId: e.id,
      slug: e.slug,
      title: e.name ?? e.title ?? '',
      seoTitle: e.seoTitle,
      seoDescription: e.seoDescription,
      focusKeyword: e.focusKeyword,
      canonicalUrl: e.canonicalUrl,
      robotsIndex: e.robotsIndex,
      ogImageMediaId: e.ogImageMediaId,
      excludeFromSitemap: e.excludeFromSitemap,
      lastModified: e.seoUpdatedAt,
      isPublished: e.isPublished,
      url,
      defaultOgPresent,
      hasStructuredData: true,
    }),
  )
}

function buildRow(p: {
  entityType: SeoEntityType
  entityId: string
  slug: string
  title: string
  seoTitle: string | null
  seoDescription: string | null
  focusKeyword: string | null
  canonicalUrl: string | null
  robotsIndex: boolean
  ogImageMediaId: string | null
  excludeFromSitemap: boolean
  lastModified: Date | null
  isPublished: boolean
  url: string
  defaultOgPresent: boolean
  hasStructuredData: boolean
}): EntityRow {
  const ogImagePresent = !!p.ogImageMediaId || p.defaultOgPresent
  const { score } = scoreEntity({
    title: p.seoTitle ?? p.title,
    description: p.seoDescription,
    focusKeyword: p.focusKeyword,
    url: `/${p.slug}`,
    hasStructuredData: p.hasStructuredData,
    isIndexable: p.robotsIndex && p.isPublished && !p.excludeFromSitemap,
    canonicalCorrect: !p.canonicalUrl || p.canonicalUrl === p.url,
    ogComplete: ogImagePresent,
  })
  return {
    entityType: p.entityType,
    entityId: p.entityId,
    slug: p.slug,
    title: p.title,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    url: p.url,
    robotsIndex: p.robotsIndex,
    ogImagePresent,
    hasStructuredData: p.hasStructuredData,
    isPublished: p.isPublished,
    excludeFromSitemap: p.excludeFromSitemap,
    lastModified: p.lastModified,
    score,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Local components
// ─────────────────────────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ih-muted">
      {children}
    </th>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'good' | 'warn' | 'danger' | 'muted'
}) {
  const toneClass =
    tone === 'good'
      ? 'text-[oklch(0.4_0.14_145)]'
      : tone === 'warn'
        ? 'text-[oklch(0.5_0.14_70)]'
        : tone === 'danger'
          ? 'text-[oklch(0.5_0.18_25)]'
          : 'text-ih-ink-2'
  return (
    <div className="border border-ih-border bg-ih-surface p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted">
        {label}
      </div>
      <div className={`text-[28px] font-semibold mt-1 ${toneClass}`}>{value}</div>
    </div>
  )
}

function SelectFilter({
  name,
  label,
  value,
  children,
}: {
  name: string
  label: string
  value: string
  children: React.ReactNode
}) {
  // Server component — no hooks. The three call sites pass distinct names
  // ("type", "status", "sort") and each renders once, so the id is unique.
  const id = `seo-filter-${name}`
  return (
    <div className="min-w-[150px]">
      <label htmlFor={id} className="block font-mono text-[10px] uppercase text-ih-muted mb-1">
        {label}
      </label>
      <Select id={id} name={name} defaultValue={value} className="h-9">
        {children}
      </Select>
    </div>
  )
}

/**
 * Map an entity to the admin route that opens its SEO drawer. All 6
 * indexable entity types are wired now.
 */
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
      return `${ADMIN_PREFIX}/cms/blog/${entityId}?tab=seo`
    case 'cms_page':
      return `${ADMIN_PREFIX}/cms/pages/${entityId}?tab=seo`
    default:
      return null
  }
}

function LengthHint({ len, min, max }: { len: number; min: number; max: number }) {
  const tone =
    len === 0
      ? 'text-ih-muted'
      : len < min
        ? 'text-[oklch(0.5_0.14_70)]'
        : len > max
          ? 'text-[oklch(0.5_0.18_25)]'
          : 'text-[oklch(0.4_0.14_145)]'
  return <span className={`font-mono text-[10px] tabular-nums ${tone}`}>{len}/{max}</span>
}
