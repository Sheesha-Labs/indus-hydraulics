/**
 * Create the Molykote products DuPont publishes and this catalogue did not
 * carry — 112 listings, each with the manufacturer's own image, product data,
 * copy and technical data sheet.
 *
 * Why this exists: DuPont's sitemap lists 152 MOLYKOTE® product pages. Only 40
 * of them were on the site. This adds the other 112, so the Molykote range goes
 * from 61 listings to 173.
 *
 * Sources, frozen so the import is deterministic:
 *   - `data/molykote-expansion-content.json`  payload per product, carrying the
 *     DuPont URL it was built from
 *   - `data/molykote-expansion-map.csv`       one row per product: SKU, category,
 *     DuPont page, and whether it has an image and a data sheet
 *
 * Everything published here is DuPont's. The description is their Key
 * Properties, Performance Benefits and Applications copy; the specs are their
 * own "Product Details" table (technology, thickener, NLGI grade, service
 * temperature range, base oil viscosity); the pack sizes are the ones their
 * page lists. Nothing is generated to fill a gap — which is why spec counts run
 * 3-9 rather than a uniform number. That distinction matters here more than
 * anywhere: the 61 Molykote products already on the site shipped with eight
 * identical fabricated spec rows, and "-40°C to +200°C (typical)" was simply
 * wrong for the product it sat on.
 *
 * Two categories are created because DuPont's own classification needs them:
 * `MOLYKOTE® Oil` (28 products) and `MOLYKOTE® Dispersion` (12). Sweeping them
 * into "Specialty Lubricants" would have made that bucket larger than any real
 * category in the range.
 *
 * Assets:
 *   - Images come from Scene7 at `dupont.scene7.com/is/image/Dupont/<id>`. The
 *     id is read from the product's own page and filtered to that product's
 *     slug — a page also renders related-product photos, so an unfiltered read
 *     puts the wrong can on the page. Ids with a long leading run of zeros are
 *     internal and 403 on the public CDN; the frozen payload only carries ids
 *     that were fetched successfully.
 *   - Data sheets are linked at DuPont's URL, never re-hosted, so a superseded
 *     sheet is never served from our storage. Only the English sheet is taken:
 *     the region path contains `/en/` for every locale, so the language has to
 *     be read from the folder after `/documents/`, or German sheets get picked.
 *
 * Idempotent: a product that already exists is skipped unless `--refresh-copy`
 * is passed, an image whose Media `originalFilename` already matches is not
 * re-uploaded, and specs and FAQs are matched on label / question.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-molykote-expansion.ts \
 *     [--dry-run] [--limit=N] [--only=SKU] [--refresh-copy]
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { measureRemoteBytes, scoreProductContent } from '@indus/domain'

const db = new PrismaClient()

const BUCKET = 'product-images'
const DATA = resolve(__dirname, '../../data/molykote-expansion-content.json')
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const SCENE7 = 'https://dupont.scene7.com/is/image/Dupont'

type Spec = {
  group: string
  label: string
  value: string
  unit: string | null
  position: number
  /** SpecTemplateField.key on `lubricant-spec`, when the template models it. */
  templateKey: string | null
}

type Entry = {
  sku: string
  title: string
  slug: string
  categorySlug: string
  dupontSlug: string
  dupontUrl: string
  dupontTitle: string
  image: { file: string; scene7Id: string } | null
  descriptionShort: string
  descriptionLong: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  specs: Spec[]
  faqs: { question: string; answer: string }[]
  sizes: string[]
  document: { title: string; url: string; filename: string } | null
}

type NewCategory = {
  slug: string
  name: string
  position: number
  shortDescription: string
  seoTitle: string
  seoDescription: string
}

type Payload = {
  parentCategorySlug: string
  brandSlug: string
  specTemplateSlug: string
  newCategories: NewCategory[]
  entries: Entry[]
}

/** Supabase storage credentials live in the web app's env file. */
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

/** A bare fetch has no timeout, so one stalled asset takes the whole run down. */
async function fetchAsset(url: string, attempts = 3): Promise<Response | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(45_000),
        headers: { 'User-Agent': 'IndusHydraulicsCatalogueBot/1.0 (+https://indushydraulics.com)' },
      })
      if (res.ok) return res
      if (res.status < 500) return res
    } catch {
      /* timeout or socket error — retry */
    }
    await new Promise((r) => setTimeout(r, 1_500 * (i + 1)))
  }
  return null
}

