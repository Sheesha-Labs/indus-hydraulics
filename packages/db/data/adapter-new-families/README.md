# New adapter families — `data/adapter-new-families/`

**99 new listings carrying 1,292 orderable sizes**, for products the supplier's
adapter catalogue carries and we did not list at all. Loaded with
`import-fitting-families.ts --payload=adapter-new-families --publish`.

The three earlier payloads put size tables on listings we already had. This one
is the other half of the audit: the families with no page on our site.

| Category | New listings |
|---|---|
| `metric-adapters` | 40 |
| `bsp-hydraulic-adapters-uae` | 22 |
| `jic-adapters` | 14 |
| `orfs-adapters` | 9 |
| `din-2353-bite-type-adapters-uae` | 7 |
| `sae-flange-adapters` | 6 |
| `npt-adapters` | 1 |

## Where every word on these pages comes from

Nothing here is written from general knowledge about fittings. Each listing is
generated from exactly two sourced inputs:

1. **The family's printed heading** — the supplier's own words for what the
   fitting is. It gives the form, the gender of each end and the seat. Read off
   the page where the family first appears (`family_titles.py`), or from the
   catalogue's own contents pages for the fifteen families whose heading sits
   somewhere the page parser cannot reach (`headings_override.tsv`).
2. **The family's own size table** — which gives the thread range on each end,
   the nominal size range, and the working pressure where the book publishes
   one.

The only added knowledge is the seat vocabulary in `build_new_listings.py`:
each entry is the standard that *defines* the seat the heading names — JIC 37°
cone is SAE J514 / ISO 8434-2, ORFS is SAE J1453, NPT is ASME B1.20.1. No
pressure, material or compatibility is inferred from it.

Where the heading names no standard, the Applicable Standards row is absent
rather than filled.

## Titles

Generated from the heading, with the catalogue's own typos corrected — the book
writes RAPT for PART, METIRC for METRIC, SAET for SEAT, WALE for MALE,
JICFEMALE for JIC FEMALE, BONDEDSEAL for BONDED SEAL, and AE FLANGE for SAE
FLANGE. All are the same class of dropped-letter error and all are listed in
`TYPOS`.

**`B` versus `C` tees are corrected against the drawings, not the caption.** The
contents captions both as the same thing in several sections. The family letter
is reliable — `B` puts the swivel nut on the branch, `C` on the run (pp.172-173).

## The light and heavy series share a page

Nine of the 99 draw on two source families, the DIN 2353 light (`1C…`) and
heavy (`1D…`) series of one fitting. They share a nominal size but not a tube
outside diameter, so the part number carries the series letter and the page
says so in its own copy.

## What is deliberately not published

- **Working pressure on the JIS 60° cone families** (`4K`, `AK`, `1KT`, `1KH`,
  `1KH9`, `1KG9`, `1K`, `1KG`). Those pages head the column "bar" and print the
  MPa ladder — 34.5, 27.5, 20.5, the same figures headed MPa everywhere else in
  the book, and 34.5 bar would be 500 psi on a steel adapter. Reinterpreting it
  would mean asserting the supplier mislabelled a pressure rating; being wrong
  about that in either direction is a ten-fold error on a safety figure, so
  those pages ship with no pressure at all rather than with our reading of one.
  The check that caught it is in `build_adapters.py` and runs on every family.
- **`Z` is expanded to `NPT`.** It is the book's private shorthand — every
  other thread carries its real designator (M, G, R, Rc) — and `Z1/8"X27` means
  nothing to a buyer holding a fitting. 1/8-27 *is* NPT 1/8 by definition, so
  this is an expansion, not a translation. Applied to the three earlier payloads
  too, which is why their `size-tables.json` files change in the same commit.

## Images

**14 of the 99 have no image**: the metric 45° and 90° elbow forms have no
existing listing in `metric-adapters` to take a render from. The other 85 point
at the render an existing listing of the same form in the same category already
uses — a join to the same `Media` row, not a copy. A render from another
category's elbow would be the wrong fitting in the photograph, so those 14 wait
for their own.

## Regenerating

`build_new_listings.py` in the session scratchpad, reading `adapter_tables.json`
and `family_headings.json`. It reuses `build_adapters.py` for the variants, so
a fix to the size-table extraction reaches both the backfills and these pages.
