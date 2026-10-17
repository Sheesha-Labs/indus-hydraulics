# MannTek Wave 2 — `catalogue-manntek-wave2`

**9 listings, 76 part numbers, 30 images**, branded MannTek (`brandSlug: manntek`): the LNG / cryogenic families,
the Full Flow Ball Valves and the swivel joints. **NOT LOADED.** Built 2026-10-18 and checked with the importer dry
run only. **Shelf placement approved 2026-10-18** as proposed below; load waits for the go-ahead.

| SKU | Listing | Shelf | Rows |
|---|---|---|---|
| `IH-MNT-DCC-TU` | DCC Dry Cryogenic Coupling for LNG, Tank Unit, 1"–8" | `lng-cryogenic-couplings` (new) | 13 |
| `IH-MNT-DCC-HU` | DCC Dry Cryogenic Coupling for LNG, Hose Unit, 1"–8" | `lng-cryogenic-couplings` (new) | 13 |
| `IH-MNT-CBC` | CBC Cryogenic Breakaway Coupling, Breaking-Bolt, DN 25–DN 200 | `lng-cryogenic-couplings` (new) | 14 |
| `IH-MNT-CBCC` | CBC-C Cable-Release Cryogenic Breakaway Coupling, DN 50–DN 150 | `lng-cryogenic-couplings` (new) | 5 |
| `IH-MNT-PERC` | PERC Powered Emergency Release Coupling, 2-1/2"–8" | `lng-cryogenic-couplings` (new) | 5 |
| `IH-MNT-FFBV-1W` | Full Flow Ball Valve, One-Way, 2"–4" | `industrial-ball-valves` (existing) | 9 |
| `IH-MNT-FFBV-2W` | Full Flow Ball Valve, Two-Way, 2" and 3" | `industrial-ball-valves` (existing) | 4 |
| `IH-MNT-SWV-S` | Swivel Joint, Single Ball Race, 1"–4" | `hose-swivel-joints` (new) | 5 |
| `IH-MNT-SWV-HD` | Heavy-Duty Swivel Joint, Double Ball Race, 1"–10" | `hose-swivel-joints` (new) | 8 |

## Shelves (approved 2026-10-18)

1. **`lng-cryogenic-couplings` — new**, "LNG & Cryogenic Couplings", under `industrial-hose-suppliers-uae`,
   position 35. Holds DCC, CBC, CBC-C and PERC. The payload carries the row and its band document (hero intro, a
   "How to choose" guidance band, three FAQs), the same shape as Wave 1's breakaway shelf.
   *Alternative:* put CBC and CBC-C on the existing `breakaway-couplings` shelf with SBC. The proposal keeps them
   with DCC and PERC because an LNG buyer specifies the coupling, breakaway and release as one transfer set.
2. **`industrial-ball-valves` — existing**, under `valves-manifolds` (10 Indus own-brand valves, no band document,
   no default spec template). The payload repeats the live row word for word, so the importer's default ("keep")
   leaves it alone, and no bands are included, so no band document is written for it. Its live short and SEO
   descriptions name only stainless, carbon-steel and brass process valves (Worcester, Swagelok …). If the FFBV
   listings go here, consider a follow-up edit in admin adding "aluminium full-flow valves for fuel tankers"
   — not done in this payload.
3. **`hose-swivel-joints` — new**, "Hose Swivel Joints", under `industrial-hose-suppliers-uae`, position 36, with a
   band document. Checked first: no hose-line swivel shelf exists. `live-swivels` is *Hydraulic* Live Swivels under
   `hydraulic-fittings` (2 Hydraulics Inc. products), and `master-links-rings-swivels` is rigging hardware. The
   swivel shelf's FAQ says how these differ from hydraulic live swivels.

**Do not load with `--rewrite-categories`** unless the `industrial-ball-valves` entry is edited first: a rewrite
would also set that shelf's default spec template to `industrial-coupling-spec`. The two new shelves are created
without the flag.

## Part numbers

`IH-MNT-<family>-…` as in Wave 1 (never `IH-MTK-`):

- DCC: `IH-MNT-DCC-TU-050` is the 2" tank unit, DCC version (ISO/TS 18683); `IH-MNT-DCC-TU-ISO-050` is the 2" DCC ISO
  (ISO 21593). Same for `-HU-`. The DCC version runs DN 25–150 and DCC ISO 1"–8", as in the configurator.
