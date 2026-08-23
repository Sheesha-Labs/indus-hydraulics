import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { db } from '@indus/db'
import { DESIGNED_INDUSTRY_PAGES } from '@indus/domain'

/**
 * Storefront-facing helpers for the DB-backed Industry rows landed in
 * the Tier C migration. The structured JSON columns (chips, stats,
 * deliveryAreas, supportBlock) are typed at the read site here so the
 * page routes can consume them as plain objects without re-asserting
 * shapes everywhere.
 *
 * Cache: industries change rarely; we wrap in `unstable_cache` with
 * a 5-minute revalidate. Admin actions that mutate industries should
 * call `revalidateTag('industries')` so the storefront picks up the
 * change immediately.
 */

export type IndustryStat = { value: string; label: string }

export type IndustryDeliveryArea = {
  category: string
  title: string
  description: string
  skuCount: string
}

export type IndustrySupportBlock = {
  eyebrow: string
  headline: string
  description: string
  bullets: string[]
  cta: string
}

export type IndustryCaseStudy = {
  id: string
  tag: string
  title: string
  description: string
  year: string | null
  imageUrl: string | null
  position: number
}

export type IndustryListItem = {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  gradient: string | null
  chips: string[]
  position: number
}

export type IndustryDetail = IndustryListItem & {
  headline: string | null
  breadcrumb: string | null
  stats: IndustryStat[]
  deliveryAreas: IndustryDeliveryArea[]
  supportBlock: IndustrySupportBlock | null
  featuredProductSkus: string[]
  featuredCategorySlugs: string[]
  seoTitle: string | null
  seoDescription: string | null
  canonicalUrl: string | null
  ogImageStoragePath: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  caseStudies: IndustryCaseStudy[]
}

// ── Shape narrowing for the JSON columns ──────────────────────────────────

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

function asStats(v: unknown): IndustryStat[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
    .map((x) => ({
      value: typeof x.value === 'string' ? x.value : '',
      label: typeof x.label === 'string' ? x.label : '',
    }))
    .filter((s) => s.value || s.label)
}

function asDeliveryAreas(v: unknown): IndustryDeliveryArea[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
    .map((x) => ({
      category: typeof x.category === 'string' ? x.category : '',
      title: typeof x.title === 'string' ? x.title : '',
      description: typeof x.description === 'string' ? x.description : '',
      skuCount: typeof x.skuCount === 'string' ? x.skuCount : '',
    }))
    .filter((d) => d.title || d.category)
}

function asSupportBlock(v: unknown): IndustrySupportBlock | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  return {
    eyebrow: typeof o.eyebrow === 'string' ? o.eyebrow : '',
    headline: typeof o.headline === 'string' ? o.headline : '',
    description: typeof o.description === 'string' ? o.description : '',
    bullets: asStringArray(o.bullets),
    cta: typeof o.cta === 'string' ? o.cta : '',
  }
}

// ── Loaders ───────────────────────────────────────────────────────────────

const loadIndustryList = unstable_cache(
  async (): Promise<IndustryListItem[]> => {
    const rows = await db.industry.findMany({
      where: { isPublished: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        description: true,
        gradient: true,
        chips: true,
        position: true,
      },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      description: r.description,
      gradient: r.gradient,
      chips: asStringArray(r.chips),
      position: r.position,
    }))
  },
  ['industries-list'],
  { revalidate: 300, tags: ['industries'] },
)

/**
 * The designed pages, shaped as index cards.
 *
 * They have no `industries` row — their route is dispatched from the code
 * registry before the table is read — so without this they would be reachable
 * only by typing the URL. Position is negative so a designed page leads the
 * grid: it is the one the paid traffic is pointed at, and the index is ordered
 * by `position` ascending.
 *
 * `id` and `gradient` are the two fields with nothing behind them. `id` is a
 * synthetic key the grid uses for nothing but React reconciliation, and the
 * gradient is deliberately null so the card takes the shared default rather
 * than a colour invented for one page.
 */
function designedIndustryCards(): IndustryListItem[] {
  return DESIGNED_INDUSTRY_PAGES.map((page, i) => ({
    id: `designed:${page.slug}`,
    slug: page.slug,
    name: page.card.name,
    tagline: page.card.tagline,
    description: page.card.description,
    gradient: null,
    chips: [...page.card.chips],
    position: -DESIGNED_INDUSTRY_PAGES.length + i,
  }))
}

const loadIndustryBySlug = unstable_cache(
  async (slug: string): Promise<IndustryDetail | null> => {
    const ind = await db.industry.findUnique({
      where: { slug },
      include: {
        hero: { select: { storagePath: true } },
        caseStudies: {
          where: { isPublished: true },
          orderBy: { position: 'asc' },
          include: { image: { select: { storagePath: true } } },
        },
      },
    })
    if (!ind || !ind.isPublished) return null

    return {
      id: ind.id,
      slug: ind.slug,
      name: ind.name,
      tagline: ind.tagline,
      description: ind.description,
      headline: ind.headline,
      breadcrumb: ind.breadcrumb,
      gradient: ind.gradient,
      position: ind.position,
      chips: asStringArray(ind.chips),
      stats: asStats(ind.stats),
      deliveryAreas: asDeliveryAreas(ind.deliveryAreas),
      supportBlock: asSupportBlock(ind.supportBlock),
      featuredProductSkus: asStringArray(ind.featuredProductSkus),
      featuredCategorySlugs: asStringArray(ind.featuredCategorySlugs),
      seoTitle: ind.seoTitle,
      seoDescription: ind.seoDescription,
      canonicalUrl: ind.canonicalUrl,
      ogImageStoragePath: ind.hero?.storagePath ?? null,
      robotsIndex: ind.robotsIndex,
      robotsFollow: ind.robotsFollow,
      caseStudies: ind.caseStudies.map((c) => ({
        id: c.id,
        tag: c.tag,
        title: c.title,
        description: c.description,
        year: c.year,
        imageUrl: c.image?.storagePath ?? null,
        position: c.position,
      })),
    }
  },
  ['industry-detail'],
  { revalidate: 300, tags: ['industries'] },
)

/**
 * The index grid's rows: the designed pages first, then the published table
 * rows, in `position` order. Merging here rather than in the page keeps the
 * grid a single sorted list — the alternative was a second grid above the
 * first, which reads as two categories of industry when there is only one.
 */
export const getIndustryList = cache(async (): Promise<IndustryListItem[]> => {
  const rows = await loadIndustryList()
  return [...designedIndustryCards(), ...rows].sort(
    (a, b) => a.position - b.position || a.name.localeCompare(b.name),
  )
})
export const getIndustryBySlug = cache(async (slug: string) => loadIndustryBySlug(slug))

/** Sitemap helper — slugs + lastModified for the sitemap route. */
export const getIndustrySitemapEntries = unstable_cache(
  async () => {
    return db.industry.findMany({
      where: { isPublished: true, excludeFromSitemap: false, robotsIndex: true },
      select: {
        slug: true,
        seoUpdatedAt: true,
        sitemapPriority: true,
        sitemapChangeFreq: true,
      },
      orderBy: { position: 'asc' },
    })
  },
  ['industries-sitemap'],
  { revalidate: 300, tags: ['industries'] },
)
