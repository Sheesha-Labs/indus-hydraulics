/**
 * Types and Zod schemas for the bulk-product import library.
 *
 * Used by:
 *   - The CLI (cli.ts) — loads a TS data file matching `ImportBatch`
 *   - The (future) admin importer refactor — will accept the same shapes
 *
 * Schema conventions:
 *   - Slugs are kebab-case strings, validated by `SlugSchema`.
 *   - All fields default to schema-level Prisma defaults if omitted.
 *   - `descriptionLong` is HTML — runs through `sanitiseProductHtml` at import.
 *   - Brand/category/spec-template references inside `products[]` use slugs;
 *     the importer resolves slugs → ids in a single up-front query.
 */
import { z } from 'zod'

// ── Common ─────────────────────────────────────────────────────────────────

export const SlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')

const NonEmptyTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)

// Specs/FAQs re-run policy.
//   add-only         — default. Insert specs/FAQs only if not already present;
//                       NEVER replaces existing ones.
//   overwrite-edits  — Delete-and-recreate specs/FAQs from the data file.
//                       Risk: clobbers admin manual edits.
//   update-only      — Touch the Product row only. Specs/FAQs left entirely
//                       alone after first creation.
export const ImportModeSchema = z.enum([
  'add-only',
  'overwrite-edits',
  'update-only',
])
export type ImportMode = z.infer<typeof ImportModeSchema>

// ── Brand ──────────────────────────────────────────────────────────────────

export const BrandPayloadSchema = z.object({
  slug: SlugSchema,
  name: NonEmptyTrimmed(120),
  country: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  isAuthorizedDistributor: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  seoTitle: z.string().trim().max(200).optional().nullable(),
  seoDescription: z.string().trim().max(500).optional().nullable(),
})
export type BrandPayload = z.infer<typeof BrandPayloadSchema>

// ── Category ───────────────────────────────────────────────────────────────

export const CategoryPayloadSchema = z.object({
  slug: SlugSchema,
  name: NonEmptyTrimmed(120),
  parentSlug: SlugSchema.optional().nullable(),
  shortDescription: z.string().trim().max(500).optional().nullable(),
  position: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(true),
  /** When set, links the new category to an existing or just-upserted spec
   *  template. Value is the spec-template slug, NOT id — resolved at import. */
  defaultSpecTemplateSlug: SlugSchema.optional().nullable(),
  seoTitle: z.string().trim().max(200).optional().nullable(),
  seoDescription: z.string().trim().max(500).optional().nullable(),
})
export type CategoryPayload = z.infer<typeof CategoryPayloadSchema>

// ── Spec template ──────────────────────────────────────────────────────────

export const SpecFieldDataTypeSchema = z.enum([
  'text',
  'number',
  'boolean',
  'select',
])
export type SpecFieldDataType = z.infer<typeof SpecFieldDataTypeSchema>

/** Lowercase kebab/snake key for SpecTemplateField.key. Immutable once any
 *  ProductSpec references it. */
export const FieldKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z][a-z0-9_]*$/, 'Field key must be lowercase letters/digits/underscores, starting with a letter')

export const SpecTemplateFieldPayloadSchema = z.object({
  key: FieldKeySchema,
  label: NonEmptyTrimmed(120),
  unit: z.string().trim().max(40).optional().nullable(),
  dataType: SpecFieldDataTypeSchema.default('text'),
  options: z.array(z.string().trim().min(1).max(120)).optional().nullable(),
  helpText: z.string().trim().max(500).optional().nullable(),
  isRequired: z.boolean().default(false),
  isKeyFeature: z.boolean().default(false),
  isQuickSpec: z.boolean().default(false),
  group: z.string().trim().max(80).optional().nullable(),
  position: z.number().int().nonnegative().default(0),
})
export type SpecTemplateFieldPayload = z.infer<
  typeof SpecTemplateFieldPayloadSchema
>

export const SpecTemplatePayloadSchema = z.object({
  slug: SlugSchema,
  name: NonEmptyTrimmed(120),
  description: z.string().trim().max(500).optional().nullable(),
  position: z.number().int().nonnegative().default(0),
  fields: z.array(SpecTemplateFieldPayloadSchema).min(1),
})
export type SpecTemplatePayload = z.infer<typeof SpecTemplatePayloadSchema>

// ── Product ────────────────────────────────────────────────────────────────

export const FaqEntrySchema = z.object({
  q: NonEmptyTrimmed(2000),
  a: NonEmptyTrimmed(4000),
})
export type FaqEntry = z.infer<typeof FaqEntrySchema>

const CurrencySchema = z.enum(['USD', 'INR', 'EUR', 'AED', 'SAR'])
const UnitOfMeasureSchema = z.enum(['each', 'metre', 'kit', 'set'])
const ProductStatusSchema = z.enum(['draft', 'active', 'discontinued'])

