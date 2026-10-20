# Dinamic Oil Wave 4 — accessories, options, images, certificates

**LIVE 2026-10-21 ~00:30 +04 (20:30 UTC on the 20th)**, except the class certificates (see below).

## New shelf `gearbox-winch-accessories` (4 listings, 108 part numbers)

| SKU | Listing | Rows |
|---|---|---|
| `IH-DO-BRK` | Negative multi-disc brakes for planetary gearboxes: F1, F2, F5, F6, F8, F9, MD, 110–3,051 Nm | 52 |
| `IH-DO-WBRK` | Brakes for WD and RW winch drives: FW, FY, F5, F9 | 31 |
| `IH-DO-COOL` | Gearbox oil cooling units URO/W (oil/water) and URO/A (oil/air), 4–50 kW | 17 |
| `IH-DO-WACC` | Hydraulic winch accessories: B, C1, C2, D, E, ELD, F1, F2 | 8 |

Brake rows put the opening and maximum pressure in the `item` text (there is no opening-pressure column);
`mount` names the gearbox frames or drives each fits. FY26 torque is printed inconsistently in the catalogue,
so its row omits the torque and says it is confirmed per order. Cooling units use the drawing letters A, B, C
(mm) and `maxFlowLpm`.

## Wave 1 and 2 listings topped up

`catalogue-dinamic-oil-wave1` and `-wave2` were regenerated with `_scripts/indus/wave4_augment.py` and
reloaded with `--publish`: an "Options and accessories" section on the planetary, winch-drive, winch and
slewing listings, and 28 more images — catalogue dimension drawings, winch-drive catalogue renders and the
per-series winch drawings from the accessories page. Content scores: 13 listings at 82, the rest 74.

## Certificates (`data/dinamic-oil-documents-wave4`)

Catalogues and manuals were attached to the four accessory listings. The eight class certificates (DNV
TAS00000YS on WD and WDD, TAS00001JK on RW, TAS00000NE on RE, ABS 25-0346164 and 22-2218009-1 on RA and RE
slewing) use the new `certificate` document kind (migration 202610210023, applied 2026-10-21). **The deployed
Prisma client did not know the value, so those six product pages returned 500 for about nine minutes; the eight
rows were deleted again at 20:40 UTC.** Re-run the attach after this PR deploys:

```bash
pnpm --filter @indus/db exec tsx src/scripts/attach-product-documents.ts \
  --payload=dinamic-oil-documents-wave4 --doc-dir=<export>/dinamicoil-downloads
```

(The other six entries in the manifest are already attached and are skipped.)
