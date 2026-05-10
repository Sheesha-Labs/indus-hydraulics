# Import 2026-05-10 — DEMCO butterfly valves (14 products)

**Date:** 2026-05-10
**Branch / PR:** `feat/catalogue-bulk-butterfly-valves`
**Phase:** 4 (Catalogue)
**Operator:** Claude Code (autonomous, plan-approved)

## Summary

Imports the full DEMCO butterfly valve product line from the Cooper Cameron Valves catalogue (CT-DEM-NE/NF/NEI, 08/05) as 14 products: 6 valve series + 8 accessories. Adds a new DEMCO brand, a new Butterfly Valves category under Valves & Manifolds, two new spec templates, and a new "Process Valves" sub-section in the megamenu.

DEMCO is a major resilient-seated process butterfly valve product line covering chemical, food/beverage, sanitary, water/wastewater, HVAC, mining and marine applications. It is distinct from the existing oilfield butterfly valves (`oilfield-butterfly-valves` / `IH-OFV-BFLY-*` SKUs and `oilfield-valve-spec` template, landed in PR #100-ish) which target wellhead and frac service.

### What was created

| Entity | Count | Notes |
|---|---|---|
| Brands | 1 | `demco` (USA, authorised distributor = true). Name: DEMCO. Description references its parent line (Cooper Cameron Valves → Cameron Valves & Measurement, an SLB business). The pre-existing `cameron` brand is intentionally separate — it covers Cameron-branded oilfield products, while `demco` covers the DEMCO-branded process-valve product line. |
| Categories | 1 | `butterfly-valves` under `valves-manifolds`. Position 0 (first child). `defaultSpecTemplateSlug='butterfly-valve-spec'`. |
| Spec templates | 2 | `butterfly-valve-spec` (16 fields) for valves, `butterfly-valve-accessory-spec` (9 fields) for accessories. |
| Products | 14 | 6 valve series + 8 accessories (4 handles, 1 worm-gear operator, 2 pneumatic actuators, 1 stem extension). |
| ProductSpec rows | 168 | 16 specs × 6 valves (96) + 9 specs × 8 accessories (72). |
| ProductFaq rows | 96 | 8 FAQs × 6 valves (48) + 6 FAQs × 8 accessories (48). |
| NavMenuItem changes | -0, +1 | New "Process Valves" sub-section under Valves & Manifolds at position 5 (after the 5 existing hydraulic placeholder sub-sections), with a single leaf "Butterfly Valves" → `butterfly-valves`. The existing 5 hydraulic-valve sub-sections (Directional Control, Pressure Control, Flow Control, Check & Logic, Manifolds — all with placeholder customUrl leaves) are NOT touched. |

### SKUs

**Valve series (6):**
- `IH-VAL-BFLY-NEC` — DEMCO Series NE-C General-Purpose Butterfly Valve, 2″–12″ (long-neck, wafer + lug)
- `IH-VAL-BFLY-NEI` — DEMCO Series NE-I Short-Neck Butterfly Valve, 2″–12″ (wafer + lug)
- `IH-VAL-BFLY-NEI-SAN` — DEMCO Series NE-I Sanitary Butterfly Valve (FDA), 2″–12″ (wafer only)
- `IH-VAL-BFLY-NED` — DEMCO Series NE-D Lightweight-Flange Butterfly Valve, 2″–12″ (wafer only, body notches for tank-truck flange patterns)
- `IH-VAL-BFLY-NEIT` — DEMCO Series NEI-T Teflon-Lined Sanitary Butterfly Valve, 2″–10″ (wafer + lug)
- `IH-VAL-BFLY-NFC` — DEMCO Series NF-C Large-Bore Butterfly Valve, 14″–36″ (wafer + lug)

**Accessories (8):**
- `IH-VAL-BFLY-HDL-10P` — 10-Position Locking Handle (3 trim levels, 3 frame sizes)
- `IH-VAL-BFLY-HDL-2P` — 2-Position Locking Handle (3 trim levels, 3 frame sizes)
- `IH-VAL-BFLY-HDL-MEM` — Memory-Stop Throttling Handle (3 trim levels, 3 frame sizes)
- `IH-VAL-BFLY-HDL-SQ` — Square-Nut Handle (buried/below-grade service)
- `IH-VAL-BFLY-WGO` — Worm-Gear Operator (2″–36″, 4 input options, 6 gear ratios)
- `IH-VAL-BFLY-DR-DA` — Series DR Double-Acting Pneumatic Actuator (10 frame sizes, EDA40 → PDA4000)
- `IH-VAL-BFLY-DR-SR` — Series DR Spring-Return Pneumatic Actuator (fail-safe, ESA40 → PSA4004)
- `IH-VAL-BFLY-STMX` — Stem Extension (3″–16 ft fabricated to order)

## How to re-run

```sh
pnpm --filter @indus/db db:import src/imports/2026-05-10-butterfly-valves.ts --dry-run
pnpm --filter @indus/db db:import src/imports/2026-05-10-butterfly-valves.ts
```

The default `--mode=add-only` is idempotent: brand / category / spec-template / nav-leaf upserts run unconditionally; product upserts update the Product row but skip ProductSpec / ProductFaq insertion if the product already has any (preserves admin manual edits).

## Notes for editors

- **Product images and downloadable catalogue PDF are NOT attached** — these will be added in a separate batch per agreed scope.
- **The "How to Order" code structure** is rendered as an HTML table in `descriptionLong` on every valve PDP. This is the heart of the customer-facing configuration content — DEMCO valves are inherently configurable and the customer specifies size/pressure/material/elastomer at RFQ time.
- **Material selection guide** (chemical compatibility table from catalogue pages 32–36) is summarised inline in each PDP's seat-elastomer FAQ. The full table will be added as a downloadable PDF resource in a future batch.
- **NE-I Sanitary 5″ size is intentionally NOT available** per the DEMCO catalogue. The size_range spec field reflects this exclusion. Customers searching for a 5″ sanitary butterfly valve land on the NE-I Sanitary PDP and see the exclusion in the spec table.
- **NF-C 30″ and 36″ stem extensions** require factory consultation per the DEMCO catalogue. The STMX product description and FAQ both flag this.
- **Cameron brand vs DEMCO brand** — the existing `cameron` brand is for Cameron-branded oilfield wellhead products (gate, check, plug, choke, ball, globe, PRV — all under the `oilfield-*` category tree). The new `demco` brand is for the DEMCO-branded process-valve product line. Both are technically owned by the same parent (Cameron Valves & Measurement, an SLB business) but are sold as distinct product lines with different pricing, lead times and authorised-distributor agreements.

## Follow-ups (deferred)

1. Attach product images for all 14 SKUs (per user request — separate batch).
2. Attach the source DEMCO catalogue PDF (CT-DEM-NE/NF/NEI 08/05, 40 pages, 2.8 MB) as a downloadable spec sheet on each valve PDP if/when the schema gains a per-product datasheet field.
3. Extract the chemical-compatibility material-selection guide (catalogue pages 32–36) into a downloadable PDF resource and link it from the Construction section of every valve PDP.
4. Replace the placeholder hydraulic-valve sub-sections under Valves & Manifolds (Directional Control, Pressure Control, Flow Control, Check & Logic, Manifolds) when those products land — currently still seeded with `customUrl` placeholder leaves from the original `seed.ts`.
5. Cross-link the oilfield butterfly valves (`/c/oilfield-butterfly-valves`) and the new general-industrial butterfly valves (`/c/butterfly-valves`) so customers searching the wrong category get redirected — a "see also" callout on each category page would be the lightweight option.
6. Consider adding the DEMCO marine valves (B-255 / B-256 / B-258 data sheets) as a follow-up SKU `IH-VAL-BFLY-MARINE` once those data sheets are sourced from the factory.
7. Consider adding the DEMCO declutchable manual override (size 40 → 4004) as a separate accessory SKU when stock decisions require it; currently mentioned only in the `IH-VAL-BFLY-DR-SR` description.
8. Consider adding the DEMCO position-indicator switch / solenoid / pneumatic positioner / speed-control / seal-repair-kit accessories (page 25 of catalogue) as separate accessory SKUs in a follow-up — currently they are mentioned in the actuator product descriptions but not surfaced as standalone PDPs.

## Rollback (if ever needed — DO NOT auto-run)

```sql
-- Delete megamenu leaf and sub-section
DELETE FROM nav_menu_items
WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
  AND parent_id = (
    SELECT nmi.id FROM nav_menu_items nmi
    JOIN nav_menu_items col ON col.id = nmi.parent_id
    JOIN categories vm ON vm.id = col.category_id
    WHERE vm.slug = 'valves-manifolds' AND nmi.label = 'Process Valves'
  );
DELETE FROM nav_menu_items
WHERE menu_id = (SELECT id FROM nav_menus WHERE location = 'primary_megamenu')
  AND label = 'Process Valves'
  AND parent_id = (
    SELECT nmi.id FROM nav_menu_items nmi
    JOIN categories vm ON vm.id = nmi.category_id
    WHERE vm.slug = 'valves-manifolds' AND nmi.parent_id IS NULL
  );

-- Delete product-related rows (specs, FAQs, products)
DELETE FROM product_specs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-VAL-BFLY-%');
DELETE FROM product_faqs WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'IH-VAL-BFLY-%');
DELETE FROM products WHERE sku LIKE 'IH-VAL-BFLY-%';

-- Delete category and spec templates
DELETE FROM categories WHERE slug = 'butterfly-valves';
DELETE FROM spec_template_fields WHERE template_id IN (SELECT id FROM spec_templates WHERE slug IN ('butterfly-valve-spec', 'butterfly-valve-accessory-spec'));
DELETE FROM spec_templates WHERE slug IN ('butterfly-valve-spec', 'butterfly-valve-accessory-spec');

-- Delete brand
DELETE FROM brands WHERE slug = 'demco';
```

## Verification (pass — run before PR opened)

| Check | Expected | Result |
|---|---|---|
| Products created | 14 | ✅ 14 |
| All products `status='active'` | yes | ✅ |
| All products `brand.slug='demco'` | yes | ✅ |
| All products `category.slug='butterfly-valves'` | yes | ✅ |
| Valve products use `butterfly-valve-spec` (16 specs each) | 6 × 16 = 96 specs | ✅ 6 valves × 16 specs |
| Accessory products use `butterfly-valve-accessory-spec` (9 specs each) | 8 × 9 = 72 specs | ✅ 8 × 9 |
| Valve products have 8 FAQs each | 6 × 8 = 48 | ✅ |
| Accessory products have 6 FAQs each | 8 × 6 = 48 | ✅ |
| `search_tsv` populated for every product | 14 / 14 | ✅ 14 / 14 |
| Brand `demco` exists, country=USA, authorised distributor=true | yes | ✅ |
| Category `butterfly-valves` exists, parent=`valves-manifolds`, position=0, defaultSpecTemplate=`butterfly-valve-spec` | yes | ✅ |
| Spec template `butterfly-valve-spec` has 16 fields | yes | ✅ |
| Spec template `butterfly-valve-accessory-spec` has 9 fields | yes | ✅ |
| Megamenu has new "Process Valves" sub-section under V&M, position 5, with one leaf | yes | ✅ |
| Existing 5 hydraulic-valve sub-sections (placeholder leaves) preserved | yes | ✅ |
| Megamenu "Process Valves" leaf "Butterfly Valves" → `butterfly-valves` category | yes | ✅ |
