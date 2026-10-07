# Sealfast size tables

Size tables for the 88 Sealfast coupling listings, applied on 2026-10-06 by
`src/imports/2026-10-06-sealfast-size-tables/run.ts`: 593 size rows, 228 of
them with dimensions, and a "Sealfast part numbers" table (every size by
material) in each description. Before this none of the 88 had a size table.

## How it was built

1. **`scrape_website.py`** read every products.sealfast.com family page the
   listings map to (HTML only) and recorded each item row: Sealfast part
   number, size, material, style. Output: `website-families.json`, 195
   families, 1,348 items.
2. **Datasheets.** The 35 PDFs those families link were downloaded from
   `products.sealfast.com/Asset/` into a scratch folder. They are Seal Fast
   Inc.'s drawings and are not committed. The products already link them.
   **`parse_datasheets.py`** read each sheet's table from the PDF text layer,
   keeping only words actually painted on the page. Output: `datasheets.json`.
3. **`build.py`** maps each listing to its families and datasheet, converts
   inches to millimetres and writes `payload.json`. It prints every value it
   drops and why.

## What the sources get wrong, and how it is handled

- **Hidden text.** Several sheets blank a row out with a rectangle but leave
  its values in the text layer, usually copies of a neighbouring row. Any word
  with no ink under it is discarded.
- **Copied and shifted rows.** CrimpTEK C 2", DD 5" × 4", DW 6", BLN 8" NAE
  and BR 1-1/2" × 1" carry another row's values. Every coupler head is
  cross-checked against Type C, and every adapter against Type A, within 2%.
  Stainless heads are thinner, so only their bore is checked. A row that fails
  loses all its dimensions but keeps its size and part number.
- **Typos.** Type D 10" and 12" have D1 and D2 transposed. Other typos: Type E
  12" shank, DP 1-1/4" D1 (2.791), ER 2" × 3" D1 (3.484). Each is in `DROP`
  with its reason. One port is corrected (`PORT_FIX`): Type D 2-1/2" is printed
  "2-1/4" NPT", but its own size column and part number say 2-1/2".
- **Unusable sheets.** Eight sheets are in `NO_DIMS`: SA, AR, DCL, DR, the
  Type DD elbow, both thread reducers and AW. Their listings get part numbers
  but no dimensions.
- **Wrong materials on the website.** Every aluminium, brass and Ny-Glass dust
  plug says 316 stainless in the page's Material column. Material is read from
  the item name first, then the family title.

## Deliberately not published

- **W.** On the couplers it is the width across the cam arms; on Type F it is
  the overall width. The size table's W column means a spanner size.
- **Letters the size table cannot carry:** D5–D9, H1, W1, W2, T1–T3, PCD.
- **Pressure as a size-table column.** The column stores whole bar, so 25 psi
  would print as 2 bar. Pressure goes in the description table instead, in
  psi and bar, labelled with the body material it was rated for.
- **The "-1/-2/-3" gauge-port versions** of SA, DD and DA. They are separate
  products.

## Re-running

```bash
python3 build.py
```

```bash
pnpm --filter @indus/db exec tsx src/imports/2026-10-06-sealfast-size-tables/run.ts --dry-run
```

The dry run is a no-op when nothing has changed. The runner refuses any product
that has size rows it did not write.
