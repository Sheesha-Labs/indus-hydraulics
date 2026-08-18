# Molykote catalogue expansion — source data

Backs `src/scripts/import-molykote-expansion.ts`. Adds the 112 MOLYKOTE®
products DuPont publishes that the catalogue did not carry, taking the range
from 61 listings to 173.

## Files

| File | What it is |
|---|---|
| `molykote-expansion-map.csv` | One row per product: SKU, title, category, the DuPont page it came from, and whether it has an image and a data sheet. |
| `molykote-expansion-content.json` | The payload the importer reads — two new categories plus one entry per product. |

## Where the 112 came from

`https://www.dupont.com/sitemap.xml` lists **258** Molykote URLs, but only
**152** are product pages (`/products/`). The rest are brand and industry
marketing pages (98), knowledge articles (7) and the Molykote landing page.
Of the 152, **40** were already on the site — those are the ones recorded in
`molykote-dupont-map.csv`. The other **112** are here.

## Categories

DuPont's own `Product type` field is the classification, and the first value
wins when a product is filed under two:

| DuPont type | Category | Count |
|---|---|---:|
| MOLYKOTE® Grease | `molykote-greases` | 40 |
| MOLYKOTE® Oil | `molykote-oils` **(new)** | 28 |
| MOLYKOTE® Paste | `molykote-pastes` | 13 |
| MOLYKOTE® Anti Friction Coating | `molykote-anti-friction-coatings` | 12 |
| MOLYKOTE® Dispersion | `molykote-dispersions` **(new)** | 12 |
| MOLYKOTE® Compound | `molykote-compounds` | 7 |

Oils and Dispersions had no home in the catalogue. Sweeping 40 products into
"Specialty Lubricants" would have made that bucket larger than any real
category in the range, so they get their own.

## What is on each page, and where it comes from

**All of the product-specific content is DuPont's.** The description is their
Key Properties, Performance Benefits and Applications copy. The specifications
are their own *Product Details* table — technology, thickener, solid lubricants,
NLGI grade, service temperature range, base oil viscosity, ISO viscosity grade,
appearance. The pack sizes are the ones their page lists.

**Nothing is generated to fill a gap.** Spec counts run 1–7, not a uniform
number, because that is what DuPont publishes per product. This matters more
here than anywhere else in the catalogue: the 61 Molykote products already on
the site shipped with eight identical fabricated spec rows, and
"-40 °C to +200 °C (typical)" was simply wrong for the product it sat on.

**The one thing that is ours** is a clearly-separated "About this type of
lubricant" and "How to choose" section per product type — six blocks covering
greases, oils, pastes, anti-friction coatings, dispersions and compounds. These
are properties of the lubricant class, never a claim about the individual
product. They exist because DuPont's own copy averages 80 words, which is too
thin to rank or to help a buyer choose.

## Coverage

| | |
|---|---:|
| Products | 112 |
| With an image | 111 |
| With an English data sheet | 92 |

**`Molykote D-7620 Anti-Friction Coating` has no image.** DuPont's page names a
Scene7 asset that 403s on the public CDN, and the only other id on that page
belongs to a different product (111 Compound). It ships without one rather than
with the wrong can.

**77 distinct photos cover the 111 imaged products.** DuPont publishes a shared
pack shot for many grades — 16 greases share one, 9 share another, and the
`211 Fluid` viscosity grades share two between them. These are the
manufacturer's own images for each product and a 1 kg can of one grade does look
like a 1 kg can of the next, but the listing grid will show repeats.

## Traps worth knowing

**Scene7 ids must be filtered to the product's own slug.** A product page also
renders related-product photos — the D-7620 page carries a 111 Compound image.
Ids with a long leading run of zeros are internal and 403 on the public CDN, so
the picker prefers the short form and every id in the payload was fetched
successfully before being frozen.

**The data sheet language is the folder after `/documents/`, not `/en/`.** Every
locale's path contains `/en/` in the region segment
(`amer/us/en/Molykote/...`), so filtering on that alone picked eleven German
sheets and one Japanese one. Each of the 92 sheets was then fetched to confirm
it returns a real PDF.

**Data sheets are linked at DuPont's URL, never re-hosted**, so a superseded
sheet is never served from our storage.

## Running

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-molykote-expansion.ts [--dry-run] [--limit=N] [--only=SKU] [--refresh-copy]
```

Idempotent. A product that already exists is skipped unless `--refresh-copy` is
passed, and an image already attached is not re-uploaded. `--refresh-copy`
rewrites descriptions, SEO fields and FAQ answers from the payload, so it would
discard an edit made in the admin.
