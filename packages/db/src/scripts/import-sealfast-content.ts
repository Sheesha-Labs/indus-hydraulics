/**
 * Populate the Sealfast catalogue from Seal Fast, Inc., the brand owner:
 * feature image, real per-size data, and the family data sheet.
 *
 * Why this exists: the 88 Sealfast products shipped with no images at all, and
 * with a family-level "Size Range" spec that did not match the product's own
 * title — the item titled "1 1/4 to 1 1/2 Inch Pipe Thread Size" listed a size
 * range of 3/4"-1 1/2". This replaces those guesses with the real size list
 * parsed from each family's own SKU table.
 *
 * Sources, frozen so this import is deterministic:
 *   - `data/sealfast-map.csv`       product -> Sealfast family, with confidence
 *   - `data/sealfast-content.json`  scraped payload per product
 *
 * A note on materials. Our products are family-level and mostly
 * material-agnostic ("Standard Type A"), while Sealfast publishes one page per
 * material. Only material-independent data is taken from the representative
 * family, and the data sheet keeps the material in its title so it is never
 * mistaken for covering the whole family.
 *
 * Assets come only from `/Asset/`. Sealfast's robots.txt disallows every
 * resized-image path (`/ImgMedium/`, `/ImgSmall/`, `/ImgCustom/`, `/image/`);
 * `/Asset/` is permitted and serves the same originals at higher resolution.
 *
 * Idempotent: an image whose Media `originalFilename` already matches is
 * skipped, and specs/documents are replaced rather than duplicated.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-sealfast-content.ts \
 *     [--dry-run] [--limit=N] [--only=SKU]
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { measureRemoteBytes, scoreProductContent } from '@indus/domain'

const db = new PrismaClient()

const BUCKET = 'product-images'
const DATA = resolve(__dirname, '../../data/sealfast-content.json')
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
const ORIGIN = 'http://products.sealfast.com'

type Spec = { group: string; label: string; value: string; unit: string | null; position: number }
type Entry = {
  sku: string
  title: string
  sealfastSlug: string
  sealfastUrl: string
  sealfastTitle: string
  image: { file: string; asset: string } | null
  specs: Spec[]
  document: { title: string; url: string; filename: string } | null
  faqs: { question: string; answer: string }[]
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

/**
 * A bare fetch has no timeout, so one stalled asset takes the whole run down —
 * which is exactly what happened on the first pass, 56 products in. Bound each
 * request and retry once before giving up on that product alone.
 */
async function fetchAsset(url: string, attempts = 3): Promise<Response | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      if (res.ok) return res
      // 4xx will not fix itself; 5xx might.
      if (res.status < 500) return res
    } catch {
      /* timeout or socket error — fall through to retry */
    }
    await new Promise((r) => setTimeout(r, 1_500 * (i + 1)))
  }
  return null
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
        // Read, never written: this import leaves the existing copy alone and
        // only needs it to recompute the content score.
        descriptionShort: true,
        descriptionLong: true,
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
        const src = `${ORIGIN}/Asset/${encodeURIComponent(e.image.asset)}`
        const res = await fetchAsset(src)
        if (!res) {
          problems.push(`${e.sku}: asset unreachable after retries — ${e.image.asset}`)
        } else if (!res.ok) {
          problems.push(`${e.sku}: asset ${res.status} for ${e.image.asset}`)
        } else {
          const buf = Buffer.from(await res.arrayBuffer())
          const objectPath = `products/${e.sku}/${filename}`
          const up = await sb.storage.from(BUCKET).upload(objectPath, buf, {
            cacheControl: '31536000',
            upsert: true,
            contentType: 'image/jpeg',
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
                    mimeType: 'image/jpeg',
                    originalFilename: filename!,
                    storagePath: publicUrl,
                    bytes: buf.byteLength,
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
      console.log(`[dry-run] ${e.sku}: ${e.specs.length} specs, ${e.document ? 'datasheet' : '—'}`)
      content++
      continue
    }

    // The data sheet is linked at Seal Fast's own URL, not re-hosted, so there
    // is no uploaded object to read a size back from the way
    // `finaliseMediaUpload` does. Ask the host — a `Content-Length` is the same
    // fact, and recording it is what keeps these rows out of the media
    // library's "unknown size" bucket.
    //
    // Measured BEFORE the transaction opens: this is a third-party round trip,
    // and the transaction below holds write locks. A slow Seal Fast response
    // inside it would roll back the product's specs over a cosmetic number.
    //
    // Not fatal on failure. `bytes` stays 0, which the library renders as
    // unknown rather than "0 B", and the run says so instead of silently
    // leaving another batch of sizeless rows behind.
    let datasheetBytes = 0
    if (e.document) {
      const measured = await measureRemoteBytes(e.document.url, { fetchImpl: fetch as never })
      if (measured.ok) {
        datasheetBytes = measured.bytes
      } else {
        problems.push(
          `${e.sku}: datasheet size unmeasured (${measured.reason}: ${measured.detail}) — ${e.document.url}`,
        )
      }
    }

    // ── specs, datasheet ─────────────────────────────────────────────────
    //
    // Deliberately surgical, unlike the Molykote import. The existing Sealfast
    // copy and specs are product-specific and technically sound — they cite the
    // correct standards (A-A-59326, EN 14420-7, ANSI B16.5) and the real
    // camlock pressure-derating curve. Only the values we can source better
    // are touched; nothing is wholesale replaced, and the descriptions are
    // left alone entirely.
    await db.$transaction(
      async (tx) => {
        for (const s of e.specs) {
          const hit = await tx.productSpec.updateMany({
            where: { productId: product.id, label: s.label },
            data: { value: s.value, unit: s.unit, group: s.group },
          })
          if (hit.count === 0) {
            const max = await tx.productSpec.aggregate({
              where: { productId: product.id },
              _max: { position: true },
            })
            await tx.productSpec.create({
              data: {
                productId: product.id,
                group: s.group,
                label: s.label,
                value: s.value,
                unit: s.unit,
                position: (max._max.position ?? -1) + 1,
              },
            })
          }
        }

        if (e.document) {
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
              // Full URL — mediaUrl() passes http through, so the sheet is
              // always served fresh from Seal Fast.
              storagePath: e.document.url,
              // Seal Fast's size, not ours. The file occupies none of our own
              // storage; this is recorded so the library shows a real size
              // instead of a dash, and stays 0 only when the host refused.
              bytes: datasheetBytes,
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

        let faqPos = await tx.productFaq.count({ where: { productId: product.id } })
        for (const f of e.faqs) {
          const hit = await tx.productFaq.updateMany({
            where: { productId: product.id, question: f.question },
            data: { answer: f.answer },
          })
          if (hit.count === 0) {
            await tx.productFaq.create({
              data: {
                productId: product.id,
                question: f.question,
                answer: f.answer,
                position: faqPos++,
              },
            })
          }
        }

        const imageCount = (hasImage ? product.images.length : product.images.length + 1) || 1
        const specCount = await tx.productSpec.count({ where: { productId: product.id } })
        const score = scoreProductContent({
          descriptionShortWords: words(product.descriptionShort ?? ''),
          descriptionLongWords: words(product.descriptionLong ?? ''),
          faqCount: Math.max(product._count.faqs, e.faqs.length),
          specCount,
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
    if (content % 20 === 0) console.log(`[sealfast] ${content} products updated…`)
  }

  console.log(
    `\n[sealfast] done — ${content} products updated, ${images} images attached, ` +
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
