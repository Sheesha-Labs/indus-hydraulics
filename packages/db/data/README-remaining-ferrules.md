# Remaining ferrules — `data/remaining-ferrules/`

Payload for `import-fitting-families.ts`: **5 listings, 48 sizes** — the last
families in the master catalogue that had no listing.

    pnpm --filter @indus/db exec tsx src/scripts/import-fitting-families.ts \
      --payload=remaining-ferrules --publish

| Listing | Sizes | Source |
|---|---|---|
| Skive ferrule, China 1-wire | 12 | `01100` |
| Skive ferrule, China 2-wire | 12 | `01200` |
| Skive ferrule, China 3-wire | 11 | `01300` |
| Skive ferrule, R12 four-spiral | 10 | `01400` |
| Metric female waterwash insert | 3 | `20011` |

## The China-spec ferrules

Held back in the audit as a commercial question rather than a data gap: they
crimp GB-standard Chinese wire-braid hose, which is dimensioned differently
from the SAE and EN grades filling the rest of the category. The founder's call
was to list them.

Every page says so plainly — an SAE 1SN and a China 1-wire of the same nominal
bore do not take the same ferrule, and a buyer who matches on bore alone gets a
crimp that looks right and is not.

## R12 four-spiral is a real fourth R12 ferrule

Not a duplicate of the two already in the category. The dimensions settle it:
at DN10 this one crimps to 27.5 mm where `00400` reaches 25.5 mm. It also runs
DN6 to DN51 in a single part series, where the others split at DN16/DN32.

## The waterwash insert needed an extraction fix first

`20011` is the only table in the book whose header prints `O-RING` as one
token; everywhere else it splits as `O` + `RING`. The header matcher only knew
the split form, so no O-ring column was detected and the value landed in the
nearest one:

    20011-22-04T   A: 'O10.0*2.0 25'      ← O-ring size and dimension A in one cell

Adding `O-RING` to the header map recovers it. That page also prints its thread
as `M22-1.5` where every other page uses `*`; normalised to `M22×1.5` so the
same thread reads the same way across the catalogue.
