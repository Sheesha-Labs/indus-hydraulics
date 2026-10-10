# Hydraulics Direct batch 2 — `hd-brass-fittings`

**145 new listings, 1,154 part numbers** of brass adapters and fittings from the catalogue of
Hydraulics Direct (Denver, US), an Indus principal since 2026-10-09. Listed unbranded under Indus
part numbers, like batch 1 (`../hd-stainless-adapters/README.md`). Loaded with
`import-lifting-catalogue.ts --payload=hd-brass-fittings --publish` on 2026-10-09.

| Category (new) | Parent | Listings |
|---|---|---|
| `brass-nptf-pipe-fittings` | `hydraulic-adapters` | 21 |
| `brass-bsp-metric-adapters` | `hydraulic-adapters` | 27 |
| `brass-sae-45-flare-fittings` | `hydraulic-adapters` | 14 |
| `brass-inverted-flare-fittings` | `hydraulic-adapters` | 12 |
| `brass-compression-fittings` | `hydraulic-adapters` | 14 |
| `brass-air-brake-fittings` | `hydraulic-adapters` | 29 (13 for copper tubing, 16 for nylon) |
| `brass-dot-push-in-air-brake-fittings` | `hydraulic-adapters` | 12 |
| `brass-push-lock-hose-barbs` | `hydraulic-fittings` | 16 |

Every family in the source's Brass Adapters category that the dedupe against the live catalogue
marked new (117) or a brass version of a live carbon-steel adapter (28). Those 28 link to their
live carbon-steel page, except the seamless pipe nipple, whose live match is a hex nipple. The
copper-tubing and nylon-tubing air brake twins (13 pairs) link to each other.

## Part numbers

`IH-BR-<supplier code>-<sizes>` (`IH-BR-31468-06-04`, `IH-BR-8087-04-04-04`, `IH-BR-DOT68-04-02`).
The supplier's own numbers go in `searchAliases` only.

## Size tables

- **End 1 / End 2 / End 3** come from the dash codes in the part number, in the source's order
  (for run tees that puts the pipe end in the middle). Every row was cross-checked against the
  size words in the source's part name. Four names disagree with their codes
  (B-31369-06-08, B-31369-10-06, B-31472-08-08-06, B-50-04-02); the source's own size filter
  agrees with the codes, so the codes are used.
- Thread designations are printed only where they are definitional: NPT/NPTF/NPSM TPI, BSP pitch
  with `G` (parallel) or `R` (taper), JIC UNF, and the 3/4-11.5 NH garden hose thread. Flare,
  compression, air brake, push-in and barb ends carry the tube or hose size only.
- "BSP female" without P or T is printed as `BSP`, because the source does not say which.
- Seamless pipe nipples carry their length as `L` (mm); "close" nipples say so in End 1.
- Tube inserts (`IH-BR-73`) carry the insert OD from the source's name in End 1, which is the only
  thing that separates its two 1/4" rows.
- Dropped: three pipe-nipple rows with no length (`B-3326-08`, `-12`, `-16`), and three rows filed
  under the wrong family in the source (`B-4404-12-12`, `B-5406-9-08`, `B-5406-P-08`).

## What the source does and does not say

The source has no dimension tables, no competitor cross-references and, except for the DOT push-in
range, no pressure ratings, so the pages say "no pressure rating published". Facts used come from
the families' spec fields and the source's own category descriptions:

- CA360 brass on the air brake, inverted flare, SAE 45° and push-lock families; C3600/C3700 brass
  on DOT push-in; the 8400 washer is aluminium (the source lists it under brass).
- Air brake: truck and bus compressed-air brake systems, "DOT approved".
- DOT push-in: FMVSS 571.106, SAE J2494, SAE J844 nylon tubing, 150 psi, −40 °F to +200 °F, air only,
  sealant pre-applied on male pipe threads.
- Push-lock barbs: no clamp or ferrule, low-pressure lines.
- Standards named for thread and tube ends are the definitional ones (ASME B1.20.1/.3/.7, ISO 228-1,
  ISO 7-1, SAE J512, SAE J514); none is claimed as a certification of the parts.
- The source's family descriptions are generic and in places wrong (the 8000 brass BSPP adapter is
  described as carbon-steel ORB), so none of that text is used.

## Images

Every image was checked against its listing on contact sheets. Studio photos where the family has
them (55), otherwise the single catalogue photo (`-2`), the DOT renders (only a `DOT` mark), and for
British & metric the source's coloured line drawings, upscaled 3× by resampling from 175–200 px.

- Swapped: the source shows the run-tee photo on `B-31372` (branch tee) and the branch-tee photo on
  `B-31371` (run tee); each listing uses the other's photo.
- No image: `IH-BR-31361` (stamped mark that may be another maker's), `IH-BR-31382` and
  `IH-BR-31482` (250 px, configuration unreadable), `IH-BR-DOTS54`, `IH-BR-376`, `IH-BR-72`
  (none in the source).

## Regenerating

`_scripts/batch2/` in the Hydraulics Direct export folder: `build_b2.py` (needs the dedupe's
`final.json` and a fresh live index, `live_now.json`) then `assemble_b2.py <repo>`, with
`convert_b2.py` for the JPEGs in `hd-b2-jpeg/`.
