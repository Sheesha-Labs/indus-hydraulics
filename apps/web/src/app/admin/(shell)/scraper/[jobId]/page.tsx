import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '../../../../../lib/admin-auth'
import { hasRole, ROLES } from '../../../../../lib/rbac'
import { db, Prisma } from '@indus/db'
import { cancelJob } from '../actions'
import { slugifyLastPathSegment } from '../../../../../lib/scraper/sku'
import { matchTextToOption } from '../../../../../lib/scraper/match'
import AutoRefresh from './AutoRefresh'
import JobFilters from './JobFilters'
import BulkActions from './BulkActions'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import ScrapedRowCard, {
  type ScrapedRowData,
  type BrandOption,
  type CategoryOption,
} from './ScrapedRowCard'

export const metadata: Metadata = { title: 'Crawl detail — Indus Admin' }

type SearchParams = {
  status?: string
  q?: string
  page?: string
}

type Props = {
  params: Promise<{ jobId: string }>
  searchParams: Promise<SearchParams>
}

const PAGE_SIZE = 25

const STATUS_LABELS = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
} as const

const STATUS_STYLES: Record<keyof typeof STATUS_LABELS, string> = {
  queued: 'text-ih-muted bg-ih-surface-2',
  running: 'text-[oklch(0.4_0.14_85)] bg-[oklch(0.94_0.06_85)]',
  completed: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]',
  failed: 'text-[oklch(0.4_0.18_25)] bg-[oklch(0.94_0.06_25)]',
  cancelled: 'text-ih-muted bg-ih-surface-2',
}

const SELECTION_VALUES = ['pending', 'selected', 'skipped', 'ingested', 'ingest_failed'] as const
type SelectionStatus = (typeof SELECTION_VALUES)[number]

