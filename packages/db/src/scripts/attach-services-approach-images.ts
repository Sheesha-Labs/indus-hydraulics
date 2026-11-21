/**
 * Give the four "How we work" steps on /services their panel images.
 *
 * The panel above each step's copy rendered a hatched placeholder: the
 * section had no image field. `panel_image` (Pages & Blocks · Services · How
 * we work · each step) is that field; this script fills it for the four
 * shipped steps.
 *
 * The images are 1600×900 boards: a representative workshop photograph
 * (Higgsfield GPT Image 2.6, generated 2026-11-18, not a photo of a real job)
 * with a four-step process map, numbered callouts and one KPI card. Every
 * figure on a board is one the step's own copy already states (4 h, 12-page
 * PDF, 1.5× rated pressure, two paper copies).
 *
 * The services page had never been saved, so it rendered pure defaults. This
 * writes the FULL document in template order — every other section stored as
 * `{ values: {} }`, which resolves to its defaults — because `resolveSections`
 * appends missing sections after stored ones, and a partial document would
 * move the bands. The approach list is stored whole: a stored list replaces
 * the default list, so each item carries its default copy plus the image.
 *
 * Guards:
 *   1. Refuses to run if `master/services` already exists (someone has edited
 *      the page in the admin; merge by hand instead of overwriting their copy).
 *   2. Validated with `validateSections` before the write.
 *   3. Uploads are new keys only (`upsert: false`); a re-run after a partial
 *      failure reports the existing object and reuses its Media row.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-services-approach-images.ts \
 *     --dir "/path/to/boards" [--dry-run]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient, type Prisma } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import {
  getMasterPage,
  masterContentKey,
  validateSections,
  type SectionValues,
} from '@indus/domain'

const db = new PrismaClient()

const BUCKET = 'service-images'
const PREFIX = 'how-we-work'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/** In step order. `alt` names what the photo shows and what the overlay says. */
const BOARDS: readonly { file: string; alt: string }[] = [
  {
    file: 'services-step-01-intake-photo-report.jpg',
    alt: 'Technicians photograph, tag and sample a worn hydraulic cylinder at intake, with callouts for each intake record',
  },
  {
    file: 'services-step-02-measure-quote.jpg',
    alt: 'Bore gauge in a cylinder barrel and dial indicator on a chromed rod, with callouts for roundness and straightness',
  },
  {
    file: 'services-step-03-rebuild-test.jpg',
    alt: 'Rebuilt hydraulic cylinder on a pressure test bench with gauges and a test curve, with callouts for the 1.5× hold',
  },
  {
    file: 'services-step-04-document-dispatch.jpg',
    alt: 'Technician signs the sign-off pack by a torque wrench and test curve; the rebuilt cylinder is strapped to a skid',
  },
] as const

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

/** Width/height from the JPEG frame header — same walk as attach-category-images.ts. */
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
  if (!dirArg) throw new Error('--dir=<folder with the board JPEGs> is required')
  const dir = resolve(dirArg)

  const key = masterContentKey('services')
  const existing = await db.pageContent.findUnique({ where: { key }, select: { id: true } })
  if (existing) throw new Error(`${key} already exists — the page has been edited; merge by hand`)

  for (const b of BOARDS) {
    if (!existsSync(join(dir, b.file))) throw new Error(`missing ${b.file} in ${dir}`)
    if (b.alt.length > 125) throw new Error(`${b.file}: alt is ${b.alt.length} chars (max 125)`)
  }

  const sb = supabase()
  const mediaIds: string[] = []

  for (const b of BOARDS) {
    const buf = readFileSync(join(dir, b.file))
    const size = jpegSize(buf)
    const objectPath = `${PREFIX}/${b.file}`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (dryRun) {
      console.log(
        `[dry-run] upload ${objectPath} (${size?.width}×${size?.height}, ${buf.byteLength} B)`
      )
      mediaIds.push(`dry-run-${b.file}`)
      continue
    }

    const reuse = await db.media.findFirst({
      where: { storagePath: publicUrl, deletedAt: null },
      select: { id: true },
    })
    if (reuse) {
      console.log(`reuse ${objectPath} (media ${reuse.id})`)
      mediaIds.push(reuse.id)
      continue
    }

    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
      cacheControl: '31536000',
      upsert: false,
      contentType: 'image/jpeg',
    })
    if (error) throw new Error(`${objectPath}: upload failed — ${error.message}`)

    const media = await db.media.create({
      data: {
        kind: 'image',
        mimeType: 'image/jpeg',
        originalFilename: b.file,
        storagePath: publicUrl,
        bytes: buf.byteLength,
        width: size?.width ?? null,
        height: size?.height ?? null,
        alt: b.alt,
      },
      select: { id: true },
    })
    mediaIds.push(media.id)
    console.log(`uploaded ${objectPath} -> media ${media.id}`)
  }

  const SERVICES_PAGE = getMasterPage('services')
  if (!SERVICES_PAGE) throw new Error('services page definition not found')
  const approachDef = SERVICES_PAGE.sections.find((s) => s.key === 'approach')
  const defaultItems = (approachDef?.defaults.items ?? []) as Record<string, unknown>[]
  if (defaultItems.length !== BOARDS.length) {
    throw new Error(`expected ${BOARDS.length} default steps, found ${defaultItems.length}`)
  }
  const items = defaultItems.map((item, i) => ({
    ...item,
    panel_image: { mediaId: mediaIds[i]!, alt: BOARDS[i]!.alt },
  }))

  // Every other section is stored as its LIST defaults and nothing else.
  // `validateSections` normalises a missing list field to `[]`, and a stored
  // `[]` is a real value, not "use the default" — the first run of this script
  // (2026-11-18) wrote `{}` for the hero and blanked its three figures on the
  // live page until they were restored by hand. Scalars are safe to omit:
  // they normalise to null, which resolves to the default.
  const listDefaults = (s: (typeof SERVICES_PAGE.sections)[number]) =>
    Object.fromEntries(
      s.fields
        .filter((f) => f.kind === 'list' && Array.isArray(s.defaults[f.key]))
        .map((f) => [f.key, s.defaults[f.key]])
    )
  const doc = SERVICES_PAGE.sections.map((s) => ({
    key: s.key,
    enabled: s.locked ? true : (s.defaultEnabled ?? true),
    values: (s.key === 'approach' ? { items } : listDefaults(s)) as SectionValues,
  }))

  const checked = validateSections(SERVICES_PAGE, doc)
  if (!checked.ok) {
    console.error(checked.issues)
    throw new Error('document failed validation')
  }

  if (dryRun) {
    console.log(`[dry-run] would write ${key}: ${doc.map((s) => s.key).join(', ')}`)
    return
  }

  await db.pageContent.create({
    data: { key, kind: 'master', sections: checked.sections as unknown as Prisma.InputJsonValue },
  })
  console.log(`wrote ${key} (${doc.length} sections, approach steps imaged)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
