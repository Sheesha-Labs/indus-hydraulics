-- Indus Operations · S11-T06 · seeded offer terms (board 39), all awaiting the Owner's sign-off (ADR-28)
--
-- Generic clause wording by category, upper-cased when printed, with {variables} filled from the preset, the
-- enquiry or a change on one document; and four presets: GCC standard (the default for new clients),
-- Oil & gas · TPI, Export · USD and Advance 100%. No client is named here: presets are assigned to clients in
-- Settings › Offer terms. ON CONFLICT DO NOTHING: wording the Owner has changed is kept.

BEGIN;

INSERT INTO ops.terms_clause
  ("category", "code", "title", "body", "variables", "locked", "approvalRule", "position", "isDefault",
   "signoffStatus", "updatedAt")
VALUES
  ('payment', 'P1', '50% advance', '50% advance with order; balance 50% before delivery from the factory', '{}', true, NULL, 1, true, 'awaiting', now()),
  ('payment', 'P2', 'Advance against proforma', '{advance_pct}% advance against proforma invoice; balance {balance_days} days from invoice', '{"advance_pct": 30, "balance_days": 60}', true, NULL, 2, false, 'awaiting', now()),
  ('payment', 'P3', '100% advance', '100% advance with order', '{}', true, NULL, 3, false, 'awaiting', now()),
  ('payment', 'P4', 'Credit days', '{days} days from delivery', '{"days": 30}', true, '{"kind": "payment_days_over", "days": 60}', 4, false, 'awaiting', now()),
  ('payment', 'P5', 'Letter of credit', 'Irrevocable LC at sight, confirmed by a UAE bank', '{}', true, '{"kind": "always"}', 5, false, 'awaiting', now()),
  ('delivery', 'D1', 'Ex-works Dubai', 'Ex-works Dubai', '{}', false, NULL, 1, true, 'awaiting', now()),
  ('delivery', 'D2', 'Delivered to site', '{incoterm} {site}', '{"incoterm": "DAP"}', false, NULL, 2, false, 'awaiting', now()),
  ('delivery', 'D3', 'Shipped to port', 'CIF {port}', '{}', false, NULL, 3, false, 'awaiting', now()),
  ('delivery', 'D4', 'Delivery date', 'Delivery by {delivery_date}', '{}', false, NULL, 4, false, 'awaiting', now()),
  ('lead_time', 'L1', 'Weeks from order', '{weeks} weeks from receipt of PO and advance', '{"weeks": 2}', false, NULL, 1, true, 'awaiting', now()),
  ('lead_time', 'L2', 'Ex-stock', 'Ex-stock, subject to prior sale', '{}', false, NULL, 2, false, 'awaiting', now()),
  ('validity', 'V1', 'Offer validity', 'Offer valid for {valid_weeks} weeks', '{"valid_weeks": 4}', false, NULL, 1, true, 'awaiting', now()),
  ('validity', 'V2', 'Prices and lead time', 'Prices valid 30 days; lead time to be confirmed at order', '{}', false, NULL, 2, false, 'awaiting', now()),
  ('make_origin', 'M1', 'Origin', 'Origin: {origin}', '{}', false, NULL, 1, false, 'awaiting', now()),
  ('make_origin', 'M2', 'China with certificates', 'China with mill test certificate and certificate of conformity', '{}', false, NULL, 2, true, 'awaiting', now()),
  ('make_origin', 'M3', 'As stated per line', 'Make and origin as stated against each line', '{}', false, NULL, 3, false, 'awaiting', now()),
  ('vat', 'T1', 'VAT extra', 'Prices exclude VAT; VAT at 5% where applicable', '{}', true, NULL, 1, true, 'awaiting', now()),
  ('vat', 'T2', 'Zero-rated export', 'Zero-rated export; VAT 0%', '{}', true, NULL, 2, false, 'awaiting', now()),
  ('documents', 'DOC1', 'Mill test certificates', 'Mill test certificates to EN 10204 3.1', '{}', false, NULL, 1, true, 'awaiting', now()),
  ('documents', 'DOC2', 'Certificate of origin', 'Certificate of origin', '{}', false, NULL, 2, false, 'awaiting', now()),
  ('documents', 'DOC3', 'Shipping documents', 'Packing list and commercial invoice', '{}', false, NULL, 3, false, 'awaiting', now()),
  ('inspection', 'I1', 'Third-party inspection', 'Third-party inspection at works, at the client''s cost', '{}', false, NULL, 1, false, 'awaiting', now()),
  ('inspection', 'I2', 'Inspection before dispatch', 'Visual and dimensional inspection by Indus before dispatch', '{}', false, NULL, 2, true, 'awaiting', now()),
  ('inspection', 'I3', 'Witness testing', 'Witness testing by prior arrangement', '{}', false, NULL, 3, false, 'awaiting', now()),
  ('warranty', 'W1', '12 / 18 months', '12 months from delivery or 18 months from dispatch, whichever is earlier', '{}', true, NULL, 1, true, 'awaiting', now()),
  ('warranty', 'W2', 'Manufacturer''s warranty', 'As per the manufacturer''s standard warranty', '{}', true, NULL, 2, false, 'awaiting', now()),
  ('packing', 'K1', 'Export packing', 'Standard export packing', '{}', false, NULL, 1, true, 'awaiting', now()),
  ('packing', 'K2', 'Wooden cases', 'Seaworthy wooden cases', '{}', false, NULL, 2, false, 'awaiting', now()),
  ('disclaimer', 'X1', 'Standard disclaimer', 'Material is supplied as offered; any change after order is subject to confirmation', '{}', true, NULL, 1, true, 'awaiting', now())
