/**
 * Populate the Industrial Hose Couplings catalogue from the two brand owners
 * the workbook points at — Sunpool (Taiwan) and Seal Fast, Inc. (USA):
 * feature image, the real per-product size / material / standard data, and the
 * five coupling families the catalogue did not carry at all.
 *
 * Why this exists: every one of the 66 Sunpool-branded products shipped with no
 * image and a family-level spec block that was written once per category and
 * copied down. The "3 Segment Clamp for Storz" listed the whole Storz size
 * range, 1-1/2"–6", when Sunpool only makes that clamp in 3"–6". This replaces
 * those inherited values with the ones each product's own page states, and adds
 * 54 listings (universal air / Chicago couplings, clamps & ferrules, Russian
 * GOST, Barcelona & Geka, EN 14420-5) that had no catalogue entry.
 *
 * Sources, frozen so the import is deterministic:
 *   - `data/industrial-coupling-content.json`  payload per product, with the
 *     source URL and source page title recorded on every entry
 *   - `data/industrial-coupling-map.csv`       every workbook row and what was
 *     decided for it, including the rows this import deliberately does nothing
 *     to
 *
 * Re-scraping, if the frozen payload ever needs regenerating: Sunpool's
 * robots.txt disallows only `/manage` and `/bbpe`, so `/catalog/ins.php?…` is
 * fetchable. On a product page the title is `h3.articleTitle`, the full-size
 * photo is the `../upload/catalog_b/<hash>.jpg` inside `div.Img` (the
 * `catalog_s` sibling is a thumbnail), and the two-column table inside
 * `div.textEditor` carries Size / Material / Thread / Standard / Pressure.
 * Seal Fast item pages expose the same facts as an attribute table and the
 * original photo at `/Asset/<ITEM>.jpg` — the resized `/ImgMedium/`,
 * `/ImgSmall/` and `/ImgCustom/` paths are all robots-disallowed.
 *
 * Nothing here is generated: a product only gets a working pressure or a
 * standards line if its own source page states one. That is the whole point —
 * the Molykote import had to undo eight identical "typical" spec rows that were
 * wrong for the product they sat on.
 *
 * Idempotent: an image whose Media `originalFilename` already matches is
 * skipped, specs and FAQs are matched on label / question and updated in place,
 * and categories, nav entries and products are all upserted by their natural
 * key.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-industrial-couplings.ts \
 *     [--dry-run] [--limit=N] [--only=SKU] [--skip-nav] [--refresh-copy]
 *
 * `--refresh-copy` rewrites the description, SEO fields and FAQ answers of the
 * listings and categories this import created, from the frozen payload. It is
 * off by default so that a routine re-run — to pick up a missing image, say —
 * never silently discards an edit made in the admin.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient, type Prisma } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { scoreProductContent } from '@indus/domain'

const db = new PrismaClient()

const BUCKET = 'product-images'
const DATA = resolve(__dirname, '../../data/industrial-coupling-content.json')
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

const NAV_MENU_SLUG = 'primary-megamenu'

type Spec = {
  group: string
  label: string
  value: string
  unit: string | null
  position: number
  /** SpecTemplateField.key, when the template models this field. */
  templateKey: string | null
}

type Entry = {
  sku: string
  title: string
  /** Set when the workbook mistyped the title we already shipped. */
  titleFix?: string | null
  action: 'update' | 'create'
  categorySlug: string
  sheet: { l1: string; l2: string; name: string }
  source: { site: string; url: string; title: string | null; imageUrl: string }
  image: { file: string; url: string }
  specs: Spec[]
  bullets: string[]
  create: {
    slug: string
    descriptionShort: string
    descriptionLong: string
    seoTitle: string
    seoDescription: string
    focusKeyword: string
    faqs: { question: string; answer: string }[]
  } | null
}

type NewCategory = {
  slug: string
  name: string
  shortDescription: string
  navLabel: string
  seoTitle: string
  seoDescription: string
}

type NavGroup = {
  /** The new L2 column these families hang under. */
  label: string
  /** The L1 section it belongs to. */
  parentLabel: string
  /** The existing sibling it is placed after. */
  afterLabel: string
  /** Header link, matching the `?sub=` convention of its siblings. */
  url: string
}

type Payload = {
  navGroup: NavGroup
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

/**
 * A bare fetch has no timeout, so one stalled asset takes the whole run down.
 * Bound each request and retry before giving up on that product alone.
 */
async function fetchAsset(url: string, attempts = 3): Promise<Response | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { 'User-Agent': 'IndusHydraulicsCatalogueBot/1.0 (+https://indushydraulics.com)' },
      })
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

