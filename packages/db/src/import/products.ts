import type { Prisma, PrismaClient } from '@prisma/client'
import { coerceFieldValue } from '@indus/domain'
import { sanitiseProductHtml } from './sanitise-html'
import { slugify, dedupeSlugInBatch } from './slug'
import type { FaqEntry, ImportMode, ProductImportPayload } from './types'

type Tx = PrismaClient | Prisma.TransactionClient

export type ProductUpsertResult = {
  id: string
  sku: string
  slug: string
  outcome: 'created' | 'updated'
  specsCreated: number
  specsUpdated: number
  specsSkipped: number
  faqsCreated: number
  faqsSkipped: number
  warnings: string[]
}

/** Resolved relation IDs, looked up once at the batch level. */
export type ProductImportContext = {
  /** Map of brandSlug → brandId (must contain every brandSlug used by products). */
  brandIdBySlug: Map<string, string>
  /** Map of categorySlug → categoryId. */
  categoryIdBySlug: Map<string, string>
  /** Map of categorySlug → that category's defaultSpecTemplateId (or null). */
  categoryDefaultTemplateIdBySlug: Map<string, string | null>
  /** Map of specTemplateSlug → fields[]. */
  templateFieldsBySlug: Map<string, TemplateField[]>
  /** Map of specTemplateSlug → templateId. */
  templateIdBySlug: Map<string, string>
  /** Slugs already claimed within this batch (for in-batch dedupe). */
  slugsClaimed: Set<string>
  mode: ImportMode
}

export type TemplateField = {
  id: string
  key: string
  label: string
  unit: string | null
  dataType: 'text' | 'number' | 'boolean' | 'select'
  options: string[] | null
  group: string | null
  position: number
  isQuickSpec: boolean
  isKeyFeature: boolean
  isRequired: boolean
}

/**
 * Build a fresh `ProductImportContext` from the DB by pre-loading all the
 * referenced brand/category/template rows in a few targeted queries. Run this
 * AFTER preflight upserts so brands/categories/templates exist.
 */
export async function buildImportContext(
  payloads: ProductImportPayload[],
  mode: ImportMode,
  tx: Tx,
): Promise<ProductImportContext> {
  const brandSlugs = new Set<string>()
  const categorySlugs = new Set<string>()
  const templateSlugs = new Set<string>()
  for (const p of payloads) {
    if (p.brandSlug) brandSlugs.add(p.brandSlug)
    if (p.categorySlug) categorySlugs.add(p.categorySlug)
    if (p.specTemplateSlug) templateSlugs.add(p.specTemplateSlug)
  }

  const brands = brandSlugs.size
    ? await tx.brand.findMany({
        where: { slug: { in: [...brandSlugs] } },
        select: { id: true, slug: true },
      })
    : []
  const categories = categorySlugs.size
    ? await tx.category.findMany({
        where: { slug: { in: [...categorySlugs] } },
        select: { id: true, slug: true, defaultSpecTemplateId: true },
      })
    : []
  type LoadedTemplate = Awaited<
    ReturnType<typeof tx.specTemplate.findMany<{ include: { fields: true } }>>
  >[number]
  const templates: LoadedTemplate[] = templateSlugs.size
    ? await tx.specTemplate.findMany({
        where: { slug: { in: [...templateSlugs] } },
        include: { fields: { orderBy: { position: 'asc' } } },
      })
    : []

  // Pull in templates referenced by category defaults too.
  const defaultIds = new Set(
    categories.map((c) => c.defaultSpecTemplateId).filter((id): id is string => !!id),
  )
  if (defaultIds.size > 0) {
    const extra = await tx.specTemplate.findMany({
      where: { id: { in: [...defaultIds] } },
      include: { fields: { orderBy: { position: 'asc' } } },
    })
    for (const t of extra) {
      if (!templates.find((existing) => existing.id === t.id)) templates.push(t)
    }
  }

  const ctx: ProductImportContext = {
    brandIdBySlug: new Map(brands.map((b) => [b.slug, b.id])),
    categoryIdBySlug: new Map(categories.map((c) => [c.slug, c.id])),
    categoryDefaultTemplateIdBySlug: new Map(
      categories.map((c) => [c.slug, c.defaultSpecTemplateId ?? null] as const),
    ),
    templateFieldsBySlug: new Map(
      templates.map((t) => [
        t.slug,
        t.fields.map((f) => ({
          id: f.id,
          key: f.key,
          label: f.label,
          unit: f.unit,
          dataType: f.dataType as TemplateField['dataType'],
          options: (f.options as string[] | null) ?? null,
          group: f.group,
          position: f.position,
          isQuickSpec: f.isQuickSpec,
          isKeyFeature: f.isKeyFeature,
          isRequired: f.isRequired,
        })),
      ]),
    ),
    templateIdBySlug: new Map(templates.map((t) => [t.slug, t.id])),
    slugsClaimed: new Set<string>(),
    mode,
  }
  return ctx
}

