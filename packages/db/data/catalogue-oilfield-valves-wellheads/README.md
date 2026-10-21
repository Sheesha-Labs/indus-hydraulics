# Oilfield valves, wellhead equipment and subsea valves — `catalogue-oilfield-valves-wellheads`

**28 listings, 0 part numbers**, own-label (`indus`).

- `oilfield-valve-suppliers-uae` (under `None`, position 3) — 0 listings: 
- `flow-iron-wellhead-equipment-uae` (under `None`, position 6) — 0 listings: 
- `oilfield-gate-valves` (under `oilfield-valve-suppliers-uae`, position 1) — 4 listings: API 6A Slab Gate Valve, 1-13/16" to 11", 2,000 to 20,000 psi; API 6A Balanced-Stem Gate Valve, 10,000 to 25,000 psi; API 6A Expanding Gate Valve, 3-1/16" to 7-1/16", 2,000 to 5,000 psi; Mud Valve, Top Entry, 1-13/16" to 5-1/8", 2,000 to 10,000 psi
- `oilfield-globe-valves` (under `oilfield-valve-suppliers-uae`, position 5) — 1 listings: API 6A Globe Valve, 2-1/16" to 7-1/16", 3,000 to 15,000 psi
- `oilfield-check-valves` (under `oilfield-valve-suppliers-uae`, position 3) — 2 listings: API 6A Swing Check Valve, Full Bore, 2-1/16" to 4-1/16", 2,000 to 20,000 psi; API 6A Lift Check Valve, 1-13/16" to 7-1/16", 2,000 to 15,000 psi
- `oilfield-plug-valves` (under `oilfield-valve-suppliers-uae`, position 4) — 1 listings: High-Pressure Plug Valve, API 6A, 1-13/16" to 4-1/16", 10,000 to 20,000 psi
- `oilfield-choke-valves` (under `oilfield-valve-suppliers-uae`, position 6) — 5 listings: Plug and Cage Choke Valve, API 6A, 3,000 to 20,000 psi; External Sleeve Choke Valve, API 6A, 2,000 to 15,000 psi; Adjustable Needle Choke Valve, API 6A, 2,000 to 20,000 psi; Multiple Orifice Choke Valve, API 6A, 3,000 to 20,000 psi; Positive Choke Valve, Fixed Bean, API 6A, 3,000 to 20,000 psi
- `oilfield-ball-valves` (under `oilfield-valve-suppliers-uae`, position 2) — 3 listings: API 6A Double Block and Bleed Ball Valve, 1-13/16" to 11", 2,000 to 10,000 psi; API 6A Trunnion Ball Valve, 2,000 to 15,000 psi; API 6A Floating Ball Valve, 1-13/16" to 4-1/16", 2,000 to 10,000 psi
- `wellhead` (under `flow-iron-wellhead-equipment-uae`, position 1) — 10 listings: Wellhead and Christmas Tree Assembly, API 6A, 2,000 to 20,000 psi; Casing Head, API 6A, Threaded, Slip or Weld-On Bottom; Slip Casing Hanger, Automatic or Manual, API 6A, 2,000 to 15,000 psi; Tubing Head, API 6A, 2,000 to 15,000 psi; Dual Tubing Wellhead, API 6A, 2,000 to 15,000 psi; Single Barrel Double Well Wellhead and Christmas Tree; Gas Storage Injection and Production Wellhead, API 6A; Leaching Wellhead for Salt-Cavern Gas Storage, API 6A; Geothermal Wellhead Assembly, Large Bore, API 6A; Electric Submersible Pump (ESP) Wellhead, API 6A
- `subsea-valves` (under `oilfield-valve-suppliers-uae`, position 20) — 2 listings: Subsea Gate Valve, API 17D, 1" to 9", to 15,000 psi; Subsea Ball Valve, API 6DSS, 1/2" to 48"

Part numbers `IH-OFE-<line>`; listings are range listings with no size rows. The sources publish size lists
and pressure ranges but not which size comes in which rating, so no size × pressure rows were generated.

Filed under the existing Oilfield Valves and Wellhead shelves, beside the per-size listings already there.
Existing shelves are listed in the payload only so products can be filed; they carry no bands and are not
rewritten. New shelf: `subsea-valves` under `oilfield-valve-suppliers-uae`.

Merges: two gate-valve families with the same size and pressure envelope are one slab gate listing; four
subsea pages (two per type across the two source sites) are two listings.

Images are supplier product photos with maker branding, cast lettering and watermarks removed by AI edit; the image folder is passed to the importer with `--image-dir=`.

Load:

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts --payload=catalogue-oilfield-valves-wellheads --image-dir=<folder> --dry-run
```
