-- Indus Operations · S10-T04 · the supplier document request and its uploads (board 50, /u/[token], C28)
--
--   ops.supplier_document_request  one secure upload link per request: only the SHA-256 of the 32-byte token is stored
--                                  (tokenHash, unique), the kinds asked for, expiry (settings supplierDocs.request,
--                                  14 days), the next reminder (every 4 days) and how many went, the email that carried
--                                  the link. status open → completed | expired | revoked.
--   ops.supplier_document_upload   one row per file a supplier uploaded through the link: the stored file, the kind, the
--                                  compliance document it filled, a salted hash of the IP and a coarse user-agent class
--                                  (never the raw IP or agent string).
--
-- Index (status, nextReminderAt) for the clock; RLS + ops_app grants. Idempotent.

BEGIN;

CREATE TABLE IF NOT EXISTS ops.supplier_document_request (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "supplierId"      uuid NOT NULL REFERENCES ops.company(id),
  "contactId"       uuid REFERENCES ops.contact(id),
  "tokenHash"       text NOT NULL UNIQUE CHECK ("tokenHash" ~ '^[0-9a-f]{64}$'),
  "requestedKinds"  text[] NOT NULL CHECK (cardinality("requestedKinds") > 0),
  "expiresAt"       timestamptz(3) NOT NULL,
  "nextReminderAt"  timestamptz(3),
  "remindersSent"   integer NOT NULL DEFAULT 0,
  "remindersOn"     boolean NOT NULL DEFAULT true,
  "status"          text NOT NULL DEFAULT 'open' CHECK ("status" IN ('open', 'completed', 'expired', 'revoked')),
  "outboundId"      uuid REFERENCES ops.outbound_email(id),
  "actionId"        uuid REFERENCES ops.assistant_action(id),
  "threadId"        uuid REFERENCES ops.mail_thread(id),
  "createdById"     uuid REFERENCES ops."user"(id),
  "createdAt"       timestamptz(3) NOT NULL DEFAULT now(),
  "completedAt"     timestamptz(3),
  "revokedAt"       timestamptz(3)
);
CREATE INDEX IF NOT EXISTS supplier_document_request_clock_idx
  ON ops.supplier_document_request ("status", "nextReminderAt");
CREATE INDEX IF NOT EXISTS supplier_document_request_supplier_idx
  ON ops.supplier_document_request ("supplierId", "createdAt" DESC);

CREATE TABLE IF NOT EXISTS ops.supplier_document_upload (
  "id"                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "requestId"             uuid NOT NULL REFERENCES ops.supplier_document_request(id),
  "storedFileId"          uuid NOT NULL REFERENCES ops.stored_file(id),
  "kind"                  text NOT NULL,
  "complianceDocumentId"  uuid REFERENCES ops.compliance_document(id),
  "uploadedAt"            timestamptz(3) NOT NULL DEFAULT now(),
  "ipHash"                text,
  "userAgentClass"        text
);
CREATE INDEX IF NOT EXISTS supplier_document_upload_request_idx ON ops.supplier_document_upload ("requestId");

ALTER TABLE ops.supplier_document_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.supplier_document_upload ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'supplier_document_request'
                 AND policyname = 'ops_app_all') THEN
    CREATE POLICY ops_app_all ON ops.supplier_document_request AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'supplier_document_upload'
                 AND policyname = 'ops_app_all') THEN
    CREATE POLICY ops_app_all ON ops.supplier_document_upload AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE ON ops.supplier_document_request TO ops_app;
GRANT SELECT, INSERT ON ops.supplier_document_upload TO ops_app;

COMMIT;
