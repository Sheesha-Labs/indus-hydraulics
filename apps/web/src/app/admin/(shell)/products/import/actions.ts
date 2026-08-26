'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { db, Prisma } from '@indus/db'
import { coerceFieldValue, validateRequiredFields, type SpecFieldDataType } from '@indus/domain'
import { auth } from '../../../../../lib/admin-auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../lib/result'
import { PRODUCT_IMPORT_COLUMNS, REQUIRED_KEYS, SPEC_ATTR_PREFIX } from './columns'

// ── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_ROWS = 5000

const CURRENCIES = ['USD', 'EUR', 'AED', 'SAR'] as const
const UOMS = ['each', 'metre', 'kit', 'set'] as const
const STATUSES = ['draft', 'active', 'discontinued'] as const

// ── Row schema ──────────────────────────────────────────────────────────────

// Direct Product upsert payload. Keys match Prisma field names so we can
// spread into upsert calls without juggling.
const ProductPayloadSchema = z.object({
  sku: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(200),
  mpn: z.string().trim().max(120).optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  descriptionShort: z.string().trim().max(500).optional().nullable(),
  descriptionLong: z.string().optional().nullable(),
  listPrice: z.number().nonnegative().optional().nullable(),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  listPriceCurrency: z.enum(CURRENCIES).default('USD'),
  unitOfMeasure: z.enum(UOMS).default('each'),
  weightKg: z.number().nonnegative().optional().nullable(),
  leadTimeDays: z.number().int().nonnegative().optional().nullable(),
  warrantyMonths: z.number().int().nonnegative().optional().nullable(),
  stockQty: z.number().int().nonnegative().default(0),
  stockWarehouse: z.string().trim().max(120).optional().nullable(),
  countryOfOrigin: z.string().trim().max(120).optional().nullable(),
  hsCode: z.string().trim().max(40).optional().nullable(),
  status: z.enum(STATUSES).default('draft'),
  seoTitle: z.string().trim().max(200).optional().nullable(),
  seoDescription: z.string().trim().max(500).optional().nullable(),
  specTemplateId: z.string().uuid().optional().nullable(),
  slug: z.string().trim().min(1).max(200),
})

type ProductPayload = z.infer<typeof ProductPayloadSchema>

// Resolved spec value: a pointer to the SpecTemplateField + the canonical
// (post-coercion) string value. The label/unit/group/isFilterable are
// re-derived from the live field at commit time, so we don't carry them here.
type SpecValueEntry = { fieldId: string; key: string; value: string }

type MappedRow = {
  product: ProductPayload
  specValues: SpecValueEntry[]
}

type RowResult =
  | { ok: true; rowNumber: number; raw: Record<string, string>; mapped: MappedRow; existingId: string | null }
  | { ok: false; rowNumber: number; raw: Record<string, string>; messages: string[] }

// ── Helpers ─────────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 180) || `product-${Date.now()}`
  )
}

function parseDecimal(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined
  const cleaned = String(v).replace(/[, ]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}

function parseInteger(v: unknown): number | undefined {
  const n = parseDecimal(v)
  if (n === undefined) return undefined
  return Math.trunc(n)
}

function trimOrNull(v: unknown): string | null {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s.length ? s : null
}

function generateImportCode(): string {
  const ts = new Date()
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14)
  return `IMPORT-${ts}`
}

// Parse a CSV string into rows of {key: value}.
function parseCsv(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
    transform: (v) => (typeof v === 'string' ? v.trim() : v),
  })
  const errors = result.errors.slice(0, 5).map((e) => `${e.type}: ${e.message} (row ~${(e.row ?? 0) + 2})`)
  return { rows: result.data ?? [], errors }
}

