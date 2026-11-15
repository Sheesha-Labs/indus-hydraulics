# `catalogue-seamless-finned-tubes`

**76 listings, 520 part numbers** under a new root, **Seamless Finned Tubes**
(`seamless-finned-tubes-uae`), with 6 groups and 40 subcategories. Every listing is
**unbranded**, under `IH-TF-<leaf>-<family>` with a size suffix per row. The payload also
carries a new spec template, `heat-transfer-tube-spec`.

| Group | Listings |
|---|---|
| Finned Tubes | 17 |
| Seamless Steel Tubes & Pipes | 16 |
| U-Bend Tubes | 11 |
| Copper & Copper-Alloy Tubes | 9 |
| Heat Exchangers & Boiler Pressure Parts | 15 (enquiry pages) |
| Tube Sheets & Exchanger Components | 8 (forged flanges is an enquiry page) |

## Where the data comes from

- The product range comes from the supplier catalogue exports.
- Size tables, grades and tolerances come from the standards' own tables and from other makers'
  published availability. A row is either straight from a standard, or offered by at least two makers.
  A table taken from one maker's chart is labelled **"Typical sizes — other sizes on request"**.
- Range-only rows are kept as one row per range, with the band printed as published. Their part
  numbers end in `-R1`, `-R2` and so on.
- No row is interpolated or invented.

## How the tables render

Size tables use the **tube** columns in `@indus/domain` `variant-columns` (`TubeTextKey`). Every value
is text, as published, because tube and fin tables print bands and limits:

- a fin density of `6–12`
- a wall of `≥2.11`
- a plate edge of `≈64 (2 × OD)`

The tables need this code to render, so **load only after the code in this PR is deployed**.

## Claims rules

- Fin temperatures are *typical maker limits*, never quoted "per API 661".
- A179 and A192 carry no tensile minimum; they are hardness-controlled.
- U-bends: a 1.5 × OD radius is available, and tolerances are guaranteed from 2 × OD. Wall thinning
  follows the governing specification on the order, never a single percentage.
- DIN 17175 and DIN 1629 are marked as superseded.
- Grade cross-references are marked *indicative*.
- No maker or trade names appear anywhere. "High Flux" is listed as a *sintered porous-coated
  boiling tube*, and "Twisted Tube" as a *helically twisted oval tube*.

## Page types

- **Enquiry pages** (16): exchangers, bundles, coils, boiler pressure parts and forged flanges. They
  carry no size rows and no price. They hold the RFQ checklist, a section on how we build and quote,
  and standard geometry where it exists (corrugated furnaces, heads, flange series). They are indexed
  on content score, not on size rows.
- **Reference listings** (8): tube sheets, baffles, feedwater-heater tube, copper-alloy U-bends and
  extra-long tube. These are made to drawing. The standard's geometry (pitch, hole clearances, scope)
  is an HTML table in the description, not part numbers.
- **Held** (`hold`, 14): families with no published size data yet. They load as drafts and stay drafts:
  crimped, notched, laser-welded, enhanced-surface, finned U-bend, serpentine, support collars,
  turbulators, stainless mechanical, ERW boiler, 63/37 brass, and the GB/T 8162 / 8163 / 9948 / 6479
  tube.

## Images

There are 20 photos, each checked by eye against its listing, with alt text written per §13. The
photos sit outside the repo; pass their folder with `--image-dir=`. Watermarked photos are not used.

## Load (after deploy)

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-seamless-finned-tubes --image-dir=<folder> --dry-run
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-seamless-finned-tubes --image-dir=<folder> --publish
```

Then add the megamenu link, run IndexNow (`scripts/indexnow-submit.mjs --since`) and resubmit the
sitemap.
