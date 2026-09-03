import 'server-only'

import { cache } from 'react'
import { db } from '@indus/db'
import {
  buildMediaUsageIndex,
  collectHtmlMediaUrls,
  collectMediaIdsFromBlocks,
  htmlMentionsStoragePath,
  isAbsoluteMediaUrl,
  normaliseMediaUrl,
  type MediaUsage,
  type MediaUsageIndex,
} from '@indus/domain'

import { adminPath } from '../admin-paths'

/**
 * Resolves "what is using this media file?" against the database.
 *
 * Phase 4 of 9 of the media library rebuild. The rules live in
 * `@indus/domain/media-usage`; this is the part that talks to Postgres.
 *
 * ── Why this is more than a join ────────────────────────────────────────────
 *
 * Media is referenced four structurally different ways, and only the first is
 * visible to an ordinary Prisma relation query:
 *
 *   1. 22 declared FK relations across 17 models.
 *   2. 9 `ogImageMediaId` / `ogDefaultImageId` columns that hold a media id but
 *      were never wired up as relations. Invisible to `_count`, invisible to
 *      `include`. Miss these and every social-share image reads as unused.
 *   3. Media ids inside JSON — `figure` blocks in `bodyBlocks`, and
 *      `ServiceCase.galleryImageIds`.
 *   4. Absolute storage URLs pasted into legacy HTML bodies (`BlogPost.body`,
 *      `CmsPage.body`), which have no id reference at all.
 *
 * The page this replaces counts 2 of the 22 relations from group 1 and nothing
 * else, so an image on a homepage slide or a brand logo currently displays
 * "used 0×" — which is exactly the number that would enable a delete button.
 *
 * ── The failure contract ────────────────────────────────────────────────────
 *
 * Every source is isolated. A source that throws is named in `failedSources`
 * and never contributes an empty result, because "no usages" is what unlocks
 * deletion. See `canTrash` in the domain module.
 *
 * ── Cost ────────────────────────────────────────────────────────────────────
 *
 * One pass over every media row, not per page of results, because the folder
 * rail counts need the whole picture. That is affordable at the current shape
 * of the data — 665 media rows, 388 product images, 328 nav items, 171
 * categories, 20 service cases, 11 blog posts, 0 CMS pages — and every source
 * is a single indexed query. Groups 3 and 4 read their tables once and build a
 * lookup set, rather than comparing every asset against every body: Bazar's
 * equivalent is 1,000 articles × 200 assets = 200,000 substring scans on every
 * page load.
 *
 * If the catalogue grows enough for this to hurt, the fix is to cache the
 * index against a tag rather than to scope it — the counts genuinely need
 * every row.
 */

/** One (mediaId, usage) pair. A media row can collect many. */
type Entry = readonly [mediaId: string, usage: MediaUsage]

interface Source {
  /** Named in `failedSources` and shown to the user when this source breaks. */
  readonly name: string
  readonly run: () => Promise<Entry[]>
}

function nonEmpty(value: string | null | undefined, fallback: string): string {
  const t = (value ?? '').trim()
  return t.length > 0 ? t : fallback
}

// ── Sources ─────────────────────────────────────────────────────────────────
// Grouped as they appear in the admin sidebar. Each returns every usage it can
// see across the whole table; nothing is scoped to a page of results.

