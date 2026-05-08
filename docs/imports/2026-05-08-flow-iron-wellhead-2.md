# Import 2026-05-08 — Flow Iron & Wellhead Batch 2 (Wellhead + Surface Test Trees)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-flow-iron-wellhead-2`
**Phase:** 4 (Catalogue)

## Summary

Final batch in the **Flow Iron & Wellhead** initiative. Wraps up the catalogue area established in Batch 0 (PR #91, 57 PDPs) and Batch 1 (PR #92, 35 PDPs) by adding the Wellhead Systems sub-section — Wellhead components and Surface Test Trees.

This batch ships **2 new spec templates** because wellhead components have a fundamentally different parameter set from frac iron — API 6A material classes (AA-HH), temperature classes (K-V), PSL / PR levels, and top/bottom flange geometry. Surface Test Trees additionally carry hydraulic actuation pressure, valve count / type breakdowns, and STT configuration discriminators. Adapting `flow-iron-spec` would have meant lots of empty / awkward fields on these PDPs.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 | Reuses Cameron, FMC, Stream-Flo, NOV, Anson (Phase 0), Halliburton + Forum Energy (Phase 1) |
| Categories | 2 | `wellhead` (position 5), `surface-test-trees` (position 6) under `flow-iron-wellhead` |
| Spec templates | 2 | `wellhead-spec` (14 fields, position 21), `surface-test-tree-spec` (12 fields, position 22) |
| Products | 22 | 15 Wellhead + 7 Surface Test Trees |
| ProductSpec rows | 294 | 0 skipped — all fields populated on every product |
| ProductFaq rows | 176 | 8 OEM-keyword-rich FAQs per PDP |
| NavMenuItem changes | -0, +2 | New "Wellhead Systems" sub-section at position 1 with 2 leaves |

### Brand allocation (22 PDPs)

| Brand | Count | Why |
|---|---|---|
| Cameron | 7 | Wellhead + Christmas Tree dominance — Type C, Type SS-15, casing spool, slip hanger |
| FMC Technologies | 7 | SDX wellhead + FlexMaster Christmas tree + frac tree + STT lines |
| Halliburton | 2 | SafeShield STT (frac + sour CT) |
| Stream-Flo | 2 | Casing head + tubing-head adapter (Stream-Flo's specialty) |
| NOV | 1 | 15K tubing head (NOV ML-15) |
| Anson | 1 | UK-source studded adapter |
| Forum Energy | 1 | Subsea STT (Forum's WellSAFE line) |
| Indus | 1 | Wellhead-mounted STT (house-brand niche) |

### Phase C SKUs

**Wellhead (15)**
- Tubing Heads (4): 5K Cameron, 10K FMC, 10K Sour Cameron, 15K NOV
- Casing Heads / Spools (3): 3K Stream-Flo, 5K Cameron Spool, 10K FMC Spool
- Christmas Trees (3): 5K Cameron, 10K FMC, 10K Sour Cameron
- Frac Tree (1): 15K FMC
- Tubing Head Adapter (1): 5K-to-10K Stream-Flo
- Hangers (2): 10K FMC Mandrel Tubing Hanger, 5K Cameron Slip Casing Hanger
- Studded Adapter (1): 15K Anson

**Surface Test Trees (7)**
- Conventional Frac STT (3): 1502 15K STD FMC, 1502 10K Sour Halliburton, API 6BX 10K Flanged Cameron
- Coiled-Tubing STT (1): 1502 15K Halliburton (with stripper + shear/seal BOP)
- Subsea STT (1): API 17D 15K Forum Energy
- Snubbing STT (1): 1502 10K FMC (with dual ram-type stripper)
- Wellhead-Mounted STT (1): 1502 15K Indus (compact 4-valve)

## Megamenu

The "Flow Iron & Wellhead" column now has both sub-sections fully populated:

```
Flow Iron & Wellhead
├── Flow Iron               (sub, position 0)
│   ├── Adapters
│   ├── Fittings
│   ├── API Flanges
│   ├── Flow Line
│   └── Manifolds
└── Wellhead Systems        (sub, position 1 — NEW)
    ├── Wellhead            → /c/wellhead
    └── Surface Test Trees  → /c/surface-test-trees
```

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-flow-iron-wellhead-2.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-flow-iron-wellhead-2.ts
```

## Notes for editors

1. **Wellhead and STT have separate spec templates from frac iron.** They share OEM brand entries, category parent, and megamenu column — but the `wellhead-spec` and `surface-test-tree-spec` templates carry API 6A-specific fields (PSL, PR, material class, temperature class) that don't apply to flow iron. Don't merge them into `flow-iron-spec`.

2. **Wellhead products are largely engineered-to-order** — typical lead times 28-168 days. Each PDP is a representative configuration; actual orders go through wellhead schematic review with the operator.

3. **Surface Test Trees include integral safety equipment** in some configurations — coiled-tubing STTs include a shear/seal BOP and stripper; snubbing STTs include ram-type strippers. RFQ should include the operation type so the right STT configuration is offered.

4. **Data source:** BIF's public listings for Wellhead and Surface Test Tree were empty when this batch was built. PDPs constructed from public OEM catalogues (Cameron Type C / SS-15, FMC SDX / FlexMaster, Stream-Flo, NOV ML-15, Halliburton SafeShield, Forum Energy WellSAFE) and API 6A / 17D specifications.

## Cumulative state of the Flow Iron & Wellhead initiative

| Batch | PR | PDPs | Cumulative |
|---|---|---|---|
| 0 (framework + Adapters + Fittings + API Flanges) | #91 | 57 | 57 |
| 1 (Flow Line + Manifolds) | #92 | 35 | 92 |
| 2 (Wellhead + Surface Test Trees) | this | 22 | **114** |

| Spec templates created | 3 (`flow-iron-spec`, `wellhead-spec`, `surface-test-tree-spec`) |
| New OEM brand records | 3 (NOV, Halliburton, Forum Energy) — joining the 6 created by the Oilfield Valves chat (Cameron, FMC, WOM, Anson, SPM, Stream-Flo) |
| Top-level category | `flow-iron-wellhead` |
| Sub-categories | 7 (Adapters, Fittings, API Flanges, Flow Line, Manifolds, Wellhead, Surface Test Trees) |
| Megamenu | 1 new column with 2 sub-sections and 7 leaves |

## Verification (pass)

| Check | Expected | Result |
|---|---|---|
| Phase C products created | 22 (15 + 7) | ✅ |
| All status=active, 8 FAQs | yes | ✅ 0 issues |
| `search_tsv` populated | 22 | ✅ |
| Both spec templates created | yes | ✅ wellhead-spec (14 fields) + surface-test-tree-spec (12 fields) |
| Megamenu Wellhead Systems sub created with 2 leaves | yes | ✅ |
| Total active products | 917 (was 885) | ✅ +22 |
| Cumulative FI&WH initiative | 114 PDPs | ✅ |
