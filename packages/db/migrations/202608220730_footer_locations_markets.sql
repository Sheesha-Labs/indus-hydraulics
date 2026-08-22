-- Add "Service areas" and "Export markets" to the footer Company column.
--
-- Neither surface was linked from anywhere on the site. /locations has been
-- live for some time and was reachable only from sitemap.xml or a breadcrumb
-- on one of its own detail pages, so it accumulated no internal links at all;
-- /markets ships in the same PR and would have had the same problem.
--
-- Nav is DB-driven and seed.ts only writes when the menu is empty
-- (`if (footerCount === 0)`), so the seed change alone does not reach an
-- existing database.
--
-- Inserted after "Industries" and before "Blog", matching the seed order.
-- Existing rows at position >= 3 shift down by two to make room.
--
-- Idempotent. Both statements are guarded on the links being absent, not just
-- the INSERT: guarding only the INSERT leaves the shift unguarded, so a second
-- run pushes every trailing row down another two and the positions drift into
-- gaps (0,1,2,5,6,7,8). Order survives that, but it is untidy and a third run
-- makes it worse — so the shift checks for the same condition the INSERT does.

WITH company AS (
  SELECT i.id
  FROM nav_menu_items i
  JOIN nav_menus m ON m.id = i."menuId"
  WHERE m.slug = 'footer-main'
    AND i."parentId" IS NULL
    AND i.label = 'Company'
  LIMIT 1
)
UPDATE nav_menu_items
SET position = position + 2
WHERE "parentId" = (SELECT id FROM company)
  AND position >= 3
  AND NOT EXISTS (
    SELECT 1 FROM nav_menu_items e
    WHERE e."parentId" = (SELECT id FROM company)
      AND e."customUrl" IN ('/locations', '/markets')
  );

WITH company AS (
  SELECT i.id
  FROM nav_menu_items i
  JOIN nav_menus m ON m.id = i."menuId"
  WHERE m.slug = 'footer-main'
    AND i."parentId" IS NULL
    AND i.label = 'Company'
  LIMIT 1
),
new_links(label, url, position) AS (
  VALUES ('Service areas', '/locations', 3),
         ('Export markets', '/markets', 4)
)
INSERT INTO nav_menu_items (id, "menuId", "parentId", position, label, "linkType", "customUrl", "openInNewTab", "isVisible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  (SELECT i."menuId" FROM nav_menu_items i WHERE i.id = (SELECT id FROM company)),
  (SELECT id FROM company),
  n.position,
  n.label,
  'custom_url',
  n.url,
  false,
  true,
  now(),
  now()
FROM new_links n
WHERE (SELECT id FROM company) IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM nav_menu_items e
    WHERE e."parentId" = (SELECT id FROM company)
      AND e."customUrl" = n.url
  );