function catalogueSources(): Source[] {
  return [
    {
      name: 'product images',
      run: async () => {
        const rows = await db.productImage.findMany({
          select: {
            mediaId: true,
            product: { select: { id: true, title: true, sku: true, status: true } },
          },
        })
        return rows.map(
          (r) =>
            [
              r.mediaId,
              {
                kind: 'product',
                id: r.product.id,
                label: nonEmpty(r.product.title, r.product.sku),
                role: 'Image',
                href: adminPath(`/products/${r.product.id}/edit`),
                live: r.product.status === 'active',
                internal: false,
              },
            ] as const
        )
      },
    },
    {
      name: 'product documents',
      run: async () => {
        const rows = await db.productDocument.findMany({
          select: {
            mediaId: true,
            kind: true,
            product: { select: { id: true, title: true, sku: true, status: true } },
          },
        })
        return rows.map(
          (r) =>
            [
              r.mediaId,
              {
                kind: 'product',
                id: r.product.id,
                label: nonEmpty(r.product.title, r.product.sku),
                role: DOCUMENT_ROLES[r.kind] ?? 'Document',
                href: adminPath(`/products/${r.product.id}/edit`),
                live: r.product.status === 'active',
                internal: false,
              },
            ] as const
        )
      },
    },
    {
      // Group 2 — a plain String column, no relation. Nothing but an explicit
      // query will ever see this.
      name: 'product social images',
      run: async () => {
        const rows = await db.product.findMany({
          where: { ogImageMediaId: { not: null } },
          select: { id: true, title: true, sku: true, status: true, ogImageMediaId: true },
        })
        return rows.map(
          (r) =>
            [
              r.ogImageMediaId as string,
              {
                kind: 'product',
                id: r.id,
                label: nonEmpty(r.title, r.sku),
                role: 'Social image',
                href: adminPath(`/products/${r.id}/edit`),
                live: r.status === 'active',
                internal: false,
              },
            ] as const
        )
      },
    },
    {
      name: 'categories',
      run: async () => {
        const rows = await db.category.findMany({
          where: { OR: [{ imageId: { not: null } }, { ogImageMediaId: { not: null } }] },
          select: {
            id: true,
            name: true,
            isPublished: true,
            imageId: true,
            ogImageMediaId: true,
          },
        })
        return rows.flatMap((r) =>
          slots(r.id, nonEmpty(r.name, 'Untitled category'), 'category', r.isPublished, [
            [r.imageId, 'Image'],
            [r.ogImageMediaId, 'Social image'],
          ]).map(withHref(adminPath(`/categories/${r.id}/edit`)))
        )
      },
    },
    {
      name: 'brands',
      run: async () => {
        const rows = await db.brand.findMany({
          where: {
            OR: [
              { logoId: { not: null } },
              { heroId: { not: null } },
              { ogImageMediaId: { not: null } },
            ],
          },
          select: {
            id: true,
            name: true,
            isPublished: true,
            logoId: true,
            heroId: true,
            ogImageMediaId: true,
          },
        })
        return rows.flatMap((r) =>
          slots(r.id, nonEmpty(r.name, 'Untitled brand'), 'brand', r.isPublished, [
            [r.logoId, 'Logo'],
            [r.heroId, 'Hero'],
            [r.ogImageMediaId, 'Social image'],
          ]).map(withHref(adminPath(`/brands/${r.id}/edit`)))
        )
      },
    },
    {
      name: 'brand case studies',
      run: async () => {
        const rows = await db.brandCaseStudy.findMany({
          where: { imageId: { not: null } },
          select: {
            imageId: true,
            title: true,
            isPublished: true,
            brand: { select: { id: true, name: true, isPublished: true } },
          },
        })
        return rows.map(
          (r) =>
            [
              r.imageId as string,
              {
                kind: 'brand',
                id: r.brand.id,
                label: `${nonEmpty(r.brand.name, 'Brand')} — ${nonEmpty(r.title, 'case study')}`,
                role: 'Case study',
                href: adminPath(`/brands/${r.brand.id}/edit`),
                // Both gates matter: an published case study on an unpublished
                // brand is not reachable by anyone.
                live: r.isPublished && r.brand.isPublished,
                internal: false,
              },
            ] as const
        )
      },
    },
    {
      name: 'industries',
      run: async () => {
        const rows = await db.industry.findMany({
          where: { OR: [{ heroId: { not: null } }, { ogImageMediaId: { not: null } }] },
          select: {
            id: true,
            name: true,
            isPublished: true,
            heroId: true,
            ogImageMediaId: true,
          },
        })
        return rows.flatMap((r) =>
          slots(r.id, nonEmpty(r.name, 'Untitled industry'), 'industry', r.isPublished, [
            [r.heroId, 'Hero'],
            [r.ogImageMediaId, 'Social image'],
          ]).map(withHref(adminPath(`/industries/${r.id}/edit`)))
        )
      },
    },
    {
      name: 'industry case studies',
      run: async () => {
        const rows = await db.industryCaseStudy.findMany({
          where: { imageId: { not: null } },
          select: {
            imageId: true,
            title: true,
            isPublished: true,
            industry: { select: { id: true, name: true, isPublished: true } },
          },
        })
        return rows.map(
          (r) =>
            [
              r.imageId as string,
              {
                kind: 'industry',
                id: r.industry.id,
                label: `${nonEmpty(r.industry.name, 'Industry')} — ${nonEmpty(r.title, 'case study')}`,
                role: 'Case study',
                href: adminPath(`/industries/${r.industry.id}/edit`),
                live: r.isPublished && r.industry.isPublished,
                internal: false,
              },
            ] as const
        )
      },
    },
  ]
}