// Parse the first sheet of an XLSX buffer into rows of {key: value}.
function parseXlsx(buf: Buffer): { rows: Record<string, string>[]; errors: string[] } {
  try {
    const wb = XLSX.read(buf, { type: 'buffer' })
    const firstSheetName = wb.SheetNames[0]
    if (!firstSheetName) return { rows: [], errors: ['Workbook has no sheets'] }
    const sheet = wb.Sheets[firstSheetName]!
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false })
    const rows = raw.map((r) => {
      const out: Record<string, string> = {}
      for (const [k, v] of Object.entries(r)) {
        const key = k.trim().toLowerCase().replace(/\s+/g, '_')
        out[key] = v == null ? '' : String(v).trim()
      }
      return out
    })
    return { rows, errors: [] }
  } catch (err) {
    return { rows: [], errors: [err instanceof Error ? err.message : 'XLSX parse failed'] }
  }
}

// ── Action: upload + preview ────────────────────────────────────────────────

export async function uploadAndPreviewImport(formData: FormData): Promise<
  Result<{
    jobId: string
    totalRows: number
    rowsToCreate: number
    rowsToUpdate: number
    rowsWithErrors: number
    sample: Array<{ rowNumber: number; sku: string; title: string; outcome: string; messages: string[] }>
  }>
