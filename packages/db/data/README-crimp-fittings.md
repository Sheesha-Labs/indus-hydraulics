# Crimp fitting catalogue — `data/crimp-fittings/`

Frozen payload behind `src/scripts/import-crimp-fittings.ts`. Two files:

| File | What it is |
|---|---|
| `catalogue.json` | The import payload — 2 categories, 64 listings, 650 orderable sizes, with copy, specs, FAQs, SEO fields and competitor references. |
| `tables.raw.json` | The 65 source tables exactly as extracted, before any curation. Provenance: every field in `catalogue.json` traces back to a row here. |

## Where it came from

A licensed supplier's crimp hydraulic fitting catalogue (45pp PDF, 2026), covering
two hose series and 33 end configurations. We sell the range Indus-branded, so the
supplier is not named on the storefront; the PDF lives outside the repo with the
rest of the supplier catalogues.

`tables.raw.json` was produced by reading the PDF's **word geometry**, not its text
stream. That distinction matters if this ever needs regenerating: the text stream
returns cells in reading order with no column identity, and three of the source
tables print a stray cell on its own line, so a text-order parse silently drops
values. The geometry parse instead anchors each row on its part-number token's
y-position and assigns every other token to the nearest column header by
x-position. Two checks pinned it down — every row in a table has the same cell
count, and each row's own size column agrees with its printed part number.

## What curation added

Everything in `catalogue.json` that is not a number from a table:

- **Our part-number scheme.** `IH-CF43-<END>` / `IH-CF71-<END>` per listing;
  `<listing>-<hose dash><port dash>` per size, zero-padded to two digits each.
  Generated from the row data rather than transliterated from the supplier's
  numbering — which is what caught the three rows whose printed number
  contradicts their own size columns.
- **Titles, descriptions, FAQs, SEO fields**, written from the structured facts.
- **Competitor references**, printed in the source per family. Per-size numbers
  are `<series ref>-<hose dash>-<port dash>`, emitted only for the families whose
  second size field is an SAE dash — never for the metric or JIS families, whose
  second field is a tube O.D. in millimetres.

## What it deliberately does not carry

- **Pressure ratings.** The source publishes none. The assembly rating belongs to
  the hose grade and bore.
- **Country of origin.** Not stated by the source.
- **Meanings for the lettered dimensions.** The source prints A/B/E/F/H against a
  drawing we do not have. Only `W` ("W- HEX" / "W -NUT") and `Tube O.D.` name
  themselves in the source headers, and only those two carry a description in
  `@indus/domain/variant-columns`.

## Two references are derived, not printed

`IH-CF43-DINHM` (`1D243`) and `IH-CF71-DINHF-45` (`10C71`). The source omits both;
every other family prints `<base><series>`, and each of these has its
opposite-series twin printed, so the missing half is the book's own convention
applied to its own data. They are flagged as `competitorRefsDerived` in the
payload and the importer prints them at the end of every run. Verify them against
a competitor price list before leaning on them in paid search.

## Regenerating

The payload is the source of truth for the copy — it was hand-authored on top of
the extraction, not derived from it, so there is no generator to re-run. Edit
`catalogue.json` and re-run the importer with `--refresh-copy`. If the underlying
tables ever need re-extracting, `tables.raw.json` documents the shape to produce:
one entry per source table with `page`, `series`, `code`, `parker`, the resolved
column `anchors`, and one `rows` entry per size carrying both the raw cells and
their column mapping.
