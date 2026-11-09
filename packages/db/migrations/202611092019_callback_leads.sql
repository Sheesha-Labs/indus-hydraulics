-- Call-back leads from the storefront retention prompt (exit intent,
-- inactivity, tab return). One row per accepted request; honeypot and
-- too-fast submissions are discarded before they reach the table.
--
-- `phoneE164` is the number sales dials. `ipHash` is SHA-256 of the client
-- IP, never the address itself, and is what the per-network rate limit
-- counts. `status` is for the desk to work the list; nothing automated
-- moves it.
--
-- Additive: the deployed code reads none of it, and the new enum belongs to
-- a new table, so this is safe to apply before the code ships.

CREATE TYPE "CallbackLeadStatus" AS ENUM ('new', 'called', 'quoted', 'closed', 'spam');

CREATE TABLE IF NOT EXISTS "callback_leads" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "name"         TEXT NOT NULL,
  "email"        TEXT NOT NULL,
  "phoneE164"    TEXT NOT NULL,
  "phoneCountry" TEXT NOT NULL,
  "category"     TEXT,
  "description"  TEXT,
  "surface"      TEXT NOT NULL,
  "trigger"      TEXT NOT NULL,
  "pageUrl"      TEXT,
  "pageTitle"    TEXT,
  "referrer"     TEXT,
  "market"       TEXT,
  "utmSource"    TEXT,
  "utmMedium"    TEXT,
  "utmCampaign"  TEXT,
  "utmTerm"      TEXT,
  "utmContent"   TEXT,
  "ipHash"       TEXT,
  "userAgent"    TEXT,
  "deskOpen"     BOOLEAN NOT NULL DEFAULT false,
  "status"       "CallbackLeadStatus" NOT NULL DEFAULT 'new',
  "assignedToId" TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "notes"        TEXT,
  CONSTRAINT "callback_leads_surface_check" CHECK ("surface" IN ('B', 'D', 'E')),
  CONSTRAINT "callback_leads_trigger_check" CHECK ("trigger" IN ('inactivity', 'exit', 'tab_return', 'manual'))
);

CREATE INDEX IF NOT EXISTS "callback_leads_createdAt_idx" ON "callback_leads" ("createdAt");
CREATE INDEX IF NOT EXISTS "callback_leads_status_idx" ON "callback_leads" ("status");
CREATE INDEX IF NOT EXISTS "callback_leads_ipHash_createdAt_idx" ON "callback_leads" ("ipHash", "createdAt");

-- Server-side access only (Prisma as the table owner). No policies: the
-- anon and authenticated roles see nothing.
ALTER TABLE "callback_leads" ENABLE ROW LEVEL SECURITY;
