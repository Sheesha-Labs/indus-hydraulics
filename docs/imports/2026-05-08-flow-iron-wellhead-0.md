# Import 2026-05-08 — Flow Iron & Wellhead Batch 0 (framework + 57 PDPs)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-flow-iron-wellhead-0`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Establishes the **Flow Iron & Wellhead** product family on Indus Hydraulics — a brand-new top-level catalogue area mirroring industry-standard frac-iron and wellhead OEM categories (FMC, Cameron, SPM, Anson, Stream-Flo, NOV, Indus). Lays down the framework (top-level category + 3 sub-categories + new spec template + new megamenu column) and ships 57 consolidated PDPs across **Adapters**, **Fittings**, and **API Flanges**.

Each PDP is a **family page** consolidating multiple BIF-style per-size SKUs into one rich, OEM-keyworded product page. Sizes available are listed in description, FAQs, and the `available_sizes` spec field — so a single "Crossover Union, 1502 M×F, 15K, STD" PDP serves search traffic for 2 in / 3 in / 4 in variants and ranks for "FMC WECO 1502", "SPM 1502", "Anson 1502" naming.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 1 | `nov` (National Oilwell Varco). Halliburton + Forum Energy deferred to Batch 1 (manifolds) and Batch 2 (surface test trees). |
| Categories | 4 | `flow-iron-wellhead` (top-level, position 10) + `flow-iron-adapters` + `flow-iron-fittings` + `flow-iron-flanges-api` |
| Spec templates | 1 | `flow-iron-spec` (position 20, 16 fields) — covers Adapters, Fittings, Flow Line, Manifolds via `flow_iron_type` discriminator |
| Products | 57 | Consolidated PDPs covering ~600+ underlying BIF SKU permutations |
| ProductSpec rows | 816 | Average 14.3 spec values per PDP (96 optional fields skipped) |
| ProductFaq rows | 456 | 8 OEM-keyword-rich FAQs per PDP |
| NavMenuItem changes | -0, +3 | New megamenu column "Flow Iron & Wellhead" at position 10 with sub-section "Flow Iron" → 3 leaves (Adapters, Fittings, API Flanges) |

### Brand allocation across the 57 PDPs

| Brand | Count | Why this allocation |
|---|---|---|
| FMC Technologies | 21 | WECO is FMC-owned — assign FMC to the canonical 1502/1002/602/206 frac-iron products and Chiksan-era swivel-related items |
| Indus Hydraulics | 16 | House brand for items where no single OEM dominates the search profile (BSL bolting, ring gaskets, hub-clamp generic, instrument flanges, mid-pressure stock items) |
| Anson | 7 | UK frac-iron OEM — strong on hammer unions, crosses, tees, elbows, wyes |
| Cameron | 6 | Wellhead and API 6BX flanged dominance — assigned to flanged adapters, studded fittings, blind/companion/weld-neck flanges |
| SPM Oil & Gas | 5 | Frac-iron / pressure-pumping leader — crosses, tees, elbows, wyes |
| Stream-Flo | 1 | Wellhead specialist — first weld-neck flange entry; heavier coverage in Batch 2 (Wellhead) |
| NOV | 1 | Flow iron + wellhead breadth — first 15K blind flange; heavier coverage in Batch 1 (manifolds) and Batch 2 (wellhead) |

### Phase A SKUs (57 total)

**Adapters (15)**
- Crossover Unions (10): IH-FI-XO-1502-MM-15K-STD-FMC, IH-FI-XO-1502-MF-15K-STD-FMC, IH-FI-XO-1502-FF-15K-STD-SPM, IH-FI-XO-1502-MF-10K-SOUR-ANSON, IH-FI-XO-1502-RED-15K-STD-FMC, IH-FI-XO-1002-MM-10K-STD-FMC, IH-FI-XO-602-MF-6K-STD-INDUS, IH-FI-XO-602-MF-6K-SOUR-FMC, IH-FI-XO-206-MF-2K-STD-ANSON, IH-FI-XO-206-MF-2K-SOUR-FMC
- WECO Adapter Flanges (3): IH-FI-AF-10K-1502-FMC, IH-FI-AF-15K-1502-CAMERON, IH-FI-AF-5K-602-INDUS
- Studded / Flanged Adapters (2): IH-FI-DSA-API-5K-3K-CAMERON, IH-FI-DFA-RTJ-2500-INDUS

