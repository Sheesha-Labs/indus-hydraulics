/**
 * Give every service case's body figure its image.
 *
 * All 20 published cases carry one `figure` block (FIG. 02) and none had an
 * image: each rendered a hatched placeholder with a caption describing a
 * photograph nobody had taken. These are representative AI images (Higgsfield
 * GPT Image 2.6, 2026-11-19), one per case, written from the figure's own
 * caption — not photographs of the job. Media.caption records that
 * provenance; it is never rendered (CLAUDE.md §13.3).
 *
 * Two steps, because the figure renderer only resolves Media ids from the
 * deploy that ships with this script (FigureBlock used to pass the id through
 * as if it were a storage path, which renders a broken image):
 *
 *   --upload   upload each JPEG to service-images/cases/<file> and create its
 *              Media row. Safe any time: nothing references the rows yet.
 *   --link     set the figure block's `imageId` on each case. Run ONLY after
 *              the figure-resolver change is live in production.
 *
 * Guards: upload is new-key only (`upsert: false`) and reuses an existing
 * Media row for the same URL; link touches only figure blocks whose imageId is
 * empty (or already this media), and only the first figure in each case.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-service-case-figures.ts \
 *     --dir "/path/to/jpegs" --upload|--link [--dry-run]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient, type Prisma } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()
const BUCKET = 'service-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const PROVENANCE = 'AI-generated representative image (Higgsfield GPT Image 2.6), 2026-11-19 — not a photo of the job'

/** slug → file (storage key = descriptive slug of the alt) + alt (≤125 chars). */
export const FIGURES: readonly { slug: string; file: string; alt: string }[] = [
  // Each image checked against its case's caption on 2026-11-19.
  { slug: "workover-rig-cylinder-hose-overhaul-jebel-ali", file: "hydraulic-hose-assemblies-tagged-on-bench-crimp-bay.jpg", alt: "Rows of crimped wire-braid hydraulic hose assemblies laid out on a steel bench, each with an orange tag" },
  { slug: "mud-pump-fluid-end-rebuild-12-p-160", file: "triplex-mud-pump-fluid-end-rebuilt-with-new-liners.jpg", alt: "Rebuilt triplex mud pump fluid end on the bench with three new chrome cylinder liners staged on a pallet" },
  { slug: "bop-13-58-10k-cameron-u-5-year-recertification", file: "ram-bop-bonnet-open-shear-ram-block-ndt-inspection.jpg", alt: "Ram BOP with a bonnet open and the ram cavity exposed, shear ram block on the bench, technician running an NDT probe" },
  { slug: "koomey-accumulator-rebladder-api-16d-recert", file: "bop-accumulator-bottles-bladders-removed-shell-inspection.jpg", alt: "Row of BOP accumulator bottles on cradles with bladders removed, a technician inspecting a shell with a light" },
  { slug: "coiled-tubing-injector-skid-emergency-repair", file: "coiled-tubing-injector-gripper-block-surface-grinding.jpg", alt: "Coiled-tubing injector gripper block being re-faced on a surface grinder, a reference block beside it" },
  { slug: "choke-kill-manifold-3116-10k-api-16c-recert", file: "gate-valve-seats-gates-and-studs-laid-out-trim-bench.jpg", alt: "Gate valve seats, gates and alloy studs laid out on a trim bench, a flanged gate valve body behind" },
  { slug: "hpu-50hp-drilling-rig-auxiliary-refurbishment", file: "hydraulic-schematic-differences-circled-orange-drafting-table.jpg", alt: "Two engineers marking hydraulic schematic differences in orange on a drafting table, a power unit behind" },
  { slug: "sour-service-hose-assembly-build-100-line-rig-refit", file: "four-spiral-hydraulic-hose-cut-to-length-yellow-bom-tag.jpg", alt: "Technician cutting four-spiral hydraulic hose to length from a reel, a yellow BOM tag on the hose" },
  { slug: "iso-4406-oil-cleanliness-coding-q1-2026-aluminum-smelter", file: "ferrogram-wear-particles-under-bichromatic-light.jpg", alt: "Ferrogram slide under red and green light showing chains of wear particles and dark curled cutting-wear debris" },
  { slug: "custom-16-port-manifold-en24-420-bar-press-control", file: "machined-steel-hydraulic-manifold-block-ports-capped-and-tagged.jpg", alt: "Finish-machined steel hydraulic manifold block with its ports capped and tagged on an inspection bench" },
  { slug: "bop-pressure-testing-service-api-std-53", file: "bop-stack-test-cap-rigged-chart-recorder-pressure-gauge.jpg", alt: "Red BOP stack with a test cap bolted on, chart recorder and pressure gauge beside it, supervisor watching" },
  { slug: "annual-bop-redress-12-month-elastomer-service", file: "annular-bop-open-at-rig-new-packing-element-on-bench.jpg", alt: "Annular BOP opened at the rig, a new packing element with steel inserts on the bench, seal kits in trays" },
  { slug: "bop-stack-rental-11-10k-workover-sour-service", file: "workover-bop-stack-choke-manifold-accumulator-staged-for-mobilisation.jpg", alt: "Ram and annular BOPs, a choke manifold and an accumulator unit staged under a gantry for mobilisation" },
  { slug: "bop-field-service-crew-h2s-trained-day-rate", file: "bop-function-test-crew-chart-recorder-stopwatch-land-rig.jpg", alt: "BOP field crew on a desert land rig: supervisor at a chart recorder, technician timing with a stopwatch" },
  { slug: "ct-snubbing-wireline-bop-testing-recertification", file: "snubbing-bop-stripper-bore-honing-packers-on-bench.jpg", alt: "Snubbing BOP with stripper bonnets open, a hone bar in the bore and stripper packers on the bench" },
  { slug: "subsea-bop-stack-fat-sit-witness-engineering-support", file: "subsea-bop-stack-hydrostatic-test-witness-chart.jpg", alt: "Subsea BOP stack on a hydrostatic test bay, a pressure chart and orange marker on a clipboard in front" },
  { slug: "15k-hpht-bop-service-hail-ghasha-jafurah-sour-gas", file: "hpht-ram-bop-bonnet-open-seal-face-charpy-specimens.jpg", alt: "High-pressure ram BOP with a bonnet open showing the polished seal face, Charpy specimens in a tray on the bench" },
  { slug: "diverter-system-recertification-21-1-4-2k-offshore", file: "offshore-diverter-housing-open-sealing-element-removed.jpg", alt: "Offshore diverter housing opened in the workshop, its large sealing element removed and an overboard valve stripped" },
  { slug: "iwcf-iadc-wellsharp-well-control-training-levels-2-4", file: "drilling-simulator-console-bop-stack-choke-manifold-screens.jpg", alt: "Trainee at a drilling simulator console with BOP stack and choke manifold screens, instructor pointing" },
  { slug: "rotating-control-device-rcd-service-mpd-equipment-support", file: "rcd-passive-seal-element-taper-deformation-inspection.jpg", alt: "Worn RCD passive seal element on a steel bench, upper lip deformed and cracked, measured with a caliper and rule" },
]

