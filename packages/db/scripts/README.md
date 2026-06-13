# `consolidate-megamenu.mjs`

One-off data migration that collapsed the `primary_megamenu` ("Products")
navigation tree from **18 top-level sections to 6**, run 2026-06-13.

## Why

The storefront megamenu (`apps/storefront/src/components/SiteHeaderClient.tsx`)
renders a 3-column hover panel; **Column 1 listed all 18 L1 sections**, which
felt overwhelming. This script re-parents the existing sections into 6 broad
domains. It is a **data change to the live DB**, not a code feature — the
renderer was unchanged.

## What it does (no deletions)

- Creates 4 new broad L1 rows; relabels 2 existing L1s; re-parents the other
  16 sections down to L2.
- **Promotes every real category** (`linkType='category'`) to be a direct child
  of its section, so it stays at L3 — the renderer's deepest visible level.
  Nothing customers can buy is lost. (Verified: all 1,134 active products still
  reachable at ≤ L3.)
- **Hides** (sets `isVisible=false`, reversible) the 16 intermediate wrapper
  nodes that promotion empties out (duplicate section wrappers, oilfield
  sub-group headers).
- Leaves the granular hydraulic sub-type leaves (External Gear, Axial Piston…)
  in place; they now sit at a 4th level the menu doesn't render — retained in
  the DB, not shown. (Product-owner decision: keep, don't delete.)

## Usage

```bash
cd packages/db
# DATABASE_URL is read from packages/db/.env
node scripts/consolidate-megamenu.mjs --dry-run                 # preview, no writes
node scripts/consolidate-megamenu.mjs --dry-run --emit-json=/tmp/after.json
node scripts/consolidate-megamenu.mjs --execute --stamp=2026-06-13   # writes backup, then applies
node scripts/consolidate-megamenu.mjs --rollback scripts/backups/megamenu-backup-2026-06-13.json
```

`--execute` writes a full snapshot of the prior tree to `scripts/backups/` first;
`--rollback FILE` restores it and deletes the L1 rows the migration created.

The target structure is declared in the `NEW_L1S` / `DEMOTE` arrays at the top
of the script — edit those to re-shape and re-run.

## Caveats

- The storefront caches navigation for ~5 min (`unstable_cache` tag `nav-menu`
  in `apps/storefront/src/lib/navigation.ts`); changes appear within that window
  or on redeploy.
- **Seed drift (pre-existing):** `seedNavigationMenus` in `../src/seed.ts` still
  defines only the original 6 *hydraulic* sections and runs only when the menu
  is empty — it never produced the live 18-section tree and does not reflect this
  consolidation. The live DB is the source of truth. Bringing the seed to full
  parity (seeding all category-linked sections) is a separate follow-up.
