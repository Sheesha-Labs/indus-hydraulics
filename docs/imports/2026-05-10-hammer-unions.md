# Import 2026-05-10 — 15 Indus-branded Hammer Unions (full ABCO figure-range coverage)

**Date:** 2026-05-10
**Branch / PR:** `feat/catalogue-bulk-hammer-unions`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Adds 15 Indus-branded hammer-union PDPs to `flow-iron-fittings`, completing Indus catalogue coverage of the canonical 19 hammer-union figure series advertised by ABCO and equivalent OEM (FMC WECO, Anson, SPM, OPI) catalogues. Reuses the existing `flow-iron-spec` template and `flow-iron-fittings` category — no new framework, no megamenu changes. Two **additive** option-list extensions to `figure_class` and `pressure_class` accommodate the previously-unsupported figure series.

After this batch every ABCO figure (40, 50, 100, 200, 201, 206, 207, 211, 300, 301, 400, 600, 602, 1002, 1003, 1004, 1502, 2202, AG) has at least one Indus-branded entry on the storefront.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 | Reuses existing `indus` brand |
| Categories | 0 | Reuses existing `flow-iron-fittings` |
| Spec templates | 0 created / 1 updated | Two field-option-list extensions to `flow-iron-spec`: `figure_class` (+12 options) and `pressure_class` (+1 option `'N/A'`). All existing options retained. |
| Products | 15 created | All Indus-branded, AED, RFQ-only, status=active, sold as a `set` |
| ProductSpec rows | 225 created | 15 spec values per product × 15 products (15 empty `length_in` values skipped, since hammer-union sets don't have a make-up length) |
| ProductFaq rows | 120 created | 8 FAQs per product × 15 products |
| NavMenuItem changes | 0 | Megamenu untouched — products surface under Flow Iron & Wellhead → Flow Iron → Fittings via the existing category link |

### Coverage matrix (after this PR)

| Figure | Indus Std variant | Other-brand variants | This PR adds |
|---|---|---|---|
| 40  | NPT 400 STD | — | ✅ Indus |
| 50  | NPT 500 STD | — | ✅ Indus |
| 100 | NPT 1K STD | — | already on main (PR #108) |
| 200 | NPT 2K STD | — | already on main (PR #108) |
| 201 | NPT 2K STD | — | ✅ Indus |
| 206 | NPT 2K STD | BW 2K SOUR (FMC) | ✅ Indus |
| 207 | NPT 2K STD | — | ✅ Indus |
| 211 | NPT 2K STD | — | ✅ Indus |
| 300 | NPT 2K STD | — | ✅ Indus |
| 301 | NPT 3K STD | — | ✅ Indus |
| 400 | NPT 4K STD | — | already on main (PR #108) |
| 600 | BW 6K STD | — | ✅ Indus |
| 602 | NPT 6K STD | NPT 6K STD (Anson) | ✅ Indus |
| 1002 | NPT 10K STD | — | already on main (PR #108) |
| 1003 | BW 10K STD | — | ✅ Indus |
| 1004 | BW 10K STD | — | ✅ Indus |
| 1502 | NPT 15K STD | NPT 15K STD (FMC), BW 15K STD (FMC) | ✅ Indus |
| 2202 | BW 15K SOUR | — | ✅ Indus (sour-only) |
| AG  | NPT 6K STD | — | ✅ Indus |

### SKUs

All 15 use the existing `IH-FI-HU-{FIGURE}-{END}-{PSI}-{SVC}-INDUS` pattern:

- IH-FI-HU-40-NPT-400-STD-INDUS
- IH-FI-HU-50-NPT-500-STD-INDUS
- IH-FI-HU-201-NPT-2K-STD-INDUS
- IH-FI-HU-206-NPT-2K-STD-INDUS
- IH-FI-HU-207-NPT-2K-STD-INDUS
- IH-FI-HU-211-NPT-2K-STD-INDUS
- IH-FI-HU-300-NPT-2K-STD-INDUS
- IH-FI-HU-301-NPT-3K-STD-INDUS
- IH-FI-HU-600-BW-6K-STD-INDUS
- IH-FI-HU-602-NPT-6K-STD-INDUS
- IH-FI-HU-1003-BW-10K-STD-INDUS
- IH-FI-HU-1004-BW-10K-STD-INDUS
- IH-FI-HU-1502-NPT-15K-STD-INDUS
- IH-FI-HU-2202-BW-15K-SOUR-INDUS
- IH-FI-HU-AG-NPT-6K-STD-INDUS

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-10-hammer-unions.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-10-hammer-unions.ts
```

Re-running with default `--mode=add-only` is safe — existing specs/FAQs are preserved.

## Notes for editors

1. **The two flow-iron-spec extensions are additive.** No options were removed from `figure_class` or `pressure_class`. The 92 existing IH-FI-* products that reference `flow-iron-spec` are unaffected. After this PR the field-option lists are the union of the original options plus the previously-unsupported low-pressure ABCO figure series (40, 50, 201, 207, 211, 300, 301, 600, 1003, 1004, 2202, AG) and the `'N/A'` pressure-class option needed for sub-1K figures.

2. **Brand entry is the house Indus record.** `isAuthorizedDistributor: false` (you can't be your own authorised distributor). Indus is supplying matched-pressure interchange product — the descriptions explicitly cite OEM equivalents (WECO, Anson, SPM, OPI) without claiming distributorship.

3. **Title disambiguation on the 1502.** Both Indus and FMC carry a "1502 NPT 15K STD" hammer union and would auto-derive the same slug from a generic title. The Indus title was therefore made specific — "1502 Series Field-Replaceable Lip-Seal" — which is a real engineering attribute of the 1502 design. FMC's existing title is unchanged.

4. **One product per figure (current granularity).** The plan was to ship one Indus hammer union per ABCO figure — this PR does that for the 15 figures that didn't already have an Indus + Standard variant. If SEM data later shows people search "1502 3 inch threaded hammer union" and click on the (non-specific) Indus 1502 page, we can split per-size in a follow-up batch. Cheap to do; the current consolidated PDP doesn't preclude it.

5. **Sour-service exception.** The 2202 series is sour-service-only by design (it's the H₂S-rated equivalent of the 1502, butt-weld-only at Sched XXH, NACE MR0175 hardness controlled). Its Indus variant is therefore the only one shipped as Sour rather than Standard.

6. **No image media yet.** All new PDPs ship without images. Add hammer-union photography in the Media library and link via the admin's product-edit page when assets are ready.

## Follow-ups (deferred)

1. Per-size split on the 1502 family if search demand justifies it (1502 / 1002 / 602 / 206 currently consolidated).
2. Indus-branded sour-service variants of 206 / 602 / 1002 / 1502 (not in this PR — current Indus coverage is Standard only except for 2202).
3. Hammer-union elastomer gasket SKUs (Buna-N / Viton / HSN / FFKM, per-figure-class) — currently mentioned in descriptions as "sold separately" but no companion SKUs exist.
4. Hammer-union wing-nut replacement SKUs (heat-treated wing nuts ship with each set, but field-replacement nuts are an aftermarket SKU class worth catalogueing).

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- 1. Delete the 15 new products (cascade removes specs and faqs)
DELETE FROM products WHERE sku IN (
  'IH-FI-HU-40-NPT-400-STD-INDUS','IH-FI-HU-50-NPT-500-STD-INDUS',
  'IH-FI-HU-201-NPT-2K-STD-INDUS','IH-FI-HU-206-NPT-2K-STD-INDUS',
  'IH-FI-HU-207-NPT-2K-STD-INDUS','IH-FI-HU-211-NPT-2K-STD-INDUS',
  'IH-FI-HU-300-NPT-2K-STD-INDUS','IH-FI-HU-301-NPT-3K-STD-INDUS',
  'IH-FI-HU-600-BW-6K-STD-INDUS','IH-FI-HU-602-NPT-6K-STD-INDUS',
  'IH-FI-HU-1003-BW-10K-STD-INDUS','IH-FI-HU-1004-BW-10K-STD-INDUS',
  'IH-FI-HU-1502-NPT-15K-STD-INDUS','IH-FI-HU-2202-BW-15K-SOUR-INDUS',
  'IH-FI-HU-AG-NPT-6K-STD-INDUS'
);

-- 2. The figure_class and pressure_class option-list extensions are
--    additive — no rollback needed unless other products start depending
--    on the new options. To revert manually:
--
-- UPDATE spec_template_fields SET options = '["100","200","206","400","602","1002","1502","2002","2K","3K","5K","10K","15K","20K","ANSI 150","ANSI 300","ANSI 600","ANSI 900","ANSI 1500","ANSI 2500","N/A"]'::jsonb
--   WHERE key = 'figure_class' AND template_id = (SELECT id FROM spec_templates WHERE slug = 'flow-iron-spec');
-- UPDATE spec_template_fields SET options = '["1K","2K","3K","4K","5K","6K","10K","15K","20K","ANSI 150","ANSI 300","ANSI 600","ANSI 900","ANSI 1500","ANSI 2500"]'::jsonb
--   WHERE key = 'pressure_class' AND template_id = (SELECT id FROM spec_templates WHERE slug = 'flow-iron-spec');
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| 15 new products exist with `status='active'` | 15 | 15 ✅ |
| All 15 brand=indus, category=flow-iron-fittings | 15 | 15 ✅ |
| All 15 have 15 specs and 8 FAQs each | 15 | 15 ✅ |
| `search_tsv` populated on all 19 IH-FI-HU-*-INDUS rows | 19 | 19 ✅ |
| Total hammer unions in flow-iron-fittings | 23 (8 existing + 15 new) | 23 ✅ |
| `figure_class` option list extended | 33 options total | 33 ✅ |
| `pressure_class` option list extended | 16 options total | 16 ✅ |
| No megamenu changes | 0 inserts / 0 deletes | 0 / 0 ✅ |