> {
  try {
    const session = requireRole(await auth(), ROLES.CATALOGUE_WRITE)

    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return fail('VALIDATION', 'Pick a CSV or XLSX file to upload', { file: ['File is required'] })
    }
    if (file.size > MAX_FILE_BYTES) {
      return fail('VALIDATION', `File must be under ${MAX_FILE_BYTES / 1024 / 1024} MB`)
    }

    const lowerName = file.name.toLowerCase()
    let parsedRows: Record<string, string>[] = []
    let parseErrors: string[] = []
    if (lowerName.endsWith('.csv')) {
      const text = await file.text()
      const r = parseCsv(text)
      parsedRows = r.rows
      parseErrors = r.errors
    } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      const buf = Buffer.from(await file.arrayBuffer())
      const r = parseXlsx(buf)
      parsedRows = r.rows
      parseErrors = r.errors
    } else {
      return fail('VALIDATION', 'Unsupported file type — use .csv or .xlsx')
    }

    if (parseErrors.length) {
      return fail('VALIDATION', `Parse errors: ${parseErrors.join('; ')}`)
    }
    if (parsedRows.length === 0) {
      return fail('VALIDATION', 'No data rows found — make sure the first row is a header')
    }
    if (parsedRows.length > MAX_ROWS) {
      return fail('VALIDATION', `Too many rows (${parsedRows.length}) — split into files of ≤ ${MAX_ROWS}`)
    }

    // Header check.
    const headerKeys = new Set(Object.keys(parsedRows[0]!))
    const missingRequired = REQUIRED_KEYS.filter((k) => !headerKeys.has(k))
    if (missingRequired.length) {
      return fail(
        'VALIDATION',
        `Missing required column${missingRequired.length > 1 ? 's' : ''}: ${missingRequired.join(', ')}`,
      )
    }

    // Pre-load brand, category, and spec-template slugs → ids in one DB hit each.
    const brandSlugs = new Set<string>()
    const categorySlugs = new Set<string>()
    const templateSlugs = new Set<string>()
    for (const row of parsedRows) {
      const b = trimOrNull(row.brand_slug)
      const c = trimOrNull(row.category_slug)
      const t = trimOrNull(row.spec_template_slug)
      if (b) brandSlugs.add(b)
      if (c) categorySlugs.add(c)
      if (t) templateSlugs.add(t)
    }
    const [brands, categories, templates] = await Promise.all([
      brandSlugs.size
        ? db.brand.findMany({ where: { slug: { in: [...brandSlugs] } }, select: { id: true, slug: true } })
        : Promise.resolve([]),
      categorySlugs.size
        ? db.category.findMany({
            where: { slug: { in: [...categorySlugs] } },
            select: { id: true, slug: true, defaultSpecTemplateId: true },
          })
        : Promise.resolve([]),
      templateSlugs.size
        ? db.specTemplate.findMany({
            where: { slug: { in: [...templateSlugs] } },
            include: { fields: { orderBy: { position: 'asc' } } },
          })
        : Promise.resolve([]),
    ])
    const brandMap = new Map(brands.map((b) => [b.slug, b.id]))
    const categoryMap = new Map(categories.map((c) => [c.slug, c]))
    const templateBySlug = new Map(templates.map((t) => [t.slug, t]))

    // For categories that referenced a default template (via FK), pre-load
    // those templates too — so a row that omits spec_template_slug but has
    // a category with a default still benefits from typed validation.
    const defaultTemplateIds = new Set(
      categories.map((c) => c.defaultSpecTemplateId).filter((id): id is string => !!id),
    )
    if (defaultTemplateIds.size > 0) {
      const defaults = await db.specTemplate.findMany({
        where: { id: { in: [...defaultTemplateIds] } },
        include: { fields: { orderBy: { position: 'asc' } } },
      })
      for (const t of defaults) {
        if (!templateBySlug.has(t.slug)) templateBySlug.set(t.slug, t)
      }
    }
    const templateById = new Map([...templateBySlug.values()].map((t) => [t.id, t]))

    // Pre-load existing SKUs for create-vs-update detection.
    const skus = parsedRows.map((r) => trimOrNull(r.sku)).filter((s): s is string => !!s)
    const existing = skus.length
      ? await db.product.findMany({ where: { sku: { in: skus } }, select: { id: true, sku: true } })
      : []
    const existingMap = new Map(existing.map((p) => [p.sku, p.id]))

    // Validate each row.
    const seenSkus = new Set<string>()
    const seenSlugs = new Set<string>()
    const results: RowResult[] = parsedRows.map((raw, i) => {
      const rowNumber = i + 2 // header is row 1
      const messages: string[] = []

      const sku = trimOrNull(raw.sku) ?? ''
      const title = trimOrNull(raw.title) ?? ''

      if (!sku) messages.push('sku is required')
      if (!title) messages.push('title is required')
      if (sku && seenSkus.has(sku)) messages.push(`duplicate sku within file: ${sku}`)
      if (sku) seenSkus.add(sku)

      // Resolve FKs.
      const brandSlug = trimOrNull(raw.brand_slug)
      let brandId: string | null = null
      if (brandSlug) {
        const id = brandMap.get(brandSlug)
        if (!id) messages.push(`unknown brand_slug: ${brandSlug}`)
        else brandId = id
      }
      const categorySlug = trimOrNull(raw.category_slug)
      let categoryId: string | null = null
      let categoryDefaultTemplateId: string | null = null
      if (categorySlug) {
        const cat = categoryMap.get(categorySlug)
        if (!cat) messages.push(`unknown category_slug: ${categorySlug}`)
        else {
          categoryId = cat.id
          categoryDefaultTemplateId = cat.defaultSpecTemplateId ?? null
        }
      }

      // Resolve spec template — explicit slug wins over the category's default.
      const templateSlug = trimOrNull(raw.spec_template_slug)
      let specTemplateId: string | null = null
      let templateFields: Array<{
        id: string
        key: string
        label: string
        unit: string | null
        dataType: SpecFieldDataType
        options: string[] | null
        isRequired: boolean
      }> = []
      if (templateSlug) {
        const t = templateBySlug.get(templateSlug)
        if (!t) messages.push(`unknown spec_template_slug: ${templateSlug}`)
        else {
          specTemplateId = t.id
          templateFields = t.fields.map((f) => ({
            id: f.id,
            key: f.key,
            label: f.label,
            unit: f.unit,
            dataType: f.dataType as SpecFieldDataType,
            options: (f.options as string[] | null) ?? null,
            isRequired: f.isRequired,
          }))
        }
      } else if (categoryDefaultTemplateId) {
        const t = templateById.get(categoryDefaultTemplateId)
        if (t) {
          specTemplateId = t.id
          templateFields = t.fields.map((f) => ({
            id: f.id,
            key: f.key,
            label: f.label,
            unit: f.unit,
            dataType: f.dataType as SpecFieldDataType,
            options: (f.options as string[] | null) ?? null,
            isRequired: f.isRequired,
          }))
        }
      }

      // Collect attr_* columns and coerce per the field's data type.
      const fieldByKey = new Map(templateFields.map((f) => [f.key, f]))
      const specValues: SpecValueEntry[] = []
      const submittedFieldIds = new Set<string>()
      const seenUnknownAttrs: string[] = []
      for (const [colName, rawValue] of Object.entries(raw)) {
        if (!colName.startsWith(SPEC_ATTR_PREFIX)) continue
        const fieldKey = colName.slice(SPEC_ATTR_PREFIX.length)
        const trimmed = trimOrNull(rawValue) ?? ''
        if (trimmed === '') continue // empty attr_* → leave alone
        if (templateFields.length === 0) {
          // No template attached — record once that attrs are being ignored.
          if (seenUnknownAttrs.length === 0) {
            messages.push(`attr_* column${'s'} present but row has no spec_template_slug or category default template`)
          }
          continue
        }
        const field = fieldByKey.get(fieldKey)
        if (!field) {
          seenUnknownAttrs.push(fieldKey)
          continue
        }
        const coerced = coerceFieldValue(trimmed, field.dataType, field.options)
        if (!coerced.ok) {
          messages.push(`${colName}: ${coerced.reason}`)
          continue
        }
        if (coerced.value === '') continue // coerced to empty (shouldn't happen for non-empty input but defensive)
        specValues.push({ fieldId: field.id, key: field.key, value: coerced.value })
        submittedFieldIds.add(field.id)
      }
      if (seenUnknownAttrs.length > 0) {
        messages.push(
          `unknown attr_* column${seenUnknownAttrs.length === 1 ? '' : 's'} for template: ${seenUnknownAttrs.slice(0, 5).join(', ')}${seenUnknownAttrs.length > 5 ? `, +${seenUnknownAttrs.length - 5} more` : ''}`,
        )
      }

      // Required-field check (server-side; mirrors the editor's check).
      if (templateFields.length > 0) {
        const requiredCheck = validateRequiredFields(
          templateFields.map((f) => ({
            fieldId: f.id,
            value: submittedFieldIds.has(f.id) ? 'x' : '', // empty = missing for the helper
          })),
          templateFields.map((f) => ({ id: f.id, label: f.label, isRequired: f.isRequired })),
        )
        if (!requiredCheck.ok) {
          messages.push(
            `missing required spec field${requiredCheck.missingLabels.length === 1 ? '' : 's'}: ${requiredCheck.missingLabels.join(', ')}`,
          )
        }
      }

      // Numeric coercion.
      const listPrice = parseDecimal(raw.list_price)
      if (raw.list_price && listPrice === undefined) messages.push(`list_price not a number: ${raw.list_price}`)
      const compareAtPrice = parseDecimal(raw.compare_at_price)
      if (raw.compare_at_price && compareAtPrice === undefined) messages.push(`compare_at_price not a number: ${raw.compare_at_price}`)
      if (compareAtPrice != null && listPrice != null && compareAtPrice <= listPrice) {
        messages.push(`compare_at_price (${compareAtPrice}) must be greater than list_price (${listPrice}); leave blank for no MSRP display`)
      }
      const weightKg = parseDecimal(raw.weight_kg)
      if (raw.weight_kg && weightKg === undefined) messages.push(`weight_kg not a number: ${raw.weight_kg}`)
      const leadTimeDays = parseInteger(raw.lead_time_days)
      if (raw.lead_time_days && leadTimeDays === undefined) messages.push(`lead_time_days not an integer`)
      const warrantyMonths = parseInteger(raw.warranty_months)
      if (raw.warranty_months && warrantyMonths === undefined) messages.push(`warranty_months not an integer`)
      const stockQty = parseInteger(raw.stock_qty) ?? 0
      if (raw.stock_qty && parseInteger(raw.stock_qty) === undefined) messages.push(`stock_qty not an integer`)

      // Slug — derive from title if not provided, dedupe within file.
      let slug = trimOrNull(raw.slug ?? '') ?? slugify(title || sku)
      let n = 1
      const baseSlug = slug
      while (seenSlugs.has(slug)) {
        n += 1
        slug = `${baseSlug}-${n}`
      }
      seenSlugs.add(slug)

      if (messages.length) {
        return { ok: false, rowNumber, raw, messages }
      }

      const parse = ProductPayloadSchema.safeParse({
        sku,
        title,
        mpn: trimOrNull(raw.mpn),
        brandId,
        categoryId,
        descriptionShort: trimOrNull(raw.description_short),
        descriptionLong: trimOrNull(raw.description_long),
        listPrice,
        compareAtPrice,
        listPriceCurrency: (trimOrNull(raw.currency) ?? 'USD').toUpperCase(),
        unitOfMeasure: (trimOrNull(raw.unit_of_measure) ?? 'each').toLowerCase(),
        weightKg,
        leadTimeDays,
        warrantyMonths,
        stockQty,
        stockWarehouse: trimOrNull(raw.stock_warehouse),
        countryOfOrigin: trimOrNull(raw.country_of_origin),
        hsCode: trimOrNull(raw.hs_code),
        status: (trimOrNull(raw.status) ?? 'draft').toLowerCase(),
        seoTitle: trimOrNull(raw.seo_title),
        seoDescription: trimOrNull(raw.seo_description),
        specTemplateId,
        slug,
      })
      if (!parse.success) {
        const errs = parse.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
        return { ok: false, rowNumber, raw, messages: errs }
      }
      if (messages.length > 0) {
        // Spec validation errors accumulated above — surface them now even
        // though the product schema parsed cleanly.
        return { ok: false, rowNumber, raw, messages }
      }
      return {
        ok: true,
        rowNumber,
        raw,
        mapped: { product: parse.data, specValues },
        existingId: existingMap.get(sku) ?? null,
      }
    })

    const rowsToCreate = results.filter((r) => r.ok && !r.existingId).length
    const rowsToUpdate = results.filter((r) => r.ok && r.existingId).length
    const rowsWithErrors = results.filter((r) => !r.ok).length

    // Persist as an ImportJob + ImportJobRows.
    const job = await db.importJob.create({
      data: {
        code: generateImportCode(),
        entity: 'product',
        status: 'previewing',
        totalRows: results.length,
        rowsToCreate,
        rowsToUpdate,
        rowsWithErrors,
        startedById: session.user.id,
        rows: {
          create: results.map((r) => ({
            rowNumber: r.rowNumber,
            rawData: r.raw as Prisma.InputJsonValue,
            mappedData: r.ok ? (r.mapped as Prisma.InputJsonValue) : undefined,
            outcome: r.ok ? (r.existingId ? 'updated' : 'created') : 'error',
            entityId: r.ok ? r.existingId : null,
            messages: r.ok ? [] : (r.messages as Prisma.InputJsonValue),
          })),
        },
      },
    })

    const sample = results.slice(0, 50).map((r) => {
      const baseOutcome = r.ok ? (r.existingId ? 'will update' : 'will create') : 'error'
      const specCount = r.ok ? r.mapped.specValues.length : 0
      return {
        rowNumber: r.rowNumber,
        sku: trimOrNull(r.raw.sku) ?? '(missing)',
        title: trimOrNull(r.raw.title) ?? '(missing)',
        outcome: r.ok && specCount > 0 ? `${baseOutcome} + ${specCount} spec${specCount === 1 ? '' : 's'}` : baseOutcome,
        messages: r.ok ? [] : r.messages,
      }
    })

    return ok({
      jobId: job.id,
      totalRows: results.length,
      rowsToCreate,
      rowsToUpdate,
      rowsWithErrors,
      sample,
    })
  } catch (err) {
    return failFromError(err)
  }
}

