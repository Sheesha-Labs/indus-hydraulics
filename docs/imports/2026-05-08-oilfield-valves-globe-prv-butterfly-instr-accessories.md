# Import 2026-05-08 — Oilfield Valves Batch 4 (FINAL: Globe + PRV + Butterfly + Instrumentation + Accessories)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-oilfield-valves-4`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

**Final batch in the Oilfield Valves initiative.** Lands 32 products across 5 new sub-categories, completing the Oilfield Valves column. After this batch, the column has 11 sub-categories, 109 total products, and 3 megamenu sub-sections (Wellhead & Frac, Pressure & Flow Control, General Service).

The 32 products span:
- **5 Globe valves** (ANSI 150 / 300 / 600 / 900 / 1500 RF, 1"-3" sizes — process and gas-plant)
- **9 Pressure Relief valves** (Spring-loaded + Pilot-operated, frac unions + ANSI flanged + API 6A wellhead)
- **6 Butterfly valves** (Wafer + Lug + Triple-offset, 2"-10" sizes — process / utility / fire-safe)
- **7 Instrumentation valves** (Needle, DBB, Monoflange, Gauge, Bleed — small-bore tap-offs)
- **5 Valve Accessories** (Hydraulic actuator, gear operator, position indicator, LOTO, mounting kit)

### What was created / updated

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 | All 6 OEM + Indus reused (no new brands across the entire 4-batch initiative) |
| Categories | 5 created | `oilfield-globe-valves` (pos 6), `oilfield-pressure-relief-valves` (pos 7), `oilfield-butterfly-valves` (pos 8), `oilfield-instrumentation-valves` (pos 9), `oilfield-valve-accessories` (pos 10) |
| Spec template | 1 updated | `oilfield-valve-spec` — `valve_type` extended with `Accessory`, `pressure_class` extended with `N/A`, `api_spec` extended with `API 526` (PRV) and `API 609` (Butterfly). All other fields untouched. |
| Products | 32 created | 5 + 9 + 6 + 7 + 5 |
| ProductSpec rows | 480 created | 32 × 15 |
| ProductFaq rows | 256 created | 32 × 8 |
| NavMenuItem changes | -1, +6 | "Pressure & Flow Control" sub: 1 → 3 leaves (Choke preserved + Globe + PRV); new "General Service" sub created with 3 leaves (Butterfly + Instrumentation + Accessories) |

### Sourcing transparency

Big Iron Flow has **only 10 products at source** across these 5 categories (0 globe, 3 PRV, 3 butterfly, 3 instrumentation, 1 accessory). We sampled those 10 verbatim and added **22 industry-standard configurations** matching real OEM SKUs that buyers in the GCC oilfield supply chain search for — this is closer to broker-distributor positioning than catalogue-mirroring for the expansion items. The user explicitly approved this approach (Path B in the planning thread) to support buyer-discoverability via brand+spec searches.

The 22 expansion items are real industry product configurations (not invented) — covering size / pressure / service permutations that the original 10 BIF products only sparsely cover. Examples:

- **Globe valves**: BIF has 0; we added 5 covering ANSI 150 / 300 / 600 / 900 / 1500 RF flange classes — the standard pressure-class progression for process / gas-plant globe valves.
- **PRVs**: BIF has 3 (all 1502-union 15K spring-loaded); we extended with 6K / 10K Weco unions, ANSI 150 / 300 / 600 RF flanged variants, pilot-operated units, and a wellhead-flanged 5M variant.
- **Butterfly**: BIF has 3 utility wafer / lug; we added a high-pressure ANSI 300 lug (Cameron) and a 600# triple-offset metal-seated (FMC).
- **Instrumentation**: BIF has 3 (NPT needles + DBB); we added a 1/4" 15K needle, a 15K monoflange (API 6A 15M flanged process side), a gauge-isolation valve, and a bleed valve.
- **Accessories**: BIF has 1 (hydraulic actuator); we added gear operator, position indicator, LOTO device, and API 6A actuator mounting kit.

### Brand mix (Batch 4)

