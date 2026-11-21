-- Indus Operations · migration 3 of 8 · enums and tables
--
-- Base DDL generated with (no database connection):
--   (cd packages/ops-db && bunx prisma migrate diff --from-empty \
--      --to-schema-datamodel prisma/schema.prisma --script)
-- from packages/ops-db/prisma/schema.prisma as of S00-T02: 165 enum types, 144 tables,
-- 231 indexes, 224 foreign keys. Then hand-edited as listed below, so the next
-- `migrate diff` can be reconciled against this file line by line.
--
-- HAND EDITS (06-map-schema.md §11 row 3)
--   1. Dropped Prisma's `CREATE SCHEMA IF NOT EXISTS "ops"`: migration 1 creates the schema
--      with AUTHORIZATION postgres.
--   2. Idempotency: every CREATE TYPE and every ADD CONSTRAINT ... FOREIGN KEY is wrapped in
--      a DO block that ignores duplicate_object; CREATE TABLE / CREATE INDEX use IF NOT EXISTS.
--   3. `"id" UUID NOT NULL` gets `DEFAULT gen_random_uuid()` on all 121 tables with a uuid
--      id, so raw SQL inserts (seeds, imports, triggers) work. Prisma still writes UUIDv7.
--   4. Each "searchTsv" becomes `tsvector GENERATED ALWAYS AS (...) STORED`:
--        mail_message    subject A · fromAddress + fromName B · bodyText C
--        company         name + legalName + aliases A · primaryDomain + domains B
--        part            partNo + partNoNorm A · description B  (aliases live in part_alias,
--                        which a generated column cannot read; the matcher queries part_alias)
--        enquiry         ref + clientRef A · title B
--        quotation       number, INDUS/Q<base>, Q<base>, <base> and clientRef A
--        order           ref + clientPoNumber A   (not listed in §11; same pattern as enquiry)
--        document_text   text (english, unweighted)
--        search_document refs A · partNosNorm A · title B · body C   (§7.1)
--      Identifiers and names use the 'simple' configuration (no stemming); prose uses 'english'.
--   5. Added ops.immutable_array_to_string(text[], text) before the tables. array_to_string()
--      is STABLE in Postgres, and a generated column (and the trigram index in migration 4)
--      needs an IMMUTABLE expression. For text[] the result cannot vary, so the wrapper is safe.
--   6. 28 currency foreign keys added: every Char(3) column named *currency / *Currency /
--      *Ccy now REFERENCES ops.currency(code) ON DELETE RESTRICT ON UPDATE CASCADE.
--      (ops.currency.code is the key itself; user.initials is VarChar(3), not a currency.)
--   7. 46 actor foreign keys added: every *ById uuid column that Prisma does not model as a
--      relation now REFERENCES ops."user"(id) ON DELETE RESTRICT ON UPDATE CASCADE. Users are
--      never deleted (status 'removed'), so RESTRICT never fires in practice and no SET NULL can
--      turn into an UPDATE of an append-only table.
--
-- Totals after this file: 165 enums, 144 tables, 231 indexes (+ primary keys),
-- 298 foreign keys. Migration 4 adds CHECKs, partial uniques and GIN indexes.

BEGIN;

-- Hand edit 5: IMMUTABLE wrapper for generated columns and expression indexes.
CREATE OR REPLACE FUNCTION ops.immutable_array_to_string(p_values text[], p_sep text)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  PARALLEL SAFE
  SET search_path = pg_catalog
AS $$ SELECT array_to_string(p_values, p_sep) $$;
REVOKE ALL ON FUNCTION ops.immutable_array_to_string(text[], text) FROM PUBLIC;

