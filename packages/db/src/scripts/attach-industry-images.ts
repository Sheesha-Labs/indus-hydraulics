/**
 * Give every published industry page a hero photograph, and every published
 * case study on those pages a card image.
 *
 * All six database-driven industry pages (`/industries/<slug>`) shipped with
 * `heroId = null`, so the 4:3 frame beside the H1 rendered the industry name on
 * a grey panel and the page's OG image fell back to the site default. Their 18
 * "Reference installs" cards showed the word CASE in an empty 16:10 box.
 *
 * The images are generated, representative scenes — not photographs of the
 * named projects. They carry no text and no brand marks. Heroes are 1600×1200
 * (4:3, the hero frame) and case-study cards 1600×1000 (16:10, the card frame),
 * both JPEG. `data-center-liquid-cooling` is a designed page whose photography
 * lives in `@indus/domain/industry-pages.ts`, so it is not touched here.
 *
 * They go in the existing public `industry-images` bucket, which already holds
 * the designed page's photography, under `heroes/` and `case-studies/`.
 *
 * Guards:
 *   1. Only industries and case studies named below are touched — industries by
 *      slug, case studies by industry slug and exact title.
 *   2. A row that already carries the image for its file (matched on
 *      `Media.originalFilename`) is skipped, so a re-run finishes the rest.
 *   3. A row that already has some OTHER image is left alone and reported.
 *   4. Upload failures are collected and reported rather than aborting the run.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-industry-images.ts \
 *     --dir "/path/to/folder" [--dry-run]
 *
 * The folder holds `<slug>.jpg` for each hero and `<slug>-case-<n>.jpg` for
 * each case study.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'industry-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/**
 * `alt` describes what is in the frame. The industry page renders the hero with
 * an empty alt (it is decorative next to the H1), but the media library and the
 * OG image still use it.
 */
const HEROES: readonly { slug: string; alt: string }[] = [
  { slug: 'oil-gas', alt: 'A BOP accumulator unit with rows of pressure bottles, a pump skid and bundled hydraulic hoses at the base of a desert land rig at sunset' },
  { slug: 'mining', alt: 'Close-up of a mining shovel’s hydraulic boom cylinders and hoses as it loads a haul truck in an open-pit mine' },
  { slug: 'marine', alt: 'A hydraulic anchor-handling winch on the wet aft deck of an offshore supply vessel, an oil platform on the horizon' },
  { slug: 'steel', alt: 'A glowing steel strip passing through a hot rolling mill stand with its hydraulic cylinders and tubing' },
  { slug: 'construction', alt: 'An excavator’s boom cylinders and hydraulic hoses on a construction site, a hazy city skyline behind' },
  { slug: 'power', alt: 'Spillway radial gates on a hydroelectric dam, each raised by a pair of hydraulic cylinders, water rushing beneath' },
] as const

/**
 * `file` index follows each industry's case-study position order. The title is
 * the match key — an edited title is reported, never guessed at.
 */
