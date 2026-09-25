/**
 * Load the Lifting & Rigging vertical: its category tree, its spec template,
 * the category page bands, and product families with their size tables.
 *
 * The payload, `data/<payload>/catalogue.json`, is built outside the repo from
 * a supplier's catalogue export and reviewed before it is loaded (the H-Quality
 * build is `data/lifting-hquality`). This script only writes what the payload
 * says.
 *
 * WHAT IT WRITES
 *
 *   - Categories, created when missing. `--rewrite-categories` also updates the
 *     ones this payload names, which is how copy is iterated before launch;
 *     without it an existing category is an editor's and is left alone.
 *   - The category page bands (`page_content`, key `category/<slug>`), validated
 *     against the shelf template before they are written. Only written when the
 *     row is missing, or with `--rewrite-bands`.
 *   - The spec template, upserted by slug.
 *   - Products, matched on SKU. Specs, FAQs, size table (`product_variants`) and
 *     cross-references are REPLACED from the payload on every run — the payload
 *     is the source of truth for them. Images are matched on
 *     `Media.originalFilename` and never uploaded twice.
 *
 * DRAFT UNTIL LAUNCH
 *
 * Without `--publish`, new products are created as drafts and new categories
 * unpublished. The size tables use lifting columns the storefront renders only
 * once the matching code is deployed, so publishing before that would show
 * buyers a table with its load columns missing. `--publish` flips both.
 *
 * NO SUPPLIER NAME IN PUBLIC FIELDS
 *
 * Products are sold under Indus part numbers with no brand, so the image caption
 * and the storage key never carry the supplier's name or filename; the key is
 * built from the alt text. `originalFilename` keeps the supplier's file name for
 * traceability inside the media library only.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
 *     --payload=lifting-hquality [--dry-run] [--publish] [--only=SKU] \
 *     [--rewrite-categories] [--rewrite-bands]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Prisma, PrismaClient, type CrossRefCompatibility } from '@prisma/client'
import {
  scoreProductContent,
  subPageContentKey,
  subPageDef,
  validateSections,
  type StoredSection,
} from '@indus/domain'
import { createClient } from '@supabase/supabase-js'
import { upsertSpecTemplate } from '../import/spec-templates'
import type { SpecTemplatePayload } from '../import/types'

const db = new PrismaClient()

const BUCKET = 'product-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const DATA_DIR = resolve(__dirname, '../../data')

type Spec = {
  group: string
  label: string
  value: string
  unit: string | null
  position: number
  isFilterable: boolean
  templateKey: string | null
}
type Variant = {
  partNumber: string
  position: number
  /** Size label, grade and every numeric column — see `@indus/domain/variant-columns`. */
  dimensions: Record<string, string | number>
}
type Entry = {
  sku: string
  slug: string
  title: string
  category: string
  focusKeyword: string
  descriptionShort: string
  descriptionLong: string
  seoTitle: string
  seoDescription: string
  faqs: { question: string; answer: string }[]
  specs: Spec[]
  searchAliases: string[]
  images: { file: string; alt: string }[]
  variants: Variant[]
  crossReferences: { competitorBrand: string; competitorMpn: string; compatibility: CrossRefCompatibility }[]
}
type Band = { eyebrow?: string | null; heading?: string | null; body?: string | null }
type CategoryEntry = {
  slug: string
  name: string
  /** Null for the vertical's root. */
  parentSlug: string | null
  position: number
  shortDescription: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  bands?: {
    hero?: { intro?: string | null }
    guidance?: Band
    standards?: Band
    service?: Band
    faq?: { heading?: string | null; items: { q: string; a: string }[] }
  }
}
type Payload = {
  source: string
  imageDir: string
  specTemplate: SpecTemplatePayload
  categories: CategoryEntry[]
  products: Entry[]
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

/** Width/height from the first JPEG SOF marker — avoids an image dependency. */
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

/** Built from the alt text, never the supplier's filename. */
function objectKey(sku: string, alt: string, position: number): string {
  const stem = alt
    .normalize('NFKD')
    .replace(/″/g, '-in')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80)
  return `products/${sku.toLowerCase()}/${String(position).padStart(2, '0')}-${stem}.jpg`
}

