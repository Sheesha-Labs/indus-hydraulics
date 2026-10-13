/**
 * Writes up the active listings that were held out of Google's index: content
 * score under 30 and no size table (the gate in
 * packages/domain/src/seo/product-content-score.ts). On 2026-10-07 there were
 * 110. This runner covers 58 of them; the 52 placeholder products of the May
 * 2026 MSI equipment import stay as they are, on Ayush's decision.
 *
 *   ofs-valves.ts — 19 OFS gate-valve, Demco DM repair-part and ball-valve
 *     pages. Sourced copy that was one FAQ short: a fuller short description
 *     and one more answer each.
 *   lifting.ts    — 17 H-Quality fibre ropes and twines, wire rope hoists and
 *     cluster hooks with no size table: rewritten from the maker's pages, still
 *     unrated where the maker publishes no load.
 *   molykote.ts   — Molykote G-1074, from DuPont's data sheet.
 *   hydraulics.ts — the 21 seed hydraulic parts of 2026-05-01 (Rexroth, Parker,
 *     Yuken, HYDAC), rebuilt from the makers' published data: wrong titles,
 *     model codes and spec values corrected, renamed slugs redirected.
 *
 * Every entry names the title it expects, and the runner refuses a listing
 * with any other title. It refuses a rewrite that would leave a page under the
 * score gate, counting words with HTML tags stripped, so no page clears the
 * gate on markup alone. Each listing is one transaction, a renamed slug gets a
 * 301 through recordSlugRedirect with every link to it rewritten, and content
 * scores are recomputed with the site's own scorer. A re-run is a no-op.
 *
 * The source payloads (packages/db/data/ofs-*, lifting-hquality,
 * molykote-content.json) are not changed: re-running those importers would
 * undo this, as it would the 2026-10-06 listing fixes.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-held-listings/run.ts --dry-run [--preview=SKU,SKU]
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-07-held-listings/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { writeFileSync } from 'node:fs'

import { Prisma } from '@prisma/client'

import { db } from '../../index'
import { recordSlugRedirect } from '../../slug-redirect'
import { syncArticleLinks } from '../blog-article-import'
import { rewriteProductHrefs } from '../2026-10-06-listing-data-fixes/plan'
import { mapStrings } from '../2026-10-06-listing-data-fixes/posts'
import { HYDRAULICS } from './hydraulics'
import { LIFTING } from './lifting'
import { MOLYKOTE } from './molykote'
import { OFS_VALVES } from './ofs-valves'
import { isNoop, plan, score, type Current, type Plan } from './plan'
import type { Entry, Spec } from './types'

type Tx = Prisma.TransactionClient

export const ENTRIES: Entry[] = [...OFS_VALVES, ...LIFTING, ...MOLYKOTE, ...HYDRAULICS]

const DRY_RUN = process.argv.includes('--dry-run')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)
const PREVIEW = (
  process.argv.find((a) => a.startsWith('--preview='))?.slice('--preview='.length) ?? ''
)
  .split(',')
  .filter(Boolean)
const TX = { timeout: 30_000, maxWait: 10_000 } as const
const GATE = 30

const SELECT = {
  id: true,
  sku: true,
  title: true,
  slug: true,
  status: true,
  seoTitle: true,
  seoDescription: true,
  focusKeyword: true,
  mpn: true,
  descriptionShort: true,
  descriptionLong: true,
  brandId: true,
  categoryId: true,
  weightKg: true,
  countryOfOrigin: true,
  contentScore: true,
  specTemplateId: true,
  faqs: {
    select: { id: true, question: true, answer: true, position: true },
    orderBy: { position: 'asc' },
  },
  specs: {
    select: {
      id: true,
      group: true,
      label: true,
      value: true,
      unit: true,
      position: true,
      isFilterable: true,
      templateFieldId: true,
    },
    orderBy: { position: 'asc' },
  },
  images: { select: { id: true, alt: true, media: { select: { id: true, alt: true } } } },
  _count: { select: { crossReferences: true, documents: true, images: true, variants: true } },
} as const

async function main(): Promise<void> {
  const skus = ENTRIES.map((e) => e.sku)
  const dupes = skus.filter((s, i) => skus.indexOf(s) !== i)
  if (dupes.length) throw new Error(`duplicate entries: ${dupes.join(', ')}`)

  const rows = await db.product.findMany({ where: { sku: { in: skus } }, select: SELECT })
  const bySku = new Map(rows.map((r) => [r.sku, r]))
  const templateIds = [
    ...new Set(rows.map((r) => r.specTemplateId).filter((x): x is string => !!x)),
  ]
  const fields = await db.specTemplateField.findMany({
    where: { templateId: { in: templateIds } },
    select: { id: true, templateId: true, key: true, label: true },
  })

  const brands = await db.brand.findMany({ select: { id: true, slug: true } })
  const brandIds = new Map(brands.map((b) => [b.slug, b.id]))

  const errors: string[] = []
  const plans: Plan[] = []
  for (const e of ENTRIES) {
    const r = bySku.get(e.sku)
    if (!r) {
      errors.push(`${e.sku}: not found`)
      continue
    }
    let p: Plan
    try {
      p = plan(toCurrent(r), e, brandIds)
    } catch (err) {
      errors.push((err as Error).message)
      continue
    }
    if (p.score.afterText < GATE && r._count.variants === 0)
      errors.push(`${e.sku}: would score ${p.score.afterText} with tags stripped (gate ${GATE})`)
    for (const s of [...(p.specs ?? []), ...p.addSpecs]) {
      if (s.key && !fields.some((f) => f.templateId === r.specTemplateId && f.key === s.key))
        errors.push(
          `${e.sku}: spec "${s.label}" names template field "${s.key}", which its template lacks`
        )
    }
    if (p.slugMove) {
      const clash = await db.product.findUnique({
        where: { slug: p.slugMove.to },
        select: { sku: true },
      })
      if (clash && clash.sku !== e.sku)
        errors.push(`${e.sku}: /p/${p.slugMove.to} belongs to ${clash.sku}`)
    }
    if (PREVIEW.includes(e.sku)) preview(r, p)
    plans.push(p)
  }

  const work = plans.filter((p) => !isNoop(p))
  log(`${DRY_RUN ? '[dry-run] ' : ''}${work.length} of ${ENTRIES.length} listings to change`)
  for (const p of work)
    log(
      `  ${p.sku.padEnd(30)} score ${String(p.score.before).padStart(2)} → ${String(p.score.after).padStart(2)} (${p.score.afterText} without tags)` +
        `${p.product.title ? `  title → "${p.product.title}"` : ''}${p.slugMove ? `  /p/${p.slugMove.from} → /p/${p.slugMove.to}` : ''}`
    )
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  if (DRY_RUN || !work.length) return
  if (!SNAPSHOT) {
    console.error('--snapshot=<path> is required to write: it is the rollback')
    process.exitCode = 1
    return
  }
  writeFileSync(
    SNAPSHOT,
    JSON.stringify(
      work.map((p) => {
        const r = bySku.get(p.sku)!
        const { images, _count, ...rest } = r
        return {
          ...rest,
          imageAlts: images.map((i) => ({
            productImageId: i.id,
            alt: i.alt,
            mediaId: i.media.id,
            mediaAlt: i.media.alt,
          })),
        }
      }),
      null,
      1
    )
  )
  log(`snapshot written: ${SNAPSHOT}`)

  const moves: { from: string; to: string }[] = []
  for (const p of work) {
    const r = bySku.get(p.sku)!
    await db.$transaction(async (tx: Tx) => {
      if (Object.keys(p.product).length)
        await tx.product.update({ where: { id: p.id }, data: p.product })
      if (p.product.title) await renameAlts(tx, r, p.product.title)
      if (p.faqs) {
        await tx.productFaq.deleteMany({ where: { productId: p.id } })
        await tx.productFaq.createMany({
          data: p.faqs.map((f, i) => ({
            productId: p.id,
            question: f.question,
            answer: f.answer,
            position: i,
          })),
        })
      }
      if (p.addFaqs.length) {
        const start = p.faqs
          ? p.faqs.length
          : r.faqs.length
            ? Math.max(...r.faqs.map((f) => f.position)) + 1
            : 0
        await tx.productFaq.createMany({
          data: p.addFaqs.map((f, i) => ({
            productId: p.id,
            question: f.question,
            answer: f.answer,
            position: start + i,
          })),
        })
      }
      const fieldFor = (s: Spec) =>
        fields.find(
          (f) =>
            f.templateId === r.specTemplateId && (s.key ? f.key === s.key : f.label === s.label)
        )
      const filterable = (s: Spec) =>
        r.specs.find((x) => x.label === s.label)?.isFilterable ?? false
      if (p.specs) {
        await tx.productSpec.deleteMany({ where: { productId: p.id } })
        await tx.productSpec.createMany({
          data: p.specs.map((s, i) => ({
            productId: p.id,
            group: s.group,
            label: s.label,
            value: s.value,
            unit: s.unit ?? null,
            position: i,
            isFilterable: filterable(s),
            templateFieldId: fieldFor(s)?.id ?? null,
          })),
        })
      }
      if (p.addSpecs.length) {
        const base = p.specs
          ? p.specs.length
          : r.specs.length
            ? Math.max(...r.specs.map((s) => s.position)) + 1
            : 0
        await tx.productSpec.createMany({
          data: p.addSpecs.map((s, i) => ({
            productId: p.id,
            group: s.group,
            label: s.label,
            value: s.value,
            unit: s.unit ?? null,
            position: base + i,
            isFilterable: false,
            templateFieldId: fieldFor(s)?.id ?? null,
          })),
        })
      }
      if (p.slugMove) {
        await recordSlugRedirect(tx, {
          fromPath: `/p/${p.slugMove.from}`,
          toPath: `/p/${p.slugMove.to}`,
          notes: `Held-listing rewrite 2026-10-07: ${p.sku} renamed from the maker's data`,
        })
        moves.push(p.slugMove)
      }
    }, TX)
  }
  log(`written: ${work.length} listings`)
  if (moves.length) await rewriteLinks(moves)
  await rescore(work.map((p) => p.id))
}

type Row = Prisma.ProductGetPayload<{ select: typeof SELECT }>

function toCurrent(r: Row): Current {
  return {
    id: r.id,
    sku: r.sku,
    title: r.title,
    slug: r.slug,
    status: r.status,
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
    focusKeyword: r.focusKeyword,
    mpn: r.mpn,
    descriptionShort: r.descriptionShort,
    descriptionLong: r.descriptionLong,
    brandId: r.brandId,
    categoryId: r.categoryId,
    weightKg: r.weightKg,
    countryOfOrigin: r.countryOfOrigin,
    faqs: r.faqs,
    specs: r.specs,
    counts: r._count,
  }
}

/** The gallery labels images with their alt text, which carries the old title. */
async function renameAlts(tx: Tx, r: Row, title: string): Promise<void> {
  for (const img of r.images) {
    if (img.alt === r.title)
      await tx.productImage.update({ where: { id: img.id }, data: { alt: title } })
    if (img.media.alt === r.title)
      await tx.media.update({ where: { id: img.media.id }, data: { alt: title } })
  }
}