export default async function ScraperJobDetailPage({ params, searchParams }: Props) {
  const [{ jobId }, sp, session] = await Promise.all([params, searchParams, auth()])
  if (!hasRole(session, ROLES.COMPETITOR_SCRAPE)) redirect('/admin')

  const filterStatus = SELECTION_VALUES.includes(sp.status as SelectionStatus)
    ? (sp.status as SelectionStatus)
    : ''
  const q = (sp.q ?? '').trim()
  const pageN = Math.max(1, Number(sp.page ?? '1') || 1)

  const job = await db.scraperJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      code: true,
      hostname: true,
      sourceUrl: true,
      status: true,
      totalFound: true,
      errorMessage: true,
      startedAt: true,
      finishedAt: true,
      createdAt: true,
      notes: true,
    },
  })
  if (!job) notFound()

  const [brandsRaw, categoriesRaw, countsRaw] = await Promise.all([
    db.brand.findMany({ where: { isPublished: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, parentId: true },
    }),
    db.scrapedProduct.groupBy({
      by: ['selectionStatus'],
      where: { jobId },
      _count: { _all: true },
    }),
  ])

  const counts: Record<SelectionStatus, number> = {
    pending: 0,
    selected: 0,
    skipped: 0,
    ingested: 0,
    ingest_failed: 0,
  }
  for (const c of countsRaw) counts[c.selectionStatus] = c._count._all

  // Build the row query.
  const where: Prisma.ScrapedProductWhereInput = { jobId }
  if (filterStatus) where.selectionStatus = filterStatus
  if (q) {
    where.OR = [
      { sourceTitle: { contains: q, mode: 'insensitive' } },
      { sourceSku: { contains: q, mode: 'insensitive' } },
      { editedTitle: { contains: q, mode: 'insensitive' } },
      { editedSku: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [totalMatched, rowsRaw] = await Promise.all([
    db.scrapedProduct.count({ where }),
    db.scrapedProduct.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip: (pageN - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        sourceUrl: true,
        sourceTitle: true,
        sourceSku: true,
        sourceBrandText: true,
        sourceCategoryText: true,
        candidateImages: true,
        deselectedImageUrls: true,
        selectionStatus: true,
        ingestMode: true,
        targetProductId: true,
        editedTitle: true,
        editedSku: true,
        mappedBrandId: true,
        mappedCategoryId: true,
        ingestedProductId: true,
        ingestError: true,
      },
    }),
  ])

  // Preload attach-target details for rows in attach mode.
  const attachTargetIds = Array.from(
    new Set(rowsRaw.flatMap((r) => (r.ingestMode === 'attach_to_existing' && r.targetProductId ? [r.targetProductId] : []))),
  )
  const attachTargets =
    attachTargetIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: attachTargetIds } },
          select: {
            id: true,
            sku: true,
            title: true,
            slug: true,
            brand: { select: { name: true } },
            _count: { select: { images: true } },
          },
        })
      : []
  const attachTargetById = new Map(
    attachTargets.map((p) => [
      p.id,
      {
        id: p.id,
        sku: p.sku,
        title: p.title,
        slug: p.slug,
        brandName: p.brand?.name ?? null,
        imageCount: p._count.images,
      },
    ]),
  )

  // Pre-compute auto-suggestions + SKU clash detection for the current page.
  // - For rows that haven't picked a Brand/Category yet, fuzzy-match the
  //   scraped text against existing options. The card renders the suggestion
  //   greyed-out next to the dropdown so the operator can accept with one
  //   click instead of scrolling a long list.
  // - For rows whose effective SKU already exists in the catalogue, we mark
  //   `hasSkuClash` so the card shows a "DUPE" badge.
  const effectiveSkuByRowId = new Map<string, string>()
  for (const r of rowsRaw) {
    const s = (r.editedSku?.trim() || r.sourceSku?.trim() || slugifyLastPathSegment(r.sourceUrl)).slice(0, 64)
    if (s) effectiveSkuByRowId.set(r.id, s)
  }
  const skuSet = Array.from(new Set(effectiveSkuByRowId.values()))
  const clashedSkus =
    skuSet.length > 0
      ? new Set(
          (
            await db.product.findMany({
              where: { sku: { in: skuSet } },
              select: { sku: true },
            })
          ).map((p) => p.sku),
        )
      : new Set<string>()

  const brandOptionsForMatch = brandsRaw.map((b) => ({ id: b.id, name: b.name }))
  const categoryOptionsForMatch = categoriesRaw.map((c) => ({ id: c.id, name: c.name }))

  const rows: ScrapedRowData[] = rowsRaw.map((r) => {
    const effectiveSku = effectiveSkuByRowId.get(r.id) ?? ''
    const suggestedBrand =
      r.mappedBrandId === null ? matchTextToOption(r.sourceBrandText, brandOptionsForMatch) : null
    const suggestedCategory =
      r.mappedCategoryId === null
        ? matchTextToOption(r.sourceCategoryText, categoryOptionsForMatch)
        : null

    return {
      id: r.id,
      sourceUrl: r.sourceUrl,
      sourceTitle: r.sourceTitle,
      sourceSku: r.sourceSku,
      sourceBrandText: r.sourceBrandText,
      sourceCategoryText: r.sourceCategoryText,
      candidateImages: (r.candidateImages ?? []) as unknown as ScrapedRowData['candidateImages'],
      deselectedImageUrls: ((r.deselectedImageUrls ?? []) as unknown as string[]) ?? [],
      selectionStatus: r.selectionStatus,
      ingestMode: r.ingestMode,
      targetProduct:
        r.ingestMode === 'attach_to_existing' && r.targetProductId
          ? attachTargetById.get(r.targetProductId) ?? null
          : null,
      editedTitle: r.editedTitle,
      editedSku: r.editedSku,
      mappedBrandId: r.mappedBrandId,
      mappedCategoryId: r.mappedCategoryId,
      ingestedProductId: r.ingestedProductId,
      ingestError: r.ingestError,
      defaultSku: slugifyLastPathSegment(r.sourceUrl),
      hasSkuClash: clashedSkus.has(effectiveSku),
      suggestedBrand: suggestedBrand ? { id: suggestedBrand.id, name: suggestedBrand.name } : null,
      suggestedCategory: suggestedCategory
        ? { id: suggestedCategory.id, name: suggestedCategory.name }
        : null,
    }
  })

  const brands: BrandOption[] = brandsRaw.map((b) => ({ id: b.id, name: b.name }))
  const categories: CategoryOption[] = flattenCategories(categoriesRaw)

  const isLive = job.status === 'queued' || job.status === 'running'
  const jobReady = job.status === 'completed'
  const totalPages = Math.max(1, Math.ceil(totalMatched / PAGE_SIZE))

  return (
    <AdminPageShell
      // font-mono kept: this title is a job CODE, and §2.6 puts machine-readable
      // content in mono.
      title={<span className="font-mono">{job.code}</span>}
      sub={<span className="break-all">{job.sourceUrl}</span>}
      actions={
        <>
          {/* The status badge and the live indicator travel WITH the title —
              they qualify it, and dropping them (v2's actions slot is nominally
              buttons-only) would remove the only signal that a crawl is still
              running. */}
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${STATUS_STYLES[job.status]}`}>
            {STATUS_LABELS[job.status]}
          </span>
          {isLive && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-ih-muted">
              Auto-refreshing every 3s
            </span>
          )}
          <Link
            href="/admin/scraper"
            className="flex h-9 items-center rounded-md border border-ih-border bg-ih-surface px-4 text-[13px] font-medium transition-colors hover:border-ih-accent hover:text-ih-accent"
          >
            ← Back to crawls
          </Link>
        </>
      }
    >
      <AutoRefresh active={isLive} />

      {job.notes && <p className="mb-6 text-[12px] text-ih-ink-2">{job.notes}</p>}

      {/* Stat tiles */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <Stat label="Host" value={job.hostname} />
        <Stat label="Discovered" value={String(job.totalFound)} />
        <Stat label="Selected" value={String(counts.selected)} />
        <Stat label="Skipped" value={String(counts.skipped)} />
        <Stat label="Ingested" value={String(counts.ingested)} />
        <Stat label="Failed" value={String(counts.ingest_failed)} highlight={counts.ingest_failed > 0} />
      </section>

      {/* Timeline */}
      <section className="border border-ih-border bg-ih-bg p-4 mb-6 text-[12px]">
        <h2 className="font-mono uppercase tracking-wider text-[10px] text-ih-muted mb-3">Timeline</h2>
        <dl className="grid grid-cols-3 gap-x-6 gap-y-1.5">
          <Time label="Created" value={job.createdAt} />
          <Time label="Started" value={job.startedAt} />
          <Time label="Finished" value={job.finishedAt} />
        </dl>
      </section>

      {job.errorMessage && (
        <section role="alert" className="border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] p-4 mb-6">
          <h2 className="font-mono uppercase tracking-wider text-[10px] text-[oklch(0.4_0.18_25)] mb-1">Error</h2>
          <p className="text-[13px] text-[oklch(0.3_0.18_25)]">{job.errorMessage}</p>
        </section>
      )}

      {/* Top actions: Cancel (live) + Bulk Ingest (completed) */}
      <section className="flex items-center gap-3 mb-6 flex-wrap">
        {isLive && (
          <form
            action={async () => {
              'use server'
              const r = await cancelJob(jobId)
              if (!r.success) throw new Error(r.message)
            }}
          >
            <button
              type="submit"
              className="h-9 px-4 border border-[oklch(0.4_0.18_25)] text-[oklch(0.4_0.18_25)] font-mono text-[12px] uppercase tracking-wider hover:bg-[oklch(0.97_0.04_25)]"
            >
              Cancel crawl
            </button>
          </form>
        )}
        <BulkActions jobId={jobId} selectedCount={counts.selected} jobReady={jobReady} />
      </section>

      {/* Rows */}
      {job.totalFound === 0 ? (
        <section className="border border-ih-border bg-ih-bg p-6">
          <p className="text-[13px] text-ih-ink-2">
            {job.status === 'queued'
              ? 'Crawl is queued — waiting for the background worker.'
              : job.status === 'running'
              ? 'Crawl is running. Discovered products will appear here.'
              : 'No products discovered.'}
          </p>
        </section>
      ) : (
        <>
          <JobFilters counts={counts as Record<string, number>} q={q} status={filterStatus} />
          <div className="flex flex-col gap-4">
            {rows.length === 0 ? (
              <p className="text-[13px] text-ih-muted px-4 py-6 text-center bg-ih-bg border border-ih-border">
                No products match this filter.
              </p>
            ) : (
              rows.map((r) => (
                <ScrapedRowCard
                  key={r.id}
                  row={r}
                  brands={brands}
                  categories={categories}
                  jobReady={jobReady}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-2 text-[12px]" aria-label="Pagination">
              <PageLink page={pageN - 1} disabled={pageN <= 1} label="← Prev" filterStatus={filterStatus} q={q} />
              <span className="text-ih-muted font-mono">
                Page {pageN} of {totalPages}
              </span>
              <PageLink page={pageN + 1} disabled={pageN >= totalPages} label="Next →" filterStatus={filterStatus} q={q} />
            </nav>
          )}
        </>
      )}
    </AdminPageShell>
  )
}

function PageLink({
  page,
  disabled,
  label,
  filterStatus,
  q,
}: {
  page: number
  disabled: boolean
  label: string
  filterStatus: string
  q: string
}) {
  const params = new URLSearchParams()
  if (filterStatus) params.set('status', filterStatus)
  if (q) params.set('q', q)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  const href = qs ? `?${qs}` : '?'

  if (disabled) {
    return (
      <span className="h-8 px-3 grid place-items-center border border-ih-border text-ih-muted opacity-50 font-mono">
        {label}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className="h-8 px-3 grid place-items-center border border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 font-mono"
    >
      {label}
    </Link>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`border bg-ih-bg px-3 py-2 ${
        highlight ? 'border-[oklch(0.4_0.18_25)]' : 'border-ih-border'
      }`}
    >
      <div className="font-mono uppercase tracking-wider text-[10px] text-ih-muted">{label}</div>
      <div className={`text-[16px] font-semibold ${highlight ? 'text-[oklch(0.4_0.18_25)]' : 'text-ih-ink'}`}>
        {value}
      </div>
    </div>
  )
}

function Time({ label, value }: { label: string; value: Date | null }) {
  return (
    <>
      <dt className="font-mono uppercase tracking-wider text-[10px] text-ih-muted">{label}</dt>
      <dd className="col-span-2 text-[12px] text-ih-ink-2">
        {value ? value.toISOString().replace('T', ' ').slice(0, 19) + ' UTC' : '—'}
      </dd>
    </>
  )
}

/**
 * Flatten the (potentially nested) `Category` rows into a depth-tagged list
 * for the indent-prefixed dropdown. Topologically ordered: parents emit
 * before their children.
 */
function flattenCategories(
  rows: Array<{ id: string; name: string; parentId: string | null }>,
): CategoryOption[] {
  const byParent = new Map<string | null, typeof rows>()
  for (const r of rows) {
    const arr = byParent.get(r.parentId) ?? []
    arr.push(r)
    byParent.set(r.parentId, arr)
  }
  const out: CategoryOption[] = []
  function walk(parentId: string | null, depth: number) {
    const kids = (byParent.get(parentId) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name))
    for (const k of kids) {
      out.push({ id: k.id, name: k.name, depth })
      walk(k.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}
