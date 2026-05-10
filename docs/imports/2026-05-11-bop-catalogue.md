# BOP Catalogue — Tier 1 + Tier 2 Build (2026-05-11)

Stands up the entire **Blowout Preventer (BOP) / Pressure Control** category tree on the Indus Hydraulics catalogue and seeds 48 SKUs covering every Tier 1 and Tier 2 product / service identified in the GCC market research.

**Phase:** 2 (Catalogue) + 4 (Catalogue management — bulk import)

## Why

Adds a major new top-level catalogue branch targeting the GCC drilling market — Saudi Aramco land + offshore, ADNOC onshore + Hail/Ghasha, KOC, PDO, QatarEnergy, BAPCO, Iraq south. Research cross-checked OEM datasheets (Cameron, NOV, Hydril, WOM), regional distributor catalogues (BOP Rentals Dubai, AEI Supplies, DDIE FZE, PCP Rentals, Hydro Middle East), API specifications (16A / 16C / 16D / 6A / STD 53), and operator-spec drivers (Aramco IKTVA + revised Well Control Manual; ADNOC ICV + drilling manual; KOC / PDO / QatarEnergy / BAPCO vendor lists).

## What's in the PR

3 import files (run in order) + this changelog. **Idempotent** (add-only mode) — re-running the imports leaves existing data untouched.

| File | Brands | Categories | Spec templates | Products | Megamenu |
|---|---|---|---|---|---|
| `2026-05-11-bop-equipment.ts` | 2 (hydril, shaffer) | 1 top + 9 subs | 3 (bop-equipment-spec, bop-spares-spec, bop-service-spec) | 17 equipment | New "Blowout Preventer" column with 3 sub-sections, 9 leaves |
| `2026-05-11-bop-spares.ts` | — | — | — | 18 spares & cross-sell bundles | — |
| `2026-05-11-bop-services.ts` | — | — | — | 13 services | — |
| **Total** | **2** | **10** | **3** | **48** | **1 column / 3 sub-sections / 9 leaves** |

### Catalogue taxonomy (10 categories)

```
Blowout Preventers (BOP)              ← top-level, position 11
├── Annular BOPs                       (bop-annular)
├── Ram BOPs                           (bop-ram)
├── Ram Blocks & Assemblies            (bop-ram-blocks)
├── BOP Spare Parts & Elastomers       (bop-spare-parts)
├── BOP Control Units & Accumulators   (bop-control-units)
├── Choke & Kill Manifolds & Valves    (bop-choke-kill)
├── Diverter Systems                   (bop-diverters)
├── Drilling Spools, DSAs & Adapters   (bop-spools-adapters)
└── BOP Services                       (bop-services)
```

Mirrors the taxonomy used by 4–5 active GCC competitors (BOP Rentals Dubai, DDIE FZE, PCP Rentals, AEI Supplies, Hydro Middle East) — buyers will navigate it intuitively.

### Megamenu — new column "Blowout Preventer" under primary_megamenu

Created in the same import as the categories (via `createColumnIfMissing: true`). 3 sub-sections, 9 leaves total:

```
Blowout Preventer (column → blowout-preventers)
├── Equipment
│   ├── Annular BOPs                  → /c/bop-annular
│   ├── Ram BOPs                      → /c/bop-ram
│   ├── Ram Blocks & Assemblies       → /c/bop-ram-blocks
│   ├── Diverter Systems              → /c/bop-diverters
│   └── Spools, DSAs & Adapter Flanges → /c/bop-spools-adapters
├── Control & Aftermarket
│   ├── Control Units & Accumulators  → /c/bop-control-units
│   ├── Choke & Kill Manifolds        → /c/bop-choke-kill
│   └── Spare Parts & Elastomers      → /c/bop-spare-parts
└── Services
    └── BOP Services                  → /c/bop-services
```

### 17 equipment SKUs

