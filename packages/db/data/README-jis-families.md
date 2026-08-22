# JIS families — `data/jis-families/`

Payload for `import-fitting-families.ts`: **2 listings, 15 sizes** — the 90°
Komatsu female and the JIS gas male.

    pnpm --filter @indus/db exec tsx src/scripts/import-fitting-families.ts \
      --payload=jis-families --publish

## Why these waited, and why the reason was wrong

They were held back as "blocked on the supplier" over an apparent spec
conflict: our Japanese fittings said the seat was a **30°** cone, the master
catalogue said **60°**.

There was no conflict. The supplier's two catalogues use different angle
conventions for the same seats:

| Seat | Crimp catalogue (43/71) | Master catalogue |
|---|---|---|
| JIC | 37° | 74° |
| JIS / Komatsu | 30° | 60° |

37° from the centreline is 74° across the full cone; 30° is 60°. Half-angle and
included angle, neither book saying which it uses. The same trap had already
been identified twice in this project — the crimp range's JIC seat and the
metric male 90° cone — and it still got logged as a contradiction.

Nothing on the site was wrong and no supplier query was needed. What was wrong
was that our own catalogue had ended up mixing the conventions, so a customer
holding a drawing that quotes the other number had no way to tell whether it
was the same part.

`restate-jis-cone-angle.ts` states both on the nine listings that carried one,
and everything here ships with both from the start.
