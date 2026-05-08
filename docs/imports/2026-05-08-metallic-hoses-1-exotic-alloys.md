# Import 2026-05-08 — Metallic Hoses Batch 1 (Exotic Alloys)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-metallic-hoses-1`
**Phase:** 4 (Catalogue)

## Summary

Second batch of the Metallic Hoses initiative. 20 exotic-alloy products under the `metallic-exotic-alloy-hoses` sub-category established in Batch 0 — Hastelloy C276 (7), Inconel 625 (6), Monel 400 (4), Bronze (3). Brand split: Thorburn Flex 17, Hose Master 2, Witzenmann 1.

| Entity | Count |
|---|---|
| Brands | 0 (all reused from Batch 0) |
| Categories | 0 (reused) |
| Spec template | 0 changes |
| Products | 20 created |
| ProductSpec rows | 436 (20 × 22 = 440; 4 false-bool skipped) |
| ProductFaq rows | 160 (20 × 8) |
| Megamenu | 0 (deferred follow-up) |

## Product list

**Hastelloy C276 (7):** H95 / H96 / H96Z (Inconel braid) + HS95 / HS96 / HS96Z (SS304 braid, cost-effective) + Hose Master ANNUFLEX-C276
**Inconel 625 (6):** I95 / I96 / I96Z (Inconel braid) + IS95 / IS96 (SS304 braid) + Witzenmann HYDRA Inconel 625
**Monel 400 (4):** M95 / M96 / M96Z (matched Monel braid, Cl₂ Institute Pamphlet 6) + Hose Master ANNUFLEX-MONEL
**Bronze (3):** B95 / B96 / B96Z (matched Bronze braid)

Pressures span 8 bar (B95) to 215 bar (I96Z). Operating temperatures span -200°C to +815°C (Inconel). All NACE-compliant where applicable; Monel products meet Chlorine Institute Pamphlet 6 + Spec 135-3.

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-metallic-hoses-1-exotic-alloys.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-metallic-hoses-1-exotic-alloys.ts
```

`add-only` mode (default).
