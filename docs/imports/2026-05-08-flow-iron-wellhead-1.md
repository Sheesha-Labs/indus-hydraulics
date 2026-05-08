# Import 2026-05-08 — Flow Iron & Wellhead Batch 1 (Flow Line + Manifolds)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-flow-iron-wellhead-1`
**Phase:** 4 (Catalogue)

## Summary

Second batch in the Flow Iron & Wellhead initiative. Reuses the framework established in Batch 0 (PR #91) — same spec template (`flow-iron-spec`), same megamenu column ("Flow Iron & Wellhead"). Adds **Flow Line** and **Manifolds** as 2 new sub-categories under the existing column, plus 2 new OEM brands (Halliburton + Forum Energy Technologies) used for choke manifolds, blast joints, and frac-spread skid packages.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 2 | `halliburton` (USA), `forum-energy` (USA). Both `isAuthorizedDistributor: false`. |
| Categories | 2 | `flow-iron-flow-line` (position 3), `flow-iron-manifolds` (position 4) under `flow-iron-wellhead` |
| Spec templates | 0 | Reuses `flow-iron-spec` from Batch 0 |
| Products | 35 | Consolidated PDPs covering ~250+ underlying BIF SKU permutations |
| ProductSpec rows | 533 | Average 15.2 spec values per PDP (27 optional fields skipped) |
| ProductFaq rows | 280 | 8 OEM-keyword-rich FAQs per PDP |
| NavMenuItem changes | -3, +5 | Existing 3 leaves under "Flow Iron" sub deleted-and-recreated alongside 2 new ones (Flow Line, Manifolds) |

### Brand allocation (35 PDPs)

| Brand | Count | Why |
|---|---|---|
| FMC Technologies | 12 | Chiksan-style swivel joints (Chiksan = FMC), pup joints, manifolds |
| Indus Hydraulics | 8 | House brand for spacer spools, mid-pressure stock, flow-line packages |
| SPM Oil & Gas | 4 | Frac-iron specialist — swivels, pups, multi-well manifolds |
| Halliburton | 3 | Choke manifold (sour), blast joints, multi-well manifold (sour) |
| Forum Energy Technologies | 3 | Choke manifolds, diverter manifolds, manifold skids |
| Cameron | 2 | Choke manifold (15K), data header |
| NOV | 2 | API 6BX flanged choke, 4-well multi-well manifold |
| Anson | 1 | Sour-service pup joint |

### Phase B SKUs (35 total)

**Flow Line (24)**
- Swivel Joints (8): Style 10, 20, 30, 40 (reel), 50 (3-axis STD + Sour), 100 heavy-duty, 602 series
- Pup Joints (8): 1502 M×F + F×M (STD + Sour), 1502 NPST DET, 1002 M×F, 602 M×F + F×M (STD + Sour), 206 BW XH Sour
- Spacer Spools (3): 1502 STD + Sour, 602 STD
- Hose Loop (C&C) (1): 1502 15K
- Blast Joint (1): Halliburton-branded sand-protection sub
- Data Headers (2): 1502 (Cameron), 602 (Indus)

**Manifolds (11)**
- Choke Manifolds (6): 1502 single-stage STD (Cameron), 1502 dual-stage STD (FMC), 1502 single-stage Sour (Halliburton), 1502 dual-stage Sour (Forum), 602 sour (Indus), API 6BX 10K flanged (NOV)
- Diverter Manifold (1): 1502 (Forum Energy)
- Multi-Well Manifolds (3): 4-well STD (NOV), 8-well STD (SPM), 8-well Sour (Halliburton)
- Manifold Skid (1): 1502 (Forum Energy)
- Flow Line Package (1): Custom-engineered

## Megamenu

The "Flow Iron" sub-section under the "Flow Iron & Wellhead" column is now populated with all 5 leaves:

```
Flow Iron & Wellhead
└── Flow Iron
    ├── Adapters       → /c/flow-iron-adapters
    ├── Fittings       → /c/flow-iron-fittings
    ├── API Flanges    → /c/flow-iron-flanges-api
    ├── Flow Line      → /c/flow-iron-flow-line   (NEW)
    └── Manifolds      → /c/flow-iron-manifolds   (NEW)
```

The "Wellhead Systems" sub-section will be added in Batch 2 (Wellhead + Surface Test Trees).

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-flow-iron-wellhead-1.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-flow-iron-wellhead-1.ts
```

## Notes for editors

1. Same consolidation strategy as Batch 0 — each PDP is a (type × figure-class × configuration × service) family covering multiple sizes / lengths. Don't split.
2. Manifold skids and Flow Line Packages are intentionally generic engineered-to-order PDPs — they describe the customisation flow rather than fixed configurations.
3. Halliburton and Forum Energy carry `isAuthorizedDistributor: false`. SEO content frames products as recognised matched-pressure interchanges.

## Follow-ups

1. **Batch 2** — Wellhead + Surface Test Trees. Adds 2 new spec templates (`wellhead-spec`, `surface-test-tree-spec`) and the "Wellhead Systems" megamenu sub-section.

## Verification (pass)

| Check | Expected | Result |
|---|---|---|
| Phase B products created | 35 | ✅ |
| All status=active, 8 FAQs, 13-16 specs | yes | ✅ 0 issues |
| `search_tsv` populated for all IH-FI-* | 92 (57+35) | ✅ |
| Megamenu Flow Iron sub has 5 leaves | yes | ✅ |
| Halliburton + Forum Energy created | yes | ✅ |
| Total active products | 885 (was 850) | ✅ +35 |
