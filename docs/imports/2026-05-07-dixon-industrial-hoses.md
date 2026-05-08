# Import 2026-05-07 — 46 Dixon Industrial Hoses

**Date:** 2026-05-07
**Branch / PR:** `feat/catalogue-bulk-dixon`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous)
**Source:** `/Users/ayushkbhatia/Documents/hose_catalogue_apr_18.pdf` (Dixon Group Europe Hose Catalogue, April 2018, 52 pages)

## Summary

Adds 46 industrial hose products from the Dixon Group Europe catalogue across 9 NEW application-based sub-categories under a NEW top-level master `industrial-hoses` category. Introduces a NEW 9th megamenu top-level column "Industrial Hoses". Catalogue total goes from 458 → **504 products**.

This batch establishes Dixon as an authorised brand and the `industrial-hoses` master category — both have substantial product lines that will likely return in future batches (especially the Hose Fittings & Accessories range from catalogue pages 32-35, deferred to a follow-up).

### Source extraction approach

The Dixon catalogue is a 52-page PDF with consistent product specs:
- Application
- Cover
- Lining (or Tube for PVC products)
- Reinforcement
- Branding (printed on hose)
- Temperature range
- Safety Factor
- Sizes table (I.D / O.D / Max Working Pressure / Min Burst Pressure / Min Bend Radius / Weight)

I built a Python parser (`pdfplumber`-based) that extracts the structured spec data for the 36 standard products (pages 4-22), then hand-augmented with 7 metallic & PTFE families (Adflex / Suparflex / Hyparflex / HP-THP / Smoothbore PTFE / Convoluted PTFE × stainless / polymer braid) and 3 specialist products (Bulkstream / Heat Traced / GSM) which use non-standard catalogue formats with size tables for braid variants.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 1 | Dixon (UK, isAuthorizedDistributor: true) |
| Categories | 10 | 1 master `industrial-hoses` + 9 sub-categories |
| Spec templates | 1 | `industrial-hose-spec` (14 fields) |
| Spec template fields | 14 | application_family, dixon_part_code, ID range, working/burst pressure, bend radius, temperature, safety factor, cover, lining, reinforcement, weight, branding, applicable_standards |
| Products | 46 | All under Dixon brand, `IH-IH-{DIXON-CODE}` SKU format |
| ProductSpec rows | 644 | ~14 specs per product |
| ProductFaq rows | 368 | 8 FAQs per product |
| NavMenuItem changes | +1 column, +1 sub-section, +9 leaves | NEW 9th top-level "Industrial Hoses" column |

### Sub-category breakdown

| Sub-category | Slug | Count |
|---|---|---:|
| Air & Water Hoses | `air-water-hoses` | 8 (A101AS-T3, A101HP, A102HP, A103HP, A105HP, A116EU100, A190, A190Y) |
| Water Suction & Delivery | `water-suction-delivery-hoses` | 4 (A210, A216, DELVAC, IRRIBULK) |
| Food & Beverage | `food-beverage-hoses` | 5 (SANB, SANF, SANSIL, DELIKATESSE, PREMVIN) |
| Oil, Chemical & General-Purpose | `oil-chemical-purpose-hoses` | 10 (BAKU, A104, A110, A125, A420, A430, A460, A400EU, A410, A416) |
| Composite Hoses | `composite-hoses` | 4 (A901GG, A901AG, A906PG, A911SG) |
| Industrial Steam | `industrial-steam-hoses` | 3 (A230, A235BK, A235BU) |
| Abrasive & Bulk Material | `abrasive-hoses` | 2 (A361, PREMFLEX) |
| Metallic & PTFE | `metallic-ptfe-hoses` | 7 (Adflex, Suparflex, Hyparflex, HP-THP, Smoothbore PTFE × SS, Convoluted PTFE × SS, Convoluted PTFE × Polymer) |
| Specialist & Custom-Built | `specialist-hoses` | 3 (Bulkstream, Heat Traced, GSM) |
| **Total** | | **46** |

### New megamenu structure