function contentSources(): Source[] {
  return [
    {
      // ServiceCase has no admin editor, so every usage here carries href:null
      // rather than a link that goes nowhere.
      name: 'service cases',
      run: async () => {
        const rows = await db.serviceCase.findMany({
          select: {
            id: true,
            title: true,
            status: true,
            heroImageId: true,
            ogImageMediaId: true,
            bodyBlocks: true,
            galleryImageIds: true,
          },
        })
        return rows.flatMap((r) => {
          const live = r.status === 'published'
          const label = nonEmpty(r.title, 'Untitled service case')
          const out: Entry[] = slots(r.id, label, 'service_case', live, [
            [r.heroImageId, 'Hero'],
            [r.ogImageMediaId, 'Social image'],
          ])

          // Group 3 — ids buried in JSON.
          for (const id of collectMediaIdsFromBlocks(r.bodyBlocks)) {
            out.push([id, usageOf('service_case', r.id, label, 'In body', null, live)])
          }
          for (const id of collectMediaIdsFromBlocks({ galleryImageIds: r.galleryImageIds })) {
            out.push([id, usageOf('service_case', r.id, label, 'Gallery', null, live)])
          }
          return out
        })
      },
    },
    {
      name: 'blog posts',
      run: async () => {
        const rows = await db.blogPost.findMany({
          select: {
            id: true,
            title: true,
            status: true,
            isPublished: true,
            deletedAt: true,
            heroId: true,
            ogImageMediaId: true,
            bodyBlocks: true,
          },
        })
        return rows.flatMap((r) => {
          // A trashed post is not live whatever its status says.
          const live = r.status === 'published' && r.isPublished && r.deletedAt === null
          const label = nonEmpty(r.title, 'Untitled post')
          const href = adminPath(`/blog/${r.id}`)
          const out: Entry[] = slots(r.id, label, 'blog_post', live, [
            [r.heroId, 'Hero'],
            [r.ogImageMediaId, 'Social image'],
          ]).map(withHref(href))

          for (const id of collectMediaIdsFromBlocks(r.bodyBlocks)) {
            out.push([id, usageOf('blog_post', r.id, label, 'In body', href, live)])
          }
          return out
        })
      },
    },
    {
      // BlogCategory and BlogAuthor have no editors of their own — /admin/blog
      // is a list of posts, not a way to reach either — so href stays null.
      name: 'blog taxonomy',
      run: async () => {
        const [categories, authors] = await Promise.all([
          db.blogCategory.findMany({
            where: { OR: [{ imageId: { not: null } }, { ogImageMediaId: { not: null } }] },
            select: { id: true, name: true, isPublished: true, imageId: true, ogImageMediaId: true },
          }),
          db.blogAuthor.findMany({
            where: { OR: [{ avatarMediaId: { not: null } }, { ogImageMediaId: { not: null } }] },
            select: {
              id: true,
              name: true,
              isPublished: true,
              avatarMediaId: true,
              ogImageMediaId: true,
            },
          }),
        ])
        return [
          ...categories.flatMap((r) =>
            slots(r.id, nonEmpty(r.name, 'Untitled category'), 'blog_category', r.isPublished, [
              [r.imageId, 'Image'],
              [r.ogImageMediaId, 'Social image'],
            ])
          ),
          ...authors.flatMap((r) =>
            slots(r.id, nonEmpty(r.name, 'Unnamed author'), 'blog_author', r.isPublished, [
              [r.avatarMediaId, 'Portrait'],
              [r.ogImageMediaId, 'Social image'],
            ])
          ),
        ]
      },
    },
    {
      name: 'pages',
      run: async () => {
        const rows = await db.cmsPage.findMany({
          where: { ogImageMediaId: { not: null } },
          select: { id: true, title: true, isPublished: true, ogImageMediaId: true },
        })
        return rows.flatMap((r) =>
          slots(r.id, nonEmpty(r.title, 'Untitled page'), 'cms_page', r.isPublished, [
            [r.ogImageMediaId, 'Social image'],
          ]).map(withHref(adminPath(`/cms/pages/${r.id}`)))
        )
      },
    },
  ]
}

