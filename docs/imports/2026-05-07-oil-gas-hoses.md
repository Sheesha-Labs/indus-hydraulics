# Import 2026-05-07 — 36 Oil & Gas Hoses (Continental + Manuli)

**Date:** 2026-05-07
**Branch / PR:** `feat/catalogue-bulk-oilgas`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Adds 36 specialty oil & gas hoses (Continental ContiTech + Manuli) across 5 NEW application-based sub-categories under a NEW top-level master category `oil-gas-hoses`. Introduces a NEW 8th megamenu top-level column "Oil & Gas Hoses". Catalogue total goes from 422 → **458 products**.

This batch also establishes Continental and Manuli as authorised brands on the platform — both have product lines that will likely return in future hose / fluid-conveyance batches.

### Categorisation decision

The source spreadsheet split products by **pressure** (High Pressure / Low pressure). I dropped that split and reorganised by **application family** because:

1. Drilling contractors search for "rotary hose", not "high-pressure hose"
2. Well-control engineers search for "choke & kill", not by pressure
3. Pressure rating is a spec, not a category — exposed via the `pressure_rating` spec field
4. Application family maps to industry standards (API 7K for drilling, API 16C for well control, etc.) — drives genuine customer mental models

The 5 application sub-categories cover all 36 products with no awkward fits.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 2 | Continental (Germany, authorised distributor), Manuli (Italy, authorised distributor) |
| Categories | 6 | 1 master `oil-gas-hoses` + 5 sub-categories |
| Spec templates | 1 | `oil-gas-hose-spec` (9 fields: application, pressure, ID, temp, liner, reinforcement, coupling, service type, standards) |
| Products | 36 | 35 Continental + 1 Manuli (Tauroflon™ Choke & Kill) |
| ProductSpec rows | 324 | 9 specs per product |
| ProductFaq rows | 288 | 8 FAQs per product |
| NavMenuItem changes | +1 column, +1 sub-section, +5 leaves | NEW 8th top-level "Oil & Gas Hoses" column |

### Sub-category breakdown

| Sub-category | Slug | SKU range | Count |
|---|---|---|---:|
| Drilling Hoses | `drilling-hoses` | `IH-OG-DRL-001..007` | 7 |
| Well Control Hoses (API 16C) | `well-control-hoses` | `IH-OG-WCT-001..007` | 7 |
| Well Service & Intervention | `well-service-hoses` | `IH-OG-WSV-001..005` | 5 |
| Tensioner & Compensator | `tensioner-compensator-hoses` | `IH-OG-TC-001..003` | 3 |
| Low-Pressure Oilfield | `low-pressure-oilfield-hoses` | `IH-OG-LP-001..014` | 14 |
| **Total** | | | **36** |

### Brand mapping

