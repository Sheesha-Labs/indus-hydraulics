/**
 * Give every published blog article a hero photograph.
 *
 * All 30 published articles shipped with `heroId = null`. That is not only a
 * bare article page: `BlogPostCard` is shared by the index, the category hubs
 * and the author pages, so a missing hero leaves a grey placeholder in every
 * grid on the blog, and `/blog/[slug]`'s OG image falls back to the site
 * default — every share of every article looked identical.
 *
 * The images are original photographs commissioned per article, generated from
 * a brief written off that article's own argument, at 1536×1024. They carry no
 * text, no lay-line wording and no brand marks, so nothing in them can go stale
 * or contradict the copy. They are stored as JPEG rather than PNG: these are
 * photographs, not renders on white, and PNG cost 2.5 MB each against 430 KB
 * for visually identical JPEG.
 *
 * New bucket. `product-images` holds catalogue renders that the media library
 * and the product importers both reach into; mixing editorial photography in
 * with it makes "delete everything for this SKU" a more dangerous query than it
 * needs to be. `blog-images` is public, same as `product-images`.
 *
 * Guards:
 *   1. Only posts named in `HEROES` are touched, matched on slug.
 *   2. A post that already carries the hero for its slug (matched on
 *      `Media.originalFilename`) is skipped, so a re-run after a partial
 *      failure only finishes the rest.
 *   3. A post that already has some OTHER hero is left alone and reported —
 *      this script adds imagery, it does not overwrite an editor's choice.
 *   4. Upload failures are collected and reported rather than aborting the run.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-blog-hero-images.ts \
 *     --dir "/path/to/IndusBlogHeroesJpg" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'blog-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/**
 * Frozen. One row per published article. `alt` describes what is actually in
 * the frame — it is read aloud by a screen reader and indexed as image text,
 * so it is not the article title repeated.
 */