| Brand | Globe | PRV | Butterfly | Instr | Acc | Total |
|---|---|---|---|---|---|---|
| Cameron | 2 | 2 | 1 | 4 | 2 | 11 |
| FMC | 1 | 1 | 1 | 1 | 1 | 5 |
| WOM | 1 | 1 | 0 | 0 | 1 | 3 |
| Stream-Flo | 0 | 1 | 0 | 0 | 0 | 1 |
| Anson | 0 | 2 | 0 | 0 | 0 | 2 |
| SPM | 0 | 1 | 0 | 0 | 0 | 1 |
| Indus | 1 | 1 | 4 | 1 | 1 | 8 |
| **Total** | **5** | **9** | **6** | **7** | **5** | **32** |

### Service split

- 21 sour (NACE MR0175) products (66%)
- 11 standard service (34%)

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-globe-prv-butterfly-instr-accessories.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-08-oilfield-valves-globe-prv-butterfly-instr-accessories.ts
```

## Cumulative across Oilfield Valves initiative (4 PRs)

| Batch | PR | Products | Catalogue | Categories |
|---|---|---|---|---|
| 0 — Framework + Ball Valves | #86 | 11 | 684 → 695 | +2 (top-level + ball) |
| 1 — Gate + SSV/ESD | #87 | 16 | 695 → 711 | +2 (gate + ssv) |
| 2 — Check Valves | #88 | 22 | 711 → 733 | +1 (check) |
| 3 — Plug + Choke | #89 | 28 | 733 → 761 | +2 (plug + choke) |
| 4 — Globe + PRV + Butterfly + Instr + Acc (this PR) | THIS | 32 | 761 → 793 | +5 |
| **Total** | | **109** | **+109** | **12 (1 top-level + 11 sub)** |

### Megamenu — final state

```
Column: "Oilfield Valves" → /c/oilfield-valves
├── Sub: "Wellhead & Frac" (5 leaves)
│   ├── Ball Valves         (Batch 0)
│   ├── Gate Valves         (Batch 1)
│   ├── Plug Valves         (Batch 3)
│   ├── Check Valves        (Batch 2)
│   └── SSV & ESD Valves    (Batch 1)
├── Sub: "Pressure & Flow Control" (3 leaves)
│   ├── Choke Valves        (Batch 3)
│   ├── Globe Valves        (Batch 4)
│   └── Pressure Relief Valves  (Batch 4)
└── Sub: "General Service" (3 leaves)
    ├── Butterfly Valves        (Batch 4)
    ├── Instrumentation Valves  (Batch 4)
    └── Valve Accessories       (Batch 4)
