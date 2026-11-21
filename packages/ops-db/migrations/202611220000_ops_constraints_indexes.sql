-- Indus Operations · migration 4 of 8 · constraints and indexes
--
-- Everything 06-map-schema.md §11 row 4 lists that Prisma's schema language cannot express:
--   * CHECK constraints: reference formats, revision >= 1, chaser count, ordered part
--     equivalence pairs, money >= 0, ISO country codes, locked notification channels, the
--     supplier-payment approver rule and the Gmail-sent rule on outbound_email.
--   * Partial unique indexes: one active owner, one live contact per company and address,
--     one current landed cost per quote line, one current selection per enquiry line, one
--     verified bank account per supplier and currency, one open notification per dedupe key.
--   * Trigram GIN indexes (part numbers, aliases, company names, search refs and part numbers)
--     with the operator class qualified by pg_trgm's schema, looked up here (migration 2).
--   * GIN on every generated "searchTsv" column (migration 3).
--
-- Idempotent: each CHECK is added only when no constraint of that name exists on the table;
-- every index is IF NOT EXISTS.
--
-- Money >= 0 is applied to prices, line amounts and document totals. Columns that can be
-- legitimately negative (deltas, mismatches, profit, shortfalls) are deliberately left out.
-- NULL passes every CHECK, so "price to follow" lines are unaffected.

BEGIN;

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT * FROM (VALUES
      -- Reference formats (§4 rule 1). NULL until allocated, where the column is nullable.
      ('enquiry',               'enquiry_ref_format',              $c$"ref" ~ '^ENQ-\d{4}-\d{4,}$'$c$),
      ('supplier_rfq',          'supplier_rfq_ref_format',         $c$"ref" ~ '^IH-RFQ-\d{4}-P\d{2,}$'$c$),
      ('quotation',             'quotation_number_format',         $c$"number" ~ '^INDUS/Q\d+(-R\d+)?$'$c$),
      -- Revisions start at 1.
      ('quotation',             'quotation_revision_min',          $c$"revision" >= 1$c$),
      ('supplier_po',           'supplier_po_revision_min',        $c$"revision" >= 1$c$),
      ('document',              'document_revision_min',           $c$"revision" >= 1$c$),
      -- At most three chasers per supplier RFQ recipient (board 136).
      ('supplier_rfq_recipient','supplier_rfq_recipient_chasers_range', $c$"chasersSent" BETWEEN 0 AND 3$c$),
      -- One row per unordered pair: A < B.
      ('part_equivalence',      'part_equivalence_ordered_pair',   $c$"partAId" < "partBId"$c$),
      -- ISO 3166-1 alpha-2 country codes.
      ('work_calendar_day',     'work_calendar_day_country_iso',   $c$"country" ~ '^[A-Z]{2}$'$c$),
      ('user_session',          'user_session_country_iso',        $c$"country" ~ '^[A-Z]{2}$'$c$),
      ('auth_event',            'auth_event_country_iso',          $c$"country" ~ '^[A-Z]{2}$'$c$),
      ('company',               'company_country_iso',             $c$"country" ~ '^[A-Z]{2}$'$c$),
      ('callback_request',      'callback_request_phone_country_iso', $c$"phoneCountry" ~ '^[A-Z]{2}$'$c$),
      ('research_candidate',    'research_candidate_country_iso',  $c$"country" ~ '^[A-Z]{2}$'$c$),
      ('share_link_event',      'share_link_event_country_iso',    $c$"country" ~ '^[A-Z]{2}$'$c$),
      -- Locked notification events can never be switched off (board 181).
      ('notification_preference', 'notification_preference_locked_not_off',
        $c$NOT ("locked" AND "channel" = 'off')$c$),
      ('notification_preference', 'notification_preference_forced_events_not_off',
        $c$NOT ("event" IN ('bank_detail_change', 'mailbox_disconnected', 'assistant_paused') AND "channel" = 'off')$c$),
      -- A supplier payment is approved or paid only with a named approver (§9.10).
      ('supplier_payment',      'supplier_payment_approver_required',
        $c$"status" NOT IN ('approved', 'paid') OR "approvedById" IS NOT NULL$c$),
      -- A Gmail send is "sent" only once Gmail has returned its message id.
      ('outbound_email',        'outbound_email_gmail_sent_has_id',
        $c$NOT ("channel" = 'gmail' AND "status" = 'sent') OR "gmailMessageId" IS NOT NULL$c$),
      -- Money >= 0.
      ('supplier_quote',        'supplier_quote_total_nonneg',      $c$"totalAmount" >= 0$c$),
      ('supplier_quote_line',   'supplier_quote_line_money_nonneg', $c$"unitPrice" >= 0 AND "lineTotal" >= 0$c$),
      ('landed_cost',           'landed_cost_money_nonneg',
        $c$"supplierUnitPrice" >= 0 AND "convertedUnitAed" >= 0 AND "landedUnitAed" >= 0$c$),
      ('quotation',             'quotation_money_nonneg',
        $c$"subtotal" >= 0 AND "vatAmount" >= 0 AND "total" >= 0$c$),
      ('quotation_line',        'quotation_line_money_nonneg',      $c$"rate" >= 0 AND "amount" >= 0$c$),
      ('order',                 'order_money_nonneg',
        $c$"orderValue" >= 0 AND "vatAmount" >= 0 AND "total" >= 0$c$),
      ('order_line',            'order_line_money_nonneg',          $c$"rate" >= 0 AND "amount" >= 0$c$),
      ('supplier_po',           'supplier_po_total_nonneg',         $c$"total" >= 0$c$),
      ('supplier_po_line',      'supplier_po_line_money_nonneg',    $c$"unitPrice" >= 0 AND "amount" >= 0$c$),
      ('freight_quote',         'freight_quote_amount_nonneg',      $c$"amount" >= 0$c$),
      ('client_invoice',        'client_invoice_money_nonneg',
        $c$"subtotal" >= 0 AND "vatAmount" >= 0 AND "total" >= 0 AND "amountDue" >= 0 AND "amountPaid" >= 0$c$),
      ('payment_received',      'payment_received_amount_nonneg',   $c$"amount" >= 0$c$),
      ('payment_allocation',    'payment_allocation_amount_nonneg', $c$"amount" >= 0$c$),
      ('supplier_invoice',      'supplier_invoice_amount_nonneg',   $c$"amount" >= 0$c$),
      ('supplier_payment',      'supplier_payment_amount_nonneg',   $c$"amount" >= 0$c$)
    ) AS t(tbl, name, expr)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
       WHERE conname = c.name AND conrelid = format('ops.%I', c.tbl)::regclass
    ) THEN
      EXECUTE format('ALTER TABLE ops.%I ADD CONSTRAINT %I CHECK (%s)', c.tbl, c.name, c.expr);
    END IF;
  END LOOP;