DO $$ BEGIN
  CREATE TYPE "ops"."UserRole" AS ENUM ('owner', 'helper');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."UserStatus" AS ENUM ('invited', 'active', 'suspended', 'removed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SignInMethod" AS ENUM ('google', 'password');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."AuthEventKind" AS ENUM ('sign_in', 'sign_in_failed', 'locked', 'unlocked', 'sign_out', 'session_expired', 'session_revoked', 'password_set', 'password_reset', 'totp_enabled', 'backup_code_used', 'invite_sent', 'invite_accepted', 'invite_revoked', 'ownership_transferred');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."MailboxRole" AS ENUM ('client', 'supplier', 'read_only', 'personal');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."MailboxStatus" AS ENUM ('connecting', 'backfilling', 'live', 'behind', 'limit_reached', 'backfill_paused', 'paused', 'disconnected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."MailDirection" AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."MailClass" AS ENUM ('unclassified', 'client_enquiry', 'client_reply', 'client_po', 'supplier_quote', 'supplier_question', 'supplier_documents', 'supplier_price_list', 'supplier_other', 'freight', 'payment', 'auto_reply', 'bounce', 'phishing', 'not_business', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."MailHandledState" AS ENUM ('unsure', 'not_linked', 'needs_you', 'handled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."Confidence" AS ENUM ('sure', 'likely', 'unsure');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LinkedBy" AS ENUM ('assistant', 'user', 'rule', 'import');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."OutboundKind" AS ENUM ('client_acknowledgement', 'client_questions', 'client_question_reminder', 'quotation', 'quotation_correction', 'follow_up', 'regret', 'po_receipt', 'order_acknowledgement', 'advance_request', 'advance_reminder', 'payment_receipt', 'delivery_update', 'ready_for_collection', 'invoice', 'payment_reminder', 'client_document_correction', 'supplier_rfq', 'supplier_rfq_change', 'supplier_rfq_withdrawal', 'supplier_chaser', 'supplier_question_relay', 'client_answer_share', 'supplier_hold_request', 'supplier_document_reminder', 'supplier_po', 'supplier_po_amendment', 'supplier_production_chase', 'supplier_query', 'forwarder_request', 'forwarder_claim', 'visitor_acknowledgement', 'visitor_callback_confirmation', 'morning_brief', 'evening_summary', 'month_pack', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."OutboundChannel" AS ENUM ('gmail', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."OutboundStatus" AS ENUM ('draft', 'awaiting_approval', 'queued', 'waiting_for_mailbox', 'sending', 'sent', 'failed', 'cancelled', 'undone');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ThreadMode" AS ENUM ('client_thread', 'rfq_thread', 'new_thread_per_recipient', 'new_thread');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."CompanySource" AS ENUM ('manual', 'email', 'website', 'callback', 'research', 'history_import', 'legacy_admin', 'zoho');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierType" AS ENUM ('manufacturer', 'principal', 'oem', 'distributor', 'stockist', 'trader', 'local_shop', 'forwarder', 'marketplace', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierTier" AS ENUM ('contact_only', 'trial', 'approved', 'principal', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."BlockReason" AS ENUM ('fake_company', 'counterfeit', 'payment_fraud_attempt', 'persistent_non_delivery', 'quality_failure', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."VatTreatment" AS ENUM ('export_zero_rated', 'local_standard', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PartialFollowUpPreference" AS ENUM ('supplementary', 'revision', 'ask_each_time');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ContactSourceKind" AS ENUM ('verified_on_page', 'directory_only', 'email_signature', 'email_header', 'manual', 'history_import', 'website_form');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ContactStatus" AS ENUM ('active', 'bouncing', 'left', 'do_not_use');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."BankAccountStatus" AS ENUM ('pending_verification', 'verified', 'rejected', 'superseded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ComplianceDocKind" AS ENUM ('trade_licence', 'vat_certificate', 'iso_certificate', 'atex_certificate', 'api_licence', 'approval', 'bank_letter', 'company_profile', 'past_performance_letter', 'insurance', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ScreeningKind" AS ENUM ('sanctions', 'company_registry', 'domain_record', 'blocked_list');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ScreeningResult" AS ENUM ('clear', 'possible_match', 'hit', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LessonScope" AS ENUM ('supplier', 'trade', 'part', 'client', 'general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PreferenceScope" AS ENUM ('global', 'client', 'supplier', 'trade', 'mailbox');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PreferenceKind" AS ENUM ('salutation', 'phrase_use', 'phrase_avoid', 'tone_sample', 'margin_habit', 'rounding', 'quoting_currency', 'supplier_exclusion', 'classification_rule', 'line_display', 'chaser_pause', 'acknowledgement_skip', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PreferenceSource" AS ENUM ('learned', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LeadStage" AS ENUM ('new', 'contacted', 'qualified', 'converted', 'dropped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LeadSource" AS ENUM ('callback', 'website', 'email', 'manual', 'import');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."CallbackStatus" AS ENUM ('new', 'calling', 'called', 'no_answer', 'converted_lead', 'converted_enquiry', 'merged', 'spam', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."WebsiteSubmissionStatus" AS ENUM ('received', 'enquiry_created', 'merged', 'spam', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PortalSubmissionKind" AS ENUM ('accept', 'ask_changes', 'upload_payment_advice', 'request_fresh_link');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PortalSubmissionStatus" AS ENUM ('received', 'processed', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ReceivedVia" AS ENUM ('email', 'forwarded_email', 'website_rfq', 'callback', 'manual', 'file_upload', 'client_portal', 'history_import', 'legacy_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."EnquiryStage" AS ENUM ('new', 'qualifying', 'sourcing', 'quotes_in', 'pricing', 'quoted', 'negotiation', 'won', 'lost', 'regretted', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."QualificationPath" AS ENUM ('quote_fully', 'quote_partial', 'ask_client_first', 'regret', 'no_source', 'ignore_spam');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LostReason" AS ENUM ('price', 'lead_time', 'specification', 'went_direct_to_oem', 'no_decision', 'cancelled', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ClosedReason" AS ENUM ('merged', 'duplicate', 'spam', 'withdrawn_by_client', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."EquivalentsPolicy" AS ENUM ('unknown', 'exact_only', 'equivalents_allowed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LineStatus" AS ENUM ('open', 'held', 'sourcing', 'quoted', 'to_follow', 'not_quoted', 'no_source', 'regretted', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LineRegretReason" AS ENUM ('not_our_range', 'no_source_found', 'obsolete', 'client_dropped', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ClientQuestionStatus" AS ENUM ('draft', 'sent', 'answered', 'proceeded_on_assumption', 'left_out', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierQuestionStatus" AS ENUM ('received', 'bundled', 'relayed', 'answered', 'shared_back', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RfqKind" AS ENUM ('primary', 'supplementary');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RfqStatus" AS ENUM ('reserved', 'draft', 'awaiting_approval', 'scheduled', 'sent', 'closed', 'withdrawn', 'released');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RecipientStatus" AS ENUM ('draft', 'awaiting_approval', 'scheduled', 'sent', 'opened', 'auto_reply', 'bounced', 'replied_question', 'partial_quote', 'quoted', 'regretted', 'no_reply', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RfqChangeKind" AS ENUM ('add_lines', 'change_quantity', 'drop_lines', 'spec_update', 'deadline_change');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RfqLanguage" AS ENUM ('en', 'en_zh');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ResearchRunStatus" AS ENUM ('queued', 'running', 'done', 'stopped', 'budget_reached', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."CandidatePriority" AS ENUM ('a', 'b', 'c');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."CandidateStatus" AS ENUM ('found', 'verifying', 'verified', 'directory_only', 'marketplace_only', 'not_suitable', 'added', 'added_to_rfq', 'merged', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."EquivalenceRelation" AS ENUM ('equivalent', 'alternative', 'not_equivalent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."EquivalenceStatus" AS ENUM ('proposed', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."EquivalenceSource" AS ENUM ('website', 'learned', 'research', 'manual', 'import');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."CatalogueSuggestionStatus" AS ENUM ('not_suggested', 'suggested', 'drafted', 'sent', 'published', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."TenderStatus" AS ENUM ('preparing', 'submitted', 'under_evaluation', 'clarification_requested', 'awarded', 'not_awarded', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SubmissionMethod" AS ENUM ('email', 'portal', 'hand_delivery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PlanStepStatus" AS ENUM ('planned', 'done', 'late', 'at_risk', 'hard_deadline');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RequirementCategory" AS ENUM ('commercial', 'technical', 'form', 'submission', 'approved_makes', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RequirementStatus" AS ENUM ('ready', 'missing', 'in_progress', 'not_applicable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."TenderQueryStatus" AS ENUM ('draft', 'posted', 'answered', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."TenderQueryOrigin" AS ENUM ('ours', 'supplier', 'buyer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."VendorCheckResult" AS ENUM ('listed', 'not_listed', 'excluded', 'offered_as_alternative');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."BidPackItemKind" AS ENUM ('priced_schedule', 'compliance_statement', 'deviation_list', 'technical_documents', 'company_documents', 'form', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierQuoteStatus" AS ENUM ('capturing', 'needs_review', 'confirmed', 'superseded', 'rejected', 'duplicate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierQuoteLineKind" AS ENUM ('exact', 'alternative', 'conditional', 'partial', 'regret', 'to_follow');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."StockStatus" AS ENUM ('ex_stock', 'production', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."QuoteExceptionKind" AS ENUM ('quantity_differs', 'moq', 'make_differs', 'certification_below', 'currency_unclear', 'unreadable_value', 'mapping_unsure', 'substitution', 'total_mismatch', 'password_protected', 'portal_link');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."QuoteExceptionStatus" AS ENUM ('open', 'resolved', 'deferred');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SourceContribution" AS ENUM ('all', 'prices', 'lead_times', 'freight', 'terms');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LandedComponentKind" AS ENUM ('freight', 'insurance', 'duty', 'bank_charges', 'inspection', 'packing', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LandedBasis" AS ENUM ('data', 'default_pct', 'override');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SelectionScenario" AS ENUM ('lowest_landed', 'fewest_suppliers', 'fastest', 'assistant_pick', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SelectedBy" AS ENUM ('assistant', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."DeviationField" AS ENUM ('make', 'material', 'trim', 'certification', 'standard', 'pressure_rating', 'dimensions', 'quantity', 'lead_time', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."DeviationStatus" AS ENUM ('pending', 'accepted', 'ask_client', 'excluded', 'no_deviation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."QuotationKind" AS ENUM ('standard', 'revision', 'supplementary');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."QuotationStatus" AS ENUM ('draft', 'awaiting_approval', 'approved', 'sent', 'viewed', 'evaluating', 'won', 'lost', 'superseded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."QuotationClientStatus" AS ENUM ('received', 'technical_review', 'budget_approval', 'evaluating', 'shortlisted', 'asked_for_changes', 'asked_for_discount', 'counter_offer', 'no_reply', 'still_deciding', 'po_to_follow', 'po_received');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."QuotationLineStatus" AS ENUM ('priced', 'price_to_follow', 'not_quoted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RevisionReason" AS ENUM ('discount', 'quantities', 'alternative', 'price_to_follow_added', 'correction', 'client_revision', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RecordOrigin" AS ENUM ('ops', 'history_import', 'legacy_admin', 'zoho');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."FollowUpChannel" AS ENUM ('call', 'email', 'meeting', 'view', 'note');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."FollowUpOutcome" AS ENUM ('still_deciding', 'asks_for_changes', 'counter_offer', 'purchase_order', 'lost', 'no_answer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."OrderStage" AS ENUM ('confirmed', 'advance', 'production', 'inspection', 'freight', 'shipped', 'delivered', 'invoiced', 'paid', 'closed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PartialShipmentPolicy" AS ENUM ('allowed', 'not_allowed', 'silent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PoCheckField" AS ENUM ('line_qty', 'line_price', 'line_description', 'payment_terms', 'delivery_terms', 'delivery_date', 'late_delivery_clause', 'inspection', 'documents', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PoCheckDecision" AS ENUM ('pending', 'accept', 'ask_client', 'reject', 'not_applicable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."OrderChangeKind" AS ENUM ('date_change', 'quantity_change', 'cancellation', 'address_change', 'spec_change');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."OrderChangeStatus" AS ENUM ('received', 'assessing', 'decided', 'applied', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ChargePolicy" AS ENUM ('per_terms', 'cost_only', 'waive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierPoStatus" AS ENUM ('draft', 'awaiting_approval', 'approved', 'sent', 'acknowledged', 'in_production', 'ready', 'inspected', 'shipped', 'delivered', 'invoiced', 'closed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."LineMatchStatus" AS ENUM ('pending', 'in_balance', 'mismatch', 'held', 'accepted', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."MatchIssueStatus" AS ENUM ('open', 'in_query', 'resolved', 'accepted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ChaseEventKind" AS ENUM ('acknowledged', 'status_reply', 'chase_sent', 'new_ready_date', 'escalated', 'photos_requested', 'note');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."InspectionStatus" AS ENUM ('planned', 'booked', 'in_progress', 'hold', 'failed', 'passed', 'released', 'released_with_exception', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."InspectorKind" AS ENUM ('client_tpi', 'third_party', 'indus', 'supplier_self');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ItpPointType" AS ENUM ('review', 'witness', 'hold_point');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ItpResult" AS ENUM ('open', 'pass', 'fail', 'not_applicable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."InspectionDocStatus" AS ENUM ('received', 'requested', 'pending', 'missing', 'not_applicable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."CostAllocation" AS ENUM ('supplier', 'indus', 'client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."FreightMode" AS ENUM ('sea_lcl', 'sea_fcl', 'air_consolidation', 'air_express', 'road', 'courier', 'client_collection');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."FreightQuoteStatus" AS ENUM ('requested', 'received', 'selected', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ShipmentStatus" AS ENUM ('planned', 'booked', 'ready_for_collection', 'collected', 'in_transit', 'arrived', 'customs_cleared', 'out_for_delivery', 'delivered', 'delivered_with_remarks', 'partially_delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."DeliveryCondition" AS ENUM ('accepted_in_full', 'accepted_with_remarks', 'partial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ClientConsent" AS ENUM ('not_needed', 'pending', 'given', 'refused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ExtraFreightPolicy" AS ENUM ('absorb', 'charge_client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."DocIssuer" AS ENUM ('supplier', 'freight', 'indus', 'client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ShippingDocStatus" AS ENUM ('awaited', 'requested', 'received', 'generated', 'not_applicable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ClaimStatus" AS ENUM ('open', 'with_back_to_back', 'resolved', 'rejected', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."IndusClaimPosition" AS ENUM ('accept_replace', 'repair', 'credit_note', 'reject');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ClaimPartyKind" AS ENUM ('forwarder', 'insurer', 'supplier');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."OrderCostKind" AS ENUM ('supplier', 'freight', 'duty', 'inspection', 'bank_charges', 'insurance', 'storage', 'restocking', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."DocumentKind" AS ENUM ('quotation', 'supplier_rfq', 'order_acknowledgement', 'proforma_invoice', 'supplier_po', 'packing_list', 'delivery_note', 'collection_note', 'tax_invoice', 'credit_note', 'client_po', 'client_rfq', 'supplier_quote', 'supplier_acknowledgement', 'supplier_proforma', 'supplier_invoice', 'supplier_packing_list', 'mill_test_certificate', 'certificate_of_origin', 'certificate_of_conformity', 'test_report', 'inspection_test_plan', 'inspection_release', 'air_waybill', 'bill_of_lading', 'insurance_certificate', 'customs_declaration', 'exit_certificate', 'proof_of_delivery', 'freight_quote', 'tender_document', 'tender_addendum', 'bid_pack', 'datasheet', 'drawing', 'cleaned_datasheet', 'payment_advice', 'claim_letter', 'photo', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."DocumentDirection" AS ENUM ('produced', 'received');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."DocumentStatus" AS ENUM ('draft', 'approved', 'sent', 'superseded', 'cancelled', 'received', 'void');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ReissueReason" AS ENUM ('wrong_price', 'wrong_address', 'wrong_quantity', 'wrong_attachment', 'client_request', 'typo', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."FileSource" AS ENUM ('gmail_attachment', 'upload', 'generated', 'client_portal', 'research_capture', 'import');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ExtractionStatus" AS ENUM ('pending', 'extracted', 'partial', 'unsupported', 'password_protected', 'unreadable', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ShareEventKind" AS ENUM ('opened', 'downloaded_pdf', 'accepted', 'changes_requested', 'fresh_link_requested', 'payment_advice_uploaded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ClientInvoiceKind" AS ENUM ('proforma_advance', 'tax_invoice', 'credit_note');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ClientInvoiceStatus" AS ENUM ('draft', 'sent', 'part_paid', 'short_paid', 'paid', 'disputed', 'overdue', 'written_off', 'void');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PaymentAllocationStatus" AS ENUM ('unallocated', 'partially_allocated', 'allocated', 'held_wrong_entity');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierInvoiceStatus" AS ENUM ('awaited', 'received', 'matched', 'mismatch', 'accepted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierPaymentKind" AS ENUM ('advance', 'balance', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."PaymentTrigger" AS ENUM ('with_po', 'before_dispatch', 'after_inspection', 'on_bill_of_lading', 'on_delivery', 'days_after_invoice', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SupplierPaymentStatus" AS ENUM ('draft', 'checks_pending', 'blocked', 'ready_for_approval', 'approved', 'paid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ExportEvidenceKind" AS ENUM ('bill_of_lading', 'air_waybill', 'exit_certificate', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."EvidenceStatus" AS ENUM ('provided', 'requested', 'missing', 'not_applicable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."MonthCloseStatus" AS ENUM ('open', 'in_review', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ZohoObject" AS ENUM ('contact', 'estimate', 'invoice', 'credit_note', 'payment_received', 'payment_made', 'bill', 'tax_rate', 'item', 'account', 'currency');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SyncDirection" AS ENUM ('push', 'pull');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SyncStatus" AS ENUM ('queued', 'done', 'error', 'retrying', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."IntegrationProvider" AS ENUM ('google_workspace', 'zoho_books', 'website', 'fx_source', 'anthropic', 'resend');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."IntegrationStatus" AS ENUM ('not_connected', 'connected', 'error', 'paused', 'disconnected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."FxSource" AS ENUM ('cbuae', 'bank', 'zoho', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."AutopilotLevel" AS ENUM ('off', 'suggest', 'draft_and_ask', 'do_and_tell', 'do_quietly', 'never');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."AutopilotGroup" AS ENUM ('mail', 'enquiries', 'sourcing', 'quotes', 'after_sending', 'orders', 'money', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ActionState" AS ENUM ('proposed', 'later', 'approved', 'edited_approved', 'rejected', 'queued', 'running', 'done', 'failed', 'undone', 'reverted', 'corrected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ActorKind" AS ENUM ('user', 'assistant', 'system', 'client', 'import');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."GuardrailKind" AS ENUM ('value_threshold', 'first_contact', 'margin_floor', 'credit_hold', 'working_hours', 'holiday_calendar', 'daily_send_cap', 'fixed_client_prices', 'fixed_no_money', 'ai_budget', 'research_cap');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."AiPurpose" AS ENUM ('read_mail', 'classify', 'extract', 'research', 'draft', 'compare', 'price', 'summarise', 'translate', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ActivityKind" AS ENUM ('money', 'documents', 'supplier', 'quantity', 'terms', 'decision', 'status', 'link', 'contact', 'settings', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."TaskKind" AS ENUM ('call', 'register_portal', 'download_portal_file', 'bid_bond', 'confirm_with_bank', 'record_callback', 'help_request', 'follow_up', 'general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."TaskSource" AS ENUM ('manual', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."TaskStatus" AS ENUM ('open', 'done', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."NotificationSeverity" AS ENUM ('info', 'warning', 'urgent', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."NotificationEvent" AS ENUM ('new_enquiry', 'high_value_enquiry', 'tender_deadline', 'quote_captured', 'all_quotes_in', 'client_replied', 'po_received', 'supplier_late', 'payment_received', 'bank_detail_change', 'assistant_paused', 'mailbox_disconnected', 'callback_overdue', 'fresh_link_requested', 'document_expiring', 'sync_error', 'budget_threshold', 'action_failed', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."DeliveryChannel" AS ENUM ('in_app', 'push', 'email', 'brief_only', 'off');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."SearchKind" AS ENUM ('enquiry', 'quotation', 'supplier_rfq', 'supplier_quote', 'order', 'supplier_po', 'company', 'contact', 'part', 'mail_message', 'attachment', 'document', 'tender');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."RecordType" AS ENUM ('enquiry', 'enquiry_line', 'trade_group', 'supplier_rfq', 'supplier_rfq_recipient', 'supplier_quote', 'supplier_quote_line', 'quotation', 'order', 'order_line', 'supplier_po', 'shipment', 'inspection', 'claim', 'document', 'company', 'contact', 'part', 'tender', 'client_invoice', 'supplier_payment', 'mail_message', 'mail_thread', 'task', 'research_run', 'import_job', 'lead', 'callback_request', 'mailbox', 'user', 'settings');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ImportSource" AS ENUM ('gmail_sales', 'gmail_purchase', 'zoho_books', 'legacy_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ImportJobStatus" AS ENUM ('draft', 'running', 'paused', 'reviewing', 'finished', 'undone', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ImportStageStatus" AS ENUM ('queued', 'running', 'paused', 'done', 'failed', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ImportEntity" AS ENUM ('company', 'contact', 'enquiry', 'enquiry_line', 'quotation', 'supplier_quote_line', 'supplier_rfq', 'part', 'order', 'callback');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ImportCandidateStatus" AS ENUM ('pending', 'accepted', 'skipped', 'merged', 'fixed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ChecklistKind" AS ENUM ('setup', 'cutover', 'first_hour');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ChecklistItemStatus" AS ENUM ('todo', 'in_progress', 'done', 'skipped', 'rolled_back');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."NumberScopeKind" AS ENUM ('global', 'year', 'month', 'day', 'parent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."IssuedNumberStatus" AS ENUM ('reserved', 'issued', 'released', 'void');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ops"."ExternalNumberSource" AS ENUM ('gmail_sent', 'zoho', 'legacy_admin', 'history_import', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ops"."currency" (
    "code" CHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "minorUnits" INTEGER NOT NULL DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("code")
);

CREATE TABLE IF NOT EXISTS "ops"."trade" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" UUID,
    "defaultMarginPct" DECIMAL(9,4),
    "position" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."settings_entry" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "ownerOnly" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "settings_entry_pkey" PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "ops"."work_calendar_day" (
    "date" DATE NOT NULL,
    "label" TEXT NOT NULL,
    "isHoliday" BOOLEAN NOT NULL DEFAULT true,
    "hoursStart" TEXT,
    "hoursEnd" TEXT,
    "country" CHAR(2) NOT NULL DEFAULT 'AE',

    CONSTRAINT "work_calendar_day_pkey" PRIMARY KEY ("date")
);

CREATE TABLE IF NOT EXISTS "ops"."follow_up_cadence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "follow_up_cadence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."help_article" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "help_article_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."number_sequence" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "revisionPattern" TEXT,
    "scopeKind" "ops"."NumberScopeKind" NOT NULL DEFAULT 'global',
    "padTo" INTEGER NOT NULL DEFAULT 0,
    "ownerOnly" BOOLEAN NOT NULL DEFAULT true,
    "seededAt" TIMESTAMPTZ(3),
    "seededById" UUID,
    "seedEvidence" JSONB,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "number_sequence_pkey" PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "ops"."number_counter" (
    "sequenceKey" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT '',
    "nextValue" BIGINT NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "number_counter_pkey" PRIMARY KEY ("sequenceKey","scope")
);

CREATE TABLE IF NOT EXISTS "ops"."issued_number" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sequenceKey" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT '',
    "value" BIGINT NOT NULL,
    "formatted" TEXT NOT NULL,
    "status" "ops"."IssuedNumberStatus" NOT NULL DEFAULT 'issued',
    "recordType" "ops"."RecordType",
    "recordId" UUID,
    "issuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedById" UUID,
    "releasedAt" TIMESTAMPTZ(3),

    CONSTRAINT "issued_number_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."external_number_observation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sequenceKey" TEXT NOT NULL,
    "formatted" TEXT NOT NULL,
    "value" BIGINT,
    "scope" TEXT NOT NULL DEFAULT '',
    "source" "ops"."ExternalNumberSource" NOT NULL,
    "sourceRef" TEXT,
    "observedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_number_observation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."autopilot_action_def" (
    "key" TEXT NOT NULL,
    "group" "ops"."AutopilotGroup" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "ruleText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "configurable" BOOLEAN NOT NULL DEFAULT true,
    "lockedLevel" "ops"."AutopilotLevel",
    "maxLevel" "ops"."AutopilotLevel",
    "defaultCareful" "ops"."AutopilotLevel" NOT NULL,
    "defaultBalanced" "ops"."AutopilotLevel" NOT NULL,
    "defaultHandsOff" "ops"."AutopilotLevel" NOT NULL,
    "minutesSaved" DECIMAL(9,2),
    "originBoard" TEXT,

    CONSTRAINT "autopilot_action_def_pkey" PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "ops"."autopilot_setting" (
    "actionKey" TEXT NOT NULL,
    "level" "ops"."AutopilotLevel" NOT NULL,
    "rules" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedById" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "autopilot_setting_pkey" PRIMARY KEY ("actionKey")
);

CREATE TABLE IF NOT EXISTS "ops"."guardrail" (
    "key" TEXT NOT NULL,
    "kind" "ops"."GuardrailKind" NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "fixed" BOOLEAN NOT NULL DEFAULT false,
    "params" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedById" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "guardrail_pkey" PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "ops"."email_template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "mailboxRole" "ops"."MailboxRole",
    "subjectTemplate" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "toneNotes" TEXT,
    "variables" TEXT[],
    "learnFromSent" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMPTZ(3),
    "updatedById" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "email_template_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."sending_rule" (
    "kind" "ops"."OutboundKind" NOT NULL,
    "fromRole" "ops"."MailboxRole" NOT NULL,
    "ccRole" "ops"."MailboxRole",
    "ccSpecial" TEXT,
    "signatureUserId" UUID,
    "threadMode" "ops"."ThreadMode" NOT NULL,
    "holdMinutes" INTEGER NOT NULL DEFAULT 5,
    "respectSendWindow" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sending_rule_pkey" PRIMARY KEY ("kind")
);

CREATE TABLE IF NOT EXISTS "ops"."document_template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" "ops"."DocumentKind" NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "layout" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_template_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."terms_clause" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "approvalRule" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMPTZ(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "terms_clause_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."terms_preset" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefaultForNewClient" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ(3),

    CONSTRAINT "terms_preset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."terms_preset_clause" (
    "presetId" UUID NOT NULL,
    "clauseId" UUID NOT NULL,
    "variableValues" JSONB NOT NULL DEFAULT '{}',
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "terms_preset_clause_pkey" PRIMARY KEY ("presetId","clauseId")
);

CREATE TABLE IF NOT EXISTS "ops"."user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" VARCHAR(3) NOT NULL,
    "role" "ops"."UserRole" NOT NULL,
    "status" "ops"."UserStatus" NOT NULL DEFAULT 'invited',
    "phone" TEXT,
    "primaryMailboxId" UUID,
    "passwordHash" TEXT,
    "totpSecretEnc" BYTEA,
    "totpEnabledAt" TIMESTAMPTZ(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMPTZ(3),
    "lastSignInAt" TIMESTAMPTZ(3),
    "canSeeMargins" BOOLEAN NOT NULL DEFAULT false,
    "canSendSupplierMail" BOOLEAN NOT NULL DEFAULT false,
    "canEditChaserRules" BOOLEAN NOT NULL DEFAULT false,
    "signatureHtml" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "removedAt" TIMESTAMPTZ(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."auth_account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."user_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "method" "ops"."SignInMethod" NOT NULL,
    "deviceLabel" TEXT,
    "userAgent" TEXT,
    "city" TEXT,
    "country" CHAR(2),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."user_invite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "role" "ops"."UserRole" NOT NULL DEFAULT 'helper',
    "tokenHash" TEXT NOT NULL,
    "invitedById" UUID NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_invite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."backup_code" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMPTZ(3),

    CONSTRAINT "backup_code_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."password_reset_token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."auth_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "email" TEXT,
    "kind" "ops"."AuthEventKind" NOT NULL,
    "method" "ops"."SignInMethod",
    "city" TEXT,
    "country" CHAR(2),
    "userAgent" TEXT,
    "ipHash" TEXT,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."user_preference" (
    "userId" UUID NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Dubai',
    "briefTime" TEXT NOT NULL DEFAULT '07:30',
    "briefEnabled" BOOLEAN NOT NULL DEFAULT true,
    "eveningSummary" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT NOT NULL DEFAULT '22:00',
    "quietHoursEnd" TEXT NOT NULL DEFAULT '07:00',
    "weekendMode" TEXT NOT NULL DEFAULT 'urgent_only',
    "travelModeUntil" TIMESTAMPTZ(3),
    "todayView" TEXT NOT NULL DEFAULT 'owner',
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE IF NOT EXISTS "ops"."notification_preference" (
    "userId" UUID NOT NULL,
    "event" "ops"."NotificationEvent" NOT NULL,
    "channel" "ops"."DeliveryChannel" NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("userId","event")
);

CREATE TABLE IF NOT EXISTS "ops"."tip_state" (
    "userId" UUID NOT NULL,
    "tipKey" TEXT NOT NULL,
    "dismissedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tip_state_pkey" PRIMARY KEY ("userId","tipKey")
);

CREATE TABLE IF NOT EXISTS "ops"."integration_connection" (
    "provider" "ops"."IntegrationProvider" NOT NULL,
    "status" "ops"."IntegrationStatus" NOT NULL DEFAULT 'not_connected',
    "tokensEnc" BYTEA,
    "externalOrg" TEXT,
    "cursor" JSONB NOT NULL DEFAULT '{}',
    "lastSyncAt" TIMESTAMPTZ(3),
    "lastError" TEXT,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "connectedAt" TIMESTAMPTZ(3),
    "connectedById" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "integration_connection_pkey" PRIMARY KEY ("provider")
);

CREATE TABLE IF NOT EXISTS "ops"."mailbox" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "address" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "ops"."MailboxRole" NOT NULL,
    "status" "ops"."MailboxStatus" NOT NULL DEFAULT 'connecting',
    "statusReason" TEXT,
    "ownerUserId" UUID,
    "googleSub" TEXT,
    "refreshTokenEnc" BYTEA,
    "scopes" TEXT[],
    "canRead" BOOLEAN NOT NULL DEFAULT true,
    "canDraft" BOOLEAN NOT NULL DEFAULT false,
    "canSend" BOOLEAN NOT NULL DEFAULT false,
    "canLabel" BOOLEAN NOT NULL DEFAULT false,
    "signatureHtml" TEXT,
    "sendAsAliases" TEXT[],
    "dailySendCap" INTEGER NOT NULL DEFAULT 40,
    "backfillMonths" INTEGER NOT NULL DEFAULT 12,
    "backfillTotal" INTEGER,
    "backfillDone" INTEGER NOT NULL DEFAULT 0,
    "connectedAt" TIMESTAMPTZ(3),
    "connectedById" UUID,
    "pausedAt" TIMESTAMPTZ(3),
    "pausedById" UUID,
    "disconnectedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "mailbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."mailbox_sync_state" (
    "mailboxId" UUID NOT NULL,
    "historyId" TEXT,
    "watchExpiresAt" TIMESTAMPTZ(3),
    "lastPushAt" TIMESTAMPTZ(3),
    "lastMessageAt" TIMESTAMPTZ(3),
    "lastIncrementalAt" TIMESTAMPTZ(3),
    "backfillPageToken" TEXT,
    "backfillBefore" TIMESTAMPTZ(3),
    "backfillPausedUntil" TIMESTAMPTZ(3),
    "lagSeconds" INTEGER NOT NULL DEFAULT 0,
    "sentToday" INTEGER NOT NULL DEFAULT 0,
    "sentTodayDate" DATE,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "mailbox_sync_state_pkey" PRIMARY KEY ("mailboxId")
);

CREATE TABLE IF NOT EXISTS "ops"."gmail_label" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mailboxId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "gmailLabelId" TEXT NOT NULL,

    CONSTRAINT "gmail_label_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."mail_thread" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mailboxId" UUID NOT NULL,
    "gmailThreadId" TEXT NOT NULL,
    "subject" TEXT,
    "lastMessageAt" TIMESTAMPTZ(3),
    "enquiryId" UUID,

    CONSTRAINT "mail_thread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."mail_message" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mailboxId" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "rfcMessageId" TEXT,
    "direction" "ops"."MailDirection" NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "fromName" TEXT,
    "toAddresses" TEXT[],
    "ccAddresses" TEXT[],
    "subject" TEXT,
    "snippet" TEXT,
    "bodyText" TEXT,
    "bodyPurgedAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3) NOT NULL,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classification" "ops"."MailClass" NOT NULL DEFAULT 'unclassified',
    "confidence" "ops"."Confidence",
    "unsureReason" TEXT,
    "alternatives" JSONB,
    "handledState" "ops"."MailHandledState" NOT NULL DEFAULT 'not_linked',
    "classifiedByActionId" UUID,
    "labelsApplied" TEXT[],
    "language" VARCHAR(8),
    "summaryEn" TEXT,
    "isForward" BOOLEAN NOT NULL DEFAULT false,
    "originalSender" TEXT,
    "outOfOfficeUntil" DATE,
    "bouncedAddress" TEXT,
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "sizeBytes" INTEGER,
    "searchTsv" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce("subject", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("fromAddress", '') || ' ' || coalesce("fromName", '')), 'B') ||
        setweight(to_tsvector('english', coalesce("bodyText", '')), 'C')) STORED,

    CONSTRAINT "mail_message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."mail_attachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "messageId" UUID NOT NULL,
    "gmailAttachmentId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "sha256" TEXT,
    "fileId" UUID,
    "extractionStatus" "ops"."ExtractionStatus" NOT NULL DEFAULT 'pending',
    "extractionNote" TEXT,
    "pageCount" INTEGER,

    CONSTRAINT "mail_attachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."mail_link" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "messageId" UUID NOT NULL,
    "enquiryId" UUID,
    "subjectType" "ops"."RecordType" NOT NULL,
    "subjectId" UUID NOT NULL,
    "linkedBy" "ops"."LinkedBy" NOT NULL,
    "confidence" "ops"."Confidence",
    "actionId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMPTZ(3),

    CONSTRAINT "mail_link_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."outbound_email" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "channel" "ops"."OutboundChannel" NOT NULL DEFAULT 'gmail',
    "kind" "ops"."OutboundKind" NOT NULL,
    "mailboxId" UUID,
    "threadId" UUID,
    "inReplyToRfcId" TEXT,
    "toAddresses" TEXT[],
    "ccAddresses" TEXT[],
    "bccAddresses" TEXT[],
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "status" "ops"."OutboundStatus" NOT NULL DEFAULT 'draft',
    "scheduledFor" TIMESTAMPTZ(3),
    "undoUntil" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "gmailMessageId" TEXT,
    "gmailDraftId" TEXT,
    "providerMessageId" TEXT,
    "deliveryStatus" TEXT,
    "failureReason" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "identifierCheck" JSONB,
    "actionId" UUID,
    "enquiryId" UUID,
    "subjectType" "ops"."RecordType",
    "subjectId" UUID,
    "companyId" UUID,
    "contactId" UUID,
    "retryOfId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "outbound_email_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."outbound_attachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "outboundId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "documentId" UUID,
    "filename" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "outbound_attachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."zoho_mapping" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "object" "ops"."ZohoObject" NOT NULL,
    "localKey" TEXT NOT NULL,
    "zohoId" TEXT NOT NULL,
    "label" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "zoho_mapping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."zoho_sync_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "direction" "ops"."SyncDirection" NOT NULL,
    "object" "ops"."ZohoObject" NOT NULL,
    "localType" "ops"."RecordType",
    "localId" UUID,
    "zohoId" TEXT,
    "summary" TEXT NOT NULL,
    "status" "ops"."SyncStatus" NOT NULL,
    "error" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zoho_sync_log_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."fx_rate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "currency" CHAR(3) NOT NULL,
    "rateToAed" DECIMAL(20,10) NOT NULL,
    "rateDate" DATE NOT NULL,
    "source" "ops"."FxSource" NOT NULL,
    "fetchedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fx_rate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "isClient" BOOLEAN NOT NULL DEFAULT false,
    "isSupplier" BOOLEAN NOT NULL DEFAULT false,
    "country" CHAR(2),
    "city" TEXT,
    "trn" TEXT,
    "website" TEXT,
    "primaryDomain" TEXT,
    "domains" TEXT[],
    "aliases" TEXT[],
    "industry" TEXT,
    "phone" TEXT,
    "source" "ops"."CompanySource" NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "zohoContactId" TEXT,
    "mergedIntoId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "searchTsv" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("legalName", '') || ' ' || coalesce(ops.immutable_array_to_string("aliases", ' '), '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("primaryDomain", '') || ' ' || coalesce(ops.immutable_array_to_string("domains", ' '), '')), 'B')) STORED,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."client_profile" (
    "companyId" UUID NOT NULL,
    "vendorCode" TEXT,
    "clientSince" DATE,
    "quotingCurrency" CHAR(3) NOT NULL DEFAULT 'USD',
    "vatTreatmentDefault" "ops"."VatTreatment",
    "termsPresetId" UUID,
    "paymentTermsText" TEXT,
    "followUpCadenceId" UUID,
    "partialFollowUp" "ops"."PartialFollowUpPreference" NOT NULL DEFAULT 'supplementary',
    "acknowledgeEnquiries" BOOLEAN NOT NULL DEFAULT true,
    "roundingRule" JSONB,
    "creditHold" BOOLEAN NOT NULL DEFAULT false,
    "creditHoldReason" TEXT,
    "creditHoldSince" TIMESTAMPTZ(3),
    "usualPaymentDelayDays" INTEGER,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "client_profile_pkey" PRIMARY KEY ("companyId")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_profile" (
    "companyId" UUID NOT NULL,
    "type" "ops"."SupplierType" NOT NULL DEFAULT 'unknown',
    "tier" "ops"."SupplierTier" NOT NULL DEFAULT 'contact_only',
    "tierSince" TIMESTAMPTZ(3),
    "regions" TEXT[],
    "quotesCurrency" CHAR(3),
    "usualIncoterm" TEXT,
    "usualIncotermPlace" TEXT,
    "defaultPaymentTerms" TEXT,
    "timezone" TEXT,
    "trialPoLimit" INTEGER NOT NULL DEFAULT 3,
    "trialPoMaxAmount" DECIMAL(18,4) NOT NULL DEFAULT 25000,
    "trialPoMaxCurrency" CHAR(3) NOT NULL DEFAULT 'USD',
    "trialPosUsed" INTEGER NOT NULL DEFAULT 0,
    "blockReason" "ops"."BlockReason",
    "blockNote" TEXT,
    "blockedAt" TIMESTAMPTZ(3),
    "blockedById" UUID,
    "firstContactAt" TIMESTAMPTZ(3),
    "rfqsAsked" INTEGER NOT NULL DEFAULT 0,
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "quotesCount" INTEGER NOT NULL DEFAULT 0,
    "regretsCount" INTEGER NOT NULL DEFAULT 0,
    "replyRatePct" DECIMAL(9,4),
    "medianReplyHours" DECIMAL(9,2),
    "linesQuotedPct" DECIMAL(9,4),
    "winSharePct" DECIMAL(9,4),
    "onTimePct" DECIMAL(9,4),
    "posCount" INTEGER NOT NULL DEFAULT 0,
    "lastQuoteAt" TIMESTAMPTZ(3),
    "reliabilitySummary" TEXT,
    "reliabilityAt" TIMESTAMPTZ(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supplier_profile_pkey" PRIMARY KEY ("companyId")
);

CREATE TABLE IF NOT EXISTS "ops"."contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "salutation" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "status" "ops"."ContactStatus" NOT NULL DEFAULT 'active',
    "bouncedAt" TIMESTAMPTZ(3),
    "outOfOfficeUntil" DATE,
    "sourceKind" "ops"."ContactSourceKind" NOT NULL DEFAULT 'manual',
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMPTZ(3),
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_line_card" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierId" UUID NOT NULL,
    "tradeId" UUID,
    "brand" TEXT,
    "authorised" BOOLEAN NOT NULL DEFAULT false,
    "evidenceUrl" TEXT,
    "verifiedAt" TIMESTAMPTZ(3),
    "learned" BOOLEAN NOT NULL DEFAULT false,
    "timesQuoted" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_line_card_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_bank_account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierId" UUID NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "currency" CHAR(3),
    "ibanEnc" BYTEA NOT NULL,
    "ibanLast4" VARCHAR(4) NOT NULL,
    "swift" TEXT,
    "status" "ops"."BankAccountStatus" NOT NULL DEFAULT 'pending_verification',
    "requestedViaMessageId" UUID,
    "requestedAt" TIMESTAMPTZ(3),
    "riskFlags" JSONB,
    "callbackNumber" TEXT,
    "callbackSpokeTo" TEXT,
    "callbackAt" TIMESTAMPTZ(3),
    "callbackRecordedById" UUID,
    "callbackGenuine" BOOLEAN,
    "coolingOffUntil" TIMESTAMPTZ(3),
    "supersededAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_bank_account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."compliance_document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID,
    "kind" "ops"."ComplianceDocKind" NOT NULL,
    "title" TEXT NOT NULL,
    "number" TEXT,
    "issuer" TEXT,
    "scope" TEXT,
    "issuedAt" DATE,
    "expiresAt" DATE,
    "reminderDays" INTEGER[] DEFAULT ARRAY[60, 30, 7]::INTEGER[],
    "lastReminderAt" TIMESTAMPTZ(3),
    "fileId" UUID,
    "usedIn" TEXT[],
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."screening_check" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "kind" "ops"."ScreeningKind" NOT NULL,
    "result" "ops"."ScreeningResult" NOT NULL,
    "subjectText" TEXT,
    "evidence" JSONB,
    "triggeredBy" TEXT,
    "checkedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "screening_check_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."own_bank_account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "iban" TEXT NOT NULL,
    "swift" TEXT,
    "showOnDocuments" BOOLEAN NOT NULL DEFAULT true,
    "isDefaultForCcy" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ(3),

    CONSTRAINT "own_bank_account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."lesson" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope" "ops"."LessonScope" NOT NULL,
    "companyId" UUID,
    "tradeId" UUID,
    "partId" UUID,
    "text" TEXT NOT NULL,
    "effect" JSONB,
    "sourceType" "ops"."RecordType",
    "sourceId" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "savedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."preference" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope" "ops"."PreferenceScope" NOT NULL,
    "kind" "ops"."PreferenceKind" NOT NULL,
    "companyId" UUID,
    "tradeId" UUID,
    "mailboxId" UUID,
    "description" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "source" "ops"."PreferenceSource" NOT NULL DEFAULT 'learned',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "preference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."preference_evidence" (
    "preferenceId" UUID NOT NULL,
    "actionId" UUID NOT NULL,

    CONSTRAINT "preference_evidence_pkey" PRIMARY KEY ("preferenceId","actionId")
);

CREATE TABLE IF NOT EXISTS "ops"."lead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "companyId" UUID,
    "email" TEXT,
    "phone" TEXT,
    "source" "ops"."LeadSource" NOT NULL,
    "interest" TEXT,
    "estValue" DECIMAL(18,4),
    "estCurrency" CHAR(3),
    "stage" "ops"."LeadStage" NOT NULL DEFAULT 'new',
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMPTZ(3),
    "convertedEnquiryId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."callback_request" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "phoneCountry" CHAR(2) NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "surface" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "pageUrl" TEXT,
    "pageTitle" TEXT,
    "referrer" TEXT,
    "market" TEXT,
    "utm" JSONB,
    "ipHash" TEXT,
    "deskOpen" BOOLEAN NOT NULL DEFAULT false,
    "dueAt" TIMESTAMPTZ(3) NOT NULL,
    "alertAt" TIMESTAMPTZ(3),
    "status" "ops"."CallbackStatus" NOT NULL DEFAULT 'new',
    "calledAt" TIMESTAMPTZ(3),
    "calledById" UUID,
    "callNotes" TEXT,
    "voiceNoteFileId" UUID,
    "duplicateOfId" UUID,
    "leadId" UUID,
    "enquiryId" UUID,
    "legacyId" TEXT,

    CONSTRAINT "callback_request_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."website_submission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,
    "visitor" JSONB,
    "deliveryId" TEXT NOT NULL,
    "status" "ops"."WebsiteSubmissionStatus" NOT NULL DEFAULT 'received',
    "enquiryId" UUID,
    "spamReason" TEXT,
    "legacyId" TEXT,

    CONSTRAINT "website_submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."client_portal_submission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shareLinkId" UUID NOT NULL,
    "kind" "ops"."PortalSubmissionKind" NOT NULL,
    "status" "ops"."PortalSubmissionStatus" NOT NULL DEFAULT 'received',
    "name" TEXT,
    "email" TEXT,
    "poNumber" TEXT,
    "deliveryAddress" TEXT,
    "lineNumbers" INTEGER[],
    "message" TEXT,
    "fileIds" UUID[],
    "enquiryId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMPTZ(3),

    CONSTRAINT "client_portal_submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."enquiry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientId" UUID,
    "contactId" UUID,
    "clientRef" TEXT,
    "receivedVia" "ops"."ReceivedVia" NOT NULL,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL,
    "deadline" TIMESTAMPTZ(3),
    "revertBy" TIMESTAMPTZ(3),
    "decisionBy" DATE,
    "stage" "ops"."EnquiryStage" NOT NULL DEFAULT 'new',
    "stageChangedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" UUID,
    "legitimacy" "ops"."Confidence",
    "legitimacyNotes" JSONB,
    "fitNotes" JSONB,
    "effortNotes" JSONB,
    "suggestedPath" "ops"."QualificationPath",
    "chosenPath" "ops"."QualificationPath",
    "pathChosenAt" TIMESTAMPTZ(3),
    "pathChosenById" UUID,
    "estValueMin" DECIMAL(18,4),
    "estValueMax" DECIMAL(18,4),
    "estCurrency" CHAR(3),
    "requestedIncoterm" TEXT,
    "deliveryPoint" TEXT,
    "requestedPayment" TEXT,
    "complianceNote" TEXT,
    "requiresDeviationList" BOOLEAN NOT NULL DEFAULT false,
    "isTender" BOOLEAN NOT NULL DEFAULT false,
    "responseClockPausedAt" TIMESTAMPTZ(3),
    "lostReason" "ops"."LostReason",
    "lostWinningPrice" DECIMAL(18,4),
    "lostWinningCcy" CHAR(3),
    "lostToName" TEXT,
    "closedReason" "ops"."ClosedReason",
    "closeNote" TEXT,
    "closedAt" TIMESTAMPTZ(3),
    "mergedIntoId" UUID,
    "splitFromId" UUID,
    "origin" "ops"."RecordOrigin" NOT NULL DEFAULT 'ops',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "searchTsv" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce("ref", '') || ' ' || coalesce("clientRef", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("title", '')), 'B')) STORED,

    CONSTRAINT "enquiry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."enquiry_revision" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "sourceMessageId" UUID,
    "changes" JSONB NOT NULL,
    "appliedAt" TIMESTAMPTZ(3),
    "appliedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiry_revision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."enquiry_assumption" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "lineId" UUID,
    "text" TEXT NOT NULL,
    "printOnQuotation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiry_assumption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."enquiry_line" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "no" INTEGER NOT NULL,
    "clientPartNo" TEXT,
    "clientItemCode" TEXT,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(18,4) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'pcs',
    "specNotes" TEXT,
    "requestedMake" TEXT,
    "equivalentsPolicy" "ops"."EquivalentsPolicy" NOT NULL DEFAULT 'unknown',
    "requiredCertification" TEXT,
    "partId" UUID,
    "matchConfidence" "ops"."Confidence",
    "catalogueProductId" TEXT,
    "catalogueVariantPartNo" TEXT,
    "status" "ops"."LineStatus" NOT NULL DEFAULT 'open',
    "statusReason" TEXT,
    "heldReason" TEXT,
    "regretReason" "ops"."LineRegretReason",
    "notQuotedReason" TEXT,
    "followBy" DATE,
    "giveUpAt" DATE,
    "tradeGroupId" UUID,
    "quotedByCount" INTEGER NOT NULL DEFAULT 0,
    "selectedQuoteLineId" UUID,
    "sourceDocumentId" UUID,
    "sourceMessageId" UUID,
    "sourcePage" INTEGER,
    "sourceSpan" JSONB,
    "extractionConfidence" "ops"."Confidence",
    "extractedByActionId" UUID,
    "qtyChangedAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "enquiry_line_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."client_question" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "lineId" UUID,
    "question" TEXT NOT NULL,
    "fallbackAssumption" TEXT,
    "status" "ops"."ClientQuestionStatus" NOT NULL DEFAULT 'draft',
    "outboundId" UUID,
    "sentAt" TIMESTAMPTZ(3),
    "reminderSentAt" TIMESTAMPTZ(3),
    "answerMessageId" UUID,
    "answerText" TEXT,
    "answeredAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."trade_group" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tradeId" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_rfq" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ref" TEXT NOT NULL,
    "enquiryId" UUID NOT NULL,
    "tradeGroupId" UUID,
    "kind" "ops"."RfqKind" NOT NULL DEFAULT 'primary',
    "status" "ops"."RfqStatus" NOT NULL DEFAULT 'reserved',
    "replyBy" DATE,
    "language" "ops"."RfqLanguage" NOT NULL DEFAULT 'en',
    "attachPdf" BOOLEAN NOT NULL DEFAULT false,
    "cleanedDatasheetFileId" UUID,
    "identifierCheck" JSONB,
    "withdrawnReason" TEXT,
    "withdrawnAt" TIMESTAMPTZ(3),
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supplier_rfq_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_rfq_line" (
    "rfqId" UUID NOT NULL,
    "lineId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "qtyAsked" DECIMAL(18,4) NOT NULL,
    "sentDescription" TEXT,
    "addedAfterSendAt" TIMESTAMPTZ(3),
    "droppedAt" TIMESTAMPTZ(3),

    CONSTRAINT "supplier_rfq_line_pkey" PRIMARY KEY ("rfqId","lineId")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_rfq_recipient" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rfqId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "contactId" UUID,
    "status" "ops"."RecipientStatus" NOT NULL DEFAULT 'draft',
    "askCurrency" CHAR(3),
    "askPort" BOOLEAN NOT NULL DEFAULT true,
    "supplierTimezone" TEXT,
    "sendAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "threadId" UUID,
    "outboundId" UUID,
    "firstContact" BOOLEAN NOT NULL DEFAULT false,
    "openerSentence" TEXT,
    "openerSourceUrl" TEXT,
    "chasersSent" INTEGER NOT NULL DEFAULT 0,
    "lastChasedAt" TIMESTAMPTZ(3),
    "nextChaseAt" TIMESTAMPTZ(3),
    "escalatedAt" TIMESTAMPTZ(3),
    "outOfOfficeUntil" DATE,
    "repliedAt" TIMESTAMPTZ(3),
    "linesQuoted" INTEGER NOT NULL DEFAULT 0,
    "promisedBy" DATE,
    "bounceReason" TEXT,
    "withdrawnAt" TIMESTAMPTZ(3),
    "excludedFromStats" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supplier_rfq_recipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."rfq_change" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rfqId" UUID NOT NULL,
    "kind" "ops"."RfqChangeKind" NOT NULL,
    "details" JSONB NOT NULL,
    "causeType" "ops"."RecordType",
    "causeId" UUID,
    "recipientIds" UUID[],
    "actionId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_change_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_question" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipientId" UUID NOT NULL,
    "lineId" UUID,
    "sourceMessageId" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "status" "ops"."SupplierQuestionStatus" NOT NULL DEFAULT 'received',
    "clientQuestionId" UUID,
    "answerSharedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."research_run" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "status" "ops"."ResearchRunStatus" NOT NULL DEFAULT 'queued',
    "briefs" JSONB NOT NULL,
    "regionsOrder" TEXT[],
    "currentRegion" TEXT,
    "capUsd" DECIMAL(12,6) NOT NULL,
    "costUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "startedById" UUID,
    "actionId" UUID,
    "startedAt" TIMESTAMPTZ(3),
    "endedAt" TIMESTAMPTZ(3),
    "stoppedReason" TEXT,

    CONSTRAINT "research_run_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."research_candidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "runId" UUID NOT NULL,
    "tradeGroupId" UUID,
    "companyId" UUID,
    "name" TEXT NOT NULL,
    "country" CHAR(2),
    "city" TEXT,
    "typeGuess" "ops"."SupplierType",
    "priority" "ops"."CandidatePriority",
    "reason" TEXT,
    "listsText" TEXT,
    "shipsToUae" TEXT,
    "riskFlags" JSONB,
    "contacts" JSONB NOT NULL,
    "sourceUrls" TEXT[],
    "region" TEXT,
    "status" "ops"."CandidateStatus" NOT NULL DEFAULT 'found',
    "decidedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_candidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."part" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partNo" TEXT NOT NULL,
    "partNoNorm" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "tradeId" UUID,
    "catalogueProductId" TEXT,
    "catalogueVariantPartNo" TEXT,
    "datasheetFileIds" UUID[],
    "timesAsked12m" INTEGER NOT NULL DEFAULT 0,
    "clientsAsked12m" INTEGER NOT NULL DEFAULT 0,
    "conflictingBrandClaims" BOOLEAN NOT NULL DEFAULT false,
    "firstAskedEnquiryId" UUID,
    "notes" TEXT,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "searchTsv" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce("partNo", '') || ' ' || coalesce("partNoNorm", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("description", '')), 'B')) STORED,

    CONSTRAINT "part_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."part_alias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "norm" TEXT NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "part_alias_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."part_equivalence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partAId" UUID NOT NULL,
    "partBId" UUID NOT NULL,
    "relation" "ops"."EquivalenceRelation" NOT NULL,
    "status" "ops"."EquivalenceStatus" NOT NULL DEFAULT 'proposed',
    "source" "ops"."EquivalenceSource" NOT NULL,
    "evidence" JSONB,
    "seenOnCount" INTEGER NOT NULL DEFAULT 0,
    "decidedById" UUID,
    "decidedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "part_equivalence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."catalogue_suggestion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partId" UUID NOT NULL,
    "status" "ops"."CatalogueSuggestionStatus" NOT NULL DEFAULT 'not_suggested',
    "askedCount" INTEGER NOT NULL DEFAULT 0,
    "clientCount" INTEGER NOT NULL DEFAULT 0,
    "windowStart" DATE,
    "websiteProductId" TEXT,
    "sentAt" TIMESTAMPTZ(3),
    "publishedAt" TIMESTAMPTZ(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "catalogue_suggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."tender" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "tenderRef" TEXT NOT NULL,
    "buyerName" TEXT,
    "submissionMethod" "ops"."SubmissionMethod" NOT NULL DEFAULT 'portal',
    "portalUrl" TEXT,
    "issuedAt" TIMESTAMPTZ(3),
    "tqDeadline" TIMESTAMPTZ(3),
    "siteVisitAt" TIMESTAMPTZ(3),
    "clarificationsCloseAt" TIMESTAMPTZ(3),
    "closingAt" TIMESTAMPTZ(3) NOT NULL,
    "closingTimezone" TEXT NOT NULL DEFAULT 'Asia/Dubai',
    "bidValidityDays" INTEGER,
    "bidValidUntil" DATE,
    "bidBondRequired" BOOLEAN NOT NULL DEFAULT false,
    "bidBondPct" DECIMAL(9,4),
    "bidBondAmount" DECIMAL(18,4),
    "bidBondCurrency" CHAR(3),
    "bidBondBank" TEXT,
    "bidBondValidDays" INTEGER,
    "bidBondRef" TEXT,
    "awardExpectedAt" DATE,
    "status" "ops"."TenderStatus" NOT NULL DEFAULT 'preparing',
    "submittedAt" TIMESTAMPTZ(3),
    "submittedById" UUID,
    "submittedVia" "ops"."SubmissionMethod",
    "submissionReceiptRef" TEXT,
    "receiptFileId" UUID,
    "packFileId" UUID,
    "awardPoRef" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tender_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."tender_plan_step" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenderId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "plannedAt" TIMESTAMPTZ(3) NOT NULL,
    "actualAt" TIMESTAMPTZ(3),
    "status" "ops"."PlanStepStatus" NOT NULL DEFAULT 'planned',
    "position" INTEGER NOT NULL,

    CONSTRAINT "tender_plan_step_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."tender_requirement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenderId" UUID NOT NULL,
    "category" "ops"."RequirementCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "sourceDocumentId" UUID,
    "sourcePage" INTEGER,
    "status" "ops"."RequirementStatus" NOT NULL DEFAULT 'missing',
    "evidenceDocumentId" UUID,
    "complianceDocumentId" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tender_requirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."tender_query" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenderId" UUID NOT NULL,
    "ref" TEXT NOT NULL,
    "lineId" UUID,
    "origin" "ops"."TenderQueryOrigin" NOT NULL,
    "fromSupplierId" UUID,
    "question" TEXT NOT NULL,
    "buyerFormatText" TEXT,
    "status" "ops"."TenderQueryStatus" NOT NULL DEFAULT 'draft',
    "raisedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedAt" TIMESTAMPTZ(3),
    "postedById" UUID,
    "answer" TEXT,
    "answeredAt" TIMESTAMPTZ(3),
    "relayedAt" TIMESTAMPTZ(3),

    CONSTRAINT "tender_query_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."tender_addendum" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenderId" UUID NOT NULL,
    "no" INTEGER NOT NULL,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "closingMovedTo" TIMESTAMPTZ(3),
    "changes" JSONB,
    "sourceDocumentId" UUID,

    CONSTRAINT "tender_addendum_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."approved_make" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyerId" UUID NOT NULL,
    "tenderId" UUID,
    "commodity" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "sourceRef" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approved_make_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."approved_make_check" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lineId" UUID NOT NULL,
    "supplierQuoteLineId" UUID,
    "offeredMake" TEXT NOT NULL,
    "result" "ops"."VendorCheckResult" NOT NULL,
    "decidedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approved_make_check_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."bid_pack_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenderId" UUID NOT NULL,
    "kind" "ops"."BidPackItemKind" NOT NULL,
    "label" TEXT NOT NULL,
    "documentIds" UUID[],
    "status" "ops"."RequirementStatus" NOT NULL DEFAULT 'missing',
    "position" INTEGER NOT NULL,

    CONSTRAINT "bid_pack_item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_quote" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "rfqId" UUID,
    "recipientId" UUID,
    "supplierId" UUID NOT NULL,
    "supplierRef" TEXT,
    "quoteDate" DATE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "supersedesId" UUID,
    "status" "ops"."SupplierQuoteStatus" NOT NULL DEFAULT 'capturing',
    "currency" CHAR(3),
    "incoterm" TEXT,
    "incotermPlace" TEXT,
    "validityDays" INTEGER,
    "validUntil" DATE,
    "paymentTerms" TEXT,
    "countryOfOrigin" TEXT,
    "certification" TEXT,
    "packingIncluded" BOOLEAN,
    "freightIncluded" BOOLEAN,
    "moqText" TEXT,
    "totalAmount" DECIMAL(18,4),
    "printedTotal" TEXT,
    "totalsMatch" BOOLEAN,
    "fxRateId" UUID,
    "fxRateToAed" DECIMAL(20,10),
    "fxLockedAt" TIMESTAMPTZ(3),
    "receivedAt" TIMESTAMPTZ(3) NOT NULL,
    "arrivedAtMailbox" TEXT,
    "language" VARCHAR(8),
    "summaryEn" TEXT,
    "fileHash" TEXT,
    "flags" JSONB,
    "captureActionId" UUID,
    "confirmedById" UUID,
    "confirmedAt" TIMESTAMPTZ(3),
    "recordOrigin" "ops"."RecordOrigin" NOT NULL DEFAULT 'ops',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supplier_quote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_quote_source" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quoteId" UUID NOT NULL,
    "messageId" UUID,
    "documentId" UUID,
    "contributes" "ops"."SourceContribution" NOT NULL DEFAULT 'all',
    "manual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_quote_source_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_quote_line" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quoteId" UUID NOT NULL,
    "enquiryLineId" UUID,
    "supplierItemNo" TEXT,
    "offeredPartNo" TEXT,
    "offeredMake" TEXT,
    "offeredDescription" TEXT,
    "partId" UUID,
    "kind" "ops"."SupplierQuoteLineKind" NOT NULL DEFAULT 'exact',
    "qtyOffered" DECIMAL(18,4),
    "uom" TEXT,
    "unitPrice" DECIMAL(18,4),
    "printedUnitPrice" TEXT,
    "conversionNote" TEXT,
    "lineTotal" DECIMAL(18,4),
    "leadTimeText" TEXT,
    "leadTimeDays" INTEGER,
    "stock" "ops"."StockStatus" NOT NULL DEFAULT 'unknown',
    "moq" DECIMAL(18,4),
    "conditions" TEXT,
    "conditionLineIds" UUID[],
    "promisedBy" DATE,
    "unreadable" BOOLEAN NOT NULL DEFAULT false,
    "staleReason" TEXT,
    "sourceHighlight" JSONB,
    "sourceSourceId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_quote_line_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."quote_exception" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quoteId" UUID NOT NULL,
    "quoteLineId" UUID,
    "kind" "ops"."QuoteExceptionKind" NOT NULL,
    "details" JSONB NOT NULL,
    "status" "ops"."QuoteExceptionStatus" NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "resolvedById" UUID,
    "resolvedAt" TIMESTAMPTZ(3),
    "actionId" UUID,

    CONSTRAINT "quote_exception_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."landed_cost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierQuoteLineId" UUID NOT NULL,
    "enquiryLineId" UUID NOT NULL,
    "deliveryPoint" TEXT,
    "supplierUnitPrice" DECIMAL(18,4) NOT NULL,
    "supplierCurrency" CHAR(3) NOT NULL,
    "fxRateToAed" DECIMAL(20,10) NOT NULL,
    "fxRefreshed" BOOLEAN NOT NULL DEFAULT false,
    "convertedUnitAed" DECIMAL(18,4) NOT NULL,
    "landedUnitAed" DECIMAL(18,4) NOT NULL,
    "weightKgPerUnit" DECIMAL(18,4),
    "hsCode" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "computedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landed_cost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."landed_cost_component" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "landedCostId" UUID NOT NULL,
    "kind" "ops"."LandedComponentKind" NOT NULL,
    "basis" "ops"."LandedBasis" NOT NULL,
    "amountAed" DECIMAL(18,4) NOT NULL,
    "pct" DECIMAL(9,4),
    "sourceText" TEXT,
    "rateCardId" UUID,
    "overriddenById" UUID,
    "overrideReason" TEXT,

    CONSTRAINT "landed_cost_component_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."freight_rate_card" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "forwarderId" UUID NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "mode" "ops"."FreightMode" NOT NULL,
    "ratePerKg" DECIMAL(18,4),
    "ratePerCbm" DECIMAL(18,4),
    "minCharge" DECIMAL(18,4),
    "currency" CHAR(3) NOT NULL,
    "transitDays" INTEGER,
    "validFrom" DATE,
    "validTo" DATE,
    "sourceDocumentId" UUID,

    CONSTRAINT "freight_rate_card_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."hs_code" (
    "code" TEXT NOT NULL,
    "description" TEXT,
    "dutyPct" DECIMAL(9,4) NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'GCC',

    CONSTRAINT "hs_code_pkey" PRIMARY KEY ("code")
);

CREATE TABLE IF NOT EXISTS "ops"."line_selection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryLineId" UUID NOT NULL,
    "supplierQuoteLineId" UUID NOT NULL,
    "selectedBy" "ops"."SelectedBy" NOT NULL,
    "scenario" "ops"."SelectionScenario" NOT NULL,
    "reason" TEXT,
    "actionId" UUID,
    "userId" UUID,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "selectedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "line_selection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."deviation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryLineId" UUID NOT NULL,
    "supplierQuoteLineId" UUID,
    "field" "ops"."DeviationField" NOT NULL,
    "asked" TEXT,
    "offered" TEXT,
    "status" "ops"."DeviationStatus" NOT NULL DEFAULT 'pending',
    "printText" TEXT,
    "clientQuestionId" UUID,
    "decidedById" UUID,
    "decidedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deviation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."quotation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "clientId" UUID,
    "attentionId" UUID,
    "baseNumber" INTEGER,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "number" TEXT,
    "kind" "ops"."QuotationKind" NOT NULL DEFAULT 'standard',
    "supersedesId" UUID,
    "supplementaryOfId" UUID,
    "status" "ops"."QuotationStatus" NOT NULL DEFAULT 'draft',
    "clientStatus" "ops"."QuotationClientStatus",
    "quotationDate" DATE,
    "clientRef" TEXT,
    "currency" CHAR(3) NOT NULL,
    "incoterm" TEXT,
    "incotermPlace" TEXT,
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "validUntil" DATE,
    "vatTreatment" "ops"."VatTreatment" NOT NULL,
    "vatNoteLine" BOOLEAN NOT NULL DEFAULT false,
    "fxRateToAed" DECIMAL(20,10),
    "termsPresetId" UUID,
    "notes" TEXT,
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vatAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vatAmountAed" DECIMAL(18,4),
    "total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "landedTotalAed" DECIMAL(18,4),
    "sellTotalAed" DECIMAL(18,4),
    "grossProfitAed" DECIMAL(18,4),
    "marginPct" DECIMAL(9,4),
    "markupPct" DECIMAL(9,4),
    "cashNeedAed" DECIMAL(18,4),
    "priceGuard" JSONB,
    "approvedWithWarnings" BOOLEAN NOT NULL DEFAULT false,
    "revisionReason" "ops"."RevisionReason",
    "revisionNote" TEXT,
    "printChangesNote" BOOLEAN NOT NULL DEFAULT false,
    "probabilityPct" INTEGER,
    "expectedPoAt" DATE,
    "nextTouchAt" DATE,
    "nextTouchNote" TEXT,
    "remindersPausedUntil" DATE,
    "targetPrice" DECIMAL(18,4),
    "approvalActionId" UUID,
    "approvedById" UUID,
    "approvedAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "sentOutboundId" UUID,
    "documentId" UUID,
    "zohoEstimateId" TEXT,
    "origin" "ops"."RecordOrigin" NOT NULL DEFAULT 'ops',
    "wonAt" TIMESTAMPTZ(3),
    "lostAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "searchTsv" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce("number", '') || ' ' || coalesce('INDUS/Q' || "baseNumber"::text, '') || ' ' || coalesce('Q' || "baseNumber"::text, '') || ' ' || coalesce("baseNumber"::text, '') || ' ' || coalesce("clientRef", '')), 'A')) STORED,

    CONSTRAINT "quotation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."quotation_line" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quotationId" UUID NOT NULL,
    "enquiryLineId" UUID,
    "position" INTEGER NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "clientPartNo" TEXT,
    "qty" DECIMAL(18,4) NOT NULL,
    "uom" TEXT NOT NULL,
    "rate" DECIMAL(18,4),
    "leadWeeks" DECIMAL(9,2),
    "leadText" TEXT,
    "taxPct" DECIMAL(9,4),
    "taxAmount" DECIMAL(18,4),
    "amount" DECIMAL(18,4),
    "status" "ops"."QuotationLineStatus" NOT NULL DEFAULT 'priced',
    "notQuotedReason" TEXT,
    "expectedBy" DATE,
    "vatTreatment" "ops"."VatTreatment",
    "costUnitAed" DECIMAL(18,4),
    "suggestedMarginPct" DECIMAL(9,4),
    "marginPct" DECIMAL(9,4),
    "markupPct" DECIMAL(9,4),
    "marginReason" TEXT,
    "roundingApplied" TEXT,
    "priceGuardFlags" JSONB,
    "sourceQuoteLineId" UUID,

    CONSTRAINT "quotation_line_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."quotation_deviation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quotationId" UUID NOT NULL,
    "deviationId" UUID,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "quotation_deviation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."quotation_term" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quotationId" UUID NOT NULL,
    "clauseId" UUID,
    "category" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "differsFromClientRfq" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,

    CONSTRAINT "quotation_term_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."follow_up_entry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enquiryId" UUID NOT NULL,
    "quotationId" UUID,
    "at" TIMESTAMPTZ(3) NOT NULL,
    "channel" "ops"."FollowUpChannel" NOT NULL,
    "summary" TEXT NOT NULL,
    "clientStatus" "ops"."QuotationClientStatus",
    "outcome" "ops"."FollowUpOutcome",
    "probabilityPct" INTEGER,
    "expectedPoAt" DATE,
    "nextTouchAt" DATE,
    "nextTouchNote" TEXT,
    "byUserId" UUID,
    "actionId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_entry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."order" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ref" TEXT NOT NULL,
    "enquiryId" UUID NOT NULL,
    "quotationId" UUID,
    "clientId" UUID NOT NULL,
    "contactId" UUID,
    "clientPoNumber" TEXT NOT NULL,
    "clientPoDate" DATE,
    "clientPoDocumentId" UUID,
    "poCheckDoneAt" TIMESTAMPTZ(3),
    "stage" "ops"."OrderStage" NOT NULL DEFAULT 'confirmed',
    "stageChangedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" CHAR(3) NOT NULL,
    "incoterm" TEXT,
    "deliveryPoint" TEXT,
    "requiredDeliveryDate" DATE,
    "latestReadyDate" DATE,
    "partialShipment" "ops"."PartialShipmentPolicy" NOT NULL DEFAULT 'silent',
    "termsPresetId" UUID,
    "paymentTermsText" TEXT,
    "orderValue" DECIMAL(18,4) NOT NULL,
    "vatAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total" DECIMAL(18,4) NOT NULL,
    "advancePct" DECIMAL(9,4),
    "advanceAmount" DECIMAL(18,4),
    "holdSupplierPosUntilAdvance" BOOLEAN NOT NULL DEFAULT true,
    "releaseThresholdPct" DECIMAL(9,4) NOT NULL DEFAULT 95,
    "advanceReceivedAt" TIMESTAMPTZ(3),
    "estimateAed" JSONB,
    "profitFinalAt" TIMESTAMPTZ(3),
    "carryingCostRatePct" DECIMAL(9,4),
    "cancelledAt" TIMESTAMPTZ(3),
    "closedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "searchTsv" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce("ref", '') || ' ' || coalesce("clientPoNumber", '')), 'A')) STORED,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."order_line" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "enquiryLineId" UUID,
    "quotationLineId" UUID,
    "lineNo" INTEGER NOT NULL,
    "clientPartNo" TEXT,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(18,4) NOT NULL,
    "uom" TEXT NOT NULL,
    "rate" DECIMAL(18,4) NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "readyDate" DATE,
    "cancelledQty" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "order_line_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."po_check_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "lineNo" INTEGER,
    "field" "ops"."PoCheckField" NOT NULL,
    "quotationValue" TEXT,
    "poValue" TEXT,
    "decision" "ops"."PoCheckDecision" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "decidedById" UUID,
    "decidedAt" TIMESTAMPTZ(3),

    CONSTRAINT "po_check_item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."order_change" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "kind" "ops"."OrderChangeKind" NOT NULL,
    "status" "ops"."OrderChangeStatus" NOT NULL DEFAULT 'received',
    "requestedAt" TIMESTAMPTZ(3) NOT NULL,
    "sourceMessageId" UUID,
    "details" JSONB NOT NULL,
    "chargePolicy" "ops"."ChargePolicy",
    "chargeAmount" DECIMAL(18,4),
    "chargeCurrency" CHAR(3),
    "costToIndusAed" DECIMAL(18,4),
    "oaRevisionDocumentId" UUID,
    "decidedById" UUID,
    "decidedAt" TIMESTAMPTZ(3),

    CONSTRAINT "order_change_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_po" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "number" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "orderId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "contactId" UUID,
    "supplierQuoteId" UUID,
    "status" "ops"."SupplierPoStatus" NOT NULL DEFAULT 'draft',
    "currency" CHAR(3) NOT NULL,
    "incoterm" TEXT,
    "incotermPlace" TEXT,
    "paymentTerms" TEXT,
    "advancePct" DECIMAL(9,4),
    "total" DECIMAL(18,4) NOT NULL,
    "lateDeliveryClause" TEXT,
    "inspectionRequired" BOOLEAN NOT NULL DEFAULT false,
    "markingInstructions" TEXT,
    "holdUntilClientAdvance" BOOLEAN NOT NULL DEFAULT true,
    "readyDateRequested" DATE,
    "readyDatePromised" DATE,
    "readyDateCurrent" DATE,
    "ackRequestedBy" DATE,
    "acknowledgedAt" TIMESTAMPTZ(3),
    "ackDocumentId" UUID,
    "proformaDocumentId" UUID,
    "approvalActionId" UUID,
    "approvedById" UUID,
    "approvedAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "sentOutboundId" UUID,
    "documentId" UUID,
    "replacesId" UUID,
    "cancelledAt" TIMESTAMPTZ(3),
    "cancelReason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supplier_po_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_po_line" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierPoId" UUID NOT NULL,
    "orderLineId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "partNo" TEXT,
    "qty" DECIMAL(18,4) NOT NULL,
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "readyDate" DATE,
    "ackQty" DECIMAL(18,4),
    "ackUnitPrice" DECIMAL(18,4),
    "ackDescription" TEXT,
    "matchStatus" "ops"."LineMatchStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "supplier_po_line_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."order_match_issue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierPoId" UUID NOT NULL,
    "supplierPoLineId" UUID,
    "field" TEXT NOT NULL,
    "expected" TEXT,
    "found" TEXT,
    "sourceDocumentId" UUID,
    "amountDelta" DECIMAL(18,4),
    "status" "ops"."MatchIssueStatus" NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "decidedById" UUID,
    "decidedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_match_issue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_chase_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierPoId" UUID NOT NULL,
    "at" TIMESTAMPTZ(3) NOT NULL,
    "kind" "ops"."ChaseEventKind" NOT NULL,
    "text" TEXT,
    "readyDate" DATE,
    "messageId" UUID,
    "actionId" UUID,

    CONSTRAINT "supplier_chase_event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."inspection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierPoId" UUID NOT NULL,
    "location" TEXT,
    "scheduledAt" TIMESTAMPTZ(3),
    "bookedAt" TIMESTAMPTZ(3),
    "inspectorKind" "ops"."InspectorKind" NOT NULL,
    "inspectorName" TEXT,
    "status" "ops"."InspectionStatus" NOT NULL DEFAULT 'planned',
    "decisionNote" TEXT,
    "decidedById" UUID,
    "decidedAt" TIMESTAMPTZ(3),
    "reinspectionOfId" UUID,
    "reworkReadyBy" DATE,
    "cost" DECIMAL(18,4),
    "costCurrency" CHAR(3),
    "costAllocation" "ops"."CostAllocation",
    "photoFileIds" UUID[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."inspection_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inspectionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "pointType" "ops"."ItpPointType" NOT NULL,
    "result" "ops"."ItpResult" NOT NULL DEFAULT 'open',
    "note" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "inspection_item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."inspection_document_check" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inspectionId" UUID NOT NULL,
    "documentKind" "ops"."DocumentKind" NOT NULL,
    "against" TEXT,
    "documentId" UUID,
    "status" "ops"."InspectionDocStatus" NOT NULL DEFAULT 'pending',
    "checkResult" TEXT,
    "ok" BOOLEAN,
    "dueAt" DATE,

    CONSTRAINT "inspection_document_check_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."freight_quote" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "shipmentId" UUID,
    "forwarderId" UUID NOT NULL,
    "forwarderRef" TEXT,
    "mode" "ops"."FreightMode" NOT NULL,
    "route" TEXT,
    "transitDays" INTEGER,
    "etaDate" DATE,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "amountUsd" DECIMAL(18,4),
    "includes" JSONB NOT NULL,
    "validUntil" DATE,
    "sourceDocumentId" UUID,
    "status" "ops"."FreightQuoteStatus" NOT NULL DEFAULT 'received',
    "selectedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "freight_quote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."shipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "status" "ops"."ShipmentStatus" NOT NULL DEFAULT 'planned',
    "mode" "ops"."FreightMode",
    "forwarderId" UUID,
    "freightQuoteId" UUID,
    "cases" INTEGER,
    "grossKg" DECIMAL(18,4),
    "volumeM3" DECIMAL(18,4),
    "plannedCollectAt" DATE,
    "eta" DATE,
    "awbNumber" TEXT,
    "blNumber" TEXT,
    "clientTrackingNo" TEXT,
    "clientConsent" "ops"."ClientConsent" NOT NULL DEFAULT 'not_needed',
    "extraFreightAmount" DECIMAL(18,4),
    "extraFreightCcy" CHAR(3),
    "extraFreightPolicy" "ops"."ExtraFreightPolicy",
    "carrierName" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "vehicleNo" TEXT,
    "collectionWindow" TEXT,
    "collectedAt" TIMESTAMPTZ(3),
    "deliveredAt" TIMESTAMPTZ(3),
    "podReceivedBy" TEXT,
    "podStampPresent" BOOLEAN,
    "deliveryCondition" "ops"."DeliveryCondition",
    "deliveryRemarks" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."shipment_line" (
    "shipmentId" UUID NOT NULL,
    "orderLineId" UUID NOT NULL,
    "qty" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "shipment_line_pkey" PRIMARY KEY ("shipmentId","orderLineId")
);

CREATE TABLE IF NOT EXISTS "ops"."shipment_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "at" TIMESTAMPTZ(3) NOT NULL,
    "kind" TEXT NOT NULL,
    "location" TEXT,
    "text" TEXT,
    "clientVisible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "shipment_event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."receiving_count" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "orderLineId" UUID NOT NULL,
    "poQty" DECIMAL(18,4) NOT NULL,
    "countedQty" DECIMAL(18,4) NOT NULL,
    "photoFileIds" UUID[],
    "note" TEXT,
    "countedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receiving_count_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."shipping_doc_requirement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "shipmentId" UUID,
    "documentKind" "ops"."DocumentKind" NOT NULL,
    "issuer" "ops"."DocIssuer" NOT NULL,
    "requiredCount" INTEGER NOT NULL DEFAULT 1,
    "receivedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ops"."ShippingDocStatus" NOT NULL DEFAULT 'awaited',
    "documentIds" UUID[],
    "clientRequired" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "shipping_doc_requirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."claim" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "shipmentId" UUID,
    "orderLineId" UUID,
    "qtyAffected" DECIMAL(18,4),
    "description" TEXT NOT NULL,
    "clientLetterDocumentId" UUID,
    "indusPosition" "ops"."IndusClaimPosition",
    "status" "ops"."ClaimStatus" NOT NULL DEFAULT 'open',
    "replacementCost" DECIMAL(18,4),
    "replacementCcy" CHAR(3),
    "netCostAed" DECIMAL(18,4),
    "creditNoteId" UUID,
    "openedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMPTZ(3),

    CONSTRAINT "claim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."claim_party" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "claimId" UUID NOT NULL,
    "kind" "ops"."ClaimPartyKind" NOT NULL,
    "companyId" UUID,
    "reference" TEXT,
    "amountClaimed" DECIMAL(18,4),
    "currency" CHAR(3),
    "status" "ops"."ClaimStatus" NOT NULL DEFAULT 'open',
    "sentOutboundId" UUID,
    "note" TEXT,

    CONSTRAINT "claim_party_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."order_cost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "kind" "ops"."OrderCostKind" NOT NULL,
    "label" TEXT,
    "estimateAed" DECIMAL(18,4),
    "actualAmount" DECIMAL(18,4),
    "actualCurrency" CHAR(3),
    "actualAed" DECIMAL(18,4),
    "sourceDocumentId" UUID,
    "zohoBillId" TEXT,
    "bookedAt" TIMESTAMPTZ(3),
    "note" TEXT,

    CONSTRAINT "order_cost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."stored_file" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bucket" TEXT NOT NULL DEFAULT 'ops-documents',
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "pageCount" INTEGER,
    "source" "ops"."FileSource" NOT NULL,
    "uploadedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purgedAt" TIMESTAMPTZ(3),

    CONSTRAINT "stored_file_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" "ops"."DocumentKind" NOT NULL,
    "direction" "ops"."DocumentDirection" NOT NULL,
    "number" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "enquiryId" UUID,
    "orderId" UUID,
    "subjectType" "ops"."RecordType",
    "subjectId" UUID,
    "companyId" UUID,
    "status" "ops"."DocumentStatus" NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "supersedesId" UUID,
    "reissueReason" "ops"."ReissueReason",
    "reissueNote" TEXT,
    "cancelledAt" TIMESTAMPTZ(3),
    "cancelledById" UUID,
    "issuedAt" TIMESTAMPTZ(3),
    "sentAt" TIMESTAMPTZ(3),
    "shareOnline" BOOLEAN NOT NULL DEFAULT false,
    "extractedFields" JSONB,
    "sourceMessageId" UUID,
    "zohoId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."document_version" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "fileId" UUID,
    "templateId" UUID,
    "dataSnapshot" JSONB,
    "watermark" TEXT,
    "note" TEXT,
    "sentOutboundId" UUID,
    "createdByKind" "ops"."ActorKind" NOT NULL,
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_version_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."document_text" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fileId" UUID NOT NULL,
    "page" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "layout" JSONB,
    "searchTsv" tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce("text", ''))) STORED,

    CONSTRAINT "document_text_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."share_link" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" UUID,
    "orderId" UUID,
    "tokenHash" TEXT NOT NULL,
    "pathPrefix" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "regeneratedFromId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_link_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."share_link_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "linkId" UUID NOT NULL,
    "kind" "ops"."ShareEventKind" NOT NULL,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceHash" TEXT,
    "isNewDevice" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "country" CHAR(2),

    CONSTRAINT "share_link_event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."client_invoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" "ops"."ClientInvoiceKind" NOT NULL,
    "number" TEXT,
    "orderId" UUID NOT NULL,
    "shipmentId" UUID,
    "clientId" UUID NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "subtotal" DECIMAL(18,4) NOT NULL,
    "vatAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vatAmountAed" DECIMAL(18,4),
    "fxRateToAed" DECIMAL(20,10),
    "total" DECIMAL(18,4) NOT NULL,
    "advanceDeducted" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "amountDue" DECIMAL(18,4) NOT NULL,
    "amountPaid" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "issuedAt" DATE,
    "dueAt" DATE,
    "status" "ops"."ClientInvoiceStatus" NOT NULL DEFAULT 'draft',
    "creditNoteForId" UUID,
    "disputeReason" TEXT,
    "remindersPaused" BOOLEAN NOT NULL DEFAULT false,
    "writtenOffAt" TIMESTAMPTZ(3),
    "writtenOffById" UUID,
    "writeOffReason" TEXT,
    "documentId" UUID,
    "zohoInvoiceId" TEXT,
    "zohoSyncedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "client_invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."payment_received" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "zohoPaymentId" TEXT,
    "clientId" UUID,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "bankRateToAed" DECIMAL(20,10),
    "receivedAt" DATE NOT NULL,
    "reference" TEXT,
    "payeeEntity" TEXT,
    "status" "ops"."PaymentAllocationStatus" NOT NULL DEFAULT 'unallocated',
    "manualById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_received_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."payment_allocation" (
    "paymentId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "absorbedShortfall" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "payment_allocation_pkey" PRIMARY KEY ("paymentId","invoiceId")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_invoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierPoId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "number" TEXT,
    "amount" DECIMAL(18,4),
    "currency" CHAR(3),
    "receivedAt" TIMESTAMPTZ(3),
    "documentId" UUID,
    "status" "ops"."SupplierInvoiceStatus" NOT NULL DEFAULT 'awaited',
    "mismatchAmount" DECIMAL(18,4),
    "mismatchNote" TEXT,
    "zohoBillId" TEXT,

    CONSTRAINT "supplier_invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."supplier_payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierPoId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "kind" "ops"."SupplierPaymentKind" NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "trigger" "ops"."PaymentTrigger" NOT NULL,
    "triggerDays" INTEGER,
    "triggerMetAt" TIMESTAMPTZ(3),
    "dueAt" DATE,
    "status" "ops"."SupplierPaymentStatus" NOT NULL DEFAULT 'draft',
    "checks" JSONB NOT NULL DEFAULT '[]',
    "blockedReason" TEXT,
    "bankAccountId" UUID,
    "fxRateAtQuoting" DECIMAL(20,10),
    "fxRateToday" DECIMAL(20,10),
    "requestedByKind" "ops"."ActorKind" NOT NULL,
    "requestedById" UUID,
    "approvedById" UUID,
    "approvedAt" TIMESTAMPTZ(3),
    "paidAt" TIMESTAMPTZ(3),
    "releasedById" UUID,
    "bankReference" TEXT,
    "zohoPaymentId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supplier_payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."export_evidence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoiceId" UUID NOT NULL,
    "kind" "ops"."ExportEvidenceKind" NOT NULL,
    "status" "ops"."EvidenceStatus" NOT NULL DEFAULT 'missing',
    "reference" TEXT,
    "documentId" UUID,

    CONSTRAINT "export_evidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."month_close" (
    "period" TEXT NOT NULL,
    "status" "ops"."MonthCloseStatus" NOT NULL DEFAULT 'open',
    "checks" JSONB NOT NULL DEFAULT '[]',
    "summary" JSONB,
    "closedById" UUID,
    "closedAt" TIMESTAMPTZ(3),
    "packSentAt" TIMESTAMPTZ(3),

    CONSTRAINT "month_close_pkey" PRIMARY KEY ("period")
);

CREATE TABLE IF NOT EXISTS "ops"."assistant_action" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ref" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "levelAtTime" "ops"."AutopilotLevel" NOT NULL,
    "guardrails" TEXT[],
    "enquiryId" UUID,
    "subjectType" "ops"."RecordType",
    "subjectId" UUID,
    "headline" TEXT NOT NULL,
    "reasons" JSONB NOT NULL,
    "preview" JSONB,
    "checks" JSONB,
    "confidence" "ops"."Confidence",
    "unsureAbout" TEXT,
    "onApproveText" TEXT,
    "options" JSONB,
    "inputs" JSONB,
    "output" JSONB,
    "state" "ops"."ActionState" NOT NULL,
    "chosenOption" TEXT,
    "editDiff" JSONB,
    "rejectReason" TEXT,
    "laterUntil" TIMESTAMPTZ(3),
    "decidedById" UUID,
    "decidedAt" TIMESTAMPTZ(3),
    "undoUntil" TIMESTAMPTZ(3),
    "doneAt" TIMESTAMPTZ(3),
    "failureReason" TEXT,
    "retryOfId" UUID,
    "correctionOfId" UUID,
    "revertOfId" UUID,
    "batchKey" TEXT,
    "costUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "assistant_action_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."assistant_action_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actionId" UUID NOT NULL,
    "fromState" "ops"."ActionState",
    "toState" "ops"."ActionState" NOT NULL,
    "actorKind" "ops"."ActorKind" NOT NULL,
    "actorId" UUID,
    "note" TEXT,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_action_event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."ai_call" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actionId" UUID,
    "enquiryId" UUID,
    "purpose" "ops"."AiPurpose" NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "cacheReadTokens" INTEGER NOT NULL DEFAULT 0,
    "cacheWriteTokens" INTEGER NOT NULL DEFAULT 0,
    "webSearches" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(12,6) NOT NULL,
    "latencyMs" INTEGER,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_call_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."activity_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorKind" "ops"."ActorKind" NOT NULL,
    "actorId" UUID,
    "actionId" UUID,
    "enquiryId" UUID,
    "subjectType" "ops"."RecordType" NOT NULL,
    "subjectId" UUID NOT NULL,
    "kind" "ops"."ActivityKind" NOT NULL,
    "field" TEXT,
    "before" JSONB,
    "after" JSONB,
    "note" TEXT,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "activity_event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."task" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "kind" "ops"."TaskKind" NOT NULL DEFAULT 'general',
    "source" "ops"."TaskSource" NOT NULL DEFAULT 'manual',
    "status" "ops"."TaskStatus" NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMPTZ(3),
    "assigneeId" UUID,
    "enquiryId" UUID,
    "subjectType" "ops"."RecordType",
    "subjectId" UUID,
    "notes" TEXT,
    "createdByActionId" UUID,
    "createdById" UUID,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "event" "ops"."NotificationEvent" NOT NULL,
    "severity" "ops"."NotificationSeverity" NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "enquiryId" UUID,
    "subjectType" "ops"."RecordType",
    "subjectId" UUID,
    "actionUrl" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "channels" "ops"."DeliveryChannel"[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMPTZ(3),
    "resolvedAt" TIMESTAMPTZ(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."saved_search" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "queryText" TEXT NOT NULL,
    "structured" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_search_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."search_document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" "ops"."SearchKind" NOT NULL,
    "recordId" UUID NOT NULL,
    "enquiryId" UUID,
    "refs" TEXT[],
    "title" TEXT NOT NULL,
    "body" TEXT,
    "partNosNorm" TEXT[],
    "occurredAt" TIMESTAMPTZ(3),
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "searchTsv" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce(ops.immutable_array_to_string("refs", ' '), '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(ops.immutable_array_to_string("partNosNorm", ' '), '')), 'A') ||
        setweight(to_tsvector('english', coalesce("title", '')), 'B') ||
        setweight(to_tsvector('english', coalesce("body", '')), 'C')) STORED,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "search_document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."import_job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sources" "ops"."ImportSource"[],
    "monthsBack" INTEGER NOT NULL DEFAULT 24,
    "exclusions" JSONB NOT NULL DEFAULT '{}',
    "budgetUsd" DECIMAL(12,6) NOT NULL,
    "costUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "status" "ops"."ImportJobStatus" NOT NULL DEFAULT 'draft',
    "counters" JSONB NOT NULL DEFAULT '{}',
    "startedById" UUID,
    "startedAt" TIMESTAMPTZ(3),
    "pausedAt" TIMESTAMPTZ(3),
    "finishedAt" TIMESTAMPTZ(3),
    "undoneAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."import_stage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "ops"."ImportStageStatus" NOT NULL DEFAULT 'queued',
    "total" INTEGER,
    "done" INTEGER NOT NULL DEFAULT 0,
    "cursor" JSONB,
    "position" INTEGER NOT NULL,
    "startedAt" TIMESTAMPTZ(3),
    "finishedAt" TIMESTAMPTZ(3),

    CONSTRAINT "import_stage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."import_candidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobId" UUID NOT NULL,
    "entity" "ops"."ImportEntity" NOT NULL,
    "sourceSystem" "ops"."ImportSource" NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "confidence" "ops"."Confidence" NOT NULL,
    "evidence" JSONB,
    "flags" JSONB,
    "status" "ops"."ImportCandidateStatus" NOT NULL DEFAULT 'pending',
    "mergeWithId" UUID,
    "targetType" "ops"."RecordType",
    "targetId" UUID,
    "decidedById" UUID,
    "decidedAt" TIMESTAMPTZ(3),

    CONSTRAINT "import_candidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."imported_record" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobId" UUID,
    "sourceSystem" "ops"."ImportSource" NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "recordType" "ops"."RecordType" NOT NULL,
    "recordId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "undoneAt" TIMESTAMPTZ(3),

    CONSTRAINT "imported_record_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ops"."checklist_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "checklist" "ops"."ChecklistKind" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "ownerOnly" BOOLEAN NOT NULL DEFAULT false,
    "status" "ops"."ChecklistItemStatus" NOT NULL DEFAULT 'todo',
    "detail" JSONB,
    "rollbackNote" TEXT,
    "doneById" UUID,
    "doneAt" TIMESTAMPTZ(3),

    CONSTRAINT "checklist_item_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "trade_name_key" ON "ops"."trade"("name");

CREATE UNIQUE INDEX IF NOT EXISTS "trade_slug_key" ON "ops"."trade"("slug");

CREATE UNIQUE INDEX IF NOT EXISTS "follow_up_cadence_name_key" ON "ops"."follow_up_cadence"("name");

CREATE UNIQUE INDEX IF NOT EXISTS "help_article_slug_key" ON "ops"."help_article"("slug");

CREATE INDEX IF NOT EXISTS "issued_number_recordType_recordId_idx" ON "ops"."issued_number"("recordType", "recordId");

CREATE UNIQUE INDEX IF NOT EXISTS "issued_number_sequenceKey_formatted_key" ON "ops"."issued_number"("sequenceKey", "formatted");

CREATE UNIQUE INDEX IF NOT EXISTS "issued_number_sequenceKey_scope_value_key" ON "ops"."issued_number"("sequenceKey", "scope", "value");

CREATE INDEX IF NOT EXISTS "external_number_observation_sequenceKey_scope_value_idx" ON "ops"."external_number_observation"("sequenceKey", "scope", "value");

CREATE UNIQUE INDEX IF NOT EXISTS "external_number_observation_sequenceKey_formatted_source_key" ON "ops"."external_number_observation"("sequenceKey", "formatted", "source");

CREATE UNIQUE INDEX IF NOT EXISTS "email_template_key_key" ON "ops"."email_template"("key");

CREATE UNIQUE INDEX IF NOT EXISTS "document_template_kind_name_version_key" ON "ops"."document_template"("kind", "name", "version");

CREATE UNIQUE INDEX IF NOT EXISTS "terms_clause_code_key" ON "ops"."terms_clause"("code");

CREATE INDEX IF NOT EXISTS "terms_clause_category_idx" ON "ops"."terms_clause"("category");

CREATE UNIQUE INDEX IF NOT EXISTS "terms_preset_name_key" ON "ops"."terms_preset"("name");

CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "ops"."user"("email");

CREATE INDEX IF NOT EXISTS "auth_account_userId_idx" ON "ops"."auth_account"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "auth_account_provider_providerAccountId_key" ON "ops"."auth_account"("provider", "providerAccountId");

CREATE UNIQUE INDEX IF NOT EXISTS "user_session_sessionToken_key" ON "ops"."user_session"("sessionToken");

CREATE INDEX IF NOT EXISTS "user_session_userId_revokedAt_idx" ON "ops"."user_session"("userId", "revokedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "user_invite_tokenHash_key" ON "ops"."user_invite"("tokenHash");

CREATE INDEX IF NOT EXISTS "user_invite_email_idx" ON "ops"."user_invite"("email");

CREATE INDEX IF NOT EXISTS "backup_code_userId_idx" ON "ops"."backup_code"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_token_tokenHash_key" ON "ops"."password_reset_token"("tokenHash");

CREATE INDEX IF NOT EXISTS "auth_event_userId_at_idx" ON "ops"."auth_event"("userId", "at");

CREATE INDEX IF NOT EXISTS "auth_event_email_at_idx" ON "ops"."auth_event"("email", "at");

CREATE UNIQUE INDEX IF NOT EXISTS "mailbox_address_key" ON "ops"."mailbox"("address");

CREATE UNIQUE INDEX IF NOT EXISTS "gmail_label_mailboxId_name_key" ON "ops"."gmail_label"("mailboxId", "name");

CREATE INDEX IF NOT EXISTS "mail_thread_enquiryId_idx" ON "ops"."mail_thread"("enquiryId");

CREATE UNIQUE INDEX IF NOT EXISTS "mail_thread_mailboxId_gmailThreadId_key" ON "ops"."mail_thread"("mailboxId", "gmailThreadId");

CREATE INDEX IF NOT EXISTS "mail_message_threadId_sentAt_idx" ON "ops"."mail_message"("threadId", "sentAt");

CREATE INDEX IF NOT EXISTS "mail_message_rfcMessageId_idx" ON "ops"."mail_message"("rfcMessageId");

CREATE INDEX IF NOT EXISTS "mail_message_handledState_sentAt_idx" ON "ops"."mail_message"("handledState", "sentAt");

CREATE INDEX IF NOT EXISTS "mail_message_classification_sentAt_idx" ON "ops"."mail_message"("classification", "sentAt");

CREATE INDEX IF NOT EXISTS "mail_message_fromAddress_idx" ON "ops"."mail_message"("fromAddress");

CREATE UNIQUE INDEX IF NOT EXISTS "mail_message_mailboxId_gmailMessageId_key" ON "ops"."mail_message"("mailboxId", "gmailMessageId");

CREATE INDEX IF NOT EXISTS "mail_attachment_messageId_idx" ON "ops"."mail_attachment"("messageId");

CREATE INDEX IF NOT EXISTS "mail_attachment_sha256_idx" ON "ops"."mail_attachment"("sha256");

CREATE INDEX IF NOT EXISTS "mail_link_subjectType_subjectId_idx" ON "ops"."mail_link"("subjectType", "subjectId");

CREATE INDEX IF NOT EXISTS "mail_link_enquiryId_idx" ON "ops"."mail_link"("enquiryId");

CREATE UNIQUE INDEX IF NOT EXISTS "mail_link_messageId_subjectType_subjectId_key" ON "ops"."mail_link"("messageId", "subjectType", "subjectId");

CREATE UNIQUE INDEX IF NOT EXISTS "outbound_email_idempotencyKey_key" ON "ops"."outbound_email"("idempotencyKey");

CREATE INDEX IF NOT EXISTS "outbound_email_status_scheduledFor_idx" ON "ops"."outbound_email"("status", "scheduledFor");

CREATE INDEX IF NOT EXISTS "outbound_email_mailboxId_sentAt_idx" ON "ops"."outbound_email"("mailboxId", "sentAt");

CREATE INDEX IF NOT EXISTS "outbound_email_enquiryId_idx" ON "ops"."outbound_email"("enquiryId");

CREATE INDEX IF NOT EXISTS "outbound_email_subjectType_subjectId_idx" ON "ops"."outbound_email"("subjectType", "subjectId");

CREATE INDEX IF NOT EXISTS "outbound_attachment_outboundId_idx" ON "ops"."outbound_attachment"("outboundId");

CREATE UNIQUE INDEX IF NOT EXISTS "zoho_mapping_object_localKey_key" ON "ops"."zoho_mapping"("object", "localKey");

CREATE UNIQUE INDEX IF NOT EXISTS "zoho_mapping_object_zohoId_key" ON "ops"."zoho_mapping"("object", "zohoId");

CREATE INDEX IF NOT EXISTS "zoho_sync_log_at_idx" ON "ops"."zoho_sync_log"("at");

CREATE INDEX IF NOT EXISTS "zoho_sync_log_status_at_idx" ON "ops"."zoho_sync_log"("status", "at");

CREATE INDEX IF NOT EXISTS "zoho_sync_log_localType_localId_idx" ON "ops"."zoho_sync_log"("localType", "localId");

CREATE UNIQUE INDEX IF NOT EXISTS "fx_rate_currency_rateDate_source_key" ON "ops"."fx_rate"("currency", "rateDate", "source");

CREATE UNIQUE INDEX IF NOT EXISTS "company_zohoContactId_key" ON "ops"."company"("zohoContactId");

CREATE INDEX IF NOT EXISTS "company_name_idx" ON "ops"."company"("name");

CREATE INDEX IF NOT EXISTS "company_primaryDomain_idx" ON "ops"."company"("primaryDomain");

CREATE INDEX IF NOT EXISTS "company_isClient_idx" ON "ops"."company"("isClient");

CREATE INDEX IF NOT EXISTS "company_isSupplier_idx" ON "ops"."company"("isSupplier");

CREATE INDEX IF NOT EXISTS "supplier_profile_tier_idx" ON "ops"."supplier_profile"("tier");

CREATE INDEX IF NOT EXISTS "supplier_profile_type_idx" ON "ops"."supplier_profile"("type");

CREATE INDEX IF NOT EXISTS "contact_companyId_idx" ON "ops"."contact"("companyId");

CREATE INDEX IF NOT EXISTS "contact_email_idx" ON "ops"."contact"("email");

CREATE INDEX IF NOT EXISTS "supplier_line_card_tradeId_idx" ON "ops"."supplier_line_card"("tradeId");

CREATE INDEX IF NOT EXISTS "supplier_line_card_brand_idx" ON "ops"."supplier_line_card"("brand");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_line_card_supplierId_tradeId_brand_key" ON "ops"."supplier_line_card"("supplierId", "tradeId", "brand");

CREATE INDEX IF NOT EXISTS "supplier_bank_account_supplierId_status_idx" ON "ops"."supplier_bank_account"("supplierId", "status");

CREATE INDEX IF NOT EXISTS "compliance_document_companyId_idx" ON "ops"."compliance_document"("companyId");

CREATE INDEX IF NOT EXISTS "compliance_document_expiresAt_idx" ON "ops"."compliance_document"("expiresAt");

CREATE INDEX IF NOT EXISTS "screening_check_companyId_kind_checkedAt_idx" ON "ops"."screening_check"("companyId", "kind", "checkedAt");

CREATE INDEX IF NOT EXISTS "lesson_companyId_idx" ON "ops"."lesson"("companyId");

CREATE INDEX IF NOT EXISTS "lesson_tradeId_idx" ON "ops"."lesson"("tradeId");

CREATE INDEX IF NOT EXISTS "preference_scope_kind_active_idx" ON "ops"."preference"("scope", "kind", "active");

CREATE INDEX IF NOT EXISTS "preference_companyId_idx" ON "ops"."preference"("companyId");

CREATE UNIQUE INDEX IF NOT EXISTS "lead_convertedEnquiryId_key" ON "ops"."lead"("convertedEnquiryId");

CREATE INDEX IF NOT EXISTS "lead_stage_idx" ON "ops"."lead"("stage");

CREATE UNIQUE INDEX IF NOT EXISTS "callback_request_legacyId_key" ON "ops"."callback_request"("legacyId");

CREATE INDEX IF NOT EXISTS "callback_request_status_dueAt_idx" ON "ops"."callback_request"("status", "dueAt");

CREATE INDEX IF NOT EXISTS "callback_request_email_receivedAt_idx" ON "ops"."callback_request"("email", "receivedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "website_submission_deliveryId_key" ON "ops"."website_submission"("deliveryId");

CREATE UNIQUE INDEX IF NOT EXISTS "website_submission_legacyId_key" ON "ops"."website_submission"("legacyId");

CREATE INDEX IF NOT EXISTS "website_submission_status_receivedAt_idx" ON "ops"."website_submission"("status", "receivedAt");

CREATE INDEX IF NOT EXISTS "client_portal_submission_status_createdAt_idx" ON "ops"."client_portal_submission"("status", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "enquiry_ref_key" ON "ops"."enquiry"("ref");

CREATE INDEX IF NOT EXISTS "enquiry_stage_deadline_idx" ON "ops"."enquiry"("stage", "deadline");

CREATE INDEX IF NOT EXISTS "enquiry_clientId_receivedAt_idx" ON "ops"."enquiry"("clientId", "receivedAt");

CREATE INDEX IF NOT EXISTS "enquiry_clientRef_idx" ON "ops"."enquiry"("clientRef");

CREATE INDEX IF NOT EXISTS "enquiry_ownerId_stage_idx" ON "ops"."enquiry"("ownerId", "stage");

CREATE UNIQUE INDEX IF NOT EXISTS "enquiry_revision_enquiryId_label_key" ON "ops"."enquiry_revision"("enquiryId", "label");

CREATE INDEX IF NOT EXISTS "enquiry_assumption_enquiryId_idx" ON "ops"."enquiry_assumption"("enquiryId");

CREATE UNIQUE INDEX IF NOT EXISTS "enquiry_line_selectedQuoteLineId_key" ON "ops"."enquiry_line"("selectedQuoteLineId");

CREATE INDEX IF NOT EXISTS "enquiry_line_status_idx" ON "ops"."enquiry_line"("status");

CREATE INDEX IF NOT EXISTS "enquiry_line_partId_idx" ON "ops"."enquiry_line"("partId");

CREATE INDEX IF NOT EXISTS "enquiry_line_tradeGroupId_idx" ON "ops"."enquiry_line"("tradeGroupId");

CREATE UNIQUE INDEX IF NOT EXISTS "enquiry_line_enquiryId_no_key" ON "ops"."enquiry_line"("enquiryId", "no");

CREATE INDEX IF NOT EXISTS "client_question_enquiryId_status_idx" ON "ops"."client_question"("enquiryId", "status");

CREATE INDEX IF NOT EXISTS "trade_group_enquiryId_idx" ON "ops"."trade_group"("enquiryId");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_rfq_ref_key" ON "ops"."supplier_rfq"("ref");

CREATE INDEX IF NOT EXISTS "supplier_rfq_enquiryId_idx" ON "ops"."supplier_rfq"("enquiryId");

CREATE INDEX IF NOT EXISTS "supplier_rfq_status_idx" ON "ops"."supplier_rfq"("status");

CREATE INDEX IF NOT EXISTS "supplier_rfq_line_lineId_idx" ON "ops"."supplier_rfq_line"("lineId");

CREATE INDEX IF NOT EXISTS "supplier_rfq_recipient_status_nextChaseAt_idx" ON "ops"."supplier_rfq_recipient"("status", "nextChaseAt");

CREATE INDEX IF NOT EXISTS "supplier_rfq_recipient_supplierId_idx" ON "ops"."supplier_rfq_recipient"("supplierId");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_rfq_recipient_rfqId_supplierId_key" ON "ops"."supplier_rfq_recipient"("rfqId", "supplierId");

CREATE INDEX IF NOT EXISTS "rfq_change_rfqId_idx" ON "ops"."rfq_change"("rfqId");

CREATE INDEX IF NOT EXISTS "supplier_question_status_idx" ON "ops"."supplier_question"("status");

CREATE INDEX IF NOT EXISTS "research_run_enquiryId_idx" ON "ops"."research_run"("enquiryId");

CREATE INDEX IF NOT EXISTS "research_run_status_idx" ON "ops"."research_run"("status");

CREATE INDEX IF NOT EXISTS "research_candidate_runId_idx" ON "ops"."research_candidate"("runId");

CREATE INDEX IF NOT EXISTS "part_partNoNorm_idx" ON "ops"."part"("partNoNorm");

CREATE UNIQUE INDEX IF NOT EXISTS "part_partNoNorm_brand_key" ON "ops"."part"("partNoNorm", "brand");

CREATE INDEX IF NOT EXISTS "part_alias_norm_idx" ON "ops"."part_alias"("norm");

CREATE UNIQUE INDEX IF NOT EXISTS "part_alias_partId_norm_key" ON "ops"."part_alias"("partId", "norm");

CREATE INDEX IF NOT EXISTS "part_equivalence_partBId_idx" ON "ops"."part_equivalence"("partBId");

CREATE UNIQUE INDEX IF NOT EXISTS "part_equivalence_partAId_partBId_key" ON "ops"."part_equivalence"("partAId", "partBId");

CREATE UNIQUE INDEX IF NOT EXISTS "catalogue_suggestion_partId_key" ON "ops"."catalogue_suggestion"("partId");

CREATE INDEX IF NOT EXISTS "catalogue_suggestion_status_idx" ON "ops"."catalogue_suggestion"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "tender_enquiryId_key" ON "ops"."tender"("enquiryId");

CREATE INDEX IF NOT EXISTS "tender_closingAt_idx" ON "ops"."tender"("closingAt");

CREATE UNIQUE INDEX IF NOT EXISTS "tender_plan_step_tenderId_key_key" ON "ops"."tender_plan_step"("tenderId", "key");

CREATE INDEX IF NOT EXISTS "tender_requirement_tenderId_idx" ON "ops"."tender_requirement"("tenderId");

CREATE UNIQUE INDEX IF NOT EXISTS "tender_query_tenderId_ref_key" ON "ops"."tender_query"("tenderId", "ref");

CREATE UNIQUE INDEX IF NOT EXISTS "tender_addendum_tenderId_no_key" ON "ops"."tender_addendum"("tenderId", "no");

CREATE UNIQUE INDEX IF NOT EXISTS "approved_make_buyerId_commodity_make_key" ON "ops"."approved_make"("buyerId", "commodity", "make");

CREATE INDEX IF NOT EXISTS "approved_make_check_lineId_idx" ON "ops"."approved_make_check"("lineId");

CREATE INDEX IF NOT EXISTS "bid_pack_item_tenderId_idx" ON "ops"."bid_pack_item"("tenderId");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_quote_supersedesId_key" ON "ops"."supplier_quote"("supersedesId");

CREATE INDEX IF NOT EXISTS "supplier_quote_enquiryId_idx" ON "ops"."supplier_quote"("enquiryId");

CREATE INDEX IF NOT EXISTS "supplier_quote_rfqId_idx" ON "ops"."supplier_quote"("rfqId");

CREATE INDEX IF NOT EXISTS "supplier_quote_status_idx" ON "ops"."supplier_quote"("status");

CREATE INDEX IF NOT EXISTS "supplier_quote_fileHash_idx" ON "ops"."supplier_quote"("fileHash");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_quote_supplierId_supplierRef_version_key" ON "ops"."supplier_quote"("supplierId", "supplierRef", "version");

CREATE INDEX IF NOT EXISTS "supplier_quote_source_quoteId_idx" ON "ops"."supplier_quote_source"("quoteId");

CREATE INDEX IF NOT EXISTS "supplier_quote_line_quoteId_idx" ON "ops"."supplier_quote_line"("quoteId");

CREATE INDEX IF NOT EXISTS "supplier_quote_line_enquiryLineId_idx" ON "ops"."supplier_quote_line"("enquiryLineId");

CREATE INDEX IF NOT EXISTS "supplier_quote_line_partId_createdAt_idx" ON "ops"."supplier_quote_line"("partId", "createdAt");

CREATE INDEX IF NOT EXISTS "quote_exception_quoteId_status_idx" ON "ops"."quote_exception"("quoteId", "status");

CREATE INDEX IF NOT EXISTS "landed_cost_supplierQuoteLineId_isCurrent_idx" ON "ops"."landed_cost"("supplierQuoteLineId", "isCurrent");

CREATE INDEX IF NOT EXISTS "landed_cost_enquiryLineId_idx" ON "ops"."landed_cost"("enquiryLineId");

CREATE INDEX IF NOT EXISTS "landed_cost_component_landedCostId_idx" ON "ops"."landed_cost_component"("landedCostId");

CREATE INDEX IF NOT EXISTS "freight_rate_card_destination_mode_idx" ON "ops"."freight_rate_card"("destination", "mode");

CREATE INDEX IF NOT EXISTS "line_selection_enquiryLineId_isCurrent_idx" ON "ops"."line_selection"("enquiryLineId", "isCurrent");

CREATE INDEX IF NOT EXISTS "deviation_enquiryLineId_idx" ON "ops"."deviation"("enquiryLineId");

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_number_key" ON "ops"."quotation"("number");

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_supersedesId_key" ON "ops"."quotation"("supersedesId");

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_documentId_key" ON "ops"."quotation"("documentId");

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_zohoEstimateId_key" ON "ops"."quotation"("zohoEstimateId");

CREATE INDEX IF NOT EXISTS "quotation_enquiryId_idx" ON "ops"."quotation"("enquiryId");

CREATE INDEX IF NOT EXISTS "quotation_status_nextTouchAt_idx" ON "ops"."quotation"("status", "nextTouchAt");

CREATE INDEX IF NOT EXISTS "quotation_clientId_sentAt_idx" ON "ops"."quotation"("clientId", "sentAt");

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_baseNumber_revision_key" ON "ops"."quotation"("baseNumber", "revision");

CREATE INDEX IF NOT EXISTS "quotation_line_enquiryLineId_idx" ON "ops"."quotation_line"("enquiryLineId");

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_line_quotationId_position_key" ON "ops"."quotation_line"("quotationId", "position");

CREATE INDEX IF NOT EXISTS "quotation_deviation_quotationId_idx" ON "ops"."quotation_deviation"("quotationId");

CREATE INDEX IF NOT EXISTS "quotation_term_quotationId_idx" ON "ops"."quotation_term"("quotationId");

CREATE INDEX IF NOT EXISTS "follow_up_entry_enquiryId_at_idx" ON "ops"."follow_up_entry"("enquiryId", "at");

CREATE UNIQUE INDEX IF NOT EXISTS "order_ref_key" ON "ops"."order"("ref");

CREATE INDEX IF NOT EXISTS "order_enquiryId_idx" ON "ops"."order"("enquiryId");

CREATE INDEX IF NOT EXISTS "order_stage_idx" ON "ops"."order"("stage");

CREATE INDEX IF NOT EXISTS "order_clientId_idx" ON "ops"."order"("clientId");

CREATE UNIQUE INDEX IF NOT EXISTS "order_line_orderId_lineNo_key" ON "ops"."order_line"("orderId", "lineNo");

CREATE INDEX IF NOT EXISTS "po_check_item_orderId_idx" ON "ops"."po_check_item"("orderId");

CREATE INDEX IF NOT EXISTS "order_change_orderId_idx" ON "ops"."order_change"("orderId");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_po_number_key" ON "ops"."supplier_po"("number");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_po_documentId_key" ON "ops"."supplier_po"("documentId");

CREATE INDEX IF NOT EXISTS "supplier_po_orderId_idx" ON "ops"."supplier_po"("orderId");

CREATE INDEX IF NOT EXISTS "supplier_po_supplierId_idx" ON "ops"."supplier_po"("supplierId");

CREATE INDEX IF NOT EXISTS "supplier_po_status_readyDateCurrent_idx" ON "ops"."supplier_po"("status", "readyDateCurrent");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_po_line_supplierPoId_position_key" ON "ops"."supplier_po_line"("supplierPoId", "position");

CREATE INDEX IF NOT EXISTS "order_match_issue_supplierPoId_status_idx" ON "ops"."order_match_issue"("supplierPoId", "status");

CREATE INDEX IF NOT EXISTS "supplier_chase_event_supplierPoId_at_idx" ON "ops"."supplier_chase_event"("supplierPoId", "at");

CREATE INDEX IF NOT EXISTS "inspection_supplierPoId_idx" ON "ops"."inspection"("supplierPoId");

CREATE INDEX IF NOT EXISTS "inspection_item_inspectionId_idx" ON "ops"."inspection_item"("inspectionId");

CREATE INDEX IF NOT EXISTS "inspection_document_check_inspectionId_idx" ON "ops"."inspection_document_check"("inspectionId");

CREATE INDEX IF NOT EXISTS "freight_quote_orderId_idx" ON "ops"."freight_quote"("orderId");

CREATE UNIQUE INDEX IF NOT EXISTS "shipment_orderId_label_key" ON "ops"."shipment"("orderId", "label");

CREATE INDEX IF NOT EXISTS "shipment_event_shipmentId_at_idx" ON "ops"."shipment_event"("shipmentId", "at");

CREATE INDEX IF NOT EXISTS "receiving_count_shipmentId_idx" ON "ops"."receiving_count"("shipmentId");

CREATE INDEX IF NOT EXISTS "shipping_doc_requirement_orderId_idx" ON "ops"."shipping_doc_requirement"("orderId");

CREATE INDEX IF NOT EXISTS "claim_orderId_idx" ON "ops"."claim"("orderId");

CREATE INDEX IF NOT EXISTS "claim_party_claimId_idx" ON "ops"."claim_party"("claimId");

CREATE INDEX IF NOT EXISTS "order_cost_orderId_idx" ON "ops"."order_cost"("orderId");

CREATE INDEX IF NOT EXISTS "stored_file_sha256_idx" ON "ops"."stored_file"("sha256");

CREATE UNIQUE INDEX IF NOT EXISTS "stored_file_bucket_path_key" ON "ops"."stored_file"("bucket", "path");

CREATE UNIQUE INDEX IF NOT EXISTS "document_supersedesId_key" ON "ops"."document"("supersedesId");

CREATE INDEX IF NOT EXISTS "document_enquiryId_idx" ON "ops"."document"("enquiryId");

CREATE INDEX IF NOT EXISTS "document_orderId_idx" ON "ops"."document"("orderId");

CREATE INDEX IF NOT EXISTS "document_subjectType_subjectId_idx" ON "ops"."document"("subjectType", "subjectId");

CREATE UNIQUE INDEX IF NOT EXISTS "document_kind_number_revision_key" ON "ops"."document"("kind", "number", "revision");

CREATE UNIQUE INDEX IF NOT EXISTS "document_version_documentId_version_key" ON "ops"."document_version"("documentId", "version");

CREATE UNIQUE INDEX IF NOT EXISTS "document_text_fileId_page_key" ON "ops"."document_text"("fileId", "page");

CREATE UNIQUE INDEX IF NOT EXISTS "share_link_tokenHash_key" ON "ops"."share_link"("tokenHash");

CREATE INDEX IF NOT EXISTS "share_link_documentId_idx" ON "ops"."share_link"("documentId");

CREATE INDEX IF NOT EXISTS "share_link_orderId_idx" ON "ops"."share_link"("orderId");

CREATE INDEX IF NOT EXISTS "share_link_event_linkId_at_idx" ON "ops"."share_link_event"("linkId", "at");

CREATE UNIQUE INDEX IF NOT EXISTS "client_invoice_number_key" ON "ops"."client_invoice"("number");

CREATE UNIQUE INDEX IF NOT EXISTS "client_invoice_documentId_key" ON "ops"."client_invoice"("documentId");

CREATE UNIQUE INDEX IF NOT EXISTS "client_invoice_zohoInvoiceId_key" ON "ops"."client_invoice"("zohoInvoiceId");

CREATE INDEX IF NOT EXISTS "client_invoice_orderId_idx" ON "ops"."client_invoice"("orderId");

CREATE INDEX IF NOT EXISTS "client_invoice_status_dueAt_idx" ON "ops"."client_invoice"("status", "dueAt");

CREATE INDEX IF NOT EXISTS "client_invoice_clientId_idx" ON "ops"."client_invoice"("clientId");

CREATE UNIQUE INDEX IF NOT EXISTS "payment_received_zohoPaymentId_key" ON "ops"."payment_received"("zohoPaymentId");

CREATE INDEX IF NOT EXISTS "payment_received_status_idx" ON "ops"."payment_received"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_invoice_zohoBillId_key" ON "ops"."supplier_invoice"("zohoBillId");

CREATE INDEX IF NOT EXISTS "supplier_invoice_supplierPoId_idx" ON "ops"."supplier_invoice"("supplierPoId");

CREATE UNIQUE INDEX IF NOT EXISTS "supplier_payment_zohoPaymentId_key" ON "ops"."supplier_payment"("zohoPaymentId");

CREATE INDEX IF NOT EXISTS "supplier_payment_status_dueAt_idx" ON "ops"."supplier_payment"("status", "dueAt");

CREATE INDEX IF NOT EXISTS "supplier_payment_supplierPoId_idx" ON "ops"."supplier_payment"("supplierPoId");

CREATE UNIQUE INDEX IF NOT EXISTS "export_evidence_invoiceId_kind_key" ON "ops"."export_evidence"("invoiceId", "kind");

CREATE UNIQUE INDEX IF NOT EXISTS "assistant_action_ref_key" ON "ops"."assistant_action"("ref");

CREATE INDEX IF NOT EXISTS "assistant_action_state_createdAt_idx" ON "ops"."assistant_action"("state", "createdAt");

CREATE INDEX IF NOT EXISTS "assistant_action_enquiryId_createdAt_idx" ON "ops"."assistant_action"("enquiryId", "createdAt");

CREATE INDEX IF NOT EXISTS "assistant_action_actionKey_createdAt_idx" ON "ops"."assistant_action"("actionKey", "createdAt");

CREATE INDEX IF NOT EXISTS "assistant_action_subjectType_subjectId_idx" ON "ops"."assistant_action"("subjectType", "subjectId");

CREATE INDEX IF NOT EXISTS "assistant_action_undoUntil_idx" ON "ops"."assistant_action"("undoUntil");

CREATE INDEX IF NOT EXISTS "assistant_action_event_actionId_at_idx" ON "ops"."assistant_action_event"("actionId", "at");

CREATE INDEX IF NOT EXISTS "ai_call_at_idx" ON "ops"."ai_call"("at");

CREATE INDEX IF NOT EXISTS "ai_call_enquiryId_purpose_idx" ON "ops"."ai_call"("enquiryId", "purpose");

CREATE INDEX IF NOT EXISTS "activity_event_enquiryId_at_idx" ON "ops"."activity_event"("enquiryId", "at");

CREATE INDEX IF NOT EXISTS "activity_event_subjectType_subjectId_at_idx" ON "ops"."activity_event"("subjectType", "subjectId", "at");

CREATE INDEX IF NOT EXISTS "task_assigneeId_status_dueAt_idx" ON "ops"."task"("assigneeId", "status", "dueAt");

CREATE INDEX IF NOT EXISTS "task_enquiryId_idx" ON "ops"."task"("enquiryId");

CREATE INDEX IF NOT EXISTS "notification_userId_dedupeKey_idx" ON "ops"."notification"("userId", "dedupeKey");

CREATE INDEX IF NOT EXISTS "notification_userId_resolvedAt_createdAt_idx" ON "ops"."notification"("userId", "resolvedAt", "createdAt");

CREATE INDEX IF NOT EXISTS "search_document_enquiryId_idx" ON "ops"."search_document"("enquiryId");

CREATE UNIQUE INDEX IF NOT EXISTS "search_document_kind_recordId_key" ON "ops"."search_document"("kind", "recordId");

CREATE UNIQUE INDEX IF NOT EXISTS "import_stage_jobId_key_key" ON "ops"."import_stage"("jobId", "key");

CREATE INDEX IF NOT EXISTS "import_candidate_jobId_entity_status_confidence_idx" ON "ops"."import_candidate"("jobId", "entity", "status", "confidence");

CREATE UNIQUE INDEX IF NOT EXISTS "import_candidate_jobId_entity_sourceSystem_sourceKey_key" ON "ops"."import_candidate"("jobId", "entity", "sourceSystem", "sourceKey");

CREATE INDEX IF NOT EXISTS "imported_record_jobId_idx" ON "ops"."imported_record"("jobId");

CREATE INDEX IF NOT EXISTS "imported_record_recordType_recordId_idx" ON "ops"."imported_record"("recordType", "recordId");

CREATE UNIQUE INDEX IF NOT EXISTS "imported_record_sourceSystem_sourceKey_recordType_key" ON "ops"."imported_record"("sourceSystem", "sourceKey", "recordType");

CREATE UNIQUE INDEX IF NOT EXISTS "checklist_item_checklist_key_key" ON "ops"."checklist_item"("checklist", "key");

DO $$ BEGIN
  ALTER TABLE "ops"."trade" ADD CONSTRAINT "trade_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ops"."trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."number_counter" ADD CONSTRAINT "number_counter_sequenceKey_fkey" FOREIGN KEY ("sequenceKey") REFERENCES "ops"."number_sequence"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."issued_number" ADD CONSTRAINT "issued_number_sequenceKey_fkey" FOREIGN KEY ("sequenceKey") REFERENCES "ops"."number_sequence"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."external_number_observation" ADD CONSTRAINT "external_number_observation_sequenceKey_fkey" FOREIGN KEY ("sequenceKey") REFERENCES "ops"."number_sequence"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."autopilot_setting" ADD CONSTRAINT "autopilot_setting_actionKey_fkey" FOREIGN KEY ("actionKey") REFERENCES "ops"."autopilot_action_def"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."terms_preset_clause" ADD CONSTRAINT "terms_preset_clause_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "ops"."terms_preset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."terms_preset_clause" ADD CONSTRAINT "terms_preset_clause_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "ops"."terms_clause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."auth_account" ADD CONSTRAINT "auth_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."user_session" ADD CONSTRAINT "user_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."user_invite" ADD CONSTRAINT "user_invite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."backup_code" ADD CONSTRAINT "backup_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."password_reset_token" ADD CONSTRAINT "password_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."auth_event" ADD CONSTRAINT "auth_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."user_preference" ADD CONSTRAINT "user_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."notification_preference" ADD CONSTRAINT "notification_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tip_state" ADD CONSTRAINT "tip_state_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mailbox" ADD CONSTRAINT "mailbox_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mailbox_sync_state" ADD CONSTRAINT "mailbox_sync_state_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "ops"."mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."gmail_label" ADD CONSTRAINT "gmail_label_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "ops"."mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mail_thread" ADD CONSTRAINT "mail_thread_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "ops"."mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mail_thread" ADD CONSTRAINT "mail_thread_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mail_message" ADD CONSTRAINT "mail_message_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "ops"."mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mail_message" ADD CONSTRAINT "mail_message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ops"."mail_thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mail_attachment" ADD CONSTRAINT "mail_attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ops"."mail_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mail_attachment" ADD CONSTRAINT "mail_attachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ops"."stored_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mail_link" ADD CONSTRAINT "mail_link_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ops"."mail_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mail_link" ADD CONSTRAINT "mail_link_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."outbound_email" ADD CONSTRAINT "outbound_email_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "ops"."mailbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."outbound_email" ADD CONSTRAINT "outbound_email_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ops"."mail_thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."outbound_email" ADD CONSTRAINT "outbound_email_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ops"."assistant_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."outbound_email" ADD CONSTRAINT "outbound_email_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."outbound_attachment" ADD CONSTRAINT "outbound_attachment_outboundId_fkey" FOREIGN KEY ("outboundId") REFERENCES "ops"."outbound_email"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."outbound_attachment" ADD CONSTRAINT "outbound_attachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ops"."stored_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."company" ADD CONSTRAINT "company_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_profile" ADD CONSTRAINT "client_profile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_profile" ADD CONSTRAINT "client_profile_termsPresetId_fkey" FOREIGN KEY ("termsPresetId") REFERENCES "ops"."terms_preset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_profile" ADD CONSTRAINT "client_profile_followUpCadenceId_fkey" FOREIGN KEY ("followUpCadenceId") REFERENCES "ops"."follow_up_cadence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_profile" ADD CONSTRAINT "supplier_profile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."contact" ADD CONSTRAINT "contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_line_card" ADD CONSTRAINT "supplier_line_card_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "ops"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_line_card" ADD CONSTRAINT "supplier_line_card_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "ops"."trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_bank_account" ADD CONSTRAINT "supplier_bank_account_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."compliance_document" ADD CONSTRAINT "compliance_document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."compliance_document" ADD CONSTRAINT "compliance_document_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ops"."stored_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."screening_check" ADD CONSTRAINT "screening_check_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."lesson" ADD CONSTRAINT "lesson_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."lesson" ADD CONSTRAINT "lesson_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "ops"."trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."lesson" ADD CONSTRAINT "lesson_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ops"."part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."preference" ADD CONSTRAINT "preference_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."preference_evidence" ADD CONSTRAINT "preference_evidence_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "ops"."preference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."preference_evidence" ADD CONSTRAINT "preference_evidence_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ops"."assistant_action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."lead" ADD CONSTRAINT "lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."lead" ADD CONSTRAINT "lead_convertedEnquiryId_fkey" FOREIGN KEY ("convertedEnquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."callback_request" ADD CONSTRAINT "callback_request_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ops"."lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."callback_request" ADD CONSTRAINT "callback_request_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."website_submission" ADD CONSTRAINT "website_submission_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_portal_submission" ADD CONSTRAINT "client_portal_submission_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ops"."share_link"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_portal_submission" ADD CONSTRAINT "client_portal_submission_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry" ADD CONSTRAINT "enquiry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry" ADD CONSTRAINT "enquiry_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "ops"."contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry" ADD CONSTRAINT "enquiry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry" ADD CONSTRAINT "enquiry_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry" ADD CONSTRAINT "enquiry_splitFromId_fkey" FOREIGN KEY ("splitFromId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry_revision" ADD CONSTRAINT "enquiry_revision_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry_assumption" ADD CONSTRAINT "enquiry_assumption_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry_assumption" ADD CONSTRAINT "enquiry_assumption_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry_line" ADD CONSTRAINT "enquiry_line_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry_line" ADD CONSTRAINT "enquiry_line_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ops"."part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry_line" ADD CONSTRAINT "enquiry_line_tradeGroupId_fkey" FOREIGN KEY ("tradeGroupId") REFERENCES "ops"."trade_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry_line" ADD CONSTRAINT "enquiry_line_selectedQuoteLineId_fkey" FOREIGN KEY ("selectedQuoteLineId") REFERENCES "ops"."supplier_quote_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_question" ADD CONSTRAINT "client_question_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_question" ADD CONSTRAINT "client_question_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."trade_group" ADD CONSTRAINT "trade_group_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."trade_group" ADD CONSTRAINT "trade_group_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "ops"."trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq" ADD CONSTRAINT "supplier_rfq_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq" ADD CONSTRAINT "supplier_rfq_tradeGroupId_fkey" FOREIGN KEY ("tradeGroupId") REFERENCES "ops"."trade_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq_line" ADD CONSTRAINT "supplier_rfq_line_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "ops"."supplier_rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq_line" ADD CONSTRAINT "supplier_rfq_line_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq_recipient" ADD CONSTRAINT "supplier_rfq_recipient_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "ops"."supplier_rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq_recipient" ADD CONSTRAINT "supplier_rfq_recipient_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq_recipient" ADD CONSTRAINT "supplier_rfq_recipient_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "ops"."contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq_recipient" ADD CONSTRAINT "supplier_rfq_recipient_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ops"."mail_thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."rfq_change" ADD CONSTRAINT "rfq_change_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "ops"."supplier_rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_question" ADD CONSTRAINT "supplier_question_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "ops"."supplier_rfq_recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_question" ADD CONSTRAINT "supplier_question_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_question" ADD CONSTRAINT "supplier_question_sourceMessageId_fkey" FOREIGN KEY ("sourceMessageId") REFERENCES "ops"."mail_message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_question" ADD CONSTRAINT "supplier_question_clientQuestionId_fkey" FOREIGN KEY ("clientQuestionId") REFERENCES "ops"."client_question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."research_run" ADD CONSTRAINT "research_run_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."research_candidate" ADD CONSTRAINT "research_candidate_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ops"."research_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."research_candidate" ADD CONSTRAINT "research_candidate_tradeGroupId_fkey" FOREIGN KEY ("tradeGroupId") REFERENCES "ops"."trade_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."research_candidate" ADD CONSTRAINT "research_candidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."part" ADD CONSTRAINT "part_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "ops"."trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."part_alias" ADD CONSTRAINT "part_alias_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ops"."part"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."part_equivalence" ADD CONSTRAINT "part_equivalence_partAId_fkey" FOREIGN KEY ("partAId") REFERENCES "ops"."part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."part_equivalence" ADD CONSTRAINT "part_equivalence_partBId_fkey" FOREIGN KEY ("partBId") REFERENCES "ops"."part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."catalogue_suggestion" ADD CONSTRAINT "catalogue_suggestion_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ops"."part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender" ADD CONSTRAINT "tender_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender_plan_step" ADD CONSTRAINT "tender_plan_step_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "ops"."tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender_requirement" ADD CONSTRAINT "tender_requirement_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "ops"."tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender_query" ADD CONSTRAINT "tender_query_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "ops"."tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender_query" ADD CONSTRAINT "tender_query_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender_addendum" ADD CONSTRAINT "tender_addendum_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "ops"."tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."approved_make" ADD CONSTRAINT "approved_make_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."approved_make" ADD CONSTRAINT "approved_make_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "ops"."tender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."approved_make_check" ADD CONSTRAINT "approved_make_check_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."bid_pack_item" ADD CONSTRAINT "bid_pack_item_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "ops"."tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote" ADD CONSTRAINT "supplier_quote_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote" ADD CONSTRAINT "supplier_quote_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "ops"."supplier_rfq"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote" ADD CONSTRAINT "supplier_quote_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "ops"."supplier_rfq_recipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote" ADD CONSTRAINT "supplier_quote_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote" ADD CONSTRAINT "supplier_quote_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "ops"."supplier_quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote" ADD CONSTRAINT "supplier_quote_fxRateId_fkey" FOREIGN KEY ("fxRateId") REFERENCES "ops"."fx_rate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote_source" ADD CONSTRAINT "supplier_quote_source_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "ops"."supplier_quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote_source" ADD CONSTRAINT "supplier_quote_source_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ops"."mail_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote_line" ADD CONSTRAINT "supplier_quote_line_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "ops"."supplier_quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote_line" ADD CONSTRAINT "supplier_quote_line_enquiryLineId_fkey" FOREIGN KEY ("enquiryLineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote_line" ADD CONSTRAINT "supplier_quote_line_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ops"."part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quote_exception" ADD CONSTRAINT "quote_exception_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "ops"."supplier_quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quote_exception" ADD CONSTRAINT "quote_exception_quoteLineId_fkey" FOREIGN KEY ("quoteLineId") REFERENCES "ops"."supplier_quote_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."landed_cost" ADD CONSTRAINT "landed_cost_supplierQuoteLineId_fkey" FOREIGN KEY ("supplierQuoteLineId") REFERENCES "ops"."supplier_quote_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."landed_cost" ADD CONSTRAINT "landed_cost_enquiryLineId_fkey" FOREIGN KEY ("enquiryLineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."landed_cost_component" ADD CONSTRAINT "landed_cost_component_landedCostId_fkey" FOREIGN KEY ("landedCostId") REFERENCES "ops"."landed_cost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."freight_rate_card" ADD CONSTRAINT "freight_rate_card_forwarderId_fkey" FOREIGN KEY ("forwarderId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."line_selection" ADD CONSTRAINT "line_selection_enquiryLineId_fkey" FOREIGN KEY ("enquiryLineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."line_selection" ADD CONSTRAINT "line_selection_supplierQuoteLineId_fkey" FOREIGN KEY ("supplierQuoteLineId") REFERENCES "ops"."supplier_quote_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."deviation" ADD CONSTRAINT "deviation_enquiryLineId_fkey" FOREIGN KEY ("enquiryLineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."deviation" ADD CONSTRAINT "deviation_supplierQuoteLineId_fkey" FOREIGN KEY ("supplierQuoteLineId") REFERENCES "ops"."supplier_quote_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_attentionId_fkey" FOREIGN KEY ("attentionId") REFERENCES "ops"."contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "ops"."quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_supplementaryOfId_fkey" FOREIGN KEY ("supplementaryOfId") REFERENCES "ops"."quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_termsPresetId_fkey" FOREIGN KEY ("termsPresetId") REFERENCES "ops"."terms_preset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation_line" ADD CONSTRAINT "quotation_line_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "ops"."quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation_line" ADD CONSTRAINT "quotation_line_enquiryLineId_fkey" FOREIGN KEY ("enquiryLineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation_line" ADD CONSTRAINT "quotation_line_sourceQuoteLineId_fkey" FOREIGN KEY ("sourceQuoteLineId") REFERENCES "ops"."supplier_quote_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation_deviation" ADD CONSTRAINT "quotation_deviation_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "ops"."quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation_deviation" ADD CONSTRAINT "quotation_deviation_deviationId_fkey" FOREIGN KEY ("deviationId") REFERENCES "ops"."deviation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation_term" ADD CONSTRAINT "quotation_term_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "ops"."quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation_term" ADD CONSTRAINT "quotation_term_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "ops"."terms_clause"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."follow_up_entry" ADD CONSTRAINT "follow_up_entry_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."follow_up_entry" ADD CONSTRAINT "follow_up_entry_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "ops"."quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order" ADD CONSTRAINT "order_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order" ADD CONSTRAINT "order_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "ops"."quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order" ADD CONSTRAINT "order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order" ADD CONSTRAINT "order_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "ops"."contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order" ADD CONSTRAINT "order_termsPresetId_fkey" FOREIGN KEY ("termsPresetId") REFERENCES "ops"."terms_preset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_line" ADD CONSTRAINT "order_line_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_line" ADD CONSTRAINT "order_line_enquiryLineId_fkey" FOREIGN KEY ("enquiryLineId") REFERENCES "ops"."enquiry_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_line" ADD CONSTRAINT "order_line_quotationLineId_fkey" FOREIGN KEY ("quotationLineId") REFERENCES "ops"."quotation_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."po_check_item" ADD CONSTRAINT "po_check_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_change" ADD CONSTRAINT "order_change_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po" ADD CONSTRAINT "supplier_po_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po" ADD CONSTRAINT "supplier_po_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po" ADD CONSTRAINT "supplier_po_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "ops"."contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po" ADD CONSTRAINT "supplier_po_supplierQuoteId_fkey" FOREIGN KEY ("supplierQuoteId") REFERENCES "ops"."supplier_quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po" ADD CONSTRAINT "supplier_po_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po" ADD CONSTRAINT "supplier_po_replacesId_fkey" FOREIGN KEY ("replacesId") REFERENCES "ops"."supplier_po"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po_line" ADD CONSTRAINT "supplier_po_line_supplierPoId_fkey" FOREIGN KEY ("supplierPoId") REFERENCES "ops"."supplier_po"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po_line" ADD CONSTRAINT "supplier_po_line_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "ops"."order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_match_issue" ADD CONSTRAINT "order_match_issue_supplierPoId_fkey" FOREIGN KEY ("supplierPoId") REFERENCES "ops"."supplier_po"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_chase_event" ADD CONSTRAINT "supplier_chase_event_supplierPoId_fkey" FOREIGN KEY ("supplierPoId") REFERENCES "ops"."supplier_po"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."inspection" ADD CONSTRAINT "inspection_supplierPoId_fkey" FOREIGN KEY ("supplierPoId") REFERENCES "ops"."supplier_po"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."inspection" ADD CONSTRAINT "inspection_reinspectionOfId_fkey" FOREIGN KEY ("reinspectionOfId") REFERENCES "ops"."inspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."inspection_item" ADD CONSTRAINT "inspection_item_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "ops"."inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."inspection_document_check" ADD CONSTRAINT "inspection_document_check_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "ops"."inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."freight_quote" ADD CONSTRAINT "freight_quote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."freight_quote" ADD CONSTRAINT "freight_quote_forwarderId_fkey" FOREIGN KEY ("forwarderId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipment" ADD CONSTRAINT "shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipment" ADD CONSTRAINT "shipment_forwarderId_fkey" FOREIGN KEY ("forwarderId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipment" ADD CONSTRAINT "shipment_freightQuoteId_fkey" FOREIGN KEY ("freightQuoteId") REFERENCES "ops"."freight_quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipment_line" ADD CONSTRAINT "shipment_line_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "ops"."shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipment_line" ADD CONSTRAINT "shipment_line_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "ops"."order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipment_event" ADD CONSTRAINT "shipment_event_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "ops"."shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."receiving_count" ADD CONSTRAINT "receiving_count_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "ops"."shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."receiving_count" ADD CONSTRAINT "receiving_count_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "ops"."order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipping_doc_requirement" ADD CONSTRAINT "shipping_doc_requirement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipping_doc_requirement" ADD CONSTRAINT "shipping_doc_requirement_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "ops"."shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."claim" ADD CONSTRAINT "claim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."claim" ADD CONSTRAINT "claim_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "ops"."shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."claim" ADD CONSTRAINT "claim_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "ops"."order_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."claim_party" ADD CONSTRAINT "claim_party_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ops"."claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."claim_party" ADD CONSTRAINT "claim_party_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_cost" ADD CONSTRAINT "order_cost_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document" ADD CONSTRAINT "document_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document" ADD CONSTRAINT "document_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document" ADD CONSTRAINT "document_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "ops"."document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document_version" ADD CONSTRAINT "document_version_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ops"."document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document_version" ADD CONSTRAINT "document_version_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ops"."stored_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document_version" ADD CONSTRAINT "document_version_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ops"."document_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document_text" ADD CONSTRAINT "document_text_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ops"."stored_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."share_link" ADD CONSTRAINT "share_link_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ops"."document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."share_link" ADD CONSTRAINT "share_link_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."share_link_event" ADD CONSTRAINT "share_link_event_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "ops"."share_link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_invoice" ADD CONSTRAINT "client_invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ops"."order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_invoice" ADD CONSTRAINT "client_invoice_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "ops"."shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_invoice" ADD CONSTRAINT "client_invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_invoice" ADD CONSTRAINT "client_invoice_creditNoteForId_fkey" FOREIGN KEY ("creditNoteForId") REFERENCES "ops"."client_invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."payment_received" ADD CONSTRAINT "payment_received_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."payment_allocation" ADD CONSTRAINT "payment_allocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "ops"."payment_received"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."payment_allocation" ADD CONSTRAINT "payment_allocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ops"."client_invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_invoice" ADD CONSTRAINT "supplier_invoice_supplierPoId_fkey" FOREIGN KEY ("supplierPoId") REFERENCES "ops"."supplier_po"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_invoice" ADD CONSTRAINT "supplier_invoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_payment" ADD CONSTRAINT "supplier_payment_supplierPoId_fkey" FOREIGN KEY ("supplierPoId") REFERENCES "ops"."supplier_po"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_payment" ADD CONSTRAINT "supplier_payment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "ops"."company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_payment" ADD CONSTRAINT "supplier_payment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "ops"."supplier_bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_payment" ADD CONSTRAINT "supplier_payment_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."export_evidence" ADD CONSTRAINT "export_evidence_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ops"."client_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."assistant_action" ADD CONSTRAINT "assistant_action_actionKey_fkey" FOREIGN KEY ("actionKey") REFERENCES "ops"."autopilot_action_def"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."assistant_action" ADD CONSTRAINT "assistant_action_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."assistant_action" ADD CONSTRAINT "assistant_action_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."assistant_action" ADD CONSTRAINT "assistant_action_correctionOfId_fkey" FOREIGN KEY ("correctionOfId") REFERENCES "ops"."assistant_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."assistant_action_event" ADD CONSTRAINT "assistant_action_event_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ops"."assistant_action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."ai_call" ADD CONSTRAINT "ai_call_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ops"."assistant_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."activity_event" ADD CONSTRAINT "activity_event_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."task" ADD CONSTRAINT "task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."task" ADD CONSTRAINT "task_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."notification" ADD CONSTRAINT "notification_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."saved_search" ADD CONSTRAINT "saved_search_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."import_stage" ADD CONSTRAINT "import_stage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ops"."import_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."import_candidate" ADD CONSTRAINT "import_candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ops"."import_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."imported_record" ADD CONSTRAINT "imported_record_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ops"."import_job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."fx_rate" ADD CONSTRAINT "fx_rate_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_profile" ADD CONSTRAINT "client_profile_quotingCurrency_fkey" FOREIGN KEY ("quotingCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_profile" ADD CONSTRAINT "supplier_profile_quotesCurrency_fkey" FOREIGN KEY ("quotesCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_profile" ADD CONSTRAINT "supplier_profile_trialPoMaxCurrency_fkey" FOREIGN KEY ("trialPoMaxCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_bank_account" ADD CONSTRAINT "supplier_bank_account_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."own_bank_account" ADD CONSTRAINT "own_bank_account_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."lead" ADD CONSTRAINT "lead_estCurrency_fkey" FOREIGN KEY ("estCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry" ADD CONSTRAINT "enquiry_estCurrency_fkey" FOREIGN KEY ("estCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry" ADD CONSTRAINT "enquiry_lostWinningCcy_fkey" FOREIGN KEY ("lostWinningCcy") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq_recipient" ADD CONSTRAINT "supplier_rfq_recipient_askCurrency_fkey" FOREIGN KEY ("askCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender" ADD CONSTRAINT "tender_bidBondCurrency_fkey" FOREIGN KEY ("bidBondCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote" ADD CONSTRAINT "supplier_quote_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."landed_cost" ADD CONSTRAINT "landed_cost_supplierCurrency_fkey" FOREIGN KEY ("supplierCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."freight_rate_card" ADD CONSTRAINT "freight_rate_card_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order" ADD CONSTRAINT "order_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_change" ADD CONSTRAINT "order_change_chargeCurrency_fkey" FOREIGN KEY ("chargeCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_po" ADD CONSTRAINT "supplier_po_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."inspection" ADD CONSTRAINT "inspection_costCurrency_fkey" FOREIGN KEY ("costCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."freight_quote" ADD CONSTRAINT "freight_quote_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."shipment" ADD CONSTRAINT "shipment_extraFreightCcy_fkey" FOREIGN KEY ("extraFreightCcy") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."claim" ADD CONSTRAINT "claim_replacementCcy_fkey" FOREIGN KEY ("replacementCcy") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."claim_party" ADD CONSTRAINT "claim_party_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_cost" ADD CONSTRAINT "order_cost_actualCurrency_fkey" FOREIGN KEY ("actualCurrency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_invoice" ADD CONSTRAINT "client_invoice_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."payment_received" ADD CONSTRAINT "payment_received_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_invoice" ADD CONSTRAINT "supplier_invoice_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_payment" ADD CONSTRAINT "supplier_payment_currency_fkey" FOREIGN KEY ("currency") REFERENCES "ops"."currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."settings_entry" ADD CONSTRAINT "settings_entry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."number_sequence" ADD CONSTRAINT "number_sequence_seededById_fkey" FOREIGN KEY ("seededById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."issued_number" ADD CONSTRAINT "issued_number_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."autopilot_setting" ADD CONSTRAINT "autopilot_setting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."guardrail" ADD CONSTRAINT "guardrail_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."email_template" ADD CONSTRAINT "email_template_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."integration_connection" ADD CONSTRAINT "integration_connection_connectedById_fkey" FOREIGN KEY ("connectedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mailbox" ADD CONSTRAINT "mailbox_connectedById_fkey" FOREIGN KEY ("connectedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."mailbox" ADD CONSTRAINT "mailbox_pausedById_fkey" FOREIGN KEY ("pausedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."outbound_email" ADD CONSTRAINT "outbound_email_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_profile" ADD CONSTRAINT "supplier_profile_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_bank_account" ADD CONSTRAINT "supplier_bank_account_callbackRecordedById_fkey" FOREIGN KEY ("callbackRecordedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."lesson" ADD CONSTRAINT "lesson_savedById_fkey" FOREIGN KEY ("savedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."callback_request" ADD CONSTRAINT "callback_request_calledById_fkey" FOREIGN KEY ("calledById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry" ADD CONSTRAINT "enquiry_pathChosenById_fkey" FOREIGN KEY ("pathChosenById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."enquiry_revision" ADD CONSTRAINT "enquiry_revision_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_rfq" ADD CONSTRAINT "supplier_rfq_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."research_run" ADD CONSTRAINT "research_run_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."research_candidate" ADD CONSTRAINT "research_candidate_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."part_equivalence" ADD CONSTRAINT "part_equivalence_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender" ADD CONSTRAINT "tender_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."tender_query" ADD CONSTRAINT "tender_query_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."approved_make_check" ADD CONSTRAINT "approved_make_check_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_quote" ADD CONSTRAINT "supplier_quote_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quote_exception" ADD CONSTRAINT "quote_exception_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."landed_cost_component" ADD CONSTRAINT "landed_cost_component_overriddenById_fkey" FOREIGN KEY ("overriddenById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."deviation" ADD CONSTRAINT "deviation_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."quotation" ADD CONSTRAINT "quotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."po_check_item" ADD CONSTRAINT "po_check_item_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_change" ADD CONSTRAINT "order_change_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."order_match_issue" ADD CONSTRAINT "order_match_issue_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."inspection" ADD CONSTRAINT "inspection_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."freight_quote" ADD CONSTRAINT "freight_quote_selectedById_fkey" FOREIGN KEY ("selectedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."stored_file" ADD CONSTRAINT "stored_file_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document" ADD CONSTRAINT "document_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."document_version" ADD CONSTRAINT "document_version_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."share_link" ADD CONSTRAINT "share_link_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."client_invoice" ADD CONSTRAINT "client_invoice_writtenOffById_fkey" FOREIGN KEY ("writtenOffById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."payment_received" ADD CONSTRAINT "payment_received_manualById_fkey" FOREIGN KEY ("manualById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_payment" ADD CONSTRAINT "supplier_payment_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."supplier_payment" ADD CONSTRAINT "supplier_payment_releasedById_fkey" FOREIGN KEY ("releasedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."month_close" ADD CONSTRAINT "month_close_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."task" ADD CONSTRAINT "task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."import_job" ADD CONSTRAINT "import_job_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."import_candidate" ADD CONSTRAINT "import_candidate_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."checklist_item" ADD CONSTRAINT "checklist_item_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
