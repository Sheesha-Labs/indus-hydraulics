# Pressure-control, well-testing and frac equipment, controls and actuators — `catalogue-oilfield-equipment-controls`

**24 listings, 0 part numbers**, own-label (`indus`).

- `oilfield-valve-suppliers-uae` (under `None`, position 3) — 0 listings: 
- `flow-iron-wellhead-equipment-uae` (under `None`, position 6) — 0 listings: 
- `blowout-preventers` (under `None`, position 8) — 0 listings: 
- `cementing-equipment` (under `None`, position 10) — 0 listings: 
- `fracturing-equipment` (under `None`, position 7) — 0 listings: 
- `well-testing-equipment` (under `None`, position 5) — 0 listings: 
- `drilling-workover-systems` (under `None`, position 9) — 0 listings: 
- `bop-ram` (under `blowout-preventers`, position 1) — 1 listings: Ram Blowout Preventer, API 16A, 7-1/16" to 30", 5,000 to 20,000 psi
- `bop-choke-kill` (under `blowout-preventers`, position 3) — 1 listings: Choke and Kill Manifold, API 16C, 3,000 to 20,000 psi
- `bop-control-units` (under `blowout-preventers`, position 4) — 1 listings: Choke and Kill Control Panel, Drilling
- `dw-mud-manifolds` (under `drilling-workover-systems`, position 4) — 1 listings: Standpipe Manifold, 5,000 and 7,500 psi
- `wt-data-header` (under `well-testing-equipment`, position 2) — 1 listings: Data Header, 2-1/16" to 5-1/8", 2,000 to 20,000 psi
- `surface-test-trees` (under `oilfield-valve-suppliers-uae`, position 15) — 1 listings: Surface Test Tree (Flowhead), 3-1/16" to 5-1/8", 3,000 to 20,000 psi
- `oilfield-ssv-esd-valves` (under `oilfield-valve-suppliers-uae`, position 10) — 2 listings: Surface Safety Valve (SSV), Hydraulic, API 6A, 1-13/16" to 7-1/16"; HIPPS High Integrity Pressure Protection System, SIL 3
- `flow-iron-manifolds` (under `flow-iron-wellhead-equipment-uae`, position 5) — 1 listings: Well Testing Choke Manifold, 1-13/16" to 7-1/16", 3,000 to 20,000 psi
- `frac-manifold` (under `fracturing-equipment`, position 5) — 3 listings: Universal (E-Type) Frac Manifold, 15,000 to 20,000 psi; Frac Shunt (Zipper) Manifold, 15,000 to 20,000 psi; High and Low Pressure Frac Manifold (Missile), 15,000 to 20,000 psi
- `cement-manifolds` (under `cementing-equipment`, position 20) — 1 listings: Cement and Kill Manifold, API 6A, 3,000 to 20,000 psi
- `wt-desanders-debris-catchers` (under `well-testing-equipment`, position 20) — 3 listings: Double Barrel Screen Desander, 5,000 to 20,000 psi; Cyclone Desander, 5,000 to 20,000 psi; Debris Catcher, Dual Channel, 5,000 to 20,000 psi
- `frac-trees` (under `fracturing-equipment`, position 20) — 1 listings: Frac Tree, API 6A, 5-1/8" to 7-1/16", 10,000 to 20,000 psi
- `wellhead-control-panels` (under `flow-iron-wellhead-equipment-uae`, position 20) — 2 listings: Wellhead Control Panel (WHCP), Single or Multi-Well; Self-Contained Hydraulic Emergency Shutdown System
- `valve-actuators` (under `oilfield-valve-suppliers-uae`, position 21) — 5 listings: Pneumatic Diaphragm Actuator for API 6A Gate Valves; Pneumatic Piston Actuator for API 6A Gate Valves; Hydraulic Single-Acting Actuator for API 6A Gate Valves; Compact Hydraulic Actuator for API 6A Gate Valves; Hydraulic Double-Acting Actuator for API 6A Gate Valves

Part numbers `IH-OFE-<line>`; range listings with no size rows (the sources publish size and pressure
ranges only). Filed in existing shelves where one fits; existing shelves appear in the payload only so
products can be filed and are not rewritten. New shelves: `cement-manifolds`, `wt-desanders-debris-catchers`,
`frac-trees`, `wellhead-control-panels`, `valve-actuators`.

The source BOP page shows one double ram preventer in both photos, so it is one ram BOP listing.

Images are supplier product photos with maker branding, cast lettering and watermarks removed by AI edit; the image folder is passed to the importer with `--image-dir=`.

Load:

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts --payload=catalogue-oilfield-equipment-controls --image-dir=<folder> --dry-run
```
