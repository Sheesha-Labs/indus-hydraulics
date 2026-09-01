-- Supplier ledger.
--
-- The compounding asset behind supplier research. Cold web research is the
-- FALLBACK; this table is the primary source, and it improves every time a
-- human sends an RFQ and a supplier replies.
--
-- Contact provenance is enforced by CHECK, not by convention: an address found
-- by a machine must record the URL it was read from, because the only way to
-- audit a bounce or a complaint later is to know where the address came from.
-- Human-entered and reply-derived contacts are exempt — their provenance is the
-- act itself.

CREATE TYPE "SupplierKind" AS ENUM ('manufacturer', 'distributor', 'trader', 'unknown');

CREATE TYPE "SupplierOrigin" AS ENUM ('brand', 'manual', 'research', 'mail');

CREATE TYPE "SupplierStatus" AS ENUM ('active', 'do_not_use', 'archived');

CREATE TYPE "SupplierContactSource" AS ENUM (
  'own_website', 'manual', 'enrichment', 'reply', 'pattern_guess'
);

CREATE TYPE "ContactConfidence" AS ENUM ('high', 'medium', 'low');

CREATE TABLE "suppliers" (
  "id"                      TEXT PRIMARY KEY,
  "slug"                    TEXT NOT NULL,
  "name"                    TEXT NOT NULL,
  "domain"                  TEXT,
  "website"                 TEXT,
  "country"                 TEXT,
  "kind"                    "SupplierKind"   NOT NULL DEFAULT 'unknown',
  "origin"                  "SupplierOrigin" NOT NULL DEFAULT 'manual',
  "status"                  "SupplierStatus" NOT NULL DEFAULT 'active',
  "isAuthorizedDistributor" BOOLEAN NOT NULL DEFAULT false,
  "brandId"                 TEXT,
  "notes"                   TEXT,
  -- Responsiveness. The only ranking signal that actually predicts anything.
  "rfqsSent"                INTEGER NOT NULL DEFAULT 0,
  "repliesReceived"         INTEGER NOT NULL DEFAULT 0,
  "lastRfqAt"               TIMESTAMP(3),
  "lastReplyAt"             TIMESTAMP(3),
  "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "suppliers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "suppliers_slug_key" ON "suppliers"("slug");
CREATE INDEX "suppliers_country_idx" ON "suppliers"("country");
CREATE INDEX "suppliers_status_idx"  ON "suppliers"("status");

-- Partial: a supplier reached only through a web form or a trade-show card has
-- no domain, and several such rows must be allowed to coexist.
CREATE UNIQUE INDEX "suppliers_domain_key" ON "suppliers"("domain") WHERE "domain" IS NOT NULL;

CREATE TABLE "supplier_contacts" (
  "id"          TEXT PRIMARY KEY,
  "supplierId"  TEXT NOT NULL,
  "name"        TEXT,
  "role"        TEXT,
  "email"       TEXT,
  "phone"       TEXT,
  "source"      "SupplierContactSource" NOT NULL,
  "confidence"  "ContactConfidence"     NOT NULL DEFAULT 'low',
  "evidenceUrl" TEXT,
  "verifiedAt"  TIMESTAMP(3),
  "bounceCount" INTEGER NOT NULL DEFAULT 0,
  "isPrimary"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "supplier_contacts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "supplier_contacts_supplierId_idx" ON "supplier_contacts"("supplierId");
CREATE UNIQUE INDEX "supplier_contacts_supplier_email_key"
  ON "supplier_contacts"("supplierId", "email") WHERE "email" IS NOT NULL;

-- A contact must be reachable somehow.
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_reachable"
  CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL);

-- Machine-found contacts must say where they came from. Human-entered ones need not.
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_evidence_required"
  CHECK ("source" IN ('manual', 'reply') OR "evidenceUrl" IS NOT NULL);