END $$;

-- ── Partial unique indexes ──────────────────────────────────────────────────────────────

-- Exactly one active owner (ownership transfer swaps roles inside one transaction).
CREATE UNIQUE INDEX IF NOT EXISTS user_one_active_owner
  ON ops."user" ("role") WHERE "role" = 'owner' AND "status" = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS contact_company_email_live_key
  ON ops."contact" ("companyId", lower("email"))
  WHERE "email" IS NOT NULL AND "archivedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS landed_cost_one_current
  ON ops."landed_cost" ("supplierQuoteLineId") WHERE "isCurrent";

CREATE UNIQUE INDEX IF NOT EXISTS line_selection_one_current
  ON ops."line_selection" ("enquiryLineId") WHERE "isCurrent";

CREATE UNIQUE INDEX IF NOT EXISTS supplier_bank_account_one_verified
  ON ops."supplier_bank_account" ("supplierId", "currency")
  WHERE "status" = 'verified' AND "supersededAt" IS NULL;

-- A resolved notification may recur with the same dedupe key; an open one may not.
CREATE UNIQUE INDEX IF NOT EXISTS notification_open_dedupe_key
  ON ops."notification" ("userId", "dedupeKey") WHERE "resolvedAt" IS NULL;

-- ── Trigram indexes (operator class schema-qualified) ───────────────────────────────────

DO $$
DECLARE
  trgm text;
  i record;
BEGIN
  SELECT extnamespace::regnamespace::text INTO trgm FROM pg_extension WHERE extname = 'pg_trgm';
  IF trgm IS NULL THEN
    RAISE EXCEPTION 'pg_trgm is not installed; apply migration 2 (ops_extensions) first';
  END IF;

  FOR i IN
    SELECT * FROM (VALUES
      ('part_partNoNorm_trgm',            'part',            $x$"partNoNorm"$x$),
      ('part_alias_norm_trgm',            'part_alias',      $x$"norm"$x$),
      ('company_name_trgm',               'company',         $x$"name"$x$),
      ('search_document_refs_trgm',       'search_document', $x$(ops.immutable_array_to_string("refs", ' '))$x$),
      ('search_document_partNosNorm_trgm','search_document', $x$(ops.immutable_array_to_string("partNosNorm", ' '))$x$)
    ) AS t(name, tbl, expr)
  LOOP
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON ops.%I USING gin (%s %I.gin_trgm_ops)',
      i.name, i.tbl, i.expr, trgm
    );
  END LOOP;
END $$;

-- ── Full-text GIN on every generated searchTsv ──────────────────────────────────────────

CREATE INDEX IF NOT EXISTS mail_message_tsv_gin    ON ops."mail_message"    USING gin ("searchTsv");
CREATE INDEX IF NOT EXISTS company_tsv_gin         ON ops."company"         USING gin ("searchTsv");
CREATE INDEX IF NOT EXISTS part_tsv_gin            ON ops."part"            USING gin ("searchTsv");
CREATE INDEX IF NOT EXISTS enquiry_tsv_gin         ON ops."enquiry"         USING gin ("searchTsv");
CREATE INDEX IF NOT EXISTS quotation_tsv_gin       ON ops."quotation"       USING gin ("searchTsv");
CREATE INDEX IF NOT EXISTS order_tsv_gin           ON ops."order"           USING gin ("searchTsv");
CREATE INDEX IF NOT EXISTS document_text_tsv_gin   ON ops."document_text"   USING gin ("searchTsv");
CREATE INDEX IF NOT EXISTS search_document_tsv_gin ON ops."search_document" USING gin ("searchTsv");

-- Assertion: every generated searchTsv column has a GIN index.
DO $$
DECLARE
  missing text;
BEGIN
  SELECT string_agg(c.relname, ', ') INTO missing
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'ops' AND c.relkind = 'r' AND a.attname = 'searchTsv' AND NOT a.attisdropped
     AND NOT EXISTS (
       SELECT 1 FROM pg_index x JOIN pg_class ic ON ic.oid = x.indexrelid
        JOIN pg_am am ON am.oid = ic.relam
        WHERE x.indrelid = c.oid AND am.amname = 'gin' AND a.attnum = ANY (x.indkey::int2[])
     );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'searchTsv without a GIN index: %', missing;
  END IF;
END $$;

COMMIT;
