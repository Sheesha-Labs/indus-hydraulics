/**
 * Populate the MOLYKOTE® catalogue from DuPont, the brand owner: feature
 * image, real product copy, real technical specs, and the technical data
 * sheet.
 *
 * Why this exists: the 63 Molykote products shipped with placeholder content.
 * Every one carried the same eight specs with the same values — "-40°C to
 * +200°C (typical)", "Refer to datasheet" — so two unrelated products (33 MED,
 * a low-temperature silicone, and HP-870, a fully fluorinated PFPE) presented
 * byte-identical technical data. That is worse than an empty page for a
 * technical buyer, so this import replaces it rather than adding alongside it.
 *
 * Sources, all frozen so this import is deterministic:
 *   - `data/molykote-dupont-map.csv`   product -> DuPont page, with confidence
 *   - `data/molykote-content.json`     scraped + parsed payload per product
 *
 * Only rows marked `confidence=confirmed` in the map are imported. The
 * ambiguous and not-found rows are deliberately left untouched: attaching the
 * wrong data sheet to a lubricant is a safety problem, not a cosmetic one.
 *
 * Images are pulled from Adobe Scene7 by asset id at run time, so no binary
 * assets live in the repo and a re-run reproduces the same result.
 *
 * Datasheets are linked at their DuPont URL rather than re-hosted, so a
 * superseded sheet is never served from our own storage.
 *
 * Idempotent: an image whose Media `originalFilename` already matches is
 * skipped, and specs/documents are replaced rather than duplicated.
 *
 * Usage:
 *   pnpm --filter @indus/db tsx src/scripts/import-molykote-content.ts \
 *     [--dry-run] [--limit=N] [--only=SKU]
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { scoreProductContent } from '@indus/domain'

const db = new PrismaClient()

const BUCKET = 'product-images'
const DATA = resolve(__dirname, '../../data/molykote-content.json')
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const SCENE7 = 'https://dupont.scene7.com/is/image/Dupont'

type Spec = { group: string; label: string; value: string; unit: string | null; position: number }
type Entry = {
  sku: string
  title: string
  dupontSlug: string
  dupontUrl: string
  dupontTitle: string
  image: { file: string; scene7Id: string } | null
  descriptionShort: string
  descriptionLong: string
  seoTitle: string
  seoDescription: string
  faqs: { question: string; answer: string }[]
  specs: Spec[]
  document: { title: string; url: string; filename: string } | null
  sizes: string[]
}

/**
 * Prisma reads `packages/db/.env` on its own, but the Supabase storage
 * credentials only live in the web app's env file. Anything already exported
 * wins.
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

function words(s: string): number {
  return s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

async function main() {
  loadWebEnv()
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const limitArg = argv.find((a) => a.startsWith('--limit='))
  const onlyArg = argv.find((a) => a.startsWith('--only='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity
  const only = onlyArg ? onlyArg.split('=')[1] : null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  const sb = createClient(url, key, { auth: { persistSession: false } })

  let entries: Entry[] = JSON.parse(readFileSync(DATA, 'utf8'))
  if (only) entries = entries.filter((e) => e.sku === only)
  entries = entries.slice(0, limit)

  const problems: string[] = []
  let images = 0
  let imagesSkipped = 0
  let content = 0

  for (const e of entries) {
    const product = await db.product.findUnique({
      where: { sku: e.sku },
      select: {
        id: true,
        title: true,
        brandId: true,
        categoryId: true,
        focusKeyword: true,
        seoTitle: true,
        seoDescription: true,
        weightKg: true,
        countryOfOrigin: true,
        mpn: true,
        images: { select: { media: { select: { originalFilename: true } } } },
        _count: { select: { faqs: true, crossReferences: true } },
      },
    })
    if (!product) {
      problems.push(`${e.sku}: no such product`)
      continue
    }

    // ── feature image ────────────────────────────────────────────────────
    const filename = e.image?.file ?? null
    const hasImage = filename
      ? product.images.some((i) => i.media.originalFilename === filename)
      : false

    if (e.image && !hasImage) {
      if (dryRun) {
        images++
      } else {
        // 1000x1000 on white, matching the existing 21x21 render set.
        const src = `${SCENE7}/${e.image.scene7Id}?wid=1000&hei=1000&fmt=png&bgc=ffffff`
        const res = await fetch(src)
        if (!res.ok) {
          problems.push(`${e.sku}: scene7 ${res.status} for ${e.image.scene7Id}`)
        } else {
          const buf = Buffer.from(await res.arrayBuffer())
          const objectPath = `products/${e.sku}/${filename}`
          const up = await sb.storage.from(BUCKET).upload(objectPath, buf, {
            cacheControl: '31536000',
            upsert: true,
            contentType: 'image/png',
          })
          if (up.error) {
            problems.push(`${e.sku}: upload failed — ${up.error.message}`)
          } else {
            const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
            await db.$transaction(
              async (tx) => {
                const media = await tx.media.create({
                  data: {
                    kind: 'image',
                    mimeType: 'image/png',
                    originalFilename: filename!,
                    storagePath: publicUrl,
                    bytes: buf.byteLength,
                    width: 1000,
                    height: 1000,
                    alt: product.title,
                  },
                  select: { id: true },
                })
                await tx.productImage.updateMany({
                  where: { productId: product.id },
                  data: { position: { increment: 1 } },
                })
                await tx.productImage.create({
                  data: {
                    productId: product.id,
                    mediaId: media.id,
                    position: 0,
                    alt: product.title,
                  },
                })
              },
              { maxWait: 30_000, timeout: 30_000 },
            )
            images++
          }
        }
      }
    } else if (hasImage) {
      imagesSkipped++
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${e.sku}: ${e.specs.length} specs, ${e.document ? 'datasheet' : 'no datasheet'}`,
      )
      content++
      continue
    }

    // ── copy, specs, datasheet ───────────────────────────────────────────
    await db.$transaction(
      async (tx) => {
        await tx.product.update({
          where: { id: product.id },
          data: {
            descriptionShort: e.descriptionShort,
            descriptionLong: e.descriptionLong,
            // The page layout appends "| Indus Hydraulics" itself; the
            // placeholder seoTitle also carried it, so every Molykote page
            // rendered the suffix twice.
            seoTitle: e.seoTitle,
            seoDescription: e.seoDescription,
          },
        })

        // The shipped FAQ answers are generic placeholders. Three of them
        // assert product-specific facts (use, temperature range, pack sizes)
        // and would now contradict the real spec table on the same page.
        // Correct exactly those, matched on question text; leave the
        // brand-level questions alone.
        for (const f of e.faqs) {
          await tx.productFaq.updateMany({
            where: { productId: product.id, question: f.question },
            data: { answer: f.answer },
          })
        }

        // Replace: the existing rows are placeholders, not a partial truth.
        await tx.productSpec.deleteMany({ where: { productId: product.id } })
        if (e.specs.length) {
          await tx.productSpec.createMany({
            data: e.specs.map((s) => ({
              productId: product.id,
              group: s.group,
              label: s.label,
              value: s.value,
              unit: s.unit,
              position: s.position,
            })),
          })
        }

        if (e.document) {
          // One datasheet per product is enforced by a partial unique index,
          // so clear any existing one before inserting.
          const existing = await tx.productDocument.findMany({
            where: { productId: product.id, kind: 'datasheet' },
            select: { id: true },
          })
          if (existing.length) {
            await tx.productDocument.deleteMany({
              where: { id: { in: existing.map((x) => x.id) } },
            })
          }
          const media = await tx.media.create({
            data: {
              kind: 'document',
              mimeType: 'application/pdf',
              originalFilename: e.document.filename,
              // Full URL — mediaUrl() passes http through untouched, so the
              // sheet is always served fresh from DuPont.
              storagePath: e.document.url,
              bytes: 0,
              alt: e.document.title,
            },
            select: { id: true },
          })
          await tx.productDocument.create({
            data: {
              productId: product.id,
              kind: 'datasheet',
              title: e.document.title,
              language: 'en',
              mediaId: media.id,
              position: 0,
            },
          })
        }

        const imageCount = (hasImage ? product.images.length : product.images.length + 1) || 1
        const score = scoreProductContent({
          descriptionShortWords: words(e.descriptionShort),
          descriptionLongWords: words(e.descriptionLong),
          faqCount: product._count.faqs,
          specCount: e.specs.length,
          crossReferenceCount: product._count.crossReferences,
          documentCount: e.document ? 1 : 0,
          imageCount,
          hasBrand: Boolean(product.brandId),
          hasCategory: Boolean(product.categoryId),
          hasFocusKeyword: Boolean(product.focusKeyword),
          hasSeoTitleAndDescription: Boolean(product.seoTitle && product.seoDescription),
          hasCommerceAttributes: Boolean(
            product.weightKg && product.countryOfOrigin && product.mpn,
          ),
        })
        await tx.product.update({
          where: { id: product.id },
          data: { contentScore: score.score },
        })
      },
      { maxWait: 30_000, timeout: 30_000 },
    )

    content++
    if (content % 10 === 0) console.log(`[molykote] ${content} products updated…`)
  }

  console.log(
    `\n[molykote] done — ${content} products updated, ${images} images attached, ` +
      `${imagesSkipped} images already present, ${problems.length} problems`,
  )
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
