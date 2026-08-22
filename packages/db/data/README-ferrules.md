# Ferrules — Manuli series import

Source for `src/scripts/import-ferrules.ts`. Adds the **Ferrules** section under
*Hoses & Fittings*: one hub category, seven part-reference series beneath it, a
megamenu column, and one listing per series.

```
Hoses & Fittings                     (existing, /c/hydraulic-hose-fittings-suppliers-uae)
└── Ferrules                         (new hub,  /c/ferrules)
    ├── M00110 / M00120 / M00130 Skive Ferrules    11 references, DN5–DN51
    ├── M00910 / M00920 Skive Ferrules             12 references, DN5–DN51
    ├── M03300 No-Skive Ferrules                    5 references, DN5–DN12
    ├── M03400 No-Skive Ferrules                   17 references, DN5–DN102
    ├── M03500 No-Skive Ferrules                    6 references, DN10–DN31
    ├── M00310 / M00320 No-Skive Ferrules           9 references, DN5–DN31
    └── M00820 / M00830 No-Skive Ferrules          11 references, DN5–DN51
```

71 part references across 7 listings.

## Run

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-ferrules.ts --dry-run
pnpm --filter @indus/db exec tsx src/scripts/import-ferrules.ts
```

Flags: `--dry-run`, `--only=<SKU>`, `--skip-nav`, `--refresh-copy`.

`--refresh-copy` is the only destructive-ish one — it rewrites descriptions, SEO
fields and FAQ answers from the frozen payload, so it would discard an admin
edit. Everything else is additive and idempotent.

## Why one listing per series, not one per part number

The seven dimension sheets name 71 part references, but they are 71 *sizes* of
seven products. A buyer picks the series from the hose construction — skive or
no-skive; braid, spiral, textile or compact — and then reads a bore off a table.
Seventy-one listings would be seventy-one near-identical pages competing for the
same query. The full table is rendered into each listing's own description
instead, part reference by part reference, so every number is still on the page
and still indexable.

## Source and what is *not* claimed

Manuli Hydraulics' own ferrule material: an overview matrix of series against
DN, plus one dimension sheet per series. Manuli is an authorised-distributor
brand here (`brands.slug = 'manuli'`, `isAuthorizedDistributor = true`), so the
listings carry the Manuli brand rather than being rebranded.

The sheets publish part references, DN / dash / inch bores, outside diameter
(**D**) and length (**L**). They publish **no** working pressure, material,
surface treatment or standards line — so this payload asserts none. Spec counts
therefore run to 9 rather than a padded 12, which scores lower on
`scoreProductContent`. That is the same call `import-industrial-couplings.ts`
made and for the same reason: a fabricated "typical" spec is worse than a
missing one.

`D` and `L` are as-supplied dimensions, not crimp dimensions. The copy says so
in three places, because reading D as a crimp diameter is the expensive mistake
here. Crimp diameter comes from the hose grade + fitting die chart.

## Where the overview matrix and the dimension sheets disagree

The matrix under-reports four series. **The dimension sheet wins** — it names an
actual part reference, and the matrix is a coverage summary.

| Series | Matrix shows | Dimension sheet also lists | Kept |
|---|---|---|---|
| M03300 | DN5–DN10 | `M03300-08` at DN12 | DN5–DN12 |
| M03400 | to DN89 | `M03400-64` at DN102 | to DN102 |
| M03500 | to DN25 | `M03500-20` at DN31 | to DN31 |
| M00820 / M00830 | to DN38 | `M00820-32` at DN51 | to DN51 |

Three series also carry references the matrix's row label does not name. All
three are in the tables and called out in the listing copy:

- **M00910 / M00920** — the sheet is headed `M00910/M00920/M00930` and lists
  `M00930-16` at DN25.
- **M00310 / M00320** — the sheet is headed `M00310/M00321`; the DN19 size is
  `M00321-12`, and no `M00320-` reference appears anywhere on it. The category
  keeps the matrix's `M00310 / M00320` name because that is how the range is
  labelled; the table lists what the sheet actually publishes.
- **M03400** — the sheet is headed `M03400/M03450` and lists `M03450-08`, a
  second DN12 reference (D 30.3, L 31.0) alongside `M03400-08` (D 29.0, L 34.0).

## Relationship to the existing `crimp-ferrules` category

`crimp-ferrules` (15 products, under *Hose Fittings* in the nav) already exists
and is **untouched**. It is organised by hose grade — "Skive Crimp Ferrule for
R2A / 2ST Hose" — and carries the Indus brand. This section is organised by
Manuli part-reference series and carries the Manuli brand. They overlap in
subject, not in part numbers, and merging them is a product decision rather than
an import one.

## Not done

No images. Manuli's sheets carry line drawings, not photographs, and there is no
render for these yet — see `README-gap-fill-render-briefs.md` for the pattern
when one is commissioned. Listings ship with `imageCount = 0`, which costs a few
points of content score and shows the placeholder on the category grid.
