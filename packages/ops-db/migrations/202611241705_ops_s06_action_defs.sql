-- Indus Operations · S06 · the Assistant actions this sprint adds to the catalogue (CLAUDE.md §17)
--
--   override_value      (S06-T05) A person's correction of a value the Assistant set, from Why? ("This is
--                       wrong…"). Do quietly, not configurable: it is the person's act, recorded as an action.
--   outbound_attention  (S06-T03, coverage gap G6) A send that failed or whose outcome is unknown, with no
--                       action of its own (an Owner's reply, a test send): a Review card with Retry, Copy text and
--                       Mark as sent. Draft and ask, not configurable. Retry emails the recipient, so it is in
--                       SENDS_EXTERNALLY.
--   instruction         (S06-T08) Text typed in the Assistant panel becomes a proposal. Draft and ask under every
--                       preset and never above it (maxLevel).
--
-- Keys added to ACTION_KEYS (packages/ops-core/src/autopilot/keys.ts) in the same commit; the catalogue guard
-- checks both. ON CONFLICT DO NOTHING: re-runs never overwrite a level the Owner changed.

BEGIN;

INSERT INTO "ops"."autopilot_action_def"
  ("key", "group", "label", "description", "ruleText", "position", "configurable", "lockedLevel", "maxLevel",
   "defaultCareful", "defaultBalanced", "defaultHandsOff", "minutesSaved", "originBoard", "signoffStatus")
VALUES
  ('override_value', 'system', 'Correct a value the Assistant set', 'A person''s correction from Why? · Produces the corrected value and a learned preference', 'Recorded as the person''s', 137, false, NULL, NULL, 'do_quietly', 'do_quietly', 'do_quietly', NULL, '112', 'awaiting'),
  ('outbound_attention', 'system', 'A send that needs you', 'A failed or unknown send with no card of its own · Produces Retry, Copy text and Mark as sent', 'Never retried on its own', 138, false, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '110', 'awaiting'),
  ('instruction', 'system', 'Instructions from the Assistant panel', 'Text typed in the Assistant panel · Produces a proposal for you to approve', 'Turns what you type into a proposal. Nothing changes until you approve it.', 139, false, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, 'S03A', 'awaiting')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "ops"."autopilot_setting" ("actionKey", "level", "rules", "version", "updatedAt")
VALUES
  ('override_value', 'do_quietly', '{}', 0, now()),
  ('outbound_attention', 'draft_and_ask', '{}', 0, now()),
  ('instruction', 'draft_and_ask', '{}', 0, now())
ON CONFLICT ("actionKey") DO NOTHING;

COMMIT;