const HEROES: readonly { slug: string; alt: string }[] = [
  {
    slug: 'identify-any-hydraulic-fitting',
    alt: 'Technician measuring an unmarked hydraulic fitting with a vernier caliper, a thread pitch gauge and assorted adaptors laid out on the bench beside it',
  },
  {
    slug: 'bspp-vs-bspt',
    alt: 'A parallel-thread fitting with a bonded seal beside a tapered-thread fitting wound with sealing tape, stood side by side in a bench vice',
  },
  {
    slug: 'jic-vs-orfs-vs-npt-vs-bsp',
    alt: 'Four hydraulic hose ends in a row showing a 37-degree cone seat, a flat face with O-ring, a tapered pipe thread and a parallel thread',
  },
  {
    slug: 'why-hydraulic-hoses-fail',
    alt: 'Six failed hydraulic hose sections laid out on a workshop bench showing abrasion, kinking, heat cracking, twist and a pulled-out ferrule',
  },
  {
    slug: 'hydraulic-hose-inspection',
    alt: 'A technician using a torch to inspect the hydraulic hose runs along an excavator boom in a dusty yard at the end of the day',
  },
  {
    slug: 'getting-a-hydraulic-hose-made',
    alt: 'A worn hose assembly being measured across a trade counter, with hose reels and bins of fittings racked on the wall behind',
  },
  {
    slug: 'hose-routing-bend-radius-twist',
    alt: 'A gloved hand easing a hydraulic hose out of a tight bend at a clamp block, beside a second hose routed in a wide sweep',
  },
  {
    slug: 'hydraulic-fluid-injection-injury',
    alt: 'A fine jet of fluid escaping a pinhole in a pressurised hydraulic hose, located safely with a piece of cardboard held well clear',
  },
  {
    slug: 'hose-whip-restraint-and-burst-protection',
    alt: 'Three protected hose lines side by side: a steel whip-check cable across a coupling, a woven burst sleeve, and a spiral abrasion guard',
  },
  {
    slug: 'hose-register-and-replacement-programme',
    alt: 'A maintenance planner recording hose details at a bench of stainless identification tags, with tagged assemblies on a rack behind',
  },
  {
    slug: 'bulk-hose-refit-and-tagging',
    alt: "An entire machine's worth of newly built hose assemblies laid out and tagged on a workshop table while more are crimped behind",
  },
  {
    slug: 'on-site-hydraulic-hose-service-uae',
    alt: 'A mobile hose service van open at a construction site, a technician carrying a freshly built assembly towards a stopped wheel loader',
  },
  {
    slug: 'hose-service-northern-emirates',
    alt: 'A service technician working on the hydraulic lines of a crusher at a dust-covered quarry plant in the Northern Emirates',
  },
  {
    slug: 'rig-site-hose-replacement-abu-dhabi',
    alt: 'Two technicians in flame-resistant coveralls checking a large-bore oilfield hose connection at a land rig in the Abu Dhabi desert',
  },
  {
    slug: 'api-7k-16c-16d-which-standard',
    alt: 'Three oilfield hose assemblies racked side by side in a rig yard — a rotary hose, a flanged armoured line and a slim control hose',
  },
  {
    slug: 'api-16c-choke-and-kill-lines',
    alt: 'An armoured flexible choke line with bolted steel flanges running out from a blowout preventer stack on a drilling rig',
  },
  {
    slug: 'bop-control-hose-fire-resistance',
    alt: 'A bundle of fire-resistant blowout preventer control hoses clamped down rig steel into a hydraulic control manifold of valves and gauges',
  },
  {
    slug: 'api-7k-rotary-vibrator-hose',
    alt: 'A rotary hose hanging in a catenary from the derrick, with a bolted safety clamp and steel safety cable fitted at the coupling',
  },
  {
    slug: 'braid-vs-spiral-hydraulic-hose',
    alt: 'Two hose sections cut back in steps, one showing two crossing wire braid layers and the other four spiral-wound wire layers',
  },
  {
    slug: 'hydraulic-hose-pressure-by-size',
    alt: 'Seven lengths of the same hydraulic hose grade fanned out in ascending bore, cut ends towards the camera, on a workshop bench',
  },
  {
    slug: 'compact-hose-1sc-2sc',
    alt: 'Two hoses of the same bore coiled side by side — standard braid making a wide loop, compact hose a visibly tighter one',
  },
  {
    slug: 'skiving-and-fitting-selection',
    alt: 'A hose end in a skiving machine with the rubber cover peeling away to expose bright steel braid, ferrule and fitting waiting beside it',
  },
  {
    slug: 'industrial-hose-is-not-hydraulic-hose',
    alt: 'A small-bore wire braid hydraulic hose lying beside a large composite suction hose with helix reinforcement and a stainless coupling',
  },
  {
    slug: 'chemical-transfer-hose-selection',
    alt: 'An operator in chemical protective clothing connecting a composite transfer hose to a road tanker manifold on a bunded loading area',
  },
  {
    slug: 'steam-hose-safety',
    alt: 'A steam line connection made with a bolted coupling, faint steam around the lagged pipework and an operator standing clear at the valve',
  },
  {
    slug: 'food-grade-hose-compliance',
    alt: 'An operator in a hairnet and nitrile gloves connecting a food-grade hose with stainless tri-clamp ends to a filling machine',
  },
  {
    slug: 'water-suction-and-dewatering-hose',
    alt: 'A dewatering pump on a construction site with a helix-reinforced suction hose running down into a muddy sump at first light',
  },
  {
    slug: 'excavator-hydraulic-hose-replacement',
    alt: 'A technician kneeling on an excavator track replacing a burst boom hose, oil streaked down the paintwork and a drip tray alongside',
  },
  {
    slug: 'forklift-hydraulic-hose-replacement',
    alt: 'A technician replacing a forklift mast hose with the carriage held on a safety chain, warehouse racking receding behind',
  },
  {
    slug: 'tipper-and-transit-mixer-hose',
    alt: 'A technician working on the hydraulic hose where it crosses from chassis to body on a raised tipper, safety prop fitted, mixer parked behind',
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
 * same reasoning as `pngSize` in the hose render script. Walks the marker chain
 * to the first SOF segment; every SOFn but the reserved DHT/JPG/DAC markers
 * carries the dimensions in the same place.
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

    const post = await db.blogPost.findFirst({
      where: { slug: hero.slug, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        heroId: true,
        hero: { select: { originalFilename: true } },
      },
    })
    if (!post) {
      problems.push(`${hero.slug}: no live blog post with that slug`)
      continue
    }

    if (post.hero?.originalFilename === file) {
      alreadyPresent++
      continue
    }
    if (post.heroId) {
      problems.push(
        `${hero.slug}: already has a different hero (${post.hero?.originalFilename ?? post.heroId}) — left alone`
      )
      continue
    }

    const buf = readFileSync(join(dir, file))
    const size = jpegSize(buf)
    const objectPath = `heroes/${hero.slug}.jpg`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (dryRun) {
      console.log(`[dry-run] attach ${file} (${size?.width}×${size?.height}) -> ${post.title}`)
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
        await tx.blogPost.update({ where: { id: post.id }, data: { heroId: media.id } })
      },
      { maxWait: 15_000, timeout: 30_000 }
    )

    attached++
    console.log(`attached ${file} -> ${post.title}`)
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
