/**
 * Swap in the 2026 hydraulic-hose render set and retire what it replaces.
 *
 * The client re-shot eleven hose lines at 1200×1200 with the Indus lay-line
 * printed on the cover (`EN 853 1SN - SAE 100 R1AT` and so on). Those replace
 * the 1000×1000 `HP0xx.png` frames from the "Hydraulics product image
 * (21 x 21 cm)" set that `import-product-feature-images.ts` placed, which are
 * unbranded and — for 4SP/4SH and 2SN/2SC — byte-identical to each other, so
 * two product pages were showing one picture.
 *
 * Two of the eleven (1SC, R4) had no image at all, so this also closes those
 * gaps rather than only swapping.
 *
 * The pairing is a literal table, not a title match. Every file was checked
 * against the spec printed on its own lay-line before being written down here,
 * which is the only evidence that "R4 Hydraulic Hose.png" is in fact the R4 —
 * the filenames alone could not settle it, and a silent mis-pair is invisible
 * on the page.
 *
 * Retirement is permanent, not a trip to the media trash: the point of the
 * request was to stop paying for the bytes. Guards, in order —
 *   1. Only images already attached to these eleven products are touched.
 *   2. Every candidate row is re-checked for other references at run time; a
 *      row referenced anywhere else is left alone and reported.
 *   3. `storagePath` is NOT unique (227 rows in this database share one with
 *      another row), so the storage object only goes when no other Media row
 *      addresses it — `canRemoveStorageObject`.
 *   4. Retired rows are written to `data/retired-hose-images-<date>.json`
 *      first, so the pairing can be reconstructed even though the bytes are
 *      gone.
 *
 * Idempotent: a product already carrying the new file (matched on
 * `Media.originalFilename`) is skipped, so a re-run after a partial failure
 * only finishes the rest.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/replace-hydraulic-hose-renders.ts \
 *     --dir "/path/to/HosesIndus" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { canRemoveStorageObject } from '@indus/domain'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const BACKUP_DIR = resolve(__dirname, '../../data')

/**
 * Frozen. Each row was confirmed against the standard printed on the hose in
 * that file — adding a line here means opening the image and reading it, not
 * trusting the filename.
 */
const PAIRS: readonly { file: string; sku: string; layLine: string }[] = [
  { file: '1SN Hydraulic Hose.png', sku: 'IH-HOSE-R1-1SN', layLine: 'EN 853 1SN - SAE 100 R1AT' },
  { file: '2SN Hydraulic Hose.png', sku: 'IH-HOSE-R2-2SN', layLine: 'EN 853 2SN - SAE 100 R2AT' },
  { file: '1SC Hydraulic Hose.png', sku: 'IH-HOSE-R1-1SC', layLine: 'EN 857 1SC - SAE 100 R17' },
  { file: '2SC Hydraulic Hose.png', sku: 'IH-HOSE-2SC', layLine: 'EN 857 2SC - SAE 100 R16' },
  { file: 'R4 Hydraulic Hose.png', sku: 'IH-HOSE-R4', layLine: 'SAE 100 R4' },
  { file: 'R5 Hydraulic Hose.png', sku: 'IH-HOSE-R5', layLine: 'SAE 100 R5' },
  { file: 'R6 Hydraulic Hose.png', sku: 'IH-HOSE-R6', layLine: 'SAE 100 R6' },
  { file: 'R13 Hydraulic Hose.png', sku: 'IH-HOSE-R13', layLine: 'EN 856 R13 - SAE 100 R13' },
  { file: 'R15 Hydraulic Hose.png', sku: 'IH-HOSE-R15', layLine: 'SAE 100 R15' },
  { file: '4SP Hydraulic Hose.png', sku: 'IH-HOSE-4SP', layLine: 'EN 856 4SP - SAE 100 R12' },
  { file: '4SH Hydraulic Hose.png', sku: 'IH-HOSE-4SH', layLine: 'EN 856 4SH - SAE 100 R12' },
] as const