// ── Action: commit ──────────────────────────────────────────────────────────

export async function commitProductImport(jobId: string): Promise<Result<{ created: number; updated: number; failed: number }>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(jobId)

    const job = await db.importJob.findUnique({
      where: { id: jobId },
      include: { rows: { where: { outcome: { in: ['created', 'updated'] } } } },
    })
    if (!job) return fail('NOT_FOUND', 'Import job not found')
    if (job.status !== 'previewing') return fail('PRECONDITION_FAILED', `Job is in status ${job.status}, expected previewing`)

    await db.importJob.update({ where: { id: jobId }, data: { status: 'committing', startedAt: new Date() } })

    let created = 0
    let updated = 0
    let failed = 0

    // Pre-load every template field referenced across the job so we can stamp
    // label/unit/group/isQuickSpec onto the ProductSpec rows from the live
    // template (rather than carrying a stale snapshot in mappedData).
    const referencedFieldIds = new Set<string>()
    for (const r of job.rows) {
      const m = r.mappedData as MappedRow | null
      if (!m?.specValues) continue
      for (const sv of m.specValues) referencedFieldIds.add(sv.fieldId)
    }
    const fieldDefs = referencedFieldIds.size
      ? await db.specTemplateField.findMany({
          where: { id: { in: [...referencedFieldIds] } },
          select: { id: true, label: true, unit: true, group: true, isQuickSpec: true },
        })
      : []
    const fieldDefById = new Map(fieldDefs.map((f) => [f.id, f]))

    // Process in batches of 50 — small enough to avoid Prisma transaction timeouts on slow connections,
    // big enough to keep total round-trips low for 1000+ rows.
    const BATCH = 50
    for (let i = 0; i < job.rows.length; i += BATCH) {
      const batch = job.rows.slice(i, i + BATCH)
      await Promise.all(
        batch.map(async (r) => {
          const mapped = r.mappedData as MappedRow
          const productData = mapped.product
          try {
            const result = await db.$transaction(async (tx) => {
              const product = await tx.product.upsert({
                where: { sku: productData.sku },
                create: productData,
                update: { ...productData, sku: undefined }, // never change the unique key
              })

              // Upsert ProductSpec rows for the templated values. We don't
              // have a (productId, templateFieldId) unique constraint so
              // we go via findFirst → update / create.
              for (const sv of mapped.specValues ?? []) {
                const def = fieldDefById.get(sv.fieldId)
                if (!def) continue // template field deleted between preview and commit
                const existing = await tx.productSpec.findFirst({
                  where: { productId: product.id, templateFieldId: sv.fieldId },
                  select: { id: true, position: true },
                })
                const data = {
                  group: def.group ?? 'General',
                  label: def.label,
                  value: sv.value,
                  unit: def.unit,
                  isFilterable: def.isQuickSpec,
                }
                if (existing) {
                  await tx.productSpec.update({ where: { id: existing.id }, data })
                } else {
                  const max = await tx.productSpec.aggregate({
                    where: { productId: product.id },
                    _max: { position: true },
                  })
                  await tx.productSpec.create({
                    data: {
                      productId: product.id,
                      templateFieldId: sv.fieldId,
                      position: (max._max.position ?? -1) + 1,
                      ...data,
                    },
                  })
                }
              }
              return product
            })
            await db.importJobRow.update({
              where: { id: r.id },
              data: { entityId: result.id, outcome: r.outcome },
            })
            if (r.outcome === 'created') created += 1
            else updated += 1
          } catch (err) {
            failed += 1
            await db.importJobRow.update({
              where: { id: r.id },
              data: {
                outcome: 'error',
                messages: [err instanceof Error ? err.message : 'unknown error'] as Prisma.InputJsonValue,
              },
            })
          }
        }),
      )
    }

    await db.importJob.update({
      where: { id: jobId },
      data: {
        status: failed > 0 ? 'completed' : 'completed', // we don't fail the whole job for individual row errors
        completedAt: new Date(),
        rowsWithErrors: job.rowsWithErrors + failed,
      },
    })

    revalidatePath(`/admin/products`)
    revalidatePath(`/admin/products/import`)
    // An import lands rows in any number of categories, and the shelves are
    // prerendered — without this the imported SKUs would be live on their own
    // pages and missing from every category listing until the shelves expired.
    // The route pattern rather than a list of slugs, because the job does not
    // track which categories it touched.
    revalidatePath('/c/[slug]', 'page')
    revalidatePath('/p/[slug]', 'page')
    return ok({ created, updated, failed })
  } catch (err) {
    return failFromError(err)
  }
}