/**
 * Upsert a Product + its specs + its FAQs. Wrap caller-side in a transaction.
 *
 * The `mode` field on `ctx` controls re-run behaviour:
 *   - 'add-only' (default): specs/FAQs are added only if not present
 *   - 'overwrite-edits': delete-and-recreate specs/FAQs from the data file
 *   - 'update-only': product row only; specs/FAQs untouched after first creation
 */
export async function upsertProductWithRelations(
  payload: ProductImportPayload,
  ctx: ProductImportContext,
  tx: Tx,
): Promise<ProductUpsertResult> {
  const warnings: string[] = []

  // Resolve brand/category/template ids
  let brandId: string | null = null
  if (payload.brandSlug) {
    brandId = ctx.brandIdBySlug.get(payload.brandSlug) ?? null
    if (!brandId) {
      throw new Error(`Product "${payload.sku}" references unknown brandSlug "${payload.brandSlug}"`)
    }
  }
  let categoryId: string | null = null
  if (payload.categorySlug) {
    categoryId = ctx.categoryIdBySlug.get(payload.categorySlug) ?? null
    if (!categoryId) {
      throw new Error(`Product "${payload.sku}" references unknown categorySlug "${payload.categorySlug}"`)
    }
  }

  // Resolve spec template — explicit slug wins; else fall back to category default.
  let templateId: string | null = null
  let templateFields: TemplateField[] = []
  if (payload.specTemplateSlug) {
    templateId = ctx.templateIdBySlug.get(payload.specTemplateSlug) ?? null
    if (!templateId) {
      throw new Error(
        `Product "${payload.sku}" references unknown specTemplateSlug "${payload.specTemplateSlug}"`,
      )
    }
    templateFields = ctx.templateFieldsBySlug.get(payload.specTemplateSlug) ?? []
  } else if (payload.categorySlug) {
    const catDefault = ctx.categoryDefaultTemplateIdBySlug.get(payload.categorySlug)
    if (catDefault) {
      templateId = catDefault
      // Find by id from any of the loaded templates
      for (const [slug, id] of ctx.templateIdBySlug) {
        if (id === catDefault) {
          templateFields = ctx.templateFieldsBySlug.get(slug) ?? []
          break
        }
      }
    }
  }

  // Slug — derive from title if not provided; dedupe within batch
  let slug = payload.slug ?? slugify(payload.title)
  slug = dedupeSlugInBatch(slug, ctx.slugsClaimed)

  // Sanitise descriptionLong (HTML)
  const descriptionLong = payload.descriptionLong
    ? sanitiseProductHtml(payload.descriptionLong)
    : null

  // SKU collision pre-check — if a row exists with our SKU but a different
  // title or category, that's likely a separate product and we should NOT
  // silently overwrite it. Surface as an error.
  const existing = await tx.product.findUnique({
    where: { sku: payload.sku },
    select: { id: true, title: true, categoryId: true, brandId: true },
  })
  if (existing && ctx.mode !== 'update-only') {
    if (
      existing.title !== payload.title ||
      existing.categoryId !== categoryId ||
      existing.brandId !== brandId
    ) {
      warnings.push(
        `SKU collision: "${payload.sku}" already exists with different title/category/brand. Existing will be overwritten with new values.`,
      )
    }
  }

  const productData = {
    title: payload.title,
    mpn: payload.mpn ?? null,
    slug,
    brandId,
    categoryId,
    descriptionShort: payload.descriptionShort ?? null,
    descriptionLong,
    listPrice: payload.listPrice ?? null,
    compareAtPrice: payload.compareAtPrice ?? null,
    listPriceCurrency: payload.listPriceCurrency,
    unitOfMeasure: payload.unitOfMeasure,
    weightKg: payload.weightKg ?? null,
    leadTimeDays: payload.leadTimeDays ?? null,
    warrantyMonths: payload.warrantyMonths ?? null,
    stockQty: payload.stockQty,
    stockWarehouse: payload.stockWarehouse ?? null,
    countryOfOrigin: payload.countryOfOrigin ?? null,
    hsCode: payload.hsCode ?? null,
    status: payload.status,
    specTemplateId: templateId,
    seoTitle: payload.seoTitle ?? null,
    seoDescription: payload.seoDescription ?? null,
    focusKeyword: payload.focusKeyword ?? null,
  }

  let productId: string
  let outcome: 'created' | 'updated'
  if (existing) {
    const updated = await tx.product.update({
      where: { sku: payload.sku },
      data: productData,
      select: { id: true },
    })
    productId = updated.id
    outcome = 'updated'
  } else {
    const created = await tx.product.create({
      data: { sku: payload.sku, ...productData },
      select: { id: true },
    })
    productId = created.id
    outcome = 'created'
  }

  // Specs
  let specsCreated = 0
  let specsUpdated = 0
  let specsSkipped = 0
  // Zod 4's `z.record(...).optional()` infers `Record<string, ...> | undefined`
  // — narrow with an explicit type on the local so syncSpecs's signature is
  // satisfied.
  const specValues: Record<string, string | number | boolean> = payload.specs ?? {}
  if (ctx.mode === 'update-only') {
    specsSkipped = Object.keys(specValues).length
  } else {
    const result = await syncSpecs(
      productId,
      specValues,
      templateFields,
      ctx.mode,
      tx,
      warnings,
    )
    specsCreated = result.created
    specsUpdated = result.updated
    specsSkipped = result.skipped
  }

  // FAQs
  let faqsCreated = 0
  let faqsSkipped = 0
  if (ctx.mode === 'update-only') {
    faqsSkipped = (payload.faqs ?? []).length
  } else {
    const result = await syncFaqs(productId, payload.faqs ?? [], ctx.mode, tx)
    faqsCreated = result.created
    faqsSkipped = result.skipped
  }

  return {
    id: productId,
    sku: payload.sku,
    slug,
    outcome,
    specsCreated,
    specsUpdated,
    specsSkipped,
    faqsCreated,
    faqsSkipped,
    warnings,
  }
}

