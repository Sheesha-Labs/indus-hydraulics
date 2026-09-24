/**
 * Load the butterfly valves sourced from the OFS Energy catalogue export.
 *
 * One page per series × body style × size (e.g. "DEMCO Series NE-C Wafer
 * Butterfly Valve, 4″"), each carrying a table of the Cameron part numbers we
 * can supply in that size — 29 DEMCO pages over 81 part numbers — plus two
 * Victaulic grooved valves. The payload is `data/ofs-butterfly-valves/listings.json`,
 * built from:
 *
 *   - the OFS export (part numbers and photographs), scraped 2026-09-23;
 *   - the Cameron labels photographed on 16 of the units, read by eye;
 *   - DEMCO's ordering table and series facts, already published on our
 *     NE-C / NE-I / NE-D / NF-C series pages;
 *   - Victaulic publications 08.05 Rev K (Series 700) and 08.20 Rev W (Series 761).
 *
 * WHY TRIM COMES FROM THE PART NUMBER, NOT THE LISTING TEXT
 *
 * OFS's descriptions contradict their own part numbers in places — a "4″ NE-I"
 * whose number is a 3″ NE-C, the same number listed three times with three
 * trims. DEMCO's ordering code (body style, body, stem, disc, seat) decoded
 * cleanly against 15 of the 16 legible Cameron labels, so every row's trim is
 * read from the code. The one label that disagrees wins for that unit.
 * Fourteen listings whose number could not be placed in DEMCO's 200 psi table,
 * or that duplicate or contradict another, are left out and named in the
 * payload's `excluded` list.
 *
 * IMAGES
 *
 * Only OFS's own in-situ warehouse photographs and label close-ups are used for
 * DEMCO. OFS's white-background cutouts carry a faint third-party watermark and
 * are not uploaded. A size with no photograph of its own borrows one of the same
 * series and body style, and its alt text names the size shown. The Victaulic
 * photographs are watermarked; the client accepted them as-is on 2026-09-25.
 *
 * Idempotent: products are matched on SKU and rewritten, images on
 * `Media.originalFilename`, and the series-page link block sits between marker
 * comments that are replaced rather than appended to.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-ofs-butterfly-valves.ts \
 *     [--dry-run] [--publish] [--only=SKU]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { scoreProductContent } from '@indus/domain'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const PAYLOAD = resolve(__dirname, '../../data/ofs-butterfly-valves/listings.json')
const LINKS_START = '<!-- ofs-sizes:start -->'
const LINKS_END = '<!-- ofs-sizes:end -->'

type Spec = {
  group: string
  label: string
  value: string
  unit: string | null
  position: number
  isFilterable: boolean
  templateKey: string | null
}
type Entry = {
  sku: string
  slug: string
  title: string
  brand: string
  countryOfOrigin: string | null
  leadTimeDays: number
  focusKeyword: string
  descriptionShort: string
  descriptionLong: string
  seoTitle: string
  seoDescription: string
  faqs: { question: string; answer: string }[]
  specs: Spec[]
  searchAliases: string[]
  images: { file: string; alt: string; fallbackSize?: string }[]
  seriesPage: string | null
  group?: { series: string; style: string; size: string }
}
type Payload = {
  source: string
  imageDir: string
  categorySlug: string
  specTemplateId: string
  brands: {
    slug: string
    name: string
    country: string
    isPublished: boolean
    isAuthorizedDistributor: boolean
    description: string
    seoTitle: string
    seoDescription: string
  }[]
  products: Entry[]
  excluded: { ofsSiteId: string; reason: string }[]
}

/** Same loader as the other storage scripts; anything already exported wins. */
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

/** Reads width/height from the first JPEG SOF marker — avoids an image dep. */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]!
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