/**
 * Sunpool serves several of its `catalog_b/<hash>.jpg` URLs as PNG, so the URL
 * extension is not the format. Read the magic bytes and name the stored object
 * after what it actually is — a `.jpg` file holding PNG bytes is a lie the
 * media library would repeat forever.
 *
 * Anything that is not a recognised image is a redirect to an error page rather
 * than a photo, so it is refused rather than stored.
 */
function detectImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length >= 12) {
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' }
    if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
      return { mime: 'image/png', ext: 'png' }
    if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP')
      return { mime: 'image/webp', ext: 'webp' }
    if (buf.subarray(0, 3).toString('ascii') === 'GIF') return { mime: 'image/gif', ext: 'gif' }
  }
  return null
}

/** `IH-STZ-FOO.jpg` + png -> `IH-STZ-FOO.png`. */
function withExtension(file: string, ext: string): string {
  return `${file.replace(/\.[a-z0-9]+$/i, '')}.${ext}`
}

async function main() {
  loadWebEnv()
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const skipNav = argv.includes('--skip-nav')
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

  // The storefront layout applies `%s | Indus Hydraulics`. A seoTitle that
  // already contains the site name renders it twice — the bug every Molykote
  // page shipped with. Refuse the data rather than repeat it.
  const doubled = [
    ...payload.newCategories.map((c) => [c.slug, c.seoTitle] as const),
    ...payload.entries.flatMap((e) =>
      e.create ? [[e.sku, e.create.seoTitle] as const] : [],
    ),
  ].filter(([, t]) => /indus hydraulics/i.test(t))
  if (doubled.length) {
    throw new Error(
      `seoTitle must not contain the site name (the layout appends it): ` +
        doubled.map(([k]) => k).join(', '),
    )
  }

  // ── the five families the catalogue did not carry ──────────────────────
  //
  // Created before any product so a `create` entry always has somewhere to
  // land. `position` continues the existing sibling run rather than starting
  // at 0, which would silently reorder the whole column.
  const parent = await db.category.findUnique({
    where: { slug: payload.parentCategorySlug },
    select: { id: true },
  })
  if (!parent) throw new Error(`missing parent category ${payload.parentCategorySlug}`)

  const template = await db.specTemplate.findUnique({
    where: { slug: payload.specTemplateSlug },
    select: { id: true, fields: { select: { id: true, key: true } } },
  })
  if (!template) throw new Error(`missing spec template ${payload.specTemplateSlug}`)
  const fieldByKey = new Map(template.fields.map((f) => [f.key, f.id]))

  const brand = await db.brand.findUnique({ where: { slug: payload.brandSlug }, select: { id: true } })
  if (!brand) throw new Error(`missing brand ${payload.brandSlug}`)

  const maxSibling = await db.category.aggregate({
    where: { parentId: parent.id },
    _max: { position: true },
  })
  let nextPosition = (maxSibling._max.position ?? -1) + 1

  let categoriesCreated = 0
  const categoryIdBySlug = new Map<string, string>()
  for (const c of payload.newCategories) {
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
      // Stand in for the id the create would have produced, so the rest of the
      // run reports what it would really do instead of silently doing nothing.
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
        position: nextPosition++,
        isPublished: true,
        defaultSpecTemplateId: template.id,
      },
      select: { id: true },
    })
    categoryIdBySlug.set(c.slug, created.id)
    categoriesCreated++
  }

  // ── megamenu entries ───────────────────────────────────────────────────
  //
  // A category with no nav entry is reachable only by URL. The megamenu renders
  // exactly three levels — L1 column, L2 column, L3 column — so these go at L3
  // and their group at L2. Anything deeper is stored and never drawn.
  //
  // They get their own L2 column rather than joining "Specialty Couplings &
  // Flanges". That column already held 13 entries, which is exactly what fits
  // above the fold on a 720px-tall viewport, and the panel has no scroller:
  // appending five more put every one of them out of reach.
  let navCreated = 0
  if (!skipNav) {
    const g = payload.navGroup
    const section = await db.navMenuItem.findFirst({
      where: { label: g.parentLabel, menu: { slug: NAV_MENU_SLUG } },
      select: { id: true, menuId: true },
    })
    let navParent = section
      ? await db.navMenuItem.findFirst({
          where: { label: g.label, parentId: section.id },
          select: { id: true, menuId: true },
        })
      : null
    if (section && !navParent && !dryRun) {
      const after = await db.navMenuItem.findFirst({
        where: { label: g.afterLabel, parentId: section.id },
        select: { position: true },
      })
      const at = (after?.position ?? -1) + 1
      // Make room so the new column lands next to the one it splits off from,
      // instead of after unrelated sections.
      await db.navMenuItem.updateMany({
        where: { parentId: section.id, position: { gte: at } },
        data: { position: { increment: 1 } },
      })
      navParent = await db.navMenuItem.create({
        data: {
          menuId: section.menuId,
          parentId: section.id,
          position: at,
          label: g.label,
          // Every sibling container in this section links to the parent
          // category with a `?sub=` marker. The param is decorative — the
          // category page ignores it — but matching them means the column
          // header goes somewhere instead of rendering as a dead `#`.
          linkType: 'custom_url',
          customUrl: g.url,
        },
        select: { id: true, menuId: true },
      })
      navCreated++
    }
    if (!navParent) {
      if (dryRun) console.log(`[dry-run] create nav group ${g.label}`)
      else problems.push(`nav section "${g.parentLabel}" not found in ${NAV_MENU_SLUG} — no menu entries added`)
    } else {
      const maxNav = await db.navMenuItem.aggregate({
        where: { parentId: navParent.id },
        _max: { position: true },
      })
      let navPosition = (maxNav._max.position ?? -1) + 1
      for (const c of payload.newCategories) {
        const categoryId = categoryIdBySlug.get(c.slug)
        if (!categoryId) continue // dry run, or the category create failed
        if (dryRun) {
          console.log(`[dry-run] add nav item ${c.navLabel}`)
          navCreated++
          continue
        }
        const already = await db.navMenuItem.findFirst({
          where: { parentId: navParent.id, categoryId },
          select: { id: true },
        })
        if (already) continue
        // A previous run of this script may have hung the entry under the old
        // parent; move it rather than leaving a duplicate behind.
        const misplaced = await db.navMenuItem.findFirst({
          where: { categoryId, menuId: navParent.menuId, parentId: { not: navParent.id } },
          select: { id: true },
        })
        if (misplaced) {
          await db.navMenuItem.update({
            where: { id: misplaced.id },
            data: { parentId: navParent.id, position: navPosition++ },
          })
          navCreated++
          continue
        }
        await db.navMenuItem.create({
          data: {
            menuId: navParent.menuId,
            parentId: navParent.id,
            position: navPosition++,
            label: c.navLabel,
            linkType: 'category',
            categoryId,
          },
        })
        navCreated++
      }
    }
  }

  // ── products ───────────────────────────────────────────────────────────
  let entries = payload.entries
  if (only) entries = entries.filter((e) => e.sku === only)
  entries = entries.slice(0, limit)

  let created = 0
  let updated = 0
  let images = 0
  let imagesSkipped = 0
  let renamed = 0
  let refreshed = 0

  for (const e of entries) {
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

    if (!product && e.action === 'update') {
      problems.push(`${e.sku}: expected an existing product, found none`)
      continue
    }

    // ── create the listing ───────────────────────────────────────────────
    if (!product) {
      const categoryId = categoryIdBySlug.get(e.categorySlug)
      if (!categoryId) {
        problems.push(`${e.sku}: category ${e.categorySlug} unavailable`)
        continue
      }
      if (dryRun) {
        console.log(`[dry-run] create ${e.sku} — ${e.title}`)
        created++
        continue
      }
      const c = e.create!
      const fresh = await db.product.create({
        data: {
          sku: e.sku,
          slug: c.slug,
          title: e.title,
          categoryId,
          brandId: brand.id,
          specTemplateId: template.id,
          descriptionShort: c.descriptionShort,
          descriptionLong: c.descriptionLong,
          seoTitle: c.seoTitle,
          seoDescription: c.seoDescription,
          focusKeyword: c.focusKeyword,
          // Matches the rest of the Sunpool range: RFQ-only, no list price.
          status: 'active',
          unitOfMeasure: 'each',
          countryOfOrigin: 'Taiwan',
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
      product = fresh
      created++
    } else {
      updated++
      // A listing this import created, re-run with --refresh-copy: take the
      // payload's copy back over the top. Never for `update` entries — their
      // prose predates this import and is not ours to rewrite.
      if (refreshCopy && e.action === 'create' && e.create) {
        const c = e.create
        if (!dryRun) {
          await db.product.update({
            where: { id: product.id },
            data: {
              title: e.title,
              descriptionShort: c.descriptionShort,
              descriptionLong: c.descriptionLong,
              seoTitle: c.seoTitle,
              seoDescription: c.seoDescription,
              focusKeyword: c.focusKeyword,
            },
          })
        }
        product.title = e.title
        product.descriptionShort = c.descriptionShort
        product.descriptionLong = c.descriptionLong
        product.seoTitle = c.seoTitle
        product.seoDescription = c.seoDescription
        product.focusKeyword = c.focusKeyword
        refreshed++
      }
      // The workbook mistyped a title we shipped verbatim ("Compostie Hose").
      // The source page spells it correctly; the slug is left alone so the URL
      // that is already indexed keeps working.
      if (e.titleFix && product.title !== e.titleFix) {
        if (!dryRun) {
          await db.product.update({ where: { id: product.id }, data: { title: e.titleFix } })
        }
        product.title = e.titleFix
        renamed++
      }
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${e.action} ${e.sku}: ${e.specs.length} specs, ` +
          `${e.create?.faqs.length ?? 0} faqs, image ${e.image.file}`,
      )
      continue
    }

    // ── feature image ────────────────────────────────────────────────────
    const imageStem = e.image.file.replace(/\.[a-z0-9]+$/i, '')
    const hasImage = product.images.some((i) =>
      i.media.originalFilename.replace(/\.[a-z0-9]+$/i, '') === imageStem,
    )
    if (hasImage) {
      imagesSkipped++
    } else {
      const res = await fetchAsset(e.image.url)
      if (!res) {
        problems.push(`${e.sku}: image unreachable after retries — ${e.image.url}`)
      } else if (!res.ok) {
        problems.push(`${e.sku}: image ${res.status} for ${e.image.url}`)
      } else {
        const buf = Buffer.from(await res.arrayBuffer())
        const detected = detectImage(buf)
        if (!detected) {
          problems.push(
            `${e.sku}: ${e.image.url} answered ${res.headers.get('content-type')}, not an image`,
          )
        } else {
          const { mime, ext } = detected
          const filename = withExtension(e.image.file, ext)
          const objectPath = `products/${e.sku}/${filename}`
          const up = await sb.storage.from(BUCKET).upload(objectPath, buf, {
            cacheControl: '31536000',
            upsert: true,
            contentType: mime,
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
                    mimeType: mime,
                    originalFilename: filename,
                    storagePath: publicUrl,
                    bytes: buf.byteLength,
                    alt: product!.title,
                  },
                  select: { id: true },
                })
                // Position 0 is the feature image, so everything already
                // attached shifts down rather than being replaced.
                await tx.productImage.updateMany({
                  where: { productId: product!.id },
                  data: { position: { increment: 1 } },
                })
                await tx.productImage.create({
                  data: {
                    productId: product!.id,
                    mediaId: media.id,
                    position: 0,
                    alt: product!.title,
                  },
                })
              },
              { maxWait: 30_000, timeout: 30_000 },
            )
            images++
          }
        }
      }
    }

    // ── specs, FAQs, score ───────────────────────────────────────────────
    await db.$transaction(
      async (tx) => {
        for (const s of e.specs) {
          const data: Prisma.ProductSpecUpdateManyMutationInput = {
            value: s.value,
            unit: s.unit,
            group: s.group,
          }
          const hit = await tx.productSpec.updateMany({
            where: { productId: product!.id, label: s.label },
            data,
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
            // An inherited spec may predate the template link; attach it so the
            // key-feature and quick-spec zones pick the new value up.
            const fieldId = fieldByKey.get(s.templateKey)
            if (fieldId) {
              await tx.productSpec.updateMany({
                where: { productId: product!.id, label: s.label, templateFieldId: null },
                data: { templateFieldId: fieldId },
              })
            }
          }
        }

        const faqs = e.create?.faqs ?? []
        let faqPos = await tx.productFaq.count({ where: { productId: product!.id } })
        for (const f of faqs) {
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

        const imageCount = product!.images.length + (hasImage ? 0 : 1) || 1
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
      },
      { maxWait: 30_000, timeout: 30_000 },
    )

    const done = created + updated
    if (done % 25 === 0) console.log(`[couplings] ${done} products processed…`)
  }

  console.log(
    `\n[couplings] done — ${created} products created, ${updated} updated, ` +
      `${images} images attached, ${imagesSkipped} images already present, ` +
      `${categoriesCreated} categories created, ${navCreated} menu entries added, ` +
      `${renamed} titles corrected, ${refreshed} listings refreshed, ` +
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
