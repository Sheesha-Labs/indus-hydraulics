# Dinamic Oil Wave 2 — `catalogue-dinamic-oil-wave2`

**5 listings, 51 part numbers**, branded Dinamic Oil, on three new shelves under **Gearboxes & Winches**.
**LIVE 2026-10-20 ~19:20 UTC**: loaded with `--rewrite-categories --publish` (5 created, 7 images, 0 problems);
the root's short and SEO description rewritten to cover the new lines (bands kept). Data only — every
size-table column already existed (Wave 1, #543), so nothing here needs a deploy.

| SKU | Listing | Shelf | Rows |
|---|---|---|---|
| `IH-DO-SLR` | RE slewing gearboxes, RE 240–RE 8010, 4,350–163,500 Nm T2 FEM | `slewing-gearboxes` (new) | 14 |
| `IH-DO-SLG` | GB heavy-duty slewing gearboxes, GB 12010–26000, to 460,000 Nm | `slewing-gearboxes` | 4 |
| `IH-DO-GR` | GR wheel drives with integrated orbital motor (GR 80, GR 200), per motor variant | `wheel-drives` (new) | 16 |
| `IH-DO-EW` | EH and EW planetary wheel drives, 3,950–24,000 Nm, per 2/3-stage build | `wheel-drives` | 10 |
| `IH-DO-T` | T series towing and recovery winches, 2,700–30,000 daN | `towing-recovery-winches` (new) | 7 |

Megamenu: the three shelves were added under the "Gearboxes & Winches" pillar by script (order: Planetary,
Slewing, Wheel Drives, Winch Drives, Hydraulic Winches, Towing & Recovery). Documents: catalogue + manual on
each listing (`data/dinamic-oil-documents-wave2`, 10 attachments, 4 new PDFs).

## Columns

- Slewing: `item`, `outputTorqueNm` (T2 FEM, F.E.M. M5 at 15 rpm, indicative), `ratio` (per stage count),
  `mount` (Dinamic Oil support codes), `shaft` (catalogue pinion module and teeth range). Support torque
  limits are not shown as the gearbox rating — the catalogue says they apply to the support only.
- GR: `displacementCc` (total = motor × ratio), `ratio`, `outputTorqueNm` (continuous), `peakTorqueNm`,
  `maxRpm` (output), `maxFlowLpm`.
- EH/EW: `stages`, `ratio`, `peakTorqueNm` (frame T2max), `weightKg`, `mount` (EH versions).
- T series: same winch columns as Wave 1, pulling pressure in `pressureBar`.

## Source notes

- Catalogue misprints kept off the table: RE 1020 two-stage ratio printed "13 ÷ 5" and RE 2520 three-stage
  "32 ÷ 51" — those rows show the other stage count and say the range is confirmed per order.
- EH 350/610/910 (older wheel-drive catalogue) are not listed: not in the 2025 catalogue.
- Images: slewing catalogue cover and website renders; the website and catalogue wheel-drive renders show the
  electric (PMSM) version, so they sit on EH/EW with alt text saying so, and GR carries its catalogue
  dimension drawing. Towing winch render from the tow-truck application.
- Not listed: track drives 80–900 kNm (website only, no catalogue), the 2019 hoisting brochure's American and
  Indian winch ranges (scanned, OCR values — confirm with Dinamic Oil first), 40/50 t winches, electric winches.
