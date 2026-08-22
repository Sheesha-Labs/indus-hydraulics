# Multiseal — `data/multiseal/`

Payload for `import-fitting-families.ts`: **11 listings, 190 sizes** — the last
large block from the supplier-coverage audit.

    pnpm --filter @indus/db exec tsx src/scripts/import-fitting-families.ts \
      --payload=multiseal --publish

| Group | Listings | Sizes | Sealing form stated |
|---|---|---|---|
| Metric multiseal — straight, 45°, 90° | 3 | 78 | 60° cone, metal-to-metal |
| BSP multiseal — straight, 45°, 90° | 3 | 65 | 60° cone, metal-to-metal |
| Metric 24° cone multiseal — L and S series | 5 | 47 | 24° cone, metal-to-metal |

## Why this waited, and what unblocked it

It was held back deliberately: the catalogue names the series "multiseal" and
never says what the seat mates with, and sealing form is the spec that decides
whether a joint holds. Web research found nothing better — every vendor page
repeats the same marketing sentence, including the manufacturer's own.

The catalogue answers it about itself. Comparing the multiseal against every
named form at **identical thread and bore**, in two independent thread
standards:

| multiseal vs | mean ΔC |
|---|---|
| 60° cone, metric | **+0.61 mm** |
| 60° cone, BSP | **+1.30 mm** |
| flat seat, metric | +4.08 mm |
| flat seat, BSP | +4.63 mm |
| 74° cone, metric | +5.17 mm |

The seat is a 60° cone. Independently, it carries no O-ring: `20411` lists an
O-ring size on every row and `20411C` "24° multiseal" has an identical thread,
tube diameter and hex with no O-ring column at all.

So the pages say **60° cone seat, metal-to-metal (no O-ring)** — for the 24°
families, 24° cone — and nothing more.

## What is deliberately NOT claimed

That the seat also takes a flat-face or bonded-seal male.

It probably does. The multiseal cone is 0.6–1.3 mm shallower than the dedicated
60° cone, which is what truncating a cone to seat a flat face would look like;
on BSP its thread coverage is exactly the union of flat seat and 60° cone; and
the catalogue already sells the male counterpart of that idea as `12611A`
"BSP MALE DOUBLE USE FOR 60° CONE SEAT OR BONDED SEAL", which we list as
`IH-BSP-MAL-60-BS`.

Probably is not good enough to print on a fitting. The FAQ says what we know,
says we are checking, and asks the customer to talk to us if their port is
flat-faced. When the supplier confirms, add the second sentence and re-run with
`--refresh-copy` — no data changes.

## The 24° families are a stronger case

`20411C` and its siblings sit directly beside their O-ring twins in the same
book with matching thread, tube O.D. and hex. That pairing is not inference —
it is two adjacent tables — so those five pages state the metal-to-metal seal
plainly and warn that both variants start on the same thread, which is what
makes them easy to order by mistake.
