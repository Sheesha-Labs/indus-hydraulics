/**
 * Attach maker documents (service instructions, operating manuals, datasheets)
 * to products by SKU, from a manifest in `data/<payload>/documents.json`.
 *
 * Manifest: { keyPrefix?, caption?, documents: [{ sku, position, kind, title, language, file, md5 }] }.
 * `keyPrefix` is the storage folder (default `manntek`), `caption` the Media caption. `file` is
 * relative to --doc-dir, which lives outside the repo like every import's
 * images. Each distinct file (by md5) is uploaded once to the private
 * `product-documents` bucket and gets one Media row; products that share a
 * manual share that Media. Storage paths are bucket-prefixed keys, resolved to a
 * signed URL by /api/documents/<id> at request time — the same shape the admin
 * upload writes.
 *
 * Idempotent: a product that already has a document with the same title is
 * skipped, and a file already in Media (matched on `originalFilename` + bytes)
 * is reused instead of uploaded again. Content scores are recomputed for every
 * product touched, with the same inputs as the admin editor.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-product-documents.ts \
 *     --payload=manntek-service-documents --doc-dir=<folder> [--dry-run]
 */
import { existsSync, readFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { PrismaClient, type DocumentKind } from '@prisma/client'
import { scoreProductContent } from '@indus/domain'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()
const BUCKET = 'product-documents'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const DATA_DIR = resolve(__dirname, '../../data')

type Entry = {
  sku: string
  position: number
  kind: DocumentKind
  title: string
  language: string
  file: string
  md5: string
}

function loadWebEnv() {
  if (!existsSync(WEB_ENV)) return
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m || process.env[m[1]!]) continue
    process.env[m[1]!] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
  }
}

function slug(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/"/g, '-in')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 90)
}

function words(s: string): number {
  return s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

async function rescore(productId: string) {
  const [faqCount, specCount, documentCount, imageCount, crossReferenceCount, p] = await Promise.all([
    db.productFaq.count({ where: { productId } }),
    db.productSpec.count({ where: { productId } }),
    db.productDocument.count({ where: { productId } }),
    db.productImage.count({ where: { productId } }),
    db.productCrossReference.count({ where: { productId } }),
    db.product.findUniqueOrThrow({
      where: { id: productId },
      select: {
        brandId: true, categoryId: true, focusKeyword: true, seoTitle: true, seoDescription: true,
        descriptionShort: true, descriptionLong: true, weightKg: true, countryOfOrigin: true, mpn: true,
      },
    }),
  ])
  const score = scoreProductContent({
    descriptionShortWords: words(p.descriptionShort ?? ''),
    descriptionLongWords: words(p.descriptionLong ?? ''),
    faqCount,
    specCount,
    crossReferenceCount,
    documentCount,
    imageCount,
    hasBrand: Boolean(p.brandId),
    hasCategory: Boolean(p.categoryId),
    hasFocusKeyword: Boolean(p.focusKeyword),
    hasSeoTitleAndDescription: Boolean(p.seoTitle && p.seoDescription),
    hasCommerceAttributes: Boolean(p.weightKg && p.countryOfOrigin && p.mpn),
  })
  await db.product.update({ where: { id: productId }, data: { contentScore: score.score } })
  return score.score
}

async function main() {
  loadWebEnv()
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const name = argv.find((a) => a.startsWith('--payload='))?.split('=')[1]
  const docDir = argv.find((a) => a.startsWith('--doc-dir='))?.slice('--doc-dir='.length)
  if (!name || !/^[a-z0-9-]+$/.test(name)) throw new Error('--payload=<folder under packages/db/data> is required')
  if (!docDir || !existsSync(docDir)) throw new Error('--doc-dir=<folder with the documents> is required')
  const manifest: { documents: Entry[]; keyPrefix?: string; caption?: string } = JSON.parse(
    readFileSync(join(DATA_DIR, name, 'documents.json'), 'utf8'),
  )
  // Storage folder and Media caption are per maker. The MannTek manifest predates both fields.
  const keyPrefix = manifest.keyPrefix ?? 'manntek'
  const caption = manifest.caption ?? 'MannTek website, Downloads > Service Downloads (fetched 2026-10-17). Maker document.'
  if (!/^[a-z0-9-]+$/.test(keyPrefix)) throw new Error(`keyPrefix ${keyPrefix} must be a lowercase slug`)

  const problems: string[] = []
  for (const e of manifest.documents) {
    if (!existsSync(join(docDir, e.file))) problems.push(`${e.sku}: missing ${e.file}`)
  }
  const skus = [...new Set(manifest.documents.map((e) => e.sku))]
  const products = await db.product.findMany({ where: { sku: { in: skus } }, select: { id: true, sku: true } })
  const idBySku = new Map(products.map((p) => [p.sku, p.id]))
  for (const sku of skus) if (!idBySku.has(sku)) problems.push(`${sku}: no such product`)
  if (problems.length) {
    for (const p of problems) console.log(`  ! ${p}`)
    throw new Error(`${problems.length} problems — nothing written`)
  }

  const sb = dryRun
    ? null
    : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
  const mediaByMd5 = new Map<string, string>()
  let uploaded = 0
  let attached = 0
  let skipped = 0
  const touched = new Set<string>()

  for (const e of manifest.documents) {
    const productId = idBySku.get(e.sku)!
    const exists = await db.productDocument.findFirst({ where: { productId, title: e.title }, select: { id: true } })
    if (exists) {
      skipped++
      continue
    }
    const buf = readFileSync(join(docDir, e.file))
    const original = basename(e.file)
    let mediaId = mediaByMd5.get(e.md5)
    if (!mediaId) {
      const found = await db.media.findFirst({
        where: { originalFilename: original, bytes: buf.byteLength, kind: 'document' },
        select: { id: true },
      })
      mediaId = found?.id
    }
    if (dryRun) {
      console.log(`[dry-run] ${e.sku}  ${mediaId ? 'reuse' : 'upload'}  ${e.title}`)
      if (!mediaId) mediaByMd5.set(e.md5, `dry:${e.md5}`)
      attached++
      continue
    }
    if (!mediaId) {
      const key = `${keyPrefix}/${slug(e.title)}-${e.md5.slice(0, 6)}.pdf`
      const { error } = await sb!.storage.from(BUCKET).upload(key, buf, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      })
      if (error && !/exists/i.test(error.message)) {
        problems.push(`${e.sku}: upload failed for ${e.file} — ${error.message}`)
        continue
      }
      const media = await db.media.create({
        data: {
          kind: 'document',
          mimeType: 'application/pdf',
          originalFilename: original,
          storagePath: `${BUCKET}/${key}`,
          bytes: buf.byteLength,
          caption,
        },
        select: { id: true },
      })
      mediaId = media.id
      uploaded++
    }
    mediaByMd5.set(e.md5, mediaId)
    await db.productDocument.create({
      data: { productId, kind: e.kind, title: e.title, language: e.language, isGated: false, mediaId, position: e.position },
    })
    attached++
    touched.add(productId)
  }

  for (const id of touched) await rescore(id)
  console.log(
    `\n[documents:${name}] ${attached} ${dryRun ? 'to attach' : 'attached'}, ${uploaded} files uploaded, ` +
      `${skipped} already present, ${touched.size} products rescored, ${problems.length} problems`,
  )
  for (const p of problems) console.log(`  ! ${p}`)
  await db.$disconnect()
  if (problems.length) process.exitCode = 1
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
