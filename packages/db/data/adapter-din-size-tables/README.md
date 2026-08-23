# DIN 2353 and metric adapter size tables — `data/adapter-din-size-tables/`

**934 orderable sizes across 42 existing listings** — 37 DIN 2353 bite-type and
5 metric O-ring — from pages 11–94 of the supplier's hydraulic adapter
catalogue. Third batch; see `../adapter-size-tables/README.md` for the method.

Applied with `backfill-fitting-size-tables.ts --payload=adapter-din-size-tables`.

## Two source families per listing

This section numbers the light series `1C…` and the heavy series `1D…` as
separate families, and both belong under the one product we sell. Their nominal
sizes collide — `1C-12` and `1D-12` are different fittings at the same nominal
size — so the part number carries the series letter: `IH-AD-DIN-044-C12` and
`-D12`. Where the codes differ in more than one place the mark is every
differing character, so `ACOC`/`ADOD` give `-CC…` and `-DD…`. Without it the
two series silently overwrite each other; the first build produced 24 collisions
and they are what the mark exists to prevent.

The tube O.D. column is what actually distinguishes the two series on the page,
and it is published, so a buyer can pick the row rather than the series.

## `1CH` / `1DH` — the only stated column names in the programme

Page 33 prints its table with **no column header at all** in the PDF's text
layer: the drawing ends and the rows begin. The header is not on the previous
page's foot either. Every other family in the book states its own columns, so
this one is named in the map file's third column instead —
`T1,T2,D1,D2,L1,L2,L3,L4,S1,S2,Weight (g),Working pressure (bar)` — stated
where it can be reviewed against page 33, rather than inferred inside the
builder where it could not be.

The pressure column on that page is in **bar**, not MPa. The magnitude check
confirms it: 400 for the light series and 800 for the heavy, where an MPa
column in this book never exceeds 70.

## The O-ring column

The metric O-ring pages head four columns `E F E F` — two threads and two
O-ring sizes. Keyed by label alone the thread swallowed the O-ring silently, so
columns are keyed by position. An O-ring is told from a thread by its value: a
thread always carries a letter prefix, a fraction or an inch mark, an O-ring is
a bare `8X1.9`. It lands in the `oRing` text column the renderer already has.

## Not published

`1C9` / `1D9` print a numeric column headed `I1/I2`, which is not a dimension
letter this catalogue uses anywhere else. Dropped rather than guessed.

## Listings left empty

`IH-AD-DIN-002` bulkhead lock nut, `003` cutting ring, `016` ED-seal port plug,
`021` swivel connector BSPT, `027` (duplicate of `026`), `035`/`037` banjo
elbows, `042` (duplicate of `045`); and in metric, `001` bonded seal, `005`/`006`
bulkheads, `008`/`009`/`010` plugs, `011`–`015` Komatsu, `016` metric × SAE.
This catalogue carries no banjo, no bulkhead lock nut and no Komatsu flare.

## Families with no listing

The whole metric O-ring range beyond the five mapped: `1E9`, `2E9`, `BE`, `CE`,
`1EH`, `1EH4`, `1EH9`, `1EL`, `1EN`, `1EW`, `1EW9`, `2WE` (about 150 sizes); the
metric 74° cone adapter range `1Q…` through `6Q9` (about 270 sizes — we list
the 74° cone as a *hose* fitting, not as an adapter); `ACCG`/`ADDG` BSP run tee;
`1C-Y`/`1D-Y` cylinder straight bulkhead; `1CFL`/`1DFL`/`1DFS` and their elbows
(metric bite type to SAE flange, about 70 sizes); `1CO4`/`1DO4`, `1CO9`/`1DO9`,
`1CH4`/`1DH4`, `1CG4`/`1DG4`.
