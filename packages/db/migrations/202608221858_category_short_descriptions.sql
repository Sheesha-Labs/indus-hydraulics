-- Give the five published top-level categories that have no `shortDescription`
-- one, so their cards render a description line on the 126 export-market pages.
--
-- Two of them (`hydraulic-hose-fittings-suppliers-uae`, `valves-manifolds`)
-- already appear there and render as a heading over a bare link list, which the
-- design does not have a variant for. The other three (`hydraulic-pumps`,
-- `cylinders`, `seals-accessories`) have no children either, so
-- `markets/[slug]/page.tsx` filters them off the page entirely — a top-level
-- category with neither children nor a description has nothing to say. Writing
-- a description brings all three back on every market page with no code change.
--
-- The same string is the card copy on /c and feeds the category page, so each
-- one is written to stand on its own outside the market context.
--
-- Every claim below was checked against what the category actually holds, not
-- against its name or its `seoDescription`:
--
--   * `cylinders` — no telescopic cylinder exists in the catalogue, though
--     `seoDescription` advertises one. Not repeated here.
--   * `valves-manifolds` — no manifold exists either. The text describes the
--     valve ranges that are stocked and does not assert a manifold.
--   * `seals-accessories` — holds NO seals. Its six products are HYDAC filters
--     and accumulators, a Rexroth ball valve and a power pack; every seal-like
--     SKU in the database sits under hose fittings, BOP soft goods or Storz
--     gaskets. The description covers what is stocked. The category name is
--     therefore still wrong and wants a separate rename.
--
-- Guarded on `IS NULL` so re-running cannot clobber a later edit made in the
-- admin categories editor. Idempotent, per the convention in README.md.
--
-- Applying this bypasses the admin editor's cache purge. Both /c and
-- /markets/[slug] carry `revalidate = 3600`, so the copy appears within the
-- hour on its own; purge the `categories` tag to see it sooner.

UPDATE categories
SET "shortDescription" = 'Hydraulic hose, fittings and adapters — wire-braid, spiral, compact and thermoplastic hose, crimp fittings and ferrules, SAE J518 flanges, quick couplers, and DIN 2353, BSP, JIC 37°, ORFS, metric and NPT thread forms. Carbon steel and SS316L.'
WHERE slug = 'hydraulic-hose-fittings-suppliers-uae'
  AND "shortDescription" IS NULL;

UPDATE categories
SET "shortDescription" = 'Hydraulic and process valves — Yuken and Bosch Rexroth solenoid directional, pressure reducing, pilot-operated relief and proportional valves in CETOP 3 and CETOP 5, plus DEMCO resilient-seated butterfly valves, 2″ to 36″, ASME Class 150.'
WHERE slug = 'valves-manifolds'
  AND "shortDescription" IS NULL;

UPDATE categories
SET "shortDescription" = 'Axial piston, vane and gear hydraulic pumps — Bosch Rexroth A10VSO variable displacement from 45 to 100 cc/rev and PGH4 external gear, with Parker T6C and T7B fixed-displacement vane pumps for machine-tool duty.'
WHERE slug = 'hydraulic-pumps'
  AND "shortDescription" IS NULL;

UPDATE categories
SET "shortDescription" = 'Double-acting hydraulic cylinders — ISO 6020/2 tie-rod in 63, 80 and 100 mm bore with clevis and bracket mounts, and heavy welded cylinders to 120 mm bore. Strokes from 200 to 600 mm, Parker and Bosch Rexroth.'
WHERE slug = 'cylinders'
  AND "shortDescription" IS NULL;

UPDATE categories
SET "shortDescription" = 'Hydraulic power unit accessories — HYDAC 10-micron suction strainers and return-line filters, SB330 bladder accumulators in 4 and 10 litre at 330 bar, Bosch Rexroth KHB screw-in ball valves, and assembled 11 kW power packs.'
WHERE slug = 'seals-accessories'
  AND "shortDescription" IS NULL;
