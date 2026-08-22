# Fitting hardware — `data/fitting-hardware/`

Payload for `import-fitting-families.ts`: **11 new listings, 83 sizes** — the
consumables, flanges and connectors from the tail of the supplier-coverage
audit.

    pnpm --filter @indus/db exec tsx src/scripts/import-fitting-families.ts \
      --payload=fitting-hardware --publish

| Group | Listings | Sizes |
|---|---|---|
| DIN 3861 cutting rings, light + heavy | 2 | 20 |
| DIN 3870 retaining nuts, light + heavy | 2 | 20 |
| JIS flange — straight, 45°, 90° | 3 | 9 |
| Double connectors — hose-to-hose, single-end | 2 | 20 |
| Crimp ferrules — SAE 100R5, R12 DN32–DN51 | 2 | 14 |

## Three size-field shapes, not one

This batch is why `build_batch.py` grew a `sizeMode`. Reading every part number
as `<hose>-<port>` — which is right for the fittings — is wrong for all three of
these, silently:

- **`no-hose`** (rings, nuts). There is no hose bore. `RL-06` is a 6 mm tube, not
  a 3/8" hose, and the retaining nut's `NL-12` names its **M12×1.5 thread**
  while its actual tube O.D. is 6 mm in a column of its own. Rendering either as
  a hose dash would put a confident wrong number in the most-read column.
- **`hose-only`** (JIS flanges). The second field is the flange size and it is
  `5/8"` on every row in all three tables, so carrying it into our part number
  adds noise and no information.
- **`noInch`** (R5 ferrule). SAE 100R5 is numbered by its own size series, not by
  hose dash: R5 size 3 has a DN4 bore, size 4 a DN6. Deriving an inch figure from
  that number — as every other family here legitimately does — would state a
  bore the hose does not have. The DN column is real and is kept; the inch is
  dropped.

## Two listings have no image

The double connectors. The only render in Hose Menders is a **brass** mender and
these are steel crimp bodies; reusing it would show the customer the wrong
material. Left empty for a render sprint rather than filled with a near-miss.
