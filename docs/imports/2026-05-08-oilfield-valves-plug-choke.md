# Import 2026-05-08 — Oilfield Valves Batch 3 (Plug Valves + Choke Valves)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-oilfield-valves-3`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Fourth batch in the Oilfield Valves initiative. Lands 16 plug valves + 12 choke valves in two new sub-categories, introduces a new megamenu sub-section ("Pressure & Flow Control") for choke valves, and extends the import library with **array-based navigation** so that one batch can perform multiple sub-section operations atomically.

The plug-valve mix covers Lubricated (LT, sealant-injected) and Non-lubricated (TE, PEEK-lined) designs, including 4 reducing-bore (2"×1") variants for adapting frac iron to small lines. The choke-valve mix covers Adjustable Manual (N-60 and H2 trim families) and Positive (FC-140 fixed bean) designs.

End-connection mix: Weco unions (1502 / 602 / 206) for frac iron, API 6A flanged (5M / 15M) for wellhead, ANSI raised-face (300# / 900#) for process-plant. Pressures 740 psi → 15K psi. Service split: 22 sour (NACE MR0175) + 6 standard. Brand split: Anson 6, SPM 5, WOM 4, FMC 4, Cameron 4, Indus 3, Stream-Flo 2.

### What was created / updated

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 | All 6 OEM + Indus reused |
| Categories | 2 created | `oilfield-plug-valves` (pos 4), `oilfield-choke-valves` (pos 5) |
| Spec template | 0 changes | `oilfield-valve-spec` (15 fields) covers both plug and choke fully |
| Products | 28 created | 16 plug + 12 choke |
| ProductSpec rows | 420 created | 28 × 15 |
| ProductFaq rows | 224 created | 28 × 8 |
| NavMenuItem changes | -4, +6 | "Wellhead & Frac" sub leaves grow 4 → 5 (Plug Valves added between Gate and Check); new "Pressure & Flow Control" sub created with 1 leaf (Choke Valves) |

### Framework change

Extended the import library to support **multiple navigation operations per batch** (additive, backward-compatible):

- `packages/db/src/import/types.ts` — `navigation` field now accepts `NavReplaceLeavesSchema | NavReplaceLeavesSchema[]` instead of just the single object form. Existing data files continue to work unchanged.
- `packages/db/src/import/cli.ts` — runner detects single-vs-array and loops through configs, accumulating delete/insert counters in the summary.

This unlocks batches that touch more than one sub-section in the same transaction (this batch needs both — extending an existing sub AND creating a new one).

### Type breakdown

| Category | Sub-type | Count |
|---|---|---|
| Plug | Lubricated (LT) — Manual | 5 |
| Plug | Lubricated (LT) — Gear-Operated | 1 |
| Plug | Non-lubricated (TE) — Manual | 9 |
| Plug | Non-lubricated (TE) — Gear-Operated | 1 |
| Choke | Adjustable Manual (N-60 trim) | 3 |
| Choke | Adjustable Manual (H2 trim) | 5 |
| Choke | Positive (FC-140 trim) | 4 |

4 of the plug valves are **reducing-bore (2"×1")** — bridging 2-inch frac iron to 1-inch lines for instrument tap-offs, kill / circulation, and small-line pump-in.

### Brand mix

| Brand | Plug | Choke | Total |
|---|---|---|---|
| Anson | 4 | 2 | 6 |
| SPM Oil & Gas | 3 | 2 | 5 |
| WOM | 2 | 2 | 4 |
| FMC | 2 | 2 | 4 |
| Cameron | 2 | 2 | 4 |
| Indus | 2 | 1 | 3 |
| Stream-Flo | 1 | 1 | 2 |
| **Total** | **16** | **12** | **28** |

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-plug-choke.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-plug-choke.ts
```

The framework change is already merged into the main importer when this batch lands. Existing import data files (Batches 0/1/2 and earlier hose / coupling / lubricant batches) keep working with their single-object navigation field.

## Notes for editors

- **Big Iron Flow has 124 plug valves and 45 choke valves** in their public catalogue — we sampled 28 representative configurations across the most common sizes / pressures / service classes. Future batches can extend without revisiting the framework.
- **Reducing-bore plug valves** (e.g. 2"×1") are stored with `nominalSize: '2 in × 1 in'` and `bore_type: 'Reduced Port'`. Buyers searching for "reducing plug valve 1502" hit them via title + descriptionLong full-text search.
- **Lubricated (LT) vs Non-lubricated (TE)** distinction is captured in title and description, NOT as a dedicated spec field. The valve_type column is generic ('Plug') for both. Search picks up "lubricated plug valve" / "non-lubricated plug valve" phrases.
- **Choke trim model** (N-60, H2, FC-140, with optional 5x7 gear suffix) lives in title and descriptionLong. Same for the bean-max descriptor (3/4 in max, 2 in max, 3 in nominal × 2 in max).
- **Autoclave taps** (small instrumentation taps for pressure / sample) are flagged in title via "with autoclave tap" or similar — the chokes that include them are noted in their descriptionLong's options bullet.
- **Two products use API 6A flanged ends** (the 2-1/16" 15M plug valves) — these are wellhead Christmas tree side-outlet plugs at PSL 3 / PR1. Lead time 56 days reflects the OEM build slot for API 6A monogram-grade equipment.
- **Megamenu impact:** the "Pressure & Flow Control" sub-section under Oilfield Valves now exists with one leaf. Subsequent batches (Batch 4 — Globe + PRV + Butterfly) will fill it out further.

## Follow-ups (deferred)

1. **Batch 4 — Globe + Pressure Relief + Butterfly** (~15–20 products). Likely all goes under the "Pressure & Flow Control" sub-section established in this batch (PRV and Globe), with Butterfly possibly going under "Wellhead & Frac" or a new "General Service" sub.
2. **Batch 5 — Instrumentation + Valve Accessories** (~15–25 products).
3. **Manifolds** still deferred (~126 SKUs, needs `oilfield-manifold-spec`).
4. **Plug + Choke long-tail** — Big Iron Flow has 124 + 45 = 169 total plug + choke products. We've covered 28 representative configurations. The remaining ~140 are mostly variations within the same families (different pressure × size × service combinations) that can be added in subsequent batches as buyer demand surfaces.
5. **Optional `plug_seal_design` field** — could split valve_type into `(Plug, Lubricated LT)` vs `(Plug, Non-lubricated TE)` for filtering. Currently captured in title only.
6. **Optional `choke_trim_model` field** — N-60 / H2 / FC-140 / 5x7 are common search terms. Currently captured in title + description.

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- 1. Revert "Wellhead & Frac" sub leaves to 4 (remove Plug Valves leaf)
DELETE FROM nav_menu_items WHERE label = 'Plug Valves' AND parent_id IN (
  SELECT id FROM nav_menu_items WHERE label = 'Wellhead & Frac' AND parent_id IN (
    SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
  )
);

-- 2. Drop the entire "Pressure & Flow Control" sub-section (and its Choke Valves leaf)
DELETE FROM nav_menu_items WHERE parent_id IN (
  SELECT id FROM nav_menu_items WHERE label = 'Pressure & Flow Control' AND parent_id IN (
    SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
  )
);
DELETE FROM nav_menu_items WHERE label = 'Pressure & Flow Control' AND parent_id IN (
  SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
);

-- 3. Delete products and their cascaded specs/FAQs
DELETE FROM products WHERE sku LIKE 'IH-OFV-PLUG-%' OR sku LIKE 'IH-OFV-CHOKE-%';

-- 4. Delete sub-categories
DELETE FROM categories WHERE slug IN ('oilfield-plug-valves', 'oilfield-choke-valves');

-- Note: framework changes (types.ts, cli.ts) are NOT reverted by this rollback
-- — they are backward-compatible and harmless if no batch uses array-form
-- navigation.
```

## Verification (run before PR opened — pass)

| Check | Expected | Result |
|---|---|---|
| 2 sub-categories under `oilfield-valves` | yes | ✓ pos 4, 5 |
| Products with status='active' | 28 | ✓ 28 |
| Each product has 15 specs + 8 FAQs | 28 each | ✓ 28/28 |
| Plug valves correctly in `oilfield-plug-valves` | 16 | ✓ 16 |
| Choke valves correctly in `oilfield-choke-valves` | 12 | ✓ 12 |
| Brand split: Anson 6, SPM 5, WOM 4, FMC 4, Cameron 4, Indus 3, Stream-Flo 2 | yes | ✓ |
| `search_tsv` populated for new products | 28 | ✓ 28 |
| Megamenu "Wellhead & Frac" sub has 5 leaves | yes | ✓ Ball, Gate, Plug, Check, SSV |
| Megamenu "Pressure & Flow Control" sub created with Choke Valves leaf | yes | ✓ |
| Catalogue total active products | 733 → 761 | ✓ 761 |
| Cumulative oilfield valves across Batches 0-3 | 77 | ✓ 77 |
