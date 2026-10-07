/**
 * Size tables for the 88 Sealfast coupling listings, from Sealfast's own
 * catalogue: cam and groove (standard, CrimpTEK, self-locking, elbows,
 * specialty), Bauer, ring lock, ground joint, crowfoot, shank, pin lug, dry
 * disconnect, sandblast and menders. Before this none of them had one.
 *
 * The payload is built by packages/db/data/sealfast-size-tables/build.py,
 * which documents its sources and every value it refuses. Per listing:
 *   - a size-table row for each size Sealfast sells in any of its materials,
 *     Indus part number `<SKU>-<size code>`, with millimetre dimensions where
 *     the listing's datasheet gives them and they pass the cross-checks;
 *   - a "Sealfast part numbers" table appended to the description, every size
 *     by material, between `sealfast-sizes` markers so a re-run replaces it;
 *   - the datasheet linked as the product's datasheet document where it has
 *     none and the sheet contributed data. One datasheet per product is a
 *     database constraint, so an existing link is never replaced.
 *
 * Refuses a product that already has size rows it did not write. Rows are
 * matched by part number: changed ones are updated, missing ones created, and
 * its own rows no longer in the payload removed. Each product is one
 * transaction. Content only — product pages pick it up as their cache expires
 * (about an hour).
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-sealfast-size-tables/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-sealfast-size-tables/run.ts --snapshot=/path/to/rollback.json
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { Prisma } from '@prisma/client'
import { scoreProductContent, wordCount } from '@indus/domain'

import { db } from '../../index'

type Tx = Prisma.TransactionClient

type PayloadVariant = {
  partNumber: string
  position: number
  hoseInch: string | null
  portLabel: string | null
  dimensions: Record<string, number> | null
}
type PayloadListing = {
  variants: PayloadVariant[]
  tableHtml: string
  datasheet: { file: string; url: string; bytes: number; title: string } | null
  families: string[]
}

const DRY_RUN = process.argv.includes('--dry-run')
const SNAPSHOT = process.argv.find((a) => a.startsWith('--snapshot='))?.slice('--snapshot='.length)
const TX = { timeout: 30_000, maxWait: 10_000 } as const
const START = '<!-- sealfast-sizes:start -->'
const END = '<!-- sealfast-sizes:end -->'

export function withTable(html: string | null, table: string): string {
  const base = html ?? ''
  const a = base.indexOf(START)
  const b = base.indexOf(END)
  if (a >= 0 && b > a) return base.slice(0, a) + table + base.slice(b + END.length)
  return `${base.trimEnd()}\n${table}`
}

/** jsonb stores object keys in its own order, so compare dimensions key by key. */
const canonical = (v: unknown): string =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? JSON.stringify(
        Object.fromEntries(
          Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
        )
      )
    : JSON.stringify(v ?? null)

const sameVariant = (
  a: PayloadVariant,
  b: { position: number; hoseInch: string | null; portLabel: string | null; dimensions: unknown }
) =>
  a.position === b.position &&
  a.hoseInch === b.hoseInch &&
  a.portLabel === b.portLabel &&
  canonical(a.dimensions) === canonical(b.dimensions)

