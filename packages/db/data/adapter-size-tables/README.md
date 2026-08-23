# Adapter size tables — `data/adapter-size-tables/`

Frozen payload behind `src/scripts/backfill-fitting-size-tables.ts --payload=adapter-size-tables`:
**873 orderable sizes across 51 existing adapter listings**, read out of the master
supplier's 198-page hydraulic adapter catalogue and mapped onto SKUs we already sell.

This is the first batch — JIC, ORFS, NPT/NPSM and the two JIC-to-flange
adapters. BSP, DIN 2353 bite-type and metric follow in their own payloads.

## Why it needed a schema change first

Every earlier size table was for a hose fitting: one hose end, one port. An
adapter has no hose end and two or three threaded ones, so `portLabel` became
the first end and `port2Label` / `port3Label` were added alongside
(`202608222040_variant_second_end.sql`). This catalogue also publishes a weight
and a working pressure per size, which the hose-fitting catalogue does not, so
`weightG` and `pressureBar` came with them.

## How a source family was matched to a listing

The supplier keys its families by code (`1J`, `2J9`, `AJOJ-OG`); our listings
are titled by function ("Male Connector m JIC X m NPT"). The codes decode:

| Letter | End |
|---|---|
| `J` JIC 74° cone · `F` ORFS · `N` NPT · `T` BSPT · `B` BSP 60° | |
| `O` SAE/UN O-ring boss · `H` metric ISO 6149 · `G` BSP O-ring · `M` metric captive seal | |

and the leading digit or letter gives the form — `1` male×male, `2` male×female,
`3` female×female, `4` male plug, `9` female cap, `6` bulkhead, `A` equal tee,
`B` branch tee, `C` run tee, `X` cross, trailing `4`/`9` a 45°/90° elbow.

**`B` versus `C` was read off the drawings, not guessed.** Both are captioned
"BRANCH TEE" in the contents — a copy-paste error in the source. The dimension
drawings on pages 172 and 173 show `BJ` with its swivel nut on the branch and
`CJ` with it on the run. The four-letter adjustable tees (`AJOJ-OG`) name their
three ends in printed order, which is the same order our own titles use.

## What it does not carry

- **No competitor part numbers.** This is our own supplier's house numbering,
  which we do not publish. Every variant has a null `competitorMpn`.
- **No meaning for the lettered dimensions.** T1/T2/T3 are the ends; L, L1–L6,
  S1–S4, D, D1–D4, A and B are printed against a drawing the book does not
  include, and are labelled as bare letters for that reason — see the note in
  `@indus/domain/variant-columns`.
- **No seat named on an end column.** `9/16"X18` is the same thread on a JIC
  37° male, an ORFS male and an SAE O-ring boss. The columns are numbered
  ends; the listing title says which is which.

## Working pressure

The source prints it once per band and leaves the rest of the band blank, which
means "as above" — so it is filled forward within a family, never backward. It
is printed in MPa on most pages and bar on a few; stored in bar throughout.

The unit is checked against the magnitudes rather than trusted from the label,
because a mislabel is a ten-fold error on a pressure figure. That check caught
a real one: a stray row on page 147 put a weight of 800 into the pressure
column. The row was a mis-parsed repeat of one already read from page 144.

## Source defects recorded

- `AFFH-10-10-22OG` is printed twice on page 158 against different threads
  (13/16"X16 and 1"X14). The first printing is loaded; the conflict is in
  `sourceConflicts` and prints at the end of every import run.
- `6F-LN` is printed twice, on pages 147 and 149, identically. The second table
  is discarded whole rather than row by row — reading its columns against a
  header that is not its own is how a weight lands in a pressure column.

## Which listings this batch leaves empty, and why

| Listing | Why |
|---|---|
| `IH-AD-JIC-001` lock nut, `IH-AD-JIC-002` male cross | this catalogue carries no JIC lock nut or JIC cross |
| `IH-AD-JIC-007/009/010`, `IH-AD-ORFS-002/003/004` | the adjustable tee in that exact end order is not in the book |
| `IH-AD-JIC-016/020/025/033`, `IH-AD-ORFS-012/016/021` | the 45° or 90° variant of that pair is not in the book |
| `IH-AD-JIC-004/012/017/018/021`, `IH-AD-NPT-012/014` | duplicate listings — see below |
| `IH-AD-NPT-001/002/004/005/006/010/013/016`, `IH-AD-ORFS-001/009` | no matching family |
| `IH-AD-SAEFL-001/002/003` | weld-flange and 45° JIC-flange are not in the book |

**Duplicate listings found while mapping.** These pairs are the same product
under two titles, and only one of each can hold the size table because a part
number is unique catalogue-wide:

| Loaded | Duplicate left empty | Source |
|---|---|---|
| `IH-AD-JIC-011` 90° male/female | `IH-AD-JIC-017`, `IH-AD-JIC-018` | `2J9` |
| `IH-AD-JIC-013` male/female | `IH-AD-JIC-021` | `2J` |
| `IH-AD-JIC-015` swivel cap | `IH-AD-JIC-012` | `9J` |
| `IH-AD-JIC-006` branch tee | `IH-AD-JIC-004` | `BJ` |
| `IH-AD-NPT-015` plug | `IH-AD-NPT-014` | `4N` |
| `IH-AD-NPT-019` male connector | `IH-AD-NPT-012` reducing adaptor | `1N` (its reducing sizes) |

Retiring a duplicate means a 301 and is a product decision, so it is not done
here. Left as-is they are pages with no sizes.

## Families in the book with no listing at all

Real products we could add: `1J4` 45° JIC male (7), `6J4-LN` (8), `1JN4` (27),
`1JN9-L` long NPT (46), `1JB-WD` (30), `1JG` JIC/BSP male (24), `1JG4-OG` (15),
`2MJ-WD` (7), `2TJ` (12), `2HJ` (7), `2OJ` (18), `AJ6JJ-LN` (10), `AJJ6J-LN`
(9), `AJJO-OG` (9), `6J9` (9), `1JFS`/`1JFS9` S-series flange (24), `AF`/`BF`/
`CF` ORFS tees (24), `6F9-LN` (8), `1FN9` (18), `1FM-WD` (8), `AFFG-OG` (11),
`XF` ORFS cross (8), `AF6FF-LN` (8), `GN` NPT female tee (9).

## Regenerating

Generated, not hand-authored. The extraction reads the PDF's word geometry —
part numbers are the leftmost x-cluster on a page, a run of them sharing a
family code is one table, that table's columns are the x-clusters of its own
rows, and the header above is a labelling hint only. Anchoring on the header
instead drops or scrambles a third of the book: it reads "RAPT NO." on most
pages, splits across two lines on some, sits 60pt right of the values it heads,
and puts the spanning names above the letters on some pages and beside them on
others. Validation that must hold on a regenerate:

- all 188 content pages yield at least one table (372 tables, 3,808 rows)
- no table is ragged — every row has one cell count
- every generated part number is unique catalogue-wide
- every pressure column's magnitudes agree with its printed unit
