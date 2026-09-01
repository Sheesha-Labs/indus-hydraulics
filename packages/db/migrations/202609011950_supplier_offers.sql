-- Supplier offers (inbound quotations).
--
-- Two CHECKs carry the safety here:
--   * a row with a price must carry the verbatim sourceQuote it came from —
--     these figures become a customer's price, and a number with no source
--     cannot be audited when it turns out to be a decimal misparse;
--   * selection is an event with an actor, never a boolean, because choosing
--     an `alternative` line means substituting a part on a hydraulic system.
--
-- decimalConvention is stored per OFFER, not per value: "1.234,56" and
-- "1,234.56" differ by 1000x and both are plausible, so the convention is
-- decided by voting across the whole document and recorded with it.

CREATE TYPE "SupplierOfferStatus" AS ENUM ('needs_review', 'accepted', 'rejected', 'superseded');

CREATE TYPE "OfferLineKind" AS ENUM ('quoted', 'alternative', 'declined');

CREATE TYPE "OfferAttributionMethod" AS ENUM ('reference_token', 'manual', 'fuzzy');

CREATE TABLE "supplier_offers" (
  "id"           TEXT PRIMARY KEY,
  "enquiryId"    TEXT NOT NULL,
  "supplierId"   TEXT,
  "supplierName" TEXT NOT NULL,
  "status"       "SupplierOfferStatus" NOT NULL DEFAULT 'needs_review',
  "currency"     TEXT,
  "incoterm"     TEXT,
  "validUntil"   TIMESTAMP(3),
  "decimalConvention" TEXT,
  "attributionMethod" "OfferAttributionMethod" NOT NULL DEFAULT 'manual',
  "rawText"      TEXT NOT NULL,
  "extractorName" TEXT,
  "notes"        TEXT,
  "createdById"  TEXT,
  "receivedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "supplier_offers_enquiryId_fkey"   FOREIGN KEY ("enquiryId")   REFERENCES "enquiries"("id")   ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "supplier_offers_supplierId_fkey"  FOREIGN KEY ("supplierId")  REFERENCES "suppliers"("id")   ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "supplier_offers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "supplier_offers_enquiryId_idx"  ON "supplier_offers"("enquiryId");
CREATE INDEX "supplier_offers_supplierId_idx" ON "supplier_offers"("supplierId");
CREATE INDEX "supplier_offers_status_idx"     ON "supplier_offers"("status");

CREATE TABLE "supplier_offer_lines" (
  "id"            TEXT PRIMARY KEY,
  "offerId"       TEXT NOT NULL,
  "enquiryLineId" TEXT,
  "position"      INTEGER NOT NULL DEFAULT 0,
  "description"   TEXT NOT NULL,
  "kind"          "OfferLineKind" NOT NULL DEFAULT 'quoted',
  "unitPrice"     DECIMAL(14,4),
  "qty"           DECIMAL(14,3),
  "moq"           DECIMAL(14,3),
  "leadTimeDays"  INTEGER,
  "statedTotal"   DECIMAL(14,4),
  "sourceQuote"   TEXT,
  "reviewFlags"   TEXT[] NOT NULL DEFAULT '{}',
  "selectedById"  TEXT,
  "selectedAt"    TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "supplier_offer_lines_offerId_fkey"       FOREIGN KEY ("offerId")       REFERENCES "supplier_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "supplier_offer_lines_enquiryLineId_fkey" FOREIGN KEY ("enquiryLineId") REFERENCES "enquiry_lines"("id")   ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "supplier_offer_lines_selectedById_fkey"  FOREIGN KEY ("selectedById")  REFERENCES "staff_users"("id")     ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "supplier_offer_lines_offerId_idx"       ON "supplier_offer_lines"("offerId");
CREATE INDEX "supplier_offer_lines_enquiryLineId_idx" ON "supplier_offer_lines"("enquiryLineId");

ALTER TABLE "supplier_offer_lines" ADD CONSTRAINT "supplier_offer_lines_source_required"
  CHECK ("unitPrice" IS NULL OR "sourceQuote" IS NOT NULL);

ALTER TABLE "supplier_offer_lines" ADD CONSTRAINT "supplier_offer_lines_selection_paired"
  CHECK (("selectedById" IS NULL) = ("selectedAt" IS NULL));
