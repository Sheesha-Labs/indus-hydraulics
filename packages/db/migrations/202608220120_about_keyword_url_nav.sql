-- Point the header and footer "About" links at the company page's new URL.
--
-- The page moved from /about to /hydraulic-components-supplier-uae. The route
-- folder and the seed defaults move with the code, but nav is DB-driven and
-- the seed only writes when the menu is empty (`if (headerCount === 0)`), so
-- re-seeding will not touch an existing database. Without this, both links
-- keep pointing at /about and every visitor who uses the nav takes a
-- pointless redirect hop.
--
-- Matches `custom_url` items by their exact URL rather than by label, so a
-- renamed menu item is still caught and an unrelated item labelled "About"
-- is not.
--
-- Apply AFTER the deploy that adds the new route. Running it earlier points
-- the nav at a URL that does not exist yet.

UPDATE nav_menu_items
SET "customUrl" = '/hydraulic-components-supplier-uae'
WHERE "linkType" = 'custom_url'
  AND "customUrl" IN ('/about', '/about/');