// ── Action: cancel preview ──────────────────────────────────────────────────

export async function cancelImportPreview(jobId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.CATALOGUE_WRITE)
    z.string().uuid().parse(jobId)
    const job = await db.importJob.findUnique({ where: { id: jobId }, select: { status: true } })
    if (!job) return ok(undefined) // already gone
    if (job.status !== 'previewing') return fail('PRECONDITION_FAILED', `Cannot cancel a ${job.status} job`)
    // Rows have ON DELETE CASCADE → drop the parent.
    await db.importJob.delete({ where: { id: jobId } })
    revalidatePath(`/admin/products/import`)
    return ok(undefined)
  } catch (err) {
    return failFromError(err)
  }
}

// ── Template CSV (string returned to client for download) ───────────────────

export async function getImportTemplateCsv(): Promise<string> {
  // Pull a real template's field list so the downloadable CSV demonstrates
  // the attr_* convention against actual data the user can see in the admin.
  // Fall back to a generic header-only template if no spec templates exist yet.
  const firstTemplate = await db.specTemplate.findFirst({
    orderBy: { createdAt: 'asc' },
    include: { fields: { orderBy: { position: 'asc' } } },
  })
  const attrCols = firstTemplate
    ? firstTemplate.fields.map((f) => `${SPEC_ATTR_PREFIX}${f.key}`)
    : []
  const exampleAttrValuesByKey = new Map<string, string>(
    firstTemplate?.fields.map((f) => {
      // Emit a sensible example per data type.
      switch (f.dataType) {
        case 'number':
          return [f.key, '0']
        case 'boolean':
          return [f.key, 'no']
        case 'select':
          return [f.key, ((f.options as string[] | null) ?? [])[0] ?? '']
        default:
          return [f.key, '']
      }
    }) ?? [],
  )

  const allCols = [...PRODUCT_IMPORT_COLUMNS.map((c) => c.key), ...attrCols]

  const csvEscape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v)
  const header = allCols.map(csvEscape).join(',')

  // Row 1 — fully populated example
  const row1 = allCols.map((col) => {
    if (col.startsWith(SPEC_ATTR_PREFIX)) {
      const key = col.slice(SPEC_ATTR_PREFIX.length)
      return csvEscape(exampleAttrValuesByKey.get(key) ?? '')
    }
    const def = PRODUCT_IMPORT_COLUMNS.find((c) => c.key === col)
    if (col === 'spec_template_slug' && firstTemplate) return csvEscape(firstTemplate.slug)
    return csvEscape(def?.example ?? '')
  })

  // Row 2 — minimum viable
  const row2 = allCols.map((col) => {
    if (col === 'sku') return csvEscape('IH-EXAMPLE-002')
    if (col === 'title') return csvEscape('Example Product 2')
    if (col === 'status') return csvEscape('draft')
    return ''
  })

  return `${header}\n${row1.join(',')}\n${row2.join(',')}\n`
}
