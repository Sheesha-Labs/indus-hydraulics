-- Enquiry intake: inbound procurement enquiries pasted in by staff.
--
-- WHY A NEW TABLE RATHER THAN Rfq:
--   rfq_lines."productId" is a REQUIRED FK to products. An inbound procurement
--   line ("GATE VALVE 6IN 300LB 3.1 MTC") has no catalogue match, so it cannot
--   be stored as an rfq_line at all. The existing free-text intakes work around
--   this by creating an Rfq with zero lines and dumping the part list into
--   customerMessage, and submitRfq silently drops unmatched SKUs. Rfq also
--   already means "a signed-in customer asked about catalogue products", which
--   is a different thing from "a buyer sent us a tender".
--
-- PROVENANCE IS NOT OPTIONAL HERE. Every line carries the verbatim source text
-- it was extracted from plus the extractor version, because a wrong quantity
-- flows into a supplier RFQ and then a customer quote before any human sees it.
-- Review state is an enum plus typed flags, never a confidence float.

CREATE TYPE "EnquirySourceKind" AS ENUM ('pasted', 'email', 'portal');

CREATE TYPE "EnquiryStatus" AS ENUM (
  'triage', 'researching', 'rfq_sent', 'comparing', 'quoted', 'won', 'lost', 'abandoned'
);

CREATE TYPE "EnquiryLineSourceKind" AS ENUM ('body', 'title', 'attachment', 'manual');

CREATE TYPE "EnquiryLineReviewStatus" AS ENUM ('needs_review', 'confirmed', 'rejected');

CREATE TABLE "enquiries" (
  "id"            TEXT PRIMARY KEY,
  "code"          TEXT NOT NULL,
  "title"         TEXT NOT NULL,
  "bidNo"         TEXT,
  "revision"      TEXT,
  "buyerName"     TEXT,
  "sourcePortal"  TEXT,
  "sourceKind"    "EnquirySourceKind" NOT NULL DEFAULT 'pasted',
  "sourceRef"     TEXT,
  "closingAt"     TIMESTAMP(3),
  "status"        "EnquiryStatus" NOT NULL DEFAULT 'triage',
  "accountId"     TEXT,
  "assignedToId"  TEXT,
  "createdById"   TEXT,
  "rawText"       TEXT NOT NULL,
  "notes"         TEXT,
  "extractorName" TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "enquiries_accountId_fkey"    FOREIGN KEY ("accountId")    REFERENCES "accounts"("id")     ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "enquiries_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "staff_users"("id")  ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "enquiries_createdById_fkey"  FOREIGN KEY ("createdById")  REFERENCES "staff_users"("id")  ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "enquiries_code_key" ON "enquiries"("code");
CREATE INDEX "enquiries_status_idx"      ON "enquiries"("status");
CREATE INDEX "enquiries_closingAt_idx"   ON "enquiries"("closingAt");
CREATE INDEX "enquiries_accountId_idx"   ON "enquiries"("accountId");

-- Re-issued tenders (R1/R2/RF/Clone were 13.7% of the measured corpus) arrive as
-- genuinely distinct notifications. Keyed on the solicitation number so a
-- re-paste of the SAME revision is caught, while a real revision is not.
-- Partial, because sourceRef is null for hand-typed enquiries that have no bid number.
CREATE UNIQUE INDEX "enquiries_sourceRef_key"
  ON "enquiries"("sourceRef")
  WHERE "sourceRef" IS NOT NULL;

CREATE TABLE "enquiry_lines" (
  "id"            TEXT PRIMARY KEY,
  "enquiryId"     TEXT NOT NULL,
  "position"      INTEGER NOT NULL DEFAULT 0,
  "description"   TEXT NOT NULL,
  "partNumber"    TEXT,
  "qty"           DECIMAL(14,3),
  "unit"          TEXT,
  "requiredBy"    TIMESTAMP(3),
  "certification" TEXT,
  "sourceKind"    "EnquiryLineSourceKind"   NOT NULL DEFAULT 'body',
  -- Verbatim substring of enquiries."rawText" this row was extracted from.
  -- Mandatory for machine-extracted rows; null only for sourceKind = 'manual'.
  "sourceText"    TEXT,
  "reviewStatus"  "EnquiryLineReviewStatus" NOT NULL DEFAULT 'needs_review',
  -- Typed reasons, e.g. {date_ambiguous_dmy, qty_not_stated}. Never a float.
  "reviewFlags"   TEXT[] NOT NULL DEFAULT '{}',
  "notes"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "enquiry_lines_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "enquiry_lines_enquiryId_idx"    ON "enquiry_lines"("enquiryId");
CREATE INDEX "enquiry_lines_reviewStatus_idx" ON "enquiry_lines"("reviewStatus");

-- A machine-extracted row without its source text is unauditable, which is the
-- whole point of the column. Enforced in the database, not just in the action.
ALTER TABLE "enquiry_lines" ADD CONSTRAINT "enquiry_lines_sourcetext_required"
  CHECK ("sourceKind" = 'manual' OR "sourceText" IS NOT NULL);