function chromeSources(): Source[] {
  return [
    {
      name: 'navigation',
      run: async () => {
        const rows = await db.navMenuItem.findMany({
          where: { promoImageId: { not: null } },
          select: {
            id: true,
            label: true,
            promoImageId: true,
            menu: { select: { slug: true, name: true, isPublished: true } },
          },
        })
        return rows.map(
          (r) =>
            [
              r.promoImageId as string,
              {
                kind: 'navigation',
                id: r.id,
                label: `${nonEmpty(r.menu.name, 'Menu')} — ${nonEmpty(r.label, 'tile')}`,
                role: 'Promo tile',
                href: adminPath(`/navigation/${r.menu.slug}`),
                live: r.menu.isPublished,
                internal: false,
              },
            ] as const
        )
      },
    },
    {
      name: 'homepage slides',
      run: async () => {
        const rows = await db.homepageHeroSlide.findMany({
          select: { id: true, mediaId: true, isPublished: true },
        })
        return rows.map(
          (r) =>
            [
              r.mediaId,
              {
                kind: 'homepage',
                id: r.id,
                label: 'Homepage hero',
                role: 'Slide',
                href: adminPath('/cms'),
                live: r.isPublished,
                internal: false,
              },
            ] as const
        )
      },
    },
    {
      name: 'site settings',
      run: async () => {
        const [store, seo] = await Promise.all([
          db.storeSettings.findMany({
            select: {
              id: true,
              logoMediaId: true,
              footerLogoMediaId: true,
              faviconMediaId: true,
              searchLogoMediaId: true,
            },
          }),
          db.seoSetting.findMany({
            where: { ogDefaultImageId: { not: null } },
            select: { id: true, ogDefaultImageId: true },
          }),
        ])
        const href = adminPath('/settings')
        return [
          ...store.flatMap((r) =>
            // Site chrome is always live — there is no draft state for a logo.
            slots(r.id, 'Site settings', 'site_settings', true, [
              [r.logoMediaId, 'Header logo'],
              [r.footerLogoMediaId, 'Footer logo'],
              [r.faviconMediaId, 'Favicon'],
              [r.searchLogoMediaId, 'Search logo'],
            ]).map(withHref(href))
          ),
          ...seo.flatMap((r) =>
            slots(r.id, 'SEO defaults', 'site_settings', true, [
              [r.ogDefaultImageId, 'Default social image'],
            ]).map(withHref(adminPath('/seo/settings')))
          ),
        ]
      },
    },
  ]
}

