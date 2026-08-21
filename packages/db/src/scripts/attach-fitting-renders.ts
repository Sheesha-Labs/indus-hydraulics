/**
 * Attach the hydraulic-fitting renders to the fourteen Al Feel gap-fill products.
 *
 * The gap-fill set (PRs #265, #266) went live with no photographs at all —
 * fourteen products carrying full specs, copy and FAQs against a blank frame.
 * This attaches their renders.
 *
 * The renders were generated from each product's own spec row (thread form,
 * sealing form, configuration, gender, series, material, finish) rather than
 * traced from anyone else's product photography. See
 * `data/README-gap-fill-render-briefs.md` for the briefs and the reasoning.
 *
 * Simpler than `replace-hydraulic-hose-renders.ts`, because there is nothing to
 * retire: every target product has zero images today, so this only uploads,
 * creates the `Media` row, and inserts `ProductImage` at position 0. If a
 * product turns out to already carry an image, it is REPORTED AND SKIPPED
 * rather than displaced — a surprise image means the assumption behind this
 * script no longer holds, and silently overwriting it would destroy the only
 * evidence of that.
 *
 * Pairing is by filename: `<SKU>.png`. That is safe here in a way it was not
 * for the hose set — those filenames were human-written labels that had to be
 * checked against the lay-line printed on the hose, whereas these files are
 * named by the SKU the render was generated for.
 *
 * Idempotent: a product already carrying its render (matched on
 * `Media.originalFilename`) is skipped, so a re-run after a partial failure
 * finishes the rest.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-fitting-renders.ts \
 *     --dir "$HOME/Documents/Indus Hydraulics Website/Product Images/Hydraulic Fittings" [--dry-run]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/** The fourteen gap-fill SKUs. Each expects `<SKU>.png` in --dir. */
const SKUS = [
  // DIN 24° cone, heavy series — plain metal-to-metal
  'IH-DF-FEM-24-HS',
  'IH-DF-FEM-24-HS-45',
  'IH-DF-FEM-24-HS-90',
  // DIN 24° cone, heavy series — O-ring soft seal
  'IH-DF-MAL-24-HS',
  'IH-DF-FEM-24-OR-HS',
  'IH-DF-FEM-24-OR-HS-45',
  'IH-DF-FEM-24-OR-HS-90',
  // Automotive A/C ferrule
  'IH-CF-NS-AC',
  // Pressure washer / waterjet
  'IH-PW-GUN-INSERT',
  'IH-PW-WJ-FEM',
  // NPSM swivel
  'IH-PT-NPSM-SWV',
  // BSP bulkhead
  'IH-BSP-MAL-60-BH',
  // Wing nut couplings
  'IH-QC-WINGNUT',
  'IH-QC-WINGNUT-TRL',
] as const

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

/** Alt text is the product title — what a screen reader should read out. */
function altFor(title: string): string {
  return title
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
  console.log(`${prefix} Attach fitting renders from ${dir}\n`)

  const products = await db.product.findMany({
    where: { sku: { in: [...SKUS] } },
    select: {
      id: true,
      sku: true,
      title: true,
      images: { select: { id: true, media: { select: { originalFilename: true } } } },
    },
  })
  const bySku = new Map(products.map((p) => [p.sku, p]))

  const store = dryRun ? null : supabase()
  let attached = 0
  const problems: string[] = []

  for (const sku of SKUS) {
    const product = bySku.get(sku)
    if (!product) {
      problems.push(`${sku}: no such product`)
      console.log(`  MISSING  ${sku.padEnd(22)} not in the database`)
      continue
    }

    const file = `${sku}.png`
    const path = join(dir, file)
    if (!existsSync(path)) {
      problems.push(`${sku}: ${file} not found`)
      console.log(`  NO FILE  ${sku.padEnd(22)} expected ${file}`)
      continue
    }

    if (product.images.some((i) => i.media.originalFilename === file)) {
      console.log(`  skip     ${sku.padEnd(22)} already carries ${file}`)
      continue
    }
    if (product.images.length > 0) {
      // Not expected: the whole set went live with zero images. Something else
      // put one here, so stop rather than displace it.
      problems.push(`${sku}: already has ${product.images.length} image(s) — left alone`)
      console.log(
        `  CONFLICT ${sku.padEnd(22)} already has ${product.images.length} image(s), skipping`,
      )
      continue
    }

    const bytes = readFileSync(path)
    const size = pngSize(bytes)
    if (!size) {
      problems.push(`${sku}: ${file} is not a readable PNG`)
      console.log(`  BAD PNG  ${sku.padEnd(22)} ${file}`)
      continue
    }

    const key = objectKeyFor(sku)
    console.log(
      `  attach   ${sku.padEnd(22)} ${file} (${size.width}×${size.height}, ${Math.round(bytes.length / 1024)} KB) -> ${key}`,
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
          alt: altFor(product.title),
        },
        select: { id: true },
      })
      await tx.productImage.create({
        data: {
          productId: product.id,
          mediaId: media.id,
          position: 0,
          alt: altFor(product.title),
        },
      })
    })
    attached += 1
  }

  console.log(`\n${prefix} Attached ${attached} render(s).`)
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