| Sub-category | SKU pattern | Count | Tier |
|---|---|---|---|
| Annular BOPs | `IH-BOP-AN-*` | 5 | T1 (4) + T2 (1: 18-3/4" 10K subsea) |
| Ram BOPs | `IH-BOP-RAM-*` | 8 | T1 (6: 13-5/8" / 11" / 7-1/16" 5K-10K) + T2 (2: 13-5/8" 15K HPHT, 18-3/4" 15K subsea triple) |
| Specialty (CT / Snubbing / RCD) | `IH-BOP-CT-*`, `IH-BOP-SNUB-*`, `IH-BOP-RCD-*` | 3 | T1 (1: CT Quad) + T2 (2: snubbing, RCD) |
| Diverter | `IH-BOP-DIV-*` | 1 | T2 (offshore 21-1/4" 2K) |
| Control Unit (Koomey) | `IH-BOP-CTRL-*` | 1 | T1 (Type 80 11-station) |
| Choke & Kill Manifold | `IH-BOP-CK-*` | 1 | T1 (3-1/16" 10K API 16C) |
| Spools / DSAs / Adapters | `IH-BOP-SPOOL-*`, `IH-BOP-DSA-*`, `IH-BOP-XOVER-*` | 3 | T1 |

### 18 spare-part SKUs

| Sub-category | SKU pattern | Count |
|---|---|---|
| Annular Packing Elements (Hydril GK / GX, Shaffer Spherical) | `IH-BOP-PE-*` | 5 |
| Pipe Ram Block Assemblies (Cameron U) | `IH-BOP-RB-PIPE-*` | 2 |
| Variable Bore Ram (VBR) Block Assemblies | `IH-BOP-RB-VBR-*` | 2 |
| Blind-Shear Ram Block Assembly | `IH-BOP-RB-BLIND-SHEAR-*` | 1 |
| Critical Consumables (BX gasket set, B7M stud kit, bonnet seal kit) | `IH-BOP-RG-*`, `IH-BOP-STUD-*`, `IH-BOP-BS-*` | 3 |
| Cross-Sell Bundles (Ram Redress, Annular + Head Seal, Nipple-Up, Koomey 5-Yr Soft Goods) | `IH-BOP-KIT-*` | 4 |
| BOP Test Plug & Lift Sub Set | `IH-BOP-TP-LIFT-*` | 1 |

### 13 service SKUs

| Tier | SKU | Service |
|---|---|---|
| T1 | `IH-BOP-SVC-PRESSURE-TEST-API53-INDUS` | BOP Pressure Testing per API STD 53 |
| T1 | `IH-BOP-SVC-RECERT-5YR-API16A-INDUS` | API 16A 5-Year Major Inspection & Recertification |
| T1 | `IH-BOP-SVC-ANNUAL-REDRESS-INDUS` | Annual BOP Redress (12-month elastomer service) |
| T1 | `IH-BOP-SVC-RENTAL-11-10K-WORKOVER-INDUS` | 11" 10K Workover BOP Stack Rental |
| T1 | `IH-BOP-SVC-KOOMEY-RECERT-API16D-INDUS` | Koomey Accumulator Service & API 16D Recertification |
| T1 | `IH-BOP-SVC-CHOKE-KILL-RECERT-API16C-INDUS` | Choke & Kill Manifold Testing & 5-Year Recertification |
| T1 | `IH-BOP-SVC-FIELD-CREW-INDUS` | BOP Field Service Crew (H₂S-trained) |
| T1 | `IH-BOP-SVC-CT-SNUB-WL-TEST-INDUS` | CT / Snubbing / Wireline BOP Testing & Recertification |
| T2 | `IH-BOP-SVC-SUBSEA-FAT-SIT-INDUS` | Subsea BOP Stack FAT/SIT Witness & Engineering |
| T2 | `IH-BOP-SVC-15K-HPHT-INDUS` | 15K HPHT BOP Service (Hail & Ghasha / Jafurah) |
| T2 | `IH-BOP-SVC-DIVERTER-RECERT-INDUS` | Diverter System Testing & Recertification |
| T2 | `IH-BOP-SVC-RCD-MPD-INDUS` | RCD Service & MPD Equipment Support |
| T2 | `IH-BOP-SVC-IWCF-WELLSHARP-TRAINING-INDUS` | IWCF / IADC WellSharp Well Control Training |

## Defaults applied

- **Brand:** Indus Hydraulics (`indus`) — house brand, `isAuthorizedDistributor: false`. OEM cross-references (Cameron / Hydril / Shaffer / NOV / WOM / etc.) called out in title and OEM keywords. Pattern follows the established hammer-unions / DEMCO / Aeroquip imports.
- **Currency:** AED. **Status:** active. **Pricing:** RFQ-only (`listPrice = null`).
- **Country of origin:** UAE (re-distributed from Indus Dubai HQ).
- **Service class default:** Sour Service (NACE MR0175). H₂S is the GCC default — sweet-service variants are downgrades on request.
- **Elastomers:** HNBR / AFLAS for sour-service consumables; NBR for sweet-service downgrades only.
- **Bolting:** B7M / L7M for sour-service; B7 for sweet-service downgrades only.
- **Ring gaskets:** Inconel-625-clad seating surface for sour-service; soft-iron only for sweet-service.
- **API monograms** displayed prominently per category: 16A (BOPs / rams / annulars), 16C (choke & kill), 16D (control systems / Koomey), 6A (gaskets / bolting / spools / adapters), 20E (BSL-2/3 bolting on request).

## Spec templates added

3 new templates — all wired to their respective sub-categories as `defaultSpecTemplateSlug`:

1. **`bop-equipment-spec`** (12 fields) — for whole BOP units, control units, diverters, spools, DSAs.
2. **`bop-spares-spec`** (14 fields) — for ram blocks, packing elements, ring gaskets, kits.
3. **`bop-service-spec`** (10 fields) — for services.

Field options are comprehensive enough to cover all 48 SKUs without extension. Future spare / equipment / service additions can extend `options` lists additively.

## Brands added

- **`hydril`** (Hydril) — long-established US oilfield-equipment brand, GK / GL / GX annular preventer families. Now part of Cameron / SLB pressure-control portfolio. Not authorised distributor.
- **`shaffer`** (Shaffer) — long-established US oilfield-equipment brand, LWS / SL / NXT ram BOPs. Now part of NOV Pressure Control. Not authorised distributor.

Brands `cameron`, `nov`, `wom`, `fmc-technologies`, `forum-energy`, `halliburton`, `spm-oil-gas`, `stream-flo`, `indus` already exist in DB — no changes.

## Verification commands

```bash
# Dry-run all 3 (any order — files 2 + 3 reference categories created by file 1):
pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-equipment.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-spares.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-services.ts --dry-run

# Live (run equipment first — it owns the categories + templates):
pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-equipment.ts
pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-spares.ts
pnpm --filter @indus/db db:import src/imports/2026-05-11-bop-services.ts
```

Each file runs inside a single Postgres transaction. Dry-run rolls back; live commits.

## Test plan

After live import:

- [ ] Megamenu — primary_megamenu shows "Blowout Preventer" column with 3 sub-sections + 9 leaves
- [ ] Category page — `/c/blowout-preventers` renders with all 9 sub-categories listed
- [ ] Sub-category pages — `/c/bop-annular`, `/c/bop-ram`, `/c/bop-ram-blocks`, `/c/bop-spare-parts`, `/c/bop-control-units`, `/c/bop-choke-kill`, `/c/bop-diverters`, `/c/bop-spools-adapters`, `/c/bop-services` all render with the seeded products
- [ ] PDP spot-checks (1 per sub-category) — slug auto-derived from title; content / specs / FAQs render
- [ ] Search — `/search?q=annular+bop+13-5/8` returns the 13-5/8" annular SKUs (FTS column auto-populates via `search_tsv` STORED)
- [ ] `/sitemap.xml` includes the 48 new product URLs + 10 new category URLs
- [ ] Brand pages — `/brands/hydril` and `/brands/shaffer` resolve

## Rollback (if required)

In a one-off SQL transaction:

```sql
-- Remove the 48 BOP products created by this batch
DELETE FROM "products" WHERE "sku" LIKE 'IH-BOP-%-INDUS';

-- Remove the 10 BOP categories
DELETE FROM "categories"
WHERE "slug" IN (
  'bop-annular', 'bop-ram', 'bop-ram-blocks', 'bop-spare-parts',
  'bop-control-units', 'bop-choke-kill', 'bop-diverters',
  'bop-spools-adapters', 'bop-services', 'blowout-preventers'
);

-- Remove the 3 spec templates (cascade removes their fields)
DELETE FROM "spec_templates"
WHERE "slug" IN ('bop-equipment-spec', 'bop-spares-spec', 'bop-service-spec');

-- Remove the 2 brands (only do this if no external products use them)
DELETE FROM "brands" WHERE "slug" IN ('hydril', 'shaffer');

-- Remove the megamenu column + sub-sections + leaves
-- (cascading delete from the column NavMenuItem removes children)
DELETE FROM "nav_menu_items"
WHERE "id" IN (
  SELECT id FROM "nav_menu_items"
  WHERE "categoryId" = (SELECT id FROM "categories" WHERE "slug" = 'blowout-preventers')
);
```

(Note: the rollback above assumes the BOP products are not yet referenced by RFQ lines. If they are, the FK constraint will block — handle on a per-row basis.)

## Follow-ups (deliberately out of scope for this PR)

1. **Product images** — every PDP currently has no hero image; uploads will be added in a follow-up media-library batch (Supabase storage). The product card / PDP layouts already handle the empty-image state gracefully.
2. **Datasheet PDFs** — none of the 48 PDPs has an attached datasheet yet. Plan: generate one PDF per equipment SKU + one PDF per cross-sell-bundle SKU + one capability statement per service SKU. Stored as `ProductDocument` with `kind=datasheet`.
3. **Cross-references** — the title / OEM keywords reference Cameron / Hydril / Shaffer / NOV part numbers but no `ProductCrossReference` rows are seeded. Cross-reference data unlocks the `/replacement` programmatic landing pages — ship as a separate batch.
4. **Sour-service variant separation** — every PDP currently has sour-service trim as the default in a single SKU. Some buyers explicitly procure sweet-service-only variants — split into separate SKUs if SEM data justifies it.
5. **15K HPHT spares** — the equipment file lists 13-5/8" 15K HPHT and 18-3/4" 15K subsea ram BOPs but the spares file does not yet list 15K-class consumables (HPHT ram packers, HPHT bonnet seals). Next batch.
6. **Diverter spare parts** — diverter sealing element + overboard valve trim not yet listed as standalone spares.
7. **CT BOP cross-sell bundles** — CT-specific redress kits (CT Quad blind / shear / slip / pipe ram redress kit) not yet listed.
8. **Brand pages** — `/brands/hydril` and `/brands/shaffer` will render from the seeded brand row, but no hero image / logo is uploaded yet.
9. **Phase 2 Compare** — once the catalogue compare feature is live (Phase 2), pre-configured comparison sets ("All 11" 10K Annular BOPs", "All 13-5/8" 10K Ram BOPs") would help operators evaluate.
