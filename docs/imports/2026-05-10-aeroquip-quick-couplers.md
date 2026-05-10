# Import 2026-05-10 — Eaton Aeroquip Quick-Disconnect Coupler Catalogue

**Date:** 2026-05-10
**Branch / PR:** `feat/catalogue-bulk-aeroquip-quick-couplers`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Imports the entire Eaton Aeroquip Quick Disconnect Couplings catalogue (E-MEQD-MC001-E2, 84 pages, 26 series) as **27 series-level products** in the new `quick-couplers` category. Aggressively consolidated: variant axes (size, body material, seal compound, port thread, coupling half) are captured as available-options spec fields and enumerated in the long description, rather than as individual SKUs. A customer searching for any specific Eaton part number (e.g. `FD45-1003-08-10`) lands on the right series PDP via `search_tsv` and specifies the exact configuration in the RFQ form.

This PR also lands the supporting structure:
- New `quick-coupler-spec` spec template (19 fields).
- New `quick-couplers` category under `hoses-fittings`.
- Replaces 4 placeholder `customUrl` leaves under the existing **Quick Couplers** megamenu sub-section with a single category leaf.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 | `eaton-aeroquip` already existed (created in PR #64) |
| Categories | 1 | `quick-couplers` under `hoses-fittings` (position 31) |
| Spec templates | 1 | `quick-coupler-spec` (19 fields, position 23) |
| Products | 27 | series-level — see breakdown below |
| ProductSpec rows | 504 | 27 × ~18.7 (some nullable fields skipped on data files where N/A) |
| ProductFaq rows | 216 | 8 per product |
| NavMenuItem changes | -4, +1 | replaced 4 `customUrl` placeholder leaves under "Quick Couplers" sub with 1 category leaf |

### SKUs (27)

Per the user's consolidation directive, body-material variants (steel/brass/SS) and seal variants (Buna-N/Viton/EPR) collapse into single products. Most series → 1 product; a few series with distinct valving styles → 2-3 products.

#### Hydraulic / Fluid Transfer (14)

- `EATON-FD35` — 10,000 psi Arc Latch™
- `EATON-FD45-VALVED` — ISO 7241/1 Series B Valved (steel/brass/SS combined)
- `EATON-FD45-NON-VALVED` — ISO 7241/1 Series B Non-Valved
- `EATON-FD45-PUSHER` — ISO 7241/1 Series B Pusher-Style
- `EATON-FD48` — Parker Bruning SM-250 Interchange
- `EATON-FD49` — NFPA T3.20.15 HTMA Interchange
- `EATON-5100` — Thread-to-Connect brass body
- `EATON-5600-VALVED` — ISO 7241/1 Series A Valved
- `EATON-5600-NON-VALVED` — ISO 7241/1 Series A Non-Valved
- `EATON-FD86` — 5,000 psi Dry Break Thread-to-Connect
- `EATON-FD89` — ISO 16028 Flush Face
- `EATON-FD89-2000` — 316 SS ISO 16028 Flush Face
- `EATON-FD96` — High-Pressure Thread-to-Connect Flush Face
- `EATON-FD99` — High-Pressure Flush Face ISO 16028

#### Farm Hydraulic (2)

- `EATON-FD72` — Connect-Under-Pressure Farm ISO 5675 Female
- `EATON-FD70-FD76` — Farm Tractor Male Tip (Deere / ISO 5675)

#### Diagnostics (3)

- `EATON-FD15` — Hydraulic Oil Sampling Valve
- `EATON-FD90` — SAE J1502 Diagnostic Test-Point Coupler
- `EATON-FF14802` — Hydraulic Pressure Gauge Test Kit

#### Specialty (4)

- `EATON-FD14` — FLOCS Oil Drain Coupling
- `EATON-FD31` — Enerpac-Interchange 10,000 psi Hydraulic Jack Coupler
- `EATON-FD69` — 10,000 psi Water Blast Arc Latch
- `EATON-FD83` — Full-Flow Dual-Interlock Stainless (Electronics Cooling)

#### Refrigerant (1)

- `EATON-5400` — Low-Air-Inclusion Refrigerant

#### Air (3)

- `EATON-FD40` — MIL-C-4109 Push-to-Connect Industrial Interchange
- `EATON-FD41` — ARO 210 Interchange
- `EATON-FD43` — MIL-C-4109 Manual-Retract

## Spec template — `quick-coupler-spec` (19 fields)

Designed for series-level products. Variant axes are text fields enumerating the available options rather than constrained selects, so a single product represents an entire catalogue series.

**Identification (4):** series, interchange_standard, application_class (select), valving (select)
**Variants (5):** available_sizes, available_body_materials, available_seal_materials, available_port_threads, available_halves
**Construction (3):** connection_method (select), flush_face (boolean), connect_under_pressure (boolean)
**Performance (6):** max_operating_pressure_bar, min_burst_pressure_bar, rated_flow_lpm_max, vacuum_rating_in_hg, temp_min_c, temp_max_c
**Compliance (1):** interchange_with

## Megamenu

**Before:** "Quick Couplers" sub-section had 4 placeholder `customUrl` leaves (ISO 7241-A, ISO 7241-B, Flat Face, Screw-to-Connect) — none linked to real categories.

**After:** Single `Quick Couplers` leaf linking to `/c/quick-couplers`. The application-class faceting (Hydraulic / Farm / Air / Refrigerant / Diagnostic / Specialty) is exposed via PLP filters, not megamenu sub-leaves, per the user directive to keep the megamenu uncluttered.

## Defaults applied

- Brand: `eaton-aeroquip` (existing, USA, isAuthorizedDistributor: true)
- Currency: AED
- Pricing: `listPrice = null` → "Request a Quote" CTA
- Status: `active`
- Country of origin: USA
- Lead time: 14 days (bumped from playbook default 7d to reflect USA import lead time)
- Unit of measure: `each`
- Stock qty: 0

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-10-aeroquip-quick-couplers.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-10-aeroquip-quick-couplers.ts
```

Default mode is `add-only` — re-running is safe; it won't clobber any admin manual edits to specs / FAQs.

## Notes for editors

- **PDPs aggregate the entire series.** Customers see all available sizes, materials, seals, port threads in one PDP and specify the exact configuration in the RFQ form. Sample Eaton part numbers are listed in the long description so search hits the right PDP.
- **Some specs come back blank.** 9 spec rows were skipped at import — these are nullable fields like `interchange_standard` for proprietary-only series (FD35, 5100, FD86, FD96, FD69, FD83, FD14, 5400, FF14802) where there's no public interchange standard. Storefront should render these as blank, not error.
- **`interchange_with` is free-text.** Cross-reference to competitor brands (Parker, Snap-tite, Faster, Stucchi, Hansen) is captured as a free-text spec — the catalogue's competitor-cross-reference table is preserved as a search aid, not as separate products.

## Follow-ups (deferred)

1. **Image assets.** No product images are imported in this batch. PDPs render the placeholder image until images are uploaded via admin or a future image-batch PR.
2. **Datasheet PDFs.** The Eaton catalogue (E-MEQD-MC001-E2.pdf) should be uploaded as a downloadable datasheet linked from each PDP — handle in a separate media-bulk PR.
3. **Per-application landing pages.** If application-class facets (e.g. /c/quick-couplers?application=Air) prove useful in storefront analytics, consider promoting them to dedicated child categories (e.g. `air-quick-couplers`) in a future iteration. For now they live as PLP filters.
4. **Brand-page Eaton spotlight.** The Eaton brand page (`/brand/eaton-aeroquip`) now has 27 products. Consider adding a brand-specific landing layout highlighting the catalogue scope.

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- Delete megamenu leaf
DELETE FROM nav_menu_items WHERE label = 'Quick Couplers' AND link_type = 'category'
  AND category_id = (SELECT id FROM categories WHERE slug = 'quick-couplers');

-- Re-create the original 4 placeholder leaves under the Quick Couplers sub
-- (mirror seed.ts); see seed.ts for original definitions if needed.

-- Delete products + cascade specs/faqs
DELETE FROM products WHERE sku LIKE 'EATON-%';

-- Delete category
DELETE FROM categories WHERE slug = 'quick-couplers';

-- Delete spec template + cascade fields
DELETE FROM spec_templates WHERE slug = 'quick-coupler-spec';
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| Products created | 27 | ✅ 27 |
| All `status='active'` | 27 | ✅ 27 |
| All `brand='eaton-aeroquip'` | 27 | ✅ 27 |
| All `category='quick-couplers'` | 27 | ✅ 27 |
| All have 8 FAQs | 27 | ✅ 27 |
| Specs per product | 17-19 | ✅ 18-19 (variation due to nullable interchange_standard) |
| `search_tsv` populated | 27 | ✅ 27 |
| Spec template fields | 19 | ✅ 19 |
| Megamenu leaves under "Quick Couplers" | 1 (was 4 placeholders) | ✅ 1 (`Quick Couplers` → `quick-couplers`) |
| Category linked to spec template | yes | ✅ `quick-coupler-spec` |
