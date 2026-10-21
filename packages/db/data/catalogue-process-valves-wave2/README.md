# Industrial process valves, wave 2 — `catalogue-process-valves-wave2`

**21 listings, 1054 part numbers**, own-label (`indus`).

- `industrial-butterfly-valves` (under `industrial-process-valves`, position 6) — 3 listings: Concentric Butterfly Valve, Rubber Lined; Double Offset Butterfly Valve, API 609; Triple Offset Butterfly Valve, Metal Seated, API 609
- `cryogenic-valves` (under `industrial-process-valves`, position 7) — 14 listings: Cryogenic Gate Valve, Extended Bonnet; Cryogenic Globe Valve, Extended Bonnet; Cryogenic Check Valves: Swing, Lift, Dual Plate and Axial Flow; Top Entry Cryogenic Trunnion Mounted Ball Valve; Top Entry Cryogenic Floating Ball Valve; Side Entry Cryogenic Floating Ball Valve; Side Entry Cryogenic Trunnion Mounted Ball Valve; Cryogenic Offset Butterfly Valve; Cryogenic Control Valve, Globe Pattern; Liquid Hydrogen Butterfly Valve, -253 °C; Liquid Hydrogen Filter, Vacuum Jacketed; Liquid Hydrogen Emergency Shutdown Valve; Liquid Hydrogen Lift Check Valve, Vacuum Jacketed; Liquid Hydrogen Globe Valve, Bellows Seal
- `actuated-valves` (under `industrial-process-valves`, position 8) — 3 listings: Electric Actuated Valves: Ball, Gate, Globe and Butterfly; Pneumatic Actuated Valves and Emergency Shutdown Valves; Hydraulic, Electro-Hydraulic and Gas-over-Oil Actuated Valves
- `industrial-plug-valves` (under `industrial-process-valves`, position 12) — 1 listings: Sleeved Plug Valve, Non-Lubricated

Part numbers follow wave 1: `IH-PV-<line>[-<type>]-<class>-<NPS × 100>[R|F]`. Type codes in this wave: `CS` cast,
`FG` forged, `SW` swing, `LF` forged lift, `DW`/`DL`/`DF` dual plate wafer/lug/flanged, `AL`/`AS` axial long/short
pattern, `W`/`LG` wafer/lug, `FS`/`FL` flanged short/long pattern, `DF` double flanged (concentric butterfly).

Size tables were read from the supplier catalogue PDFs: row-wise tables (one dimension per row) for the cryogenic
cast valves and cryogenic ball valves, the forged-valve reader for the small cryogenic valves, dedicated readers for
dual plate, axial flow, triple offset (mm tables only, Class 150-600) and concentric butterfly tables, and OCR for
the plug valve. Single cells that break the size progression were dropped. One cryogenic ball valve table whose
class could not be confirmed was left out; another labelled with the wrong class was corrected from its RF lengths.

Without size tables (drawing issued with the quotation): double offset butterfly, cryogenic offset butterfly,
cryogenic control valve, the five liquid hydrogen listings and the three actuated-valve listings. The actuated
listings merge five source products into three (hydraulic, electro-hydraulic and gas-over-oil share one listing).

Images are supplier product photos with maker branding, cast lettering and watermarks removed by AI edit; the image folder is passed to the importer with `--image-dir=`.

Load:

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts --payload=catalogue-process-valves-wave2 --image-dir=<folder> --dry-run
```
