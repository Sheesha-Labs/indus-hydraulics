# Oteco Wave 1 valves — `catalogue-oteco-valves`

**27 listings, 1,614 part numbers**, branded Oteco (`brandSlug: oteco`), filed on four existing
Oilfield Valves shelves. Indus is the authorised Oteco distributor for the Middle East (Ayush,
2026-11-19): pages say so, and Oteco stock is claimed in the UAE (no `stock-posture` exemption).

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-OTC-M72-2` | Oteco Model 72 Gate Valve, 2 in, 2,000 to 5,000 psi | `oilfield-gate-valves` | 59 | 3 |
| `IH-OTC-M72-3` | Oteco Model 72 Gate Valve, 3 in, 2,000 to 5,000 psi | `oilfield-gate-valves` | 52 | 3 |
| `IH-OTC-M72-4` | Oteco Model 72 Gate Valve, 4 in, 2,000 to 5,000 psi | `oilfield-gate-valves` | 64 | 3 |
| `IH-OTC-M72-5` | Oteco Model 72 Gate Valve, 5 in, 2,000 to 5,000 psi | `oilfield-gate-valves` | 42 | 3 |
| `IH-OTC-M72-KITS` | Oteco Model 72 Gate Valve Repair Kits | `gate-valve-repair-kits` | 126 | 2 |
| `IH-OTC-M72-SUBS` | Oteco Model 72 Gate Valve Body Subs | `gate-valve-repair-kits` | 152 | 2 |
| `IH-OTC-M72-PARTS` | Oteco Model 72 Gate Valve Spare Parts | `gate-valve-repair-kits` | 282 | 2 |
| `IH-OTC-DM-2` | Oteco DM Gate Valve, 2 in, 2,000 to 5,000 psi | `oilfield-gate-valves` | 18 | 3 |
| `IH-OTC-DM-3` | Oteco DM Gate Valve, 3 in, 3,000 to 7,500 psi | `oilfield-gate-valves` | 13 | 3 |
| `IH-OTC-DM-4` | Oteco DM Gate Valve, 4 in, 3,000 to 7,500 psi | `oilfield-gate-valves` | 15 | 3 |
| `IH-OTC-DM-5` | Oteco DM Gate Valve, 5 in, 3,000 to 7,500 psi | `oilfield-gate-valves` | 6 | 3 |
| `IH-OTC-DM-KITS` | Oteco DM Gate Valve Repair Kits | `gate-valve-repair-kits` | 26 | 2 |
| `IH-OTC-DM-PARTS` | Oteco DM Gate Valve Spare Parts | `gate-valve-repair-kits` | 91 | 2 |
| `IH-OTC-PRV-2` | Oteco PRV Shear-Pin Relief Valve, 2 in, 250 to 10,000 psi | `oilfield-pressure-relief-valves` | 14 | 3 |
| `IH-OTC-PRV-3` | Oteco PRV Shear-Pin Relief Valve, 3 in, 500 to 7,500 psi | `oilfield-pressure-relief-valves` | 7 | 3 |
| `IH-OTC-PRV-PINS` | Oteco PRV Shear Pins, #3 to #60 | `oilfield-pressure-relief-valves` | 29 | 2 |
| `IH-OTC-PRV-SPARES` | Oteco PRV Relief Valve Spare Parts & Repair Kits | `oilfield-pressure-relief-valves` | 88 | 2 |
| `IH-OTC-RRV-2-5K` | Oteco Reset Relief Valve (RRV), 2 in, 400 to 5,000 psi | `oilfield-pressure-relief-valves` | 26 | 3 |
| `IH-OTC-RRV-3-5K` | Oteco Reset Relief Valve (RRV), 3 in, 400 to 5,000 psi | `oilfield-pressure-relief-valves` | 29 | 3 |
| `IH-OTC-RRV-3-8K` | Oteco Reset Relief Valve (RRV), 3 in, 3,000 to 10,000 psi | `oilfield-pressure-relief-valves` | 17 | 3 |
| `IH-OTC-RRV-KITS` | Oteco Reset Relief Valve Repair Kits & Seals | `oilfield-pressure-relief-valves` | 50 | 2 |
| `IH-OTC-RRV-PARTS` | Oteco Reset Relief Valve Spare Parts | `oilfield-pressure-relief-valves` | 163 | 2 |
| `IH-OTC-FV-PLUNGER` | Oteco Drill Pipe Float Valve, Plunger Type — Models F, FC, FA | `oilfield-float-valves` | 43 | 2 |
| `IH-OTC-FV-FLAPPER` | Oteco Drill Pipe Float Valve, Flapper Type — Models G, GA, GC, GCA | `oilfield-float-valves` | 53 | 1 |
| `IH-OTC-FV-BAFFLE` | Oteco Float Valve Baffle Plates — Ring and Spider | `oilfield-float-valves` | 18 | 2 |
| `IH-OTC-FV-KITS` | Oteco Float Valve Repair Kits — Metal and Rubber | `oilfield-float-valves` | 89 | 4 |
| `IH-OTC-FV-SPARES` | Oteco Float Valve Spare Parts and Pullers | `oilfield-float-valves` | 42 | 2 |

## Part numbers

Every row is `IH-OTC-<Oteco part number>`: `IH-OTC-112501` is Oteco 112501, the 2-inch GV250 with line
pipe thread ends. Oteco suffixes are kept as published (`V`, `LT`). Listing SKUs are
`IH-OTC-<family>`. `IH-OTC-` was checked free on 2026-11-19.

## Size-table columns

New keys in `packages/domain/src/variant-columns.ts`, added in the same change. **They render only after
that code deploys.**

- Valves: `model`, `setRange` (a relief valve's set band, never its body rating), `ends`, `service` —
  with the existing `size`, `pressureClass`, `port` and `type`. `setRange`, `ends` and `service`
  mark a table as `valve`, so a float-valve row (size, no class) is not read as rigging.
- Spares and kits: `item` with the new `fits` (the valve models the maker lists the part under).
- The valve footnote about millimetre lengths now shows only when a table has length columns; a table with
  an `ends` column gets a note that a threaded or union end can rate below the body.

## Where the data comes from

- Rows are decoded from the maker's part names and checked against the Oteco brochures (Model 72 2017,
  DM 2012, PRV 2017, RRV 2013, float valves 2011) and maintenance manuals.
- **Where a source description disagreed with its part name, the name was used** — about 60 Model 72
  valve descriptions repeat another model's text, and body-sub descriptions omit the connection.
- One reset relief valve with an undecodable end code is left out. The QA log sits with the generator.
- Dimension, trim, shell-test, shear-pin and reset-valve tables in the copy are transcribed from the
  brochures, in inches as printed.

## Claims

- **Interchange wording is limited to what Oteco publishes:**
  - Model 72 parts ↔ Cameron Type S Flex-Seal.
  - PRV parts ↔ Cameron-style shear relief valves.
  - RRV bonnet ↔ Cameron Type A/B. The 3-inch RRV is "comparable to" Type B.
  - Hammer-union ends mate with FMC Weco (EB-004).
- **No Demco claim for the DM.** No API 6A or NACE claim anywhere.
- DNV/ABS appear only where Oteco marks them.

## Images

There are 30 processed JPEGs and every listing has at least one. Sources:

- Oteco product photographs;
- renders and exploded drawings cropped from Oteco's brochures.

Use is covered by the agency agreement. Alt text is written per listing, and `caption` records the
provenance. The images sit outside the repo; pass them with `--image-dir=`.

## Load (after the code deploys)

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-oteco-valves --image-dir=<export>/indus-images-w1 --dry-run
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-oteco-valves --image-dir=<export>/indus-images-w1 --publish
```

The dry run on 2026-11-19 gave 27 to create, 1,614 part numbers and 0 problems.

## Status

- **Brand row `oteco`** was created on 2026-11-19, unpublished, with `isAuthorizedDistributor: true` and
  country United States. Publish it in the same sitting as `--publish`. The brand page copy and logo are
  Wave 5.
- **FAQs are empty (`faqs: []`) and come in Wave 4.** Re-running this payload replaces the FAQs, so they
  must be added here.
- **After loading:**
  - Update the shelf copy of `gate-valve-repair-kits`, `oilfield-float-valves` and
    `oilfield-pressure-relief-valves` to name Oteco. It currently names only Demco, Baker-pattern and
    spring/pilot valves.
  - Purge the shelf tags.
  - Wait at least 1 h after the deploy, then run IndexNow.
