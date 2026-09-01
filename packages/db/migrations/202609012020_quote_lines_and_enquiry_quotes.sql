-- A quote may now answer an inbound Enquiry instead of a customer Rfq.
-- Exactly one parent, never both and never neither.
--
-- Safe at this size: production held 1 quote and 3 RFQs when this was applied.
-- Three call sites read quote.rfq and are now narrowed — the customer PDF
-- viewer (which authorises against the RFQ's account and therefore does not
-- serve enquiry-parented quotes at all), and the two RFQ-lifecycle crons.

ALTER TABLE "quotes" ALTER COLUMN "rfqId" DROP NOT NULL;

ALTER TABLE "quotes" ADD COLUMN "enquiryId" TEXT;

ALTER TABLE "quotes" ADD CONSTRAINT "quotes_enquiryId_fkey"
  FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "quotes_enquiryId_idx" ON "quotes"("enquiryId");

ALTER TABLE "quotes" ADD CONSTRAINT "quotes_one_parent"
  CHECK (("rfqId" IS NOT NULL) <> ("enquiryId" IS NOT NULL));

-- Per-line SNAPSHOT of what a quote actually said.
--
-- Without this, revisions rewrite history: buildEstimateInputFromRfq reads LIVE
-- RfqLine rows, so issuing R2 changes what R1 appears to have contained. The
-- only frozen record today is the rendered PDF.
--
-- Cost and margin are captured too, because they are the numbers nobody can
-- reconstruct later and the ones that decide whether a job made money.
CREATE TABLE "quote_lines" (
  "id"          TEXT PRIMARY KEY,
  "quoteId"     TEXT NOT NULL,
  "position"    INTEGER NOT NULL DEFAULT 0,
  "description" TEXT NOT NULL,
  "qty"         DECIMAL(14,3) NOT NULL,
  "unitPrice"   DECIMAL(14,4) NOT NULL,
  "lineTotal"   DECIMAL(14,2) NOT NULL,

  "landedUnitCostAed" DECIMAL(14,4),
  "markupMode"        TEXT,
  "markupValue"       DECIMAL(10,4),
  -- Margin OF SELL PRICE, stored explicitly. 30% markup is a 23.08% margin and
  -- the two are conflated constantly; recording only one invites the wrong read.
  "marginPct"         DECIMAL(6,2),

  "supplierOfferLineId" TEXT,
  "enquiryLineId"       TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "quote_lines_quoteId_fkey"             FOREIGN KEY ("quoteId")             REFERENCES "quotes"("id")               ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "quote_lines_supplierOfferLineId_fkey" FOREIGN KEY ("supplierOfferLineId") REFERENCES "supplier_offer_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "quote_lines_enquiryLineId_fkey"       FOREIGN KEY ("enquiryLineId")       REFERENCES "enquiry_lines"("id")       ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "quote_lines_quoteId_idx" ON "quote_lines"("quoteId");
CREATE UNIQUE INDEX "quote_lines_quote_position_key" ON "quote_lines"("quoteId", "position");
