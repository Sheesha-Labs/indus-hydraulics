# Industrial process valves, wave 1 — `catalogue-process-valves-wave1`

**30 listings, 1739 part numbers**, own-label (`indus`), in a new top-level category.

- `industrial-process-valves` (root, position 23)
  - `industrial-gate-valves` — 11 listings: Cast Steel Gate Valve, API 600; API 603 Stainless Steel Gate, Globe and Check Valves; Pressure Seal Gate, Globe and Check Valves; Bellows Seal Gate and Globe Valves; Parallel Slide Gate Valve; Through Conduit Slab Gate Valve, API 6D; Expanding Gate Valve, API 6D; Forged Steel Gate Valve, API 602; Large Size Forged Gate, Globe and Check Valves, NPS 2" and up; Forged Pressure Seal Gate, Globe and Check Valves; Forged Bellows Seal Gate and Globe Valves
  - `industrial-globe-valves` — 2 listings: Cast Steel Globe Valve, BS 1873; Forged Steel Globe Valve, API 602
  - `industrial-check-valves` — 5 listings: Cast Steel Swing Check Valve, BS 1868; Tilting Disc Check Valve; Axial Flow Check Valve, API 6D; Dual Plate Check Valve, API 594; Forged Steel Lift and Swing Check Valve, API 602
  - `floating-ball-valves` — 6 listings: Cast Floating Ball Valve, Soft Seated, ISO 17292; Metal Seated Floating Ball Valve; Forged Side Entry Floating Ball Valve, Soft Seated; Floating Double Block and Bleed Compact Ball Valve; Jacketed Ball Valve, Full Jacket; Three-Way Ball Valve, L and T Port
  - `trunnion-mounted-ball-valves` — 6 listings: Side Entry Trunnion Mounted Ball Valve, Soft Seated, API 6D; Top Entry Trunnion Mounted Ball Valve, API 6D; Fully Welded Trunnion Mounted Ball Valve, API 6D; Metal Seated Trunnion Mounted Ball Valve; Trunnion Mounted Double Block and Bleed Compact Ball Valve; Pigging Ball Valve for Pig Launching and Receiving

Part numbers are `IH-PV-<line>[-<type>]-<class>-<NPS × 100>[R|F]`: `IH-PV-GTC-600-1200` is a 12" Class 600
cast gate valve; `R` marks a reduced-bore row and `F` a full-bore forged row. Listings that cover several
types carry a type code (`G` gate, `GL` globe, `C` check; `L`/`S` long/short pattern; `W`/`LG`/`DF` wafer, lug,
double flanged) and a `type` text column.

Size rows use the `valve` table kind in `packages/domain/src/variant-columns.ts`: `size`, `dn`, `pressureClass`,
`port` and `type` as text; `lFf`, `lRf`, `lRtj`, `lBw` (face-to-face / end-to-end, mm), drawing letters
(`D`, `H`, `H1`, `W`, `V` …) and `weightRfKg` / `weightBwKg` / `weightKg`.

Listings without a size table (top-entry, DBB, jacketed, pigging, three-way, tilting disc, bellows, parallel
slide, expanding gate, through-conduit, large forged, forged pressure seal, API 603) say the dimension table
and general arrangement drawing come with the quotation.

Source notes:

- Tables were read from the supplier catalogue PDFs by word position; scanned pages by OCR. OCR-read listings
  (cast and forged floating ball, side-entry trunnion) say in the copy that figures are as published and
  confirmed on the GA drawing. Single cells that break the size progression were dropped, not corrected.
- Images are supplier product photos with maker branding, cast lettering and watermarks removed by AI edit.
  The image folder is passed to the importer with `--image-dir=`.

Load:

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts --payload=data/catalogue-process-valves-wave1/catalogue.json --image-dir=<folder> --dry-run
```
