# BSP / BSPT adapter size tables — `data/adapter-bsp-size-tables/`

**600 orderable sizes across 41 existing BSP adapter listings**, from pages
100–143 of the supplier's hydraulic adapter catalogue. Second batch; see
`../adapter-size-tables/README.md` for the method, the code decoding and the
`B`-versus-`C` tee finding, which this batch reuses.

Applied with `backfill-fitting-size-tables.ts --payload=adapter-bsp-size-tables`.

## Two designs under one part-number stem

The book prints `4B` (hex-head plug, bonded seal) and `4B-WD` (captive seal) in
one table under one heading, distinguished only by a suffix printed *after* the
size. Same for `1B`/`1B-WD`, `4BN`/`4BN-WD` and `5B`/`5B-WD`. They are separate
products to a buyer, so the map selects on that suffix — `4B!WD` takes only the
captive-seal rows, `4B!` only the plain ones:

| Listing | Rows |
|---|---|
| `IH-AD-BSP-012` Hexagon Socket Plug | `4BN!` — internal hex, bonded seal |
| `IH-AD-BSP-013` Blanking Plug for Ports with ED Seal | `4B!WD` — captive seal |
| `IH-AD-BSP-014` Hex Head Plug | `4B!` — hex head, bonded seal |
| `IH-AD-BSP-019` Thread Reducer | `5B!` |
| `IH-AD-BSP-020` Thread Adaptor BSP ED Seal | `1B!WD` |
| `IH-AD-BSP-053` Union | `1B!` |

## No weight, no working pressure

The BSP section publishes neither, unlike the JIC and ORFS sections. Those two
columns are simply absent from these pages, so every row here carries null for
both and the table renders without them.

## Not published

- **`1BJ`** has a numeric column between L1 and L whose header the PDF gives as
  the group word "DIMENSIONS" — the letter is lost. It is almost certainly L2,
  which is exactly why it is not published: the rest of the table is sourced,
  and one guessed column would not be.
- **`ZT`** is a cross and prints four threaded ends. `ProductVariant` carries
  three. All four are the same size on every row of that family, so nothing a
  buyer needs is missing, but it is recorded rather than passed over.

## Listings left empty

`IH-AD-BSP-001` bulkhead locknut, `037`/`039` BSP×SAE elbows, `041` BSP×NPT 45°
elbow, `048` male stud elbow, `050` BSP×ORFS (the family behind it is already
under `IH-AD-ORFS-022`, which is the same product in the other category), plus
`003`, `022`, `023`, `024`, `030`, `032`, `052` — duplicate titles for a
product already carrying the table.

## Families with no listing

`3B` BSP female 60° cone (12), `1BG9` (12), `5BT` (15), `5BN` (8), `5GB` (10),
`6B9` (7), `1BW` (13), `2WB` (9), `1BH4` (17), `1BH9` (17), `1BM` (33), `2BJ`
(39), `2TB9` (12), `7T` BSPT female (17), `7T9` (9), `5T9` (8), `5GT` (7), `4T`
(9), `1S`/`1ST`/`1ST4`/`1ST9` JIS gas male (36), `4BN!WD` (8), `1B-WD` extras.
