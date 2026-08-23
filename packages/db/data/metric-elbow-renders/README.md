# Metric elbow renders — `data/metric-elbow-renders/`

The 14 metric adapter elbows that shipped in PR #342 without a photograph. The
metric range had no existing 45° or 90° elbow listing to take a render from,
and borrowing another category's elbow would have put the wrong fitting in the
picture — a JIC elbow is not a metric one.

Generated 2026-08-23 and attached with
`attach-renders-by-sku.ts --dir <folder>`. The images live in the
`product-images` bucket; `briefs.py` is what made them.

## The briefs are derived, not written

Each brief is assembled from that product's OWN spec row — body configuration,
what is on each end, and how each end seals. `briefs.py` holds one sentence per
end type and composes them; there is no per-product prose. If the spec table
does not say a thing, the brief does not describe it.

This is the same rule as the rest of the catalogue: a render is an original
made from our own data, never a competitor's photograph reworked. See
[[project-catalogue-imagery-sourcing]].

## House style

Set by the 85 adapter renders already live, three of which were passed to the
model as reference images: a single zinc-plated carbon-steel fitting,
three-quarter view from slightly above, plain white ground, soft studio light,
centred at about 70% of a square frame.

## One correction during the sprint

The first pilot gave the NPT leg a polished conical seat — which would show the
wrong sealing method on the page, since an NPT joint seals on the thread, not
on a cone. The brief now says a taper thread's mouth is "a plain flat-cut bore
with no cone and no polished seat inside", and every taper end was regenerated
against it.

## What was rendered

| SKU | Body |
|---|---|
| `IH-AD-MET-018` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-019` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-023` | A 45° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-024` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-028` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-032` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-034` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-036` | A 45° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-037` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-041` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-042` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-044` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-054` | A 90° elbow body with a hexagonal wrench flat at the corner. … |
| `IH-AD-MET-055` | A 90° elbow body with a hexagonal wrench flat at the corner. … |

## Regenerating

`scenes.py` + `run.py` in the session scratchpad under `renders/`, the same
`codex exec` + `$imagegen` harness as the blog and service-case hero sprints.
Three attempts per image, skips anything already on disk, so a re-run finishes
a partial batch. Output is `<SKU>.png`, which is what the attach script keys on.
