# Import 2026-05-08 — Oilfield Valves Batch 1 (Gate Valves + SSV/ESD)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-oilfield-valves-1`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Second batch in the Oilfield Valves initiative. Adds 13 gate valves (Hydraulic FC, Manual FC, Manual FLS, Slab) and 3 Surface Safety Valves (SSV / SAH) to the Oilfield Valves column established in Batch 0 (PR #86). Two new sub-categories appear under `oilfield-valves`, the spec template gains one field (`material_class_api`) and the `pr_class` field gains a `PR2F` option, and the megamenu's "Wellhead & Frac" sub-section now has three leaves (Ball Valves, Gate Valves, SSV & ESD Valves).

All 16 products are API 6A wellhead-flanged (5K/10K/15K psi, RTJ ring-joint sealing). Service split: 14 sour (NACE MR0175) + 2 standard. Brand split: Cameron 5, FMC 4, WOM 3, Stream-Flo 3, Indus 1.

### What was created / updated

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 created | All 6 OEM brands from Batch 0 reused |
| Categories | 2 created | `oilfield-gate-valves` (pos 1), `oilfield-ssv-esd-valves` (pos 2) — both under `oilfield-valves` |
| Spec template | 1 updated | `oilfield-valve-spec`: +1 field (`material_class_api`, 11 options), `pr_class` extended with `PR2F` option, all 14 existing fields refreshed (no semantic change) |
| Products | 16 created | 13 gate + 3 SSV |
| ProductSpec rows | 240 created | 16 × 15 (now 15 fields after adding `material_class_api`) |
| ProductFaq rows | 128 created | 16 × 8 |
| NavMenuItem changes | -1, +3 | "Wellhead & Frac" sub now has 3 leaves: Ball Valves (preserved), Gate Valves, SSV & ESD Valves |

### SKUs

**Gate Valves (13)** — `IH-OFV-GATE-{SIZE}-{PRESSURE}-{ACTUATOR}-{BRAND}`:

- `IH-OFV-GATE-3116-10K-HYD-FC-FMC` — Hydraulic FC, 3-1/16 in × 10M, 10K psi sour, EE-1.5
- `IH-OFV-GATE-3116-15K-HYD-FC-CAMERON` — Hydraulic FC, 3-1/16 in × 15M, 15K psi sour, EE-0.5
- `IH-OFV-GATE-318-5K-HYD-FC-FMC` — Hydraulic FC, 3-1/8 in × 5M, 5K psi sour, EE-0.5 (PR2)
- `IH-OFV-GATE-4116-5K-HYD-FC-STREAMFLO` — Hydraulic FC, 4-1/16 in × 5M, 5K psi sour, EE-0.5 (PR2)
- `IH-OFV-GATE-2116-10K-MAN-FC-WOM` — Manual, 2-1/16 in × 10M, 10K psi sour, EE
- `IH-OFV-GATE-2116-5K-MAN-FC-INDUS` — Manual, 2-1/16 in × 5M, 5K psi sour, EE (Indus house)
- `IH-OFV-GATE-3116-10K-MAN-FC-WOM` — Manual, 3-1/16 in × 10M, 10K psi sour, EE-1.5
- `IH-OFV-GATE-3116-15K-MAN-FC-CAMERON` — Manual, 3-1/16 in × 15M, 15K psi sour, EE-0.5
- `IH-OFV-GATE-4116-5K-MAN-FC-STREAMFLO` — Manual, 4-1/16 in × 5M, 5K psi sour, EE
- `IH-OFV-GATE-11316-15K-MAN-FLS-CAMERON` — Manual FLS, 1-13/16 in × 15M, 15K psi sour gas, EE-1.5 (PSL 3G)
- `IH-OFV-GATE-3116-10K-MAN-FLS-WOM` — Manual FLS, 3-1/16 in × 10M, 10K psi fire-tested sour, EE-1.5 (PR2F)
- `IH-OFV-GATE-318-5K-MAN-FLS-STREAMFLO` — Manual FLS, 3-1/8 in × 5M, 5K psi fire-tested sour, EE-1.5 (PR2F)
- `IH-OFV-GATE-3116-15K-SLAB-FMC` — Slab manual, 3-1/16 in × 10M, 15K psi severe sour, **HH** Inconel 625 cladded (PSL 3G)

**SSVs (3)** — `IH-OFV-SSV-{SIZE}-{PRESSURE}-{OUTLET}-{BRAND}`:

- `IH-OFV-SSV-3116-10K-1502-CAMERON` — Hydraulic, 3-1/16 in × 10M flanged inlet × 3 in 1502 F×M outlet, 10K psi sour, EE-1.5 (frac iron adapter)
- `IH-OFV-SSV-2116-15K-FE-CAMERON` — Hydraulic, 2-1/16 in × 15M flanged-each, 15K psi sour, EE-0.5
- `IH-OFV-SSV-3116-15K-FE-FMC` — SAH (Surface Actuated Hydraulic), 3-1/16 in × 15M flanged-each, 15K psi sour, EE-HF (premium)

### Size encoding cheat-sheet

The size token after `IH-OFV-GATE-` / `IH-OFV-SSV-` compresses fractional dimensions:

| Token | Reads as |
|---|---|
| `11316` | 1-13/16 in |
| `2116` | 2-1/16 in |
| `3116` | 3-1/16 in |
| `318` | 3-1/8 in |
| `4116` | 4-1/16 in |

The product title and spec table show the readable size (e.g. "3-1/16 in"). The compressed form is for SKU identifiers only.

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-gate-ssv.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-gate-ssv.ts
```

`add-only` mode is idempotent. The spec-template upsert is additive (existing fields update, new fields insert, no orphan removal).

## Notes for editors

- **Batch 0 ball valves don't have `material_class_api` data.** This is expected — `add-only` mode does not back-fill new fields onto existing products. Ball-valve PDPs will show 14 specs while gate/SSV PDPs show 15. To back-fill, run a one-off `--mode=overwrite-edits` import on the Batch 0 file with the new field added, OR edit each product manually via `/admin/products/[id]`. Batch 0 ball valves were sour-class via `service_class` only — most have no formal API 6A material class anyway since Weco-union flow iron isn't strictly API 6A. Decision deferred to follow-up.
- **`PR2F` is fire-tested PR2** per API 6FA. Distinct from `PR2` which is high-temperature only. Two products use it (the WOM and Stream-Flo FLS-option fire-rated valves).
- **`HH` material class** signals severe sour-service (high alloy, Inconel cladding). One product (the FMC slab gate) uses it. Lead time 84 days reflects the build complexity.
- **FLS (Fail Last Stable)** is an actuator option, not a valve-body distinction. The body is the same as the FC variant — the actuator construction differs. We list FLS valves as `valve_type = "Gate — Manual"` with the FLS detail in title and description; future filtering on FLS could be added via a dedicated field if buyers ask.
- **SSV title format** carries the inlet × outlet detail (especially for the Cameron 1502-outlet variant) — buyers searching for `1502 SSV` or `frac iron SSV` will hit it via the title and description text.

## Follow-ups (deferred)

1. **Batch 2 — Check Valves** (~22 products at source). Adds `oilfield-check-valves` sub-category, extends "Wellhead & Frac" sub with a Check Valves leaf.
2. **Batch 3 — Plug Valves + Choke Valves** (~20–25 products). Likely needs a new sub-section under the column ("Pressure & Flow Control").
3. **Batch 4 — Globe + Pressure Relief + Butterfly** (~15–20 products).
4. **Batch 5 — Instrumentation + Valve Accessories** (~15–25 products).
5. **Manifolds** still deferred (~126 SKUs at source) — needs `oilfield-manifold-spec` template.
6. **Back-fill `material_class_api` on Batch 0 ball valves** if/when needed for reporting consistency.
7. **API 6A monogram badge** on Batch 1 products — visual cue on PDP / category card. Decide between a generic "API 6A" badge (current data-driven approach) vs the official API monogram artwork (requires licence).

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- 1. Revert megamenu leaves under "Wellhead & Frac" to Batch 0 state (Ball Valves only)
DELETE FROM nav_menu_items WHERE label IN ('Gate Valves', 'SSV & ESD Valves') AND parent_id IN (
  SELECT id FROM nav_menu_items WHERE label = 'Wellhead & Frac' AND parent_id IN (
    SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
  )
);

-- 2. Delete products and their cascaded specs/FAQs
DELETE FROM products WHERE sku LIKE 'IH-OFV-GATE-%' OR sku LIKE 'IH-OFV-SSV-%';

-- 3. Delete sub-categories
DELETE FROM categories WHERE slug IN ('oilfield-gate-valves', 'oilfield-ssv-esd-valves');

-- 4. Optional: revert spec template (drop material_class_api field, revert pr_class options)
DELETE FROM spec_template_fields WHERE template_id = (SELECT id FROM spec_templates WHERE slug = 'oilfield-valve-spec') AND key = 'material_class_api';
UPDATE spec_template_fields SET options = '["PR1","PR2","N/A"]'::jsonb WHERE template_id = (SELECT id FROM spec_templates WHERE slug = 'oilfield-valve-spec') AND key = 'pr_class';
```

## Verification (run before PR opened — pass)

| Check | Expected | Result |
|---|---|---|
| 2 sub-categories under `oilfield-valves` | yes | ✓ pos 1, pos 2 |
| `oilfield-valve-spec` has 15 fields | 15 | ✓ 15 |
| `material_class_api` field present at position 14 with 11 options | yes | ✓ |
| `pr_class` options include `PR2F` | yes | ✓ |
| Products with status='active' | 16 | ✓ 16 |
| Each product has 15 specs + 8 FAQs | 16 each | ✓ 16/16 |
| Brand split: Cameron 5, FMC 4, WOM 3, Stream-Flo 3, Indus 1 | yes | ✓ |
| `search_tsv` populated for new products | 16 | ✓ 16 |
| Megamenu "Wellhead & Frac" has 3 leaves (Ball/Gate/SSV) | yes | ✓ |
| Catalogue total active products | 695 → 711 | ✓ 711 |
| Batch 0 ball-valves regression — still 14 specs each (no material_class_api back-fill) | yes | ✓ 11/11 at 14 |