/** Point every product, article and page link at the renamed listings' new URLs. */
async function rewriteLinks(moves: { from: string; to: string }[]): Promise<void> {
  const products = (
    await db.product.findMany({
      where: { OR: moves.map((m) => ({ descriptionLong: { contains: `/p/${m.from}` } })) },
      select: { id: true, descriptionLong: true },
    })
  ).map((x) => ({ id: x.id, next: rewriteProductHrefs(x.descriptionLong ?? '', moves).text }))
  const posts = (await db.blogPost.findMany({ select: { id: true, body: true, bodyBlocks: true } }))
    .map((x) => ({
      id: x.id,
      blocks: mapStrings(x.bodyBlocks, (s) => rewriteProductHrefs(s, moves)),
      body: x.body == null ? null : rewriteProductHrefs(x.body, moves),
    }))
    .filter((x) => x.blocks.hits || x.body?.hits)
  const pages = (await db.pageContent.findMany({ select: { id: true, sections: true } }))
    .map((x) => ({ id: x.id, next: mapStrings(x.sections, (s) => rewriteProductHrefs(s, moves)) }))
    .filter((x) => x.next.hits)
  for (const x of products)
    await db.product.update({ where: { id: x.id }, data: { descriptionLong: x.next } })
  for (const x of posts) {
    await db.blogPost.update({
      where: { id: x.id },
      data: {
        bodyBlocks: x.blocks.value as Prisma.InputJsonValue,
        ...(x.body ? { body: x.body.text } : {}),
      },
    })
    await syncArticleLinks(x.id, x.blocks.value as Parameters<typeof syncArticleLinks>[1])
  }
  for (const x of pages)
    await db.pageContent.update({
      where: { id: x.id },
      data: { sections: x.next.value as Prisma.InputJsonValue },
    })
  log(
    `links rewritten: ${products.length} product(s), ${posts.length} article(s), ${pages.length} page(s)`
  )
}

