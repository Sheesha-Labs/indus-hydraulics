-- Adds optional MSRP / "compare at" price to products. Pairs with `listPrice`.
-- Renders as strike-through on the storefront when set AND strictly greater
-- than `listPrice` — never a fake discount.
--
-- Applied to production on 2026-05-05 via supabase MCP as
-- `product_compare_at_price`. Re-running is safe.

BEGIN;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS "compareAtPrice" decimal(12, 2);

COMMIT;