function internalSources(): Source[] {
  return [
    {
      name: 'Enquiry attachments',
      run: async () => {
        const rows = await db.enquiryAttachment.findMany({
          select: { id: true, mediaId: true, filename: true, enquiry: { select: { code: true } } },
        })
        return rows.map(
          (r) =>
            [
              r.mediaId,
              {
                kind: 'enquiry',
                id: r.id,
                label: nonEmpty(r.enquiry.code, 'Enquiry'),
                role: nonEmpty(r.filename, 'Attachment'),
                href: adminPath(`/enquiries/${r.enquiry.code}`),
                live: false,
                internal: true,
              },
            ] as const
        )
      },
    },
    {
      name: 'RFQ attachments',
      run: async () => {
        const rows = await db.rfqAttachment.findMany({
          select: { id: true, mediaId: true, rfq: { select: { code: true } } },
        })
        return rows.map(
          (r) =>
            [
              r.mediaId,
              {
                kind: 'rfq',
                id: r.id,
                label: nonEmpty(r.rfq.code, 'RFQ'),
                role: 'Attachment',
                // A quote raised from an inbound Enquiry has no parent RFQ; link to
                // the quote list rather than emitting /rfqs/undefined. Getting this
                // wrong does not just break a link — a usage source that throws is
                // treated as unknown, and the nightly purge would then skip entirely.
                href: r.rfq ? adminPath(`/rfqs/${r.rfq.code}`) : adminPath('/rfqs'),
                live: false,
                internal: true,
              },
            ] as const
        )
      },
    },
    {
      name: 'quote PDFs',
      run: async () => {
        const rows = await db.quote.findMany({
          where: { pdfMediaId: { not: null } },
          select: { id: true, code: true, pdfMediaId: true, rfq: { select: { code: true } } },
        })
        return rows.map(
          (r) =>
            [
              r.pdfMediaId as string,
              {
                kind: 'quote',
                id: r.id,
                label: nonEmpty(r.code, 'Quote'),
                role: 'PDF',
                // A quote raised from an inbound Enquiry has no parent RFQ; link to
                // the quote list rather than emitting /rfqs/undefined. Getting this
                // wrong does not just break a link — a usage source that throws is
                // treated as unknown, and the nightly purge would then skip entirely.
                href: r.rfq ? adminPath(`/rfqs/${r.rfq.code}`) : adminPath('/rfqs'),
                live: false,
                internal: true,
              },
            ] as const
        )
      },
    },
    {
      name: 'import jobs',
      run: async () => {
        const rows = await db.importJob.findMany({
          where: { sourceMediaId: { not: null } },
          select: { id: true, sourceMediaId: true },
        })
        return rows.map(
          (r) =>
            [
              r.sourceMediaId as string,
              {
                kind: 'import',
                id: r.id,
                label: 'Bulk import',
                role: 'Source file',
                href: adminPath('/products/import'),
                live: false,
                internal: true,
              },
            ] as const
        )
      },
    },
  ]
}

/**
 * Group 4 — absolute storage URLs pasted into legacy HTML bodies.
 *
 * `BlogPost.body` and `CmsPage.body` predate block editing and hold raw HTML.
 * There is no id to join on, so the only way to know an image is in use is to
 * read the text. Both are currently empty (0 CMS pages exist and all 11 blog
 * posts are on `bodyBlocks`), but the columns are still live and legacy content
 * can return, so the path is built rather than assumed away.
 *
 * Cost: each body is read once and its URLs go into a set. That makes the match
 * a set lookup per asset — O(bodies + assets) — instead of the substring scan
 * per asset-body pair that Bazar does.
 */
async function resolveHtmlBodies(
  assets: ReadonlyArray<{ id: string; storagePath: string }>
): Promise<Entry[]> {
  const [posts, pages] = await Promise.all([
    db.blogPost.findMany({
      where: { body: { not: '' } },
      select: { id: true, title: true, body: true, status: true, isPublished: true, deletedAt: true },
    }),
    db.cmsPage.findMany({
      where: { body: { not: '' } },
      select: { id: true, title: true, body: true, isPublished: true },
    }),
  ])
  if (posts.length === 0 && pages.length === 0) return []

  // Assets whose storagePath is an absolute URL take the fast path. The rest —
  // bucket-prefixed and bare keys, 2 rows in the current data — need a
  // substring scan, which is why they are separated rather than mixed in.
  const byUrl = new Map<string, string>()
  const nonUrl: Array<{ id: string; storagePath: string }> = []
  for (const a of assets) {
    if (isAbsoluteMediaUrl(a.storagePath)) byUrl.set(normaliseMediaUrl(a.storagePath), a.id)
    else nonUrl.push(a)
  }

  const out: Entry[] = []
  const scan = (
    body: string,
    usage: (role: string) => MediaUsage
  ) => {
    for (const url of collectHtmlMediaUrls(body)) {
      const assetId = byUrl.get(url)
      if (assetId) out.push([assetId, usage('In body')])
    }
    for (const a of nonUrl) {
      if (htmlMentionsStoragePath(body, a.storagePath)) out.push([a.id, usage('In body')])
    }
  }

  for (const p of posts) {
    const live = p.status === 'published' && p.isPublished && p.deletedAt === null
    const label = nonEmpty(p.title, 'Untitled post')
    scan(p.body, (role) => usageOf('blog_post', p.id, label, role, adminPath(`/blog/${p.id}`), live))
  }
  for (const p of pages) {
    const label = nonEmpty(p.title, 'Untitled page')
    scan(p.body, (role) =>
      usageOf('cms_page', p.id, label, role, adminPath(`/cms/pages/${p.id}`), p.isPublished)
    )
  }
  return out
}

