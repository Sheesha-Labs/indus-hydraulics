-- Indus Operations · migration 8 of 8 · structural reference rows
--
-- Rows that constraints and code depend on: structure, not content (06 §11 row 8 as amended by
-- S00-T02). Content (email templates, terms, trades, cadences, help, holidays, HS codes) is
-- written by src/seed.ts and edited in Settings afterwards; it never ships in a migration.
--
--   currency          the 13 currencies the console may quote, buy or report in.
--   number_sequence   one row per document family (06 §5.3, architecture §4.5 and C6). Patterns
--                     are data. EVERY sequence is unseeded (seededAt NULL), so allocate_number
--                     refuses it until an Owner confirms a seed with evidence in Settings ›
--                     Numbering, except assistant_action: its refs (A-yy-mm-dd-nnnn) restart
--                     every day and continue nothing, so it is seeded here as structural.
--                     INDUS/Q stays unseeded until the cutover batch (C4); ENQ- is seeded at
--                     mail-intake go-live (C5).
--   guardrail         one row per GuardrailKind (06 §8.1), params {} and enabled false: the
--                     values (thresholds, caps, hours) arrive with the sprints that enforce them.
--   sending_rule      skeleton rows for the mail types on board 87, by mailbox ROLE only. No
--                     addresses and no signature users here; Settings › Sending fills them.
--
-- Not seeded here (moved to S03-T06): autopilot_action_def and autopilot_setting.
--
-- Idempotent: every INSERT is ON CONFLICT DO NOTHING, so a re-run never overwrites a value
-- someone has since edited in Settings.

BEGIN;

INSERT INTO ops.currency ("code", "name", "minorUnits", "active") VALUES
  ('AED', 'UAE dirham', 2, true),
  ('USD', 'US dollar', 2, true),
  ('EUR', 'Euro', 2, true),
  ('GBP', 'Pound sterling', 2, true),
  ('JPY', 'Japanese yen', 0, true),
  ('CNY', 'Chinese yuan', 2, true),
  ('INR', 'Indian rupee', 2, true),
  ('SAR', 'Saudi riyal', 2, true),
  ('OMR', 'Omani rial', 3, true),
  ('KWD', 'Kuwaiti dinar', 3, true),
  ('QAR', 'Qatari riyal', 2, true),
  ('BHD', 'Bahraini dinar', 3, true),
  ('CHF', 'Swiss franc', 2, true)
ON CONFLICT DO NOTHING;

INSERT INTO ops.number_sequence
  ("key", "label", "pattern", "revisionPattern", "scopeKind", "padTo", "seededAt", "seedEvidence", "updatedAt")
VALUES
  ('quotation',        'Quotation',             'INDUS/Q{n}',              '-R{n}', 'global', 0, NULL, NULL, now()),
  ('enquiry',          'Enquiry',               'ENQ-{yyyy}-{nnnn}',       NULL,    'year',   0, NULL, NULL, now()),
  ('supplier_rfq',     'Supplier RFQ',          'IH-RFQ-{yymm}-P{nn}',     NULL,    'month',  0, NULL, NULL, now()),
  ('order',            'Order',                 'SO-{enq4}',               '-B',    'parent', 0, NULL, NULL, now()),
  ('supplier_po',      'Supplier PO',           'INDUS/PO{n}',             '-R{n}', 'global', 0, NULL, NULL, now()),
  ('order_ack',        'Order acknowledgement', 'INDUS/OA{n}',             '-R{n}', 'global', 0, NULL, NULL, now()),
  ('proforma',         'Proforma invoice',      'INDUS/PI{n}',             '-R{n}', 'global', 0, NULL, NULL, now()),
  ('tax_invoice',      'Tax invoice',           'INDUS/INV{n}',            NULL,    'global', 0, NULL, NULL, now()),
  ('credit_note',      'Credit note',           'INDUS/CN{n}',             NULL,    'global', 0, NULL, NULL, now()),
  ('delivery_note',    'Delivery note',         'INDUS/DN{n}',             '-{nn}', 'global', 0, NULL, NULL, now()),
  ('packing_list',     'Packing list',          'INDUS/PL{n}',             '-{nn}', 'global', 0, NULL, NULL, now()),
  ('tender_query',     'Tender query',          'TQ-{nn}',                 NULL,    'parent', 0, NULL, NULL, now()),
  ('lead',             'Lead',                  'L-{nnnn}',                NULL,    'global', 0, NULL, NULL, now()),
  ('assistant_action', 'Assistant action',      'A-{yy}-{mm}-{dd}-{nnnn}', NULL,    'day',    0,
   now(), '{"reason": "structural"}'::jsonb, now())
ON CONFLICT DO NOTHING;

INSERT INTO ops.guardrail ("key", "kind", "label", "enabled", "fixed", "params", "updatedAt") VALUES
  ('value_threshold',     'value_threshold',     'Value threshold',                  false, false, '{}', now()),
  ('first_contact',       'first_contact',       'First contact with a supplier',    false, false, '{}', now()),
  ('margin_floor',        'margin_floor',        'Margin floor',                     false, false, '{}', now()),
  ('credit_hold',         'credit_hold',         'Credit hold',                      false, false, '{}', now()),
  ('working_hours',       'working_hours',       'Working hours',                    false, false, '{}', now()),
  ('holiday_calendar',    'holiday_calendar',    'Holiday calendar',                 false, false, '{}', now()),
  ('daily_send_cap',      'daily_send_cap',      'Daily send cap per mailbox',       false, false, '{}', now()),
  ('fixed_client_prices', 'fixed_client_prices', 'Client prices always need you',    false, true,  '{}', now()),
  ('fixed_no_money',      'fixed_no_money',      'The Assistant never moves money',  false, true,  '{}', now()),
  ('ai_budget',           'ai_budget',           'AI budget',                        false, false, '{}', now()),
  ('research_cap',        'research_cap',        'Research cap per enquiry',         false, false, '{}', now())
ON CONFLICT DO NOTHING;

-- Board 87, by role: client = the sales mailbox, supplier = the purchase mailbox.
-- ccSpecial 'accounts_contact' = the client's accounts contact on invoices and reminders.
INSERT INTO ops.sending_rule ("kind", "fromRole", "ccRole", "ccSpecial", "threadMode", "updatedAt") VALUES
  ('client_acknowledgement',   'client',   NULL,     NULL,               'client_thread',            now()),
  ('client_questions',         'client',   NULL,     NULL,               'client_thread',            now()),
  ('client_question_reminder', 'client',   NULL,     NULL,               'client_thread',            now()),
  ('quotation',                'client',   NULL,     NULL,               'client_thread',            now()),
  ('quotation_correction',     'client',   NULL,     NULL,               'client_thread',            now()),
  ('follow_up',                'client',   NULL,     NULL,               'client_thread',            now()),
  ('order_acknowledgement',    'client',   NULL,     NULL,               'client_thread',            now()),
  ('invoice',                  'client',   NULL,     'accounts_contact', 'client_thread',            now()),
  ('payment_reminder',         'client',   NULL,     'accounts_contact', 'client_thread',            now()),
  ('supplier_rfq',             'supplier', 'client', NULL,               'new_thread_per_recipient', now()),
  ('supplier_chaser',          'supplier', 'client', NULL,               'rfq_thread',               now()),
  ('supplier_question_relay',  'supplier', 'client', NULL,               'rfq_thread',               now()),
  ('supplier_po',              'supplier', 'client', NULL,               'new_thread_per_recipient', now()),
  ('forwarder_request',        'supplier', NULL,     NULL,               'new_thread',               now())
ON CONFLICT DO NOTHING;

COMMIT;