/** OFS filenames are long and carry their site id; the object key only needs to be stable. */
function objectKey(sku: string, file: string, position: number): string {
  const stem = file.replace(/\.jpe?g$/i, '').replace(/^(cameron-)?(demco-)?/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return `products/${sku.toLowerCase()}/${String(position).padStart(2, '0')}-${stem}.jpg`
}

function words(s: string): number {
  return s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

const SIZE_ORDER = (s: string) => Number(eval(s.replace('-1/2', '+0.5')))
const disp = (s: string) => s.replace('2-1/2', '2½') + '″'

async function main() {
  loadWebEnv()
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const publish = argv.includes('--publish')
  const only = argv.find((a) => a.startsWith('--only='))?.split('=')[1] ?? null
  const payload: Payload = JSON.parse(readFileSync(PAYLOAD, 'utf8'))
  if (!existsSync(payload.imageDir)) throw new Error(`Image folder not found: ${payload.imageDir}`)
  const sb = supabase()

  const category = await db.category.findUnique({ where: { slug: payload.categorySlug }, select: { id: true } })
  if (!category) throw new Error(`category ${payload.categorySlug} not found`)
  const fields = await db.specTemplateField.findMany({
    where: { templateId: payload.specTemplateId },
    select: { id: true, key: true },
  })
  const fieldByKey = new Map(fields.map((f) => [f.key, f.id]))

  // ── Brands ────────────────────────────────────────────────────────────────
  // A product page links its brand badge to /brands/<slug>, and that route
  // 404s for an unpublished brand, so a new brand is created published.
  const brandIdBySlug = new Map<string, string>()
  for (const b of payload.brands) {
    const existing = await db.brand.findUnique({ where: { slug: b.slug }, select: { id: true } })
    if (existing) {
      brandIdBySlug.set(b.slug, existing.id)
      continue
    }
    if (dryRun) {
      console.log(`[dry-run] create brand ${b.name}`)
      brandIdBySlug.set(b.slug, 'dry-run')
      continue
    }
    const row = await db.brand.create({
      data: {
        slug: b.slug,
        name: b.name,
        country: b.country,
        description: b.description,
        isPublished: b.isPublished,
        isAuthorizedDistributor: b.isAuthorizedDistributor,
        seoTitle: b.seoTitle,
        seoDescription: b.seoDescription,
      },
      select: { id: true },
    })
    brandIdBySlug.set(b.slug, row.id)
    console.log(`[brand] created ${b.name}`)
  }
  for (const slug of new Set(payload.products.map((p) => p.brand))) {
    if (brandIdBySlug.has(slug)) continue
    const b = await db.brand.findUnique({ where: { slug }, select: { id: true } })
    if (!b) throw new Error(`brand ${slug} not found`)
    brandIdBySlug.set(slug, b.id)
  }

  let created = 0
  let rewritten = 0
  let attached = 0
  const problems: string[] = []

  for (const e of payload.products) {
    if (only && e.sku !== only) continue
    const existing = await db.product.findUnique({ where: { sku: e.sku }, select: { id: true } })
    for (const img of e.images) {
      if (!existsSync(join(payload.imageDir, img.file))) problems.push(`${e.sku}: image missing ${img.file}`)
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${existing ? 'rewrite' : 'create'}  ${e.sku}  ${e.title}  ` +
          `(${e.specs.length} specs, ${e.faqs.length} faqs, ${e.images.length} images)`
      )
      if (existing) rewritten++
      else created++
      continue
    }

    const brandId = brandIdBySlug.get(e.brand)!
    const data = {
      title: e.title,
      slug: e.slug,
      categoryId: category.id,
      brandId,
      specTemplateId: payload.specTemplateId,
      descriptionShort: e.descriptionShort,
      descriptionLong: e.descriptionLong,
      seoTitle: e.seoTitle,
      seoDescription: e.seoDescription,
      focusKeyword: e.focusKeyword,
      countryOfOrigin: e.countryOfOrigin,
      searchAliases: e.searchAliases.join(' '),
      unitOfMeasure: 'each' as const,
      leadTimeDays: e.leadTimeDays,
      ...(publish ? { status: 'active' as const } : {}),
    }
    let productId: string
    if (!existing) {
      const row = await db.product.create({
        data: { sku: e.sku, ...data, status: publish ? 'active' : 'draft' },
        select: { id: true },
      })
      productId = row.id
      created++
    } else {
      productId = existing.id
      await db.product.update({ where: { id: productId }, data })
      rewritten++
    }

    await db.$transaction(
      async (tx) => {
        await tx.productSpec.deleteMany({ where: { productId } })
        await tx.productFaq.deleteMany({ where: { productId } })
        await tx.productSpec.createMany({
          data: e.specs.map((s) => ({
            productId,
            group: s.group,
            label: s.label,
            value: s.value,
            unit: s.unit,
            position: s.position,
            isFilterable: s.isFilterable,
            templateFieldId: s.templateKey ? (fieldByKey.get(s.templateKey) ?? null) : null,
          })),
        })
        await tx.productFaq.createMany({
          data: e.faqs.map((f, i) => ({ productId, question: f.question, answer: f.answer, position: i })),
        })
      },
      { maxWait: 30_000, timeout: 30_000 }
    )

    // ── Images, in payload order ─────────────────────────────────────────────
    const present = new Set(
      (
        await db.productImage.findMany({
          where: { productId },
          select: { media: { select: { originalFilename: true } } },
        })
      ).map((i) => i.media.originalFilename)
    )
    for (const [position, img] of e.images.entries()) {
      if (present.has(img.file)) continue
      const buf = readFileSync(join(payload.imageDir, img.file))
      const size = jpegSize(buf)
      const objectPath = objectKey(e.sku, img.file, position)
      const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
        cacheControl: '31536000',
        upsert: true,
        contentType: 'image/jpeg',
      })
      if (error) {
        problems.push(`${e.sku}: upload failed for ${img.file} — ${error.message}`)
        continue
      }
      const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
      await db.$transaction(
        async (tx) => {
          const media = await tx.media.create({
            data: {
              kind: 'image',
              mimeType: 'image/jpeg',
              originalFilename: img.file,
              storagePath: publicUrl,
              bytes: buf.byteLength,
              width: size?.width ?? null,
              height: size?.height ?? null,
              alt: img.alt,
              caption: `Source: OFS Energy catalogue export, 2026-09-23${img.fallbackSize ? ` (${disp(img.fallbackSize)} unit shown)` : ''}`,
            },
            select: { id: true },
          })
          await tx.productImage.create({ data: { productId, mediaId: media.id, position, alt: img.alt } })
        },
        { maxWait: 30_000, timeout: 30_000 }
      )
      attached++
    }

    // ── Content score, same inputs as the admin editor ───────────────────────
    const [faqCount, specCount, documentCount, imageCount, crossReferenceCount, fresh] = await Promise.all([
      db.productFaq.count({ where: { productId } }),
      db.productSpec.count({ where: { productId } }),
      db.productDocument.count({ where: { productId } }),
      db.productImage.count({ where: { productId } }),
      db.productCrossReference.count({ where: { productId } }),
      db.product.findUnique({
        where: { id: productId },
        select: {
          brandId: true,
          categoryId: true,
          focusKeyword: true,
          seoTitle: true,
          seoDescription: true,
          descriptionShort: true,
          descriptionLong: true,
          weightKg: true,
          countryOfOrigin: true,
          mpn: true,
        },
      }),
    ])
    const score = scoreProductContent({
      descriptionShortWords: words(fresh!.descriptionShort ?? ''),
      descriptionLongWords: words(fresh!.descriptionLong ?? ''),
      faqCount,
      specCount,
      crossReferenceCount,
      documentCount,
      imageCount,
      hasBrand: Boolean(fresh!.brandId),
      hasCategory: Boolean(fresh!.categoryId),
      hasFocusKeyword: Boolean(fresh!.focusKeyword),
      hasSeoTitleAndDescription: Boolean(fresh!.seoTitle && fresh!.seoDescription),
      hasCommerceAttributes: Boolean(fresh!.weightKg && fresh!.countryOfOrigin && fresh!.mpn),
    })
    await db.product.update({ where: { id: productId }, data: { contentScore: score.score } })
    if (imageCount === 0) problems.push(`${e.sku}: no image`)
  }

  // ── Link each series page to its size pages ────────────────────────────────
  // Without this the size pages are reachable only from the category grid.
  const bySeries = new Map<string, Entry[]>()
  for (const e of payload.products) {
    if (!e.seriesPage || !e.group) continue
    bySeries.set(e.seriesPage, [...(bySeries.get(e.seriesPage) ?? []), e])
  }
  for (const [seriesSku, entries] of bySeries) {
    const series = await db.product.findUnique({ where: { sku: seriesSku }, select: { id: true, descriptionLong: true } })
    if (!series) {
      problems.push(`series page ${seriesSku} not found`)
      continue
    }
    entries.sort(
      (a, b) =>
        a.group!.style.localeCompare(b.group!.style) || SIZE_ORDER(a.group!.size) - SIZE_ORDER(b.group!.size)
    )
    const items = entries
      .map((e) => {
        const n = e.specs.find((s) => s.label === 'Cameron part numbers')?.value.split(', ').length ?? 0
        return `<li><a href="/p/${e.slug}">${disp(e.group!.size)} ${e.group!.style.toLowerCase()}</a> — ${n} part number${n === 1 ? '' : 's'}</li>`
      })
      .join('')
    const block =
      `${LINKS_START}<h3>Part numbers by size</h3><p>Cameron part numbers we can supply in this series, ` +
      `grouped by size and body style, each with its body, disc, stem and seat:</p><ul>${items}</ul>${LINKS_END}`
    const current = series.descriptionLong ?? ''
    const start = current.indexOf(LINKS_START)
    const end = current.indexOf(LINKS_END)
    const next =
      start >= 0 && end > start ? current.slice(0, start) + block + current.slice(end + LINKS_END.length) : current + block
    if (next === current) continue
    if (dryRun) {
      console.log(`[dry-run] link ${entries.length} size pages from ${seriesSku}`)
      continue
    }
    await db.product.update({ where: { id: series.id }, data: { descriptionLong: next } })
    console.log(`[series] ${seriesSku}: linked ${entries.length} size pages`)
  }

  console.log(
    `\n[ofs-butterfly] ${created} created, ${rewritten} rewritten, ${attached} images attached, ` +
      `${payload.excluded.length} OFS listings excluded, ${problems.length} problems`
  )
  for (const p of problems) console.log(`  ! ${p}`)
  await db.$disconnect()
  if (problems.some((p) => !p.endsWith('no image'))) process.exitCode = 1
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
