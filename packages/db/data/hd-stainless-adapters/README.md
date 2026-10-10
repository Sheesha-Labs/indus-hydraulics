# Hydraulics Direct batch 1 — `hd-stainless-adapters` and `hd-instrumentation-fittings`

**275 new listings, 3,382 part numbers**, from the catalogue of Hydraulics Direct (Denver, US),
an Indus principal since 2026-10-09. Listed unbranded under Indus part numbers. Loaded with
`import-lifting-catalogue.ts --payload=<name> --publish`.

| Payload | Listings | Part numbers | Categories (new) |
|---|---|---|---|
| `hd-stainless-adapters` | 174 | 2,029 | 7 under `hydraulic-adapters`: JIC, ORB, ORFS, NPT & NPSM, BSP & metric, DIN 2353, SAE flange |
| `hd-instrumentation-fittings` | 101 | 1,353 | `instrumentation-tube-fittings` (under `instrumentation-controls`) → double / single ferrule |

## Why these and not the rest

Every Hydraulics Direct family was compared with the live catalogue first (the dedupe workbook,
`Hydraulics-Direct-Dedupe-vs-Live-2026-10-09.xlsx`, kept outside the repo). These are the
stainless adapter and instrumentation families with no live equivalent, plus stainless versions
of carbon-steel adapters we list (live adapters are carbon steel, "stainless on request"). Each
of those links to its carbon-steel page.

## Part numbers

`IH-SS-<supplier code>-<sizes>` for adapters (`IH-SS-2404-04-02`), `IH-TF-<supplier code>` for
tube fittings (`IH-TF-MC-8-8N`). The supplier's own numbers go in `searchAliases` only.

## Size tables

- **End 1 / End 2 / End 3** read the thread off the source's T1/T2/T3 columns where the
  dimension table has them, otherwise from the dash size in the part number. The dash-to-thread
  maps are the definitional ones (SAE J514 / J1926 share one, SAE J1453 ORFS its own). SAE
  straight-thread ends on tube fittings keep the size as printed, because the source's size
  there is ambiguous.
- **Dimensions** are the source's inches × 25.4, rounded to 0.1 mm, under the source's own
  letters so the table matches the drawing on the listing: `Y`/`Y1` (printed "Y HEX"),
  `D`–`D3`, `L`, `L1`, `M1`–`M3`, `F`, `Q`, `X`, `I`. `Y`, `Y1`, `M1`–`M3`, `Q`, `X` and `I`
  were added to `@indus/domain/variant-columns` in the same change; until that deploys they are
  stored but not shown. Tube-fitting tables mix inch and millimetre columns, so no tube-fitting
  dimensions are loaded rather than one being converted twice.
- **Equivalents**: the Parker part number (adapters) or Swagelok part number (tube fittings)
  the manufacturer cross-references, where it gives one.
- Seven exact duplicate rows in the source's single-ferrule reducing union tee were dropped.

## Pressure

Only the manufacturer's own published tables, reproduced in the description: SAE J514 ratings
for the JIC/ORB/ORFS families, ASME B31.3 ratings for the NPT pipe fittings, and 316 tubing
working pressures by O.D. and wall for the tube fittings. Source cells that a spreadsheet had
turned into dates (`2023-01-08` for `1/8`) are restored. Nothing is derived per size. The DIN
2353 families publish no readable table, so their pages say so.

## Not published from the source

- "ASTM B164" on the tube fittings' forging line — a nickel-copper bar specification, not 316.
- The garbled ORFS standards field ("SAE J5143, SAE 520101").
- Titles the source got wrong (family `AG`, sold as an armour hose guard, is a stub × female
  BSPP adapter). Every title is built from the part data and the end definitions in
  `spec_adapters.py` / `spec_tf.py`.

## Images

Part-specific studio photos (`<part>_Rectangle…`, `…_TopView…`) and the family's dimension
drawing, plus a short checked list of other images (the DIN 2353 line drawings, the flange
and ferrule photos). The supplier's CGI renders carry a large TITAN logo and a carbon-steel
finish, and its generic `-2` stock images often show a different part, so neither is used.
25 families have no usable image. Alt text is written per view; `Media.caption` holds
provenance only.

## Regenerating

`_scripts/batch1/` in the Hydraulics Direct export folder: `build_payload.py` then
`assemble.py <repo>`, with `convert.py` for the JPEGs.
