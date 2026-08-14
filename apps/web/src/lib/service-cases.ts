/**
 * /services data layer — single place to read ServiceCase rows from Prisma.
 *
 * Storefront convention: server components query directly via these helpers
 * (no API hop). All helpers respect `status: 'published'` and exclude future
 * `publishedAt` dates so scheduling works once admin scheduling is in place.
 */
import 'server-only'
import { db, Prisma } from '@indus/db'
import type { ServiceCase, ServiceCaseCategory, ServiceCaseStatus } from '@indus/db'

// Use a typed `select` so the returned shape is exactly the one consumed by
// the index/grid/related cards — Prisma's GetPayload type then carries the
// exact non-nullable + nullable contract through to component props.
const LIST_SELECT = {
  id: true,
  slug: true,
  caseNumber: true,
  category: true,
  topicLabel: true,
  region: true,
  caseDateLabel: true,
  title: true,
  titleAccent: true,
  deck: true,
  cardOneLiner: true,
  cardOutcomePills: true,
  cardDurationLabel: true,
  cardTagStyle: true,
  cardTagLabel: true,
  durationDays: true,
  savingsAmount: true,
  savingsCurrency: true,
  publishedAt: true,
  isFeatured: true,
  heroImage: { select: { storagePath: true, alt: true } },
} satisfies Prisma.ServiceCaseSelect

export type ServiceCaseListItem = Prisma.ServiceCaseGetPayload<{ select: typeof LIST_SELECT }>

const PUBLISHED_FILTER = {
  status: 'published' as ServiceCaseStatus,
  publishedAt: { not: null, lte: new Date() },
} satisfies Prisma.ServiceCaseWhereInput

// ── Sort dimensions ─────────────────────────────────────────────────────

export type ServiceCaseSort = 'recent' | 'savings' | 'tat'

const SORT_ORDER: Record<ServiceCaseSort, Prisma.ServiceCaseOrderByWithRelationInput[]> = {
  recent: [{ publishedAt: 'desc' }, { caseNumber: 'desc' }],
  savings: [{ savingsAmount: { sort: 'desc', nulls: 'last' } }, { publishedAt: 'desc' }],
  tat: [{ durationDays: { sort: 'asc', nulls: 'last' } }, { publishedAt: 'desc' }],
}

export function parseSort(raw: string | string[] | undefined): ServiceCaseSort {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === 'savings' || v === 'tat' || v === 'recent') return v
  return 'recent'
}

export function parseCategory(raw: string | string[] | undefined): ServiceCaseCategory | null {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (!v) return null
  const allowed: readonly ServiceCaseCategory[] = [
    'cylinders',
    'hoses',
    'pumps',
    'valves_manifolds',
    'bop_pressure_control',
    'ct_wireline',
    'wellhead',
    'field_service',
    'lab_forensics',
    'custom_builds',
  ]
  return (allowed as readonly string[]).includes(v) ? (v as ServiceCaseCategory) : null
}

// ── Reads ──────────────────────────────────────────────────────────────

export async function listServiceCases(opts: {
  category?: ServiceCaseCategory | null
  sort?: ServiceCaseSort
  excludeSlugs?: string[]
  limit?: number
}): Promise<ServiceCaseListItem[]> {
  const where: Prisma.ServiceCaseWhereInput = {
    ...PUBLISHED_FILTER,
    ...(opts.category ? { category: opts.category } : {}),
    ...(opts.excludeSlugs && opts.excludeSlugs.length > 0
      ? { slug: { notIn: opts.excludeSlugs } }
      : {}),
  }
  const rows = await db.serviceCase.findMany({
    where,
    select: LIST_SELECT,
    orderBy: SORT_ORDER[opts.sort ?? 'recent'],
    take: opts.limit,
  })
  return rows
}

/**
 * Featured case — Case of the Week. Falls back to most-recent published case
 * if no `isFeatured` row exists. Caller can hide if list is empty.
 */
