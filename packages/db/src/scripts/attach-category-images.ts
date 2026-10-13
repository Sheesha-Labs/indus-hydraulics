/**
 * Give every published top-level category its card image.
 *
 * `Category.image` renders in two places, both for top-level categories only:
 * the 16:9 cards on `/c` and the home page's featured-category tiles. Six of
 * the 18 published roots had one (studio group shots in
 * `product-images/categories/`); the other twelve — mostly the oilfield and
 * lifting verticals added since — rendered an empty grey panel on `/c`.
 *
 * The new images follow the existing six: the category's products on a
 * seamless light-grey studio backdrop, 1536×1024 JPEG, no text or brand marks.
 * Large equipment categories (frac, cementing, well testing…) get a catalogue
 * render of one representative unit instead of a group. They are generated,
 * representative images, not photographs of stock.
 *
 * Sub-categories are deliberately not covered: no storefront surface renders
 * a sub-category's image today (they appear as text pills on the parent page).
 *
 * Guards:
 *   1. Only categories named below are touched, matched on slug.
 *   2. A category that already carries the image for its file (matched on
 *      `Media.originalFilename`) is skipped, so a re-run finishes the rest.
 *   3. A category that already has some OTHER image is left alone and reported.
 *   4. Upload failures are collected and reported rather than aborting the run.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-category-images.ts \
 *     --dir "/path/to/folder" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/** `alt` describes what is in the frame; the `/c` card renders it. */
const IMAGES: readonly { slug: string; alt: string }[] = [
  { slug: 'industrial-hose-suppliers-uae', alt: 'A group of industrial hoses — red air hose, black suction hose with a helix, clear PVC suction hose and corrugated stainless hose — with cam and groove, Storz and claw couplings and a hose clamp in front' },
  { slug: 'lifting-rigging-equipment-uae', alt: 'A group of lifting and rigging gear — a four-leg chain sling, a wire rope sling, a yellow webbing sling, shackles, a swivel hook, a turnbuckle and a manual chain block' },
  { slug: 'oil-gas-hoses', alt: 'A group of oilfield hoses — a coiled rotary drilling hose with a forged coupling, an armoured flexible line with a flange end and a red hose with a hammer union, a safety clamp in front' },
  { slug: 'oilfield-valve-suppliers-uae', alt: 'A group of oilfield valves — a flanged gate valve with handwheel, a ball valve with lever, a lug butterfly valve, a check valve, a union-end valve and a needle valve' },
  { slug: 'flow-iron-wellhead-equipment-uae', alt: 'A group of red flow iron — pup joints with hammer union nuts, a swivel joint, a tee and a plug valve, with metal ring joint gaskets in front' },
  { slug: 'blowout-preventers', alt: 'A red blowout preventer with an annular preventer on a ram body, a ram block assembly and rubber packer elements in front' },
  { slug: 'instrumentation-controls', alt: 'A group of oilfield instruments — a pressure gauge, pressure transmitters, a turbine flowmeter, a magnetic flowmeter, a thermowell, a proximity sensor and an explosion-proof junction box' },
  { slug: 'well-testing-equipment', alt: 'A skid-mounted horizontal three-phase separator with valves and gauges, beside a vertical surge tank on its own skid' },
  { slug: 'cementing-equipment', alt: 'A skid-mounted cementing unit with twin triplex pumps, mixing and displacement tanks and a control cabin' },
  { slug: 'drilling-workover-systems', alt: 'A skid-mounted triplex mud pump with its electric motor, beside a mud manifold of gate valves on a frame' },
  { slug: 'stimulation-equipment', alt: 'A skid-mounted stimulation pumping unit with a diesel engine, a triplex pump and a blending tank' },
  { slug: 'fracturing-equipment', alt: 'A frac pumper on a tri-axle semi-trailer — diesel engine and transmission at the front, plunger pump at the rear, discharge iron along the side' },
] as const

/** Loads the Supabase storage credentials, which only live in the web app's env file. */
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

/** Width/height from the JPEG frame header — same walk as attach-blog-hero-images.ts. */
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
  const problems: string[] = []

  for (const item of IMAGES) {
    const file = `${item.slug}.jpg`
    if (!onDisk.has(file)) {
      problems.push(`${item.slug}: ${file} missing from ${dir}`)
      continue
    }
    const cat = await db.category.findUnique({
      where: { slug: item.slug },
      select: { id: true, name: true, imageId: true, image: { select: { originalFilename: true } } },
    })
    if (!cat) {
      problems.push(`${item.slug}: no category with that slug`)
      continue
    }
    if (cat.image?.originalFilename === file) {
      alreadyPresent++
      continue
    }
    if (cat.imageId) {
      problems.push(`${item.slug}: already has a different image (${cat.image?.originalFilename ?? cat.imageId}) — left alone`)
      continue
    }

    const buf = readFileSync(join(dir, file))
    const size = jpegSize(buf)
    const objectPath = `categories/${file}`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (dryRun) {
      console.log(`[dry-run] attach ${file} (${size?.width}×${size?.height}) -> ${cat.name}`)
      attached++
      continue
    }

    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
      cacheControl: '31536000',
      upsert: true,
      contentType: 'image/jpeg',
    })
    if (error) {
      problems.push(`${item.slug}: upload failed — ${error.message}`)
      continue
    }

    await db.$transaction(
      async (tx) => {
        const media = await tx.media.create({
          data: {
            kind: 'image',
            mimeType: 'image/jpeg',
            originalFilename: file,
            storagePath: publicUrl,
            bytes: buf.byteLength,
            width: size?.width ?? null,
            height: size?.height ?? null,
            alt: item.alt,
          },
          select: { id: true },
        })
        await tx.category.update({ where: { id: cat.id }, data: { imageId: media.id } })
      },
      { maxWait: 15_000, timeout: 30_000 }
    )
    attached++
    console.log(`attached ${file} -> ${cat.name}`)
  }

  console.log(
    `\n${dryRun ? '[dry-run] ' : ''}attached ${attached}, already present ${alreadyPresent}, problems ${problems.length}`
  )
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
