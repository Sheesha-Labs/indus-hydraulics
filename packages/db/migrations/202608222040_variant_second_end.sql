-- Adapter size tables: a second and third threaded end, plus the two figures
-- the adapter catalogue publishes per size and the hose-fitting one does not.
--
-- `product_variants` was built for a hose fitting: one hose end and one port.
-- An adapter has no hose end and two or three threaded ones, so `portLabel`
-- becomes the first end and these carry the rest. Nothing existing writes
-- them, so every current row keeps NULL and every current size table renders
-- exactly as before.
--
-- No touch to `products.search_tsv`. That column is GENERATED ALWAYS and has
-- to be dropped and re-added whenever a column it reads changes; it reads
-- `products`, not `product_variants`, so this migration is a plain ALTER.

ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS "port2Label"  text,
  ADD COLUMN IF NOT EXISTS "port3Label"  text,
  ADD COLUMN IF NOT EXISTS "weightG"     integer,
  ADD COLUMN IF NOT EXISTS "pressureBar" integer;
