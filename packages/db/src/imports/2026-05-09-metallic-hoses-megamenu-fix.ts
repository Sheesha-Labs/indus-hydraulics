/**
 * Metallic Hoses — Megamenu fix — 2026-05-09
 *
 * Repairs the megamenu surfacing of the new metallic-hoses tree:
 *
 *   1. Remove the now-broken "Metallic & PTFE" leaf from the existing
 *      "Hoses by Service" sub-section under Industrial Hoses. That leaf
 *      points to the legacy `metallic-ptfe-hoses` category which is now
 *      empty after the Batch 0 migration moved its 7 products into the
 *      new metallic-hoses sub-category tree.
 *
 *   2. Create a new "Metallic Hoses" sub-section under Industrial Hoses
 *      with 7 leaves — one per metallic-hoses sub-category. Buyers
 *      hovering "Industrial Hoses" now see the new tree.
 *
 * Both operations run in one batch using the array-based navigation
 * field added in Oilfield Valves Batch 3.
 *
 * No products / brands / spec templates / categories created in this
 * batch — pure megamenu maintenance. The required `products` field is
 * populated with a single placeholder that's already in the catalogue
 * (it gets a no-op update — same data going in as already exists).
 */
import type { ImportBatch, ProductImportPayload } from '../import/types'

// ── No-op placeholder product ─────────────────────────────────────────────
//
// ImportBatchSchema requires `products: z.array(...).min(1)`. We pass a
// single existing SKU with the same data it already has — the importer's
// upsert detects no change and the row is harmlessly touched.

const PLACEHOLDER: ProductImportPayload = {
  sku: 'IH-MH-THORBURN-S96-321',
  title: 'Thorburn S96 — Type 321 SS Annular, Single Braid (304 SS)',
  brandSlug: 'thorburn-flex',
  categorySlug: 'metallic-stainless-corrugated-hoses',
  specTemplateSlug: 'metallic-hose-spec',
  status: 'active',
  unitOfMeasure: 'metre',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 21,
  countryOfOrigin: 'Canada',
  descriptionShort:
    'Thorburn S96 Type 321 stainless annular corrugated hose with single 304 SS braid. DN 6 to DN 350. Working pressure to 146 bar (smallest bore). General-purpose petrochemical and process service.',
  // descriptionLong / specs / faqs intentionally omitted so add-only mode
  // doesn't touch them — the existing populated values stay intact.
  seoTitle: 'Thorburn S96 — Type 321 SS Annular, Single Braid (304 SS) | Indus Hydraulics',
  seoDescription:
    'Thorburn S96 Type 321 stainless annular corrugated hose with single 304 SS braid. DN 6 to DN 350. Working pressure to 146 bar. General-purpose petrochemical and process service.',
}

const batch: ImportBatch = {
  meta: {
    id: '2026-05-09-metallic-hoses-megamenu-fix',
    description:
      'Megamenu fix: remove broken "Metallic & PTFE" leaf from "Hoses by Service" sub-section (legacy metallic-ptfe-hoses category is now empty after Batch 0 migration), and create new "Metallic Hoses" sub-section with 7 leaves linking to the new sub-category tree.',
  },

  brands: [],
  categories: [],
  specTemplates: [],

  // Two navigation operations in one batch:
  //   Op 1 — Reset "Hoses by Service" sub: list ALL its current leaves
  //          EXCEPT the broken "Metallic & PTFE" one. The helper does a
  //          full delete-and-recreate, so omitting that label removes it.
  //   Op 2 — Create new "Metallic Hoses" sub-section with 7 leaves.
  navigation: [
    {
      menuLocation: 'primary_megamenu',
      parentColumnCategorySlug: 'industrial-hoses',
      parentSubLabel: 'Hoses by Service',
      replacements: [
        { label: 'Air & Water', categorySlug: 'air-water-hoses' },
        { label: 'Water Suction & Delivery', categorySlug: 'water-suction-delivery-hoses' },
        { label: 'Food & Beverage', categorySlug: 'food-beverage-hoses' },
        { label: 'Oil, Chemical & General Purpose', categorySlug: 'oil-chemical-purpose-hoses' },
        { label: 'Composite Hoses', categorySlug: 'composite-hoses' },
        { label: 'Industrial Steam', categorySlug: 'industrial-steam-hoses' },
        { label: 'Abrasive & Bulk Material', categorySlug: 'abrasive-hoses' },
        { label: 'Specialist & Custom-Built', categorySlug: 'specialist-hoses' },
      ],
    },
    {
      menuLocation: 'primary_megamenu',
      parentColumnCategorySlug: 'industrial-hoses',
      parentSubLabel: 'Metallic Hoses',
      createSubSectionIfMissing: true,
      replacements: [
        { label: 'Stainless Corrugated', categorySlug: 'metallic-stainless-corrugated-hoses' },
        { label: 'Exotic Alloys (Hastelloy / Inconel / Monel / Bronze)', categorySlug: 'metallic-exotic-alloy-hoses' },
        { label: 'High-Pressure Metallic', categorySlug: 'metallic-high-pressure-hoses' },
        { label: 'Fire Protection & Specialty Cores', categorySlug: 'metallic-fire-protection-hoses' },
        { label: 'Specialty Hose Assemblies', categorySlug: 'metallic-specialty-assemblies' },
        { label: 'PTFE Hoses', categorySlug: 'ptfe-hoses' },
        { label: 'Metallic Hose Couplings', categorySlug: 'metallic-hose-couplings' },
      ],
    },
  ],

  products: [PLACEHOLDER],
}

export default batch
