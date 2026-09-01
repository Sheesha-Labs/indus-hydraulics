-- Supplier research: cache, runs, per-item results.
--
-- Cached by item SIGNATURE, not by line id — the same valve asked for by two
-- buyers a month apart must hit one entry rather than pay for research twice.
--
-- item_research_results rows are written the MOMENT each item lands, never in
-- a final aggregate step: a partial failure must still leave the human with
-- usable lists for the items that did finish.

CREATE TYPE "ResearchRunStatus" AS ENUM ('queued', 'running', 'completed', 'partial', 'failed');

CREATE TYPE "ItemResearchStatus" AS ENUM ('queued', 'running', 'completed', 'failed', 'skipped');

CREATE TABLE "item_research_cache" (
  "id"            TEXT PRIMARY KEY,
  "signatureHash" TEXT NOT NULL,
  "commodityKey"  TEXT NOT NULL,
  "candidates"    JSONB NOT NULL,
  "candidateCount" INTEGER NOT NULL DEFAULT 0,
  "reachableCount" INTEGER NOT NULL DEFAULT 0,
  "qualityScore"  INTEGER NOT NULL DEFAULT 100,
  "hitCount"      INTEGER NOT NULL DEFAULT 0,
  "lastHitAt"     TIMESTAMP(3),
  "expiresAt"     TIMESTAMP(3) NOT NULL,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "item_research_cache_signatureHash_key" ON "item_research_cache"("signatureHash");
CREATE INDEX "item_research_cache_expiresAt_idx" ON "item_research_cache"("expiresAt");

CREATE TABLE "research_runs" (
  "id"             TEXT PRIMARY KEY,
  "enquiryId"      TEXT NOT NULL,
  "status"         "ResearchRunStatus" NOT NULL DEFAULT 'queued',
  "itemCount"      INTEGER NOT NULL DEFAULT 0,
  "completedCount" INTEGER NOT NULL DEFAULT 0,
  "cacheHitCount"  INTEGER NOT NULL DEFAULT 0,
  "costUsdMicros"  INTEGER NOT NULL DEFAULT 0,
  "triggeredById"  TEXT,
  "error"          TEXT,
  "startedAt"      TIMESTAMP(3),
  "finishedAt"     TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "research_runs_enquiryId_fkey"     FOREIGN KEY ("enquiryId")     REFERENCES "enquiries"("id")   ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "research_runs_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "research_runs_enquiryId_idx" ON "research_runs"("enquiryId");
CREATE INDEX "research_runs_status_idx"    ON "research_runs"("status");

CREATE TABLE "item_research_results" (
  "id"             TEXT PRIMARY KEY,
  "researchRunId"  TEXT NOT NULL,
  "enquiryLineId"  TEXT NOT NULL,
  "signatureHash"  TEXT NOT NULL,
  "status"         "ItemResearchStatus" NOT NULL DEFAULT 'queued',
  "cacheHit"       BOOLEAN NOT NULL DEFAULT false,
  "candidates"     JSONB NOT NULL DEFAULT '[]',
  "candidateCount" INTEGER NOT NULL DEFAULT 0,
  "reachableCount" INTEGER NOT NULL DEFAULT 0,
  "costUsdMicros"  INTEGER NOT NULL DEFAULT 0,
  "error"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "item_research_results_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "research_runs"("id")  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "item_research_results_enquiryLineId_fkey" FOREIGN KEY ("enquiryLineId") REFERENCES "enquiry_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "item_research_results_researchRunId_idx" ON "item_research_results"("researchRunId");
CREATE INDEX "item_research_results_enquiryLineId_idx" ON "item_research_results"("enquiryLineId");
CREATE UNIQUE INDEX "item_research_results_run_line_key"
  ON "item_research_results"("researchRunId", "enquiryLineId");
