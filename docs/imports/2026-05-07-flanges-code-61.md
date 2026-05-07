# Import 2026-05-07 — 4 SAE Flange Code 61 Hose Fittings

**Date:** 2026-05-07
**Branch / PR:** `feat/catalogue-bulk-flanges-code-61`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Adds 4 SAE J518 **Code 61** flange-on-fitting hose ends (straight, 45°, 90°, long-drop) under the existing `sae-flange-fittings` category. PR #67 introduced the `sae-flange-spec` template and 10 flange products, but all 10 were Code 62 / Supercat / split-clamp variants — the Code 61 flange-on-fitting family was empty. This batch fills it. No schema, megamenu, brand, or category changes.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 0 | Reuses `indus` |
| Categories | 0 | Reuses `sae-flange-fittings` |
| Spec templates | 0 | Reuses `sae-flange-spec` (9 fields) |
| Products | 4 | `IH-FL-61`, `IH-FL-61-90`, `IH-FL-61-45`, `IH-FL-61-LD` |
| ProductSpec rows | 36 | 9 fields × 4 products |
| ProductFaq rows | 32 | 8 FAQs × 4 products |
| NavMenuItem changes | 0 | `sae-flange-fittings` leaf already present from PR #67 |

### SKUs

- `IH-FL-61` — Flange Code 61 Hose Fitting (straight)
- `IH-FL-61-90` — 90° Flange Code 61 Hose Fitting
- `IH-FL-61-45` — 45° Flange Code 61 Hose Fitting
- `IH-FL-61-LD` — Flange Code 61 Long Drop Hose Fitting

After this batch, `sae-flange-fittings` has **14 products** total (was 10).

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-07-flanges-code-61.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-07-flanges-code-61.ts
```

## Notes for editors

- **Code 61 ≠ Code 62.** The two SAE J518 series have different bolt patterns and pressure ratings — Code 61 = 210 bar / 3000 psi (Grade 5 bolts); Code 62 = 415 bar / 6000 psi (Grade 8 bolts). Customers must order matching split-flange clamps (`IH-FL-CLAMP-61`, NOT `IH-FL-CLAMP-62`). This is reinforced in FAQ #1 and FAQ #6 on every product.
- **Wider size range than Code 62.** Code 61 covers 1/2" – 5"; Code 62 caps at 2".
- **Material defaults.** Carbon steel, zinc-plated Cr3+ passivated, RoHS-compliant. Stainless 316 on request (called out in FAQ #5).
- **Pricing.** RFQ-only (`listPrice = null`) — every PDP shows the "Request a Quote" CTA per the standard Indus quote-out flow.
- **Megamenu.** No change. The `SAE Flange Fittings` leaf under `Hoses & Fittings → Hose Fittings` was added in PR #67 and points at `/c/sae-flange-fittings`, which now lists all 14 products.

## Follow-ups (deferred)

1. Specific dash-size SKUs (e.g., `IH-FL-61-08-90` for -8 dash size) — Indus currently RFQs by full size range; a future batch could split the family by dash size if customers ask for direct PDP-per-size.
2. Stainless steel variants as separate SKUs — currently "on request" via the description / FAQ rather than as own SKUs.
3. Code 61 long-drop with 90° elbow (combined config) — not in scope; can be added if customer demand emerges.

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- Delete FAQs first
DELETE FROM product_faqs
WHERE product_id IN (SELECT id FROM products WHERE sku IN ('IH-FL-61','IH-FL-61-90','IH-FL-61-45','IH-FL-61-LD'));

-- Delete specs
DELETE FROM product_specs
WHERE product_id IN (SELECT id FROM products WHERE sku IN ('IH-FL-61','IH-FL-61-90','IH-FL-61-45','IH-FL-61-LD'));

-- Delete products
DELETE FROM products WHERE sku IN ('IH-FL-61','IH-FL-61-90','IH-FL-61-45','IH-FL-61-LD');

-- No category, brand, spec template, or megamenu changes to reverse.
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| 4 products created | `IH-FL-61`, `IH-FL-61-90`, `IH-FL-61-45`, `IH-FL-61-LD` | ✅ |
| All `status = 'active'` | 4/4 | ✅ |
| All `brand.slug = 'indus'` | 4/4 | ✅ |
| All `category.slug = 'sae-flange-fittings'` | 4/4 | ✅ |
| All `listPriceCurrency = 'AED'` | 4/4 | ✅ |
| 9 specs per product (36 total) | 36 rows | ✅ |
| 8 FAQs per product (32 total) | 32 rows | ✅ |
| `search_tsv` populated | 4/4 | ✅ |
| `flange_code = 'code-61'` on all | 4/4 | ✅ |
| `flange_type = 'code-61-fitting'` on all | 4/4 | ✅ |
| `configuration` matches SKU | 4/4 | ✅ |
| `working_pressure_max` contains "210 bar" | 4/4 | ✅ |
| `bolt_pattern` contains "Code 61" | 4/4 | ✅ |
| `nominal_size_range` goes to 5" | 4/4 | ✅ |
| Category `sae-flange-fittings` total | 14 (was 10) | ✅ |
| Megamenu unchanged — `sae-flange-fittings` still under `Hose Fittings` | 9 leaves, present | ✅ |
| FAQ #1 distinguishes Code 61 (210 bar) from Code 62 | text match | ✅ |
