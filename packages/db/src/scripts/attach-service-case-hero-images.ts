/**
 * Give every published service case study a hero image.
 *
 * All 20 published cases shipped with `heroImageId = null`, so `CaseHero`
 * rendered its `PlaceholderImage` fallback at the top of every case page,
 * `ServiceCaseCard` did the same on the `/services` index, and — because
 * `/services/[slug]` resolves its OG image as `ogImage ?? heroImage` — every
 * share of every case fell back to the site default.
 *
 * The images are commissioned one per case, briefed from that case's own
 * `heroImageCaption` (the FIG. 01 line the page was laid out to carry) plus its
 * title and topic. They carry no text, no nameplates and no brand marks: the
 * caption already names the equipment, and legible lettering in a generated
 * image is always wrong.
 *
 * `ogImageMediaId` is deliberately left alone. The page already falls back to
 * the hero, so writing the same media id into both columns would only create a
 * second thing to keep in sync.
 *
 * New bucket, `service-images`, public — same reasoning as `blog-images` in
 * `attach-blog-hero-images.ts`: `product-images` is reached into by the media
 * library and the product importers, and editorial photography does not belong
 * in the blast radius of a per-SKU cleanup.
 *
 * Guards:
 *   1. Only cases named in `HEROES` are touched, matched on slug.
 *   2. A case already carrying the hero for its slug (matched on
 *      `Media.originalFilename`) is skipped, so a re-run after a partial
 *      failure only finishes the rest.
 *   3. A case that already has some OTHER hero is left alone and reported —
 *      this script adds imagery, it does not overwrite an editor's choice.
 *   4. Upload failures are collected and reported rather than aborting.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-service-case-hero-images.ts \
 *     --dir "/path/to/IndusServiceHeroesJpg" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'service-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/**
 * Frozen. One row per published case. `alt` describes what is in the frame —
 * it is read aloud by a screen reader and indexed as image text, so it does not
 * repeat the case title, which sits directly above the image anyway.
 */