```

### Spec template — final state

`oilfield-valve-spec`: 15 fields, evolved across batches:
- Batch 0: established with 14 fields
- Batch 1: added `material_class_api` (15th field), extended `pr_class` with `PR2F`
- Batch 4: extended `valve_type` with `Accessory`, `pressure_class` with `N/A`, `api_spec` with `API 526` + `API 609`

## Notes for editors

- **Per-category PDP rendering quirks:** Globe / PRV / Butterfly products have no `psl_class` / `pr_class` (set to `N/A`) since those are API 6A specific. Accessories have most fields set to `N/A` or universal-fit text since they're not pressure-rated valves themselves.
- **Set pressure for PRVs is made-to-order.** Documented in product description and FAQ — buyers specify the setpoint at RFQ time and Indus calibrates / witness-tests at the OEM facility.
- **Fire-safe / API 607 testing** for the triple-offset butterfly (`IH-OFV-BFLY-TRIPLE-4-CS-METAL-FMC`) is offered as an option — captured in description, not a separate spec field.
- **Valve accessories use `valve_type: 'Accessory'`** generic option. Sub-type granularity (Hydraulic Actuator vs Gear Operator vs Position Indicator etc.) lives in title and `subType` field passed to description builder. If buyer search analytics show meaningful demand, we could add granular options later.
- **Cumulative Indus product count is 8 in Batch 4** (heavy for utility / low-spec items: 4 butterfly wafer/lug, 1 globe ANSI 150, 1 PRV ANSI 150, 1 bleed valve, 1 LOTO device). Reflects the natural distribution: low-spec items go to Indus, premium oilfield-grade items go to OEM brands.

## Follow-ups (post-initiative — no longer this PR scope)

1. **Long-tail expansion within existing categories.** BIF has 124 plug + 45 choke + many ball / gate / check products beyond what we sampled (~140 total long-tail items). Future batches can extend as buyer demand surfaces. The framework supports it — no further plumbing needed.
2. **Manifolds (deferred from initiative).** BIF has 126 manifold products (Choke / Diverter / Multi-Well / Skids / Packages). These are skid assemblies with fundamentally different specs from single valves — needs a new `oilfield-manifold-spec` template (10-12 fields covering manifold_type, valve_count, configuration, etc.). Could be a future Phase 4.5 initiative.
3. **`isAuthorizedDistributor` flags** flip per OEM brand (Cameron, FMC, WOM, Anson, SPM, Stream-Flo) as formal distribution agreements land. Currently all set to `false` (the safe legal posture).
4. **Brand logos.** None uploaded yet for the 6 OEM brands; brand list pages use the default placeholder.
5. **Optional `oilfield-valve-accessory-spec` template** for cleaner accessory PDP rendering (avoid the N/A placeholders in spec fields). Defer until accessories volume justifies the schema work.
6. **Optional granular `valve_type` options** for sub-type filtering (Globe — Throttling / Globe — Bypass; PRV — Spring-loaded / PRV — Pilot-operated; Butterfly — Wafer / Lug / Triple-offset; etc.). Currently captured in title + `subType` text; can add filtering fields later if buyer search analytics show demand.
7. **API 6A monogram-graded full assembly testing** for actuator + valve packages. Indus offers this for new-build wellhead automation; document the offering on the brand / accessory landing pages.

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- 1. Revert "Pressure & Flow Control" sub leaves to Batch 3 state (Choke only)
DELETE FROM nav_menu_items WHERE label IN ('Globe Valves', 'Pressure Relief Valves') AND parent_id IN (
  SELECT id FROM nav_menu_items WHERE label = 'Pressure & Flow Control' AND parent_id IN (
    SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
  )
);

-- 2. Drop "General Service" sub-section (and all its leaves)
DELETE FROM nav_menu_items WHERE parent_id IN (
  SELECT id FROM nav_menu_items WHERE label = 'General Service' AND parent_id IN (
    SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
  )
);
DELETE FROM nav_menu_items WHERE label = 'General Service' AND parent_id IN (
  SELECT id FROM nav_menu_items WHERE category_id = (SELECT id FROM categories WHERE slug = 'oilfield-valves')
);

-- 3. Delete products and their cascaded specs/FAQs
DELETE FROM products WHERE sku LIKE 'IH-OFV-GLOBE-%' OR sku LIKE 'IH-OFV-PRV-%' OR sku LIKE 'IH-OFV-BFLY-%' OR sku LIKE 'IH-OFV-INST-%' OR sku LIKE 'IH-OFV-ACC-%';

-- 4. Delete sub-categories
DELETE FROM categories WHERE slug IN ('oilfield-globe-valves', 'oilfield-pressure-relief-valves', 'oilfield-butterfly-valves', 'oilfield-instrumentation-valves', 'oilfield-valve-accessories');

-- 5. Optional: revert spec template (drop 'Accessory' option from valve_type, drop 'N/A' from pressure_class, drop 'API 526' + 'API 609' from api_spec)
-- Note: not strictly required — extra options are inert if no products use them.
```

## Verification (run before PR opened — pass)

| Check | Expected | Result |
|---|---|---|
| 5 sub-categories under `oilfield-valves` (positions 6-10) | yes | ✓ |
| Products with status='active' | 32 | ✓ 32 |
| Each product has 15 specs + 8 FAQs | 32 each | ✓ 32/32 |
| Spec template options updated (valve_type 17, pressure_class 13, api_spec 12) | yes | ✓ |
| `search_tsv` populated for new products | 32 | ✓ 32 |
| Megamenu "Pressure & Flow Control" has 3 leaves (Choke / Globe / PRV) | yes | ✓ |
| Megamenu "General Service" sub created with 3 leaves (Butterfly / Instr / Acc) | yes | ✓ |
| Catalogue total active products | 761 → 793 | ✓ 793 |
| **Cumulative Oilfield Valves total (Batches 0-4)** | **109** | **✓ 109** |
