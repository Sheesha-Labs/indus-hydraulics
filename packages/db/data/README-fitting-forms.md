# Fitting forms — `data/fitting-forms/`

Payload for `import-fitting-families.ts`: **15 new listings, 187 sizes**, closing
the second block of gaps from the supplier-coverage audit.

    pnpm --filter @indus/db exec tsx src/scripts/import-fitting-families.ts \
      --payload=fitting-forms --publish

## What is in it

| Group | Listings | Sizes |
|---|---|---|
| Metric flat seat — male, female, 45°, 90° | 4 | 51 |
| BSP flat seat — male, 45°, 90° | 3 | 25 |
| BSP double hexagon — straight, 90°, compact | 3 | 30 |
| BSP male 60° cone or bonded seal | 1 | 19 |
| BSPT male, SP body | 1 | 23 |
| Metric female 60° cone, 45° elbow | 1 | 10 |
| Metric male 90° cone | 1 | 9 |
| JIC male 37° cone, long body | 1 | 20 |

Three of these complete a family the site already carried in part: the metric
60° cone had a straight and a 90° but no 45°; the BSP flat seat had a straight
but neither elbow; and the BSP flat-seal male, BSP double hex and BSP flat-seat
elbows were all already on the site **in 316 stainless only**.

## What was deliberately left out

Two things in the audit's list are not here, both for the same reason — the spec
that decides whether a joint holds is not in the source.

**The multiseal ranges (11 listings, 190 sizes).** The catalogue names the
series "multiseal" and never states what the seat accepts. Sealing form is the
single most important spec on a hose fitting, and every other page in the
catalogue carries one. Shipping eleven pages with a guess in that field is worse
than not shipping them. Needs the supplier to say what the seat mates with.

**The 90° Komatsu and the JIS gas male (2 listings, 15 sizes).** Blocked on the
open cone-angle question: our existing Japanese fittings say 30° cone, this
catalogue says 60°. Adding a 90° elbow that disagrees with the straight beside
it would make the category incoherent whichever number is right.

## Metric male 90° cone

Worth knowing what it is: 90° is the *included* angle — 45° per side, the same
seat geometry as an SAE 45° flare, on a metric thread. The category now holds
60°, 74° and 90° cones whose threads are the same nominal sizes and whose seats
do not interchange. Every page says so.
