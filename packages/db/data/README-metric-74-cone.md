# Metric 74° cone — `data/metric-74-cone/`

Payload for `src/scripts/import-fitting-families.ts`: **4 new listings, 78
sizes**, from pages 36–39 of the master supplier catalogue.

    pnpm --filter @indus/db exec tsx src/scripts/import-fitting-families.ts \
      --payload=metric-74-cone --publish

## What the family is

A metric thread with a **74° included cone seat — 37° per side**, which is the
same seat geometry as a JIC 37° flare. The seat is all the two share: the thread
is metric, so a JIC half will not mate with one of these and vice versa.

It also sits one shelf away from the metric **60°** cone we already sell, whose
threads are the same nominal sizes. The thread starts happily; the cones touch
on a line instead of a face and the joint weeps. Every page in this family says
so, because it is the mistake the family invites.

## Why it was the first gap to fill

The supplier-coverage audit found 48 families we did not properly carry. This
one was picked first because it is a **complete thread standard** — male,
female, 45° and 90° — rather than an orphan variant, so it lands as a coherent
set rather than four pages nobody can navigate between.

## The one non-obvious thing in the data

Fine-pitch variants share a nominal size. `10711-12-03` is M12×1.5 and
`10711-12-03C` is M12×1.25 — different fittings, same two size fields. Our part
numbers carry the source suffix **only where dropping it would collide**, so
the common case stays clean (`IH-MF-MAL-74-0312`) and the fine-pitch row keeps
its distinction (`IH-MF-MAL-74-0312C`). The thread column shows the pitch on
every row either way.

## Standards

`Metric thread to ISO 261 (coarse and fine pitch)` — which is true of the
threads and is all that is claimed. No standard is asserted for the seat: the
catalogue names none, and 74° metric cone is not covered by a single ISO
document we could point a customer at.

## Images

All four reuse an existing render by SKU — the metric 60° male, female and 90°
elbow, and the DIN light 45° elbow for the 45°. At render scale a 60° and a 74°
cone are the same object; the seat angle is not visible. If that ever stops
being acceptable, the four need their own renders.