function loadWebEnv() {
  if (!existsSync(WEB_ENV)) return
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    if (process.env[m[1]!]) continue
    process.env[m[1]!] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
  }
}

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
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    if (isSof) return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) }
    off += 2 + len
  }
  return null
}

async function main() {
  loadWebEnv()
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const mode = args.includes('--link') ? 'link' : args.includes('--upload') ? 'upload' : null
  if (!mode) throw new Error('pass --upload or --link')
  const at = args.indexOf('--dir')
  const dir = resolve(args.find((a) => a.startsWith('--dir='))?.slice(6) ?? (at >= 0 ? args[at + 1]! : '.'))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env missing')
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const problems: string[] = []
  let done = 0

  for (const f of FIGURES) {
    if (f.alt.length > 125) {
      problems.push(`${f.slug}: alt ${f.alt.length} chars`)
      continue
    }
    const objectPath = `cases/${f.file}`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (mode === 'upload') {
      const existing = await db.media.findFirst({ where: { storagePath: publicUrl, deletedAt: null }, select: { id: true } })
      if (existing) {
        console.log(`exists ${f.file} (${existing.id})`)
        continue
      }
      const path = join(dir, f.file)
      if (!existsSync(path)) {
        problems.push(`${f.slug}: ${f.file} missing`)
        continue
      }
      const buf = readFileSync(path)
      const size = jpegSize(buf)
      if (dryRun) {
        console.log(`[dry-run] upload ${objectPath} ${size?.width}×${size?.height} ${buf.byteLength} B`)
        continue
      }
      const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false })
      if (error) {
        problems.push(`${f.slug}: upload ${error.message}`)
        continue
      }
      const m = await db.media.create({
        data: { kind: 'image', mimeType: 'image/jpeg', originalFilename: f.file, storagePath: publicUrl, bytes: buf.byteLength, width: size?.width ?? null, height: size?.height ?? null, alt: f.alt, caption: PROVENANCE },
        select: { id: true },
      })
      done++
      console.log(`uploaded ${f.file} -> ${m.id}`)
      continue
    }

    // link
    const media = await db.media.findFirst({ where: { storagePath: publicUrl, deletedAt: null }, select: { id: true } })
    if (!media) {
      problems.push(`${f.slug}: no Media row for ${f.file} — run --upload first`)
      continue
    }
    const c = await db.serviceCase.findUnique({ where: { slug: f.slug }, select: { id: true, bodyBlocks: true } })
    if (!c) {
      problems.push(`${f.slug}: no such case`)
      continue
    }
    const blocks = (Array.isArray(c.bodyBlocks) ? c.bodyBlocks : []) as Array<Record<string, unknown>>
    const idx = blocks.findIndex((b) => b?.type === 'figure')
    if (idx < 0) {
      problems.push(`${f.slug}: no figure block`)
      continue
    }
    const current = blocks[idx]!.imageId
    if (current === media.id) continue
    if (current) {
      problems.push(`${f.slug}: figure already has ${String(current)} — left alone`)
      continue
    }
    if (dryRun) {
      console.log(`[dry-run] link ${f.slug} figure[${idx}] -> ${media.id}`)
      continue
    }
    const next = blocks.map((b, i) => (i === idx ? { ...b, imageId: media.id } : b))
    await db.serviceCase.update({ where: { id: c.id }, data: { bodyBlocks: next as unknown as Prisma.InputJsonValue } })
    done++
    console.log(`linked ${f.slug}`)
  }

  console.log(`\n${dryRun ? '[dry-run] ' : ''}${mode}: ${done} done, ${problems.length} problems`)
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
