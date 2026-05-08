# Import 2026-05-08 — Oilfield Valves Batch 0 (framework + 11 ball valves)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-oilfield-valves-0`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

First batch in the Oilfield Valves initiative. Establishes the foundations — 6 OEM brand records, a new spec template (`oilfield-valve-spec`, 14 fields), a new top-level category (`oilfield-valves`, parallel to `oil-gas-hoses`), and a new megamenu column — and lands 11 ball-valve products to validate the full pipeline. Subsequent batches (Gate + SSV, Check, Plug + Choke, Globe + PRV + Butterfly, Instrumentation + Accessories) will fill out the column.

The valve products span floating + trunnion designs, 285 psi → 15,000 psi working pressures, with Weco union (1502/602/206), API 6A wellhead-flanged, ANSI raised-face, and butt-weld end connections. Brand distribution: WOM 4, Anson 3, SPM 2, Cameron 1, Indus 1.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 6 | Cameron (USA), FMC Technologies (USA), WOM (USA), Anson (UK), SPM Oil & Gas (USA), Stream-Flo Industries (Canada). All `isAuthorizedDistributor: false` until formal distributor agreements land. |
| Categories | 2 | `oilfield-valves` (top-level, position 9, default spec template `oilfield-valve-spec`); `oilfield-ball-valves` (child of `oilfield-valves`, position 0). |
| Spec templates | 1 | `oilfield-valve-spec` — 14 fields covering valve type, size, working pressure, pressure class, end connections (in/out), service class, API spec, PSL/PR class, body/trim/seal materials, bore type. Field positions 0–13 sequential. |
| Products | 11 | See SKUs below. |
| ProductSpec rows | 154 | 11 products × 14 spec fields. |
| ProductFaq rows | 88 | 11 products × 8 FAQs. |
| NavMenuItem changes | -0, +1 leaf, +1 sub-section, +1 column | New column "Oilfield Valves" at megamenu position 9, with new sub-section "Wellhead & Frac" containing leaf "Ball Valves" → `oilfield-ball-valves`. |

### SKUs

All products use the `IH-OFV-BALL-{SIZE}-{CONN}-{PRESSURE}-{SERVICE}-{BRAND}` pattern:

- `IH-OFV-BALL-2-1502FM-10K-SOUR-WOM` — Floating, 2 in × 1502 F×M, 10K psi, sour
- `IH-OFV-BALL-2-1502MF-10K-SOUR-ANSON` — Floating, reverse F×M orientation
- `IH-OFV-BALL-2-1502FM-15K-STD-WOM` — Trunnion, 2 in, 15K psi standard
- `IH-OFV-BALL-2-602FM-6K-SOUR-ANSON` — Floating, 6K psi sour (production-test iron)
- `IH-OFV-BALL-2-206FM-2K-STD-SPM` — Floating, 2K psi standard (cementing iron)
- `IH-OFV-BALL-3-1502FM-15K-STD-ANSON` — Trunnion, 3 in, 15K psi standard
- `IH-OFV-BALL-3-5M-FLG-5K-SOUR-WOM` — Trunnion, 3-1/8 in × 5M API 6A flanged, 5K psi sour, PSL 3 / PR1
- `IH-OFV-BALL-4-600RF-1480-SOUR-CAMERON` — Trunnion, 4 in × ANSI 600# RF, 1,480 psi sour, API 6D
- `IH-OFV-BALL-4-1502FM-10K-SOUR-WOM` — Trunnion, 4 in, 10K psi sour (sand/water blender service)
- `IH-OFV-BALL-2-150RF-285-STD-INDUS` — Floating, 2 in × ANSI 150# RF, 285 psi (utility)
- `IH-OFV-BALL-2-BW160-5K-SOUR-SPM` — Floating, 2 in butt-weld Sch 160, 5K psi sour

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-ball.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-ball.ts
```

`add-only` mode (default) is idempotent — re-running skips existing brands/categories/specs/FAQs and only updates the Product row. Use `--mode=overwrite-edits` if you need to delete-and-recreate specs/FAQs from this data file (clobbers admin manual edits).

## Notes for editors

- **Brand `isAuthorizedDistributor: false`** for all 6 OEM brands. Switch to `true` per brand from `/admin/brands` once a formal distribution agreement is in place. The flag controls whether the storefront displays the "Authorised Distributor" badge.
- **Country of origin per product** matches the OEM brand origin (USA / UK / Canada / UAE for Indus).
- **Lead times** vary: 7 days for Indus, 14–35 days for OEM products depending on whether they're ex-stock or build-to-order. These are placeholders — adjust per real-world OEM availability.
- **Pricing is RFQ-only** (`listPrice = null`) — products show "Request a Quote" CTA. No `compareAtPrice` set.
- **Sour-service compliance** is flagged via `service_class` = "Sour (NACE MR0175)". 7 of 11 products are sour-rated, 4 are standard.
- **The new megamenu column starts thin** — only one leaf (Ball Valves) until subsequent batches land. As Gate / SSV / Check / Plug / Choke products are added, more sub-sections and leaves appear under the same column.

## Follow-ups (deferred)

1. **Batch 1 — Gate Valves + SSV/ESD** (~25–30 products). Will add a sub-section "Wellhead & Frac" leaves for Gate Valves and SSV/ESD Valves, plus a new sub-section if scope grows.
2. **Batch 2 — Check Valves** (~22 products, observed at source).
3. **Batch 3 — Plug Valves + Choke Valves** (~20–25 products).
4. **Batch 4 — Globe + Pressure Relief + Butterfly** (~15–20 products).
5. **Batch 5 — Instrumentation Valves + Valve Accessories** (~15–25 products).
6. **Manifolds** were deferred from this initiative — they are skid assemblies (~126 products at source) and need a separate `oilfield-manifold-spec` template.
7. **Promote brands to `isAuthorizedDistributor: true`** once formal OEM agreements are signed.
8. **Brand logos** — none uploaded yet; brand list pages will use the default placeholder until logos land in `/admin/brands/[id]/edit`.

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- 1. Delete megamenu leaves under the new sub
DELETE FROM nav_menu_items WHERE label = 'Ball Valves' AND parent_id IN (
  SELECT id FROM nav_menu_items WHERE label = 'Wellhead & Frac' AND parent_id IN (
    SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
  )
);

-- 2. Delete the sub-section
DELETE FROM nav_menu_items WHERE label = 'Wellhead & Frac' AND parent_id IN (
  SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
);

-- 3. Delete the column
DELETE FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves') AND parent_id IS NULL;

-- 4. Delete products and their cascaded specs/FAQs
DELETE FROM products WHERE sku LIKE 'IH-OFV-BALL-%';

-- 5. Delete categories (sub first, then parent)
DELETE FROM categories WHERE slug = 'oilfield-ball-valves';
DELETE FROM categories WHERE slug = 'oilfield-valves';

-- 6. Delete spec template (cascades to fields)
DELETE FROM spec_templates WHERE slug = 'oilfield-valve-spec';

-- 7. Delete OEM brands
DELETE FROM brands WHERE slug IN ('cameron', 'fmc-technologies', 'wom', 'anson', 'spm-oil-gas', 'stream-flo');
```

## Verification (run before PR opened — pass)

| Check | Expected | Result |
|---|---|---|
| Brands created with isAuthorizedDistributor=false, isPublished=true | 6 | ✓ 6 |
| Categories: oilfield-valves (top-level) + oilfield-ball-valves (child) | 2 | ✓ 2 |
| oilfield-valve-spec template with 14 fields, position=19 | yes | ✓ |
| Products with status='active' | 11 | ✓ 11 |
| Each product has 14 specs + 8 FAQs | 11 each | ✓ 11/11 |
| All products in `oilfield-ball-valves` category | 11 | ✓ 11 |
| `search_tsv` populated for new products | 11 | ✓ 11 |
| Megamenu column "Oilfield Valves" at position 9 | yes | ✓ |
| Sub-section "Wellhead & Frac" + leaf "Ball Valves" → oilfield-ball-valves | yes | ✓ |
| Brand distribution: WOM 4, Anson 3, SPM 2, Cameron 1, Indus 1 | yes | ✓ |
| Catalogue total active products | 684 → 695 | ✓ 695 |
