-- Indus Operations · S11 · action defs (CLAUDE.md §17)
--
--   import_terms   board 39 "Import from offer": an uploaded INDUS/Q PDF is split into candidate clauses for a person to
--                  accept one by one. Internal (no email, no clause written by the Assistant). Locked Do quietly.
--
-- ON CONFLICT DO NOTHING: a level the Owner changed is kept.

BEGIN;

INSERT INTO "ops"."autopilot_action_def"
  ("key", "group", "label", "description", "ruleText", "position", "configurable", "lockedLevel", "maxLevel",
   "defaultCareful", "defaultBalanced", "defaultHandsOff", "minutesSaved", "originBoard", "signoffStatus")
VALUES
  ('import_terms', 'system', 'Read terms from an offer', 'An uploaded offer PDF · Produces candidate clauses for you to accept', 'Candidates only; nothing becomes a clause until you accept it', 147, false, 'do_quietly', NULL, 'do_quietly', 'do_quietly', 'do_quietly', 10, '39', 'awaiting')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "ops"."autopilot_setting" ("actionKey", "level", "rules", "version", "updatedAt")
VALUES ('import_terms', 'do_quietly', '{}', 0, now())
ON CONFLICT ("actionKey") DO NOTHING;

COMMIT;
