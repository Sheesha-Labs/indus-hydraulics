# Industrial hose size tables

217 orderable sizes across the 36 non-metallic industrial hose listings, built
from the supplier's hose catalogue (pages 4–22, one family per listing).

Load with the generic backfill:

```bash
pnpm --filter @indus/db exec tsx src/scripts/backfill-fitting-size-tables.ts --payload=industrial-hose-size-tables
```

## What a row carries

| Field | Source column |
|---|---|
| `hoseDn` | `I.D (mm)`, or `Nominal Bore (mm)` on the composites |
| `hoseInch` | **derived** — see below |
| `pressureBar` | `Max Working Pressure (Bar)` |
| `dimensions.hoseOD` | `O.D (mm)` |
| `dimensions.burstPressure` | `Min Burst Pressure (Bar)` |
| `dimensions.vacuum` | `Vacuum`, on the PVC families that publish one |
| `dimensions.bendRadius` | `Min Bend Radius (mm)` |
| `dimensions.weightPerMetre` | `Weight (Kg/Mtr)` |

`hoseDash`, `portLabel` and `portDash` are null throughout: a hose has a bore,
not a dash size or a port. `weightG` is null because a hose is sold by the
metre, so its weight is a per-metre figure and lives in `dimensions`.

**The inch column is derived, not printed.** The book gives millimetres only.
`hoseInch` is filled from the nominal bore ladder the trade uses (6 mm = 1/4",
19 mm = 3/4", 51 mm = 2" …) and is emitted **only** for bores that ladder
names — an unlisted bore gets no inch label rather than a rounded one.

## Pressure columns withheld on five listings

`A125`, `A235BK`, `A901GG`, `A906PG` and `A911SG` ship **without** the working
and burst pressure columns. Their published rating on this site was set by the
founder in the 2026-08-21 rebrand and differs from the manufacturer's:

| Listing | Catalogue | This site |
|---|---|---|
| A125 | 25 bar | 20 bar |
| A235BK | 7 bar | 10 bar |
| A901GG | 14 bar | 20 bar |
| A906PG | 14 bar | 20 bar |
| A911SG | 14 bar | 20 bar |

That is a standing product decision, not an oversight, so this import does not
overturn it — and it does not print a per-size figure that argues with the
title and spec table on the same page either. Bore, O.D., bend radius and
weight are published for all five; the two pressure columns are absent.

Resolving it is a founder decision in one direction or the other. When it is
made, drop the listing from `PRESSURE_WITHHELD` in the build script and re-run.

## Rows the book stars

`A104` derates its three largest bores — DN32 and DN38 to 17 bar, DN51 to
14 bar — and marks them with an asterisk against a family safety factor stated
as "4:1 (except \*)". The book never gives the exception's factor, so the
derated working and burst pressures are published as printed and no safety
factor is claimed for those rows.

## Not in this payload

Metallic and PTFE hose (catalogue pages 23–29) and the specialist lines
(Bulkstream, heat-traced, GSM, pages 30–31). Those listings live under
different categories and keep the supplier's own brand, so they are a separate
mapping job.

Nothing from the supplier's own branding reaches the site: this payload carries
sizes only, and the listings' copy, certification claims and lay-line strings
were dealt with in the 2026-08-21 rebrand.
