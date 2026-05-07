# Import 2026-05-07 — 63 Molykote Specialty Lubricants

**Date:** 2026-05-07
**Branch / PR:** `feat/catalogue-bulk-molykote`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Adds 63 Molykote specialty lubricants (DuPont / Dow Performance Lubricants range) across 5 NEW sub-categories under a NEW top-level master category `lubricants`. Introduces a NEW 7th megamenu top-level column "Lubricants" — Indus's first non-hydraulic-hardware product family. Catalogue total goes from 359 → **422 products**.

This batch establishes a foundation for additional lubricant brands (Castrol, Mobil, Shell, BP) to land under the same `lubricants` master and `Lubricants` megamenu column in subsequent batches.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 1 | Molykote (USA, isAuthorizedDistributor: true) |
| Categories | 6 | 1 master `lubricants` + 5 sub-categories |
| Spec templates | 1 | `lubricant-spec` (12 fields) |
| Spec template fields | 12 | See template definition |
| Products | 63 | All under Molykote brand, `IH-LUB-{model}` SKU format |
| ProductSpec rows | 504 | 8 specs per product |
| ProductFaq rows | 504 | 8 FAQs per product |
| NavMenuItem changes | +1 column, +1 sub-section, +5 leaves | NEW 7th top-level "Lubricants" column with Molykote sub-section |

### Sub-category breakdown

| Sub-category | Slug | Count |
|---|---|---:|
| Molykote Greases | `molykote-greases` | 33 |
| Molykote Pastes | `molykote-pastes` | 8 |
| Molykote Anti-Friction Coatings | `molykote-anti-friction-coatings` | 13 |
| Molykote Compounds | `molykote-compounds` | 4 |
| Molykote Specialty Lubricants | `molykote-specialty-lubricants` | 5 |
| **Total** | | **63** |

### New spec template — `lubricant-spec` (12 fields)

| Position | Key | Label | Type | Required |
|---:|---|---|---|:---:|
| 0 | `product_type` | Product Type | select (5 options) | ✓ |
| 1 | `nlgi_grade` | NLGI Grade | text | — |
| 2 | `base_oil` | Base Oil / Chemistry | text | — |
| 3 | `thickener` | Thickener | text | — |
| 4 | `solid_lubricants` | Solid Lubricants | text | — |
| 5 | `operating_temperature_range` | Operating Temperature Range | text | ✓ |
| 6 | `dropping_point` | Dropping Point | text | — |
| 7 | `flash_point` | Flash Point | text | — |
| 8 | `food_grade_status` | Food-Grade Status | text | — |
| 9 | `typical_applications` | Typical Applications | text | ✓ |
| 10 | `container_sizes` | Container Sizes | text | — |
| 11 | `applicable_standards` | Applicable Standards | text | — |

### New megamenu structure — before / after

**Before** (6 top-level columns):

```
Megamenu
├── 0: Hydraulic Pumps
├── 1: Hydraulic Cylinders
├── 2: Valves & Manifolds
├── 3: Hoses & Fittings
├── 4: Seals & Components
└── 5: Accessories & Instrumentation
```

**After** (7 top-level columns; new "Lubricants" column at position 6):

```
Megamenu
├── 0: Hydraulic Pumps
├── 1: Hydraulic Cylinders
├── 2: Valves & Manifolds
├── 3: Hoses & Fittings
├── 4: Seals & Components
├── 5: Accessories & Instrumentation
└── 6: Lubricants  ← NEW
    └── Molykote  (sub-section)
        ├── Greases               → /c/molykote-greases
        ├── Pastes                → /c/molykote-pastes
        ├── Compounds             → /c/molykote-compounds
        ├── Anti-Friction Coatings → /c/molykote-anti-friction-coatings
        └── Specialty Lubricants  → /c/molykote-specialty-lubricants
```

The new column heading row was auto-created by the new `createColumnIfMissing` flag (see Library improvement below).

## Library improvement (also in this PR)