const HEROES: readonly { slug: string; alt: string }[] = [
  {
    slug: 'workover-rig-cylinder-hose-overhaul-jebel-ali',
    alt: 'Technicians breaking a large tie-rod hydraulic cylinder out of a workover unit skid in an industrial yard, removed cylinders lined up on timber bearers',
  },
  {
    slug: 'mud-pump-fluid-end-rebuild-12-p-160',
    alt: 'A triplex mud pump fluid end on a workshop rebuild bench with its liner bores empty and a technician lapping a valve seat',
  },
  {
    slug: 'bop-13-58-10k-cameron-u-5-year-recertification',
    alt: 'A double-ram blowout preventer on stands with both bonnets swung open, ram blocks on a bench behind under non-destructive testing',
  },
  {
    slug: 'koomey-accumulator-rebladder-api-16d-recert',
    alt: 'A hydraulic closing-unit skid part-stripped, accumulator bottles laid down in a row and the pilot valve bank opened up on the bench',
  },
  {
    slug: 'coiled-tubing-injector-skid-emergency-repair',
    alt: 'A coiled-tubing injector head stripped on a workshop bench, drive chains slack and worn gripper blocks laid out for re-facing',
  },
  {
    slug: 'choke-kill-manifold-3116-10k-api-16c-recert',
    alt: 'A high-pressure choke and kill manifold on steel stands, its run of flanged gate valve bodies and handwheels receding down the frame',
  },
  {
    slug: 'hpu-50hp-drilling-rig-auxiliary-refurbishment',
    alt: 'A skid-mounted hydraulic power unit with its reservoir lid off while a technician draws a baseline oil sample into a bottle',
  },
  {
    slug: 'sour-service-hose-assembly-build-100-line-rig-refit',
    alt: 'A hose assembly bay mid-build, long tables of finished tagged hose assemblies grouped by circuit while technicians work the crimping press',
  },
  {
    slug: 'iso-4406-oil-cleanliness-coding-q1-2026-aluminum-smelter',
    alt: 'An analyst at a microscope in an oil condition laboratory, a rack of hydraulic oil samples ranging from clear amber to near black beside it',
  },
  {
    slug: 'custom-16-port-manifold-en24-420-bar-press-control',
    alt: 'A custom machined steel hydraulic manifold block clamped on a hydrotest bench with its ports plugged and a pressure gauge in the circuit',
  },
  {
    slug: 'bop-pressure-testing-service-api-std-53',
    alt: 'A pressure test in progress on a land rig, chart recorder pen drawing a rising trace while a supervisor watches from behind the barrier',
  },
  {
    slug: 'annual-bop-redress-12-month-elastomer-service',
    alt: 'An annular preventer open with its rubber packing element hoisted clear in a sling, new elastomer seals laid out in order on the bench',
  },
  {
    slug: 'bop-stack-rental-11-10k-workover-sour-service',
    alt: 'A complete workover blowout preventer stack assembled on a test stand ready to mobilise, shipping skid and crate waiting alongside',
  },
  {
    slug: 'bop-field-service-crew-h2s-trained-day-rate',
    alt: 'Three technicians in flame-resistant coveralls running a function test on a blowout preventer stack under a land rig substructure',
  },
  {
    slug: 'ct-snubbing-wireline-bop-testing-recertification',
    alt: 'A compact four-ram intervention blowout preventer with all bonnets open, four matched pairs of ram blocks laid out in front of it',
  },
  {
    slug: 'subsea-bop-stack-fat-sit-witness-engineering-support',
    alt: 'An engineer with a clipboard dwarfed by a subsea blowout preventer stack standing several storeys tall in a manufacturer’s test bay',
  },
  {
    slug: '15k-hpht-bop-service-hail-ghasha-jafurah-sour-gas',
    alt: 'Ram blocks from a high-pressure blowout preventer staged on a bench while a technician runs a bench hardness tester on one face',
  },
  {
    slug: 'diverter-system-recertification-21-1-4-2k-offshore',
    alt: 'A very large-bore diverter housing on timber bearers with its rubber sealing element extracted and overboard valve trim laid out nearby',
  },
  {
    slug: 'rotating-control-device-rcd-service-mpd-equipment-support',
    alt: 'A rotating control device bearing assembly opened on a bench, its moulded rubber sealing element being measured with a vernier caliper',
  },
  {
    slug: 'iwcf-iadc-wellsharp-well-control-training-levels-2-4',
    alt: 'A trainee at a well-control simulator console with an instructor pointing at the displays and three other trainees watching',
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
 * same as `attach-blog-hero-images.ts`.
 */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null
  let off = 2
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) return null
    const marker = buf[off + 1]!
    // Standalone markers carry no length field.
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
  const problems: string[] = []

  for (const hero of HEROES) {
    const file = `${hero.slug}.jpg`
    if (!onDisk.has(file)) {
      problems.push(`${hero.slug}: ${file} missing from ${dir}`)
      continue
    }

    const kase = await db.serviceCase.findUnique({
      where: { slug: hero.slug },
      select: {
        id: true,
        slug: true,
        title: true,
        heroImageId: true,
        heroImage: { select: { originalFilename: true } },
      },
    })
    if (!kase) {
      problems.push(`${hero.slug}: no service case with that slug`)
      continue
    }

    if (kase.heroImage?.originalFilename === file) {
      alreadyPresent++
      continue
    }
    if (kase.heroImageId) {
      problems.push(
        `${hero.slug}: already has a different hero (${kase.heroImage?.originalFilename ?? kase.heroImageId}) — left alone`
      )
      continue
    }

    const buf = readFileSync(join(dir, file))
    const size = jpegSize(buf)
    const objectPath = `cases/${hero.slug}.jpg`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (dryRun) {
      console.log(
        `[dry-run] attach ${file} (${size?.width}×${size?.height}) -> ${kase.title.slice(0, 70)}`
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
      problems.push(`${hero.slug}: upload failed — ${error.message}`)
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
            originalFilename: file,
            storagePath: publicUrl,
            bytes: buf.byteLength,
            width: size?.width ?? null,
            height: size?.height ?? null,
            alt: hero.alt,
          },
          select: { id: true },
        })
        await tx.serviceCase.update({ where: { id: kase.id }, data: { heroImageId: media.id } })
      },
      { maxWait: 15_000, timeout: 30_000 }
    )

    attached++
    console.log(`attached ${file} -> ${kase.title.slice(0, 70)}`)
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
