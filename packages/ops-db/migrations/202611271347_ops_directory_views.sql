-- Indus Operations · S10-T02/T03 · directory index views (boards 11 and 128; ADR-04: index counts from views)
--
--   ops.client_stats_v   one row per live client company (not archived, not merged): active (an enquiry in the last
--                        12 months), enquiries YTD, open leads, RFQs YTD (enquiries that came as a document: email,
--                        forwarded email, website RFQ, file upload, client portal), quoted YTD in AED (sent quotations
--                        at their locked FX; superseded and cancelled revisions left out), won YTD in AED (orders, at
--                        the quotation's locked FX or 1 for AED), win rate (won ÷ quoted YTD, NULL when nothing was
--                        quoted), average margin won (orders' estimate snapshot), the last RFQ and the credit hold.
--   ops.supplier_list_v  one row per live supplier company: profile columns (type, tier, onboarding, reliability), the
--                        line-card trades it carries (names, not suppliers' brands; ids include each trade's parent so a
--                        category filter finds its sub-trades), contact count, the
--                        soonest live document expiry and whether a bank change is pending.
--
-- Year to date is the calendar year in Asia/Dubai. Plain views over ops tables, owned by postgres, SELECT to ops_app.
-- Idempotent.

BEGIN;

CREATE OR REPLACE VIEW ops.client_stats_v AS
WITH y AS (
  SELECT date_trunc('year', now() AT TIME ZONE 'Asia/Dubai') AT TIME ZONE 'Asia/Dubai' AS start
)
SELECT
  c.id                                                                    AS "companyId",
  c.name                                                                  AS "name",
  c.city                                                                  AS "city",
  c.country                                                               AS "country",
  c.industry                                                              AS "industry",
  cp."quotingCurrency"                                                    AS "quotingCurrency",
  coalesce(cp."creditHold", false)                                        AS "creditHold",
  (e.last_at IS NOT NULL AND e.last_at >= now() - interval '12 months')   AS "active",
  coalesce(e.ytd, 0)::int                                                 AS "enquiriesYtd",
  coalesce(e.rfqs_ytd, 0)::int                                            AS "rfqsYtd",
  coalesce(l.open, 0)::int                                                AS "leadsOpen",
  coalesce(q.quoted_aed, 0)::numeric(18, 4)                               AS "quotedYtdAed",
  coalesce(o.won_aed, 0)::numeric(18, 4)                                  AS "wonYtdAed",
  CASE WHEN coalesce(q.quoted_aed, 0) > 0
       THEN round(coalesce(o.won_aed, 0) / q.quoted_aed * 100, 4) END     AS "winRatePct",
  o.avg_margin                                                            AS "avgMarginWonPct",
  e.last_rfq_at                                                           AS "lastRfqAt"
FROM ops.company c
CROSS JOIN y
LEFT JOIN ops.client_profile cp ON cp."companyId" = c.id
LEFT JOIN LATERAL (
  SELECT max(en."receivedAt")                                                         AS last_at,
         count(*) FILTER (WHERE en."receivedAt" >= y.start)                           AS ytd,
         count(*) FILTER (WHERE en."receivedAt" >= y.start AND en."receivedVia" IN
           ('email', 'forwarded_email', 'website_rfq', 'file_upload', 'client_portal')) AS rfqs_ytd,
         max(en."receivedAt") FILTER (WHERE en."receivedVia" IN
           ('email', 'forwarded_email', 'website_rfq', 'file_upload', 'client_portal')) AS last_rfq_at
    FROM ops.enquiry en
   WHERE en."clientId" = c.id
) e ON true
LEFT JOIN LATERAL (
  SELECT count(*) AS open
    FROM ops.lead ld
   WHERE ld."companyId" = c.id AND ld.stage IN ('new', 'contacted', 'qualified')
) l ON true
LEFT JOIN LATERAL (
  SELECT sum(qt.total * coalesce(qt."fxRateToAed", CASE WHEN qt.currency = 'AED' THEN 1 END)) AS quoted_aed
    FROM ops.quotation qt
   WHERE qt."clientId" = c.id
     AND qt."sentAt" >= y.start
     AND qt.status IN ('sent', 'viewed', 'evaluating', 'won', 'lost')
) q ON true
LEFT JOIN LATERAL (
  SELECT sum(od.total * coalesce(oq."fxRateToAed", CASE WHEN od.currency = 'AED' THEN 1 END)) AS won_aed,
         round(avg(nullif(od."estimateAed"->>'marginPct', '')::numeric), 4)                AS avg_margin
    FROM ops."order" od
    LEFT JOIN ops.quotation oq ON oq.id = od."quotationId"
   WHERE od."clientId" = c.id
     AND od."createdAt" >= y.start
     AND od.stage <> 'cancelled'
) o ON true
WHERE c."isClient" AND c."archivedAt" IS NULL AND c."mergedIntoId" IS NULL;

ALTER VIEW ops.client_stats_v OWNER TO postgres;
GRANT SELECT ON ops.client_stats_v TO ops_app;

CREATE OR REPLACE VIEW ops.supplier_list_v AS
SELECT
  c.id                                     AS "companyId",
  c.name                                   AS "name",
  c.country                                AS "country",
  c.city                                   AS "city",
  c."primaryDomain"                        AS "primaryDomain",
  c.domains                                AS "domains",
  c.aliases                                AS "aliases",
  sp.type::text                            AS "type",
  sp.tier::text                            AS "tier",
  sp."onboardingStatus"::text              AS "onboardingStatus",
  sp."quotesCurrency"                      AS "quotesCurrency",
  sp."rfqsAsked"                           AS "rfqsAsked",
  sp."repliesCount"                        AS "repliesCount",
  sp."replyRatePct"                        AS "replyRatePct",
  sp."medianReplyHours"                    AS "medianReplyHours",
  sp."winSharePct"                         AS "winSharePct",
  sp."lastQuoteAt"                         AS "lastQuoteAt",
  sp."trialPosUsed"                        AS "trialPosUsed",
  sp."trialPoLimit"                        AS "trialPoLimit",
  coalesce(lc.trade_ids, '{}')             AS "tradeIds",
  coalesce(lc.trades, '{}')                AS "trades",
  coalesce(ct.n, 0)::int                   AS "contactCount",
  ct.bouncing                              AS "bouncingContacts",
  dx.soonest                               AS "soonestExpiry",
  coalesce(bk.pending, false)              AS "bankChangePending"
FROM ops.company c
JOIN ops.supplier_profile sp ON sp."companyId" = c.id
LEFT JOIN LATERAL (
  SELECT array_remove(array_agg(DISTINCT t.id) || array_agg(DISTINCT t."parentId"), NULL) AS trade_ids,
         array_agg(DISTINCT t.name ORDER BY t.name) AS trades
    FROM ops.supplier_line_card l
    JOIN ops.trade t ON t.id = l."tradeId"
   WHERE l."supplierId" = c.id AND l.status IN ('active', 'trial', 'proposed')
) lc ON true
LEFT JOIN LATERAL (
  SELECT count(*) AS n, count(*) FILTER (WHERE k.status = 'bouncing')::int AS bouncing
    FROM ops.contact k
   WHERE k."companyId" = c.id AND k."archivedAt" IS NULL
) ct ON true
LEFT JOIN LATERAL (
  SELECT min(d."expiresAt") AS soonest
    FROM ops.compliance_document d
   WHERE d."companyId" = c.id AND d."archivedAt" IS NULL AND d."expiresAt" IS NOT NULL
) dx ON true
LEFT JOIN LATERAL (
  SELECT true AS pending
    FROM ops.supplier_bank_account b
   WHERE b."supplierId" = c.id AND b.status = 'pending_verification' AND b."supersededAt" IS NULL
   LIMIT 1
) bk ON true
WHERE c."isSupplier" AND c."archivedAt" IS NULL AND c."mergedIntoId" IS NULL;

ALTER VIEW ops.supplier_list_v OWNER TO postgres;
GRANT SELECT ON ops.supplier_list_v TO ops_app;

COMMIT;
