# Ferrule size tables — `data/ferrule-size-tables/`

Second payload for `backfill-fitting-size-tables.ts`. **2 listings, 7 sizes.**

    pnpm --filter @indus/db exec tsx src/scripts/backfill-fitting-size-tables.ts \
      --payload=ferrule-size-tables

## Why it exists

One source table can serve several of our listings, and the first backfill pass
did not allow for that — it mapped each source family to exactly one SKU. The
`00400` table is titled **"FERRULE FOR 4SP/4SH 10-16, R12 06-16"**: one table,
three of our products. It went to `IH-CF-SK-4SP` alone, so the 4SH and R12
listings sat with an empty size table beside a source that describes them.

This gives each of the other two the subset of that table matching the bore
range **the listing itself already claims**:

| Listing | Claimed range | Rows taken |
|---|---|---|
| `IH-CF-SK-4SH-1016` | DN10 – DN16 | DN10, 12, 16 |
| `IH-CF-SK-R12-0616` | DN6 – DN16 | DN6, 10, 12, 16 |

Widening a listing's claim to whatever the table happens to carry is a product
decision, not an import one — so the import takes the subset and the mismatches
below are reported rather than silently resolved.

## Range mismatches this surfaced — for a human to decide

- **`00400` carries DN20 and DN25 rows that no listing claims.** R12 is sold in
  those bores; our `IH-CF-SK-R12-0616` stops at DN16 and `IH-CF-SK-R12-2032`
  starts at DN32, so DN20 and DN25 fall in a gap between two listings that the
  source does cover.
- **`IH-CF-SK-4SP` claims DN10 – DN51 and its table only reaches DN25.** Either
  the claim is too wide or Topa's 4SP ferrule genuinely stops at DN25 and the
  larger sizes come from elsewhere. Not guessed either way.

## Four ferrule listings still have no table, correctly

`IH-CF-NS-AC` (automotive A/C, SAE J2064), `IH-CF-SK-R9` and `IH-CF-SK-4SH-IL`
have no counterpart anywhere in the master catalogue. `IH-CF-SK-DIN20023` is a
single DN32 ferrule to DIN 20023 for 4SH/R12-32; `00401` covers R12 at DN32,
DN38 and DN51 and is already loaded onto `IH-CF-SK-R12-2032`. Whether those two
are the same part is a question for the supplier, not an assumption to make in
a payload.
