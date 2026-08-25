/**
 * Load the hammer union range from the licensed catalogues.
 *
 * Not the generic importer, because this batch is a rewrite rather than an
 * addition and it needs four things `import-fitting-families.ts` refuses to
 * do on purpose:
 *
 *   1. create the category tree it loads into,
 *   2. create the spec template the listings attach to,
 *   3. rewrite listings that are ALREADY LIVE — including renaming a slug and
 *      leaving a 301 behind when the live slug describes a product the page is
 *      no longer for,
 *   4. delete two duplicates and draft four figures no catalogue covers.
 *
 * WHY IT REWRITES RATHER THAN ADDS
 *
 * Twenty-three hammer union listings were already live, bulk-generated without
 * a catalogue. Their specifications were not sourced from anything: sizes that
 * contradict the manufacturer's table, a temperature range, a material split
 * by pressure class, mill test certificates and lead times that no source
 * states. One of them advertised a 12 in Figure 400 at 4,000 psi, where the
 * source rates that size at 500 psi — an eightfold overstatement on a
 * pressure-containing part.
 *
 * So the specs and FAQs on a rewritten listing are DELETED, not merged. A
 * merge would leave the invented rows sitting beside the sourced ones, which
 * is the worst of the three options.
 *
 * Copy is refreshed by default, for the same reason. `--keep-copy` opts out
 * if a human has since edited a page.
 *
 * Idempotent. Re-running renames nothing that is already renamed, re-creates
 * nothing, and rewrites the same rows to the same values.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/import-hammer-unions.ts \
 *     [--dry-run] [--publish] [--keep-copy] [--only=SKU]
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Prisma, PrismaClient } from '@prisma/client'
import { scoreProductContent } from '@indus/domain'
import { recordSlugRedirect } from '../slug-redirect'

const db = new PrismaClient()

type SpecFieldDef = {
  key: string
  label: string
  unit: string | null
  dataType: 'text' | 'number' | 'boolean' | 'select'
  group: string
  options: string[] | null
  helpText: string | null
  isRequired?: boolean
  isKeyFeature: boolean
  isQuickSpec: boolean
  position: number
}

type CategoryDef = {
  slug: string
  name: string
  parentSlug: string
  position: number
  shortDescription: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
}

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
  weightG: number | null
  pressureBar: number | null
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
  imageFromSku: string | null
  descriptionShort: string
  descriptionLong: string
  seoTitle: string
  seoDescription: string
  faqs: { question: string; answer: string }[]
  specs: Spec[]
  variants: Variant[]
  sourceFamily: string
  /** Live SKU this page replaces, or null for a listing that did not exist. */
  replaces: string | null
}

type Payload = {
  source: string
  categories: CategoryDef[]
  specTemplate: { slug: string; name: string; description: string; position: number; fields: SpecFieldDef[] }
  products: Entry[]
  retirements: { sku: string; intoSku: string; reason: string }[]
  drafts: { sku: string; figure: string; reason: string }[]
}

