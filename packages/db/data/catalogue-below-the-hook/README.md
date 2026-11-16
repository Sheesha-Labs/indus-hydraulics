# `catalogue-below-the-hook`

**31 listings, 351 part numbers**, unbranded, in a new group **Below-the-Hook Lifting**
(`below-the-hook-lifting`, position 7) under Lifting & Rigging. There are six leaves, and the payload
uses the existing `lifting-rigging-spec` template.

| Leaf | Listings |
|---|---|
| Spreader Beams (`spreader-beams`) | 10 modular sizes, telescopic, lattice, fixed & custom (enquiry) |
| Lifting Beams (`lifting-beams`) | multi-configuration modular beam, plus 7 enquiry pages |
| Spreader Frames & H-Frames (`spreader-frames-h-frames`) | modular spreader frames, lifting frames & H-frames (enquiry) |
| Container Lifting Frames (`container-lifting-frames`) | 1 enquiry page |
| Lifting Attachments & Tools (`below-the-hook-attachments`) | 5 enquiry pages |
| Gantries & Handling Equipment (`gantries-handling-equipment`) | 2 enquiry pages |

Part numbers are `IH-LR-BH-<type>-<capacity>`, numbered by the top rated load:

- `MSB`: modular spreader beam. One listing per size, one row per span; the span in centimetres is the
  suffix, so `IH-LR-BH-MSB-8-0300` is the 8 t beam at 3 m.
- `TSB`: telescopic spreader beam. The suffix is the span range in decimetres.
- `LSB`: lattice spreader beam.
- `MSF`: modular spreader frame. Each row is one frame size.
- `MCB`: multi-configuration lifting beam. The suffix is the configuration code (`LB`, `UB`, `SS2`–`SS4`,
  `HF1`, `HF2`) and the span.

The 17 enquiry pages (no size rows) consolidate about 45 made-to-order product pages from the source.

## Where the data comes from

- **Spreader-beam rows** come from the maker's published span charts: 238 rows at 45°, 30° and 20°
  sling-to-vertical.
- **Multi-configuration beam rows** come from the load tables in its user instructions: 95 rows,
  transcribed and checked against the printed pages.
- **Telescopic and frame rows** come from the maker's tables.
- No row is interpolated or invented.

## How the tables render

The rows use new lifting keys in `@indus/domain` `variant-columns`:

- the text columns `span` and `configuration`, both leading;
- the column `minSlingM`;
- the qualifiers `@stv45`, `@stv30` and `@stv20`.

So `wllT@stv45` renders as "WLL, 45° to vertical". **Load only after this PR is deployed.**

## Availability

`below-the-hook-lifting` is exempt from the catalogue-wide ex-stock claim (`stock-posture.ts`). These
items are built to order or shipped from the maker's stock. With no `leadTimeDays` recorded, the
pages say "Contact for availability" until a lead time is set.

## Held

`hold` keeps three listings as drafts: `IH-LR-BH-MSB-100`, `-110` and `-170`. The source pages for
those sizes repeat the 70 t size's end-unit rating and bolt data, so their copy defers to the user
instructions. They stay held until the maker confirms the figures.

## Claims rules

- Never claim DNV type approval on the standard beams. Offshore DNV designs are made to order.
- Gantries cite EN 1993 for the structure, not EN 13155.
- Forklift attachments are rated with the truck.
- No maker or trade names, no patent claims, no maker model codes and no country-of-origin badge.

## Images

None yet. The source renders carry the maker's name on the steel. They need an AI edit, and the
maker's permission, before use. Load the images in a second pass with `--image-dir=`.

## Load (after deploy)

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-below-the-hook --image-dir=<folder> --dry-run
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-below-the-hook --image-dir=<folder>
```

Publish with `--publish` once the images are attached. Then:

- add the megamenu link;
- wait at least 1 h after the deploy, then run IndexNow (`scripts/indexnow-submit.mjs --since`);
- resubmit the sitemap.
