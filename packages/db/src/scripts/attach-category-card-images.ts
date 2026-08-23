/**
 * Give the six top-level categories the feature image their home-page card
 * draws.
 *
 * Every one of them already carried a `Category.image`, but the pictures were
 * cutaway line diagrams commissioned for a different design, and the home page
 * never drew them at all — the card's picture panel was hardcoded empty. The
 * replacements are studio family-portraits: a group of the real products from
 * that category, composed as one shot, the way a manufacturer's catalogue puts
 * a whole range on one page.
 *
 * Five are commissioned frames carrying no text, part numbers or brand marks —
 * generated lettering is always subtly wrong and it dates a picture the moment
 * a part number changes. The sixth, Lubricants, is different on purpose: that
 * category IS the Molykote packaging, so the card is built from the genuine
 * DuPont packshots already attached to our own Molykote products rather than a
 * frame of invented tins. See `project_catalogue_imagery_sourcing` — supplier
 * imagery for brands we distribute is fair game and is already the pattern.
 *
 * The old diagram Media rows are left in place, not deleted. `Media` is shared
 * with the media library and `Media.storagePath` is not unique, so a delete
 * here is a delete for anything else pointing at the same object; this script
 * repoints `Category.imageId` and reports what it displaced.
 *
 * Guards:
 *   1. Only the six slugs named in `CARDS` are touched.
 *   2. A category already carrying this run's file (matched on
 *      `Media.originalFilename`) is skipped, so a re-run finishes a partial one.
 *   3. Upload failures are collected and reported rather than aborting the run.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-category-card-images.ts \
 *     --dir "/path/to/jpg" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/**
 * Frozen. One row per top-level category, in home-page order. `alt` describes
 * what is actually in the frame — it is read aloud by a screen reader and
 * indexed as image text, so it names the parts, not the category again.
 */
const CARDS: readonly { slug: string; file: string; alt: string }[] = [
  {
    slug: 'hydraulic-pumps',
    file: 'hydraulic-pumps.jpg',
    alt: 'A group of hydraulic pumps on a studio backdrop — a variable-displacement axial piston pump with its swashplate control head, an external gear pump, a vane pump cartridge, and a splined drive shaft and cover plate laid in front',
  },
  {
    slug: 'valves-manifolds',
    file: 'valves-manifolds.jpg',
    alt: 'A group of hydraulic and process valves — a twin-solenoid directional valve seated on a drilled aluminium manifold block, a resilient-seated butterfly valve with lever handle, a screw-in cartridge relief valve and a compact valve body',
  },
  {
    slug: 'cylinders',
    file: 'hydraulic-cylinders.jpg',
    alt: 'A group of double-acting hydraulic cylinders — a tie-rod cylinder with its chrome rod part extended, a heavy welded cylinder with a bronze-bushed clevis eye, a short flange-mount cylinder, and a rod eye, mounting bracket and clevis pin in front',
  },
  {
    slug: 'hydraulic-hose-fittings-suppliers-uae',
    file: 'hoses-fittings.jpg',
    alt: 'A group of hydraulic hose and connectors — wire-braid, spiral and thermoplastic hose with crimped ends sweeping across the frame, over a fan of plated crimp fittings, elbows, swivel nuts, ferrules, a flat-face quick coupler and a split-flange clamp',
  },
  {
    slug: 'seals-accessories',
    file: 'seals-accessories.jpg',
    alt: 'A group of hydraulic power-unit accessories — a blue bladder accumulator, a return-line filter housing with its pleated element stood alongside, a perforated suction strainer and a lever ball valve, with O-rings, rod seals, a back-up ring and a wear ring laid in front',
  },
  {
    slug: 'industrial-lubricant-suppliers-uae',
    file: 'lubricants.jpg',
    alt: 'A group of Molykote lubricant packaging — a steel drum and a plastic pail behind, paste tins, a grease cartridge, two tubs and a sachet arranged in front on a studio backdrop',
  },
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

/**
 * Reads width/height out of the JPEG frame header — avoids an image dependency,
 * same as `jpegSize` in `attach-blog-hero-images.ts`. Walks the marker chain to
 * the first SOF segment; every SOFn but the reserved DHT/JPG/DAC markers
 * carries the dimensions in the same place.
 */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null
  let off = 2
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) return null
    const marker = buf[off + 1]!
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      off += 2
      continue
    }
    const len = buf.readUInt16BE(off + 2)
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    if (isSof) return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) }
    off += 2 + len
  }
  return null
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
  if (!dirArg) throw new Error('--dir=<folder with the JPEG files> is required')
  const dir = resolve(dirArg)
  if (!existsSync(dir)) throw new Error(`Image folder not found: ${dir}`)

  const onDisk = new Set(readdirSync(dir))
  const sb = supabase()

  let attached = 0
  let alreadyPresent = 0
  const displaced: string[] = []
  const problems: string[] = []

  for (const card of CARDS) {
    if (!onDisk.has(card.file)) {
      problems.push(`${card.slug}: ${card.file} missing from ${dir}`)
      continue
    }

    const category = await db.category.findFirst({
      where: { slug: card.slug },
      select: {
        id: true,
        slug: true,
        name: true,
        imageId: true,
        image: { select: { originalFilename: true, storagePath: true } },
      },
    })
    if (!category) {
      problems.push(`${card.slug}: no category with that slug`)
      continue
    }

    if (category.image?.originalFilename === card.file) {
      alreadyPresent++
      continue
    }

    const buf = readFileSync(join(dir, card.file))
    const size = jpegSize(buf)
    const objectPath = `categories/${card.slug}.jpg`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (dryRun) {
      console.log(
        `[dry-run] attach ${card.file} (${size?.width}×${size?.height}) -> ${category.name}`
      )
      attached++
      continue
    }

    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
      cacheControl: '31536000',
      upsert: true,
      contentType: 'image/jpeg',
    })
    if (error) {
      problems.push(`${card.slug}: upload failed — ${error.message}`)
      continue
    }

    // `DATABASE_URL` ships a small connection limit, so a single-connection run
    // can outrun the default 2s transaction acquire window.
    await db.$transaction(
      async (tx) => {
        const media = await tx.media.create({
          data: {
            kind: 'image',
            mimeType: 'image/jpeg',
            originalFilename: card.file,
            storagePath: publicUrl,
            bytes: buf.byteLength,
            width: size?.width ?? null,
            height: size?.height ?? null,
            alt: card.alt,
          },
          select: { id: true },
        })
        await tx.category.update({ where: { id: category.id }, data: { imageId: media.id } })
      },
      { maxWait: 15_000, timeout: 30_000 }
    )

    if (category.imageId) {
      displaced.push(
        `${category.name}: was ${category.image?.originalFilename ?? category.imageId} (Media row left in place)`
      )
    }
    attached++
    console.log(`attached ${card.file} -> ${category.name}`)
  }

  console.log(
    `\n${dryRun ? '[dry-run] ' : ''}attached ${attached}, already present ${alreadyPresent}, problems ${problems.length}`
  )
  for (const d of displaced) console.log(`  · ${d}`)
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