function words(s: string): number {
  return s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

function mergeAliases(existing: string | null, additions: string[]): string {
  const tokens = new Set((existing ?? '').split(/\s+/).filter(Boolean))
  for (const a of additions) tokens.add(a)
  return [...tokens].join(' ')
}

/**
 * Everything that would be orphaned by deleting a product. Copied in shape
 * from `retire-duplicate-adapters.ts` — a duplicate that someone has since
 * quoted, ordered or linked is not a duplicate we may delete.
 */
async function blockers(productId: string): Promise<string[]> {
  const [rfq, order, saved, blog, nav, superseded] = await Promise.all([
    db.rfqLine.count({ where: { productId } }),
    db.orderLine.count({ where: { productId } }),
    db.savedListItem.count({ where: { productId } }),
    db.blogPostProduct.count({ where: { productId } }),
    db.navMenuItem.count({ where: { productId } }),
    db.product.count({ where: { supersededById: productId } }),
  ])
  const found: string[] = []
  if (rfq) found.push(`${rfq} RFQ line(s)`)
  if (order) found.push(`${order} order line(s)`)
  if (saved) found.push(`${saved} saved-list item(s)`)
  if (blog) found.push(`${blog} blog link(s)`)
  if (nav) found.push(`${nav} menu item(s)`)
  if (superseded) found.push(`${superseded} listing(s) superseded by it`)
  return found
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const publish = argv.includes('--publish')
  const keepCopy = argv.includes('--keep-copy')
  const only = argv.find((a) => a.startsWith('--only='))?.split('=')[1] ?? null

  const payload: Payload = JSON.parse(
    readFileSync(resolve(__dirname, '../../data/hammer-unions/listings.json'), 'utf8'),
  )

  // The storefront layout appends " | Indus Hydraulics"; a seoTitle carrying
  // the site name renders it twice.
  const doubled = payload.products.filter((p) => /indus hydraulics/i.test(p.seoTitle))
  if (doubled.length > 0) {
    throw new Error(`seoTitle must not contain the site name: ${doubled.map((p) => p.sku).join(', ')}`)
  }

  const entries = only ? payload.products.filter((e) => e.sku === only) : payload.products

  // ── Categories ───────────────────────────────────────────────────────────
  // Created here rather than in the generic importer because where a category
  // sits is a decision; the decision was taken and is recorded in the payload.
  const categoryIdBySlug = new Map<string, string>()
  // Payload order is parent-before-child, so a child's parent is either
  // already in the map from this run or already in the database.
  const payloadSlugs = new Set(payload.categories.map((c) => c.slug))
  for (const c of payload.categories) {
    let parentId = categoryIdBySlug.get(c.parentSlug) ?? null
    if (!parentId) {
      const parent = await db.category.findUnique({ where: { slug: c.parentSlug }, select: { id: true } })
      // On a dry run nothing was created, so a parent this run would have
      // created is legitimately absent. Anything else is a real error.
      if (!parent && !(dryRun && payloadSlugs.has(c.parentSlug))) {
        throw new Error(`parent category ${c.parentSlug} does not exist`)
      }
      parentId = parent?.id ?? null
    }
    if (dryRun) {
      const existing = await db.category.findUnique({ where: { slug: c.slug }, select: { id: true } })
      console.log(`[dry-run] ${existing ? 'update' : 'create'} category ${c.slug} under ${c.parentSlug}`)
      if (existing) categoryIdBySlug.set(c.slug, existing.id)
      continue
    }
    if (!parentId) throw new Error(`parent category ${c.parentSlug} does not exist`)
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        parentId: parentId,
        position: c.position,
        shortDescription: c.shortDescription,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        focusKeyword: c.focusKeyword,
        ...(publish ? { isPublished: true } : {}),
      },
      create: {
        slug: c.slug,
        name: c.name,
        parentId: parentId,
        position: c.position,
        shortDescription: c.shortDescription,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        focusKeyword: c.focusKeyword,
        isPublished: publish,
      },
      select: { id: true },
    })
    categoryIdBySlug.set(c.slug, row.id)
  }

  // ── Spec template ────────────────────────────────────────────────────────
  // `key` is the immutable machine name once a ProductSpec references it, so
  // fields are upserted on (templateId, key) and never recreated.
  const t = payload.specTemplate
  const fieldByKey = new Map<string, string>()
  let templateId: string | null = null
  if (!dryRun) {
    const tpl = await db.specTemplate.upsert({
      where: { slug: t.slug },
      update: { name: t.name, description: t.description, position: t.position },
      create: { slug: t.slug, name: t.name, description: t.description, position: t.position },
      select: { id: true },
    })
    for (const f of t.fields) {
      const row = await db.specTemplateField.upsert({
        where: { templateId_key: { templateId: tpl.id, key: f.key } },
        update: {
          label: f.label,
          unit: f.unit,
          dataType: f.dataType,
          group: f.group,
          options: f.options ?? Prisma.DbNull,
          helpText: f.helpText,
          isRequired: f.isRequired ?? false,
          isKeyFeature: f.isKeyFeature,
          isQuickSpec: f.isQuickSpec,
          position: f.position,
        },
        create: {
          templateId: tpl.id,
          key: f.key,
          label: f.label,
          unit: f.unit,
          dataType: f.dataType,
          group: f.group,
          options: f.options ?? Prisma.DbNull,
          helpText: f.helpText,
          isRequired: f.isRequired ?? false,
          isKeyFeature: f.isKeyFeature,
          isQuickSpec: f.isQuickSpec,
          position: f.position,
        },
        select: { id: true },
      })
      fieldByKey.set(f.key, row.id)
    }
    // The two sub-categories default to this template so an admin adding a
    // union by hand starts on the right fields.
    await db.category.updateMany({
      where: { slug: { in: payload.categories.filter((c) => c.slug !== 'hammer-union-suppliers-uae').map((c) => c.slug) } },
      data: { defaultSpecTemplateId: tpl.id },
    })
    templateId = tpl.id
  }

  const brand = await db.brand.findUnique({ where: { slug: 'indus' }, select: { id: true } })
  if (!brand) throw new Error('missing brand indus')

  let created = 0
  let rewritten = 0
  let renamed = 0
  let variantsWritten = 0
  const problems: string[] = []

  for (const e of entries) {
    // The live row this page replaces. Looked up by its OLD sku, because that
    // is what is in the database until this run renames it — and by the new
    // one too, so a second run finds the row it renamed the first time.
    const existing =
      (e.replaces
        ? await db.product.findUnique({ where: { sku: e.replaces }, select: { id: true, slug: true, sku: true } })
        : null) ?? (await db.product.findUnique({ where: { sku: e.sku }, select: { id: true, slug: true, sku: true } }))

    if (dryRun) {
      const what = existing
        ? existing.slug === e.slug
          ? 'rewrite'
          : `rewrite + rename /p/${existing.slug} → /p/${e.slug}`
        : 'create'
      console.log(`[dry-run] ${what}  ${e.sku}  ${e.title}  (${e.variants.length} sizes)`)
      if (existing) rewritten++
      else created++
      continue
    }

    const categoryId = categoryIdBySlug.get(e.categorySlug)
    if (!categoryId) throw new Error(`category ${e.categorySlug} was not created`)
    const template = templateId
    if (!template) throw new Error('spec template was not created')

    const aliases = e.variants.map((v) => v.partNumber)
    let productId: string

    if (!existing) {
      const row = await db.product.create({
        data: {
          sku: e.sku,
          slug: e.slug,
          title: e.title,
          categoryId,
          brandId: brand.id,
          specTemplateId: template,
          descriptionShort: e.descriptionShort,
          descriptionLong: e.descriptionLong,
          seoTitle: e.seoTitle,
          seoDescription: e.seoDescription,
          focusKeyword: e.focusKeyword,
          // Cleared, not set. The bulk generation that invented the pressure
          // figures also stamped a country of origin: 19 of the 23 said "UAE",
          // two said "USA", twelve were blank, and neither catalogue states an
          // origin for any figure. An origin is a customs declaration, and one
          // sitting beside sourced specifications reads as equally sourced.
          // Blank means "ask us", which is the truth until the supplier
          // confirms the mill.
          countryOfOrigin: null,
          searchAliases: mergeAliases(null, aliases),
          status: publish ? 'active' : 'draft',
          unitOfMeasure: 'each',
          leadTimeDays: 7,
        },
        select: { id: true },
      })
      productId = row.id
      created++
    } else {
      productId = existing.id
      await db.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: productId },
          data: {
            sku: e.sku,
            slug: e.slug,
            categoryId,
            brandId: brand.id,
            specTemplateId: template,
            // Cleared, not set. The bulk generation that invented the pressure
            // figures also stamped a country of origin: 19 of the 23 said "UAE",
            // two said "USA", twelve were blank, and neither catalogue states an
            // origin for any figure. An origin is a customs declaration, and one
            // sitting beside sourced specifications reads as equally sourced.
            // Blank means "ask us", which is the truth until the supplier
            // confirms the mill.
            countryOfOrigin: null,
            searchAliases: mergeAliases(null, aliases),
            ...(publish ? { status: 'active' as const } : {}),
            ...(keepCopy
              ? {}
              : {
                  title: e.title,
                  descriptionShort: e.descriptionShort,
                  descriptionLong: e.descriptionLong,
                  seoTitle: e.seoTitle,
                  seoDescription: e.seoDescription,
                  focusKeyword: e.focusKeyword,
                }),
          },
        })
        if (existing.slug !== e.slug) {
          await recordSlugRedirect(tx, {
            fromPath: `/p/${existing.slug}`,
            toPath: `/p/${e.slug}`,
            notes: `${existing.sku} rewritten from the hammer union catalogues as ${e.sku}; the old slug named an end type or service class this page is not for. 2026-08-25`,
          })
          renamed++
        }
      })
      rewritten++
    }

    // Specs and FAQs are REPLACED, not merged. See the header: what is there
    // was generated without a source, and a merge would leave it in place.
    await db.$transaction(
      async (tx) => {
        await tx.productSpec.deleteMany({ where: { productId } })
        await tx.productFaq.deleteMany({ where: { productId } })
        await tx.productVariant.deleteMany({ where: { productId } })

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
          data: e.faqs.map((f, i) => ({
            productId,
            question: f.question,
            answer: f.answer,
            position: i,
          })),
        })
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
            weightG: v.weightG,
            pressureBar: v.pressureBar,
            dimensions: v.dimensions as Prisma.InputJsonValue,
          })),
        })
      },
      { maxWait: 30_000, timeout: 30_000 },
    )
    variantsWritten += e.variants.length

    const [faqCount, specCount, documentCount, imageCount, crossReferenceCount, fresh] =
      await Promise.all([
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

  // ── Retirements ──────────────────────────────────────────────────────────
  let retired = 0
  if (!only) {
    for (const r of payload.retirements) {
      const dupe = await db.product.findUnique({
        where: { sku: r.sku },
        select: { id: true, slug: true, _count: { select: { variants: true } } },
      })
      if (!dupe) continue
      if (dupe._count.variants > 0) {
        throw new Error(
          `${r.sku} has ${dupe._count.variants} sizes of its own — it is not an empty duplicate, ` +
            `so retiring it would delete data.`,
        )
      }
      const held = await blockers(dupe.id)
      if (held.length > 0) throw new Error(`${r.sku} is referenced by ${held.join(', ')} — refusing to delete it`)

      const keep = await db.product.findUnique({
        where: { sku: r.intoSku },
        select: { slug: true, status: true, _count: { select: { variants: true } } },
      })
      if (!keep) throw new Error(`${r.sku}: its replacement ${r.intoSku} does not exist`)
      // The survivor must carry the table, or the redirect lands the visitor
      // somewhere emptier than where they started. On a dry run the table has
      // not been written yet, so the payload answers for it.
      const willHaveTable =
        keep._count.variants > 0 ||
        (dryRun && (payload.products.find((p) => p.sku === r.intoSku)?.variants.length ?? 0) > 0)
      if (!willHaveTable) {
        throw new Error(`${r.sku}: its replacement ${r.intoSku} has no size table yet`)
      }
      console.log(`${dryRun ? '[dry-run] ' : ''}retire /p/${dupe.slug} → /p/${keep.slug}  (${r.reason})`)
      if (!dryRun) {
        await db.$transaction(async (tx) => {
          await tx.product.delete({ where: { id: dupe.id } })
          await recordSlugRedirect(tx, {
            fromPath: `/p/${dupe.slug}`,
            toPath: `/p/${keep.slug}`,
            notes: `${r.sku}: ${r.reason} Retired 2026-08-25.`,
          })
        })
      }
      retired++
    }
  }

  // ── Drafts ───────────────────────────────────────────────────────────────
  // Figures our catalogue lists that neither licensed book covers. Their live
  // copy states pressures, sizes, materials and temperatures nothing sourced.
  // Drafting is the only honest option: rewriting them would mean inventing
  // the same specifications again, and leaving them live keeps unsourced
  // pressure figures in front of buyers.
  let drafted = 0
  if (!only) {
    for (const d of payload.drafts) {
      const p = await db.product.findUnique({ where: { sku: d.sku }, select: { id: true, status: true, slug: true } })
      if (!p || p.status === 'draft') continue
      console.log(`${dryRun ? '[dry-run] ' : ''}draft /p/${p.slug}  (Figure ${d.figure}: no catalogue source)`)
      if (!dryRun) await db.product.update({ where: { id: p.id }, data: { status: 'draft' } })
      drafted++
    }
  }

  // ── Megamenu ─────────────────────────────────────────────────────────────
  // Gated behind --publish, and only because of a trap the crimp import found
  // the hard way: the nav resolver does NOT check `Category.isPublished`. It
  // links whatever a menu item points at, so creating the entry before the
  // category is live puts a working link to an empty page on the storefront.
  //
  // One entry, not three. `/c/hammer-union-suppliers-uae` rolls up its two
  // sub-categories, and the "Flow Iron & Wellhead" column is already nine
  // items deep against a thirteen-item ceiling.
  let navAdded = 0
  if (publish && !only && !dryRun) {
    const column = await db.navMenuItem.findFirst({
      where: { label: 'Flow Iron & Wellhead', menu: { location: 'primary_megamenu' } },
      select: { id: true, menuId: true },
    })
    const parentCat = await db.category.findUnique({
      where: { slug: 'hammer-union-suppliers-uae' },
      select: { id: true },
    })
    if (!column || !parentCat) {
      problems.push('megamenu column "Flow Iron & Wellhead" not found — nav entry not created')
    } else {
      const already = await db.navMenuItem.findFirst({
        where: { parentId: column.id, categoryId: parentCat.id },
        select: { id: true },
      })
      if (!already) {
        // Slot in after "Fittings" so it sits inside the flow-iron group
        // rather than under the "Wellhead Systems" sub-heading below it.
        await db.$transaction(async (tx) => {
          await tx.navMenuItem.updateMany({
            where: { parentId: column.id, position: { gte: 3 } },
            data: { position: { increment: 1 } },
          })
          await tx.navMenuItem.create({
            data: {
              menuId: column.menuId,
              parentId: column.id,
              label: 'Hammer Unions',
              linkType: 'category',
              categoryId: parentCat.id,
              position: 3,
            },
          })
        })
        navAdded = 1
      }
    }
  }

  console.log(
    `\n[hammer-unions] ${created} created, ${rewritten} rewritten, ${renamed} slugs moved (301), ` +
      `${variantsWritten} sizes, ${retired} retired, ${drafted} drafted, ${navAdded} nav entry, ` +
      `${problems.length} problems`,
  )
  if (!publish) console.log('  · listings and categories are DRAFT — re-run with --publish.')
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