**Fittings (32)**
- Hammer Unions (8): 1502/1002/602/400/206/200/100 series across NPT and BW ends, STD and Sour variants
- Crosses (5): 1502 series MMMF/FFFM/MMFF + 602 + 206
- Tees (5): 1502 series MFF/FFM/MMF + 602 sour
- Elbows (4): 1502 LR-90 STD + Sour, 602 LR-90 sour, 206 45° BW sour
- Wyes (3): 1502 straight + lateral configurations
- Blanking Caps (3): 1502 male + female, 602 sour pair
- Studded Fitting (1): API 6BX 10K/15K
- Hub & Clamp (1): Grayloc-style 5K-15K
- Ring Joint Gaskets (1): API 6BX BX/R series
- BSL Bolting (1): API 6A studs/nuts B7/2H

**API Flanges (10)**
- Blind (4): 5K, 10K, 15K STD, 15K Sour
- Companion (2): 5K, 15K
- Weld-Neck (3): 5K, 10K, 15K
- Instrument (1): 15K small-bore

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-flow-iron-wellhead-0.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-flow-iron-wellhead-0.ts
```

Re-running with default `--mode=add-only` is safe — existing specs/FAQs are preserved.

## Notes for editors

1. **Consolidation strategy.** Each PDP is a family covering multiple sizes within a (type × figure-class × configuration × service) permutation. The actual stock sizes are listed in the `available_sizes` spec field and in the description body. When a customer RFQ asks for an exact size, sales confirms availability against the listed sizes and quotes accordingly. Don't split these PDPs back into per-size SKUs — the SEO and content quality benefit from depth over breadth.

2. **Brand entries are SEO compatibility framing, not authorised distribution claims.** All OEM brands (FMC, Cameron, SPM, Anson, Stream-Flo, NOV) carry `isAuthorizedDistributor: false`. Each PDP description explicitly states "supplied as a recognised matched-pressure interchange... no implied authorised-distributor relationship." If Indus signs an actual distribution agreement with any of these OEMs, flip the flag to `true` on that brand record.

3. **OEM keywords in titles, descriptions, and FAQs are intentional and SEO-load-bearing.** "FMC WECO 1502", "Cameron 5K", "SPM 1502 Cross", "Anson 602 Elbow", "Chiksan-style swivel", "NACE MR0175" etc. — each phrase targets a real Google / LLM search query.

4. **Plug Valves are NOT in this initiative.** Plug Valves were imported under the Oilfield Valves category in PRs #86–#90 (separate chat). Don't re-create them here.

## Follow-ups (deferred)

1. **Batch 1** — Flow Line + Manifolds (Pup Joints, Swivel Joints, Hose Loops, Spacer Spools, Blast Joints, Data Headers, Choke / Diverter / Multi-Well Manifolds). Adds Halliburton + Forum Energy brands.
2. **Batch 2** — Wellhead + Surface Test Trees. Adds 2 new spec templates (`wellhead-spec`, `surface-test-tree-spec`) and the "Wellhead Systems" sub-section under the existing "Flow Iron & Wellhead" megamenu column.
3. **Image upload** — Currently placeholders only. Out of scope for the initial 3-batch initiative.

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- 1. Remove products and their dependent rows (faqs, specs cascade-deleted)
DELETE FROM products WHERE sku LIKE 'IH-FI-%';

-- 2. Remove megamenu leaves and column
DELETE FROM nav_menu_items WHERE parent_id IN (
  SELECT id FROM nav_menu_items WHERE label = 'Flow Iron'
    AND parent_id = (SELECT id FROM nav_menu_items WHERE label = 'Flow Iron & Wellhead' AND parent_id IS NULL)
);
DELETE FROM nav_menu_items WHERE label = 'Flow Iron'
  AND parent_id = (SELECT id FROM nav_menu_items WHERE label = 'Flow Iron & Wellhead' AND parent_id IS NULL);
DELETE FROM nav_menu_items WHERE label = 'Flow Iron & Wellhead' AND parent_id IS NULL;

-- 3. Remove categories
DELETE FROM categories WHERE slug IN ('flow-iron-adapters', 'flow-iron-fittings', 'flow-iron-flanges-api');
DELETE FROM categories WHERE slug = 'flow-iron-wellhead';

-- 4. Remove spec template (will cascade to its fields)
DELETE FROM spec_templates WHERE slug = 'flow-iron-spec';

-- 5. Remove the new brand
DELETE FROM brands WHERE slug = 'nov';
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| Phase A products created | 57 | ✅ 57 |
| All status=active | yes | ✅ |
| All have 8 FAQs | yes | ✅ |
| All have 13-15 specs | yes | ✅ (varies based on optional fields) |
| `search_tsv` populated | 57 | ✅ 57 / 57 |
| Megamenu column "Flow Iron & Wellhead" at position 10 | yes | ✅ |
| Megamenu sub "Flow Iron" with 3 leaves | yes | ✅ Adapters / Fittings / API Flanges |
| NOV brand created with `isAuthorizedDistributor: false` | yes | ✅ |
| Site total active products | 850 (was 793) | ✅ +57 |
