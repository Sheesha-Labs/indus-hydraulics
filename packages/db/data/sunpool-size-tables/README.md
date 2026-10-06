# Sunpool size tables

Size tables for the Sunpool listings, applied on 2026-10-07 by
`src/imports/2026-10-07-sunpool-size-tables/run.ts`. 61 listings got
580 size rows and a "Sunpool sizes" block in the description. Three more got
the block alone. Before this none of the 120 Sunpool listings had a size table.

The same run corrected the older Storz, KC, Guillemin, composite and sandblast
listings. Their family-wide "Size range" line, and the FAQ that repeats it,
contradicted Sunpool on 57 listings. On 54 of them the description's
"Material" line also contradicted the listing's own spec row, which holds
Sunpool's value, and on 4 so did the "Working pressure" line.

## How it was built

1. **`scrape_website.py`** reads the Sunpool catalogue page behind each
   listing, using the listing-to-page map the industrial couplings import
   recorded in `../industrial-coupling-map.csv` (120 pages, HTML only). It
   writes `website.json`: each page's title, bullets, tables (line breaks
   kept) and linked files. The Chinese and Japanese pages carry nothing the
   English ones do not.
2. **Part-number lists.** Three pages link a PDF: Storz, KC and UAC (universal
   air couplings and whip checks). They were downloaded into a scratch folder
   and are not committed. **`parse_pdfs.py`** reads each page's table from
   the text layer, keeping only text that is painted on the page. It writes
   `pdfs.json`.
3. **`build.py`** applies the rules below and writes `payload.json`. It prints
   every value it drops, and why.

## Rules

- **A row exists only where Sunpool names the size.** That means a per-size
  table or size list on the listing's own page, or the part-number list the
  page links. A page that gives only a range ("3/4"-4"") gets no rows. Which
  sizes inside a range are actually made is exactly what is not known. So
  Guillemin, Barcelona/Geka, EN 14420-5, flanges, most composite fittings,
  sanitary clamps, gaskets, blank ends and 3-way couplings have no rows.
- **When Sunpool says two things, the narrower one wins.** A size outside the
  page's own range is dropped:
  - brass and stainless Storz 25 and 32;
  - the EU hose end at 1/4";
  - the Guillemin 6" × 4" reducer.

  A size only one of page and part-number list carries is also dropped. The
  heavy-duty KC nipple and both KC flanges are listed from 3/4" but tabled
  from 2", so they start at 2".
- **A value Sunpool prints two different ways is not published.**
  - Storz 38's lug distance is 52 mm on the pages and 51 mm in the
    part-number list.
  - Storz 110A is a 4" hose on the pages and 4.5" in the list.
- **Nothing is corrected.** A broken row keeps its size and loses its values.

## What the sources get wrong

- The heavy-duty ferrule's 12" row gives O.D. 355.6 and I.D. 244.5 mm, a
  55 mm wall. The row is kept with no dimensions.
- Interlocking clamp ranges CD (`1-1/16"~7/8"`) and B29 (`2-3/4"~2-1/16"`)
  run backwards, and A10's `1-5/6"` is not a real fraction. Those ranges are
  not shown.
- The double bolt super clamp lists 95–105 mm twice, where 90–100 mm would
  fit the sequence. It becomes one row, and 90–100 mm is not invented.
- The KC/camlock sleeve heads its I.D. column "(mm)" but prints inches in
  64ths. The block shows simplified inches with millimetres.
- On the 30° FDC elbow page, two of the four size lines repeat the other two.
  The listing gets two rows.
- The reducing Guillemin page prints its size list in the Material row, and
  the listing's "Materials Available" spec copied it. The runner leaves that
  listing's Material line alone. The spec row itself still needs fixing.
- The Storz long-shank page prints Storz 25 as "DN15 / 1"". The inch size
  agrees with the part-number list, the DN does not, and no DN is shown.

## Presentation

- Hose-tail Storz couplings show the size as `2-1/2" (Storz 65)`. Adapters,
  fire department connections and the swivel adapter get two numbered ends,
  for example `Storz 65` and `1-1/2" female thread`, so the size table never
  heads a Storz size "Flange size".
- Clamps sized by clamping range show `17–19 mm`. EN 14420-3 / DIN 2817 and
  EN 14423 clamps show Sunpool's `25 × 6 mm`. That designation is hose bore ×
  wall thickness, as distributors of DIN 2817 clamps publish it (Landefeld,
  Tubes International).
- Lug distances, O.D./I.D./wall/length and clamping ranges go in the
  description block, not the size table. The size table's fitting columns
  are drawing letters (A–F, D1–D4…). A named Sunpool column such as "Lug
  distance" has no column there, and renaming it a letter would invent a
  drawing.
- The double bolt clamp's SL sizes and the whip checks get the block only. A
  size table holding nothing but part numbers says less than the block does.

## Not fixed — still generic on the older listings

These lines predate the Sunpool import and are not Sunpool's:

- **Working pressure.** Storz "Up to 16 bar (232 psi) — typical fire-service
  Storz rating" (25 listings). KC "Up to 600 psi (frac water); 250 psi
  (suction service)" (10). Guillemin "Up to 16 bar" (9). Composite "Up to
  14 bar" (6). Sandblast "Up to 300 psi" (3). Sunpool publishes a pressure
  for only the heavy-duty KC range (300 psi) and the 30° FDC elbow (250 psi).
- **End A / End B, seal and standards lines and family paragraphs** written
  for the family rather than the product.

## Re-running

```bash
python3 scrape_website.py --cache=/path/to/html
```

```bash
python3 parse_pdfs.py /path/to/pdfs
```

```bash
python3 build.py
```

```bash
pnpm --filter @indus/db exec tsx src/imports/2026-10-07-sunpool-size-tables/run.ts --dry-run
```

The dry run is a no-op when nothing has changed. The runner refuses:

- any product that has size rows it did not write;
- a "Size range" line, FAQ or spec that is not the value it expects to
  replace;
- an unmarked Sunpool block.