const CASES: readonly { slug: string; n: number; title: string; alt: string }[] = [
  { slug: 'oil-gas', n: 1, title: 'Mumbai Refinery — HPU overhaul on 14 FCC control valves', alt: 'Two technicians replacing a hydraulic actuator on a refinery control valve, a hydraulic power unit beside them' },
  { slug: 'oil-gas', n: 2, title: 'BHS Neelam — BOP accumulator recharge', alt: 'A technician working on a BOP accumulator unit with charge pumps on an offshore platform deck' },
  { slug: 'oil-gas', n: 3, title: 'Jamnagar DTA — actuator upgrade programme', alt: 'A technician commissioning a row of valve actuators on pipeline valves with a laptop, storage tanks behind' },
  { slug: 'mining', n: 1, title: 'Singrauli — 48-unit roof support valve overhaul', alt: 'A miner with a cap lamp working on the hydraulic control valve of a longwall roof support underground' },
  { slug: 'mining', n: 2, title: 'Lanjigarh — Komatsu 930E haul truck fleet', alt: 'Crates of hydraulic pump kits unloaded beside a line of large haul trucks in a mine yard' },
  { slug: 'mining', n: 3, title: 'Mahan — continuous miner pump replacement', alt: 'A fitter lowering a hydraulic pump into a continuous miner underground, its cutter drum raised' },
  { slug: 'marine', n: 1, title: 'VLGC Bhuvan — full hydraulics retrofit', alt: 'A gas carrier in dry dock with workers on scaffolding, hydraulic cylinders and power packs on the dock floor' },
  { slug: 'marine', n: 2, title: 'AHTS Greatship Ahalya — winch upgrade', alt: 'Technicians working on the hydraulic anchor winch on the aft deck of a tug moored at a port quay' },
  { slug: 'marine', n: 3, title: 'TSHD Aquarius — cutter drive overhaul', alt: 'A trailing suction hopper dredger at sea with its drag arm lowered over the side' },
  { slug: 'steel', n: 1, title: 'Jamshedpur HSM — AGC servo valve overhaul', alt: 'A technician fitting a servo valve onto a hydraulic manifold beside a hot strip mill stand' },
  { slug: 'steel', n: 2, title: 'Raigarh — continuous caster hydraulics', alt: 'Glowing steel billets running out of a multi-strand continuous casting machine' },
  { slug: 'steel', n: 3, title: 'Renukoot — foil rolling press', alt: 'An overhead crane lowering a large hydraulic cylinder into a rolling press, aluminium coils behind' },
  { slug: 'construction', n: 1, title: 'Bandra Dharavi — Cat 390 main pump', alt: 'A mechanic lifting a hydraulic pump assembly out of a large excavator on a city building site' },
  { slug: 'construction', n: 2, title: 'Zojila tunnel — Liebherr LTM crane', alt: 'An all-terrain mobile crane on outriggers at a mountain tunnel portal in the snow' },
  { slug: 'construction', n: 3, title: 'Pune — PM 47Z boom pump rebuild', alt: 'Technicians rebuilding the hydraulic cylinders of a concrete pump truck in a workshop' },
  { slug: 'power', n: 1, title: 'Salal hydro — Kaplan runner blade controls', alt: 'A technician at an open turbine governor hydraulic cabinet in a hydroelectric generator hall' },
  { slug: 'power', n: 2, title: 'Rojmal wind farm — pitch HPU overhaul', alt: 'A service technician standing on a wind turbine nacelle at sunrise above a wind farm' },
  { slug: 'power', n: 3, title: 'Panchet dam — radial gate operators', alt: 'A crane on a dam crest lifting a hydraulic gate cylinder into place beside radial spillway gates' },
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

type Sb = ReturnType<typeof supabase>

/** Uploads one file and returns the media row data, or a problem string. */
async function upload(
  sb: Sb,
  dir: string,
  file: string,
  objectPath: string,
  alt: string,
  dryRun: boolean
) {
  const buf = readFileSync(join(dir, file))
  const size = jpegSize(buf)
  const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
  if (!dryRun) {
    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
      cacheControl: '31536000',
      upsert: true,
      contentType: 'image/jpeg',
    })
    if (error) return { error: `upload failed — ${error.message}` } as const
  }
  return {
    media: {
      kind: 'image' as const,
      mimeType: 'image/jpeg',
      originalFilename: file,
      storagePath: publicUrl,
      bytes: buf.byteLength,
      width: size?.width ?? null,
      height: size?.height ?? null,
      alt,
    },
    size,
  } as const
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
  const tx = { maxWait: 15_000, timeout: 30_000 }
  let attached = 0
  let alreadyPresent = 0
  const problems: string[] = []

  for (const hero of HEROES) {
    const file = `${hero.slug}.jpg`
    if (!onDisk.has(file)) {
      problems.push(`${hero.slug}: ${file} missing from ${dir}`)
      continue
    }
    const ind = await db.industry.findUnique({
      where: { slug: hero.slug },
      select: { id: true, name: true, heroId: true, hero: { select: { originalFilename: true } } },
    })
    if (!ind) {
      problems.push(`${hero.slug}: no industry with that slug`)
      continue
    }
    if (ind.hero?.originalFilename === file) {
      alreadyPresent++
      continue
    }
    if (ind.heroId) {
      problems.push(`${hero.slug}: already has a different hero (${ind.hero?.originalFilename ?? ind.heroId}) — left alone`)
      continue
    }
    const up = await upload(sb, dir, file, `heroes/${file}`, hero.alt, dryRun)
    if ('error' in up) {
      problems.push(`${hero.slug}: ${up.error}`)
      continue
    }
    if (dryRun) {
      console.log(`[dry-run] hero ${file} (${up.size?.width}×${up.size?.height}) -> ${ind.name}`)
    } else {
      await db.$transaction(async (t) => {
        const media = await t.media.create({ data: up.media, select: { id: true } })
        await t.industry.update({ where: { id: ind.id }, data: { heroId: media.id } })
      }, tx)
      console.log(`hero ${file} -> ${ind.name}`)
    }
    attached++
  }

  for (const cs of CASES) {
    const file = `${cs.slug}-case-${cs.n}.jpg`
    if (!onDisk.has(file)) {
      problems.push(`${cs.slug} case ${cs.n}: ${file} missing from ${dir}`)
      continue
    }
    const row = await db.industryCaseStudy.findFirst({
      where: { industry: { slug: cs.slug }, title: cs.title },
      select: { id: true, imageId: true, image: { select: { originalFilename: true } } },
    })
    if (!row) {
      problems.push(`${cs.slug} case ${cs.n}: no case study titled "${cs.title}"`)
      continue
    }
    if (row.image?.originalFilename === file) {
      alreadyPresent++
      continue
    }
    if (row.imageId) {
      problems.push(`${cs.slug} case ${cs.n}: already has a different image — left alone`)
      continue
    }
    const up = await upload(sb, dir, file, `case-studies/${file}`, cs.alt, dryRun)
    if ('error' in up) {
      problems.push(`${cs.slug} case ${cs.n}: ${up.error}`)
      continue
    }
    if (dryRun) {
      console.log(`[dry-run] case ${file} (${up.size?.width}×${up.size?.height}) -> ${cs.title}`)
    } else {
      await db.$transaction(async (t) => {
        const media = await t.media.create({ data: up.media, select: { id: true } })
        await t.industryCaseStudy.update({ where: { id: row.id }, data: { imageId: media.id } })
      }, tx)
      console.log(`case ${file} -> ${cs.title}`)
    }
    attached++
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
