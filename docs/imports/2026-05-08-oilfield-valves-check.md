# Import 2026-05-08 — Oilfield Valves Batch 2 (Check Valves)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-oilfield-valves-2`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Third batch in the Oilfield Valves initiative. Adds 22 check valves spanning Swing in-line (6), Swing tee-body (6), Dart vertical-flow (4), and Type R wafer (6) designs to the Oilfield Valves column established in Batch 0 (PR #86) and extended in Batch 1 (PR #87).

End-connection mix: Weco unions (1502 / 602 / 206) for frac iron, API 6A flanged (5M / 10M / 15M) for wellhead, ANSI raised-face (150# / 600#) for process-plant. Pressures 285 psi → 15K psi. Service split: 12 sour (NACE MR0175) + 10 standard. Brand split: WOM 4, Anson 4, SPM 4, Cameron 3, FMC 3, Stream-Flo 2, Indus 2.

No new brands, no spec template change. The `oilfield-valve-spec` template (15 fields, established in Batches 0+1) covers every check-valve concept needed.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 | All 6 OEM + Indus reused |
| Categories | 1 created | `oilfield-check-valves` (pos 3, under `oilfield-valves`) |
| Spec template | 0 changes | Reused `oilfield-valve-spec` (15 fields) |
| Products | 22 created | 6 Swing IL + 6 Swing TE + 4 Dart + 6 Type R |
| ProductSpec rows | 330 created | 22 × 15 |
| ProductFaq rows | 176 created | 22 × 8 |
| NavMenuItem changes | -3, +4 | "Wellhead & Frac" sub: leaves grow from 3 → 4 (Ball, Gate, SSV preserved + Check new) |

### Type breakdown

| Sub-type | Count | SKUs |
|---|---|---|
| Swing IL (in-line) | 6 | `IH-OFV-CHK-SWING-IL-...` (sizes 2"–3", 1502/602/206 unions, 2K–15K) |
| Swing TE (tee body) | 6 | `IH-OFV-CHK-SWING-TE-...` (sizes 3"–4", Weco + flanged variants) |
| Dart (vertical flow) | 4 | `IH-OFV-CHK-DART-...` and `IH-OFV-CHK-DART-COMPACT-...` (size 2"–3") |
| Type R (wafer) | 6 | `IH-OFV-CHK-TYPER-...` (3-1/8" + 3-1/16", 5K–15K, PSL 1 and PSL 3) |

### Brand mix per type

| Brand | Swing IL | Swing TE | Dart | Type R | Total |
|---|---|---|---|---|---|
| Anson | 3 | 0 | 1 | 0 | 4 |
| WOM | 1 | 2 | 1 | 0 | 4 |
| SPM Oil & Gas | 1 | 1 | 2 | 0 | 4 |
| Cameron | 0 | 1 | 0 | 2 | 3 |
| FMC Technologies | 0 | 1 | 0 | 2 | 3 |
| Stream-Flo | 0 | 0 | 0 | 2 | 2 |
| Indus | 1 | 1 | 0 | 0 | 2 |
| **Total** | **6** | **6** | **4** | **6** | **22** |

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-check.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-check.ts
```

## Notes for editors

- **No spec template change.** Batch 1 already added `material_class_api`. All 22 check valves use the existing 15-field schema. PSL 1 standard-service valves use `material_class_api: N/A`; sour-service valves use `EE` or `EE-1.5`.
- **Type R wafers use `bore_type: 'Standard'`** rather than Full Port — wafer body is so short that the conventional Full / Reduced Port distinction doesn't apply meaningfully. The "Standard" option exists in the bore_type field for exactly this case.
- **Reverse-flow direction** (M×F orientation) is captured in title and end-connection fields rather than as a dedicated spec field. Two products use the M×F orientation (one IL, one TE) for branch-to-trunk routing.
- **Mixed flanged inlet × union outlet** product (`IH-OFV-CHK-SWING-TE-3116-15M-1502-15K-STD-FMC`) bridges API 6A wellhead trees to frac flow iron — single most useful adapter check in service intervention.
- **Vertical-flow-up only** for Dart-type valves. Captured in description and FAQ; no dedicated spec field for orientation requirement (deferred — could be a future field if buyers ask to filter on it).

## Follow-ups (deferred)

1. **Batch 3 — Plug Valves + Choke Valves** (~20–25 products at source). Likely needs a new "Pressure & Flow Control" megamenu sub-section under the Oilfield Valves column.
2. **Batch 4 — Globe + Pressure Relief + Butterfly** (~15–20 products).
3. **Batch 5 — Instrumentation + Valve Accessories** (~15–25 products).
4. **Manifolds** still deferred (~126 SKUs, needs `oilfield-manifold-spec`).
5. **Optional spec field** `installation_orientation` (Vertical-Up / Horizontal / Any) — would let buyers filter dart-type valves by orientation requirement.
6. **Stellite hardfacing variant** flag — currently captured in `trim_material` text. Could be split into a dedicated `hardfacing` field if frequently filtered on.

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- 1. Revert megamenu leaves under "Wellhead & Frac" to Batch 1 state (Ball/Gate/SSV)
DELETE FROM nav_menu_items WHERE label = 'Check Valves' AND parent_id IN (
  SELECT id FROM nav_menu_items WHERE label = 'Wellhead & Frac' AND parent_id IN (
    SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
  )
);

-- 2. Delete products and their cascaded specs/FAQs
DELETE FROM products WHERE sku LIKE 'IH-OFV-CHK-%';

-- 3. Delete sub-category
DELETE FROM categories WHERE slug = 'oilfield-check-valves';
```

## Verification (run before PR opened — pass)

| Check | Expected | Result |
|---|---|---|
| `oilfield-check-valves` category at position 3 | yes | ✓ |
| Products with status='active' | 22 | ✓ 22 |
| Each product has 15 specs + 8 FAQs | 22 each | ✓ 22/22 |
| Brand split: WOM 4, Anson 4, SPM 4, Cameron 3, FMC 3, Stream-Flo 2, Indus 2 | yes | ✓ |
| `search_tsv` populated for new products | 22 | ✓ 22 |
| Megamenu "Wellhead & Frac" has 4 leaves (Ball / Gate / SSV / Check) | yes | ✓ |
| Catalogue total active products | 711 → 733 | ✓ 733 |