ON CONFLICT ("code") DO NOTHING;

INSERT INTO ops.terms_preset ("name", "description", "isDefaultForNewClient", "position", "signoffStatus")
VALUES
  ('GCC standard', 'Ex-Dubai · 2 weeks · China with MTC/CoC', true, 1, 'awaiting'),
  ('Oil & gas · TPI', 'DAP site · TPI at works · 3.1 MTC', false, 2, 'awaiting'),
  ('Export · USD', 'CIF port · zero-rated VAT', false, 3, 'awaiting'),
  ('Advance 100%', 'Ex-Dubai · advance with order', false, 4, 'awaiting')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO ops.terms_preset_clause ("presetId", "clauseId", "variableValues", "position")
SELECT p.id, c.id, v.vals::jsonb, v.pos
FROM (VALUES
  ('GCC standard', 'P1', '{}', 1), ('GCC standard', 'D1', '{}', 2), ('GCC standard', 'L1', '{"weeks": 2}', 3),
  ('GCC standard', 'V1', '{"valid_weeks": 4}', 4), ('GCC standard', 'M2', '{}', 5), ('GCC standard', 'T1', '{}', 6),
  ('GCC standard', 'DOC1', '{}', 7), ('GCC standard', 'I2', '{}', 8), ('GCC standard', 'W1', '{}', 9),
  ('GCC standard', 'K1', '{}', 10), ('GCC standard', 'X1', '{}', 11),
  ('Oil & gas · TPI', 'P2', '{"advance_pct": 30, "balance_days": 60}', 1), ('Oil & gas · TPI', 'D2', '{"incoterm": "DAP"}', 2),
  ('Oil & gas · TPI', 'L1', '{"weeks": 4}', 3), ('Oil & gas · TPI', 'V1', '{"valid_weeks": 4}', 4),
  ('Oil & gas · TPI', 'T1', '{}', 5), ('Oil & gas · TPI', 'DOC1', '{}', 6), ('Oil & gas · TPI', 'I1', '{}', 7),
  ('Oil & gas · TPI', 'W1', '{}', 8), ('Oil & gas · TPI', 'K2', '{}', 9), ('Oil & gas · TPI', 'X1', '{}', 10),
  ('Export · USD', 'P4', '{"days": 30}', 1), ('Export · USD', 'D3', '{}', 2), ('Export · USD', 'L1', '{"weeks": 3}', 3),
  ('Export · USD', 'V1', '{"valid_weeks": 4}', 4), ('Export · USD', 'T2', '{}', 5), ('Export · USD', 'DOC2', '{}', 6),
  ('Export · USD', 'DOC3', '{}', 7), ('Export · USD', 'W2', '{}', 8), ('Export · USD', 'K2', '{}', 9),
  ('Advance 100%', 'P3', '{}', 1), ('Advance 100%', 'D1', '{}', 2), ('Advance 100%', 'L2', '{}', 3),
  ('Advance 100%', 'V1', '{"valid_weeks": 2}', 4), ('Advance 100%', 'T1', '{}', 5), ('Advance 100%', 'X1', '{}', 6)
) AS v(preset, code, vals, pos)
JOIN ops.terms_preset p ON p.name = v.preset
JOIN ops.terms_clause c ON c.code = v.code
ON CONFLICT ("presetId", "clauseId") DO NOTHING;

COMMIT;
