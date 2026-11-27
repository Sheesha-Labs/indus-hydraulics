/**
 * DEMCO overhaul, 2026-11-27: the half of the load that touches listings that were already live.
 *
 * The catalogue loader (`src/scripts/import-lifting-catalogue.ts`) rewrites copy, specs, FAQs and
 * size tables for every SKU in the three `data/catalogue-demco-*` payloads, new or old. It cannot do
 * four things this refresh needs, so this script does them, and must run BEFORE the loader:
 *
 *   1. Backup. Every live DEMCO product (copy, specs, FAQs, variants, gallery) is written to
 *      `--backup=<file>` before anything changes.
 *   2. Slug guard. The loader writes `slug` from the payload. A refresh entry whose slug differs from
 *      the live one is refused, unless it is in MOVES below, which also gets a redirect row.
 *   3. Moves. `IH-VAL-BFLY-NEC-L-16` was titled "NE-C Lug 16″ 200 psi", but its photographed part
 *      J023821-511531A is base 23821, an NF-C 16″ 150 psi lug valve (NE-C stops at 12″). It becomes the
 *      NF-C 16″ listing; the old path keeps working through a permanent redirect.
 *   4. Gallery. The loader numbers images from 0 and refuses a payload whose files are not on disk,
 *      so a refresh entry carries `images: []` and its new catalogue renders in `refreshImages`.
 *      They are appended here after the live photos, which keep their positions.
 *
 * Usage (from packages/db, DATABASE_URL exported):
 *   tsx src/imports/2026-11-27-demco-overhaul/refresh-existing.ts --image-dir=<folder> \
 *     --backup=<file.json> [--dry-run]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()
const BUCKET = 'product-images'
const DATA_DIR = resolve(__dirname, '../../../data')
const PAYLOADS = [
  'catalogue-demco-gate-valves',
  'catalogue-demco-butterfly-valves',
  'catalogue-demco-butterfly-accessories',
]
const MOVES: Record<string, { from: string; note: string }> = {
  'IH-VAL-BFLY-NEC-L-16': {
    from: 'demco-series-ne-c-lug-butterfly-valve-16-inch-200-psi',
    note: 'DEMCO overhaul 2026-11-27: listing is the NF-C 16 in valve (base 23821), not NE-C',
  },
}

type Img = { file: string; alt: string; caption?: string | null }
type Entry = { sku: string; slug: string; refreshImages?: Img[] }

function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]!
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

/** Same key scheme as the catalogue loader: built from the alt text. */
function objectKey(sku: string, alt: string, position: number): string {
  const stem = alt
    .normalize('NFKD')
    .replace(/″/g, '-in')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80)
  return `products/${sku.toLowerCase()}/${String(position).padStart(2, '0')}-${stem}.jpg`
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const imageDir = argv.find((a) => a.startsWith('--image-dir='))?.slice('--image-dir='.length)
  const backup = argv.find((a) => a.startsWith('--backup='))?.slice('--backup='.length)
  if (!imageDir || !existsSync(imageDir)) throw new Error('--image-dir=<existing folder> is required')
  if (!backup) throw new Error('--backup=<file.json> is required')

  const entries: Entry[] = PAYLOADS.flatMap(
    (p) => JSON.parse(readFileSync(join(DATA_DIR, p, 'catalogue.json'), 'utf8')).products as Entry[]
  )
  const live = await db.product.findMany({
    where: { sku: { in: entries.map((e) => e.sku) } },
    include: {
      specs: true,
      faqs: true,
      variants: true,
      images: { include: { media: true }, orderBy: { position: 'asc' } },
    },
  })
  const bySku = new Map(live.map((p) => [p.sku, p]))

  // 1. Backup before anything else.
  writeFileSync(backup, JSON.stringify({ takenAt: new Date().toISOString(), products: live }, null, 1))
  console.log(`[backup] ${live.length} live products → ${backup}`)

  // 2. Slug guard.
  const problems: string[] = []
  for (const e of entries) {
    const p = bySku.get(e.sku)
    if (!p || p.slug === e.slug) continue
    const move = MOVES[e.sku]
    if (!move || move.from !== p.slug) problems.push(`${e.sku}: slug ${p.slug} → ${e.slug} is not a declared move`)
  }
  for (const e of entries.filter((x) => x.refreshImages?.length && bySku.has(x.sku)))
    for (const img of e.refreshImages!)
      if (!existsSync(join(imageDir, img.file))) problems.push(`${e.sku}: image missing ${img.file}`)
  if (problems.length) {
    for (const p of problems) console.log(`  ! ${p}`)
    throw new Error(`${problems.length} problems — nothing written`)
  }

  // 3. Moves: the redirect row first, so the old URL never 404s.
  for (const [sku, move] of Object.entries(MOVES)) {
    const e = entries.find((x) => x.sku === sku)
    if (!e || !bySku.has(sku)) continue
    const fromPath = `/p/${move.from}`
    const toPath = `/p/${e.slug}`
    if (dryRun) {
      console.log(`[dry-run] redirect ${fromPath} → ${toPath}`)
      continue
    }
    await db.redirect.upsert({
      where: { fromPath },
      create: { fromPath, toPath, statusCode: 301, notes: move.note },
      update: { toPath, statusCode: 301, isActive: true, notes: move.note },
    })
    console.log(`[redirect] ${fromPath} → ${toPath}`)
  }

  // 4. Gallery: append catalogue renders after the live photos.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const sb = dryRun || !url || !key ? null : createClient(url, key, { auth: { persistSession: false } })
  if (!dryRun && !sb) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  let attached = 0
  for (const e of entries) {
    const p = bySku.get(e.sku)
    if (!p || !e.refreshImages?.length) continue
    const present = new Set(p.images.map((i) => i.media.originalFilename))
    let position = p.images.reduce((m, i) => Math.max(m, i.position), -1) + 1
    for (const img of e.refreshImages) {
      if (present.has(img.file)) continue
      if (dryRun) {
        console.log(`[dry-run] ${e.sku}: append ${img.file} at ${position}`)
        position++
        continue
      }
      const buf = readFileSync(join(imageDir, img.file))
      const size = jpegSize(buf)
      const objectPath = objectKey(e.sku, img.alt, position)
      const { error } = await sb!.storage.from(BUCKET).upload(objectPath, buf, {
        cacheControl: '31536000',
        upsert: true,
        contentType: 'image/jpeg',
      })
      if (error) throw new Error(`${e.sku}: upload failed for ${img.file} — ${error.message}`)
      const publicUrl = sb!.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
      await db.$transaction(
        async (tx) => {
          const media = await tx.media.create({
            data: {
              kind: 'image',
              mimeType: 'image/jpeg',
              originalFilename: img.file,
              storagePath: publicUrl,
              bytes: buf.byteLength,
              width: size?.width ?? null,
              height: size?.height ?? null,
              alt: img.alt,
              caption: img.caption ?? null,
            },
            select: { id: true },
          })
          await tx.productImage.create({ data: { productId: p.id, mediaId: media.id, position, alt: img.alt } })
        },
        { maxWait: 30_000, timeout: 30_000 }
      )
      position++
      attached++
    }
  }
  console.log(`[refresh-existing] ${attached} images appended${dryRun ? ' (dry run)' : ''}`)
  await db.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
