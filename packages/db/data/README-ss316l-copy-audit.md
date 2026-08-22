# SS316L copy overlap with Centre Point Hydraulic — audit, 2026-08-22

## Why this was run

The Al Feel product audit turned up something incidental: Centre Point
Hydraulic's SS316L catalogue and ours are the same list, item for item,
**including the mistakes** — `standpipes-for-hidrowashing-machines` (Spanish
"hidro"), `3000-psi-sae-flange-90o-elbow-code-61` ("90o" for "90°"), and
`male-jic-37-with-o-ring` with its lowercase "male". Two identical typos across
two catalogues is not coincidence, so the question was whether 53 of our
products carry someone else's copy.

## The answer

**The product names are shared. The prose is ours.** There is no duplicate-copy
problem in the descriptions.

| Measure | Result |
|---|---|
| Titles identical to CP Dubai (normalised) | **52 of 53** |
| Titles near-identical (≥0.80) | 1 |
| Titles with no counterpart | 0 |
| Mean longest shared run of text, our body copy vs theirs | **15 characters** |
| Longest single shared run found anywhere | 56 characters |
| Distinct description openings across our 53 | **53** |
| Mean length, our `descriptionLong` | 1,467 chars |
| Mean length, their description | 1,187 chars |

The 56-character "overlap" is the product **name** appearing inside a sentence —
`" Metric swivel female with o-ring 24° cone (45º elbow) i"`. That is the title
we already knew was shared, not copied prose. Nothing longer than a product name
is common to both.

Every one of our 53 descriptions is distinct from every other. Theirs are
boilerplate: 22 of their 62 pages open with the identical sentence *"Centre
Point Hydraulic maintains the most complete inventory of Stainless Steel
Fittings in the Middle East and Africa…"*. There was very little there to copy
even if someone had wanted to.

## Where the shared names actually come from

Their pages state it outright: **Brand: DICSA — Made in Spain**, on all 62.

DICSA is a Spanish stainless-fitting manufacturer. Both catalogues are built
from DICSA's product list, which is why both inherit "hidrowashing" (Spanish
*hidro*), the "90o" degree symbol, and the inconsistent capitalisation. This is
ordinary distributor behaviour — two distributors of the same manufacturer
listing the same parts under the manufacturer's own names.

That is the benign explanation and the evidence supports it: if our catalogue
had been built from *theirs*, the boilerplate would likely have come across too,
and it did not.

## What is still worth doing

Not a copyright question — a **search** one. 52 of 53 titles are word-for-word
identical to another Dubai supplier's, and both sites are competing for the same
queries. Whoever Google decides is canonical wins; the other is a duplicate.

Two options, neither urgent:

1. **Leave them.** These are the manufacturer's part names and buyers search by
   them. Matching DICSA's naming is how a customer with a DICSA part number
   finds us at all.
2. **Qualify the titles** the way PR #279 did for the category hubs — keep the
   DICSA name as the searchable core and add a differentiator
   (`SAE Counter-Flange — SS316L, Dubai Stock`). Preserves the match while
   giving each page a title of its own.

Option 2 is the SEO-correct move, but it should be taken deliberately across all
53 rather than piecemeal, and it interacts with the `scoreEntity` keyword rule
that #279 documented: the focus keyword must appear in **both** title and slug,
so titles and slugs have to move together or the score drops.

## Reproducing this

Their SS316L pages were fetched from the public `product-sitemap.xml`
(62 products under `stainless-steel-fittings/`). Comparison was
`difflib.SequenceMatcher` on normalised titles, and longest-common-substring on
HTML-stripped body text.

## Note on supply

CP Dubai is now a supplier rather than only a competitor, and they are the DICSA
distributor. Our SS316L range being DICSA product bought through them is
coherent; it is the same relationship the Eaton, Sunpool and Sealfast ranges
already have. Worth confirming with the founder that the SS316L line is in fact
DICSA, since our own rows carry no manufacturer attribution at all — they are
branded Indus Hydraulics with no `mpn` set.