export const ProductImportPayloadSchema = z.object({
  // Identity
  sku: z.string().trim().min(1).max(64),
  title: NonEmptyTrimmed(255),
  mpn: z.string().trim().max(120).optional().nullable(),
  /** Optional explicit slug. If omitted, slugify(title) is used. */
  slug: SlugSchema.optional().nullable(),

  // Relations (by slug — resolved to ids at import time)
  brandSlug: SlugSchema.optional().nullable(),
  categorySlug: SlugSchema.optional().nullable(),
  specTemplateSlug: SlugSchema.optional().nullable(),

  // Marketing copy
  descriptionShort: z.string().trim().max(500).optional().nullable(),
  /** HTML (sanitised at import time). The schema comment says
   *  "markdown/rich text" but the PDP renders raw HTML. */
  descriptionLong: z.string().optional().nullable(),

  // Commerce
  listPrice: z.number().nonnegative().optional().nullable(),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  listPriceCurrency: CurrencySchema.default('USD'),
  unitOfMeasure: UnitOfMeasureSchema.default('each'),

  // Logistics
  weightKg: z.number().nonnegative().optional().nullable(),
  leadTimeDays: z.number().int().nonnegative().optional().nullable(),
  warrantyMonths: z.number().int().nonnegative().optional().nullable(),
  stockQty: z.number().int().nonnegative().default(0),
  stockWarehouse: z.string().trim().max(120).optional().nullable(),
  countryOfOrigin: z.string().trim().max(120).optional().nullable(),
  hsCode: z.string().trim().max(40).optional().nullable(),

  // Lifecycle
  status: ProductStatusSchema.default('draft'),

  // Specs — keyed by SpecTemplateField.key. Values are coerced via
  // coerceFieldValue at import time (using the live template's dataType).
  // Numeric values can be passed as `number`; strings/booleans as `string`.
  specs: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),

  // FAQs (plain-text q/a; PDP renders accordion + JSON-LD)
  faqs: z.array(FaqEntrySchema).max(20).optional(),

  // SEO
  seoTitle: z.string().trim().max(200).optional().nullable(),
  seoDescription: z.string().trim().max(500).optional().nullable(),
  focusKeyword: z.string().trim().max(120).optional().nullable(),
})
export type ProductImportPayload = z.infer<typeof ProductImportPayloadSchema>

// ── Navigation ─────────────────────────────────────────────────────────────

export const NavReplaceLeavesSchema = z.object({
  /** Currently only 'primary_megamenu' supported; extend to footer_main / etc. as needed. */
  menuLocation: z.literal('primary_megamenu'),
  /** Slug of the parent column. We find the NavMenuItem whose linkType=category
   *  and whose categoryId resolves to this slug under the megamenu. */
  parentColumnCategorySlug: SlugSchema,
  /** Label of the sub-section under the column (string match — case-sensitive). */
  parentSubLabel: NonEmptyTrimmed(80),
  /** When true, create the top-level column under the megamenu if it doesn't
   *  already exist (rather than warning and skipping). Use this to introduce
   *  a brand-new megamenu column in a single import (paired with
   *  createSubSectionIfMissing to populate the heading row inside it).
   *  The column is created as `linkType: 'category'` linking to the
   *  `parentColumnCategorySlug` category. Default: false. */
  createColumnIfMissing: z.boolean().optional(),
  /** Position of the column among its siblings when createColumnIfMissing
   *  fires. Default: append after existing columns. Ignored when the column
   *  already exists. */
  newColumnPosition: z.number().int().nonnegative().optional(),
  /** Label to use for the new column heading when createColumnIfMissing fires.
   *  Default: derive from the column category's name. Ignored when the column
   *  already exists. */
  newColumnLabel: NonEmptyTrimmed(80).optional(),
  /** When true, create the sub-section under the column if it doesn't already
   *  exist (rather than warning and skipping). Use this to introduce a brand-
   *  new megamenu sub-section in a single import. Default: false. */
  createSubSectionIfMissing: z.boolean().optional(),
  /** Position of the sub-section among its siblings when createSubSectionIfMissing
   *  fires. Default: append after existing siblings. Ignored when the sub-section
   *  already exists. */
  newSubSectionPosition: z.number().int().nonnegative().optional(),
  /** New leaves to insert. The CURRENT leaves under the matched sub-item are
   *  deleted first. */
  replacements: z
    .array(
      z.object({
        label: NonEmptyTrimmed(80),
        categorySlug: SlugSchema,
      }),
    )
    .min(1),
})
export type NavReplaceLeavesConfig = z.infer<typeof NavReplaceLeavesSchema>

// ── Top-level ──────────────────────────────────────────────────────────────

export const ImportBatchSchema = z.object({
  meta: z.object({
    /** Free-form id, e.g. '2026-05-07-hoses' — written into the changelog. */
    id: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500),
  }),
  /** Brands to upsert before product upserts begin. */
  brands: z.array(BrandPayloadSchema).default([]),
  /** Categories to upsert (parentSlug-aware; ordering doesn't matter — a
   *  topo sort runs at import time so children resolve their parent). */
  categories: z.array(CategoryPayloadSchema).default([]),
  /** Spec templates to upsert. Categories' `defaultSpecTemplateSlug` are
   *  wired AFTER both spec templates and categories exist. */
  specTemplates: z.array(SpecTemplatePayloadSchema).default([]),
  /** Megamenu linking. Optional. */
  navigation: NavReplaceLeavesSchema.optional(),
  /** The products. */
  products: z.array(ProductImportPayloadSchema).min(1),
})
export type ImportBatch = z.infer<typeof ImportBatchSchema>

// ── Summary ────────────────────────────────────────────────────────────────

export type ImportSummary = {
  brands: { created: number; updated: number }
  categories: { created: number; updated: number }
  specTemplates: { created: number; updated: number }
  specTemplateFields: { created: number; updated: number }
  products: { created: number; updated: number }
  productSpecs: { created: number; updated: number; skipped: number }
  productFaqs: { created: number; skipped: number }
  navigation: { leavesDeleted: number; leavesInserted: number }
  warnings: string[]
}