async function main(): Promise<void> {
  const payload = JSON.parse(
    readFileSync(join(__dirname, '../../../data/sealfast-size-tables/payload.json'), 'utf8')
  ) as Record<string, PayloadListing>
  const skus = Object.keys(payload)
  const errors: string[] = []

  const products = await db.product.findMany({
    where: { sku: { in: skus } },
    select: {
      id: true,
      sku: true,
      status: true,
      descriptionLong: true,
      variants: {
        select: {
          id: true,
          partNumber: true,
          position: true,
          hoseInch: true,
          portLabel: true,
          dimensions: true,
        },
      },
      documents: { select: { id: true, kind: true, media: { select: { storagePath: true } } } },
    },
  })
  const bySku = new Map(products.map((p) => [p.sku, p]))
  for (const sku of skus) {
    const p = bySku.get(sku)
    if (!p) errors.push(`${sku}: not found`)
    else if (p.status !== 'active') errors.push(`${sku}: not active`)
  }

  // No other product may already hold one of these part numbers.
  const planned = skus.flatMap((sku) => payload[sku]!.variants.map((v) => v.partNumber))
  if (new Set(planned).size !== planned.length) errors.push('duplicate part numbers in the payload')
  const clash = await db.productVariant.findMany({
    where: { partNumber: { in: planned } },
    select: { partNumber: true, product: { select: { sku: true } } },
  })
  for (const c of clash) {
    if (!c.partNumber.startsWith(`${c.product.sku}-`))
      errors.push(`${c.partNumber} already belongs to ${c.product.sku}`)
  }

  type Plan = {
    sku: string
    id: string
    create: PayloadVariant[]
    update: Array<PayloadVariant & { id: string }>
    remove: string[]
    descriptionLong: string | null
    datasheet: PayloadListing['datasheet']
  }
  const plans: Plan[] = []
  let keptSheets = 0
  for (const sku of skus) {
    const p = bySku.get(sku)
    if (!p) continue
    const want = payload[sku]!
    const foreign = p.variants.filter((v) => !v.partNumber.startsWith(`${sku}-`))
    if (foreign.length) {
      errors.push(
        `${sku}: has ${foreign.length} size row(s) this runner did not write (${foreign[0]!.partNumber}) — refusing`
      )
      continue
    }
    const have = new Map(p.variants.map((v) => [v.partNumber, v]))
    const create = want.variants.filter((v) => !have.has(v.partNumber))
    const update = want.variants
      .filter((v) => have.has(v.partNumber) && !sameVariant(v, have.get(v.partNumber)!))
      .map((v) => ({ ...v, id: have.get(v.partNumber)!.id }))
    const keep = new Set(want.variants.map((v) => v.partNumber))
    const remove = p.variants.filter((v) => !keep.has(v.partNumber)).map((v) => v.id)
    if (
      /<h3>Sealfast part numbers<\/h3>/.test(p.descriptionLong ?? '') &&
      !(p.descriptionLong ?? '').includes(START)
    ) {
      errors.push(`${sku}: description already has an unmarked Sealfast table`)
    }
    const html = withTable(p.descriptionLong, want.tableHtml)
    const hasSheet = p.documents.some((d) => d.kind === 'datasheet')
    if (want.datasheet && hasSheet) keptSheets++
    plans.push({
      sku,
      id: p.id,
      create,
      update,
      remove,
      descriptionLong: html === p.descriptionLong ? null : html,
      datasheet: want.datasheet && !hasSheet ? want.datasheet : null,
    })
  }

  const work = plans.filter(
    (x) => x.create.length || x.update.length || x.remove.length || x.descriptionLong || x.datasheet
  )
  log(`${DRY_RUN ? '[dry-run] ' : ''}${work.length} of ${skus.length} listings to change`)
  log(
    `  size rows: +${sum(work, (x) => x.create.length)} created, ${sum(work, (x) => x.update.length)} updated, ${sum(work, (x) => x.remove.length)} removed`
  )
  log(
    `  descriptions: ${work.filter((x) => x.descriptionLong).length}; datasheets linked: ${work.filter((x) => x.datasheet).length} (kept existing: ${keptSheets})`
  )
  for (const x of work) {
    log(
      `  ${x.sku}: +${x.create.length}/~${x.update.length}/-${x.remove.length}${x.descriptionLong ? ', table' : ''}${x.datasheet ? `, datasheet ${x.datasheet.file}` : ''}`
    )
  }

  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  if (DRY_RUN) return
  if (!SNAPSHOT) {
    console.error('--snapshot=<path> is required to write: it is the rollback')
    process.exitCode = 1
    return
  }
  writeFileSync(
    SNAPSHOT,
    JSON.stringify(
      work.map((x) => {
        const p = bySku.get(x.sku)!
        return {
          sku: x.sku,
          descriptionLong: p.descriptionLong,
          variants: p.variants,
          documents: p.documents,
        }
      }),
      null,
      1
    )
  )
  log(`snapshot written: ${SNAPSHOT}`)

  for (const x of work) {
    await db.$transaction(async (tx: Tx) => {
      if (x.remove.length) await tx.productVariant.deleteMany({ where: { id: { in: x.remove } } })
      for (const v of x.update) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            position: v.position,
            hoseInch: v.hoseInch,
            portLabel: v.portLabel,
            dimensions: v.dimensions ? (v.dimensions as Prisma.InputJsonValue) : Prisma.DbNull,
          },
        })
      }
      if (x.create.length) {
        await tx.productVariant.createMany({
          data: x.create.map((v) => ({
            productId: x.id,
            partNumber: v.partNumber,
            position: v.position,
            hoseInch: v.hoseInch,
            portLabel: v.portLabel,
            ...(v.dimensions ? { dimensions: v.dimensions as Prisma.InputJsonValue } : {}),
          })),
        })
      }
      if (x.descriptionLong)
        await tx.product.update({
          where: { id: x.id },
          data: { descriptionLong: x.descriptionLong },
        })
      if (x.datasheet) {
        const media = await tx.media.create({
          data: {
            kind: 'document',
            mimeType: 'application/pdf',
            originalFilename: x.datasheet.file,
            storagePath: x.datasheet.url,
            bytes: x.datasheet.bytes,
            alt: x.datasheet.title,
          },
        })
        await tx.productDocument.create({
          data: {
            productId: x.id,
            kind: 'datasheet',
            title: x.datasheet.title,
            mediaId: media.id,
            language: 'en',
          },
        })
      }
    }, TX)
  }
  log(`written: ${work.length} listings`)
  await rescore(work.map((x) => x.id))
}

function sum<T>(xs: T[], f: (x: T) => number): number {
  return xs.reduce((a, x) => a + f(x), 0)
}

function log(line: string): void {
  console.log(line)
}

/** The description grew a table; keep contentScore in step with it. */
async function rescore(ids: string[]): Promise<void> {
  const products = await db.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      contentScore: true,
      descriptionShort: true,
      descriptionLong: true,
      brandId: true,
      categoryId: true,
      focusKeyword: true,
      seoTitle: true,
      seoDescription: true,
      weightKg: true,
      countryOfOrigin: true,
      mpn: true,
      _count: {
        select: { faqs: true, specs: true, crossReferences: true, documents: true, images: true },
      },
    },
  })
  let changed = 0
  for (const p of products) {
    const score = scoreProductContent({
      descriptionShortWords: wordCount(p.descriptionShort),
      descriptionLongWords: wordCount(p.descriptionLong),
      faqCount: p._count.faqs,
      specCount: p._count.specs,
      crossReferenceCount: p._count.crossReferences,
      documentCount: p._count.documents,
      imageCount: p._count.images,
      hasBrand: p.brandId != null,
      hasCategory: p.categoryId != null,
      hasFocusKeyword: !!p.focusKeyword?.trim(),
      hasSeoTitleAndDescription: !!p.seoTitle?.trim() && !!p.seoDescription?.trim(),
      hasCommerceAttributes: p.weightKg != null && !!p.countryOfOrigin?.trim() && !!p.mpn?.trim(),
    }).score
    if (score === p.contentScore) continue
    changed++
    await db.product.update({ where: { id: p.id }, data: { contentScore: score } })
  }
  log(`content scores recomputed: ${changed} changed`)
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