- CBC: `IH-MNT-CBC-I-*` industrial, `IH-MNT-CBC-M-*` marine, DN 25–200. CBC-C: `IH-MNT-CBCC-050` … `-150`.
- PERC: `IH-MNT-PERC-065` … `-200` (the five sizes in the website technical data).
- FFBV: `IH-MNT-FFBV-1W-<M|DA|SR>-<DN>` and `IH-MNT-FFBV-2W-<M|DA>-<DN>`. M = manual, DA = pneumatic double-acting,
  SR = pneumatic single-acting with spring return (one-way only, as in the configurator). Configurator codes, for
  quoting: BV, BVP, BVPSR (one-way); BV2, BV2P (two-way).
- Swivels: `IH-MNT-SWV-S-<DN>` single ball race, `IH-MNT-SWV-HD-<DN>` heavy duty.

MannTek's own order codes are not published; every page says the code is confirmed with the quotation.

## Size-table columns

- Size in `hoseInch` (`2" (DN 50)`; CBC-C as `DN 63` etc.), `hoseDn` empty, as in Wave 1.
- `bodySize` = DCC socket diameter. **The 8" DCC ISO row leaves it empty**: the website table says 314 mm, while
  the configurator's DCC ISO 8" card says Ø 272 mm, which is the DDC 8" figure (the card's duty text is DDC copy too).
- Text columns `ports`, `mount`, `item`, and **`action`** for FFBV actuation (an existing column: "Action").
- `maxFlowLpm`: DCC, CBC and PERC flows from the website technical data. None published for CBC-C, FFBV or swivels.
- `pressureBar` only where MannTek publishes one figure for the family: CBC and CBC-C 25 bar, FFBV 10 bar. DCC and
  PERC have no pressure on the website, and swivels are "16–25 bar", so those carry it in copy/specs or not at all.

## Images

30 images, all MannTek's own photos and renders, converted to JPEG ≤ 2000 px and < 400 KB in
`~/Documents/Indus Supplier Research/Source Exports/MannTek/indus-jpeg-wave2/`. Every photo was looked at on a
contact sheet before its alt text was written. Left out on purpose:

- FFBV photos `ballvalves.jpg` / `01-ffbv-tr.png`: the pneumatic actuator carries a legible third-party actuator
  maker's label. The two-way listing therefore has one image (the configuration diagram).
- DCC field photos `dcc1*.jpg` and `dcc6.jpg` (terminal with branded trucks and an LNG tank with an operator's
  logo) and `dcc4.jpg` (identifiable person and a number plate).
- PERC `06-plc.png` / `07-plc2.png` (third-party PLC maker's name on the HMI) and `05-hpn2.png` (cabinet of
  third-party components). `cbc-cable-release.jpg` duplicates `oc6100e44.jpg` on a grey background.

## Before loading

1. Shelves are approved. Load without `--rewrite-categories`:

   ```bash
   pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
     --payload=catalogue-manntek-wave2 --image-dir=<folder> --dry-run
   # then, when approved:
   pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
     --payload=catalogue-manntek-wave2 --image-dir=<folder> --publish
   ```

2. The two new shelves are new nav/category entries: purge `categories,nav-menu` after the load and send the new
   URLs to IndexNow, keeping at least an hour clear of a deploy (pooler limit).

Dry run on 2026-10-18 against the live database (brand `manntek` published, template `industrial-coupling-spec`
present): 2 categories to create, 1 to keep, 9 products to create, 76 part numbers, **0 problems**. Read-only checks
the same day: none of the 76 part numbers, 9 SKUs or 9 slugs exists, and no redirect starts from the new paths.

## Source notes

- Website (manntek.se product pages: copy, spec lines, Technical data tables), configurator option cards
  (configurator.manntek.se: types, versions, sizes, body materials, actuation) and the LNG Solutions brochure XB39,
  all fetched 2026-10-17. Deeper configurator pages (connections, seals per size) failed to fetch.
- Classification-society type approvals for DCC, CBC and PERC are in the export, but several had expired by
  2026-10 (e.g. the BV PERC certificate in May 2026, CCS certificates in May 2026). No approval is cited in copy.
  The certificates give design pressures (e.g. DCC ISO 25 bar, PERC 16/25 bar by size) that the website does not
  publish; those were not used.
- The DCC page lists 8" in its technical data, but the configurator's DCC (ISO/TS 18683) version stops at DN 150; 8"
  is listed under DCC ISO only. Flows are applied to both versions by size, as the page gives one table.
- The CBC page says the cable-release type comes "2"–8""; the configurator lists DN 50, 63, 80, 100, 150. The rows
  follow the configurator, and the copy says to ask for other sizes.
- PERC body material is not on the website (configurator page empty); copy and rows state seals (PTFE) only.
- The swivel website table lists a 3/4" single ball race that the configurator does not; copy mentions it as on
  request. The heavy-duty configurator has no DN 65.
- SIL2 is stated as MannTek's own claim (DNV-GL assessment, IEC 61508 / 61511), as on the PERC page.
