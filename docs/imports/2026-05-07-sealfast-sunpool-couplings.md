# Import 2026-05-07 — 98 Sealfast + Sunpool Industrial Couplings

**Date:** 2026-05-07
**Branch / PR:** `feat/catalogue-bulk-sealfast3`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous)
**Sources:**
- `Industrial Hose Couplings - Cont2.xlsx` (canonical, 98 product rows + competitor product-page link per row)
- Linked Sealfast (`products.sealfast.com`) and Sunpool (`sunpool.com.tw`) product pages — used for spec context per family

## Summary

Largest couplings batch yet — **98 products across 13 NEW sub-categories**. Extends the Sealfast brand (PR #82, #83) with 32 more products and introduces **Sunpool** (Taiwanese industrial coupling manufacturer) as a NEW brand with 66 products. Catalogue total goes from 560 → **658 products**.

This batch dramatically broadens the Industrial Hoses master beyond cam-and-groove + Bauer + dry-disconnect into the full universal-coupling territory: sandblast, crowfoot, ground-joint, ring-lock, pin-lug, shank, mender, hose-nipple, Guillemin (French), composite hose, KC (Korean), Storz (German fire-service), and ASME B16.5 / SP-43 industrial flanges.

### Source mapping decision

Excel is canonical (98 rows). Brand attribution derived from the per-row `Competitor Link` hyperlinks:
- `sealfast.com` → existing Sealfast brand
- `sunpool.com.tw` → NEW Sunpool brand
- Rows without a link → defaulted to Sealfast (matches the surrounding sub-category brand)

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 1 NEW | Sunpool (Taiwan, isAuthorizedDistributor: true). Sealfast reused from PR #82 |
| Categories | 13 | All under existing `industrial-hoses` master (positions 13–25) |
| Spec templates | 0 | Reuses existing `industrial-coupling-spec` (10 text fields) from PR #83 |
| Products | 98 | 32 Sealfast + 66 Sunpool |
| ProductSpec rows | 882 | 9 specs per product (all-text fields populated) |
| ProductFaq rows | 784 | 8 FAQs per product |
| NavMenuItem changes | +1 sub-section, +13 leaves | NEW "Specialty Couplings & Flanges" sub-section under Industrial Hoses column |

### Sub-category breakdown

| Sub-category | Slug | SKU prefix | Brand | Count |
|---|---|---|---|---:|
| Sandblast Couplings | `sandblast-couplings` | `IH-SB-*` | Mixed (Sealfast 3 + Sunpool 3) | 6 |
| Crowfoot Couplings | `crowfoot-couplings` | `IH-CRW-*` | Sealfast | 7 |
| Ground Joint Couplings | `ground-joint-couplings` | `IH-GJ-*` | Sealfast | 8 |
| Ring Lock Couplings | `ring-lock-couplings` | `IH-RL-*` | Sealfast | 4 |
| Pin Lug Shank Couplings | `pin-lug-shank-couplings` | `IH-PLS-*` | Sealfast | 3 |
| Shank Couplings | `shank-couplings` | `IH-SHK-*` | Sealfast | 5 |
| Hose Menders | `hose-menders` | `IH-MND-*` | Sealfast | 1 |
| Hose Nipples | `hose-nipples` | `IH-HN-*` | Sealfast | 1 |
| Guillemin Couplings | `guillemin-couplings` | `IH-GUI-*` | Sunpool | 9 |
| Composite Hose Fittings | `composite-hose-fittings` | `IH-COMP-*` | Sunpool | 6 |
| KC Nipple & Hose Fittings | `kc-nipple-fittings` | `IH-KC-*` | Sunpool | 13 |
| Storz Couplings & Adapters | `storz-couplings` | `IH-STZ-*` | Sunpool | 26 |
| Industrial Flanges | `industrial-flanges` | `IH-FLG-*` | Sunpool | 9 |
| **Total** | | | | **98** |

### Megamenu structure (after this PR)

```
Industrial Hoses column (8th column, from PR #81)
├── Hoses by Service  (existing — 9 leaves: Air & Water, Water S&D, Food, Oil, Composite, Steam, Abrasive, Metallic & PTFE, Specialist)
├── Couplings  (existing — 4 leaves: Cam & Groove, Specialty Adapters, Bauer, Dry Disconnect)
└── Specialty Couplings & Flanges  ← NEW (13 leaves: Sandblast, Crowfoot, Ground Joint, Ring Lock, Pin Lug Shank, Shank, Hose Menders, Hose Nipples, Guillemin, Composite Hose Fittings, KC Nipple, Storz, Industrial Flanges)
```

The new sub-section was auto-created via the `createSubSectionIfMissing: true` flag from PR #76.

## SKU prefix design — collision-avoidance

The SKU prefixes were chosen to NOT conflict with existing prefixes from prior batches:
- `IH-CRW-` (Crowfeet) instead of `IH-CF-` (already used for Crimp Ferrules in PR #65)
- `IH-FLG-` (industrial flanges) instead of `IH-FL-` (already used for SAE Flange Fittings in PR #67)

All other prefixes were free.

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-sunpool-couplings.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-sunpool-couplings.ts
```

Live import wall-clock: **~49 seconds**.

## Notes for editors

- **Spec values** are inferred from the Excel product titles + family-level industry-standard defaults (Storz DIN 14301, Guillemin NF E 29-572, ASME B16.5 flanges, etc.). Per-SKU datasheet values can be refined in admin where catalogue links provide them.
- **Material extraction from titles** — the Python generator parses material keywords ("Aluminum", "316 Stainless Steel", "Zinc Plated Iron", "Brass", "Plated Iron", "Carbon Steel", "Gunmetal", "Hard-Anodized") from each title and maps them to standardised values. Storz "H. Anodized" and "Painted" variants are tagged accordingly.
- **End A / End B inference** — patterns like "female NPT", "male NPT", "hose end", "hose shank", "flange", "lever ring", "gasket", "dust cap", "mender", "reducing", "spool" are detected and mapped to standardised end descriptions.
- **Storz couplings (26 SKUs)** are the largest sub-category — covers the full Sunpool Storz range: UL-listed FDC (painted / hard-anodized) variants, safety-latch couplings, swivel/male/female thread adapters, 30° elbow, long-shank in 3 materials (AL/BR/SS), gaskets, 3-segment clamps, reducer types, Alfot forged Storz heads.
- **KC nipples (13 SKUs)** include heavy-duty turn-back / fixed flange variants, plus specialty service items: umbilical slurry coupling, drag hose fitting, frac water coupling, 206 hammer union, suction hose couplings in carbon steel / brass / aluminum.
- **Industrial flanges (9 SKUs)** cover the full ASME B16.5 type range (welding neck, slip on, socket weld, lap joint, threaded, flat, blind, stub end per MSS SP-43) plus a gunmetal dock flange × male thread for marine service.
- **Lead time default 14 days** (common ex-Indus stock); less-common sizes / materials 14-21 days.

## Follow-ups (deferred)

1. **Per-SKU datasheet refinement** — each Sealfast / Sunpool product page has detailed pressure / size / drawing data; admin can refine the spec values per SKU as datasheets are integrated.
2. **Per-size, per-material SKUs** for high-runner products (e.g., common Storz sizes in each material) if RFQ data shows demand.
3. **Product photography** on each PDP — both Sealfast and Sunpool product pages have high-quality images.
4. **UL / DIN / NF certification badges** on category pages where applicable.
5. **Storz size-code conversion guide** (DIN sizes 25-150 ↔ inch sizes 1-1/2"–6") as a reference page.
6. **Rationalise `industrial-flanges` slug** — currently lives under `industrial-hoses` master, but ASME flanges aren't really hoses. Consider promoting to its own master category if more flange SKUs land.

## Rollback (if ever needed — DO NOT auto-run)

```sql
DELETE FROM product_faqs WHERE product_id IN (SELECT id FROM products WHERE
  sku LIKE 'IH-SB-%' OR sku LIKE 'IH-CRW-%' OR sku LIKE 'IH-GJ-%' OR sku LIKE 'IH-RL-%'
  OR sku LIKE 'IH-PLS-%' OR sku LIKE 'IH-SHK-%' OR sku LIKE 'IH-MND-%' OR sku LIKE 'IH-HN-%'
  OR sku LIKE 'IH-GUI-%' OR sku LIKE 'IH-COMP-%' OR sku LIKE 'IH-KC-%' OR sku LIKE 'IH-STZ-%'
  OR sku LIKE 'IH-FLG-%');

DELETE FROM product_specs WHERE product_id IN (SELECT id FROM products WHERE
  sku LIKE 'IH-SB-%' OR sku LIKE 'IH-CRW-%' OR sku LIKE 'IH-GJ-%' OR sku LIKE 'IH-RL-%'
  OR sku LIKE 'IH-PLS-%' OR sku LIKE 'IH-SHK-%' OR sku LIKE 'IH-MND-%' OR sku LIKE 'IH-HN-%'
  OR sku LIKE 'IH-GUI-%' OR sku LIKE 'IH-COMP-%' OR sku LIKE 'IH-KC-%' OR sku LIKE 'IH-STZ-%'
  OR sku LIKE 'IH-FLG-%');

DELETE FROM products WHERE
  sku LIKE 'IH-SB-%' OR sku LIKE 'IH-CRW-%' OR sku LIKE 'IH-GJ-%' OR sku LIKE 'IH-RL-%'
  OR sku LIKE 'IH-PLS-%' OR sku LIKE 'IH-SHK-%' OR sku LIKE 'IH-MND-%' OR sku LIKE 'IH-HN-%'
  OR sku LIKE 'IH-GUI-%' OR sku LIKE 'IH-COMP-%' OR sku LIKE 'IH-KC-%' OR sku LIKE 'IH-STZ-%'
  OR sku LIKE 'IH-FLG-%';

-- Megamenu: delete leaves, then sub-section
DELETE FROM nav_menu_items WHERE parent_id IN (
  SELECT id FROM nav_menu_items
  WHERE label = 'Specialty Couplings & Flanges' AND parent_id = (
    SELECT id FROM nav_menu_items
    WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
      AND label = 'Industrial Hoses' AND parent_id IS NULL
  )
);
DELETE FROM nav_menu_items WHERE label = 'Specialty Couplings & Flanges' AND parent_id = (
  SELECT id FROM nav_menu_items
  WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
    AND label = 'Industrial Hoses' AND parent_id IS NULL
);

-- Categories
DELETE FROM categories WHERE slug IN (
  'sandblast-couplings','crowfoot-couplings','ground-joint-couplings','ring-lock-couplings',
  'pin-lug-shank-couplings','shank-couplings','hose-menders','hose-nipples',
  'guillemin-couplings','composite-hose-fittings','kc-nipple-fittings','storz-couplings',
  'industrial-flanges'
);

-- Brand
DELETE FROM brands WHERE slug = 'sunpool';
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| 13 sub-categories created | 6/7/8/4/3/5/1/1/9/6/13/26/9 | ✅ |
| Total products created | 98 | ✅ |
| Sunpool brand (Taiwan, authorised) | created | ✅ |
| Sealfast products in this batch | 32 | ✅ |
| Sunpool products in this batch | 66 | ✅ |
| Specs (882 total) | 882/882 | ✅ |
| FAQs (784 total) | 784/784 | ✅ |
| `search_tsv` populated | 98/98 | ✅ |
| NEW "Specialty Couplings & Flanges" sub-section | created at position 2 | ✅ |
| 13 leaves under sub-section | 13/13 | ✅ |