- **Continental (35 products):** Black Gold series (low-pressure utility), Powerspiral (cement crimped rotary), Megashield 5000 / Fireshield 5000 / Flameshield (fire-resistant covers), Choke & Kill (PA liner variants), Subsea LMRP, BOP control, drilling rotary/vibrator/cementing, frac, well stimulation (offshore + onshore), well test, burner/flare boom, tensioner / compensator
- **Manuli (1 product):** Flexible Choke & Kill Line with **Tauroflon™ FEP liner** (266°F / 130°C variant — Manuli's signature fluoropolymer-lined choke & kill product)

### New megamenu structure

```
Megamenu (8 top-level columns now)
├── 0: Hydraulic Pumps
├── 1: Hydraulic Cylinders
├── 2: Valves & Manifolds
├── 3: Hoses & Fittings
├── 4: Seals & Components
├── 5: Accessories & Instrumentation
├── 6: Lubricants
└── 7: Oil & Gas Hoses  ← NEW
    └── Hoses by Application  (sub-section)
        ├── Drilling Hoses                → /c/drilling-hoses
        ├── Well Control Hoses (API 16C)  → /c/well-control-hoses
        ├── Well Service & Intervention   → /c/well-service-hoses
        ├── Tensioner & Compensator       → /c/tensioner-compensator-hoses
        └── Low-Pressure Oilfield         → /c/low-pressure-oilfield-hoses
```

The new column heading row was auto-created by the `createColumnIfMissing` flag landed in PR #78.

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-07-oil-gas-hoses.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-07-oil-gas-hoses.ts
```

Live import wall-clock: **~38 seconds** (single transaction via the pooled DB).

## Notes for editors

- **Spec values inferred** from product names + Continental / Manuli catalog defaults + oil & gas industry standards (API 7K, API 16C, API 17J, API 16D, NACE MR-0175, ISO 13628, ISO 15540). When admin staff have a Continental or Manuli datasheet for a specific SKU, refine the spec values in admin (especially `pressure_rating`, `inner_diameter_range`, `liner_material`).
- **Tauroflon™** is a Manuli trademark for FEP fluoropolymer-lined hose — the fluoropolymer barrier resists chemical attack from sour-service well fluids. Continental's equivalent products use polyamide (PA) liners.
- **API standards primer:**
  - **API 7K** = drilling rotary / vibrator hose (rotary hoses, mud booster, kill / cement)
  - **API 16C** = choke & kill lines for BOP-stack well control (10000 psi WP)
  - **API 16D** = BOP control hose, fire-resistant per ISO 15540 (Fireshield rated)
  - **API 17J** = subsea umbilicals, riser tensioner, compensator hoses
  - **NACE MR-0175** = sour-service materials (H2S resistance)
- **Default `unitOfMeasure: 'metre'`** because most oil & gas hoses are sold by length. Override per SKU in admin if a specific assembly is sold as a unit (e.g., the BOP control hose `IH-OG-WCT-006` is typically sold as a complete hose-and-fitting kit).
- **Lead time default: 21 days** (vs 7 for hydraulic fittings) — these are factory-built specialty assemblies with API certification, typically 2-8 weeks ex-Continental/Manuli plant.
- **Authorised-distributor flags:** Both brands set to `isAuthorizedDistributor: true`. Confirm Indus's Continental + Manuli distributor agreements are current; flip to `false` if not.

## Follow-ups (deferred)

1. **Datasheet-driven spec refinement** for each of the 36 SKUs (Continental ContiTech and Manuli publish detailed datasheets for each product line).
2. **Per-ID-size SKUs** if customers commonly order specific inner diameters (currently each product covers its full ID range).
3. **API certification badges** on category pages (API 7K logo, API 16C logo, NACE compliance badge).
4. **API 6A flange compatibility filter** — most well-control hoses terminate in API 6A flanges; expose the flange size / pressure class as a filter facet.
5. **Additional oil & gas hose brands** (Gates, Parker, Eaton Aeroquip oil & gas range) can land as additional sub-sections under the existing "Oil & Gas Hoses" column.
6. **Photos:** all PDPs currently have no media. Specialty oil & gas hoses benefit massively from product photography on the PDP — separate CMS task.

## Rollback (if ever needed — DO NOT auto-run)

```sql
DELETE FROM product_faqs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-OG-%');
DELETE FROM product_specs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-OG-%');
DELETE FROM products WHERE sku LIKE 'IH-OG-%';

-- Megamenu: leaves first, then sub-section, then column
DELETE FROM nav_menu_items WHERE parent_id IN (
  SELECT id FROM nav_menu_items
  WHERE label = 'Hoses by Application' AND parent_id = (
    SELECT id FROM nav_menu_items
    WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
      AND label = 'Oil & Gas Hoses' AND parent_id IS NULL
  )
);
DELETE FROM nav_menu_items WHERE label = 'Hoses by Application' AND parent_id = (
  SELECT id FROM nav_menu_items
  WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
    AND label = 'Oil & Gas Hoses' AND parent_id IS NULL
);
DELETE FROM nav_menu_items
WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
  AND label = 'Oil & Gas Hoses' AND parent_id IS NULL;

-- Categories
DELETE FROM categories WHERE slug IN (
  'drilling-hoses','well-control-hoses','well-service-hoses',
  'tensioner-compensator-hoses','low-pressure-oilfield-hoses'
);
DELETE FROM categories WHERE slug = 'oil-gas-hoses';

-- Spec template
DELETE FROM spec_template_fields WHERE template_id =
  (SELECT id FROM spec_templates WHERE slug = 'oil-gas-hose-spec');
DELETE FROM spec_templates WHERE slug = 'oil-gas-hose-spec';

-- Brands
DELETE FROM brands WHERE slug IN ('continental','manuli');
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| 36 products created | 36/36 | ✅ |
| Per-category counts | 7/7/5/3/14 | ✅ |
| Continental brand (Germany, authorised) | created | ✅ |
| Manuli brand (Italy, authorised) | created | ✅ |
| 35 Continental + 1 Manuli products | 35/1 | ✅ |
| FAQs (288 total) | 288/288 | ✅ |
| Specs (324 total) | 324/324 | ✅ |
| `search_tsv` populated | 36/36 | ✅ |
| Spec template `oil-gas-hose-spec` (9 fields) | created | ✅ |
| Top-level master `oil-gas-hoses` (parentId: null) | position 7 | ✅ |
| NEW megamenu top-level column "Oil & Gas Hoses" | position 7 | ✅ |
| "Hoses by Application" sub-section | created | ✅ |
| 5 leaves under sub-section | 5/5 | ✅ |
