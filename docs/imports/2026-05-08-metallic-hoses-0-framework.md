# Import 2026-05-08 — Metallic Hoses Batch 0 (FRAMEWORK + Stainless Annular)

**Date:** 2026-05-08
**Branch / PR:** `feat/catalogue-bulk-metallic-hoses-0`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

First batch in the **Metallic Hoses initiative**. Establishes the foundations — 4 OEM brands, a new purpose-built spec template (22 fields), 7 new categories, migrates 7 existing Dixon products from the awkward `metallic-ptfe-hoses` bucket into a clean parent-child structure, and lands 10 new Thorburn Flex stainless-annular products.

After this batch the metallic hose family has:
- 1 parent category `metallic-hoses` under Industrial Hoses
- 6 sub-categories (stainless-corrugated, exotic-alloy, high-pressure, fire-protection, specialty-assemblies, ptfe)
- 17 products (7 Dixon migrated + 10 new Thorburn)
- New `metallic-hose-spec` template covering material, construction, dimensions, performance, and compliance with OEM-agnostic field naming

### What was created / updated

| Entity | Count | Notes |
|---|---|---|
| Brands | 4 created | Thorburn Flex (Canada), Senior Flexonics (UK), Hose Master (USA), Witzenmann (Germany) — all `isAuthorizedDistributor: false` until formal agreements |
| Categories | 7 created | `metallic-hoses` (parent under industrial-hoses, position 27); 6 sub-categories at positions 0-5 |
| Spec template | 1 created | `metallic-hose-spec` — 22 fields covering Identification (4) / Construction (4) / Dimensions (5) / Performance (5) / Compliance (5). Replaces Dixon-flavored `industrial-hose-spec` for this family. |
| Products | 10 created + 7 updated | 10 new Thorburn SS Annular + Helical + HP; 7 migrated from `metallic-ptfe-hoses` |
| ProductSpec rows | 367 created | 17 × 22 = 374 expected; 7 `nace_mr0175 = false` booleans skipped by importer (false-boolean optimisation) |
| ProductFaq rows | 136 created | 17 × 8 |
| NavMenuItem changes | 0 | Megamenu update DEFERRED to a follow-up PR |

### Migration of 7 existing Dixon products

The 7 Dixon products previously in `metallic-ptfe-hoses` were migrated using `--mode=overwrite-edits`:

| SKU | Old category | New category |
|---|---|---|
| `IH-IH-METALLIC-ADFLEX` | metallic-ptfe-hoses | metallic-stainless-corrugated-hoses |
| `IH-IH-METALLIC-HP-THP` | metallic-ptfe-hoses | metallic-stainless-corrugated-hoses |
| `IH-IH-METALLIC-HYPARFLEX` | metallic-ptfe-hoses | metallic-stainless-corrugated-hoses |
| `IH-IH-METALLIC-SUPARFLEX` | metallic-ptfe-hoses | metallic-stainless-corrugated-hoses |
| `IH-IH-PTFE-CONVOLUTED-POLYMER` | metallic-ptfe-hoses | ptfe-hoses |
| `IH-IH-PTFE-CONVOLUTED-SS` | metallic-ptfe-hoses | ptfe-hoses |
| `IH-IH-PTFE-SMOOTHBORE-SS` | metallic-ptfe-hoses | ptfe-hoses |

All 7 also moved from `industrial-hose-spec` (14 fields, Dixon-flavored) → `metallic-hose-spec` (22 fields, OEM-agnostic). Specs and FAQs were re-authored to leverage the richer field set. URL paths change for these products (`/c/metallic-ptfe-hoses` → `/c/metallic-stainless-corrugated-hoses` or `/c/ptfe-hoses`); 301 redirects for SEO continuity should be added in a follow-up PR (`apps/storefront/src/proxy.ts`).

### 10 new Thorburn Flex products (all under `metallic-stainless-corrugated-hoses` except 1 HP)

