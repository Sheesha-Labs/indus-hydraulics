-- Indus Operations · S09-T02 · Enquiries pipeline (board 04)
--
--   ops.enquiry_pipeline_v        one row per enquiry: the C7 display group over the stored stage (Enquiry = new +
--                                 qualifying · Sourcing · Quotes in = quotes_in + pricing · Quoted · Negotiation · Won;
--                                 lost, regretted, closed and anything with closedAt are 'ended'), client and owner, line counts (total,
--                                 sent on an RFQ that went out, quoted; cancelled lines left out), the latest live
--                                 quotation (number, status, client status, total), the client PO, the value (the
--                                 quotation total in its currency, else the enquiry's estimate).
--   ops.enquiry_filter_counts_v   counts by group and owner for the filter chips (one grouped read).
--
-- Plain views over ops tables (no public read), owned by postgres, SELECT to ops_app. The lateral reads use the
-- existing indexes: enquiry_line (enquiryId, no), supplier_rfq_line (lineId), quotation (enquiryId), order (enquiryId).
--
-- Idempotent.

BEGIN;

CREATE OR REPLACE VIEW ops.enquiry_pipeline_v AS
SELECT
  e.id                                   AS "id",
  e.ref                                  AS "ref",
  e.title                                AS "title",
  e."clientId"                           AS "clientId",
  c.name                                 AS "clientName",
  e."ownerId"                            AS "ownerId",
  u.initials                             AS "ownerInitials",
  e.deadline                             AS "deadline",
  e."receivedAt"                         AS "receivedAt",
  e.stage::text                          AS "stage",
  CASE WHEN e."closedAt" IS NOT NULL AND e.stage <> 'won' THEN 'ended' ELSE CASE e.stage
    WHEN 'new' THEN 'enquiry'
    WHEN 'qualifying' THEN 'enquiry'
    WHEN 'sourcing' THEN 'sourcing'
    WHEN 'quotes_in' THEN 'quotes_in'
    WHEN 'pricing' THEN 'quotes_in'
    WHEN 'quoted' THEN 'quoted'
    WHEN 'negotiation' THEN 'negotiation'
    WHEN 'won' THEN 'won'
    ELSE 'ended'
  END END                                AS "stageGroup",
  CASE WHEN q.id IS NOT NULL THEN q.total ELSE e."estValueMax" END AS "value",
  CASE WHEN q.id IS NOT NULL THEN q.currency ELSE e."estCurrency" END AS "valueCurrency",
  coalesce(l.total, 0)::int              AS "linesTotal",
  coalesce(l.sent, 0)::int               AS "linesSent",
  coalesce(l.quoted, 0)::int             AS "linesQuoted",
  q.number                               AS "quotationNumber",
  q.status::text                         AS "quotationStatus",
  q."clientStatus"::text                 AS "quotationClientStatus",
  o."clientPoNumber"                     AS "clientPoRef",
  e.version                              AS "version",
  e."chosenPath"::text                   AS "chosenPath",
  e."stageChangedAt"                     AS "stageChangedAt"
FROM ops.enquiry e
LEFT JOIN ops.company c ON c.id = e."clientId"
LEFT JOIN ops."user" u ON u.id = e."ownerId"
LEFT JOIN LATERAL (
  SELECT count(*) AS total,
         count(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM ops.supplier_rfq_line rl
             JOIN ops.supplier_rfq r ON r.id = rl."rfqId"
            WHERE rl."lineId" = el.id AND rl."droppedAt" IS NULL AND r.status IN ('sent', 'closed')
         )) AS sent,
         count(*) FILTER (WHERE el.status IN ('quoted', 'to_follow')) AS quoted
    FROM ops.enquiry_line el
   WHERE el."enquiryId" = e.id AND el.status <> 'cancelled'
) l ON true
LEFT JOIN LATERAL (
  SELECT qq.id, qq.number, qq.status, qq."clientStatus", qq.total, qq.currency
    FROM ops.quotation qq
   WHERE qq."enquiryId" = e.id AND qq.status NOT IN ('cancelled', 'superseded')
   ORDER BY qq."createdAt" DESC
   LIMIT 1
) q ON true
LEFT JOIN LATERAL (
  SELECT oo."clientPoNumber" FROM ops."order" oo WHERE oo."enquiryId" = e.id ORDER BY oo."createdAt" LIMIT 1
) o ON true;

ALTER VIEW ops.enquiry_pipeline_v OWNER TO postgres;
REVOKE ALL ON ops.enquiry_pipeline_v FROM PUBLIC;
GRANT SELECT ON ops.enquiry_pipeline_v TO ops_app;

CREATE OR REPLACE VIEW ops.enquiry_filter_counts_v AS
SELECT
  CASE WHEN e."closedAt" IS NOT NULL AND e.stage <> 'won' THEN 'ended' ELSE CASE e.stage
    WHEN 'new' THEN 'enquiry'
    WHEN 'qualifying' THEN 'enquiry'
    WHEN 'sourcing' THEN 'sourcing'
    WHEN 'quotes_in' THEN 'quotes_in'
    WHEN 'pricing' THEN 'quotes_in'
    WHEN 'quoted' THEN 'quoted'
    WHEN 'negotiation' THEN 'negotiation'
    WHEN 'won' THEN 'won'
    ELSE 'ended'
  END END            AS "stageGroup",
  e."ownerId"        AS "ownerId",
  count(*)::int      AS "n"
FROM ops.enquiry e
GROUP BY 1, 2;

ALTER VIEW ops.enquiry_filter_counts_v OWNER TO postgres;
REVOKE ALL ON ops.enquiry_filter_counts_v FROM PUBLIC;
GRANT SELECT ON ops.enquiry_filter_counts_v TO ops_app;

COMMIT;
