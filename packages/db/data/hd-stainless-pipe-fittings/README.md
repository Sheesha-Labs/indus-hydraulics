# Hydraulics Direct batch 4 — `hd-stainless-pipe-fittings`

**150 new listings, 2,745 part numbers** of 304 and 316 stainless pipe fittings from Hydraulics
Direct (US principal since 2026-10-09), listed unbranded under `IH-PF-<supplier part number>`.
Loaded with `import-lifting-catalogue.ts --payload=hd-stainless-pipe-fittings --publish`.

New branch `stainless-steel-pipe-fittings` under Hoses & Fittings with six children:

| Category | Listings |
|---|---|
| `stainless-steel-150-threaded-pipe-fittings` (cast, NPT) | 26 |
| `stainless-steel-3000-forged-threaded-fittings` (ASME B16.11) | 23 |
| `stainless-steel-butt-weld-fittings` (Sch 10 and 40, ASME B16.9) | 33 |
| `stainless-steel-sanitary-fittings` (clamp/weld fittings, gaskets, tubing) | 53 |
| `stainless-steel-pipe-nipples` | 7 |
| `stainless-steel-weld-outlets` (MSS SP-97 outlets, weld-on adapter) | 8 |

New spec template `pipe-fitting-spec` (body, end connection, size range, pressure class/schedule,
material, manufacture, standards).

## Decisions
- Standards are stated only where they apply: the source cites ASME B16.11 and "ASME A182" on its
  **cast 150#** fittings; both are forged-fitting standards, so the cast pages give only NPT
  (ASME B1.20.1). Forged 3000#: ASTM A182, ASME B16.11. Butt weld: ASTM A403/A960, ASME B16.9,
  MSS SP-43. Sanitary: ASTM A269/A270 and 3-A, attributed to the manufacturer.
- No psi figures: the source publishes none. Pages give the class or schedule and, for butt-weld
  fittings, the B16.9 rule that the fitting is rated to pipe of the same schedule and grade.
- Gaskets are EPDM (304 line) and PTFE (316 line), titled by elastomer, not as stainless.
- Sanitary caps listed "1/2 × 3/4" fit both tube sizes (one clamp size) and say so.
- Name typos settled by the part number: `CST-B4-40` ("2-1/5"), `FHRB-J4/J6-40-24` (named like
  -40-20). Dropped: `C90-B4-12L`, `N4S8-12-12` (no part name). Held: `SS-WO-FFX45T`,
  `SS-WO-FFX90T` (title says ORFS, part names say JIC; no photo).

## Images
One catalogue photo per family, checked on contact sheets; 304/316 twins share a photo with
grade-specific alt text. No photo on 10 families whose photo shows another part: the four
eccentric reducers in each line (concentric shot), `FCAP-J4/J6` (a coupling), `SF16SC` (a cap
stamped SS 304), plus `SS-WO-FBX` (none in the source).

## Regenerating
`_scripts/batch4/` in the export folder: `payload_b4.py <repo>` (uses `build_b4.py`), `convert_b4.py`.
