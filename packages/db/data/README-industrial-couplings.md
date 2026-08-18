# Industrial Hose Couplings — source data

Backs `src/scripts/import-industrial-couplings.ts`. Generated once from the
client workbook *Industrial Hose Couplings (2).xlsx* (209 rows, 22 groups) and
frozen, so the import is deterministic and every claim on a product page can be
traced to the page it came from.

## Files

| File | What it is |
|---|---|
| `industrial-coupling-map.csv` | Every workbook row and what was decided for it. The audit trail — includes the rows the import deliberately leaves alone. |
| `industrial-coupling-content.json` | The payload the importer reads: five new categories, and one entry per product with its source URL, image URL, sourced specs and (for new listings) copy and FAQs. |

## What the workbook resolved to

| Decision | Rows | Meaning |
|---|---:|---|
| `already-imaged` | 86 | No source link, and the product already carries a feature image from the Sealfast import (PR #228). Untouched. |
| `update` | 68 | Existing product with no image. Gets its image plus the size / material / standard values its own source page states. |
| `create` | 54 | No catalogue entry existed. Created in one of five new categories. |
| `skip-duplicate` | 1 | "3 Segment Clamp for Storz" is listed twice in the workbook, under both *Storz Coupling & Adapter* and *Clamp, Sleeves & Ferrules*. Sunpool cross-lists the same part under two menus with two photos; it is one product and stays under Storz. |

Sources: 121 Sunpool pages and 2 Seal Fast item pages, all reachable and all
carrying a distinct photo — no two products share a primary image.

## The five new categories

All under `industrial-hoses`, brand Sunpool, spec template
`industrial-coupling-spec`:

`universal-air-couplings` · `hose-clamps-sleeves-ferrules` · `gost-couplings` ·
`barcelona-geka-couplings` · `en14420-5-fittings`

They get their own megamenu column, `Clamps, Air & Regional Couplings`, rather
than joining `Specialty Couplings & Flanges`. That column already held 13
entries, which is what fits above the fold on a 720px-tall viewport, and the
megamenu panel has no scroller — appending five more put every one of them out
of reach. `src/megamenu-tree.ts` carries the same group so a re-seed reproduces
it.

## Rules the data follows

**Only what the source states.** A product gets a working pressure, a standards
line or a gasket spec only if its own page gives one — which is why spec counts
run 1–5 rather than a uniform 8. Padding them would repeat the Molykote failure,
where 63 products shared one fabricated "-40 °C to +200 °C (typical)" row that
was simply wrong for the product it sat on.

**`seoTitle` never contains the site name.** The storefront layout applies
`%s | Indus Hydraulics`; a title that already carries it renders it twice. The
importer refuses to run on data that does.

**Source slips are not republished.** Three Sunpool pages describe a *Female End*
or *Hose End* coupling with the sentence "…American Type Male End" — those
bullets are dropped rather than put on our own page. Six of the eight
EN 14420-5 pages cite "EN ISO 14420-2" while the family, the category page and
the workbook all say `-5`; the citation is stated once, correctly, in the
Applicable Standards spec instead of repeated inconsistently per product.

**Titles are the workbook's, tidied.** Typography is normalised (`EN14420-5 SS
GA fitting - Serrated` → `EN 14420-5 GA Fitting — Stainless Steel, Serrated
Tail`) and bare names are qualified from their own source page (`Washer` →
`Universal Coupling Washer (NBR)`, `3 Segment Clamp` → `3 Segment Clamp for Frac
Water Couplings`), because a one-word title is unfindable next to 1,100 other
products. The workbook's original wording is kept in the `name` column of the
CSV. One existing product was renamed to fix a typo the workbook shipped:
`Compostie Hose` → `Composite Hose`.

## Regenerating

The payload is frozen on purpose; re-derive it only if the sources change.
Every entry records `source.url`, and the importer's docblock has the selectors
for both sites.

## Running

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-industrial-couplings.ts [--dry-run] [--limit=N] [--only=SKU] [--skip-nav] [--refresh-copy]
```

Idempotent. A re-run attaches no image it has already attached and creates
nothing twice. `--refresh-copy` is the exception: it rewrites the descriptions,
SEO fields and FAQs of the listings this import created, from the payload — off
by default so a routine re-run never discards an edit made in the admin.
