# Oteco Wave 1 gauges — `catalogue-oteco-gauges`

**9 listings, 534 part numbers**, branded Oteco: the Model 6, 7 and 8 drilling pressure gauges, one
listing per model and service trim (standard, sour gas, salt water). They are filed on
`ic-pressure-gauges` (HP Pressure Gauges).

| SKU | Listing | Shelf | Rows | Images |
|---|---|---|---|---|
| `IH-OTC-PG6-SD` | Oteco Model 6 Pressure Gauge, Standard Service | `ic-pressure-gauges` | 118 | 2 |
| `IH-OTC-PG6-SG` | Oteco Model 6 Pressure Gauge, Sour Gas Service | `ic-pressure-gauges` | 138 | 2 |
| `IH-OTC-PG6-SW` | Oteco Model 6 Pressure Gauge, Salt Water Service | `ic-pressure-gauges` | 32 | 2 |
| `IH-OTC-PG7-SD` | Oteco Model 7 Pressure Gauge, Standard Service | `ic-pressure-gauges` | 38 | 1 |
| `IH-OTC-PG7-SG` | Oteco Model 7 Pressure Gauge, Sour Gas Service | `ic-pressure-gauges` | 35 | 1 |
| `IH-OTC-PG7-SW` | Oteco Model 7 Pressure Gauge, Salt Water Service | `ic-pressure-gauges` | 26 | 1 |
| `IH-OTC-PG8-SD` | Oteco Model 8 Pressure Gauge, Standard Service | `ic-pressure-gauges` | 58 | 1 |
| `IH-OTC-PG8-SG` | Oteco Model 8 Pressure Gauge, Sour Gas Service | `ic-pressure-gauges` | 66 | 1 |
| `IH-OTC-PG8-SW` | Oteco Model 8 Pressure Gauge, Salt Water Service | `ic-pressure-gauges` | 23 | 1 |

- **Part numbers** are `IH-OTC-<Oteco part number>`, as in `catalogue-oteco-valves`.
- **Rows** carry the new gauge columns `range`, `dial`, `trim` and `connection` (see
  `variant-columns.ts`). They render once that code deploys.
- **Spec template:** the payload creates `drilling-gauge-spec` (11 fields).
- **Dual-unit dials:**
  - A Model 8 dual-unit dial is shown only when its two scales agree within 8 %.
  - Seven source rows where they did not fall back to the single scale in the part name.
- **Rating:** a gauge's maximum pressure is the lower of its dial range and its sub connection rating.
  The copy says so.
- **Interchange wording** is as Oteco publishes it:
  - Model 6 ↔ Cameron F, Totco 6, Geosource F, Wadeco 10, Gauges International 6.
  - Model 7 ↔ Cameron D, Totco 4, Geosource D, Wadeco 12, Gauges International 7.
- **Certification:** ABS/DNV unit certification is described as "on request".

## Load (after the code deploys)

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-oteco-gauges --image-dir=<export>/indus-images-w1 --publish
```

The dry run on 2026-11-19 gave 9 to create, 534 part numbers and 0 problems. The brand row and the
follow-up steps are the same as for `catalogue-oteco-valves`.
