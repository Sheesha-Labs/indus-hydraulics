# Import 2026-05-07 — 25 Sealfast Cam & Groove Couplings

**Date:** 2026-05-07
**Branch / PR:** `feat/catalogue-bulk-sealfast`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous)
**Source:** `/Users/ayushkbhatia/Downloads/Industrial Hose Couplings.xlsx` (25 product rows) + `/Users/ayushkbhatia/Downloads/01_couplings_cam-and-groove.pdf` (Sealfast catalogue, 28 pages, image-only — read visually for spec context)

## Summary

Adds 25 cam & groove (camlock) coupling products from the Sealfast US catalogue across 4 variant families (Standard, CrimpTEK, Self-Locking, Elbow). Lands as a new sub-category under the existing `industrial-hoses` master from PR #81 — couplings used WITH Dixon-style industrial hoses. Catalogue total goes from 504 → **529 products**.

This batch closes part of the Hose Fittings & Accessories follow-up flagged in PR #81 (Dixon catalogue pages 32-35 referenced cam & groove as a deferred coupling family).

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 1 | Sealfast (USA, isAuthorizedDistributor: true) |
| Categories | 1 | `cam-and-groove-couplings` under existing `industrial-hoses` (position 9) |
| Spec templates | 1 | `cam-groove-coupling-spec` (10 fields: variant, type, end-A, end-B, size range, materials, working pressure, gasket, standards, notes) |
| Products | 25 | All under Sealfast brand, `IH-CGC-{VARIANT}-{TYPE}` SKU |
| ProductSpec rows | 230 | 9 specs avg per product (notes optional, 4 products only) |
| ProductFaq rows | 200 | 8 FAQs per product |
| NavMenuItem changes | +1 sub-section, +1 leaf | NEW "Couplings" sub-section under existing Industrial Hoses column |

### Variant breakdown (matches Excel exactly)

| Variant | Count | SKU pattern |
|---|---:|---|
| Standard (Types A, B, C, D, E, F, DC, DP) | 8 | `IH-CGC-STD-{TYPE}` |
| CrimpTEK (Types C, E) | 2 | `IH-CGC-CT-{TYPE}` |
| Self-Locking (Types B, C, DA, D, DC, DD) | 6 | `IH-CGC-SL-{TYPE}` |
| 90° Elbow (Types A, B, C, D, E, F, DA, DD) | 8 | `IH-CGC-90-{TYPE}` |
| 45° Elbow (Type DA) | 1 | `IH-CGC-45-DA` |
| **Total** | **25** | |

### Megamenu addition

```
Megamenu (column 8: Industrial Hoses)
└── Industrial Hoses
    ├── Hoses by Service (existing — 9 leaves)
    └── Couplings  ← NEW sub-section
        └── Cam & Groove Couplings → /c/cam-and-groove-couplings
```

