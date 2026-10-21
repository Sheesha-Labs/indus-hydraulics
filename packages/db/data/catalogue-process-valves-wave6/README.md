# Industrial process valves, wave 6 — waterworks, control, power & nuclear, oxygen — `catalogue-process-valves-wave6`

**25 listings, 746 part numbers**, own-label (`indus`).

- `industrial-process-valves` (under `None`, position 23) — 0 listings: 
- `control-valves` (under `industrial-process-valves`, position 9) — 7 listings: Single-Seated Globe Control Valve, Top Guided; Cage-Guided Control Valve, Pressure-Balanced Trim; V-Notch Segmental Ball Control Valve; Angle Control Valve, Erosion Resistant; Bellows-Seal Single-Seated Control Valve; Bellows-Seal Cage-Guided Control Valve; Multi-Stage Pressure-Reducing Control Valve, Anti-Cavitation
- `power-nuclear-valves` (under `industrial-process-valves`, position 10) — 4 listings: Nuclear Gate, Globe and Check Valves, Safety Class 1, 2 and 3; Nuclear Ball and Butterfly Valves, Safety Class 1, 2 and 3; Power Plant High-Pressure Gate, Globe and Extraction Check Valves; Power Plant Butterfly and Ball Valves, Cooling Water and Auxiliary
- `oxygen-service-valves` (under `industrial-process-valves`, position 11) — 1 listings: Oxygen Service Valves: Gate, Globe, Ball, Butterfly, Check and Control
- `waterworks-valves` (under `industrial-process-valves`, position 13) — 13 listings: Metal Seated Gate Valve, Ductile Iron, NRS and OS&Y; Resilient Seated Gate Valve, Ductile Iron, NRS and OS&Y; Swing Check Valve, Resilient or Metal Seated, Ductile Iron; Flexible (Rubber Flapper) Check Valve, Ductile Iron; Ball Check Valve, Ductile Iron, for Wastewater; Silent (Nozzle) Check Valve, Ductile Iron; Resilient Axial Flow Check Valve, Ductile Iron; Resilient Dual Plate Check Valve, Wafer, DN50 to DN2000; Double Eccentric Butterfly Valve, Ductile Iron, DN50 to DN4000; Concentric Butterfly Valve for Water Treatment, Wafer, Lug or Flanged; Double Orifice Air Release Valve, Types A, B and C; Single Orifice Air Release Valve, Threaded or Flanged; Y Strainer, Ductile Iron, Flanged, DN15 to DN500

Part numbers follow the earlier waves: `IH-PV-<line>[-<type>]-<rating>-<NPS × 100>`. Waterworks rows carry
the flange rating read from the table (PN10/16, PN25/40, Class 150 …) and a type for the face-to-face
pattern (gate valves: NRS or OS&Y with BS 5163, DIN F4 or DIN F5; flexible check and butterfly: EN 558
series 13 or 14).

How the tables were read: rows start with DN, then flange data, bolting, and lengths. The flange standard is
identified from the flange outside diameters (every rating whose OD matches every row), and gate-valve
lengths are labelled by matching the BS 5163, EN 558-14 and EN 558-15 values for each DN rather than by
header position, because the OCR headers are unreliable. Single cells that break the size progression were
dropped.

Merges: three double-orifice air valve types into one listing; nuclear gate/globe/check and ball/butterfly
into two; power-plant gate/globe/extraction check and butterfly/ball into two.

Images are supplier product photos with maker branding, cast lettering and watermarks removed by AI edit; the image folder is passed to the importer with `--image-dir=`.

Load:

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts --payload=catalogue-process-valves-wave6 --image-dir=<folder> --dry-run
```
