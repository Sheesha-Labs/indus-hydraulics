# Hydraulics Direct batch 3 — `hd-steel-adapters`

**138 new listings, 1,572 part numbers** of zinc-plated carbon-steel adapters from the catalogue of
Hydraulics Direct (Denver, US), an Indus principal since 2026-10-09. Listed unbranded under Indus
part numbers, like batches 1 and 2. Loaded with
`import-lifting-catalogue.ts --payload=hd-steel-adapters --publish` on 2026-10-09.

These are the families in the source's Steel Adapters (85) and British and Metric (53) categories
that the dedupe against the live catalogue found no live page for: configurations the live
carbon-steel adapter range does not carry (JIC × NPT female, ORB adapters, JIS 30°, BSPP swivel
tees, flange pads and so on).

| Category | Listings | |
|---|---|---|
| `bsp-hydraulic-adapters-uae` | 23 | existing |
| `jic-adapters` | 22 | existing |
| `npt-adapters` | 17 | existing (NPTF and NPSM) |
| `orb-adapters` | 16 | **new**, position 7 under `hydraulic-adapters` |
| `jis-30-adapters` | 13 | **new** |
| `orfs-adapters` | 11 | existing |
| `metric-adapters` | 10 | existing |
| `sae-flange-adapters` | 8 | existing (flange pad adapters) |
| `din-2353-bite-type-adapters-uae` | 7 | existing |
| `steel-hose-barb-adapters` | 6 | **new**, under `hydraulic-fittings` |
| `adapter-o-rings` | 5 | **new** (ORB and ORFS O-rings, assortment kit) |

The existing categories are listed in the payload with no bands, and the importer runs without
`--rewrite-categories`, so their names, copy and page bands are untouched.

## Part numbers

`IH-ST-<supplier part number>` (`IH-ST-2405-04-02`, `IH-ST-9235-06X.75-02`, `IH-ST-W43-16-16K`).
The supplier's own numbers and the Parker/Aeroquip numbers go in `searchAliases`.

## Size tables

- Inch ends (JIC, ORB, ORFS, NPT/NPTF/NPSM, BSP, JIS 30°, flange pads, barbs) come from the dash
  codes, cross-checked against the part name. Metric threads, DIN tube sizes, metric tube sleeves,
  Komatsu and O-ring sizes are read from the part name.
- JIS 30° ends are printed with their BSP parallel thread (`G1/4-19`).
- Dimensions where the source has a dimension table (`Y`, `D`–`D3`, `L`, `M1`–`M3`, …, in mm);
  tube O.D. for metric and DIN tube ends. 25 families carry the Parker (or Aeroquip) part number the
  manufacturer cross-references.
- Name typos settled by the part number and the source's size filter: 9042-20-20, 4603-20-20,
  2606-03-02-03, FS2601-08-08-06, 1602-20-20-20. The part number of `1602` lists the NPTF end
  first, so End 1 is the NPTF branch.
- Dropped: `9277-08-06` (name says #8 ORB, part number says -06), flange-pad rows with no part name
  (including every `-S/S` row), `FS2703-04-04-04` (filed under the wrong family in the source).

## Pressure

Only the manufacturer's own tables: SAE J514 (JIC and ORB families), ASME B31.3 NPT ratings (pipe
families), DIN 2353 working pressure in bar for the family's series, and SAE J518 Code 61/62 flange
ratings. ORFS families without a table carry the source's statement that the ORFS connection is
designed for leak-free use to 6,000 psi. Everything else says no rating is published. The source's
thread-size tables have errors (dash 2 printed as `1/8-27`) and are not used.

## Images

Checked on contact sheets. Studio photos, the single catalogue photo, the source's line drawings and
its dimension drawings (drawings under 500 px upscaled by resampling). The TITAN CGI renders are
never used: 19 families are left with no image (all the ORB elbows 6805–6902, the beaded barb
elbows and tee, 5655, 5700, 5702, FS2704, FS318, FS6809), and six keep only their dimension drawing
(5505, FS2503, FS2601, FS2702, 6408, 6408H). The 154 px photo of `2405` is not used.

## Cross-links

Each steel listing links to its stainless twin from batch 1 where there is one (40). In the same
change the 40 stainless listings were given a "Carbon-steel version" link back, and eight links that
batches 1 and 2 had made to the wrong live page were corrected or removed (`IH-SS-5503`,
`IH-SS-FS2702`, `IH-BR-3350` now point to the exact steel twin; `IH-SS-5055L/LL/S`, `IH-SS-5602`,
`IH-BR-3250` no longer claim a carbon-steel equivalent). Those edits are in the batch 1 and 2 payloads
and were applied to the live rows directly (`_scripts/batch3/apply_links.cjs`).

## Regenerating

`_scripts/batch3/` in the Hydraulics Direct export folder: `build_b3.py` (needs a fresh live index,
`live_now.json`) then `assemble_b3.py <repo>`, with `convert_b3.py` for the JPEGs in `hd-b3-jpeg/`.
