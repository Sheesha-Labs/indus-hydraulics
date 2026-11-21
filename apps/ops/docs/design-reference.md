# Design reference and plan: where they live

Indus Operations is built from a high-fidelity design handoff and an engineering plan. Neither is in this
repository, and neither may be copied into it.

| What | Shell variable | Location |
|---|---|---|
| Design handoff (`design_handoff_indus_operations`: guides, 13 component kits, templates T1–T12, shell S01–S08, 196 board specs and PNGs, reference HTML) | `$OPS_DESIGN_REF_DIR` | `~/Documents/Indus Ops Console/design_handoff_indus_operations` |
| Engineering plan (architecture, schema, frontend and integration maps, the prompt book) | `$OPS_PLAN_DIR` | `~/Documents/Indus Ops Console/plan` |
| Working files (PR bodies, patches, notes, the e2e mail sink) | `$OPS_SCRATCH` | `~/Documents/Indus Ops Console/scratch` |
| Evidence (design-parity diffs, screenshots, exit evidence) | `$OPS_EVIDENCE_DIR` | `~/Documents/Indus Ops Console/evidence` |

## Why outside the repository

The repository is public. The handoff carries the real logo file, the company's bank block and TRN, and sample
data shaped like real trading records; the plan names suppliers, decisions and commercial defaults. Anything
committed here is world-readable and stays in git history even after it is deleted (root `CLAUDE.md` §14).

## What may cross into the repository

Only two things, and only as values:

1. Design token values, through `packages/ops-ui/tokens/tokens.json` (colours, type scale, radii, spacing,
   elevation). Token names follow the handoff's `--io-*` names.
2. The path data of the 13 sidebar icons.

Everything else stays outside: no board PNGs, no reference HTML, no copy blocks pasted wholesale, no sample
records. Copy the handoff's wording into components where a board specifies it; never copy its sample data.

## How the design-parity check reads it

From S01-T02, `bun run --filter @indus/ops test:visual:design` renders each board's route at 1440 × 940 and diffs
it against `$OPS_DESIGN_REF_DIR/screens/png/<board>.png`. It runs locally only, reads the PNGs in place, and writes
diffs to `$OPS_EVIDENCE_DIR`. The committed visual baselines (`test:visual`) use neutral fixtures only
("Example Valve Co", "Sample Client LLC", "TEST BANK", TRN `000000000000000`).
