# Safety and relief valves — `catalogue-safety-relief-valves`

**17 listings, 126 part numbers**, own-label (`indus`).

- `industrial-process-valves` (under `None`, position 23) — 0 listings: 
- `safety-relief-valves` (under `industrial-process-valves`, position 14) — 17 listings: Conventional Safety Relief Valve, API 526, Orifice D to T; Balanced Bellows Safety Relief Valve, API 526; Safety Relief Valve with Packed Lever; Safety Relief Valve with Open Lever, Steam and Air; Low-Lift Safety Relief Valve, DN15 to DN200; High-Performance Steam Safety Valve, ASME Section I; Jacketed Safety Relief Valve, Bellows Type; Pilot-Operated Safety Relief Valve, API 526; High-Temperature Pilot-Operated Safety Valve, Steam; Thermal Relief Valve, Threaded, 1/2" to 1-1/2"; Changeover Valve for Twin Safety Valves, Mechanical Interlock; Tank Pressure Relief Valve (Breather), API 2000; Tank Vacuum Relief Valve, API 2000; Pressure/Vacuum Relief Valve (Conservation Vent), API 2000; Tank Emergency Vent, 16" to 24", API 2000; Nuclear Safety Valves: Pressurizer, Main Steam and Auxiliary System; Nuclear MSR Pilot-Operated Safety Valve and Vacuum Relief Valve

Part numbers `IH-SR-<line>`. The conventional valve carries the API 526 table:
`IH-SR-CSV-<orifice>-<inlet><outlet>-<inlet class>[A]-<outlet class>`, with `A` marking the alternate
(heavier) inlet flange rows; text columns `type` (orifice), `size` (inlet × outlet) and `pressureClass`
(inlet / outlet rating); dimensions `A` and `B` (centre to face, mm).

Those rows were read by OCR from catalogue pages showing orifices D to T, and each was checked against the
API 526 inlet × outlet pairs for its orifice; rows that failed the check were dropped. Maximum set pressures
by material and temperature were not loaded. The other series tables in the catalogue are not mapped to a
listing and were left out.

Merges: six nuclear pages into two listings; two thermal relief pages into one; two changeover pages into one.

Images are supplier product photos with maker branding, cast lettering and watermarks removed by AI edit; the image folder is passed to the importer with `--image-dir=`.

Load:

```bash
pnpm --filter @indus/db exec tsx src/scripts/import-lifting-catalogue.ts --payload=catalogue-safety-relief-valves --image-dir=<folder> --dry-run
```