`packages/db/src/import/navigation.ts` + `types.ts` — extends `replacePlaceholderLeaves` with three new optional config fields (paired with the existing `createSubSectionIfMissing` from PR #76):

- **`createColumnIfMissing: boolean`** (default `false`) — when `true` and the parent column doesn't exist for the given `parentColumnCategorySlug`, the helper auto-creates it as a top-level `linkType: 'category'` column linking to the column category.
- **`newColumnPosition?: number`** — position among sibling columns; defaults to appending after existing columns.
- **`newColumnLabel?: string`** — label override for the new column heading; defaults to the column category's `name`.

Existing imports are unaffected — all three new fields are optional with backwards-compatible defaults. With this AND the prior `createSubSectionIfMissing`, a single import can now land:
1. A brand-new top-level master category
2. A brand-new megamenu top-level column linked to it
3. A brand-new sub-section heading inside that column
4. The category-linked leaves under the sub-section

— in one atomic transaction. This is what just landed Lubricants → Molykote → Greases/Pastes/etc.

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-07-molykote-lubricants.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-07-molykote-lubricants.ts
```

Live import wall-clock: **~96 seconds** (single transaction via the pooled DB).

## Notes for editors

- **Spec values are inferred from product titles + family-level Molykote catalog defaults.** Each Molykote product has a real datasheet with concrete NLGI / temperature / approval values; the inferred values here use ranges typical for the product type. When admin staff have a Molykote datasheet for a specific SKU, refine the spec values in admin (especially `operating_temperature_range`, `nlgi_grade`, `food_grade_status`).
- **Manual classification overrides:** Roughly 50 of the 63 products had to be manually classified (paste vs grease vs anti-friction coating) because Molykote product names are typically just numeric codes (e.g., "Molykote 1000" is an assembly paste, "Molykote 7" is a silicone compound). The classifier's manual overrides match the public Molykote catalogue — flag any miscategorisations during admin review.
- **Two duplicate names** ("Molykote 33 MED" and "Molykote 165 LT") in the source Excel were disambiguated with "(Variant 2)" suffix; SKUs use `-A` suffix.
- **Authorized distributor warning:** Brand created with `isAuthorizedDistributor: true`. If Indus's Molykote distributor agreement isn't currently active, edit the brand row to `false` to avoid misrepresentation.
- **Container sizes** are deliberately generic ("50 g tube, 1 kg tin, 5 kg pail, 25 kg drum — varies by product"). Refine per SKU as RFQ data shows actual customer-requested sizes.

## Follow-ups (deferred)

1. **Datasheet-driven spec refinement** for each of the 63 SKUs — populate concrete NLGI grades, temperature limits, food-grade approvals from Molykote datasheets.
2. **Per-container-size SKUs** — currently each product is one PDP covering all container sizes. Customers ordering specific pack sizes (e.g., 50g vs 1kg) might benefit from per-size SKUs.
3. **Additional lubricant brands** — Castrol, Mobil, Shell, BP can land as new sub-sections under the existing Lubricants column.
4. **MSDS / SDS document attachments** — Molykote MSDS PDFs should attach to each PDP for chemical-safety compliance.
5. **OEM / industry filter facets** — many Molykote products have CAT, KOMATSU, Volvo, JCB OEM specs; surface these as filter facets on the category pages.

## Rollback (if ever needed — DO NOT auto-run)

```sql
DELETE FROM product_faqs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-LUB-%');
DELETE FROM product_specs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-LUB-%');
DELETE FROM products WHERE sku LIKE 'IH-LUB-%';

-- Megamenu: delete leaves, then sub-section, then column
DELETE FROM nav_menu_items WHERE parent_id IN (
  SELECT id FROM nav_menu_items
  WHERE label = 'Molykote' AND parent_id = (
    SELECT id FROM nav_menu_items
    WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
      AND label = 'Lubricants' AND parent_id IS NULL
  )
);
DELETE FROM nav_menu_items WHERE label = 'Molykote' AND parent_id = (
  SELECT id FROM nav_menu_items
  WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
    AND label = 'Lubricants' AND parent_id IS NULL
);
DELETE FROM nav_menu_items
WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
  AND label = 'Lubricants' AND parent_id IS NULL;

-- Categories (sub-cats first, then master)
DELETE FROM categories WHERE slug LIKE 'molykote-%';
DELETE FROM categories WHERE slug = 'lubricants';

-- Spec template
DELETE FROM spec_template_fields WHERE template_id =
  (SELECT id FROM spec_templates WHERE slug = 'lubricant-spec');
DELETE FROM spec_templates WHERE slug = 'lubricant-spec';

-- Brand
DELETE FROM brands WHERE slug = 'molykote';
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| 63 products created | 63/63 | ✅ |
| Per-category counts | 33/8/4/13/5 | ✅ |
| Brand `molykote` (USA, authorized) | created | ✅ |
| All `status = 'active'` | 63/63 | ✅ |
| All `brand.slug = 'molykote'` | 63/63 | ✅ |
| FAQs (504 total) | 504/504 | ✅ |
| Specs (504 total) | 504/504 | ✅ |
| `search_tsv` populated | 63/63 | ✅ |
| Spec template `lubricant-spec` (12 fields) | created | ✅ |
| Top-level master category `lubricants` (parentId: null) | created | ✅ |
| NEW megamenu top-level column "Lubricants" | created at position 6 | ✅ |
| Molykote sub-section under Lubricants column | created | ✅ |
| 5 leaves under Molykote sub-section | 5/5 | ✅ |