/**
 * Scene7 answers `fmt=png` with PNG here, but it has served webp for the same
 * parameter before. Name the stored object after the bytes, not the request.
 */
function detectImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { mime: 'image/png', ext: 'png' }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' }
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP')
    return { mime: 'image/webp', ext: 'webp' }
  return null
}

async function main() {
  loadWebEnv()
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const refreshCopy = argv.includes('--refresh-copy')
  const limitArg = argv.find((a) => a.startsWith('--limit='))
  const onlyArg = argv.find((a) => a.startsWith('--only='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity
  const only = onlyArg ? onlyArg.split('=')[1] : null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  const sb = createClient(url, key, { auth: { persistSession: false } })

  const payload: Payload = JSON.parse(readFileSync(DATA, 'utf8'))
  const problems: string[] = []

  // The storefront layout applies `%s | Indus Hydraulics`; a seoTitle carrying
  // the site name renders it twice, which is what every Molykote page shipped
  // with the first time round. Refuse the data rather than repeat it.
  const doubled = [
    ...payload.newCategories.map((c) => [c.slug, c.seoTitle] as const),
    ...payload.entries.map((e) => [e.sku, e.seoTitle] as const),
  ].filter(([, t]) => /indus hydraulics/i.test(t))
  if (doubled.length) {
    throw new Error(`seoTitle must not contain the site name: ${doubled.map(([k]) => k).join(', ')}`)
  }

  const parent = await db.category.findUnique({
    where: { slug: payload.parentCategorySlug },
    select: { id: true },
  })
  if (!parent) throw new Error(`missing parent category ${payload.parentCategorySlug}`)

  const brand = await db.brand.findUnique({
    where: { slug: payload.brandSlug },
    select: { id: true },
  })
  if (!brand) throw new Error(`missing brand ${payload.brandSlug}`)

  // The 61 Molykote products already on the site attach to `lubricant-spec`.
  // Without it a product renders no key features and the compare tray reports
  // "Compare unavailable", so the new listings would sit apart from the range
  // they belong to.
  const template = await db.specTemplate.findUnique({
    where: { slug: payload.specTemplateSlug },
    select: { id: true, fields: { select: { id: true, key: true } } },
  })
  if (!template) throw new Error(`missing spec template ${payload.specTemplateSlug}`)
  const fieldByKey = new Map(template.fields.map((f) => [f.key, f.id]))

  // ── categories DuPont's classification needs ───────────────────────────
  let categoriesCreated = 0
  const categoryIdBySlug = new Map<string, string>()
  for (const c of [...payload.newCategories]) {
    const existing = await db.category.findUnique({ where: { slug: c.slug }, select: { id: true } })
    if (existing) {
      categoryIdBySlug.set(c.slug, existing.id)
      if (refreshCopy && !dryRun) {
        await db.category.update({
          where: { id: existing.id },
          data: {
            name: c.name,
            shortDescription: c.shortDescription,
            seoTitle: c.seoTitle,
            seoDescription: c.seoDescription,
          },
        })
      }
      continue
    }
    if (dryRun) {
      console.log(`[dry-run] create category ${c.slug} — ${c.name}`)
      categoriesCreated++
      categoryIdBySlug.set(c.slug, `dry-run:${c.slug}`)
      continue
    }
    const created = await db.category.create({
      data: {
        parentId: parent.id,
        slug: c.slug,
        name: c.name,
        shortDescription: c.shortDescription,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        position: c.position,
        isPublished: true,
      },
      select: { id: true },
    })
    categoryIdBySlug.set(c.slug, created.id)
    categoriesCreated++
  }

  // Categories that already existed and are referenced by an entry.
  for (const slug of new Set(payload.entries.map((e) => e.categorySlug))) {
    if (categoryIdBySlug.has(slug)) continue
    const c = await db.category.findUnique({ where: { slug }, select: { id: true } })
    if (c) categoryIdBySlug.set(slug, c.id)
    else problems.push(`category ${slug} does not exist`)
  }

  // ── products ───────────────────────────────────────────────────────────
  let entries = payload.entries
  if (only) entries = entries.filter((e) => e.sku === only)
  entries = entries.slice(0, limit)

  let created = 0
  let refreshed = 0
  let images = 0
  let imagesSkipped = 0
  let datasheets = 0

  for (const e of entries) {
    const categoryId = categoryIdBySlug.get(e.categorySlug)
    if (!categoryId) {
      problems.push(`${e.sku}: category ${e.categorySlug} unavailable`)
      continue
    }

    let product = await db.product.findUnique({
      where: { sku: e.sku },
      select: {
        id: true,
        title: true,
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
        images: { select: { media: { select: { originalFilename: true } } } },
        _count: { select: { faqs: true, crossReferences: true } },
      },
    })

    if (dryRun) {
      console.log(
        `[dry-run] ${product ? 'exists' : 'create'} ${e.sku} — ${e.title} ` +
          `(${e.categorySlug}, ${e.specs.length} specs, ${e.faqs.length} faqs, ` +
          `${e.image ? 'image' : 'NO IMAGE'}, ${e.document ? 'datasheet' : 'no datasheet'})`,
      )
      if (!product) created++
      continue
    }

    if (!product) {
      product = await db.product.create({
        data: {
          sku: e.sku,
          slug: e.slug,
          title: e.title,
          categoryId,
          brandId: brand.id,
          specTemplateId: template.id,
          descriptionShort: e.descriptionShort,
          descriptionLong: e.descriptionLong,
          seoTitle: e.seoTitle,
          seoDescription: e.seoDescription,
          focusKeyword: e.focusKeyword,
          // Matches the rest of the Molykote range: RFQ-only, no list price.
          status: 'active',
          unitOfMeasure: 'each',
          countryOfOrigin: 'USA',
          leadTimeDays: 21,
        },
        select: {
          id: true,
          title: true,
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
          images: { select: { media: { select: { originalFilename: true } } } },
          _count: { select: { faqs: true, crossReferences: true } },
        },
      })
      created++
    } else if (refreshCopy) {
      await db.product.update({
        where: { id: product.id },
        data: {
          title: e.title,
          categoryId,
          specTemplateId: template.id,
          descriptionShort: e.descriptionShort,
          descriptionLong: e.descriptionLong,
          seoTitle: e.seoTitle,
          seoDescription: e.seoDescription,
          focusKeyword: e.focusKeyword,
        },
      })
      product.title = e.title
      product.descriptionShort = e.descriptionShort
      product.descriptionLong = e.descriptionLong
      product.seoTitle = e.seoTitle
      product.seoDescription = e.seoDescription
      product.focusKeyword = e.focusKeyword
      refreshed++
    }

    // ── feature image ────────────────────────────────────────────────────
    const stem = e.image ? e.image.file.replace(/\.[a-z0-9]+$/i, '') : null
    const hasImage = stem
      ? product.images.some((i) => i.media.originalFilename.replace(/\.[a-z0-9]+$/i, '') === stem)
      : false

    if (e.image && !hasImage) {
      const src = `${SCENE7}/${encodeURIComponent(e.image.scene7Id)}?wid=1000&hei=1000&fmt=png&bgc=ffffff`
      const res = await fetchAsset(src)
      if (!res || !res.ok) {
        problems.push(`${e.sku}: image ${res ? res.status : 'unreachable'} — ${e.image.scene7Id}`)
      } else {
        const buf = Buffer.from(await res.arrayBuffer())
        const detected = detectImage(buf)
        if (!detected) {
          problems.push(`${e.sku}: ${e.image.scene7Id} did not answer with an image`)
        } else {
          const filename = `${stem}.${detected.ext}`
          const objectPath = `products/${e.sku}/${filename}`
          const up = await sb.storage.from(BUCKET).upload(objectPath, buf, {
            cacheControl: '31536000',
            upsert: true,
            contentType: detected.mime,
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
                    mimeType: detected.mime,
                    originalFilename: filename,
                    storagePath: publicUrl,
                    bytes: buf.byteLength,
                    alt: product!.title,
                  },
                  select: { id: true },
                })
                await tx.productImage.updateMany({
                  where: { productId: product!.id },
                  data: { position: { increment: 1 } },
                })
                await tx.productImage.create({
                  data: { productId: product!.id, mediaId: media.id, position: 0, alt: product!.title },
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

    // The sheet is linked at DuPont's URL, not re-hosted, so there is no
    // uploaded object to read a size back from. Ask the host — measured before
    // the transaction opens, because that is a third-party round trip and the
    // transaction below holds write locks.
    let datasheetBytes = 0
    if (e.document) {
      const measured = await measureRemoteBytes(e.document.url, { fetchImpl: fetch as never })
      if (measured.ok) datasheetBytes = measured.bytes
      else problems.push(`${e.sku}: datasheet size unmeasured (${measured.reason})`)
    }

    // ── specs, FAQs, datasheet, score ────────────────────────────────────
    await db.$transaction(
      async (tx) => {
        for (const s of e.specs) {
          const hit = await tx.productSpec.updateMany({
            where: { productId: product!.id, label: s.label },
            data: { value: s.value, unit: s.unit, group: s.group },
          })
          if (hit.count === 0) {
            const max = await tx.productSpec.aggregate({
              where: { productId: product!.id },
              _max: { position: true },
            })
            await tx.productSpec.create({
              data: {
                productId: product!.id,
                group: s.group,
                label: s.label,
                value: s.value,
                unit: s.unit,
                position: (max._max.position ?? -1) + 1,
                templateFieldId: s.templateKey ? (fieldByKey.get(s.templateKey) ?? null) : null,
              },
            })
          } else if (s.templateKey) {
            const fieldId = fieldByKey.get(s.templateKey)
            if (fieldId) {
              await tx.productSpec.updateMany({
                where: { productId: product!.id, label: s.label, templateFieldId: null },
                data: { templateFieldId: fieldId },
              })
            }
          }
        }

        let faqPos = await tx.productFaq.count({ where: { productId: product!.id } })
        for (const f of e.faqs) {
          const hit = await tx.productFaq.updateMany({
            where: { productId: product!.id, question: f.question },
            data: { answer: f.answer },
          })
          if (hit.count === 0) {
            await tx.productFaq.create({
              data: {
                productId: product!.id,
                question: f.question,
                answer: f.answer,
                position: faqPos++,
              },
            })
          }
        }

        if (e.document) {
          // A partial unique index enforces one datasheet per product, so the
          // existing row is replaced rather than added to.
          await tx.productDocument.deleteMany({
            where: { productId: product!.id, kind: 'datasheet' },
          })
          const media = await tx.media.create({
            data: {
              kind: 'document',
              mimeType: 'application/pdf',
              originalFilename: e.document.filename,
              // Full URL — mediaUrl() passes http through, so the sheet is
              // always served fresh from DuPont.
              storagePath: e.document.url,
              bytes: datasheetBytes,
              alt: e.document.title,
            },
            select: { id: true },
          })
          await tx.productDocument.create({
            data: {
              productId: product!.id,
              kind: 'datasheet',
              title: e.document.title,
              language: 'en',
              mediaId: media.id,
              position: 0,
            },
          })
        }

        const imageCount = product!.images.length + (hasImage || !e.image ? 0 : 1)
        const specCount = await tx.productSpec.count({ where: { productId: product!.id } })
        const faqCount = await tx.productFaq.count({ where: { productId: product!.id } })
        const documentCount = await tx.productDocument.count({ where: { productId: product!.id } })
        const score = scoreProductContent({
          descriptionShortWords: words(product!.descriptionShort ?? ''),
          descriptionLongWords: words(product!.descriptionLong ?? ''),
          faqCount,
          specCount,
          crossReferenceCount: product!._count.crossReferences,
          documentCount,
          imageCount,
          hasBrand: Boolean(product!.brandId),
          hasCategory: Boolean(product!.categoryId),
          hasFocusKeyword: Boolean(product!.focusKeyword),
          hasSeoTitleAndDescription: Boolean(product!.seoTitle && product!.seoDescription),
          hasCommerceAttributes: Boolean(
            product!.weightKg && product!.countryOfOrigin && product!.mpn,
          ),
        })
        await tx.product.update({
          where: { id: product!.id },
          data: { contentScore: score.score },
        })
        if (e.document) datasheets++
      },
      { maxWait: 30_000, timeout: 30_000 },
    )

    const done = created + refreshed
    if (done > 0 && done % 25 === 0) console.log(`[molykote] ${done} products processed…`)
  }

  console.log(
    `\n[molykote] done — ${created} products created, ${refreshed} refreshed, ` +
      `${images} images attached, ${imagesSkipped} images already present, ` +
      `${datasheets} datasheets linked, ${categoriesCreated} categories created, ` +
      `${problems.length} problems`,
  )
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
