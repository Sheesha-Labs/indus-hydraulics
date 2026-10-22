# Sun Hydraulics Wave 2 — `catalogue-sun-wave2`

**95 listings, 287 part numbers**, branded Sun Hydraulics: reducing, reducing/relieving and sequence cartridges on
`cartridge-pressure-control-valves` (published in Wave 1), and every flow-control cartridge — needle, pressure-
compensated, priority, electro-proportional, pilot-shifted throttles, flow dividers and divider/combiners, flow
fuses, modulating elements and the cartridge-style flow meter — on the new `cartridge-flow-control-valves` shelf.

Same pipeline and conventions as `catalogue-sun-wave1` (see its README): one listing per Sun function family,
rows are Sun base model codes with `series`, `cavity`, `capacity` and `maxPressure`; copy from 47 Indus-written
valve-type profiles (`profiles_w2.py` in the export), guarded against 9-word runs of Sun's own text; images are
Sun's dimension drawings, symbols and performance curves (GIF → PNG). No code change: the columns shipped in #569.

SKU collisions between a standard and a high-capacity family take a `-HC` suffix (`IH-SUN-FK-A-HC`). Slugs drop
filler words before trimming, so no slug needed a numeric suffix.

## Load

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-sun-wave2 --image-dir=<export>/indus-png-wave2 --dry-run
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts \
  --payload=catalogue-sun-wave2 --image-dir=<export>/indus-png-wave2 --publish
```

After publishing, purge only the shelves this wave touched (`_N_T_/c/<slug>` path tags), not the broad
`categories` tag — a site-wide purge after Wave 1 fed the 2026-10-22 pooler outage. IndexNow by explicit URL
list, at least an hour clear of any deploy.
