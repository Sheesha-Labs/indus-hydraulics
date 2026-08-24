-- Megamenu: repoint the links that 404.
--
-- Fourteen visible megamenu items pointed at three category slugs that do not
-- exist. Verified against production:
--
--   /c/accessories-instrumentation   404   (6 links, one of them a column-2 entry)
--   /c/hydraulic-cylinders           404   (5 links)
--   /c/seals-components              404   (4 links)
--
-- These are `custom_url` links written when the section was seeded. The
-- categories they name were later created under different slugs, and four of
-- the five sibling entries were migrated to `linkType = 'category'` at some
-- point — which is why only these three branches were left behind. A category
-- link resolves through the category's CURRENT slug, so the ones that were
-- migrated survived the rename and these did not.
--
--   accessories-instrumentation  ->  instrumentation-controls  (12 products, rolled up)
--   hydraulic-cylinders          ->  cylinders                 (4 products)
--   seals-components             ->  seals-accessories         (6 products)
--
-- ── Why the sub-type children are repointed rather than hidden ──
--
-- Each broken parent has children labelled by sub-type ("Tie-Rod Cylinders",
-- "Welded Cylinders", "Rod Seals"). None of those exist as categories, and the
-- `?sub=…&type=…` parameters they carry are read by nothing — `/c/[slug]`
-- parses `brands`, `sort` and `page` only.
--
-- Hiding them would empty the megamenu's third column for those branches,
-- which reads as broken to a visitor in a way the 404 at least did not.
-- Pointing them at their parent's real category makes every link work and
-- lands the reader on a page that genuinely contains what the label names,
-- coarsely. Coarse is the honest state of that section: it holds 22 products
-- against a taxonomy written for hundreds.
--
-- The 83 depth-3 leaves beneath them are repointed by the same rule, because
-- they carry the same dead URLs. They render nowhere — the megamenu draws
-- three levels — so this changes nothing a visitor sees; it just stops the
-- database holding 83 links to slugs that do not exist, which is a trap for
-- whoever next raises the render depth or exports the menu. Deleting them
-- outright is a catalogue decision, not a link fix, so they stay.
--
-- `linkType = 'category'` rather than a corrected `custom_url`, so the next
-- slug rename cannot reintroduce this. The five FK columns are exclusive in
-- `resolveHref`, so `customUrl` is nulled at the same time.
--
-- Idempotent: re-running matches nothing, because the URLs it keys on are gone
-- after the first run.

BEGIN;

-- 1) Accessories & Instrumentation — the column-2 entry and its five children.
UPDATE nav_menu_items i
SET "linkType"   = 'category',
    "categoryId" = (SELECT id FROM categories WHERE slug = 'instrumentation-controls'),
    "customUrl"  = NULL
FROM nav_menus m
WHERE m.id = i."menuId"
  AND m.slug = 'primary-megamenu'
  AND i."customUrl" LIKE '/c/accessories-instrumentation%'
  AND EXISTS (SELECT 1 FROM categories WHERE slug = 'instrumentation-controls');

-- 2) Hydraulic Cylinders — five sub-type children.
UPDATE nav_menu_items i
SET "linkType"   = 'category',
    "categoryId" = (SELECT id FROM categories WHERE slug = 'cylinders'),
    "customUrl"  = NULL
FROM nav_menus m
WHERE m.id = i."menuId"
  AND m.slug = 'primary-megamenu'
  AND i."customUrl" LIKE '/c/hydraulic-cylinders%'
  AND EXISTS (SELECT 1 FROM categories WHERE slug = 'cylinders');

-- 3) Seals & Components — four sub-type children.
UPDATE nav_menu_items i
SET "linkType"   = 'category',
    "categoryId" = (SELECT id FROM categories WHERE slug = 'seals-accessories'),
    "customUrl"  = NULL
FROM nav_menus m
WHERE m.id = i."menuId"
  AND m.slug = 'primary-megamenu'
  AND i."customUrl" LIKE '/c/seals-components%'
  AND EXISTS (SELECT 1 FROM categories WHERE slug = 'seals-accessories');

COMMIT;
