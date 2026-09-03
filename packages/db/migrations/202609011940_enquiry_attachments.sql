-- Files attached to an inbound enquiry: the RFQ sheet a buyer sends instead of
-- putting the items in the mail body.
--
-- media is RESTRICT, matching every other required media back-relation — the
-- database refuses to delete a Media row a customer's enquiry document points
-- at. This table must ALSO be registered as a usage source in
-- apps/web/src/lib/queries/media-usage.ts, or the file reads as unused in the
-- library and the nightly purge destroys the storage object 30 days later.

CREATE TYPE "AttachmentExtractionStatus" AS ENUM (
  'pending', 'extracted', 'unsupported', 'failed'
);

CREATE TABLE "enquiry_attachments" (
  "id"          TEXT PRIMARY KEY,
  "enquiryId"   TEXT NOT NULL,
  "mediaId"     TEXT NOT NULL,
  "filename"    TEXT NOT NULL,
  "mimeType"    TEXT,
  "bytes"       INTEGER,
  "extractionStatus" "AttachmentExtractionStatus" NOT NULL DEFAULT 'pending',
  "extractionNote"   TEXT,
  "extractedLines"   INTEGER NOT NULL DEFAULT 0,
  "extractorName"    TEXT,
  "costUsdMicros"    INTEGER NOT NULL DEFAULT 0,
  "uploadedById" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "enquiry_attachments_enquiryId_fkey"    FOREIGN KEY ("enquiryId")    REFERENCES "enquiries"("id")   ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT "enquiry_attachments_mediaId_fkey"      FOREIGN KEY ("mediaId")      REFERENCES "media"("id")       ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "enquiry_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "enquiry_attachments_enquiryId_idx" ON "enquiry_attachments"("enquiryId");
CREATE INDEX "enquiry_attachments_mediaId_idx"   ON "enquiry_attachments"("mediaId");
CREATE UNIQUE INDEX "enquiry_attachments_enquiry_media_key"
  ON "enquiry_attachments"("enquiryId", "mediaId");

-- Lines extracted from an attachment must say which one, so a wrong quantity
-- can be traced back to the page it came from.
ALTER TABLE "enquiry_lines" ADD COLUMN "sourceAttachmentId" TEXT;

ALTER TABLE "enquiry_lines" ADD CONSTRAINT "enquiry_lines_sourceAttachmentId_fkey"
  FOREIGN KEY ("sourceAttachmentId") REFERENCES "enquiry_attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "enquiry_lines_sourceAttachmentId_idx" ON "enquiry_lines"("sourceAttachmentId");
