# Dinamic Oil Wave 1 — `catalogue-dinamic-oil-wave1`

**14 listings, 305 part numbers**, branded Dinamic Oil (`brandSlug: dinamic-oil`), on a new top-level category
**Gearboxes & Winches** (`gearboxes-winches`) with three shelves. Loaded 2026-10-20 as **drafts**
(`--rewrite-categories`, no `--publish`): 14 created, 16 images, 0 problems; categories created unpublished.
Publish in the sitting after this PR deploys (see Status).

| SKU | Listing | Shelf | Rows |
|---|---|---|---|
| `IH-DO-RE` | RE in-line planetary gearboxes, 1,780 Nm–198 kNm | `planetary-gearboxes` | 65 |
| `IH-DO-RA` | RA right-angle planetary gearboxes, 1,780 Nm–198 kNm | `planetary-gearboxes` | 48 |
| `IH-DO-GB` | GB heavy-duty planetary gearboxes, 281 kNm–3.62 MNm | `planetary-gearboxes` | 75 |
| `IH-DO-GBA` | GBA heavy-duty right-angle planetary gearboxes, 281 kNm–2.72 MNm | `planetary-gearboxes` | 30 |
| `IH-DO-WD` | WD planetary winch drives, 18.1–400 kNm FEM | `winch-drives` | 11 |
| `IH-DO-RW` | RW planetary winch drives, 7,380–32,530 Nm FEM, DNV | `winch-drives` | 10 |
| `IH-DO-WDD` | WDD motorized winch drums, 7,500–30,000 daN | `winch-drives` | 7 |
| `IH-DO-NP` | NP and NPA compact hydraulic winches, 500–1,650 daN | `hydraulic-winches` | 6 |
| `IH-DO-A` | A series compact hydraulic winches, 1,360–3,525 daN | `hydraulic-winches` | 4 |
| `IH-DO-P` | P series hydraulic winches (motor inside the drum), 750–2,500 daN | `hydraulic-winches` | 6 |
| `IH-DO-CW` | CW series crane hydraulic winches, 1,010–2,600 daN | `hydraulic-winches` | 9 |
| `IH-DO-S` | S series hydraulic winches (incl. S45V/3), 2,000–13,000 daN | `hydraulic-winches` | 12 |
| `IH-DO-SE` | SE series hydraulic winches (incl. V), 2,500–13,010 daN | `hydraulic-winches` | 15 |
| `IH-DO-SRD` | SRD heavy hydraulic winches, 8,000–29,700 daN | `hydraulic-winches` | 7 |

`IH-DO-` is the maker prefix (checked free 2026-10-20). Part numbers are `IH-DO-<series>-<model>`:
`IH-DO-RE-2523` is the RE 2520 frame with 3 stages, `IH-DO-S-45V3` the S45V/3 winch, `IH-DO-WDD-A75` the
WDD A75 drum. Each row's `item` column carries Dinamic Oil's own model designation; the full order code
(output, input, brake, mounting position; for winches rotation, drum, drain and accessories) is confirmed
with Dinamic Oil per quotation — the ordering keys are in the export workbook.

## Size-table columns

New keys in `packages/domain/src/variant-columns.ts`, added in the same change. **They render only after
that code deploys**; the values are also in the copy and specs.

- Gearboxes: `item`, `stages`, `ratio` (text, the stage model's ratio range), `peakTorqueNm` (T2max, the
  highest across the model's ratios).
- Winch drives: `item`, `stages`, `ratio`, `outputTorqueNm` (T2 FEM, M5-L2-T5 at 25 rpm, highest across
  ratios), `peakTorqueNm` (Td-max), `weightKg`. WDD: `linePullDan`, `ropeDia` (suggested rope).
- Winches: `linePullDan` (1st layer), `ropeSpeed` (1st layer, m/min), `ropeDia`, `ropeCapacityM` (smooth
  drum, last layer), `displacementCc`, `maxFlowLpm`, `ratio`, `brakeTorqueNm`, `weightKg`; hoisting
  pressure in the row's `pressureBar`.
- `outputTorqueNm` and `linePullDan` mark a table as `equipment`. Ratings are never converted: line pull
  stays in daN as published.
- The 2,148 ratio-by-ratio planetary rows (n2, P1, T2 at four input speeds) are not loaded; each page
  links the catalogue PDF.

## Status and prerequisites

1. **Authorised distributor, image permission, supply direct from Bomporto (Italy)** — confirmed by
   Ayush 2026-10-20. Every page says so.
2. **Brand row `dinamic-oil` created 2026-10-20**, unpublished, `isAuthorizedDistributor: true`,
   country Italy. Publish it in the same sitting as `--publish` (a published brand enters the sitemap).
3. **Spec template** `gearbox-winch-spec` (20 fields) is created by the payload.
4. **Documents** (`data/dinamic-oil-documents`): 28 attachments, 5 PDFs uploaded to
   `product-documents/dinamic-oil/` — catalogue (datasheet) + use-and-maintenance manual per listing.
   `attach-product-documents.ts` now reads `keyPrefix` and `caption` from the manifest (MannTek's default
   kept).
5. **Content scores 74** on all 14 (missing: a third image, a cross-reference, commerce fields).
6. **To go live, after deploy:** re-run with `--publish`, publish the brand and the four categories,
   add the megamenu pillar, purge cache tags, IndexNow ≥1 h after the deploy.

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-dinamic-oil-wave1 --image-dir=<export>/indus-jpeg-wave1 --publish
```

## Images

16 JPEGs from Dinamic Oil's website renders (`indus-jpeg-wave1/` in the export, generator
`_scripts/indus/build_wave1.py`), flattened on white and cropped. Exact: WD 4803 (WD listing) and the
SRD winch. Representative (alt text says so): RE, RA/GBA (same right-angle render), GB (sugar-mill
build), RW (WD 4803 shown), WDD, and the NP/A/P/CW/S/SE winch renders — the website does not name the
model on those. Ask Dinamic Oil for series photos; catalogues hold line drawings only.

## Source notes

- Planetary: `CAT_Epicicloidali_2025.pdf` (F-1 index and per-size performance pages). T2max per stage
  model is the highest in its ratio table. Catalogue misprints kept as printed are listed in the export's
  `_raw/catalogue/planetary/NOTES.md`.
- Winch drives: `Planetary-Winch-Drives` catalogue. DNV TAS00000YS covers WD 1000–8000 (the 3-stage
  WD 1023–8003); TAS00001JK covers every RW size listed. The 4-stage WD are certified per project.
  WDD is "based on WD gearboxes"; the size-by-size WD pairing is not printed, so it is not claimed.
- Winches: catalogue W21/A. Motor type per model is inferred from the drawings in places, so rows do not
  state it. SRD E150–G230 are marked "on request" in the catalogue and in the row's `item`.
- Not in wave 1: slewing gearboxes, wheel/track drives, towing winches, the 2019 hoisting brochure's
  American/Indian ranges, 40/50 t winches, electric winches.
