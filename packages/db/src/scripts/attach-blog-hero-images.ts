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
 * One row per published article, across both hero sprints — the 30 from
 * PR #271 and the 63 commissioned on 2026-08-25. `alt` describes what is
 * actually in the frame: it is read aloud by a screen reader and indexed as
 * image text, so it is not the article title repeated.
 *
 * Re-running this against a folder holding both sprints' JPEGs is safe and is
 * how the second sprint was attached. Guard 2 skips a post that already
 * carries the hero named for its slug, so the first 30 are no-ops.
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
  // ── Second sprint, 2026-08-25. The 63 articles published after PR #271.
  { slug: 'cross-threaded-hydraulic-port', alt: 'A gloved hand backing a steel adapter out of a hydraulic valve manifold, the adapter sitting visibly askew in the port, a second adapter with bruised threads held up beside it' },
  { slug: 'hose-burst-at-the-fitting', alt: 'A failed hydraulic hose split open where it enters its crimped steel ferrule, frayed reinforcement wire fanned out at the break' },
  { slug: 'hose-failure-post-mortem', alt: 'Five cut sections of failed hydraulic hose laid in a row on a workbench beside a steel rule and calipers, each showing a different kind of damage' },
  { slug: 'hydraulic-hose-abrasion-failure', alt: 'A hydraulic hose worn through its cover against a sharp steel edge on a machine frame, silver reinforcement braid showing at the flat' },
  { slug: 'hydraulic-hose-cover-blistering', alt: 'Macro of raised blisters swelling out of a black hydraulic hose cover, one with a pinhole at its crown' },
  { slug: 'hydraulic-hose-cover-cracking', alt: 'A sun-aged hydraulic hose cover crazed with a fine network of cracks, the black surface gone chalky grey' },
  { slug: 'hydraulic-hose-crimp-faults', alt: 'Two crimped hose ends side by side on a steel bench with a vernier caliper set across the flats of one ferrule' },
  { slug: 'hydraulic-hose-installed-with-a-twist', alt: 'A hydraulic hose fitted between two machine ports with its printed line corkscrewing around the cover instead of running straight' },
  { slug: 'hydraulic-hose-kinked', alt: 'A hydraulic hose buckled into a sharp kink immediately where it leaves a straight fitting on a cylinder' },
  { slug: 'hydraulic-hose-tube-swelling', alt: 'A cut length of hydraulic hose held to camera, its inner tube swollen soft and glossy and closing down the bore' },
  { slug: 'hydraulic-hose-wire-corrosion', alt: 'The cut end of a hydraulic hose with a sound outer cover but rust-orange, pitted reinforcement wire inside' },
  { slug: 'new-hydraulic-hose-weeping', alt: 'A technician wiping a freshly fitted hydraulic hose joint dry with a rag, a bead of oil forming at the union nut' },
  { slug: 'split-female-quick-coupler', alt: 'The female half of a hydraulic quick coupler on a bench with a clean lengthwise crack through the body at the locking ball groove' },
  { slug: 'bspp-bonded-seal-sizing', alt: 'Gloved fingers sliding a bonded seal down the parallel male thread of a steel adapter, a tray of assorted bonded seals behind' },
  { slug: 'hydraulic-thread-size-and-pitch-reference', alt: 'A bench identification station with thread pitch gauges fanned open, a vernier caliper and an array of steel hydraulic fittings' },
  { slug: 'photographing-a-hydraulic-fitting', alt: 'A technician photographing a hydraulic fitting with a phone, the fitting standing square-on beside a steel rule under a work lamp' },
  { slug: 'stacking-hydraulic-adapters', alt: 'Three steel adapters threaded end to end out of one port on a hydraulic valve block, a hose hanging from the last at an angle' },
  { slug: 'desalination-and-water-treatment-hose', alt: 'A flexible hose flanged to a manifold inside a desalination plant, rows of white pressure vessels and stainless pipework behind' },
  { slug: 'hydraulic-hose-coastal-corrosion', alt: 'Hydraulic hose fittings at a coastal port pitted with white salt bloom and rust creeping out from under the ferrule' },
  { slug: 'hydraulic-hose-in-uae-heat', alt: 'An excavator boom cylinder and its hydraulic hoses in an open desert yard at midday, heat shimmer distorting the air above the machine' },
  { slug: 'hydraulic-hose-sand-abrasion', alt: 'Hydraulic hoses on a machine arm coated in fine desert sand, one showing a scoured sand-blasted patch' },
  { slug: 'hydraulic-hose-shelf-life-storage', alt: 'Coiled hydraulic hose assemblies hung and stacked on a warehouse stores rack, some coils bright and new, others visibly dusty' },
  { slug: 'hydraulic-hose-uv-and-ozone', alt: 'A sun-bleached hydraulic hose gone chalky grey and finely crazed fitted beside a newer black hose on the same machine' },
  { slug: 'offshore-hydraulic-hose', alt: 'A technician in helmet and lifejacket checking hydraulic hose connections on offshore deck machinery, open grey water beyond the handrail' },
  { slug: 'why-summer-is-harder-on-hydraulic-hose', alt: 'Hydraulic hose assemblies coiled on hot concrete in a machinery yard at the peak of a Gulf summer afternoon' },
  { slug: 'field-re-hosing-kit', alt: 'The open side doors of a mobile hose service van on site, showing bulk hose reels, fitting drawers, a bolted-down crimper and finished assemblies on a rail' },
  { slug: 'how-to-measure-a-hydraulic-hose', alt: 'A hydraulic hose lying straight on a bench with a steel tape stretched from one sealing face to the other' },
  { slug: 'hydraulic-fitting-make-up-torque', alt: 'Two spanners working one hydraulic joint in opposition, one holding the adapter body while the other turns the union nut' },
  { slug: 'hydraulic-quick-couplers-iso-7241', alt: 'Hydraulic quick coupler halves arranged on a steel bench, showing flush flat faces, recessed poppets and a threaded collar side by side' },
  { slug: 'backhoe-hydraulic-hose', alt: 'A backhoe loader on site with hose runs visible along both the front loader arms and the rear excavator boom, a technician crouched at the boom pivot' },
  { slug: 'boom-lift-hydraulic-hose', alt: 'Bundled hydraulic hoses strapped along the raised boom of a self-propelled access platform, seen from below against the sky' },
  { slug: 'concrete-pump-hydraulic-hose', alt: 'The base of a deployed concrete placing boom, dense with high-pressure hydraulic lines and steel pipework under concrete dust' },
  { slug: 'detaching-a-hose-on-a-modern-machine', alt: 'A technician reaching into an opened access compartment on an excavator where hoses run through moulded clamp blocks, removed fasteners laid out on a rag' },
  { slug: 'injection-moulding-hydraulic-hose', alt: 'Hydraulic hoses and steel lines running close past the hot heater bands of a plastic injection moulding machine' },
  { slug: 'log-splitter-and-shop-press-hose', alt: 'A hydraulic workshop press with its ram partway onto a steel workpiece, pump unit, pressure gauge and two hoses in frame' },
  { slug: 'mobile-crane-hydraulic-hose', alt: 'Hydraulic hoses feeding an outrigger leg on an all-terrain mobile crane set up on site' },
  { slug: 'port-equipment-hydraulic-hose', alt: 'A reach stacker working in a container terminal, hydraulic hose runs along the lifting boom, stacked containers and a gantry crane behind' },
  { slug: 'refuse-truck-hydraulic-hose', alt: 'The raised tailgate of a refuse collection truck exposing grimy compaction cylinders, hoses and a hydraulic manifold' },
  { slug: 'removing-a-seized-hydraulic-fitting', alt: 'A technician working two spanners on a corroded hydraulic fitting in a machine manifold, the hex visibly rounding, penetrating fluid to hand' },
  { slug: 'skid-steer-hydraulic-hose', alt: 'The auxiliary quick couplers on a skid steer loader arm with dust caps hanging beside them, a gloved hand wiping a coupler face clean' },
  { slug: 'tractor-hydraulic-hose', alt: 'The rear remote coupler bank of an agricultural tractor, oil-darkened and mismatched, with two implement hoses plugged in and one hanging loose' },
  { slug: 'truck-crane-hydraulic-hose', alt: 'Hydraulic hoses tracking around the articulated joints of a knuckle-boom crane mounted behind a flatbed truck cab' },
  { slug: 'wheel-loader-hydraulic-hose', alt: 'A technician checking the hoses running down a wheel loader lift arm to its lift cylinder, quarry stockpiles behind' },
  { slug: 'contamination-during-a-hose-change', alt: 'Open hydraulic ports on a machine capped with coloured plastic plugs, the removed hose assembly capped at both ends in a clean drain tray' },
  { slug: 'grease-and-zerk-fittings', alt: 'A grease gun coupler pushed onto a small grease nipple on a machine pivot pin, fresh grease just emerging from the joint' },
  { slug: 'mini-excavator-hose-maintenance', alt: 'A technician crouched at the boom-to-arm crossing of a mini excavator, lifting a hose to inspect underneath it' },
  { slug: 'bulk-hose-or-finished-assemblies', alt: 'A warehouse aisle with reels of bulk hydraulic hose racked on one side and finished tagged hose assemblies hanging on the other' },
  { slug: 'how-to-cross-reference-a-hydraulic-hose', alt: 'A staff member at a trade counter comparing a customer’s oil-stained hose assembly against a new one, calipers to hand' },
  { slug: 'hydraulic-hose-assembly-cost', alt: 'An assembly bench from above with a cut hose length, two fittings, two ferrules and a set of crimp dies laid out ready to build' },
  { slug: 'hydraulic-hose-kits-for-a-fleet', alt: 'An open transport case packed with coiled and tagged hydraulic hose assemblies in divided compartments, a gloved hand lifting one out' },
  { slug: 'hydraulic-hose-lead-times', alt: 'A distribution warehouse aisle of pallet racking stacked with hose reels, boxed fittings and shrink-wrapped export pallets' },
  { slug: 'hydraulic-hose-stocking-policy', alt: 'A wall of small parts bins in a stores area densely filled with steel hydraulic fittings sorted by type' },
  { slug: 'should-you-buy-a-hose-crimper', alt: 'A hydraulic hose crimping machine on a bench with its full set of die rings laid out in an arc from largest to smallest' },
  { slug: 'unbranded-hydraulic-fittings', alt: 'Two trays of similar steel hydraulic fittings side by side, one set carrying faint forged markings on the hex flats and the other completely bare' },
  { slug: 'what-to-send-for-a-hose-quote', alt: 'A customer handing a failed hydraulic hose assembly across a trade counter, a phone showing photographs on the counter beside them' },
  { slug: 'trapped-pressure-quick-coupler', alt: 'A hydraulic breaker attachment lying on hot concrete in full sun, its capped coupler halves in the foreground and an operator crouched beside them' },
  { slug: 'en-853-856-857-vs-sae-100r', alt: 'Four hydraulic hose sections stood on end showing different internal constructions in cut face, from single wire braid to multiple spiral layers' },
  { slug: 'how-to-read-a-hose-layline', alt: 'Raking light along the cover of a hydraulic hose, the printed lay-line catching as a raised pale ribbon running away into soft focus' },
  { slug: 'hydraulic-hose-dash-sizes', alt: 'Seven cut hydraulic hose lengths stood on end in a line from smallest bore to largest, every open bore visible' },
  { slug: 'sae-100r-hose-types', alt: 'Hydraulic hose samples fanned out on a bench, each cut back in steps to expose tube, reinforcement and cover' },
  { slug: 'sae-j518-code-61-code-62-flanges', alt: 'Two four-bolt split flange heads of the same bore side by side, one visibly thicker with wider bolt spacing, a steel rule across both' },
  { slug: 'stopping-an-npt-thread-leak', alt: 'Gloved hands applying anaerobic thread sealant to the tapered male thread of a steel hydraulic fitting, a roll of PTFE tape set aside' },
  { slug: 'where-jic-is-the-wrong-choice', alt: 'Two hydraulic fittings upright side by side, one presenting a machined 37 degree cone and the other a flat face with a seated O-ring' },
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
