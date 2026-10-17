# MannTek Wave 1 — `catalogue-manntek-wave1`

**9 listings, 129 part numbers**, branded MannTek (`brandSlug: manntek`), on two shelves under
Industrial Hoses. **LIVE 2026-10-17**: loaded with `--rewrite-categories --publish` (9 created, 30 images, 0 problems),
brand `manntek` published, cache tags purged, 12 URLs sent to IndexNow (HTTP 200). Backup of the rewritten
shelf row: `~/Documents/Indus Supplier Research/Content Backups/manntek-wave1-backup-2026-10-17.json`.
This folder records what was loaded.

| SKU | Listing | Shelf | Rows |
|---|---|---|---|
| `IH-MNT-DDC-TU` | DDC Dry Disconnect Coupling, Tank Unit, 1"–8" | `dry-disconnect-couplings` | 7 |
| `IH-MNT-DDC-HU` | DDC Dry Disconnect Coupling, Hose Unit, 1"–8" (2"/3" Design 2.0) | `dry-disconnect-couplings` | 7 |
| `IH-MNT-DDC-CAP` | DDC Dust Caps, Dust Plugs and Pressure Caps, 1"–8" | `dry-disconnect-couplings` | 60 |
| `IH-MNT-DGC-TU` | DGC Dry Gas Coupling for LPG, Tank Unit, 1"–8" | `dry-disconnect-couplings` | 6 |
| `IH-MNT-DGC-HU` | DGC Dry Gas Coupling for LPG, Hose Unit, 1"–8" (2"/3" Design 2.0) | `dry-disconnect-couplings` | 6 |
| `IH-MNT-DAC-TU` | DAC Dry Aviation Coupling (ISO 45), Tank Unit, 2-1/2" | `dry-disconnect-couplings` | 2 |
| `IH-MNT-DAC-HU` | DAC Dry Aviation Coupling (ISO 45), Hose Unit, 2-1/2" | `dry-disconnect-couplings` | 16 |
| `IH-MNT-SBC` | SBC Safety Breakaway Coupling, Breaking-Bolt, DN 25–DN 300 | `breakaway-couplings` (new) | 20 |
| `IH-MNT-SBCC` | SBC-C Cable-Release Safety Breakaway Coupling, DN 50–DN 150 | `breakaway-couplings` (new) | 5 |

`IH-MNT-` follows the maker-prefix pattern (`IH-ENE-` Enerpac, `IH-STU-` Stucchi). `IH-MTK-` was not used:
a mud-tank family already holds it.

## Part numbers

`IH-MNT-<family>-<half>-<DN>`: `IH-MNT-DDC-TU-050` is the 2" DDC tank unit. SBC rows split by version,
`IH-MNT-SBC-I-*` industrial and `IH-MNT-SBC-M-*` marine. DAC rows split by connection
(`IH-MNT-DAC-HU-F-BSP-250`, `IH-MNT-DAC-HU-DN80-PN16A`) or body (`IH-MNT-DAC-TU-065-SS`).

MannTek's own order codes are **not** published. They are built from MannTek's designation key (Part
Number Key sheet in the export workbook) per order, and every page says the code is confirmed with
the quotation. The closures on `IH-MNT-DDC-CAP` map to MannTek configurator options as follows, for quoting:

| Indus suffix | Configurator option | | Indus suffix | Configurator option |
|---|---|---|---|---|
| `CAP-PE` | C22 | | `SEAL-AL` | P11 |
| `CAP-AL` | C11 | | `SEAL-SS` | P44 |
| `CAP-SS` | C44 | | `PRV-SS` | R200 |
| `CAP-NBR` | C13 | | `PRV-AL` | ADRAL |
| `CAP-ADBLUE` | C13AB | | `PCAP-AL` | R500 |
| `CAP-PL` | C20 | | `PLUG-PE` / `-AL` / `-SS` | A22 / A11 / A44 |

## Size-table columns

- Nominal size in `hoseInch`, e.g. `2" (DN 50)`. `hoseDn` is left empty on purpose: it relabels the
  column "Hose bore".
- `bodySize` is the socket diameter, e.g. `Ø 70 mm`. It is what decides which halves mate.
- Text columns: `ports` (threads), `mount` (flanges), `half` (closure type, caps listing only) and
  `item` (body materials, version, Design 2.0).
- `pressureBar` is set only where MannTek publishes one figure for the family: DGC 25 bar, DAC 10 bar.
  DDC (10–25 bar) and SBC (25 bar) vary with body material, so they carry it in the specs only.
- **`maxFlowLpm`** is MannTek's published flow capacity in L/min. It is a new column, registered in
  `packages/domain/src/variant-columns.ts` (unit `L/min`) in the same change as this payload. **It renders
  only after that code deploys**; until then the tables show the other columns and the flow figures
  appear in the copy and specs.

## Status and prerequisites

1. **Brand row `manntek`: created 2026-10-17**, unpublished, `isAuthorizedDistributor: true`, country
   Sweden. A published brand goes into the sitemap whether or not it has live products, so publish it
   (admin › Brands) in the same sitting as `--publish`, not before.
2. **Authorised distributor, with image permission.** Indus is an authorised MannTek distributor and has
   MannTek's permission to use its brand imagery. Every page says so in its summary, SEO description and
   order section. All 30 images are MannTek's own photos and renders.
3. **Supply** is direct from MannTek's headquarters in Sweden ("supplies MannTek couplings direct from
   MannTek in Sweden").
4. **Duplicates:** none. No existing listing, under any brand, is a MannTek product, so no MannTek-branded
   duplicates were needed. Every title starts with "MannTek" (the generator asserts it).
5. **Shelf copy.** `dry-disconnect-couplings` is live, and its short and SEO description name only
   Sealfast's aluminium build. The payload carries a rewrite covering both brands.
   `--rewrite-categories` applies it (and also writes the new breakaway shelf); without the flag the
   live row and its band document are kept.

## Load (images live outside the repo)

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-manntek-wave1 --image-dir=<folder> --dry-run
# then, when approved:
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-manntek-wave1 --image-dir=<folder> [--rewrite-categories] --publish
```

Run the IndexNow submit after publishing, and keep at least an hour clear of a deploy (pooler limit).

Dry run on 2026-10-17 against the live database, brand in place: 9 to create, 1 category to keep,
1 to create, 129 part numbers, **0 problems**.

## Source notes

- All figures come from the manntek.se product pages (Technical data tables), configurator option
  cards and the Design 2.0 brochures (XB40 DDC, XB43 DGC), fetched 2026-10-17.
- DDC body materials per size come from the configurator. They were not captured for the 6" and 8"
  tank units or the 6" hose unit, and those rows leave the body column empty.
- The SBC-C sizes (DN 50, 63, 80, 100, 150) are the configurator's list. The website spec line says
  "cable release type 1"–8"", and the page invites requests for other sizes.
- The configurator calls the DGC tank unit "for aviation fuel" (a copy error on MannTek's side) and cites
  "EN 13715" for the 3" size (taken as EN 13175). Neither is repeated. The pages cite EN 13175 and, for
  1", EN 13760.
- The DDC closures listing does not say which half a cap or plug fits. MannTek only says dust plugs
  "increase the lifespan of couplers".
- MannTek publishes no data-sheet PDFs for these families. The service instructions are in the
  export folder if a Downloads tab is wanted later.
