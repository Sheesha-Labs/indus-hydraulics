/**
 * Import the "Hydraulics product image (21 x 21 cm)" render set as the
 * feature image on each product page.
 *
 * The source of truth is `packages/db/data/product-feature-images.csv`,
 * which pairs every image file with the product it belongs to. That CSV was
 * derived from the client's "Product Titles and Image Names" spreadsheet:
 * the spreadsheet's titles are shorthand (e.g. "2SC") while catalogue titles
 * are the full marketing names (e.g. "2SC Compact Two Wire Braid Hose"), so
 * the pairing was resolved by title matching plus the spreadsheet's SKU-family
 * block ordering, then frozen into the CSV so this import is deterministic.
 *
 * Rows with `confidence=unmatched` have no catalogue product and are skipped.
 *
 * Idempotent: a product that already has an image whose Media
 * `originalFilename` matches the CSV row is left alone, so re-running after a
 * partial failure only fills the gaps.
 *
 * Usage:
 *   pnpm --filter @indus/db tsx src/scripts/import-product-feature-images.ts \
 *     --dir "/path/to/Hydraulics product image (21 x 21 cm)" [--dry-run] [--limit=N]
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const CSV_PATH = resolve(__dirname, '../../data/product-feature-images.csv')
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/**
 * Prisma picks up `packages/db/.env` on its own, but the Supabase storage
 * credentials only live in the web app's env file. Load them here so the
 * script runs with a plain `pnpm --filter @indus/db tsx …` and no shell setup.
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

type Row = {
  image: string
  sheetTitle: string
  productSku: string
  productSlug: string
  productTitle: string
  category: string
  confidence: string
  method: string
  score: string
}

function parseCsv(text: string): Row[] {
  // Minimal RFC-4180 reader — titles contain commas and double quotes
  // (e.g. `"Supercat" Flange-on-Fitting`), so a naive split is not enough.
  const rows: string[][] = []
  let field = ''
  let record: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      record.push(field)
      field = ''
    } else if (c === '\n') {
      record.push(field)
      rows.push(record)
      record = []
      field = ''
    } else if (c !== '\r') field += c
  }
  if (field || record.length) {
    record.push(field)
    rows.push(record)
  }
  const header = rows.shift()!
  return rows
    .filter((r) => r.length === header.length && r.some((c) => c !== ''))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]!])) as Row)
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

async function main() {
  loadWebEnv()
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const dirArg = args.find((a) => a.startsWith('--dir='))?.slice('--dir='.length)
  const limitArg = args.find((a) => a.startsWith('--limit='))?.slice('--limit='.length)
  const limit = limitArg ? Number(limitArg) : Infinity
  if (!dirArg) throw new Error('--dir=<folder with the PNG files> is required')
  const dir = resolve(dirArg)
  if (!existsSync(dir)) throw new Error(`Image folder not found: ${dir}`)

  const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'))
  const usable = rows.filter((r) => r.confidence !== 'unmatched' && r.productSku)
  console.log(
    `[import] ${rows.length} CSV rows, ${usable.length} with a product, ` +
      `${rows.length - usable.length} unmatched (skipped)`,
  )

  // A handful of source files carry stray spaces the spreadsheet doesn't
  // (e.g. `HP 152.png` vs `HP152`), so index the folder on a squashed key.
  const squash = (s: string) => s.replace(/\s+/g, '').toLowerCase()
  const onDisk = new Map(readdirSync(dir).map((f) => [squash(f), f]))
  const sb = supabase()

  let created = 0
  let skipped = 0
  const problems: string[] = []
  let n = 0

  for (const row of usable) {
    if (n >= limit) break
    n++

    const diskName = onDisk.get(squash(row.image))
    if (!diskName) {
      problems.push(`${row.image}: file missing from ${dir}`)
      continue
    }

    const product = await db.product.findUnique({
      where: { sku: row.productSku },
      select: { id: true, title: true, images: { select: { media: { select: { originalFilename: true } } } } },
    })
    if (!product) {
      problems.push(`${row.image}: no product with sku ${row.productSku}`)
      continue
    }
    if (product.images.some((i) => i.media.originalFilename === row.image)) {
      skipped++
      continue
    }

    const buf = readFileSync(join(dir, diskName))
    const size = pngSize(buf)
    // Object key is derived from the SKU so the storage layout stays readable
    // and a re-upload of the same product/file overwrites rather than orphans.
    const objectPath = `products/${row.productSku}/${row.image}`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (dryRun) {
      console.log(`[dry-run] ${row.image} -> ${row.productSku} (${product.title})`)
      created++
      continue
    }

    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
      cacheControl: '31536000',
      upsert: true,
      contentType: 'image/png',
    })
    if (error) {
      problems.push(`${row.image}: upload failed — ${error.message}`)
      continue
    }

    // `DATABASE_URL` ships with connection_limit=1 for the storefront, so a
    // long single-connection run like this one can outrun the default 2s
    // transaction acquire window. Give it room and retry once.
    const writeRows = () =>
      db.$transaction(
        async (tx) => {
          const media = await tx.media.create({
            data: {
              kind: 'image',
              mimeType: 'image/png',
              originalFilename: row.image,
              storagePath: publicUrl,
              bytes: buf.byteLength,
              width: size?.width ?? null,
              height: size?.height ?? null,
              alt: product.title,
            },
            select: { id: true },
          })
          // Feature image — position 0. Existing images (if any) shift behind it.
          await tx.productImage.updateMany({
            where: { productId: product.id },
            data: { position: { increment: 1 } },
          })
          await tx.productImage.create({
            data: { productId: product.id, mediaId: media.id, position: 0, alt: product.title },
          })
        },
        { maxWait: 30_000, timeout: 30_000 },
      )

    try {
      await writeRows()
    } catch (err) {
      // P2028 (couldn't acquire a transaction) is the one failure worth a
      // second attempt — the pool frees up within a moment.
      await new Promise((r) => setTimeout(r, 2_000))
      try {
        await writeRows()
      } catch {
        problems.push(`${row.image}: db write failed — ${(err as Error).message.split('\n')[0]}`)
        continue
      }
    }

    created++
    if (created % 25 === 0) console.log(`[import] ${created} images attached…`)
  }

  console.log(
    `\n[import] done — ${created} attached, ${skipped} already present, ${problems.length} problems`,
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
