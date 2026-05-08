# Import 2026-05-08 — Metallic Hoses Batch 4 (FINAL: Specialty Couplings)

**Date:** 2026-05-08 | **Branch / PR:** `feat/catalogue-bulk-metallic-hoses-4` | **Phase:** 4

## Summary

**FINAL batch of the Metallic Hoses initiative.** 10 specialty couplings in a new `metallic-hose-couplings` sub-category — completes the metallic-hoses tree.

| Entity | Count |
|---|---|
| Categories | 1 created (`metallic-hose-couplings`, pos 6 under metallic-hoses) |
| Products | 10 |
| Specs | 213 |
| FAQs | 80 |

**Products (all Thorburn Flex):**
- TS25 Sight-Flow Indicator (visual flow confirmation)
- T92H Dry-Break (no-spillage hazardous fluid disconnect)
- T52 Cryogenic — Liquid Phase (LIN/LOX/LAR/LNG)
- T52 Cryogenic — Vapor Return (tank equalization)
- MT3TL Met-O-Seal Lightweight Tanker (carbon steel)
- MTS4 Met-O-Seal Heavy Duty (316L SS)
- UO O-Seal Pipe Union — Small Bore (1/2" to 2")
- UO O-Seal Pipe Union — Large Bore (2-1/2" to 6")
- SJ Swivel Joint — Low Pressure (35 bar)
- SJ Swivel Joint — High Pressure (200 bar)

Existing camlock / cam-and-groove product families (Dixon, Sealfast, Sunpool) **not duplicated** — they continue in their existing `industrial-hoses` sub-categories.

## Note on spec-template fit

These couplings use the existing `metallic-hose-spec` template with `hose_family: 'Other'` and `construction_type: 'Smooth-Bore'`. Some fields (braid, bend radius, weight) are set to 0 / N/A as they don't apply to coupling products. The PDP renders the applicable fields cleanly. A dedicated `metallic-hose-coupling-spec` template would give cleaner PDP output but is deferred to a future refactor.
