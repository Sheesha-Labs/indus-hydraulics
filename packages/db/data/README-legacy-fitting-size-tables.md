# Legacy fitting size tables — `data/legacy-fitting-size-tables/`

Third payload for `backfill-fitting-size-tables.ts`. **4 listings, 33 sizes.**

    pnpm --filter @indus/db exec tsx src/scripts/backfill-fitting-size-tables.ts \
      --payload=legacy-fitting-size-tables

| Listing | Sizes | Source |
|---|---|---|
| `IH-DF-FEM-24-HS` | 9 | `20511C`, master p27 |
| `IH-DF-FEM-24-HS-45` | 4 | `20541C`, master p29 |
| `IH-DF-FEM-24-HS-90` | 10 | `20591C`, master p31 |
| `IH-JIC-FEM-37-90-LD` | 10 | `TP43-FJ9L`, crimp p10 |

## Both halves are the same mistake

Every import so far mapped a source family to **one** SKU. Twice that was
wrong, in opposite directions:

**The DIN heavy trio.** The multiseal import created three new listings from
`20511C` / `20541C` / `20591C` without checking whether we already sold the
part. We did — `IH-DF-FEM-24-HS` and its elbows, carrying the identical sealing
form and no size table. Two pages per part, one with a table and one without.
The originals keep the URL and get the tables;
`retire-duplicate-din-heavy.ts` deletes the newer pages and 301s them across.

**The JIC long drop.** `TP43-FJ9L` is "FEMALE JIC SWIVEL — 90° LONG DROP", and
it went only to the new `IH-CF43-JICF-90L`. `IH-JIC-FEM-37-90-LD` had been
sitting empty beside a table that describes it — the same thing that happened
to the 4SH and R12 ferrules in `ferrule-size-tables`.

The pattern to watch: **a source family is not a product.** One table can serve
several listings we already sell, and a new listing built from one may be a
listing we already have. Both directions want checking against our own
catalogue, not just against the supplier's.

## The guard that caught it

`retire-duplicate-din-heavy.ts` refuses to delete a duplicate whose survivor
has no size table — otherwise retiring the newer page would take the only copy
of the data with it. It fired on the first run, which is why this payload has
to be loaded before the retire script.
