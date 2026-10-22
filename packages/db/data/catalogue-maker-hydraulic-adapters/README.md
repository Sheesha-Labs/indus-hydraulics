# Maker-branded hydraulics — wave 1 (`catalogue-maker-*`)

Eight payloads, one per spec template, listing maker-branded hydraulic ranges under the maker's own
name (Parker, Aeroquip/Eaton, Dixon, Enerpac, Gates, Brennan, Adapt-All, ZSI-Foster, Vickers …).
Built 2026-10-21 from a supplier catalogue export; the generator and the source data stay outside the repo.

| Payload | Template | Listings | Part numbers |
|---|---|---|---|
| `catalogue-maker-hydraulic-adapters` | `hydraulic-adapter-spec` | 226 | 5,794 |
| `catalogue-maker-quick-couplers` | `quick-coupler-spec` | 294 | 4,772 |
| `catalogue-maker-hose-fittings` | `threaded-fitting-spec` | 185 | 1,956 |
| `catalogue-maker-hydraulic-hoses` | `hydraulic-hose-spec` | 135 | 1,784 |
| `catalogue-maker-pumps-motors` | `pump-spec` | 69 | 1,909 |
| `catalogue-maker-industrial-couplings` | `industrial-coupling-spec` | 55 | 613 |
| `catalogue-maker-filtration` | `filter-spec` | 49 | 1,263 |
| `catalogue-maker-cylinders-tools` | `cylinder-spec` | 50 | 531 |

One listing = one maker range with its size table. Every shelf already exists, so loading is data
only — no new categories, no new size-table columns, no deploy.

## Load

Brands first (new ones are created unpublished), then each payload, then `--publish` once checked:

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-maker-hydraulic-adapters --image-dir=<folder> [--dry-run] [--publish]
```

Do not load while a production build is running — both use the same pooled database.

## Rules the generator applied

- **Already covered:** a range whose part numbers are mostly live already (as an Indus row, alias or
  competitor cross-reference) is not listed. A range with a few covered rows loses just those rows.
- **Columns:** connection ends go to `portLabel`/`port2Label`; the maker's row description to `item`;
  hex across flats to `W` (mm); pressures to `pressureBar` (fittings, hose) or `ratedPsi`/`maxPsi`
  (couplings, pumps); hose bore to `hoseInch`/`hoseDash`, bend radius and O.D. in mm, burst in bar;
  cylinder capacity, stroke, heights, bore and rod in the published units. Anything else stays in the
  row description rather than being guessed into a column.
- **Specs:** the lead part's specification rows that do not vary across the range (packaging
  dimensions, weights and price-related rows dropped).
- **Commerce fields:** `countryOfOrigin` and `hsCode` from the lead part; `mpn` and `weightKg` only
  for single-part ranges, because a family weight would be wrong for most of its sizes.
- **Not listed:** distributor house labels, an interchange-filter line (held for a separate decision),
  general industrial, sanitary, fire-service and plumbing lines (second pass), cylinder accessories,
  accumulators and oil coolers (no shelf yet).
- **Images:** maker catalogue photos, converted to JPEG ≤ 1600 px and < 400 KB; caption is internal
  provenance only.