/**
 * Sync ProductSpec rows for a product against the template. Each spec value
 * is coerced via `coerceFieldValue` from @indus/domain (using the live
 * template's dataType + options). Group/label/unit/position are copied from
 * the SpecTemplateField — single source of truth.
 *
 * `add-only`: only insert specs not already present (by templateFieldId).
 * `overwrite-edits`: insert if absent, update value if present.
 */
export async function syncSpecs(
  productId: string,
  values: Record<string, string | number | boolean>,
  templateFields: TemplateField[],
  mode: ImportMode,
  tx: Tx,
  warnings: string[],
): Promise<{ created: number; updated: number; skipped: number }> {
  if (templateFields.length === 0 && Object.keys(values).length > 0) {
    warnings.push(
      `Product has spec values but no spec template attached — values ignored: ${Object.keys(values).join(', ')}`,
    )
    return { created: 0, updated: 0, skipped: Object.keys(values).length }
  }

  const fieldByKey = new Map(templateFields.map((f) => [f.key, f]))
  let created = 0
  let updated = 0
  let skipped = 0

  for (const [key, raw] of Object.entries(values)) {
    const field = fieldByKey.get(key)
    if (!field) {
      warnings.push(`Unknown spec key "${key}" — not in template; ignored.`)
      skipped += 1
      continue
    }

    const rawString = typeof raw === 'string' ? raw : String(raw)
    const coerced = coerceFieldValue(rawString, field.dataType, field.options)
    if (!coerced.ok) {
      warnings.push(`Spec "${key}": ${coerced.reason}`)
      skipped += 1
      continue
    }
    if (coerced.value === '') {
      skipped += 1
      continue
    }

    const existingSpec = await tx.productSpec.findFirst({
      where: { productId, templateFieldId: field.id },
      select: { id: true },
    })

    const data = {
      group: field.group ?? 'General',
      label: field.label,
      value: coerced.value,
      unit: field.unit,
      position: field.position,
      isFilterable: field.isQuickSpec || field.isKeyFeature,
    }

    if (existingSpec) {
      if (mode === 'add-only') {
        skipped += 1
      } else {
        await tx.productSpec.update({ where: { id: existingSpec.id }, data })
        updated += 1
      }
    } else {
      await tx.productSpec.create({
        data: { productId, templateFieldId: field.id, ...data },
      })
      created += 1
    }
  }

  return { created, updated, skipped }
}

/**
 * Sync ProductFaq rows. Plain-text Q+A; PDP renders accordion + JSON-LD.
 *
 * `add-only`: skips ALL FAQs if the product already has any (preserves admin
 *   edits — including manual additions, reorderings, and deletions).
 * `overwrite-edits`: deletes existing FAQs and inserts the data file's full set.
 */
export async function syncFaqs(
  productId: string,
  faqs: FaqEntry[],
  mode: ImportMode,
  tx: Tx,
): Promise<{ created: number; skipped: number }> {
  if (faqs.length === 0) return { created: 0, skipped: 0 }

  if (mode === 'overwrite-edits') {
    await tx.productFaq.deleteMany({ where: { productId } })
    const rows = faqs.map((faq, idx) => ({
      productId,
      question: faq.q,
      answer: faq.a,
      position: idx,
    }))
    await tx.productFaq.createMany({ data: rows })
    return { created: rows.length, skipped: 0 }
  }

  // add-only: only insert if the product has zero FAQs.
  const count = await tx.productFaq.count({ where: { productId } })
  if (count > 0) return { created: 0, skipped: faqs.length }

  const rows = faqs.map((faq, idx) => ({
    productId,
    question: faq.q,
    answer: faq.a,
    position: idx,
  }))
  await tx.productFaq.createMany({ data: rows })
  return { created: rows.length, skipped: 0 }
}
