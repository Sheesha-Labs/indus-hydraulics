-- Indus Operations · S05 · the Assistant actions this sprint adds to the catalogue (CLAUDE.md §17)
--
--   manual_reply  (S05-T05) A Helper's reply in a sales@ thread is not sent: it becomes a proposal "Ask Krishan to
--                 send" for the Owner. Draft and ask under every preset, never above it (maxLevel). It emails a
--                 client, so it is in SENDS_EXTERNALLY.
--   ooo_facts     (S05-T07) Reads an out-of-office reply for the return date and an alternate contact. Do quietly,
--                 not configurable (a fact, no external effect).
--
-- Keys added to ACTION_KEYS (packages/ops-core/src/autopilot/keys.ts) in the same commit; the catalogue guard
-- checks both. ON CONFLICT DO NOTHING: re-runs never overwrite a level the Owner changed.

BEGIN;

INSERT INTO "ops"."autopilot_action_def"
  ("key", "group", "label", "description", "ruleText", "position", "configurable", "lockedLevel", "maxLevel",
   "defaultCareful", "defaultBalanced", "defaultHandsOff", "minutesSaved", "originBoard", "signoffStatus")
VALUES
  ('manual_reply', 'mail', 'Helper reply on the client mailbox', 'A Helper''s reply in a sales@ thread · Produces a draft for the Owner to send', 'Never sent without the Owner', 135, true, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', NULL, '91', 'awaiting'),
  ('ooo_facts', 'mail', 'Read out-of-office replies', 'Reads an auto-reply · Produces the return date and any alternate contact', 'Facts only; no email', 136, false, NULL, NULL, 'do_quietly', 'do_quietly', 'do_quietly', NULL, '96', 'awaiting')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "ops"."autopilot_setting" ("actionKey", "level", "rules", "version", "updatedAt")
VALUES
  ('manual_reply', 'draft_and_ask', '{}', 0, now()),
  ('ooo_facts', 'do_quietly', '{}', 0, now())
ON CONFLICT ("actionKey") DO NOTHING;

COMMIT;