/** Keep contentScore in step, with the site's own scorer. */
async function rescore(ids: string[]): Promise<void> {
  const rows = await db.product.findMany({ where: { id: { in: ids } }, select: SELECT })
  let changed = 0
  for (const r of rows) {
    const s = score({
      descriptionShort: r.descriptionShort,
      descriptionLong: r.descriptionLong,
      faqCount: r.faqs.length,
      specCount: r.specs.length,
      crossReferences: r._count.crossReferences,
      documents: r._count.documents,
      images: r._count.images,
      brandId: r.brandId,
      categoryId: r.categoryId,
      focusKeyword: r.focusKeyword,
      seoTitle: r.seoTitle,
      seoDescription: r.seoDescription,
      weightKg: r.weightKg,
      countryOfOrigin: r.countryOfOrigin,
      mpn: r.mpn,
    })
    if (s === r.contentScore) continue
    changed++
    await db.product.update({ where: { id: r.id }, data: { contentScore: s } })
  }
  log(`content scores recomputed: ${changed} changed`)
}

function preview(r: Row, p: Plan): void {
  log(`\n===== ${p.sku} (${r.title})`)
  for (const [k, v] of Object.entries(p.product)) log(`${k}: ${v}`)
  for (const f of p.faqs ?? []) log(`FAQ = ${f.question} → ${f.answer}`)
  for (const f of p.addFaqs) log(`FAQ + ${f.question} → ${f.answer}`)
  for (const s of p.specs ?? [])
    log(`SPEC = ${s.group} | ${s.label} = ${s.value}${s.unit ? ` ${s.unit}` : ''}`)
  for (const s of p.addSpecs)
    log(`SPEC + ${s.group} | ${s.label} = ${s.value}${s.unit ? ` ${s.unit}` : ''}`)
}

function log(line: string): void {
  console.log(line)
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
