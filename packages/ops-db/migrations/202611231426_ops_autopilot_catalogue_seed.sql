-- Indus Operations · S03-T06 · the Autopilot catalogue (S03 migration 5)
--
-- The ONLY catalogue seed (ADR-10, architecture §4.6, apps/ops/CLAUDE.md §17): the 32 Autopilot
-- rows of board 98 (#1–#32, position = catalogue number) and the 34 system actions of §4.6
-- (positions 101+), then one autopilot_setting per row at the Careful default, the launch mode.
-- Keys are canonical for every later sprint; a later key arrives with one INSERT … ON CONFLICT DO
-- NOTHING in that sprint's <ts>_ops_sNN_action_defs.sql and in ACTION_KEYS
-- (packages/ops-core/src/autopilot/keys.ts) in the same commit. autopilot-catalogue.guard.test.ts
-- parses every migration that inserts into autopilot_action_def and checks it against the code.
--
-- Levels per mode (Careful / Balanced / Hands-off): Balanced = the catalogue's Default column
-- (guides/assistant-actions.md); Careful = board 83 ("drafts everything; sends nothing without you;
-- except supplier reminders you have approved once; files and labels mail on its own"); Hands-off =
-- board 83 ("sends RFQs to known suppliers on its own; chases and relays questions on its own; still
-- asks for quotations, supplier POs and anything new"). Guardrails still force review in any mode.
--
-- Locks (lockedLevel; FIXED_RULES and LOCKED_LEVELS in ops-core/autopilot/levels.ts):
--   #20 send_quotation and #28 supplier_pos Draft and ask, #32 supplier_payments Never (fixed rules);
--   decide_equivalent, claim_draft, cancel_reissue_document, revert_change Draft and ask;
--   bank_change_alert Do and tell (a safety check, not configurable).
-- Caps (maxLevel draft_and_ask; MAX_LEVELS): the priced client sends #26 order_ack_proforma,
--   #27 advance_reminders, #31 payment_reminders (coverage gap G2; #20 is locked), and the client
--   sends regret_client and correction_email (§4.6, Appendix F.3). They may be lowered, never raised.
-- Not configurable: import_history, update_fx_rates, revert_change, bank_change_alert.
--
-- Copy: label = the catalogue's Action column (a plain label for system keys); description =
-- "Reads … · Produces …" from the catalogue (the "What it does" text for system keys); ruleText =
-- "Rule on the board". Row #4 drops WhatsApp (open item 4); row #11 states the USD 5 per-enquiry
-- research cap (C14), not the catalogue's USD 2. Every row is 'awaiting' sign-off (ADR-28, P04).
-- chase_suppliers runs Do and tell under Careful only after the first approved chaser:
-- rules {"firstNeedsApproval":true}.
--
-- ops.locked_level_guard() (S00) checks every autopilot_setting row inserted here against its
-- definition. Idempotent: ON CONFLICT DO NOTHING, so a re-run never resets a level the Owner has
-- since changed.

BEGIN;

INSERT INTO "ops"."autopilot_action_def"
  ("key", "group", "label", "description", "ruleText", "position", "configurable", "lockedLevel", "maxLevel",
   "defaultCareful", "defaultBalanced", "defaultHandsOff", "minutesSaved", "originBoard", "signoffStatus")
VALUES
  ('classify_mail', 'mail', 'Classify incoming mail', 'Reads new Gmail message · Produces class: client, supplier, PO or other', NULL, 1, true, NULL, NULL, 'do_quietly', 'do_quietly', 'do_quietly', 0.5, NULL, 'awaiting'),
  ('link_mail', 'mail', 'Link mail to its record', 'Reads message, ENQ- and IH-RFQ refs, thread · Produces link from the message to its record', 'Matches on ENQ- and IH-RFQ refs; unsure goes to Mail', 2, true, NULL, NULL, 'do_quietly', 'do_quietly', 'do_quietly', NULL, NULL, 'awaiting'),
  ('label_gmail', 'mail', 'Label in Gmail', 'Reads classification and link · Produces Indus/… Gmail labels', 'Labels only; never deletes or archives', 3, true, NULL, NULL, 'do_quietly', 'do_quietly', 'do_quietly', NULL, NULL, 'awaiting'),
  ('create_enquiry', 'enquiries', 'Create enquiry from email', 'Reads client email, forwarded chain, website form, call-back · Produces enquiry ENQ-YYYY-NNNN', 'Website form and call-back too', 4, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, '47', 'awaiting'),
  ('extract_lines', 'enquiries', 'Extract lines', 'Reads attachments, email body, spreadsheet · Produces lines with quantity, unit, part match and confidence', 'Unsure lines ask you', 5, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', 6, '15', 'awaiting'),
  ('ack_email', 'enquiries', 'Acknowledge client', 'Reads new enquiry · Produces acknowledgement email from sales@ in the thread', 'From sales@ in the client''s thread', 6, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '48', 'awaiting'),
  ('ask_client_questions', 'enquiries', 'Ask client clarifying questions', 'Reads held lines · Produces question email to the client', 'Held lines only; the rest go to suppliers', 7, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '62', 'awaiting'),
  ('remind_client_questions', 'enquiries', 'Remind client about open questions', 'Reads unanswered questions · Produces reminder email', 'Day 2 without a reply', 8, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '62', 'awaiting'),
  ('group_lines', 'sourcing', 'Group lines by trade', 'Reads lines and part data · Produces trade groups, one IH-RFQ ref each', 'One IH-RFQ ref per trade group', 9, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, '06', 'awaiting'),
  ('pick_suppliers', 'sourcing', 'Pick known suppliers', 'Reads line cards, past quotes, tiers · Produces supplier shortlist per group', 'From line cards and past quotes', 10, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'do_and_tell', NULL, '06', 'awaiting'),
  ('research_suppliers', 'sourcing', 'Research new suppliers', 'Reads coverage gaps and the web · Produces candidate cards with sources and A/B/C priority', 'Cap USD 5 per enquiry; new suppliers always ask before first email', 11, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('send_supplier_rfqs', 'sourcing', 'Send supplier RFQs', 'Reads groups, shortlist, RFQ template · Produces RFQ emails from purchase@, scheduled to supplier-local time', 'Identifier check on every RFQ', 12, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'do_and_tell', 12, '63', 'awaiting'),
  ('chase_suppliers', 'sourcing', 'Chase suppliers', 'Reads RFQ status and reply-by date · Produces chaser emails', 'After the first approved chaser per RFQ; 3 max', 13, true, NULL, NULL, 'do_and_tell', 'do_and_tell', 'do_and_tell', 3, '30', 'awaiting'),
  ('relay_supplier_questions', 'sourcing', 'Relay supplier questions to client', 'Reads supplier questions · Produces one bundled question email, names removed', 'Names removed; bundled per enquiry', 14, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'do_and_tell', NULL, '64', 'awaiting'),
  ('share_client_answers', 'sourcing', 'Share client answers with suppliers', 'Reads client answer · Produces the same text to every supplier on the line', 'Same text to every supplier on the line', 15, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, '64', 'awaiting'),
  ('remind_supplier_documents', 'sourcing', 'Remind suppliers of expiring documents', 'Reads supplier documents · Produces reminder emails', 'Licences and approvals, 30 days ahead', 16, true, NULL, NULL, 'draft_and_ask', 'do_quietly', 'do_quietly', NULL, '52', 'awaiting'),
  ('capture_supplier_quotes', 'quotes', 'Capture supplier quotes', 'Reads supplier reply and attachments · Produces supplier quote and lines with source highlights', 'Exceptions ask: substitute, partial, unclear currency', 17, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', 8, '18', 'awaiting'),
  ('recommend_sources', 'quotes', 'Recommend sources', 'Reads captured quotes and landed cost · Produces scenario cards and a per-line pick', 'Shown on Compare; you choose', 18, true, NULL, NULL, 'suggest', 'suggest', 'suggest', NULL, '08', 'awaiting'),
  ('price_quotation', 'quotes', 'Price the quotation', 'Reads picks, history, client price history · Produces rate and margin per line', 'Below 12% always asks', 19, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '09', 'awaiting'),
  ('send_quotation', 'quotes', 'Send quotation', 'Reads priced lines and terms · Produces INDUS/Q PDF and cover email from sales@', 'Client prices are never sent without your approval', 20, true, 'draft_and_ask', NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '10', 'awaiting'),
  ('follow_up_reminders', 'after_sending', 'Follow-up reminders to you', 'Reads sent quotations and client stage · Produces reminders', 'Cadence per client stage', 21, true, NULL, NULL, 'do_and_tell', 'do_and_tell', 'do_and_tell', NULL, '66', 'awaiting'),
  ('follow_up_emails', 'after_sending', 'Follow-up emails to client', 'Reads sent quotations and client stage · Produces follow-up email', 'Never about quotation validity', 22, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '67', 'awaiting'),
  ('ask_price_hold', 'after_sending', 'Ask suppliers to hold prices', 'Reads supplier validity against the client decision · Produces hold request email', 'When a supplier price lapses before the client decides', 23, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'do_and_tell', NULL, '65', 'awaiting'),
  ('recognise_client_po', 'orders', 'Recognise client PO', 'Reads inbound mail and attachment · Produces PO linked to its quotation', 'Kept apart from new enquiries', 24, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, '68', 'awaiting'),
  ('ack_po_receipt', 'orders', 'Acknowledge PO receipt to client', 'Reads PO · Produces short receipt email', 'Short receipt only; no terms', 25, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '68', 'awaiting'),
  ('order_ack_proforma', 'orders', 'Order acknowledgement and proforma', 'Reads PO check and terms presets · Produces INDUS/OA, INDUS/PI and email', 'Terms from presets', 26, true, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '38', 'awaiting'),
  ('advance_reminders', 'orders', 'Advance payment reminders', 'Reads PI and payments from Zoho · Produces reminder emails', 'Day 3, 7, 14 after the proforma', 27, true, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '40', 'awaiting'),
  ('supplier_pos', 'orders', 'Supplier POs', 'Reads order, supplier offer, line card · Produces INDUS/PO to each supplier from purchase@', 'A supplier PO commits money; it always needs your approval', 28, true, 'draft_and_ask', NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '70', 'awaiting'),
  ('production_chasing', 'orders', 'Supplier chasing during production', 'Reads supplier POs and ready dates · Produces status asks', 'Weekly status ask; slips over 3 days ask', 29, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, '41', 'awaiting'),
  ('document_checklist_reminders', 'orders', 'Document checklist reminders', 'Reads shipping checklist · Produces reminders to you', 'To you, in Today', 30, true, NULL, NULL, 'do_quietly', 'do_quietly', 'do_quietly', NULL, '44', 'awaiting'),
  ('payment_reminders', 'money', 'Payment reminders to clients', 'Reads invoices from Zoho · Produces reminder emails', 'Due date, +7, +14', 31, true, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '46', 'awaiting'),
  ('supplier_payments', 'money', 'Supplier payments', 'Reads PO, proforma, inspection, bank details · Produces payment request with every check', 'The Assistant prepares and checks; you release at the bank', 32, true, 'never', NULL, 'never', 'never', 'never', NULL, '61', 'awaiting'),
  ('qualify_enquiry', 'enquiries', 'Qualify an enquiry', 'Qualification card: quote, ask the client first, quote in part or regret', NULL, 101, true, NULL, NULL, 'suggest', 'suggest', 'suggest', NULL, NULL, 'awaiting'),
  ('ack_website', 'enquiries', 'Acknowledge a website enquiry', 'Visitor acknowledgement from the system sender', 'System sender; no price or terms', 102, true, NULL, NULL, 'do_and_tell', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('regret_client', 'enquiries', 'Regret to client', 'Whole or line-level regret to the client', 'Never above Draft and ask', 103, true, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('client_line_give_up', 'enquiries', 'Give up a to-follow line', 'A line marked to follow reaches its give-up date (10 working days)', NULL, 104, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('decide_equivalent', 'sourcing', 'Decide an equivalent part', 'An equivalent or substitute part offered for a line', 'Always asks', 105, true, 'draft_and_ask', NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('promote_supplier', 'sourcing', 'Promote a supplier', 'Trial to Approved after 3 good POs, with a checklist', NULL, 106, true, NULL, NULL, 'suggest', 'suggest', 'suggest', NULL, NULL, 'awaiting'),
  ('withdraw_rfq', 'sourcing', 'Withdraw an RFQ', 'Withdraw an RFQ from the affected suppliers only', NULL, 107, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('rfq_change_followup', 'sourcing', 'Send an RFQ change', 'Send an RFQ change to the affected suppliers', NULL, 108, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('negotiate_supplier_price', 'sourcing', 'Ask a supplier for a better price', 'Price ask to a supplier', NULL, 109, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('ask_open_copy', 'sourcing', 'Ask for a readable copy', 'Password-protected file, unclear currency or unreadable copy', NULL, 110, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('resend_alternate_contact', 'sourcing', 'Resend to the alternate contact', 'Resend to the alternate contact named in an auto-reply', NULL, 111, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('capture_supplier_ack_proforma', 'orders', 'Match supplier acknowledgements', 'Match supplier acknowledgements and proformas to supplier POs', NULL, 112, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('request_freight_quotes', 'orders', 'Request freight quotes', 'Freight RFQs to shipping agents', NULL, 113, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('capture_freight_quote', 'orders', 'Capture a freight quote', 'Capture a shipping agent''s freight quote', NULL, 114, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('propose_split_shipment', 'orders', 'Propose a split shipment', 'Split a shipment when it protects the client date', NULL, 115, true, NULL, NULL, 'suggest', 'suggest', 'suggest', NULL, NULL, 'awaiting'),
  ('capture_pod', 'orders', 'Capture proof of delivery', 'Signed proof of delivery', NULL, 116, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('check_certificates', 'orders', 'Check inspection documents', 'Inspection documents against the requirements', 'Internal check', 117, true, NULL, NULL, 'do_and_tell', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('claim_draft', 'orders', 'Draft a claim', 'Claim to a supplier or carrier', 'Always asks', 118, true, 'draft_and_ask', NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('cancel_reissue_document', 'orders', 'Cancel and reissue a document', 'Cancel and reissue an issued document', 'Always asks', 119, true, 'draft_and_ask', NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('tender_plan', 'enquiries', 'Plan a tender', 'Plan worked back from the closing time', NULL, 120, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('tender_requirements', 'enquiries', 'Extract tender requirements', 'Requirements extracted from the tender documents', NULL, 121, true, NULL, NULL, 'draft_and_ask', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('tender_query_draft', 'enquiries', 'Draft a technical query', 'Technical query TQ-nn for a requirement gap', NULL, 122, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('approved_makes_check', 'enquiries', 'Check approved makes', 'Approved-make list against the chosen sources', 'Internal check', 123, true, NULL, NULL, 'do_and_tell', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('bid_pack', 'enquiries', 'Assemble the bid pack', 'Assemble the bid pack when its plan step is due', NULL, 124, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('month_pack', 'money', 'Prepare the month pack', 'Month-close pack for the accountant', NULL, 125, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('learn_from_sent_mail', 'system', 'Learn from sent mail', 'Learn writing style from sent mail', 'Opt-in', 126, true, NULL, NULL, 'off', 'off', 'off', NULL, NULL, 'awaiting'),
  ('catalogue_suggestion', 'system', 'Suggest a catalogue part', 'Suggest a part for the website catalogue', NULL, 127, true, NULL, NULL, 'suggest', 'suggest', 'suggest', NULL, NULL, 'awaiting'),
  ('import_history', 'system', 'Import history', 'History import runner', 'No external effect', 128, false, NULL, NULL, 'do_and_tell', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('update_fx_rates', 'system', 'Update exchange rates', 'The exchange-rate job''s log identity', NULL, 129, false, NULL, NULL, 'do_quietly', 'do_quietly', 'do_quietly', NULL, NULL, 'awaiting'),
  ('link_move_merge', 'system', 'Link, move or merge', 'Person-initiated link, move or merge with a 5-minute undo', NULL, 130, true, NULL, NULL, 'suggest', 'suggest', 'suggest', NULL, NULL, 'awaiting'),
  ('revert_change', 'system', 'Revert a change', 'Revert an internal change after its undo window', 'Always asks', 131, false, 'draft_and_ask', NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('correction_email', 'system', 'Draft a correction email', 'Correction for something that has left the building', 'Always Draft and ask', 132, true, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, NULL, 'awaiting'),
  ('bank_change_alert', 'money', 'Bank detail change alert', 'Supplier bank-detail change: payments blocked, 24 h cooling-off', 'Safety check; not configurable', 133, false, 'do_and_tell', NULL, 'do_and_tell', 'do_and_tell', 'do_and_tell', NULL, NULL, 'awaiting'),
  ('log_call_follow_up', 'enquiries', 'Suggest logging a call', 'Suggest logging a call when a follow-up is due', NULL, 134, true, NULL, NULL, 'suggest', 'suggest', 'suggest', NULL, NULL, 'awaiting')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "ops"."autopilot_setting" ("actionKey", "level", "rules", "version", "updatedAt")
VALUES
  ('classify_mail', 'do_quietly', '{}', 0, now()),
  ('link_mail', 'do_quietly', '{}', 0, now()),
  ('label_gmail', 'do_quietly', '{}', 0, now()),
  ('create_enquiry', 'draft_and_ask', '{}', 0, now()),
  ('extract_lines', 'draft_and_ask', '{}', 0, now()),
  ('ack_email', 'draft_and_ask', '{}', 0, now()),
  ('ask_client_questions', 'draft_and_ask', '{}', 0, now()),
  ('remind_client_questions', 'draft_and_ask', '{}', 0, now()),
  ('group_lines', 'draft_and_ask', '{}', 0, now()),
  ('pick_suppliers', 'draft_and_ask', '{}', 0, now()),
  ('research_suppliers', 'draft_and_ask', '{}', 0, now()),
  ('send_supplier_rfqs', 'draft_and_ask', '{}', 0, now()),
  ('chase_suppliers', 'do_and_tell', '{"firstNeedsApproval":true}', 0, now()),
  ('relay_supplier_questions', 'draft_and_ask', '{}', 0, now()),
  ('share_client_answers', 'draft_and_ask', '{}', 0, now()),
  ('remind_supplier_documents', 'draft_and_ask', '{}', 0, now()),
  ('capture_supplier_quotes', 'draft_and_ask', '{}', 0, now()),
  ('recommend_sources', 'suggest', '{}', 0, now()),
  ('price_quotation', 'draft_and_ask', '{}', 0, now()),
  ('send_quotation', 'draft_and_ask', '{}', 0, now()),
  ('follow_up_reminders', 'do_and_tell', '{}', 0, now()),
  ('follow_up_emails', 'draft_and_ask', '{}', 0, now()),
  ('ask_price_hold', 'draft_and_ask', '{}', 0, now()),
  ('recognise_client_po', 'draft_and_ask', '{}', 0, now()),
  ('ack_po_receipt', 'draft_and_ask', '{}', 0, now()),
  ('order_ack_proforma', 'draft_and_ask', '{}', 0, now()),
  ('advance_reminders', 'draft_and_ask', '{}', 0, now()),
  ('supplier_pos', 'draft_and_ask', '{}', 0, now()),
  ('production_chasing', 'draft_and_ask', '{}', 0, now()),
  ('document_checklist_reminders', 'do_quietly', '{}', 0, now()),
  ('payment_reminders', 'draft_and_ask', '{}', 0, now()),
  ('supplier_payments', 'never', '{}', 0, now()),
  ('qualify_enquiry', 'suggest', '{}', 0, now()),
  ('ack_website', 'do_and_tell', '{}', 0, now()),
  ('regret_client', 'draft_and_ask', '{}', 0, now()),
  ('client_line_give_up', 'draft_and_ask', '{}', 0, now()),
  ('decide_equivalent', 'draft_and_ask', '{}', 0, now()),
  ('promote_supplier', 'suggest', '{}', 0, now()),
  ('withdraw_rfq', 'draft_and_ask', '{}', 0, now()),
  ('rfq_change_followup', 'draft_and_ask', '{}', 0, now()),
  ('negotiate_supplier_price', 'draft_and_ask', '{}', 0, now()),
  ('ask_open_copy', 'draft_and_ask', '{}', 0, now()),
  ('resend_alternate_contact', 'draft_and_ask', '{}', 0, now()),
  ('capture_supplier_ack_proforma', 'draft_and_ask', '{}', 0, now()),
  ('request_freight_quotes', 'draft_and_ask', '{}', 0, now()),
  ('capture_freight_quote', 'draft_and_ask', '{}', 0, now()),
  ('propose_split_shipment', 'suggest', '{}', 0, now()),
  ('capture_pod', 'draft_and_ask', '{}', 0, now()),
  ('check_certificates', 'do_and_tell', '{}', 0, now()),
  ('claim_draft', 'draft_and_ask', '{}', 0, now()),
  ('cancel_reissue_document', 'draft_and_ask', '{}', 0, now()),
  ('tender_plan', 'draft_and_ask', '{}', 0, now()),
  ('tender_requirements', 'draft_and_ask', '{}', 0, now()),
  ('tender_query_draft', 'draft_and_ask', '{}', 0, now()),
  ('approved_makes_check', 'do_and_tell', '{}', 0, now()),
  ('bid_pack', 'draft_and_ask', '{}', 0, now()),
  ('month_pack', 'draft_and_ask', '{}', 0, now()),
  ('learn_from_sent_mail', 'off', '{}', 0, now()),
  ('catalogue_suggestion', 'suggest', '{}', 0, now()),
  ('import_history', 'do_and_tell', '{}', 0, now()),
  ('update_fx_rates', 'do_quietly', '{}', 0, now()),
  ('link_move_merge', 'suggest', '{}', 0, now()),
  ('revert_change', 'draft_and_ask', '{}', 0, now()),
  ('correction_email', 'draft_and_ask', '{}', 0, now()),
  ('bank_change_alert', 'do_and_tell', '{}', 0, now()),
  ('log_call_follow_up', 'suggest', '{}', 0, now())
ON CONFLICT ("actionKey") DO NOTHING;

-- Every definition has its setting (ops.locked_level_guard() already refused any setting that
-- breaks its row's lock or cap; this catches a definition left without a setting).
DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(d."key", ', ' ORDER BY d."position") INTO v_missing
    FROM ops.autopilot_action_def d
    LEFT JOIN ops.autopilot_setting s ON s."actionKey" = d."key"
   WHERE s."actionKey" IS NULL;
  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'autopilot actions without a setting: %', v_missing;
  END IF;
END $$;

COMMIT;