function words(s: string): number {
  return s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

/** The shelf template's stored-section document for one category's bands. */
function bandSections(c: CategoryEntry): StoredSection[] {
  const b = c.bands ?? {}
  const sections: StoredSection[] = []
  if (b.hero?.intro) sections.push({ key: 'hero', enabled: true, values: { intro: b.hero.intro } })
  for (const key of ['guidance', 'standards', 'service'] as const) {
    const band = b[key]
    if (band?.body) {
      sections.push({
        key,
        enabled: true,
        values: { eyebrow: band.eyebrow ?? null, heading: band.heading ?? null, body: band.body },
      })
    }
  }
  if (b.faq && b.faq.items.length > 0) {
    sections.push({
      key: 'faq',
      enabled: true,
      values: { heading: b.faq.heading ?? null, items: b.faq.items.map((i) => ({ q: i.q, a: i.a })) },
    })
  }
  return sections
}

async function main() {
  loadWebEnv()
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const publish = argv.includes('--publish')
  const rewriteCategories = argv.includes('--rewrite-categories')
  const rewriteBands = argv.includes('--rewrite-bands')
  const only = argv.find((a) => a.startsWith('--only='))?.split('=')[1] ?? null
  const name = argv.find((a) => a.startsWith('--payload='))?.split('=')[1]
  if (!name || !/^[a-z0-9-]+$/.test(name)) throw new Error('--payload=<folder under packages/db/data> is required')
  const payloadPath = join(DATA_DIR, name, 'catalogue.json')
  if (!existsSync(payloadPath)) throw new Error(`payload not found: ${payloadPath}`)
  const payload: Payload = JSON.parse(readFileSync(payloadPath, 'utf8'))
  if (!existsSync(payload.imageDir)) throw new Error(`Image folder not found: ${payload.imageDir}`)
  const problems: string[] = []

  // ── Payload checks that do not need the database ──────────────────────────
  const partNumbers = new Set<string>()
  const skus = new Set<string>()
  for (const e of payload.products) {
    if (skus.has(e.sku)) problems.push(`duplicate SKU ${e.sku}`)
    skus.add(e.sku)
    for (const v of e.variants) {
      if (partNumbers.has(v.partNumber)) problems.push(`duplicate part number ${v.partNumber}`)
      partNumbers.add(v.partNumber)
    }
    for (const img of e.images) {
      if (!existsSync(join(payload.imageDir, img.file))) problems.push(`${e.sku}: image missing ${img.file}`)
    }
  }
  for (const c of payload.categories) {
    const result = validateSections(subPageDef('category', { name: c.name, slug: c.slug }), bandSections(c))
    if (!result.ok) problems.push(`${c.slug}: bands invalid — ${result.issues.map((i) => i.message).join('; ')}`)
  }
  if (problems.length > 0) {
    for (const p of problems) console.log(`  ! ${p}`)
    throw new Error(`${problems.length} payload problems — nothing written`)
  }

  // ── Spec template ─────────────────────────────────────────────────────────
  let templateId: string
  if (dryRun) {
    const t = await db.specTemplate.findUnique({ where: { slug: payload.specTemplate.slug }, select: { id: true } })
    templateId = t?.id ?? 'dry-run'
    console.log(`[dry-run] ${t ? 'update' : 'create'} spec template ${payload.specTemplate.slug}`)
  } else {
    const r = await upsertSpecTemplate(payload.specTemplate, db)
    templateId = r.id
    console.log(`[template] ${r.outcome} ${r.slug} (${r.fieldsCreated} fields created, ${r.fieldsUpdated} updated)`)
  }
  const fields = await db.specTemplateField.findMany({ where: { templateId }, select: { id: true, key: true } })
  const fieldByKey = new Map(fields.map((f) => [f.key, f.id]))

  // ── Categories, parent before child ───────────────────────────────────────
  const categoryIdBySlug = new Map<string, string>()
  for (const c of payload.categories) {
    const existing = await db.category.findUnique({ where: { slug: c.slug }, select: { id: true } })
    const parentId: string | null = c.parentSlug
      ? (categoryIdBySlug.get(c.parentSlug) ??
        (await db.category.findUnique({ where: { slug: c.parentSlug }, select: { id: true } }))?.id ??
        null)
      : null
    if (c.parentSlug && !parentId && !dryRun) throw new Error(`parent category ${c.parentSlug} does not exist`)
    const data = {
      name: c.name,
      position: c.position,
      shortDescription: c.shortDescription,
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
      focusKeyword: c.focusKeyword,
      defaultSpecTemplateId: templateId === 'dry-run' ? null : templateId,
    }
    if (dryRun) {
      console.log(`[dry-run] ${existing ? (rewriteCategories ? 'rewrite' : 'keep') : 'create'} category ${c.slug}`)
      categoryIdBySlug.set(c.slug, existing?.id ?? `dry-run:${c.slug}`)
      continue
    }
    if (!existing) {
      const row = await db.category.create({
        data: { slug: c.slug, parentId, ...data, isPublished: publish },
        select: { id: true },
      })
      categoryIdBySlug.set(c.slug, row.id)
      console.log(`[category] created ${c.slug}`)
    } else {
      categoryIdBySlug.set(c.slug, existing.id)
      if (rewriteCategories) {
        await db.category.update({ where: { id: existing.id }, data: { ...data, parentId } })
        console.log(`[category] rewrote ${c.slug}`)
      }
      if (publish) await db.category.update({ where: { id: existing.id }, data: { isPublished: true } })
    }

    // Bands: only a missing document, unless asked.
    const key = subPageContentKey('category', c.slug)
    const sections = bandSections(c)
    if (sections.length === 0) continue
    const doc = await db.pageContent.findUnique({ where: { key }, select: { id: true } })
    if (doc && !rewriteBands) continue
    await db.pageContent.upsert({
      where: { key },
      create: { key, kind: 'category', sections: sections as unknown as Prisma.InputJsonValue },
      update: { sections: sections as unknown as Prisma.InputJsonValue },
    })
    console.log(`[bands] ${doc ? 'rewrote' : 'wrote'} ${key}`)
  }

  // ── Products ──────────────────────────────────────────────────────────────
  const sb = dryRun ? null : supabase()
  let created = 0
  let rewritten = 0
  let attached = 0
  for (const e of payload.products) {
    if (only && e.sku !== only) continue
    const categoryId = categoryIdBySlug.get(e.category)
    if (!categoryId) throw new Error(`${e.sku}: category ${e.category} is not in the payload`)
    const existing = await db.product.findUnique({ where: { sku: e.sku }, select: { id: true } })
    if (dryRun) {
      console.log(
        `[dry-run] ${existing ? 'rewrite' : 'create'}  ${e.sku}  ${e.title}  ` +
          `(${e.variants.length} sizes, ${e.specs.length} specs, ${e.faqs.length} faqs, ${e.images.length} images)`
      )
      if (existing) rewritten++
      else created++
      continue
    }
    // Part numbers are unique catalogue-wide; one that already belongs to a
    // different product is a collision to fix in the payload, not to overwrite.
    const clash = await db.productVariant.findFirst({
      where: {
        partNumber: { in: e.variants.map((v) => v.partNumber) },
        ...(existing ? { NOT: { productId: existing.id } } : {}),
      },
      select: { partNumber: true },
    })
    if (clash) {
      problems.push(`${e.sku}: part number ${clash.partNumber} already belongs to another product`)
      continue
    }

    const aliases = [...new Set([...e.searchAliases, ...e.variants.map((v) => v.partNumber)])]
    const data = {
      title: e.title,
      slug: e.slug,
      categoryId,
      brandId: null,
      specTemplateId: templateId,
      descriptionShort: e.descriptionShort,
      descriptionLong: e.descriptionLong,
      seoTitle: e.seoTitle,
      seoDescription: e.seoDescription,
      focusKeyword: e.focusKeyword,
      searchAliases: aliases.join(' '),
      unitOfMeasure: 'each' as const,
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
        await tx.productVariant.deleteMany({ where: { productId } })
        await tx.productCrossReference.deleteMany({ where: { productId } })
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
        await tx.productVariant.createMany({
          data: e.variants.map((v) => ({
            productId,
            partNumber: v.partNumber,
            position: v.position,
            dimensions: v.dimensions as Prisma.InputJsonValue,
          })),
        })
        if (e.crossReferences.length > 0) {
          await tx.productCrossReference.createMany({
            data: e.crossReferences.map((r) => ({ productId, ...r })),
          })
        }
      },
      { maxWait: 30_000, timeout: 60_000 }
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
      const objectPath = objectKey(e.sku, img.alt, position)
      const { error } = await sb!.storage.from(BUCKET).upload(objectPath, buf, {
        cacheControl: '31536000',
        upsert: true,
        contentType: 'image/jpeg',
      })
      if (error) {
        problems.push(`${e.sku}: upload failed for ${img.file} — ${error.message}`)
        continue
      }
      const publicUrl = sb!.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
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
              caption: null,
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

  console.log(
    `\n[lifting:${name}] ${created} created, ${rewritten} rewritten, ${attached} images attached, ` +
      `${partNumbers.size} part numbers, ${problems.length} problems` +
      (publish ? '' : ' — products are drafts and new categories unpublished (no --publish)')
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