| SKU | Title (short) | Type | Braid | Pressure |
|---|---|---|---|---|
| `IH-MH-THORBURN-S95-321-UB` | Type 321 SS Annular Unbraided | Annular | Unbraided | 13 bar |
| `IH-MH-THORBURN-S96-321` | Type 321 SS Annular Single Braid | Annular | Single (304) | 146 bar |
| `IH-MH-THORBURN-S96Z-321` | Type 321 SS Annular Double Braid | Annular | Double (304) | 215 bar |
| `IH-MH-THORBURN-S91-316L-UB` | Type 316L SS Annular Unbraided | Annular | Unbraided | 13 bar |
| `IH-MH-THORBURN-S92-316L` | Type 316L SS Annular Single Braid (304) | Annular | Single (304) | 146 bar |
| `IH-MH-THORBURN-S92Z-316L` | Type 316L SS Annular Double Braid (304) | Annular | Double (304) | 215 bar |
| `IH-MH-THORBURN-S93-316L` | Type 316L SS Annular Single Braid (316L premium) | Annular | Single (316L) | 146 bar |
| `IH-MH-THORBURN-S93Z-316L` | Type 316L SS Annular Double Braid (316L premium) | Annular | Double (316L) | 215 bar |
| `IH-MH-THORBURN-S65-XFLEX-321` | Type 321 SS Helical Extra Flex | Helical | Single (304) | 35 bar |
| `IH-MH-THORBURN-S81-HP-316L` | Type 316L SS HP Annular Double Braid (high-pressure) | Annular | Double (304) | 200 bar — under `metallic-high-pressure-hoses` |

### Importer-library defect noted (one-time SQL cleanup applied)

`--mode=overwrite-edits` deletes specs WHERE `templateFieldId IN (current template fields)` — but when a product's template CHANGES (as in this migration), the old template's fields are no longer "current" and the old specs orphan. After live import the 7 Dixon products had 36 specs each (14 orphans from `industrial-hose-spec` + 22 new from `metallic-hose-spec`).

**Cleanup applied:** one-time SQL `DELETE FROM product_specs WHERE product_id IN (...) AND template_field_id IN (SELECT id FROM spec_template_fields WHERE template_id != products.spec_template_id)` deleted 98 orphan specs (14 × 7). Final state: each migrated product has 21 specs (22 expected − 1 `nace_mr0175 = false` skipped by importer's false-boolean optimisation).

**Recommended follow-up:** patch `packages/db/src/import/products.ts` to detect template changes during overwrite-edits and delete orphan specs as part of the upsert flow. Tracked as a future PR (no immediate action needed for downstream batches; cleanup pattern is documented here).

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-08-metallic-hoses-0-framework.ts --dry-run --mode=overwrite-edits
pnpm --filter @indus/db db:import src/imports/2026-05-08-metallic-hoses-0-framework.ts --mode=overwrite-edits
```

⚠️ **MUST run with `--mode=overwrite-edits`** — the 7 Dixon migrations require their existing specs / FAQs to be deleted-and-recreated against the new template.

## Notes for editors

- **The 7 migrated Dixon products' URLs changed.** Old URL `/p/IH-IH-METALLIC-ADFLEX` is unchanged (product slug stable), but the parent category URL changed from `/c/metallic-ptfe-hoses` → `/c/metallic-stainless-corrugated-hoses` (or `/c/ptfe-hoses`). The category landing page redirect needs a follow-up PR in `apps/storefront/src/proxy.ts`.
- **`metallic-ptfe-hoses` legacy category is now empty** but still published. It can be `isPublished: false`-d via admin once the redirect lands. Indus admin should NOT delete the row — it's still referenced for historical analytics.
- **`industrial-hose-spec` template still exists** — it's used by 39 other Dixon hose products (air-water, water-suction, food-beverage, etc.). Don't delete it. Future scope: rename `dixon_part_code` → `oem_part_code` for consistency, or accept that the older Dixon-only catalog will continue using the brand-flavored field name.
- **Boolean false skipping** — the importer skips inserting ProductSpec rows where the value is `false` for boolean fields. This means the 7 Dixon products show 21 specs (not 22) — the missing one is `nace_mr0175 = false`. Storefront PDP should treat missing booleans as `false` by default; if it doesn't, show "—" or "No". Confirm storefront rendering on a spot-check.

## Follow-ups (deferred — not in this PR)

1. **Megamenu update.** Add `metallic-hoses` as a sub-section under the existing Industrial Hoses column. Deferred to a small dedicated PR after Batches 1-2 land more content (avoids reshuffling 26+ leaf list in this large framework batch).
2. **Storefront 301 redirects.** `/c/metallic-ptfe-hoses` → `/c/metallic-stainless-corrugated-hoses`. Small follow-up PR in `apps/storefront/src/proxy.ts`.
3. **Importer-library defect fix.** Patch overwrite-edits to clean orphan specs when template changes. PR scope: `packages/db/src/import/products.ts`.
4. **Batch 1 — Exotic Alloys.** ~20 products covering Hastelloy C276, Inconel 625, Monel 400, Bronze families.
5. **Batch 2 — High-Pressure + Specialty Cores.** S98Z, S99Z (nuclear CRN-rated), S50HD, S69, plus Lock-Section / Armor-Flex / Smooth-Flex / Fire-Jacket. ~20 products.
6. **Batch 3 — Special-Purpose Assemblies.** Cryogenic, Steam-Jacketed, Electrically-Heated, Chlorine, Oxygen, CGA-UL Gas, Thor-Loop. ~20 products.
7. **Batch 4 — Specialty Couplings (Option B).** Cryogenic + dry-break + met-o-seal + O-seal + sight-flow + swivel joints. ~10 products.

## Rollback (if ever needed — DO NOT auto-run)

Note: rollback is more complex than typical batches because of the migration. Existing 7 Dixon products would need to revert to old template + old categorySlug, and old specs/FAQs would need to be recreated from a backup.

```sql
-- 1. Delete the 10 new Thorburn products
DELETE FROM products WHERE sku LIKE 'IH-MH-THORBURN-%';

-- 2. (DESTRUCTIVE — requires backup) Revert 7 Dixon migrated products
--    to their pre-migration state. Specs / FAQs were overwritten — they
--    cannot be recovered from this rollback alone. Restore from DB backup
--    snapshot taken before Batch 0 import.
-- UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'metallic-ptfe-hoses'),
--                     spec_template_id = (SELECT id FROM spec_templates WHERE slug = 'industrial-hose-spec')
-- WHERE sku LIKE 'IH-IH-METALLIC-%' OR sku LIKE 'IH-IH-PTFE-%';

