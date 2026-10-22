# Maker-branded pneumatics — wave 2 (`catalogue-maker-*` pneumatic payloads)

Shipped as seven small data-only PRs, one per payload, each loaded and published before its PR;
this one (`catalogue-maker-pneumatic-cylinders`) creates the Pneumatics root and the cylinders shelf.

Seven payloads listing maker pneumatic ranges (Parker, SMC, Wilkerson, Norgren, ARO, Numatics, Destaco,
Conrader, Kingston, Gast, Ingersoll Rand, Dixon …) and the hydraulic valves found alongside them. Built
2026-10-22 from a supplier catalogue export; the generator and source data stay outside the repo.

| Payload | Template | Listings | Part numbers |
|---|---|---|---|
| `catalogue-maker-pneumatic-cylinders` | `cylinder-spec` | 207 | 29,685 |
| `catalogue-maker-pneumatic-valves` | `valve-spec` | 263 | 7,246 |
| `catalogue-maker-air-preparation` | `filter-spec` | 210 | 2,354 |
| `catalogue-maker-pneumatic-tubing-fittings` | `hose-fitting-spec` | 147 | 2,464 |
| `catalogue-maker-pneumatic-grippers-vacuum` | `cylinder-spec` | 108 | 3,740 |
| `catalogue-maker-air-couplings-hoses` | `quick-coupler-spec` | 142 | 1,995 |
| `catalogue-maker-hydraulic-valves` | `valve-spec` | 48 | 1,039 |

## New shelves

The payloads create a **Pneumatics** root (position 24) with eleven shelves: Pneumatic Cylinders;
Solenoid Valves & Valve Manifolds; Manual, Mechanical & Pilot Air Valves; Flow Controls, Check & Quick
Exhaust Valves; Safety, Relief & Lockout Valves; Filters, Regulators & Lubricators (FRL); Pneumatic Tubing;
Pneumatic Fittings & Silencers; Grippers & Rotary Actuators; Vacuum Generators, Pads & Filters; Air Motors.
Couplings, air hoses, push-to-connect and hose-barb fittings, instrumentation tube fittings and hydraulic
valves go onto shelves that already exist. Each payload lists its categories parents first, because the
loader resolves a parent by slug as it goes.

A megamenu pillar "Pneumatics" links the eleven shelves plus Push-to-Connect Fittings, Air Couplings and
Air & Water Hoses; it was written by script after the load (nav changes reach the storefront within ~2 h).

## Rules the generator applied (in addition to wave 1's)

- **Rows that cannot be told apart are held.** 112 configurator ranges (12,549 part numbers — Parker P1D,
  OSP-P, P1X, 4MA and similar) publish part numbers only, with bore and stroke encoded in the order code.
  They wait for an order-code decode rather than listing a table of identical rows.
- **Configurator families over 300 rows** are split into one listing per bore where the source gives a bore.
- **Row descriptions:** where most rows of a range share one description, the attributes that vary across
  the range (stroke, mounting, port, voltage …) are appended so each row is identifiable. The same rule
  was applied to wave 1 and those payloads were reloaded.
- **Metric sizes stay in the description.** Bore, stroke and rod go to the inch columns only when published
  in inches; a millimetre figure is never converted into an inch column.
- **A bare "Pressure" header** is read as a rating only for cylinders, grippers and tubing — on valves it
  is often a cracking or set pressure.
- **Not listed:** air tools, compressors, dryers, blowers, appliance and plumbing spares, fire-service and
  sanitary hardware, lab tubing, diaphragm-pump spares, cylinder and solenoid accessories.
