import 'server-only'
import { db } from '@indus/db'
import { BASE_URL, crawlableImageUrl } from '../seo'
import { recordKey, type ResolvedRecord } from './blocks/render'
import type { RecordKind } from './blocks/types'

/**
 * The site records a newsletter can feature — products, categories, blog
 * articles, industries — looked up by id at render time, so a campaign
 * always shows the live title, photo and link. Only published records are
 * resolved; anything else is left out of the email (and reported by the
 * send gate as missing).
 */

export type RecordRef = { kind: RecordKind; ids: string[] }

const PATH: Record<RecordKind, (slug: string) => string> = {
  product: (s) => `/p/${s}`,
  category: (s) => `/c/${s}`,
  article: (s) => `/blog/${s}`,
  industry: (s) => `/industries/${s}`,
}

function image(storagePath: string | null | undefined): string | null {
  const url = crawlableImageUrl(storagePath)
  return url && url.startsWith('https://') ? url : url?.startsWith('/') ? `${BASE_URL}${url}` : url
}

/** Every record the refs name, keyed `${kind}:${id}`. One query per kind. */
export async function resolveRecords(refs: RecordRef[]): Promise<Map<string, ResolvedRecord>> {
  const want: Record<RecordKind, Set<string>> = { product: new Set(), category: new Set(), article: new Set(), industry: new Set() }
  for (const r of refs) for (const id of r.ids) want[r.kind].add(id)
  const out = new Map<string, ResolvedRecord>()
  const put = (rec: ResolvedRecord) => out.set(recordKey(rec.kind, rec.id), rec)

  await Promise.all([
    want.product.size
      ? db.product
          .findMany({
            where: { id: { in: [...want.product] }, status: 'active' },
            select: {
              id: true,
              slug: true,
              title: true,
              sku: true,
              brand: { select: { name: true } },
              images: { orderBy: { position: 'asc' }, take: 1, select: { alt: true, media: { select: { storagePath: true, alt: true } } } },
            },
          })
          .then((rows) =>
            rows.forEach((p) => {
              const img = p.images[0]
              put({
                kind: 'product',
                id: p.id,
                title: p.title,
                subtitle: p.brand?.name ?? null,
                meta: p.sku,
                url: `${BASE_URL}${PATH.product(p.slug)}`,
                imageUrl: image(img?.media.storagePath),
                imageAlt: img?.alt ?? img?.media.alt ?? p.title,
              })
            }),
          )
      : null,
    want.category.size
      ? db.category
          .findMany({
            where: { id: { in: [...want.category] }, isPublished: true },
            select: { id: true, slug: true, name: true, shortDescription: true, image: { select: { storagePath: true, alt: true } } },
          })
          .then((rows) =>
            rows.forEach((c) =>
              put({
                kind: 'category',
                id: c.id,
                title: c.name,
                subtitle: c.shortDescription ?? null,
                url: `${BASE_URL}${PATH.category(c.slug)}`,
                imageUrl: image(c.image?.storagePath),
                imageAlt: c.image?.alt ?? c.name,
              }),
            ),
          )
      : null,
    want.article.size
      ? db.blogPost
          .findMany({
            where: { id: { in: [...want.article] }, status: 'published', deletedAt: null },
            select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true, hero: { select: { storagePath: true, alt: true } } },
          })
          .then((rows) =>
            rows.forEach((b) =>
              put({
                kind: 'article',
                id: b.id,
                title: b.title,
                subtitle: b.excerpt ?? null,
                meta: b.publishedAt ? b.publishedAt.toISOString().slice(0, 10) : null,
                url: `${BASE_URL}${PATH.article(b.slug)}`,
                imageUrl: image(b.hero?.storagePath),
                imageAlt: b.hero?.alt ?? b.title,
              }),
            ),
          )
      : null,
    want.industry.size
      ? db.industry
          .findMany({
            where: { id: { in: [...want.industry] }, isPublished: true },
            select: { id: true, slug: true, name: true, tagline: true, hero: { select: { storagePath: true, alt: true } } },
          })
          .then((rows) =>
            rows.forEach((i) =>
              put({
                kind: 'industry',
                id: i.id,
                title: i.name,
                subtitle: i.tagline ?? null,
                url: `${BASE_URL}${PATH.industry(i.slug)}`,
                imageUrl: image(i.hero?.storagePath),
                imageAlt: i.hero?.alt ?? i.name,
              }),
            ),
          )
      : null,
  ])
  return out
}

export type RecordOption = { id: string; label: string; hint: string }

/** Up to 20 published records matching a search, for the designer's picker. */
export async function searchRecords(kind: RecordKind, q: string): Promise<RecordOption[]> {
  const term = q.trim().slice(0, 100)
  const take = 20
  switch (kind) {
    case 'product':
      return (
        await db.product.findMany({
          where: {
            status: 'active',
            ...(term ? { OR: [{ title: { contains: term, mode: 'insensitive' } }, { sku: { contains: term, mode: 'insensitive' } }] } : {}),
          },
          orderBy: { updatedAt: 'desc' },
          take,
          select: { id: true, title: true, sku: true },
        })
      ).map((p) => ({ id: p.id, label: p.title, hint: p.sku }))
    case 'category':
      return (
        await db.category.findMany({
          where: { isPublished: true, ...(term ? { name: { contains: term, mode: 'insensitive' } } : {}) },
          orderBy: { name: 'asc' },
          take,
          select: { id: true, name: true, slug: true },
        })
      ).map((c) => ({ id: c.id, label: c.name, hint: `/c/${c.slug}` }))
    case 'article':
      return (
        await db.blogPost.findMany({
          where: { status: 'published', deletedAt: null, ...(term ? { title: { contains: term, mode: 'insensitive' } } : {}) },
          orderBy: { publishedAt: 'desc' },
          take,
          select: { id: true, title: true, publishedAt: true },
        })
      ).map((b) => ({ id: b.id, label: b.title, hint: b.publishedAt?.toISOString().slice(0, 10) ?? '' }))
    case 'industry':
      return (
        await db.industry.findMany({
          where: { isPublished: true, ...(term ? { name: { contains: term, mode: 'insensitive' } } : {}) },
          orderBy: { position: 'asc' },
          take,
          select: { id: true, name: true, slug: true },
        })
      ).map((i) => ({ id: i.id, label: i.name, hint: `/industries/${i.slug}` }))
  }
}

/** The most recent published records of a kind — what the starters fill themselves with. */
export async function latestRecordIds(kind: RecordKind, n: number): Promise<RecordOption[]> {
  return (await searchRecords(kind, '')).slice(0, n)
}