export async function featuredServiceCase(): Promise<ServiceCaseListItem | null> {
  const featured = await db.serviceCase.findFirst({
    where: { ...PUBLISHED_FILTER, isFeatured: true },
    select: LIST_SELECT,
    orderBy: { publishedAt: 'desc' },
  })
  if (featured) return featured
  return db.serviceCase.findFirst({
    where: PUBLISHED_FILTER,
    select: LIST_SELECT,
    orderBy: { publishedAt: 'desc' },
  })
}

/**
 * Two-up "From the blog" — pulls the 2 most recent featured cases (or most
 * recent if not enough featured rows). Excludes the case currently on screen.
 */
export async function topTwoStoryCases(opts: { excludeSlugs?: string[] } = {}): Promise<
  ServiceCaseListItem[]
> {
  const where: Prisma.ServiceCaseWhereInput = {
    ...PUBLISHED_FILTER,
    ...(opts.excludeSlugs && opts.excludeSlugs.length > 0
      ? { slug: { notIn: opts.excludeSlugs } }
      : {}),
  }
  // Try featured first; fill from recent if there aren't 2 featured.
  const featured = await db.serviceCase.findMany({
    where: { ...where, isFeatured: true },
    select: LIST_SELECT,
    orderBy: { publishedAt: 'desc' },
    take: 2,
  })
  if (featured.length === 2) return featured
  const seen = new Set(featured.map((r) => r.id))
  const recent = await db.serviceCase.findMany({
    where: { ...where, id: { notIn: [...seen] } },
    select: LIST_SELECT,
    orderBy: { publishedAt: 'desc' },
    take: 2 - featured.length,
  })
  return [...featured, ...recent]
}

/** Per-category counts for the filter chips. */
export async function categoryCounts(): Promise<Record<string, number>> {
  const rows = await db.serviceCase.groupBy({
    by: ['category'],
    where: PUBLISHED_FILTER,
    _count: { _all: true },
  })
  const out: Record<string, number> = {}
  for (const r of rows) out[r.category] = r._count._all
  return out
}

/** Total published cases (for "All services <count>" chip). */
export async function totalCount(): Promise<number> {
  return db.serviceCase.count({ where: PUBLISHED_FILTER })
}

// ── Single case detail ──────────────────────────────────────────────────

const DETAIL_INCLUDE = {
  heroImage: { select: { storagePath: true, alt: true } },
  ogImage: { select: { storagePath: true, alt: true } },
} satisfies Prisma.ServiceCaseInclude

export type ServiceCaseDetail = Prisma.ServiceCaseGetPayload<{ include: typeof DETAIL_INCLUDE }>

export async function getServiceCaseBySlug(slug: string): Promise<ServiceCaseDetail | null> {
  return db.serviceCase.findFirst({
    where: { slug, ...PUBLISHED_FILTER },
    include: DETAIL_INCLUDE,
  })
}

/**
 * Resolve gallery thumb media via the `galleryImageIds` JSON array.
 * Returns rows in the original ID order for stable display.
 */
export async function getGalleryMedia(
  imageIds: string[],
): Promise<Array<{ id: string; storagePath: string; alt: string | null }>> {
  if (imageIds.length === 0) return []
  const rows = await db.media.findMany({
    where: { id: { in: imageIds } },
    select: { id: true, storagePath: true, alt: true },
  })
  const byId = new Map(rows.map((r) => [r.id, r]))
  return imageIds.flatMap((id) => {
    const row = byId.get(id)
    return row ? [row] : []
  })
}

/** All published case slugs — used for sitemap + 404 short-circuit. */
export async function listPublishedSlugs(): Promise<
  Array<{ slug: string; updatedAt: Date; publishedAt: Date | null }>
> {
  return db.serviceCase.findMany({
    where: { ...PUBLISHED_FILTER, excludeFromSitemap: false, robotsIndex: true },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: 'desc' },
  })
}