The new "Couplings" sub-section was auto-created via the `createSubSectionIfMissing: true` flag (landed in PR #76). Future coupling families (e.g., Storz, Bauer, Quick-Couplings) can land as additional leaves under this sub-section.

## Spec template — cam-groove-coupling-spec (10 fields)

| Position | Key | Label | Type | Required |
|---:|---|---|---|:---:|
| 0 | `variant` | Variant | select (5 options: standard, crimptek, self-locking, elbow-90, elbow-45) | ✓ |
| 1 | `type` | Coupling Type | select (10 options: A, B, C, D, E, F, DA, DC, DD, DP) | ✓ |
| 2 | `end_a` | End A Configuration | text | ✓ |
| 3 | `end_b` | End B Configuration | text | ✓ |
| 4 | `size_range` | Size Range | text | ✓ |
| 5 | `materials_available` | Materials Available | text | ✓ |
| 6 | `working_pressure` | Working Pressure | text | ✓ |
| 7 | `gasket` | Standard Gasket | text | ✓ |
| 8 | `applicable_standards` | Applicable Standards | text | ✓ |
| 9 | `notes` | Notes | text | — |

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-cam-groove-couplings.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-cam-groove-couplings.ts
```

Live import wall-clock: **~15 seconds**.

## Notes for editors

- **Spec values** are extracted from the Sealfast catalogue (image-only PDF read visually) plus standard cam-and-groove industry conventions. Pressure ratings (250 psi at 1/2"-2", derating with size) match the Sealfast catalogue's typical curve. When admin staff have per-SKU Sealfast datasheets, refine the `working_pressure` and `size_range` values per product.
- **Material availability varies by Type** — the catalogue shows e.g., Type A available in 7 materials (Aluminum / Brass / 316 SS / 304 SS / Plated Iron / Polypropylene / Nyglass) but Self-Locking variants typically ship in only 3 (Aluminum / Brass / 316 SS) and Elbow variants in 2-3 (Aluminum / Polypropylene / Plated Iron). Each PDP lists the actual material options.
- **Type DC and DP are dust caps / plugs** — explicitly NOT pressure-rated. The PDP description and notes call this out.
- **Cam-and-groove geometry is industry-standard** — Sealfast couplings interchange with Dixon, OPW, PT Coupling, Banjo, etc. of the same Type letter and size. Customers who already own Dixon couplings can mix Sealfast halves.
- **Default `unitOfMeasure: 'each'`** because couplings are sold per piece. **leadTimeDays: 14** — common sizes ex-Indus Dubai stock; less-common materials/sizes 14-21 days.

## Follow-ups (deferred)

1. **Dixon catalogue cam & groove range** (Dixon also makes cam & groove couplings — Hose Fittings & Accessories follow-up from PR #81). Dixon and Sealfast products are interchangeable per the cam-and-groove spec; Indus may carry both lines for inventory redundancy.
2. **Per-size, per-material SKUs** — if customers commonly order specific size + material combinations, split the per-Type PDPs into size-and-material variants (potentially ~150-200 SKUs per Type expansion).
3. **Product photography on PDPs** — the catalogue has high-quality product photos (visible in the PDF); these should attach to each PDP for visual identification.
4. **BSPT / Premium variants** from the Sealfast catalogue (catalogue pages 9-10, 17) — separate batch when datasheets are available.
5. **Specialty / Thread Reducer / Pipe Cap** items (catalogue page 22) — separate batch.
6. **Hose clamps and gasket spare-parts SKUs** — mentioned in the catalogue, deferred.

## Rollback (if ever needed — DO NOT auto-run)

```sql
DELETE FROM product_faqs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-CGC-%');
DELETE FROM product_specs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-CGC-%');
DELETE FROM products WHERE sku LIKE 'IH-CGC-%';

-- Megamenu: leaf, then sub-section heading
DELETE FROM nav_menu_items WHERE parent_id IN (
  SELECT id FROM nav_menu_items
  WHERE label = 'Couplings' AND parent_id = (
    SELECT id FROM nav_menu_items
    WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
      AND label = 'Industrial Hoses' AND parent_id IS NULL
  )
);
DELETE FROM nav_menu_items WHERE label = 'Couplings' AND parent_id = (
  SELECT id FROM nav_menu_items
  WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
    AND label = 'Industrial Hoses' AND parent_id IS NULL
);

-- Category
DELETE FROM categories WHERE slug = 'cam-and-groove-couplings';

-- Spec template
DELETE FROM spec_template_fields WHERE template_id =
  (SELECT id FROM spec_templates WHERE slug = 'cam-groove-coupling-spec');
DELETE FROM spec_templates WHERE slug = 'cam-groove-coupling-spec';

-- Brand
DELETE FROM brands WHERE slug = 'sealfast';
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| 25 products created | 25/25 | ✅ |
| Variant distribution | 8/2/6/8/1 (std/ct/sl/90/45) | ✅ |
| `cam-and-groove-couplings` under `industrial-hoses` | parent matches | ✅ |
| Sealfast brand (USA, authorised) | created | ✅ |
| All 25 products under Sealfast brand | 25/25 | ✅ |
| Spec template `cam-groove-coupling-spec` (10 fields) | created | ✅ |
| FAQs (200 total) | 200/200 | ✅ |
| `search_tsv` populated | 25/25 | ✅ |
| NEW "Couplings" sub-section under Industrial Hoses column | created at position 1 | ✅ |
| 1 leaf "Cam & Groove Couplings" under Couplings sub-section | created | ✅ |