-- 3. Delete the 7 new categories (sub-cats first, then parent)
DELETE FROM categories WHERE slug IN ('metallic-stainless-corrugated-hoses', 'metallic-exotic-alloy-hoses', 'metallic-high-pressure-hoses', 'metallic-fire-protection-hoses', 'metallic-specialty-assemblies', 'ptfe-hoses');
DELETE FROM categories WHERE slug = 'metallic-hoses';

-- 4. Delete the spec template (cascades to fields)
DELETE FROM spec_templates WHERE slug = 'metallic-hose-spec';

-- 5. Delete the 4 new brands
DELETE FROM brands WHERE slug IN ('thorburn-flex', 'senior-flexonics', 'hose-master', 'witzenmann');
```

## Verification (run before PR opened — pass)

| Check | Expected | Result |
|---|---|---|
| 4 new brands created with isAuthorizedDistributor=false | 4 | ✓ 4 |
| 7 new categories at correct positions under metallic-hoses | 7 | ✓ 7 |
| `metallic-hose-spec` template with 22 fields | yes | ✓ 22 |
| 10 new Thorburn products with status=active | 10 | ✓ 10 |
| 7 Dixon migrated products: new template + new category | 7 | ✓ 7 |
| Old `metallic-ptfe-hoses` category empty (0 products) | 0 | ✓ 0 |
| `search_tsv` populated for new + migrated products | 17 | ✓ 17 |
| 98 orphan specs cleaned up (14 × 7) | 98 | ✓ 98 |
| Each Thorburn product: 22 specs + 8 FAQs | 10 each | ✓ 10/10 |
| Each Dixon migrated: 21 specs + 8 FAQs (1 false-bool skipped) | 7 each | ✓ 7/7 |
| Catalogue total | 895 (was 885 pre-batch; +10 net new — 7 were already counted) | ✓ 895 |
