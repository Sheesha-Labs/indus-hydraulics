-- Indus Operations · S06-T04 / T06 · the Assistant log and record history
--
--   activity_event."revertsEventId"   a revert row points at the change it reverses (S06-T07; new rows only, the
--                                     table stays append-only)
--   activity_event (subjectType, subjectId, field, at)   record history by field (S06-T06)
--   ops.assistant_log_v               the board 111 feed: one row per Assistant action, one per person's decision
--                                     on a card (approve, edit, reject, undo), one per person's own change
--                                     (activity_event with no action), normalised to time, actor, action,
--                                     record, level, outcome, cost
--
-- The view is owned by postgres and read by ops_app (SELECT only); it reads the append-only tables as they are.

BEGIN;

ALTER TABLE "ops"."activity_event" ADD COLUMN IF NOT EXISTS "revertsEventId" uuid;

CREATE INDEX IF NOT EXISTS "activity_event_subject_field_at_idx"
  ON "ops"."activity_event" ("subjectType", "subjectId", "field", "at");

CREATE OR REPLACE VIEW "ops"."assistant_log_v" AS
SELECT
  a."id"                         AS "id",
  a."createdAt"                  AS "at",
  'action'::text                 AS "kind",
  'assistant'::text              AS "actorKind",
  NULL::uuid                     AS "actorId",
  NULL::text                     AS "actorInitials",
  a."id"                         AS "actionId",
  a."ref"                        AS "actionRef",
  a."actionKey"                  AS "actionKey",
  a."enquiryId"                  AS "enquiryId",
  en."ref"                       AS "enquiryRef",
  a."subjectType"::text          AS "subjectType",
  a."subjectId"                  AS "subjectId",
  a."levelAtTime"::text          AS "level",
  a."state"::text                AS "outcome",
  du."initials"                  AS "deciderInitials",
  (a."editDiff" IS NOT NULL)     AS "edited",
  a."surface"                    AS "surface",
  a."costUsd"                    AS "costUsd",
  a."headline"                   AS "headline"
FROM "ops"."assistant_action" a
LEFT JOIN "ops"."enquiry" en ON en."id" = a."enquiryId"
LEFT JOIN "ops"."user" du ON du."id" = a."decidedById"
UNION ALL
SELECT
  ev."id",
  ev."at",
  'decision'::text,
  ev."actorKind"::text,
  ev."actorId",
  u."initials",
  a."id",
  a."ref",
  a."actionKey",
  a."enquiryId",
  en."ref",
  a."subjectType"::text,
  a."subjectId",
  a."levelAtTime"::text,
  ev."toState"::text,
  u."initials",
  (ev."toState" = 'edited_approved'),
  a."surface",
  0::numeric,
  a."headline"
FROM "ops"."assistant_action_event" ev
JOIN "ops"."assistant_action" a ON a."id" = ev."actionId"
LEFT JOIN "ops"."enquiry" en ON en."id" = a."enquiryId"
LEFT JOIN "ops"."user" u ON u."id" = ev."actorId"
WHERE ev."actorKind" = 'user'
  AND ev."toState" IN ('approved', 'edited_approved', 'rejected', 'undone', 'later', 'cancelled')
UNION ALL
SELECT * FROM (
  SELECT DISTINCT ON (e."actorId", e."subjectType", e."subjectId", coalesce(e."note", ''), date_trunc('second', e."at"))
    e."id",
    e."at",
    'human'::text,
    e."actorKind"::text,
    e."actorId",
    u."initials",
    NULL::uuid,
    NULL::text,
    NULL::text,
    e."enquiryId",
    en."ref",
    e."subjectType"::text,
    e."subjectId",
    NULL::text,
    e."kind"::text,
    u."initials",
    false,
    NULL::text,
    0::numeric,
    coalesce(e."note", e."field", e."kind"::text)
  FROM "ops"."activity_event" e
  LEFT JOIN "ops"."enquiry" en ON en."id" = e."enquiryId"
  LEFT JOIN "ops"."user" u ON u."id" = e."actorId"
  WHERE e."actionId" IS NULL AND e."actorKind" = 'user'
  ORDER BY e."actorId", e."subjectType", e."subjectId", coalesce(e."note", ''), date_trunc('second', e."at"), e."at"
) h;

ALTER VIEW "ops"."assistant_log_v" OWNER TO postgres;
REVOKE ALL ON "ops"."assistant_log_v" FROM PUBLIC;
GRANT SELECT ON "ops"."assistant_log_v" TO ops_app;

COMMIT;