// ── Assembly ────────────────────────────────────────────────────────────────

/**
 * Build the whole index.
 *
 * `assets` is every media row's id and storage path, needed because group 4
 * matches on the path rather than the id. Pass the full set — the folder rail
 * counts every row, not just the page being viewed.
 */
async function buildIndex(
  assets: ReadonlyArray<{ id: string; storagePath: string }>
): Promise<MediaUsageIndex> {
  const sources: Source[] = [
    ...catalogueSources(),
    ...contentSources(),
    ...chromeSources(),
    ...internalSources(),
    { name: 'legacy HTML bodies', run: () => resolveHtmlBodies(assets) },
  ]

  const settled = await Promise.all(
    sources.map(async (s) => {
      try {
        return { name: s.name, entries: await s.run(), ok: true as const }
      } catch (err) {
        // Logged, not rethrown. The index degrades to `partial`, which disables
        // deletion — losing one source must never look like "nothing uses it".
        console.error(`[media-usage] source "${s.name}" failed`, err)
        return { name: s.name, entries: [] as Entry[], ok: false as const }
      }
    })
  )

  const known = new Set(assets.map((a) => a.id))
  const byAsset = new Map<string, MediaUsage[]>()
  for (const result of settled) {
    if (!result.ok) continue
    for (const [mediaId, usage] of result.entries) {
      // A reference to a media row that no longer exists — a dangling
      // ogImageMediaId, an id left in a block after the file was deleted — is
      // not a usage of anything we can show, and would otherwise create a
      // phantom entry keyed to an asset that is not in the library.
      if (!known.has(mediaId)) continue
      const list = byAsset.get(mediaId)
      if (list) list.push(usage)
      else byAsset.set(mediaId, [usage])
    }
  }

  return buildMediaUsageIndex(
    byAsset,
    settled.filter((r) => !r.ok).map((r) => r.name)
  )
}

/**
 * Request-scoped memoisation only.
 *
 * The page needs the index twice — once for the folder rail counts and once
 * for the rows on screen — and `cache()` keeps that to a single pass. It does
 * NOT persist between requests, deliberately: a cached index that has gone
 * stale would show a just-attached file as unused, which is the one wrong
 * answer this whole feature exists to prevent. Measured at ~2.4s over the
 * public internet against 665 assets and ~30 sources, most of it round-trip
 * latency; in-region that is a fraction of it.
 *
 * Note `cache()` keys on argument identity, so callers must pass the same
 * array instance to get the hit.
 */
export const buildMediaUsageIndexFromDb = cache(buildIndex)

// ── Helpers ─────────────────────────────────────────────────────────────────

const DOCUMENT_ROLES: Record<string, string> = {
  datasheet: 'Datasheet',
  step: 'STEP file',
  iges: 'IGES file',
  service_manual: 'Service manual',
  installation_guide: 'Installation guide',
}

function usageOf(
  kind: MediaUsage['kind'],
  id: string,
  label: string,
  role: string,
  href: string | null,
  live: boolean
): MediaUsage {
  return { kind, id, label, role, href, live, internal: false }
}

/**
 * Turns a record's several media columns into usages, skipping the empty ones.
 * Most models hold two or three (`imageId`, `ogImageMediaId`, …) and would
 * otherwise need the same null-check written per column.
 */
function slots(
  id: string,
  label: string,
  kind: MediaUsage['kind'],
  live: boolean,
  columns: ReadonlyArray<readonly [string | null | undefined, string]>
): Entry[] {
  const out: Entry[] = []
  for (const [mediaId, role] of columns) {
    if (!mediaId) continue
    out.push([mediaId, usageOf(kind, id, label, role, null, live)])
  }
  return out
}

/** Attaches an href to entries built by `slots`, which cannot know the route. */
function withHref(href: string): (entry: Entry) => Entry {
  return ([mediaId, usage]) => [mediaId, { ...usage, href }] as const
}
