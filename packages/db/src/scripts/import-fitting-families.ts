/**
 * Add fitting families to a category that already exists.
 *
 * The third importer in this shape and the first one written to be reused. The
 * two before it each owned a one-off job:
 *
 *   import-crimp-fittings.ts       new categories + new listings + Parker refs
 *   backfill-fitting-size-tables.ts   size tables onto listings we already had
 *
 * What is left over — and what the supplier-coverage audit says we will do
 * repeatedly — is "here are N new listings for a category that already exists,
 * with their size tables". That is this script. It takes a payload directory
 * and has no knowledge of which family it is loading, so the next batch is a
 * new JSON file rather than a new script.
 *
 * It deliberately does NOT create categories or nav entries. A family that
 * needs a new category needs a decision about where it sits in the megamenu,
 * and that decision does not belong in a loop over a payload.
 *
 * Idempotent. Listings are matched on SKU and updated in place; specs and FAQs
 * are matched on label / question; variants are replaced wholesale because the
 * payload is the whole size table. Copy is only rewritten with
 * `--refresh-copy`, so a re-run to fix one image never discards an admin edit.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-fitting-families.ts \
 *     --payload=metric-74-cone [--dry-run] [--only=SKU] [--refresh-copy] [--publish]
 *
 * `--publish` is off by default for the same reason it is in the crimp
 * importer: the copy promises a size table, which is only true once the code
 * that renders it has deployed. For a payload that needs no new columns in
 * `@indus/domain/variant-columns`, publishing on the first run is safe.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { scoreProductContent } from '@indus/domain'

const db = new PrismaClient()

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
  dimensions: Record<string, number | string>
  sourcePart: string
}

type Entry = {
  sku: string
  title: string
  slug: string
  categorySlug: string
  specTemplateSlug: string
  focusKeyword: string
  /** Existing catalogue SKU whose render is the same physical shape. */
  imageFromSku: string | null
  descriptionShort: string
  descriptionLong: string
  seoTitle: string
  seoDescription: string
  faqs: { question: string; answer: string }[]
  specs: Spec[]
  variants: Variant[]
  sourceFamily: string
}

type Payload = { source: string; products: Entry[] }