/**
 * Prisma reads `packages/db/.env` on its own, but the Supabase storage
 * credentials only live in the web app's env file. Load them here so the
 * script runs with a plain `pnpm --filter @indus/db exec tsx …` and no shell
 * setup. Anything already exported wins.
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

/**
 * The delivered filenames carry spaces. `originalFilename` keeps them (it is
 * the label an operator recognises in the media library, and the idempotency
 * key), but the object key is slugged so the public URL has no `%20` in it.
 */
function objectKeyFor(sku: string, file: string): string {
  const slug = file
    .replace(/\.png$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `products/${sku}/${slug}.png`
}

/**
 * Every Media relation that can hold one of these rows. Checked at run time
 * rather than trusted from a survey, because "nothing else points at it" is
 * the whole basis for deleting the bytes.
 *
 * JSON block bodies and legacy HTML can also reference media, but neither can
 * reach these rows: they were created by the feature-image importer four days
 * ago and have never been offered in a picker. A full-table scan across all
 * 549 text/json columns on 2026-08-20 confirmed the only references are the
 * `product_images` rows this script removes.
 */
async function otherReferences(mediaId: string, ownProductImageIds: string[]) {
  const m = await db.media.findUnique({
    where: { id: mediaId },
    select: {
      _count: {
        select: {
          productImages: true,
          productDocuments: true,
          categoryImages: true,
          brandLogos: true,
          brandHeroes: true,
          brandCaseStudyImages: true,
          industryHeroes: true,
          industryCaseStudyImages: true,
          rfqAttachments: true,
          quotePdfs: true,
          blogHeroes: true,
          blogCategoryImages: true,
          blogAuthorAvatars: true,
          importJobSources: true,
          navMenuItemPromos: true,
          storeSettingsLogos: true,
          storeSettingsFooterLogos: true,
          storeSettingsFavicons: true,
          storeSettingsSearchLogos: true,
          homepageHeroSlides: true,
          serviceCaseHeroes: true,
          serviceCaseOgImages: true,
        },
      },
    },
  })
  if (!m) return ['media row vanished']
  const found: string[] = []
  for (const [rel, n] of Object.entries(m._count)) {
    // The ProductImage rows this script is itself removing do not count.
    const expected = rel === 'productImages' ? ownProductImageIds.length : 0
    if (n > expected) found.push(`${rel}=${n}`)
  }
  return found
}

async function main() {
  loadWebEnv()
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  // `pnpm exec` rewrites `--dir="x y"` into two argv entries, so accept both
  // `--dir=<path>` and `--dir <path>`.
  const eq = args.find((a) => a.startsWith('--dir='))?.slice('--dir='.length)
  const at = args.indexOf('--dir')
  const dirArg = eq ?? (at >= 0 ? args[at + 1] : undefined)
  if (!dirArg) throw new Error('--dir=<folder with the PNG files> is required')
  const dir = resolve(dirArg)
  if (!existsSync(dir)) throw new Error(`Image folder not found: ${dir}`)

  const onDisk = new Set(readdirSync(dir))
  const sb = supabase()

  let attached = 0
  let alreadyPresent = 0
  let retired = 0
  let bytesFreed = 0
  const problems: string[] = []
  const backup: unknown[] = []
  const backupPath = join(BACKUP_DIR, `retired-hose-images-${new Date().toISOString().slice(0, 10)}.json`)

  for (const pair of PAIRS) {
    if (!onDisk.has(pair.file)) {
      problems.push(`${pair.file}: missing from ${dir}`)
      continue
    }

    const product = await db.product.findUnique({
      where: { sku: pair.sku },
      select: {
        id: true,
        sku: true,
        title: true,
        images: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            position: true,
            media: {
              select: {
                id: true,
                originalFilename: true,
                storagePath: true,
                bytes: true,
                width: true,
                height: true,
                alt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })
    if (!product) {
      problems.push(`${pair.file}: no product with sku ${pair.sku}`)
      continue
    }

    // Everything currently on the page is what the new render replaces.
    const displaced = product.images.filter((i) => i.media.originalFilename !== pair.file)
    const already = product.images.some((i) => i.media.originalFilename === pair.file)

    if (already) {
      alreadyPresent++
    } else {
      const buf = readFileSync(join(dir, pair.file))
      const size = pngSize(buf)
      const objectPath = objectKeyFor(pair.sku, pair.file)
      const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

      if (dryRun) {
        console.log(
          `[dry-run] attach ${pair.file} (${size?.width}×${size?.height}) -> ${pair.sku} ${product.title}`
        )
      } else {
        const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
          cacheControl: '31536000',
          upsert: true,
          contentType: 'image/png',
        })
        if (error) {
          problems.push(`${pair.file}: upload failed — ${error.message}`)
          continue
        }

        // `DATABASE_URL` ships connection_limit=1 for the storefront, so a
        // single-connection run can outrun the default 2s transaction acquire
        // window. Give it room, same as the original importer.
        await db.$transaction(
          async (tx) => {
            const media = await tx.media.create({
              data: {
                kind: 'image',
                mimeType: 'image/png',
                originalFilename: pair.file,
                storagePath: publicUrl,
                bytes: buf.byteLength,
                width: size?.width ?? null,
                height: size?.height ?? null,
                alt: product.title,
              },
              select: { id: true },
            })
            await tx.productImage.updateMany({
              where: { productId: product.id },
              data: { position: { increment: 1 } },
            })
            await tx.productImage.create({
              data: {
                productId: product.id,
                mediaId: media.id,
                position: 0,
                alt: product.title,
              },
            })
          },
          { maxWait: 30_000, timeout: 30_000 }
        )
      }
      attached++
    }

    // ── Retire what it replaced ────────────────────────────────────────────
    for (const old of displaced) {
      const refs = await otherReferences(old.media.id, [old.id])
      if (refs.length > 0) {
        problems.push(
          `${old.media.originalFilename}: still referenced (${refs.join(', ')}) — left in place`
        )
        continue
      }

      const siblings = await db.media.count({
        where: { storagePath: old.media.storagePath, id: { not: old.media.id } },
      })
      const removeObject = canRemoveStorageObject({ otherRowsSharingPath: siblings })

      backup.push({
        productSku: product.sku,
        productTitle: product.title,
        position: old.position,
        media: old.media,
        storageObjectRemoved: removeObject,
      })
      // Flushed before the delete, not after the loop: a crash halfway
      // through would otherwise take the record of what was already gone.
      if (!dryRun) writeFileSync(backupPath, JSON.stringify(backup, null, 2))

      if (dryRun) {
        console.log(
          `[dry-run] retire ${old.media.originalFilename} from ${pair.sku} ` +
            `(${old.media.bytes} B, storage object ${removeObject ? 'removed' : 'kept — shared'})`
        )
        retired++
        bytesFreed += removeObject ? old.media.bytes : 0
        continue
      }

      if (removeObject) {
        // storagePath holds the full public URL; the bucket API wants the key.
        const marker = `/object/public/${BUCKET}/`
        const idx = old.media.storagePath.indexOf(marker)
        const key =
          idx >= 0 ? old.media.storagePath.slice(idx + marker.length) : old.media.storagePath
        const { error } = await sb.storage.from(BUCKET).remove([key])
        if (error) {
          // Leave the row too. A dangling row with a live object is tidier
          // than a live row pointing at nothing.
          problems.push(`${old.media.originalFilename}: storage remove failed — ${error.message}`)
          continue
        }
      }

      // ProductImage.mediaId has no onDelete rule, so it is RESTRICT: the
      // Media row cannot go while the join row still points at it. Product →
      // ProductImage cascades, but that is the other direction.
      await db.$transaction([
        db.productImage.deleteMany({ where: { mediaId: old.media.id } }),
        db.media.delete({ where: { id: old.media.id } }),
      ])
      retired++
      bytesFreed += removeObject ? old.media.bytes : 0
    }
  }

  if (backup.length > 0) {
    console.log(
      `\n[backup] ${backup.length} retired rows ${dryRun ? 'would go' : 'written'} to ${backupPath}`
    )
  }

  console.log(
    `\n[hose-renders] ${attached} attached, ${alreadyPresent} already present, ` +
      `${retired} retired, ${(bytesFreed / 1024).toFixed(0)} KB freed, ${problems.length} problems`
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
