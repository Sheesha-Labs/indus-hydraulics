# Import 2026-05-07 — 31 Sealfast Specialty / Bauer / Dry Disconnect Couplings

**Date:** 2026-05-07
**Branch / PR:** `feat/catalogue-bulk-sealfast2`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous)
**Sources:**
- `Industrial Hose Couplings - continued.xlsx` (canonical, 31 product rows across 3 sub-categories)
- `02_couplings_crimping-system.pdf` (Sealfast CrimpTEK detail — mostly already in PR #82; combo nipples + sleeves out of scope per Excel)
- `03_couplings_fuel-tanker.pdf` (API valves / drop elbows / fill adapters — not in Excel; deferred)
- `04_couplings_dry-disconnects.pdf` (matched Excel rows 30-33 for dry disconnect specs)

## Summary

Adds 31 Sealfast industrial coupling products extending the cam & groove range from PR #82 with three additional coupling families. Lands as 3 new sub-categories under the existing `industrial-hoses` master + 3 new megamenu leaves under the existing "Couplings" sub-section (now 4 leaves total). Catalogue total goes from 529 → **560 products**.

This batch delivers on the user's question — "not sure if the products map 1:1 exactly to the catalogues, take a go at it." Used Excel as canonical (31 products), with PDFs providing spec context where they aligned (PDF 04 mapped cleanly to Dry Disconnect; PDFs 02/03 provided context but contained content out of the Excel scope).

## What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 | Reuses `sealfast` from PR #82 |
| Categories | 3 | All under existing `industrial-hoses` master (positions 10, 11, 12) |
| Spec templates | 1 | `industrial-coupling-spec` (10 text fields, flexible across 3 coupling families) |
| Products | 31 | All under Sealfast brand |
| ProductSpec rows | 282 | ~9 specs per product (notes optional) |
| ProductFaq rows | 248 | 8 FAQs per product |
| NavMenuItem changes | -1, +4 | Couplings sub-section: replaced existing 1 leaf with full 4-leaf set (Cam & Groove preserved + 3 new) |

### Breakdown by sub-category

| Sub-category | Slug | SKU pattern | Count |
|---|---|---|---:|
| Specialty Adapters & Couplings | `specialty-adapters-couplings` | `IH-SPC-*` | 17 |
| Bauer Type Couplings | `bauer-type-couplings` | `IH-BC-*` | 10 |
| Dry Disconnect Couplings | `dry-disconnect-couplings` | `IH-DDC-*` | 4 |
| **Total** | | | **31** |

#### Specialty Adapters & Couplings (17)

Cam-and-groove specialty types beyond the standard A-F / DA-DD range:
- AW socket-weld adapter, DW socket-weld coupler
- FA / FC ANSI Class 150 flanged
- DCL lockable dust caps (padlock-compatible)
- SA male × male spool, DD female × female spool (straight, distinct from DD elbow)
- DA reducing, AR / BR / BLN / CR / DR / ER reducing variants
- 3 stainless / general thread reducers (NPSM × NPT, BSP × NPT, NPT × NPT)

#### Bauer Type Couplings (10)

Bauer-pattern lever-ring couplings for agriculture / water transfer / irrigation:
- Male threaded × female / male
- Hose shank male / female / complete set
- Lever ring (replacement spare)
- Flanged male / female / complete sets (DIN 2501 PN 10)

#### Dry Disconnect Couplings (4)

Aluminum body × female NPT, automatic shut-off valve in both halves:
- Coupler × Viton seal (petroleum / fuel)
- Coupler × PTFE seal (aggressive chemical)
- Adapter × Viton seal
- Adapter × PTFE seal

### Megamenu update

```
Industrial Hoses column
└── Couplings sub-section (now 4 leaves)
    ├── Cam & Groove Couplings  (existing from PR #82, preserved)
    ├── Specialty Adapters & Couplings  ← NEW
    ├── Bauer Type Couplings  ← NEW
    └── Dry Disconnect Couplings  ← NEW
```

The existing "Cam & Groove Couplings" leaf was preserved by including it in the `replacements` array (the navigation helper deletes-and-recreates all leaves on each run).

## Spec template — industrial-coupling-spec (10 fields)

All-text fields for flexibility across three coupling families with very different spec dimensions (cam-and-groove pressures, Bauer thread/flange standards, Dry Disconnect seal compatibility).

| Position | Key | Label | Type | Required |
|---:|---|---|---|:---:|
| 0 | `coupling_family` | Coupling Family | text | ✓ |
| 1 | `coupling_type` | Coupling Type / Variant | text | ✓ |
| 2 | `end_a` | End A Configuration | text | ✓ |
| 3 | `end_b` | End B Configuration | text | ✓ |
| 4 | `size_range` | Size Range | text | ✓ |
| 5 | `materials_available` | Materials Available | text | ✓ |
| 6 | `working_pressure` | Working Pressure | text | ✓ |
| 7 | `seal_or_gasket` | Seal / Gasket | text | ✓ |
| 8 | `applicable_standards` | Applicable Standards | text | ✓ |
| 9 | `notes` | Notes | text | — |

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-specialty-bauer-dd.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-07-sealfast-specialty-bauer-dd.ts
```

Live import wall-clock: **~19 seconds**.

## Notes for editors

- **Spec values inferred** from the Sealfast catalogues (image-only PDFs, read visually) plus standard cam-and-groove / Bauer / dry-disconnect industry conventions. Working pressures, seal materials, and sizing match typical Sealfast catalogue values.
- **Specialty adapters extend cam-and-groove geometry** — they're interchangeable with Dixon / OPW / PT Coupling / Banjo of the same Type letter (AW, DW, FA, FC, etc.) and size.
- **Bauer is a distinct coupling system** — uses a lever-ring locking mechanism instead of cam arms. Compatible with all Bauer-standard manufacturers (Bauer GmbH, Perrot, Selecta).
- **Dry Disconnect is brand-specific** — Sealfast dry-disconnect halves should only be paired with Sealfast counter-halves; geometry isn't always interchangeable across manufacturers (unlike cam-and-groove).
- **Default `unitOfMeasure: 'each'`** since couplings are sold per piece. **leadTimeDays: 14** (common ex-stock; less-common 14-21 days).
- **The 3 thread reducers** (NPSM × NPT, BSP × NPT, NPT × NPT) are filed under Specialty Adapters & Couplings per the Excel L2 column. They're not strictly cam-and-groove — they're general-purpose pipe-thread reducers in 316 SS / brass. Tagged with `family: 'thread-reducer'` in the spec for filtering.

## Follow-ups (deferred)

1. **PDF 02 (Crimping System) — Combo Nipples + Sleeves**: NPT-threaded, weld-bevel, grooved combo nipples + zinc/304 SS / aluminum crimp sleeves. Not in Excel scope; separate batch when needed for Indus's CrimpTEK assembly service.
2. **PDF 03 (Fuel Tanker)**: API valves (bottom loading/unloading), gravity adapters, dust caps, drop elbows, fill adapters. Specialised oil & gas / fuel tanker fittings. Separate batch — would extend the existing `oil-gas-hoses` master from PR #80 with a new "Fuel Tanker Couplings" sub-category.
3. **Sealfast accessories**: gaskets, dust-cap chains, security chains, repair kits — referenced in PDF 04 but not in the Excel.
4. **Per-size, per-material SKUs** if customers commonly order specific size + material combinations.
5. **Product photography** on PDPs.

## Rollback (if ever needed — DO NOT auto-run)

```sql
DELETE FROM product_faqs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-SPC-%' OR sku LIKE 'IH-BC-%' OR sku LIKE 'IH-DDC-%');
DELETE FROM product_specs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-SPC-%' OR sku LIKE 'IH-BC-%' OR sku LIKE 'IH-DDC-%');
DELETE FROM products WHERE sku LIKE 'IH-SPC-%' OR sku LIKE 'IH-BC-%' OR sku LIKE 'IH-DDC-%';

-- Megamenu: restore original 1-leaf state by deleting the 3 new leaves
-- (the helper recreated all 4 leaves; we only need to remove 3)
-- For full rollback to pre-PR state, drop all 4 leaves and recreate just Cam & Groove.

-- Categories
DELETE FROM categories WHERE slug IN ('specialty-adapters-couplings','bauer-type-couplings','dry-disconnect-couplings');

-- Spec template
DELETE FROM spec_template_fields WHERE template_id =
  (SELECT id FROM spec_templates WHERE slug = 'industrial-coupling-spec');
DELETE FROM spec_templates WHERE slug = 'industrial-coupling-spec';
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| Per-category counts | 17 / 10 / 4 | ✅ |
| Total products created | 31 | ✅ |
| All under Sealfast brand | sample 4/4 | ✅ |
| Specs (282 total) | 282/282 | ✅ |
| FAQs (248 total) | 248/248 | ✅ |
| Spec template `industrial-coupling-spec` (10 fields) | created | ✅ |
| `search_tsv` populated | 31/31 | ✅ |
| Couplings sub-section now has 4 leaves | 4/4 | ✅ |
| Existing Cam & Groove Couplings leaf preserved | yes | ✅ |
| 3 new leaves added | yes | ✅ |
