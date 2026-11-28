-- Indus Operations · S11-T05 · document templates (board 57, ADR-14, ADR-27 point 7, ADR-28)
--
-- 1. At most one unpublished draft per kind (Settings › Document templates edits it, then publishes it).
-- 2. One published v1 template per kind: every block on in the layout's order, the line-table columns the
--    builders print today (S11-T01), lines on page 1 automatic, pending lines "Price to follow", A4. Each is a
--    default awaiting the Owner's sign-off (ADR-28): publishing a change in Settings signs it off.
--
-- Supplier kinds carry no bank block; packing lists and delivery notes print a fixed table (no columns).
-- ON CONFLICT DO NOTHING on (kind, name, version): a re-run never overwrites what the Owner has published.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS document_template_one_draft
  ON ops.document_template ("kind") WHERE "status" = 'draft';

INSERT INTO ops.document_template
  ("kind", "name", "version", "layout", "definition", "isActive", "signoffStatus", "status", "publishedAt", "pageSize")
VALUES
  ('quotation', 'default', 1, 'estimate-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"lines","on":true},{"key":"totals","on":true},{"key":"terms","on":true},{"key":"bank","on":true},{"key":"disclaimer","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":["no","description","qty","uom","rate","delivery","tax","amount"],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4'),
  ('order_acknowledgement', 'default', 1, 'house-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"subject","on":true,"settings":{"upperCase":true}},{"key":"lines","on":true},{"key":"totals","on":true},{"key":"terms","on":true},{"key":"bank","on":true},{"key":"disclaimer","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":["no","description","qty","rate","amount"],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4'),
  ('proforma_invoice', 'default', 1, 'house-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"subject","on":true,"settings":{"upperCase":true}},{"key":"lines","on":true},{"key":"totals","on":true},{"key":"terms","on":true},{"key":"bank","on":true},{"key":"disclaimer","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":["no","description","qty","rate","amount"],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4'),
  ('tax_invoice', 'default', 1, 'house-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"subject","on":true,"settings":{"upperCase":true}},{"key":"lines","on":true},{"key":"totals","on":true},{"key":"terms","on":true},{"key":"bank","on":true},{"key":"disclaimer","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":["no","description","qty","rate","amount"],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4'),
  ('credit_note', 'default', 1, 'house-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"subject","on":true,"settings":{"upperCase":true}},{"key":"lines","on":true},{"key":"totals","on":true},{"key":"terms","on":true},{"key":"bank","on":true},{"key":"disclaimer","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":["no","description","qty","rate","amount"],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4'),
  ('supplier_rfq', 'default', 1, 'house-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"subject","on":true,"settings":{"upperCase":true}},{"key":"lines","on":true},{"key":"terms","on":true},{"key":"disclaimer","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":["no","description","qty","uom","rate","delivery"],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4'),
  ('supplier_po', 'default', 1, 'house-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"subject","on":true,"settings":{"upperCase":true}},{"key":"lines","on":true},{"key":"totals","on":true},{"key":"terms","on":true},{"key":"disclaimer","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":["no","description","qty","uom","rate","amount"],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4'),
  ('packing_list', 'default', 1, 'house-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"subject","on":true,"settings":{"upperCase":true}},{"key":"lines","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":[],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4'),
  ('delivery_note', 'default', 1, 'house-v1',
   '{"blocks":[{"key":"letterhead","on":true},{"key":"header","on":true},{"key":"parties","on":true},{"key":"subject","on":true,"settings":{"upperCase":true}},{"key":"lines","on":true},{"key":"signature","on":true},{"key":"footer","on":true}],"columns":[],"linesOnFirstPage":"auto","pendingLines":"price_to_follow"}'::jsonb,
   true, 'awaiting', 'published', now(), 'A4')

ON CONFLICT ("kind", "name", "version") DO NOTHING;

COMMIT;
