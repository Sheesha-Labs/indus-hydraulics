# Hydraulics Direct batch 5 — `hd-hose-ends`

**88 new listings, 594 part numbers** of hose ends from Hydraulics Direct (US principal since
2026-10-09), unbranded. Part numbers: `IH-BR-` (brass), `IH-SS-` (stainless, from the source's
`SS-` codes), `IH-ST-` (steel), each followed by the supplier part number.

| Category | Listings | |
|---|---|---|
| `r14-ptfe-hose-ends` | 20 | new (316L stainless and steel) |
| `bw-series-crimp-fittings` | 13 | new |
| `brass-hose-barbs` | 12 | new |
| `stainless-hose-barbs-push-on-fittings` | 12 | new |
| `thy-series-crimp-fittings` | 9 | new |
| `reusable-hose-ends` | 7 | new (SAE 100R1, R2AT, R5) |
| `r5-textile-hose-ends` | 7 | new |
| `stainless-crimp-hose-fittings` | 4 | new, under Stainless Steel Hydraulic Fittings |
| `braided-hose-crimp-fittings` | 3 | existing (43 series) |
| `brass-push-lock-hose-barbs` | 1 | existing |

Existing categories are listed with no bands, so the importer leaves them untouched.

## Decisions
- R5 and R14 hose sizes are SAE dash sizes, printed with the inside diameter from the SAE 100R5/R14
  dash table (-8 = 13/32"); the source's names contain typos such as "3/32" for 13/32".
- BW and THY are separate crimp systems; their pages say not to mix series or makers.
- The source copies its crimp-hose list (1SN, 2SN, R16, R17) onto the stainless push-on fittings;
  those pages say push-on hose instead.
- No pressure ratings: the source publishes none. Pages say an assembly is rated to the lower of hose
  and end.
- Skipped `B-4311` (a second family of the push-lock barb already live from batch 2).

## Images
Checked on contact sheets. No photo on `B-144` (shows a push-lock barb), `SS-HB-MJ` and
`SS-THY-MOR` (brass-coloured parts), `SS-T91-MDL`, `SS-T91-MJ`, `T91-MP` (TITAN renders),
`SS-T91-MFF` (none in source). The straight R14 female-swivel ends share one catalogue render.

## Regenerating
`_scripts/batch5/build_b5.py <repo>` then `convert_b5.py`.
