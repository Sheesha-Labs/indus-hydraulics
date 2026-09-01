/**
 * Attach commissioned photographs to the reserved in-article figure slots.
 *
 * The 2026-09-01 sprints published fifty articles with one reserved figure slot
 * each: a `figure` block carrying `imageId: null`, a caption and a brief.
 * `BlogFigureBlockView` renders nothing for a null id, so those articles read
 * as pure text until a photograph exists. This script is what fills them.
 *
 * WHAT IT DOES, PER IMAGE
 *
 *   1. Uploads the JPEG to the public `blog-images` bucket at
 *      `figures/<slug>.jpg`.
 *   2. Creates a `Media` row carrying the alt text — which describes what is in
 *      the frame, not what the article is about, because it is read aloud.
 *   3. Writes that Media id into the article's `figure` block in the database.
 *   4. Prints the slug → id line to paste into `imports/blog-figure-media.ts`.
 *
 * STEP 4 IS NOT OPTIONAL. `withFigures` composes figures on every import, so a
 * later re-run of that wave would write the null id back and the photograph
 * would silently disappear from the article. The map file is what makes the
 * attachment survive; the database write is just what makes it live today.
 *
 * Guards, in the same spirit as the hero attach script:
 *   - Only slugs named on disk are touched, and only articles that actually
 *     carry a reserved slot.
 *   - An article whose figure already has an id is reported and left alone —
 *     this script attaches, it does not overwrite.
 *   - Upload failures are collected and reported rather than aborting.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-blog-figure-images.ts \
 *     --dir "/path/to/jpgs" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Prisma, PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'blog-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/**
 * Alt text per slug. Describes the photograph, not the article: a screen reader
 * gets the caption already, and repeating it teaches nothing.
 */
const ALT: Record<string, string> = {
  'copper-mine-hydraulic-fittings':
    'Hydraulic lines clamped along the chassis rail of a haul truck on a red-earth mine road, one line worn silver where it has been rubbing against a frame member',
  'port-and-terminal-fittings':
    'Salt-corroded hydraulic fittings entering a manifold block on the boom of a reach stacker, stacked shipping containers out of focus behind',
  'oilfield-fittings-in-west-africa':
    'A sealed and banded timber crate beside an open pallet of coiled hose assemblies and boxed fittings on wet concrete in a tropical supply yard',
  'water-well-drilling-rig-fittings':
    'Coiled hydraulic hose assemblies with plastic caps fitted and an open case of steel adapters on the bed of a support truck at a bush drilling site at golden hour',
  'fittings-on-a-chinese-excavator':
    'Two male hydraulic fittings lying on a workshop bench with visibly different cone angles, a wedge-shaped seat gauge seated against the nearer cone',
  'reading-a-weeping-joint':
    'Oil crept from under the nut of a hydraulic joint and running down the fitting and hose below it, the surrounding metal wiped clean',
  'agriculture-and-construction-fittings':
    'A hydraulic hose on a backhoe loader arm worn through its outer cover against the boom casting, with an oil stain spreading on the paintwork below',
  'quarry-and-crusher-fittings':
    'Hydraulic lines clamped along the frame of a jaw crusher under thick grey rock dust, one clamp missing and its line hanging slack',
  'sugar-mill-and-agro-processing-fittings':
    'Hydraulic hoses running past heavily scaled steam-stained pipework in a sugar mill walkway, wet floor and steam haze',
  'storing-fittings-and-seals-on-site':
    'Steel shelving inside a shipping-container store holding bagged steel fittings and closed boxes, one box open showing rubber seals, lit by a single overhead bulb',
  'gold-plant-hydraulic-fittings':
    'Hydraulic lines on brackets beside wet mineral-scaled process pipework along a steel grating walkway in a processing plant under flat overcast light',
  'why-fittings-seize-in-coastal-air':
    'Macro of a hydraulic fitting hex at a coastal yard with corrosion blooming at the hex corners and thread crests while the flats remain sound',
  'tractor-hydraulic-fittings':
    'Two dust-caked agricultural quick-coupler halves in their mountings at the rear of a tractor at dusk, one capped and one open',
  'building-a-thread-reference-board':
    'A plywood workshop board with rows of male and female hydraulic fittings mounted on short bolts, a pitch gauge and a seat gauge hanging on a chain beside them',
  'dirt-ingress-in-transit-and-storage':
    'Two hose assemblies in an opened timber crate, one sealed in polythene with caps fitted on both ends and one bare with uncapped ends dulled by dust',
}

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

/** Width and height from the JPEG frame header — no image dependency. */
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
  const dirIndex = args.indexOf('--dir')
  if (dirIndex === -1 || !args[dirIndex + 1]) throw new Error('--dir <path> is required')
  const dir = resolve(args[dirIndex + 1]!)
  if (!existsSync(dir)) throw new Error(`no such directory: ${dir}`)

  const files = readdirSync(dir).filter((f) => f.endsWith('.jpg'))
  const sb = supabase()

  const problems: string[] = []
  const written: { slug: string; id: string }[] = []
  let alreadyPresent = 0

  for (const file of files.sort()) {
    const slug = file.replace(/\.jpg$/, '')
    const alt = ALT[slug]
    if (!alt) {
      problems.push(`${slug}: no alt text in this script — add one before attaching`)
      continue
    }

    const post = await db.blogPost.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true, title: true, bodyBlocks: true },
    })
    if (!post) {
      problems.push(`${slug}: no such article`)
      continue
    }

    const blocks = (post.bodyBlocks as Prisma.JsonArray | null) ?? []
    const figureIndex = blocks.findIndex(
      (b) => b && typeof b === 'object' && (b as Record<string, unknown>).type === 'figure'
    )
    if (figureIndex === -1) {
      problems.push(`${slug}: article carries no figure slot`)
      continue
    }
    const figure = blocks[figureIndex] as Record<string, unknown>
    if (figure.imageId) {
      alreadyPresent++
      continue
    }

    const buf = readFileSync(join(dir, file))
    const size = jpegSize(buf)
    const objectPath = `figures/${slug}.jpg`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (dryRun) {
      console.log(`[dry-run] ${file} (${size?.width}×${size?.height}) -> ${post.title}`)
      continue
    }

    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
      cacheControl: '31536000',
      upsert: true,
      contentType: 'image/jpeg',
    })
    if (error) {
      problems.push(`${slug}: upload failed — ${error.message}`)
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
            alt,
          },
          select: { id: true },
        })
        const next = [...blocks]
        next[figureIndex] = { ...figure, imageId: media.id }
        await tx.blogPost.update({
          where: { id: post.id },
          data: { bodyBlocks: next as Prisma.InputJsonValue },
        })
        written.push({ slug, id: media.id })
      },
      { maxWait: 15_000, timeout: 30_000 }
    )
    console.log(`attached ${file} -> ${post.title}`)
  }

  if (written.length) {
    console.log('\nPaste into packages/db/src/imports/blog-figure-media.ts:\n')
    for (const w of written.sort((a, b) => a.slug.localeCompare(b.slug))) {
      console.log(`  '${w.slug}': '${w.id}',`)
    }
  }

  console.log(
    `\n${dryRun ? '[dry-run] ' : ''}attached ${written.length}, already present ${alreadyPresent}, problems ${problems.length}`
  )
  for (const p of problems) console.log(`  ✗ ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
