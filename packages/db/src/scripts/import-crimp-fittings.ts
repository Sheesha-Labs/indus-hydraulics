/**
 * Absorb the licensed crimp hydraulic fitting catalogue into the Indus
 * catalogue: 64 listings across two new sub-categories, 650 orderable sizes,
 * and the competitor series numbers each listing replaces.
 *
 * WHAT SHAPE THE DATA TAKES, AND WHY
 *
 * The source book is 65 tables over 45 pages, one table per end configuration
 * per hose series, and 674 sized rows underneath them. Those rows are NOT 674
 * products. A row is a size of a part, not a part — "JIC 37° female swivel 90°
 * elbow" is the product, and `-04` through `-32` are how you order it. Loading
 * rows as products would have produced 674 near-identical pages competing with
 * each other for the same query, each with the same photograph and the same
 * paragraph; loading them as `ProductSpec` rows would have flattened a
 * dimension table into key/value prose. They land in `product_variants`, which
 * exists for exactly this.
 *
 * Two categories rather than one because the book splits on hose family and
 * that split is real: the 43-series body crimps onto braided hose (1SN, 2SN,
 * 100R1AT/R2AT/R16/R17) and the 71-series onto spiral (4SP, 100R12). Same
 * thread ends, different bodies, not interchangeable.
 *
 * COMPETITOR EQUIVALENCE
 *
 * The point of the range is that a buyer searches the competitor's number, not
 * ours. Three mechanisms carry that:
 *
 *   1. `ProductCrossReference` per listing — drives the Compatibility tab and
 *      the `/replacement/<brand>/<mpn>` pages, which until now had no rows at
 *      all.
 *   2. `ProductVariant.competitorMpn` per size, so the size table reads as a
 *      cross-reference table.
 *   3. `Product.searchAliases`, which is what actually makes those identifiers
 *      findable — `products.search_tsv` is `GENERATED ALWAYS` and cannot read
 *      another table.
 *
 * Per-size numbers are only emitted for the families whose second size field
 * is an SAE dash (`variantCompetitorNumbers` in the payload). The metric and
 * JIS families are excluded: their second field is a tube O.D. in millimetres
 * and the competitor's own suffix convention there is not something the source
 * states. Two family-level references are marked `competitorRefsDerived` —
 * the book omits them and every other family prints `<base><series>`, so they
 * are the book's convention applied to its own data. Both are flagged in the
 * payload so they stay visible rather than blending in.
 *
 * WHAT IS DELIBERATELY ABSENT
 *
 * No pressure ratings. The source publishes none, and the assembly rating
 * belongs to the hose grade and bore anyway. No country of origin — the source
 * does not state one, and the neighbouring listings' "UAE" is not a fact about
 * these. No dimension meanings beyond the two the source headers name
 * themselves (see `@indus/domain/variant-columns`).
 *
 * IMAGES
 *
 * 62 of the 64 listings reuse an existing catalogue render by SKU, not by
 * copying the file: a female JIC 90° crimp fitting is the same object whether
 * it is bodied for braided or spiral hose, and `ProductImage` is a join, so
 * two listings can point at one `Media` row. The two ORFS 90° long-drop
 * listings have no existing render and are reported at the end.
 *
 * Idempotent. Categories, nav entries, products, specs, FAQs and cross
 * references are matched on their natural keys and updated in place; variants
 * are replaced wholesale because the payload owns them.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-crimp-fittings.ts \
 *     [--dry-run] [--only=SKU] [--limit=N] [--skip-nav] [--refresh-copy] \
 *     [--no-variant-equivalents] [--publish]
 *
 * `--refresh-copy` rewrites descriptions, SEO fields and FAQ answers from the
 * payload. Off by default so a re-run to fix one image never discards an admin
 * edit. `--no-variant-equivalents` loads the size tables without per-size
 * competitor numbers, leaving the series-level references in place.
 *
 * `--publish` is what makes the range public, and it is off by default on
 * purpose. Every description on these pages says "full size table on this
 * page", which is only true once the PDP code that renders `product_variants`
 * has deployed. Load the data first, deploy, then re-run with `--publish`.
 *
 * It gates all three things that make the range visible, not just the product
 * status: the categories stay unpublished and the megamenu entries are not
 * created either. The nav resolver does not check `Category.isPublished` — it
 * links whatever a menu item points at — so creating the entries early puts
 * two live megamenu links to empty category pages on the storefront.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { scoreProductContent } from '@indus/domain'

const db = new PrismaClient()

const DATA = resolve(__dirname, '../../data/crimp-fittings/catalogue.json')
const NAV_MENU_SLUG = 'primary-megamenu'

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
  hoseDash: number | null
  hoseInch: string | null
  hoseDn: number | null
  portLabel: string | null
  portDash: number | null
  dimensions: Record<string, number>
  competitorBrand: string | null
  competitorMpn: string | null
  sourcePart: string
  sourcePartCorrected: boolean
}

type Entry = {
  sku: string
  title: string
  slug: string
  categorySlug: string
  specTemplateSlug: string
  focusKeyword: string
  competitorBrand: string
  competitorRefs: string[]
  competitorRefsDerived: string[]
  variantCompetitorNumbers: boolean
  imageFromSku: string | null
  boreRange: string
  variantCount: number
  variants: Variant[]
  descriptionShort: string
  descriptionLong: string
  seoTitle: string
  seoDescription: string
  faqs: { question: string; answer: string }[]
  specs: Spec[]
  sourcePages: number[]
}

type NewCategory = {
  slug: string
  name: string
  navLabel: string
  shortDescription: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
}

type Payload = {
  competitorBrand: string
  categories: NewCategory[]
  parentCategorySlug: string
  brandSlug: string
  navParentLabel: string
  navGroupLabel: string
  navAfterLabel: string
  products: Entry[]
}

function words(s: string): number {
  return s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

/**
 * Everything a buyer might type that is not this row's own sku or mpn: the
 * competitor series references, the per-size competitor numbers, and our own
 * variant part numbers. Deduped and space-joined, because `search_tsv` folds
 * it in through `to_tsvector('simple', …)`.
 */
