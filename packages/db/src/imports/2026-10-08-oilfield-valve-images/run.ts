/**
 * Maker product images for oilfield valve listings that had none.
 *
 * On 2026-10-07, 110 live oilfield valve listings carried no image. Candidate
 * photos and renders were found on the makers' own sites (Cameron/SLB,
 * Stream-Flo, NOV for Anson, WOM, TechnipFMC, and SPM through its distributor
 * KATT), saved to `Indus Supplier Research/Image Research/Oilfield Valves` for
 * review, and listed in packages/db/data/oilfield-valve-images/payload.json.
 * Indus is the authorised representative of these makers and holds their
 * stock; Ayush gave the go-ahead to use their images on 2026-10-08.
 *
 * Only images that show the listing's valve type are in the payload: stand-ins
 * of a different valve, house-brand candidates (Wikimedia or marketplace
 * photos, which need a credit or the seller's permission) and listings whose
 * maker does not make that valve are left out.
 *
 * Each image is uploaded to the public `product-images` bucket under a key
 * built from the SKU and alt text (never the source filename), then attached
 * after any images the product already has. Matching on
 * `Media.originalFilename` (the review-folder path) makes a re-run a no-op.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env; the Supabase
 * keys are read from the main checkout's apps/web/.env.local):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-08-oilfield-valve-images/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-08-oilfield-valve-images/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'

import { db } from '../../index'

type Payload = {
  imageDir: string
  listings: {
    sku: string
    title: string
    make: string
    images: { file: string; sourcePage: string | null }[]
  }[]
}

const DRY_RUN = process.argv.includes('--dry-run')
const BUCKET = 'product-images'
const PAYLOAD = resolve(__dirname, '../../../data/oilfield-valve-images/payload.json')
const WEB_ENV = [
  resolve(__dirname, '../../../../../apps/web/.env.local'),
  join(homedir(), 'indus-hydraulics-code/indus-hydraulics/apps/web/.env.local'),
]
const TX = { timeout: 30_000, maxWait: 10_000 } as const

async function main(): Promise<void> {
  const payload = JSON.parse(readFileSync(PAYLOAD, 'utf8')) as Payload
  const dir = payload.imageDir.replace(/^~/, homedir())
  if (!existsSync(dir)) throw new Error(`image folder not found: ${dir}`)

  const products = await db.product.findMany({
    where: { sku: { in: payload.listings.map((l) => l.sku) } },
    select: {
      id: true,
      sku: true,
      title: true,
      status: true,
      images: { select: { position: true, media: { select: { originalFilename: true } } } },
    },
  })
  const bySku = new Map(products.map((p) => [p.sku, p]))

  const errors: string[] = []
  const work: {
    productId: string
    sku: string
    alt: string
    file: string
    caption: string
    position: number
  }[] = []
  for (const l of payload.listings) {
    const p = bySku.get(l.sku)
    if (!p) {
      errors.push(`${l.sku}: not found`)
      continue
    }
    if (p.status !== 'active') errors.push(`${l.sku}: status is ${p.status}`)
    const present = new Set(p.images.map((i) => i.media.originalFilename))
    let next = p.images.length ? Math.max(...p.images.map((i) => i.position)) + 1 : 0
    for (const img of l.images) {
      if (present.has(img.file)) continue
      if (!existsSync(join(dir, img.file))) errors.push(`${l.sku}: ${img.file} missing`)
      if (!/\.jpe?g$/i.test(img.file)) errors.push(`${l.sku}: ${img.file} is not a JPEG`)
      work.push({
        productId: p.id,
        sku: l.sku,
        alt: p.title,
        file: img.file,
        caption: `${l.make} product image${img.sourcePage ? ` (${new URL(img.sourcePage).hostname})` : ''}, used as the maker's authorised representative`,
        position: next++,
      })
    }
  }

  log(
    `${DRY_RUN ? '[dry-run] ' : ''}${work.length} image(s) for ${new Set(work.map((w) => w.sku)).size} listing(s)`
  )
  for (const w of work) log(`  ${w.sku.padEnd(50)} #${w.position} ${w.file}`)
  if (errors.length) {
    console.error(`\n${errors.length} problem(s) — nothing written:`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }
  if (DRY_RUN || !work.length) return

  const sb = supabase()
  for (const w of work) {
    const buf = readFileSync(join(dir, w.file))
    const size = jpegSize(buf)
    const key = objectKey(w.sku, w.alt, w.position)
    const { error } = await sb.storage
      .from(BUCKET)
      .upload(key, buf, { cacheControl: '31536000', upsert: true, contentType: 'image/jpeg' })
    if (error) throw new Error(`${w.sku}: upload failed for ${w.file} — ${error.message}`)
    const url = sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl
    await db.$transaction(async (tx) => {
      const media = await tx.media.create({
        data: {
          kind: 'image',
          mimeType: 'image/jpeg',
          originalFilename: w.file,
          storagePath: url,
          bytes: buf.byteLength,
          width: size?.width ?? null,
          height: size?.height ?? null,
          alt: w.alt,
          caption: w.caption,
        },
        select: { id: true },
      })
      await tx.productImage.create({
        data: { productId: w.productId, mediaId: media.id, position: w.position, alt: w.alt },
      })
    }, TX)
  }
  log(`written: ${work.length} image(s)`)
}

function supabase() {
  for (const path of WEB_ENV) {
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m && !process.env[m[1]!])
        process.env[m[1]!] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
    }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key)
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Width and height from the first JPEG SOF marker. */
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

/** Built from the alt text, never the source filename. */
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
