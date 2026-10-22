# Sun Hydraulics Wave 3 — `catalogue-sun-wave3`

**172 listings, 473 part numbers**, branded Sun Hydraulics, on five new shelves under `hydraulic-cartridge-valves`:

| Shelf | Listings | What |
|---|---|---|
| `cartridge-check-shuttle-valves` | 87 | checks, pilot-to-open / pilot-to-close checks, shuttles, diverters, and the pressure-, pilot-, vent-, air-, hydraulic- and manually operated directional cartridges |
| `solenoid-cartridge-valves` | 49 | 2-, 3-, 4- and 6-way solenoid cartridges, poppet and spool, 740 Series, FLeX Series and common-cavity types |
| `logic-element-cartridges` | 18 | balanced and unbalanced poppet logic elements |
| `specialty-cartridge-valves` | 13 | CavitySaver™, accumulator sense / pump unload, air bleed, filter, hand pump, energy harvester, cavity plugs and converters |
| `proportional-cartridge-valves` | 5 | electro-proportional relief, reducing/relieving, throttle and 4-way, and the pilot-operated meter-in 4-way |

Same pipeline and conventions as waves 1 and 2: one listing per Sun function family, rows are Sun base model codes
with `series`, `cavity`, `capacity` and `maxPressure`. Copy comes from 48 Indus-written valve-type profiles
(`profiles_w3.py` in the export) plus per-family notes taken from the Sun title (drain port, flow path, coil series,
soft shift, position switch …), guarded against 9-word runs of Sun's own prose. Images are Sun's dimension drawings,
symbols and performance curves (GIF → PNG).

Families group across Sun's own categories: Sun lists the same valve under both *Directional* and *Solenoid
Operated*, so those sizes share one listing. Cavity plugs (4 listings by port arrangement), cavity converters (1) and
accumulator unload valves (2) are merged families whose rows carry the arrangement in the Description column.

Six series-4 main stages Sun files under *Electro-Proportional* (RPIC8, RSDS8, RSFS8, PBJB8, PPFB8, PVHA8) are not
listed here: they are sizes of families already live from waves 1 and 2 and are added as rows there.

SKUs that would collide with a wave 1/2 SKU use the first and last model code (`IH-SUN-CNBC-CNKC`).

## Load

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-sun-wave3 --image-dir=<export>/indus-png-wave3 --dry-run
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-sun-wave3 --image-dir=<export>/indus-png-wave3 --publish
```

After publishing, purge only the shelves this wave touched (`_N_T_/c/<slug>` path tags) and IndexNow by explicit
URL list, at least an hour clear of any deploy.