```
Megamenu (9 top-level columns now)
├── 0: Hydraulic Pumps
├── 1: Hydraulic Cylinders
├── 2: Valves & Manifolds
├── 3: Hoses & Fittings
├── 4: Seals & Components
├── 5: Accessories & Instrumentation
├── 6: Lubricants
├── 7: Oil & Gas Hoses
└── 8: Industrial Hoses  ← NEW
    └── Hoses by Service
        ├── Air & Water
        ├── Water Suction & Delivery
        ├── Food & Beverage
        ├── Oil, Chemical & General Purpose
        ├── Composite Hoses
        ├── Industrial Steam
        ├── Abrasive & Bulk Material
        ├── Metallic & PTFE
        └── Specialist & Custom-Built
```

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-07-dixon-industrial-hoses.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-07-dixon-industrial-hoses.ts
```

Live import wall-clock: **~73 seconds** (single transaction via the pooled DB).

## Notes for editors

- **Spec values come directly from the Dixon PDF catalogue** for the 36 standard products. Inferred / aggregated values for the 7 metallic-PTFE families and 3 specialist products (full size-by-braid tables don't fit a single PDP — refer to the Dixon datasheet for the specific bore + braid combination).
- **Each PDP represents one Dixon part code**, with the full size range (e.g., `6 mm to 25 mm`) in the `inner_diameter_range` spec. Specific bore sizes are quoted on the RFQ — Dixon supplies multiple bore sizes per part code at different lead times.
- **Working pressure** and **burst pressure** are typically constant across the size range (the catalogue size tables show this), but can vary for metallic & PTFE products which have different ratings per braid configuration. The spec value reflects the range across sizes.
- **Branding** spec captures the text printed on the hose for in-field identification (e.g., `DIXON A101AS T3 AIR WATER 20 BAR 3:1 BS2878`). Useful for procurement and stores teams cross-checking against engineering drawings.
- **Compliance:** all Dixon hose assemblies are PED 2014/68/EU compliant, with BSI ISO 9001 manufacturing. Lloyd's Approval and third-party witness testing available on request — call out on RFQ for audit-grade documentation.
- **Default `unitOfMeasure: 'metre'`** because Dixon hoses are sold by length. **Lead time default: 14 days** (factory ex-Dixon UK; custom assemblies 4-6 weeks).
- **Hose Fittings & Accessories** (catalogue pages 32-35) are described as broad product groups (Cam & Groove, Boss steam couplings, Holedall permanently-attached fittings, hose tags, Spiral Hose Guard, Fire Jacket, King Cable Hose Restraint, etc.). These weren't broken out into individual SKUs in this batch — flagged as a follow-up when Dixon provides per-SKU coverage. The PDPs reference these as companion products.

## Follow-ups (deferred)

1. **Dixon Hose Fittings & Accessories (~50-100 SKUs)** — Cam & Groove, Boss steam couplings, Holedall permanently-attached fittings, hose tags, Spiral Hose Guard, Fire Jacket, King Cable Hose Restraint, Air Fittings, Brass Fittings, etc. Need a separate Dixon catalogue or per-SKU spec sheet.
2. **Per-bore-size SKUs** if customers commonly order specific inner diameters (currently each product covers its full ID range).
3. **Datasheet PDF attachments** on each PDP — Dixon publishes individual product datasheets that should attach to the PDP for technical specifiers.
4. **Hose-end coupling compatibility filter** — Dixon's Cam & Groove, Boss, and DIN Storz fittings have specific bore + thread compatibility. Future facet.
5. **Product photography** — Dixon hoses benefit from product photography on the PDP (separate CMS task).
6. **Custom-bore mandrel-length lookup tool** for Bulkstream — bore size determines max assembly length; expose this as a tool on the PDP / category page.

## Rollback (if ever needed — DO NOT auto-run)

```sql
DELETE FROM product_faqs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-IH-%');
DELETE FROM product_specs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-IH-%');
DELETE FROM products WHERE sku LIKE 'IH-IH-%';

-- Megamenu: leaves first, then sub-section, then column
DELETE FROM nav_menu_items WHERE parent_id IN (
  SELECT id FROM nav_menu_items
  WHERE label = 'Hoses by Service' AND parent_id = (
    SELECT id FROM nav_menu_items
    WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
      AND label = 'Industrial Hoses' AND parent_id IS NULL
  )
);
DELETE FROM nav_menu_items WHERE label = 'Hoses by Service' AND parent_id = (
  SELECT id FROM nav_menu_items
  WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
    AND label = 'Industrial Hoses' AND parent_id IS NULL
);
DELETE FROM nav_menu_items
WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
  AND label = 'Industrial Hoses' AND parent_id IS NULL;

-- Categories
DELETE FROM categories WHERE parent_id = (SELECT id FROM categories WHERE slug = 'industrial-hoses');
DELETE FROM categories WHERE slug = 'industrial-hoses';

-- Spec template
DELETE FROM spec_template_fields WHERE template_id =
  (SELECT id FROM spec_templates WHERE slug = 'industrial-hose-spec');
DELETE FROM spec_templates WHERE slug = 'industrial-hose-spec';

-- Brand
DELETE FROM brands WHERE slug = 'dixon';
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| 46 products created | 46/46 | ✅ |
| Per-category counts | 8/4/5/10/4/3/2/7/3 | ✅ |
| Brand `dixon` (UK, authorised) | created | ✅ |
| All `brand.slug = 'dixon'` | 46/46 | ✅ |
| All `status = 'active'` | 46/46 | ✅ |
| FAQs (368 total) | 368/368 | ✅ |
| Specs (644 total) | 644/644 | ✅ |
| `search_tsv` populated | 46/46 | ✅ |
| Spec template `industrial-hose-spec` (14 fields) | created | ✅ |
| Top-level master `industrial-hoses` (parentId: null) | position 8 | ✅ |
| NEW megamenu top-level column "Industrial Hoses" | position 8 | ✅ |
| "Hoses by Service" sub-section | created | ✅ |
| 9 leaves under sub-section | 9/9 | ✅ |