function buildSearchAliases(e: Entry, withVariantEquivalents: boolean): string {
  const tokens = new Set<string>()
  for (const r of e.competitorRefs) tokens.add(r)
  for (const v of e.variants) {
    tokens.add(v.partNumber)
    if (withVariantEquivalents && v.competitorMpn) tokens.add(v.competitorMpn)
  }
  return [...tokens].join(' ')
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const skipNav = argv.includes('--skip-nav')
  const refreshCopy = argv.includes('--refresh-copy')
  const variantEquivalents = !argv.includes('--no-variant-equivalents')
  const publish = argv.includes('--publish')
  const limitArg = argv.find((a) => a.startsWith('--limit='))
  const onlyArg = argv.find((a) => a.startsWith('--only='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity
  const only = onlyArg ? onlyArg.split('=')[1] : null

  const payload: Payload = JSON.parse(readFileSync(DATA, 'utf8'))
  const problems: string[] = []

  // The storefront layout appends ` | Indus Hydraulics`. A seoTitle carrying
  // the site name renders it twice — the bug every Molykote page shipped with.
  const doubled = [
    ...payload.categories.map((c) => [c.slug, c.seoTitle] as const),
    ...payload.products.map((p) => [p.sku, p.seoTitle] as const),
  ].filter(([, t]) => /indus hydraulics/i.test(t))
  if (doubled.length > 0) {
    throw new Error(
      `seoTitle must not contain the site name (the layout appends it): ${doubled
        .map(([k]) => k)
        .join(', ')}`,
    )
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

  const templateSlugs = [...new Set(payload.products.map((p) => p.specTemplateSlug))]
  const templates = await db.specTemplate.findMany({
    where: { slug: { in: templateSlugs } },
    select: { id: true, slug: true, fields: { select: { id: true, key: true } } },
  })
  const missingTemplate = templateSlugs.filter((s) => !templates.some((t) => t.slug === s))
  if (missingTemplate.length > 0) {
    throw new Error(`missing spec template(s): ${missingTemplate.join(', ')}`)
  }
  const templateBySlug = new Map(
    templates.map((t) => [t.slug, { id: t.id, fieldByKey: new Map(t.fields.map((f) => [f.key, f.id])) }]),
  )

  // ── categories ─────────────────────────────────────────────────────────
  //
  // Placed immediately after Crimp Ferrules rather than appended, because the
  // category index and the megamenu both order on `position` and a crimp
  // fitting belongs beside the crimp ferrule it is used with, not after the
  // stainless range. Siblings at or past that slot shift down to make room.
  let categoriesCreated = 0
  const categoryIdBySlug = new Map<string, string>()
  const anchor = await db.category.findFirst({
    where: { parentId: parent.id, name: payload.navAfterLabel },
    select: { position: true },
  })
  let nextPosition = (anchor?.position ?? -1) + 1
  const existingCategories = await db.category.findMany({
    where: { slug: { in: payload.categories.map((c) => c.slug) } },
    select: { id: true, slug: true },
  })
  for (const c of existingCategories) categoryIdBySlug.set(c.slug, c.id)

  const freshCount = payload.categories.filter((c) => !categoryIdBySlug.has(c.slug)).length
  if (freshCount > 0 && !dryRun) {
    await db.category.updateMany({
      where: { parentId: parent.id, position: { gte: nextPosition } },
      data: { position: { increment: freshCount } },
    })
  }

  for (const c of payload.categories) {
    const existingId = categoryIdBySlug.get(c.slug)
    if (existingId) {
      // Only ever promotes, same as the product status above.
      if (publish && !dryRun) {
        await db.category.update({ where: { id: existingId }, data: { isPublished: true } })
      }
      if (refreshCopy && !dryRun) {
        await db.category.update({
          where: { id: existingId },
          data: {
            name: c.name,
            shortDescription: c.shortDescription,
            seoTitle: c.seoTitle,
            seoDescription: c.seoDescription,
            focusKeyword: c.focusKeyword,
          },
        })
      }
      continue
    }
    if (dryRun) {
      console.log(`[dry-run] create category ${c.slug} at position ${nextPosition++}`)
      categoryIdBySlug.set(c.slug, `dry-run:${c.slug}`)
      categoriesCreated++
      continue
    }
    // Both new categories are threaded-fitting families by default; the flange
    // listings override the template on the product itself.
    const created = await db.category.create({
      data: {
        parentId: parent.id,
        slug: c.slug,
        name: c.name,
        shortDescription: c.shortDescription,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        focusKeyword: c.focusKeyword,
        position: nextPosition++,
        isPublished: publish,
        defaultSpecTemplateId: templateBySlug.get('threaded-fitting-spec')?.id ?? null,
      },
      select: { id: true },
    })
    categoryIdBySlug.set(c.slug, created.id)
    categoriesCreated++
  }

  // ── megamenu ───────────────────────────────────────────────────────────
  //
  // Joins the existing "Hose Fittings" column rather than opening a new one.
  // That column holds 10 entries; 13 is what fits above the fold on a 720px
  // viewport and the panel has no scroller, so two more is inside the ceiling
  // and a new column would not have been.
  let navCreated = 0
  if (!skipNav && publish) {
    const section = await db.navMenuItem.findFirst({
      where: { label: payload.navParentLabel, menu: { slug: NAV_MENU_SLUG } },
      select: { id: true, menuId: true },
    })
    const navGroup = section
      ? await db.navMenuItem.findFirst({
          where: { label: payload.navGroupLabel, parentId: section.id },
          select: { id: true, menuId: true },
        })
      : null
    if (!navGroup) {
      problems.push(
        `nav column "${payload.navGroupLabel}" not found under "${payload.navParentLabel}" — no menu entries added`,
      )
    } else {
      const after = await db.navMenuItem.findFirst({
        where: { parentId: navGroup.id, label: payload.navAfterLabel },
        select: { position: true },
      })
      let at = (after?.position ?? -1) + 1
      for (const c of payload.categories) {
        const categoryId = categoryIdBySlug.get(c.slug)
        if (!categoryId || categoryId.startsWith('dry-run:')) {
          if (dryRun) console.log(`[dry-run] add nav item ${c.navLabel}`)
          continue
        }
        const already = await db.navMenuItem.findFirst({
          where: { parentId: navGroup.id, categoryId },
          select: { id: true },
        })
        if (already) continue
        await db.navMenuItem.updateMany({
          where: { parentId: navGroup.id, position: { gte: at } },
          data: { position: { increment: 1 } },
        })
        await db.navMenuItem.create({
          data: {
            menuId: navGroup.menuId,
            parentId: navGroup.id,
            position: at,
            label: c.navLabel,
            linkType: 'category',
            categoryId,
          },
        })
        at++
        navCreated++
      }
    }
  }

  // ── products ───────────────────────────────────────────────────────────
  let entries = payload.products
  if (only) entries = entries.filter((e) => e.sku === only)
  entries = entries.slice(0, limit)

  let created = 0
  let updated = 0
  let variantsWritten = 0
  let crossRefs = 0
  let imagesAttached = 0
  const withoutImage: string[] = []

  for (const e of entries) {
    const categoryId = categoryIdBySlug.get(e.categorySlug)
    if (!categoryId) {
      problems.push(`${e.sku}: category ${e.categorySlug} unavailable`)
      continue
    }
    const template = templateBySlug.get(e.specTemplateSlug)!
    const searchAliases = buildSearchAliases(e, variantEquivalents)

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
        _count: { select: { images: true } },
      },
    })

    if (!product) {
      if (dryRun) {
        console.log(`[dry-run] create ${e.sku} — ${e.title} (${e.variantCount} sizes)`)
        created++
        continue
      }
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
          searchAliases,
          // RFQ-only, matching the rest of the fitting range. No country of
          // origin: the source states none and inventing one would put a
          // customs claim on the page.
          status: publish ? 'active' : 'draft',
          unitOfMeasure: 'each',
          leadTimeDays: 7,
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
          _count: { select: { images: true } },
        },
      })
      created++
    } else {
      updated++
      if (!dryRun) {
        await db.product.update({
          where: { id: product.id },
          data: {
            categoryId,
            brandId: brand.id,
            specTemplateId: template.id,
            searchAliases,
            // Only ever promotes. A listing an editor has retired stays
            // retired; a re-run without --publish does not unpublish.
            ...(publish ? { status: 'active' as const } : {}),
            ...(refreshCopy
              ? {
                  title: e.title,
                  descriptionShort: e.descriptionShort,
                  descriptionLong: e.descriptionLong,
                  seoTitle: e.seoTitle,
                  seoDescription: e.seoDescription,
                  focusKeyword: e.focusKeyword,
                }
              : {}),
          },
        })
      }
      if (refreshCopy) {
        product.title = e.title
        product.descriptionShort = e.descriptionShort
        product.descriptionLong = e.descriptionLong
        product.seoTitle = e.seoTitle
        product.seoDescription = e.seoDescription
        product.focusKeyword = e.focusKeyword
      }
    }

    if (dryRun) continue
    const productId = product.id

    // ── image ────────────────────────────────────────────────────────────
    //
    // Points at the Media row an existing listing already uses. Nothing is
    // uploaded and nothing is copied — `ProductImage` is a join table, so the
    // same render can hang off both listings. Deleting either listing leaves
    // the Media row alone (the FK from ProductImage is RESTRICT on media).
    if (product._count.images === 0) {
      if (!e.imageFromSku) {
        withoutImage.push(e.sku)
      } else {
        const donor = await db.product.findUnique({
          where: { sku: e.imageFromSku },
          select: { images: { orderBy: { position: 'asc' }, take: 1, select: { mediaId: true } } },
        })
        const mediaId = donor?.images[0]?.mediaId
        if (!mediaId) {
          problems.push(`${e.sku}: image donor ${e.imageFromSku} has no image`)
          withoutImage.push(e.sku)
        } else {
          await db.productImage.create({
            data: { productId, mediaId, position: 0, alt: e.title },
          })
          imagesAttached++
        }
      }
    }

    // ── cross references ─────────────────────────────────────────────────
    for (const ref of e.competitorRefs) {
      const hit = await db.productCrossReference.findFirst({
        where: { productId, competitorBrand: e.competitorBrand, competitorMpn: ref },
        select: { id: true },
      })
      if (hit) continue
      await db.productCrossReference.create({
        data: {
          productId,
          competitorBrand: e.competitorBrand,
          competitorMpn: ref,
          compatibility: 'direct',
        },
      })
      crossRefs++
    }

    // ── variants ─────────────────────────────────────────────────────────
    //
    // Replaced rather than merged: the payload is the whole size table, so a
    // row it no longer carries is a row that should no longer exist. The two
    // statements are one transaction so a failed insert cannot leave the
    // listing with an empty table.
    await db.$transaction(
      async (tx) => {
        await tx.productVariant.deleteMany({ where: { productId } })
        await tx.productVariant.createMany({
          data: e.variants.map((v) => ({
            productId,
            partNumber: v.partNumber,
            position: v.position,
            hoseDash: v.hoseDash,
            hoseInch: v.hoseInch,
            hoseDn: v.hoseDn,
            portLabel: v.portLabel,
            portDash: v.portDash,
            dimensions: v.dimensions,
            competitorBrand: variantEquivalents ? v.competitorBrand : null,
            competitorMpn: variantEquivalents ? v.competitorMpn : null,
          })),
        })
      },
      { maxWait: 30_000, timeout: 30_000 },
    )
    variantsWritten += e.variants.length

    // ── specs, FAQs, score ───────────────────────────────────────────────
    await db.$transaction(
      async (tx) => {
        for (const s of e.specs) {
          const hit = await tx.productSpec.updateMany({
            where: { productId, label: s.label },
            data: { value: s.value, unit: s.unit, group: s.group, isFilterable: s.isFilterable },
          })
          if (hit.count === 0) {
            await tx.productSpec.create({
              data: {
                productId,
                group: s.group,
                label: s.label,
                value: s.value,
                unit: s.unit,
                position: s.position,
                isFilterable: s.isFilterable,
                templateFieldId: s.templateKey
                  ? (template.fieldByKey.get(s.templateKey) ?? null)
                  : null,
              },
            })
          } else if (s.templateKey) {
            const fieldId = template.fieldByKey.get(s.templateKey)
            if (fieldId) {
              await tx.productSpec.updateMany({
                where: { productId, label: s.label, templateFieldId: null },
                data: { templateFieldId: fieldId },
              })
            }
          }
        }

        let faqPos = await tx.productFaq.count({ where: { productId } })
        for (const f of e.faqs) {
          const hit = await tx.productFaq.updateMany({
            where: { productId, question: f.question },
            data: { answer: f.answer },
          })
          if (hit.count === 0) {
            await tx.productFaq.create({
              data: { productId, question: f.question, answer: f.answer, position: faqPos++ },
            })
          }
        }

        const [specCount, faqCount, documentCount, imageCount, crossReferenceCount] =
          await Promise.all([
            tx.productSpec.count({ where: { productId } }),
            tx.productFaq.count({ where: { productId } }),
            tx.productDocument.count({ where: { productId } }),
            tx.productImage.count({ where: { productId } }),
            tx.productCrossReference.count({ where: { productId } }),
          ])
        const score = scoreProductContent({
          descriptionShortWords: words(product!.descriptionShort ?? ''),
          descriptionLongWords: words(product!.descriptionLong ?? ''),
          faqCount,
          specCount,
          crossReferenceCount,
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
        await tx.product.update({ where: { id: productId }, data: { contentScore: score.score } })
      },
      { maxWait: 30_000, timeout: 30_000 },
    )

    const done = created + updated
    if (done % 16 === 0) console.log(`[crimp-fittings] ${done} listings processed…`)
  }

  const derived = payload.products.filter((p) => p.competitorRefsDerived.length > 0)
  const corrected = payload.products.flatMap((p) =>
    p.variants.filter((v) => v.sourcePartCorrected).map((v) => `${v.sourcePart} → ${v.partNumber}`),
  )

  console.log(
    `\n[crimp-fittings] done — ${created} listings created, ${updated} updated, ` +
      `${variantsWritten} sizes written, ${crossRefs} cross references added, ` +
      `${imagesAttached} images attached, ${categoriesCreated} categories created, ` +
      `${navCreated} menu entries added, ${problems.length} problems`,
  )
  if (!publish) {
    console.log(
      '  · listings are DRAFT, categories unpublished, no menu entries. Re-run with --publish' +
        ' once the PDP size-table code has deployed — the copy promises a table this build may' +
        ' not render yet.',
    )
  }
  if (withoutImage.length > 0) {
    console.log(`  · no render available yet: ${withoutImage.join(', ')}`)
  }
  if (derived.length > 0) {
    console.log(
      `  · competitor reference derived from the source's own convention (verify before relying on it): ` +
        derived.map((p) => `${p.sku}=${p.competitorRefsDerived.join('/')}`).join(', '),
    )
  }
  if (corrected.length > 0) {
    console.log(`  · source part numbers corrected against their own row data: ${corrected.join(', ')}`)
  }
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
