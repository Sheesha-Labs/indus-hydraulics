# Fitting size tables — `data/fitting-size-tables/`

Frozen payload behind `src/scripts/backfill-fitting-size-tables.ts`: **970 orderable
sizes across 59 existing listings**, read out of the master supplier catalogue
(97pp) and mapped onto SKUs we already sell.

## Why it exists

`import-crimp-fittings.ts` built the size-table mechanism and used it for 64 new
listings. Every other fitting and ferrule listing on the site still had a page, a
photo, a paragraph and nothing orderable. An audit against the master catalogue
put a number on it: of its 109 families, we showed zero sizes for 91.

This backfill closes the part of that gap where we already sell the product. It
adds **only** variants and search aliases — no copy, no specs, no images, no new
listings.

## What it does not carry

- **No competitor part numbers.** The crimp range carries Parker numbers because
  its source book is Parker-equivalent and prints them. This source is our own
  supplier's house numbering, which we do not publish.
- **No pressure ratings.** The catalogue publishes none.
- **No meaning for the lettered dimensions.** A, B, C, D, H, L, S1 and S2 are
  printed against a drawing the book does not include. `S1`/`S2` are almost
  certainly across-flats measurements, and are still labelled as bare letters
  for exactly that reason — see the note in `@indus/domain/variant-columns`.

## How the two size fields are read

Part numbers in this catalogue are not consistently ordered. The inch families
number themselves `<hose>-<port>`; the metric and BSP families run
`<thread>-<hose>`. The `DASH` column always names the hose bore, so it decides
which field is which rather than position.

Two rows have a `DASH` cell that agrees with neither of their own size fields —
`10411-30-10` (reads 12) and `24211-08-05T` (reads 06). Both are taken from the
part number, and the importer prints them at the end of every run.

## Duplicate rows

32 source rows are folded away as repeats of a size already in the table: the
`-A` ferrule variants on page 11 and the `-D` metric male variants on page 32
are alternate designs at the same bore, not additional sizes. Recorded in the
payload as `duplicateRowsDropped`.

## Regenerating

The payload is generated, not hand-authored — it is a faithful transcription of
the source tables with our part numbers applied. The extraction reads the PDF's
word geometry (rows anchored on their part-number token's y position, cells
assigned to the nearest column header by x), which is what makes the ragged
two-table pages parse correctly. Validation that must hold on a regenerate:

- every table has one cell count across all its rows (108 tables, 1,580 rows)
- every family in the catalogue's contents pages is accounted for
- every generated part number is unique catalogue-wide

## Which listings are still empty

This covers the listings the master catalogue actually has data for. Still
without a size table afterwards: the SS316L range (53 listings — a different
supplier), and about a dozen carbon-steel listings whose form the master
catalogue does not carry (JIC long drop, slip-on nut, thrust wire nut, inverted
flare, Supercat flange, bulkhead BSP). Those need their own source.
