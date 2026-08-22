/**
 * Attach product renders to whichever products a folder names.
 *
 * Generalises `attach-fitting-renders.ts`, which carried a hard-coded list of
 * fourteen SKUs. That list was correct for its one batch and wrong the moment a
 * second batch arrived, so this version derives the work from the folder:
 * every `<SKU>.png` in `--dir` is matched to the product with that SKU.
 *
 * Filename-as-SKU is safe for generated renders — the file is named for the
 * product it was generated from. It would NOT be safe for supplier photography
 * arriving under human-written names; that case needs an explicit pairing
 * table, the way `replace-hydraulic-hose-renders.ts` does it.
 *
 * Guards, in the order they apply:
 *   1. A PNG whose SKU matches no product is REPORTED and skipped. A typo'd
 *      filename must not silently do nothing.
 *   2. A product already carrying that exact file (matched on
 *      `Media.originalFilename`) is skipped — this is the idempotency key, so a
 *      re-run after a partial failure finishes the rest.
 *   3. A product carrying a DIFFERENT image is REPORTED and skipped, never
 *      displaced. Attaching is additive here; replacing someone's chosen
 *      primary image is a different operation and needs the retirement
 *      machinery in `replace-hydraulic-hose-renders.ts`.
 *   4. Anything that is not a readable PNG is reported and skipped.
 *
 * Two details taken from the existing attach scripts rather than guessed:
 * `Media.storagePath` holds the PUBLIC URL, not the object key (a bare key
 * renders a 400), and `Media` requires `kind` and stores size in `bytes`.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-renders-by-sku.ts \
 *     --dir "$HOME/Documents/Indus Hydraulics Website/Product Images/Hydraulic Fittings" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/**
 * Prisma reads `packages/db/.env` on its own, but the Supabase storage
 * credentials only live in the web app's env file. Load them here so the script
 * runs with a plain `pnpm --filter @indus/db exec tsx …` and no shell setup.
 * Anything already exported wins.
 */
function loadWebEnv() {
  if (!existsSync(WEB_ENV)) return
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]!
    if (process.env[key]) continue
    process.env[key] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
  }
}

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Reads width/height straight out of the PNG IHDR chunk — avoids an image dep. */
function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function objectKeyFor(sku: string): string {
  return `products/${sku.toLowerCase()}/${sku.toLowerCase()}.png`
}

async function main() {
  loadWebEnv()
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  // `pnpm exec` rewrites `--dir="x y"` into two argv entries, so accept both
  // `--dir=<path>` and `--dir <path>`.
  const eq = args.find((a) => a.startsWith('--dir='))?.slice('--dir='.length)
  const idx = args.indexOf('--dir')
  const dir = eq ?? (idx >= 0 ? args[idx + 1] : undefined)
  if (!dir) throw new Error('--dir <folder of SKU-named PNGs> is required')
  if (!existsSync(dir)) throw new Error(`--dir does not exist: ${dir}`)

  const prefix = dryRun ? '[DRY-RUN]' : '[LIVE]'
  const files = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort()
  console.log(`${prefix} ${files.length} PNG(s) in ${dir}\n`)

  const skus = files.map((f) => f.replace(/\.png$/i, ''))
  const products = await db.product.findMany({
    where: { sku: { in: skus } },
    select: {
      id: true,
      sku: true,
      title: true,
      images: { select: { media: { select: { originalFilename: true } } } },
    },
  })
  const bySku = new Map(products.map((p) => [p.sku, p]))

  const store = dryRun ? null : supabase()
  let attached = 0
  let skipped = 0
  const problems: string[] = []

  for (const file of files) {
    const sku = file.replace(/\.png$/i, '')
    const product = bySku.get(sku)
    if (!product) {
      problems.push(`${file}: no product with SKU "${sku}"`)
      console.log(`  NO MATCH ${sku.padEnd(22)} no product with this SKU`)
      continue
    }
    if (product.images.some((i) => i.media.originalFilename === file)) {
      console.log(`  skip     ${sku.padEnd(22)} already carries ${file}`)
      skipped += 1
      continue
    }
    if (product.images.length > 0) {
      problems.push(`${sku}: already has ${product.images.length} other image(s) — left alone`)
      console.log(`  CONFLICT ${sku.padEnd(22)} has ${product.images.length} other image(s), skipping`)
      continue
    }

    const bytes = readFileSync(join(dir, file))
    const size = pngSize(bytes)
    if (!size) {
      problems.push(`${file}: not a readable PNG`)
      console.log(`  BAD PNG  ${sku.padEnd(22)} ${file}`)
      continue
    }

    const key = objectKeyFor(sku)
    console.log(
      `  attach   ${sku.padEnd(22)} ${size.width}×${size.height}, ${Math.round(bytes.length / 1024)} KB`,
    )
    if (dryRun) continue

    const up = await store!.storage.from(BUCKET).upload(key, bytes, {
      cacheControl: '31536000',
      contentType: 'image/png',
      upsert: true,
    })
    if (up.error) {
      problems.push(`${sku}: upload failed — ${up.error.message}`)
      console.log(`  UPLOAD FAILED ${sku}: ${up.error.message}`)
      continue
    }

    // `Media.storagePath` holds the PUBLIC URL, not the object key — matching
    // every other attach script in this package. A bare key renders a 400.
    const publicUrl = store!.storage.from(BUCKET).getPublicUrl(key).data.publicUrl

    await db.$transaction(async (tx) => {
      const media = await tx.media.create({
        data: {
          kind: 'image',
          mimeType: 'image/png',
          originalFilename: file,
          storagePath: publicUrl,
          bytes: bytes.byteLength,
          width: size.width,
          height: size.height,
          alt: product.title,
        },
        select: { id: true },
      })
      await tx.productImage.create({
        data: { productId: product.id, mediaId: media.id, position: 0, alt: product.title },
      })
    })
    attached += 1
  }

  console.log(`\n${prefix} Attached ${attached}, already-present ${skipped}.`)
  if (problems.length > 0) {
    console.log(`\n${problems.length} problem(s):`)
    for (const p of problems) console.log(`  - ${p}`)
    process.exitCode = 1
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
