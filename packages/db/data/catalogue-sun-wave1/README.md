# Sun Hydraulics Wave 1 — `catalogue-sun-wave1`

**72 listings, 225 part numbers**, branded Sun Hydraulics (`brandSlug: sun-hydraulics`): counterbalance,
load-control and LoadMatch™ valves on `counterbalance-valves`, and relief cartridges on
`cartridge-pressure-control-valves`, both under the new `hydraulic-cartridge-valves` shelf in Valves & Manifolds.
Loaded as **drafts** on 2026-10-22 (72 created, 216 images, 0 problems; content scores 34–74). Not published.

## Listings and part numbers

- One listing per Sun **function family**: the same valve in each frame size (series 0–4). Families are Sun's
  code pattern (letters 1–2 = function, 3 = frame size/capacity, 4 = variant) grouped with the model title, so
  capacity tiers (standard, semi-restrictive, restrictive) share a listing and show in the Description column.
- SKU `IH-SUN-<letters>-<variant>`, e.g. `IH-SUN-CB-AC` is the 3:1 counterbalance family (CB_A + CB_C);
  single-model listings use the model code (`IH-SUN-RVCK`). `IH-SUN-` was unused.
- Each row's part number is Sun's base model code (`CBCA`), so the table heads it "Sun Hydraulics part no.".
  The configuration letters (control, setting range, seal, material/coating) are listed in the copy and
  confirmed with the quotation; the default full code (e.g. `CBCALHN`) is a search alias.

## Size-table columns

`series` and `cavity` (lead), `capacity` (US and metric as published), `maxPressure` where Sun publishes a
maximum operating pressure, and `item` (capacity tier) where a family mixes tiers. `series`, `cavity` and
`capacity` are new text columns in `packages/domain/src/variant-columns.ts`, added in the same change; a
`cavity` column marks the table `equipment`. **They render only after that code deploys** — publish after
the deploy, not before.

## Spec template and categories

`cartridge-valve-spec` (15 fields) is carried in the payload and upserted by the loader. The three shelves are
created unpublished; `--publish` publishes them with their products.

## Copy and images

Copy is written for Indus from Sun's model pages and FAQs (`profiles.py` in the export, one profile per valve
type); a generator guard rejects any 9-word run that matches Sun's own text. Images are Sun's dimension
drawings, schematic symbols and performance curves (GIF line art converted to PNG), used with Sun's
distributor permission. Alt text names the model, valve type and view.

## Load

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-sun-wave1 --image-dir=<export>/indus-png-wave1 --dry-run
# after the column code deploys:
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-sun-wave1 --image-dir=<export>/indus-png-wave1 --publish
```

Publish the `sun-hydraulics` brand in the same sitting, purge the `categories` and `nav-menu` cache tags, and
send IndexNow at least an hour clear of any deploy.

## Update — 2026-10-22 (with wave 3)

- Every listing gains the "choosing a size" paragraph and up to six FAQs (ordering, serviceable parts,
  installation), as wave 2 has. The low scorers move from 34–40 into the wave 2 range.
- RPIC8, the series-4 balanced piston relief main stage Sun files under *Electro-Proportional*, joins
  `IH-SUN-RP-C8`. SKUs, slugs and images are unchanged.