function words(s: string): number {
  return s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

function mergeAliases(existing: string | null, additions: string[]): string {
  const tokens = new Set((existing ?? '').split(/\s+/).filter(Boolean))
  for (const a of additions) tokens.add(a)
  return [...tokens].join(' ')
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const refreshCopy = argv.includes('--refresh-copy')
  const publish = argv.includes('--publish')
  const onlyArg = argv.find((a) => a.startsWith('--only='))
  const payloadArg = argv.find((a) => a.startsWith('--payload='))
  const only = onlyArg ? onlyArg.split('=')[1] : null
  const payloadName = payloadArg ? payloadArg.split('=')[1] : null
  if (!payloadName) throw new Error('--payload=<directory under packages/db/data> is required')

  const dataPath = resolve(__dirname, `../../data/${payloadName}/listings.json`)
  if (!existsSync(dataPath)) throw new Error(`no payload at ${dataPath}`)
  const payload: Payload = JSON.parse(readFileSync(dataPath, 'utf8'))

  // The storefront layout appends ` | Indus Hydraulics`; a seoTitle carrying the
  // site name renders it twice.
  const doubled = payload.products.filter((p) => /indus hydraulics/i.test(p.seoTitle))
  if (doubled.length > 0) {
    throw new Error(`seoTitle must not contain the site name: ${doubled.map((p) => p.sku).join(', ')}`)
  }

  let entries = payload.products
  if (only) entries = entries.filter((e) => e.sku === only)

  // Fail before writing anything rather than halfway through: a slug or part
  // number already belonging to a different product would abort mid-run and
  // leave the catalogue in a state nobody chose.
  const clashSlugs = await db.product.findMany({
    where: { slug: { in: entries.map((e) => e.slug) }, sku: { notIn: entries.map((e) => e.sku) } },
    select: { slug: true, sku: true },
  })
  if (clashSlugs.length > 0) {
    throw new Error(
      `slug already used by another product: ${clashSlugs.map((c) => `${c.slug} (${c.sku})`).join(', ')}`,
    )
  }
  const clashParts = await db.productVariant.findMany({
    where: {
      partNumber: { in: entries.flatMap((e) => e.variants.map((v) => v.partNumber)) },
      product: { sku: { notIn: entries.map((e) => e.sku) } },
    },
    select: { partNumber: true, product: { select: { sku: true } } },
  })
  if (clashParts.length > 0) {
    throw new Error(
      `part number already used by another product: ${clashParts
        .map((c) => `${c.partNumber} (${c.product.sku})`)
        .join(', ')}`,
    )
  }

  const categorySlugs = [...new Set(entries.map((e) => e.categorySlug))]
  const categories = await db.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, slug: true },
  })
  const missingCategory = categorySlugs.filter((s) => !categories.some((c) => c.slug === s))
  if (missingCategory.length > 0) {
    throw new Error(
      `category does not exist: ${missingCategory.join(', ')} — this importer does not create ` +
        `categories, because where a new one sits in the megamenu is a decision, not a loop`,
    )
  }
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]))

  const templateSlugs = [...new Set(entries.map((e) => e.specTemplateSlug))]
  const templates = await db.specTemplate.findMany({
    where: { slug: { in: templateSlugs } },
    select: { id: true, slug: true, fields: { select: { id: true, key: true } } },
  })
  const missingTemplate = templateSlugs.filter((s) => !templates.some((t) => t.slug === s))
  if (missingTemplate.length > 0) throw new Error(`missing spec template: ${missingTemplate.join(', ')}`)
  const templateBySlug = new Map(
    templates.map((t) => [t.slug, { id: t.id, fieldByKey: new Map(t.fields.map((f) => [f.key, f.id])) }]),
  )

  const brand = await db.brand.findUnique({ where: { slug: 'indus' }, select: { id: true } })
  if (!brand) throw new Error('missing brand indus')

  const problems: string[] = []
  let created = 0
  let updated = 0
  let variantsWritten = 0
  let imagesAttached = 0
  const withoutImage: string[] = []

  for (const e of entries) {
    const categoryId = categoryIdBySlug.get(e.categorySlug)!
    const template = templateBySlug.get(e.specTemplateSlug)!
    const aliases = e.variants.map((v) => v.partNumber)

    let product = await db.product.findUnique({
      where: { sku: e.sku },
      select: {
        id: true,
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
        searchAliases: true,
        _count: { select: { images: true } },
      },
    })

    if (dryRun) {
      console.log(
        `[dry-run] ${product ? 'update' : 'create'} ${e.sku} — ${e.title} ` +
          `(${e.variants.length} sizes, from ${e.sourceFamily})`,
      )
      product ? updated++ : created++
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
          searchAliases: mergeAliases(null, aliases),
          status: publish ? 'active' : 'draft',
          unitOfMeasure: 'each',
          leadTimeDays: 7,
        },
        select: {
          id: true,
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
          searchAliases: true,
          _count: { select: { images: true } },
        },
      })
      created++
    } else {
      await db.product.update({
        where: { id: product.id },
        data: {
          categoryId,
          brandId: brand.id,
          specTemplateId: template.id,
          searchAliases: mergeAliases(product.searchAliases, aliases),
          // Only ever promotes — a listing an editor retired stays retired.
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
      if (refreshCopy) {
        product.descriptionShort = e.descriptionShort
        product.descriptionLong = e.descriptionLong
        product.seoTitle = e.seoTitle
        product.seoDescription = e.seoDescription
        product.focusKeyword = e.focusKeyword
      }
      updated++
    }

    const productId = product.id

    // Points at the Media row an existing listing already uses — a join, not a
    // copy, so nothing is uploaded and deleting either listing leaves the file.
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
          await db.productImage.create({ data: { productId, mediaId, position: 0, alt: e.title } })
          imagesAttached++
        }
      }
    }

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
          })),
        })
      },
      { maxWait: 30_000, timeout: 30_000 },
    )
    variantsWritten += e.variants.length

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
                templateFieldId: s.templateKey ? (template.fieldByKey.get(s.templateKey) ?? null) : null,
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
  }

  console.log(
    `\n[${payloadName}] done — ${created} listings created, ${updated} updated, ` +
      `${variantsWritten} sizes written, ${imagesAttached} images attached, ` +
      `${problems.length} problems`,
  )
  if (!publish) console.log('  · listings are DRAFT — re-run with --publish to make them public.')
  if (withoutImage.length > 0) console.log(`  · no render available: ${withoutImage.join(', ')}`)
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
