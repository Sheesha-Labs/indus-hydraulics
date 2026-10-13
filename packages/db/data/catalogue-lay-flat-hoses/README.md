# Lay flat hoses — `catalogue-lay-flat-hoses`

**14 listings, 74 part numbers**, unbranded (`indus`), in a new top-level category:

- `lay-flat-hoses` (root, position 21)
  - `tpu-lay-flat-hoses` — well riser, heavy-duty well riser, dewatering / water transfer, antistatic
    fuel, drinking water, concrete placement (standard + high-pressure class), slurry supply, slurry
    drag, compressed air
  - `nbr-lay-flat-hoses` — ribbed NBR discharge hose (10 bar all sizes), heavy-duty NBR, NBR fire hose
    (red or yellow, one listing)
  - `suction-hoses` — EPDM/PE rigid-helix suction hose for the pump inlet of a lay flat system
  - `lightweight-lay-flat-hoses` — PVC lay flat discharge hose

Part numbers are `IH-LF-<line>-<DN>` (`IH-LF-TDW-150` = 6″ dewatering hose); the concrete hose's
high-pressure class is `IH-LF-TCPH-*`, and its 3-1/2″ light-wall row `IH-LF-TCPH-090L`.

Size rows carry `hoseInch`, `hoseDn` and `pressureBar` (working pressure), and in `dimensions`
the new lay-flat columns `insideDia` (I.D. with tolerance, text), `wall` (text) and `tensileKg`, plus
`burstPressure` and `weightPerMetre`; the suction hose carries `hoseOD`, `bendRadius` and `vacuum`.
The three new keys are registered in `packages/domain/src/variant-columns.ts` and render after that
change deploys — until then the table shows bore, working pressure, burst and weight.

Source notes:

- The 3″ and 4″ standard-class concrete hose rows publish 925 psi beside 43 bar (925 psi is 64 bar,
  and burst is 1,850 psi / 126 bar), so their working pressure is left empty and the copy says it is
  confirmed with the quotation.
- The dewatering and drinking-water lines publish the same table; both are listed because they are
  sold for different services (drinking-water hose: manufacturer-listed NSF/ANSI 61).
- Six listings have no published size table (heavy-duty riser, fuel, compressed air, heavy-duty NBR,
  NBR fire, PVC); their copy says the rating is confirmed with the quotation.
- Every studio photo carried the maker's centred watermark; it was removed by AI inpainting and each
  edit was compared with its original before use. Field photos and cut-outs without a mark are used
  as published. Captions (internal `Media.caption`) record which is which.

Load (images live outside the repo):

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-lay-flat-hoses --image-dir=<folder> --publish
```
