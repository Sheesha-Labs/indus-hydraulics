-- Indus Operations · S08 · the Assistant actions and email templates this sprint adds (CLAUDE.md §17)
--
--   request_original        (S08-T04, board 17 "Ask client for original") A file too coarse or unreadable to extract
--                           from: a short reply in the client's own thread asking for the original or a clearer copy.
--                           Drafted from the template below (no model call). Draft and ask; it emails the client, so
--                           it is in SENDS_EXTERNALLY.
--   resolve_extracted_line  (S08-T06) An Unsure line from an approved "Create enquiry": a question card (the two best
--                           readings, "Type it"); the answer writes the line, "Decided by KB/AB". Always asks
--                           (maxLevel draft_and_ask), not configurable.
--
-- Email templates, awaiting the Owner's sign-off (open item P03):
--   client_ack        board 93's acknowledgement, from sales@ in the client's thread (S08-T07)
--   request_original  the reply board 17 drafts
--
-- Keys added to ACTION_KEYS (packages/ops-core/src/autopilot/keys.ts) in the same commit; the catalogue guard checks
-- both. ON CONFLICT DO NOTHING: re-runs never overwrite a level or a wording the Owner changed.

BEGIN;

INSERT INTO "ops"."autopilot_action_def"
  ("key", "group", "label", "description", "ruleText", "position", "configurable", "lockedLevel", "maxLevel",
   "defaultCareful", "defaultBalanced", "defaultHandsOff", "minutesSaved", "originBoard", "signoffStatus")
VALUES
  ('request_original', 'enquiries', 'Ask the client for a clearer copy', 'A file that could not be read (a coarse scan, an unreadable page) · Produces a short reply in the client''s thread asking for the original', 'From the mailbox that holds the thread', 140, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 3, '17', 'awaiting'),
  ('resolve_extracted_line', 'enquiries', 'Unsure extracted line', 'A line the Assistant could not read with confidence · Produces a question with the two best readings', 'Always asks you; the answer is written as yours', 141, false, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 1, '15', 'awaiting')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "ops"."autopilot_setting" ("actionKey", "level", "rules", "version", "updatedAt")
VALUES
  ('request_original', 'draft_and_ask', '{}', 0, now()),
  ('resolve_extracted_line', 'draft_and_ask', '{}', 0, now())
ON CONFLICT ("actionKey") DO NOTHING;

INSERT INTO "ops"."email_template"
  ("key", "label", "mailboxRole", "subjectTemplate", "bodyTemplate", "variables", "signoffStatus", "updatedAt")
VALUES
  ('client_ack', 'Acknowledgement', 'client', 'Re: {original_subject}',
   E'{salutation}\n\nWe have received your enquiry {client_ref} ({line_count} lines). Our reference is {enquiry_ref}. We will revert by {revert_by}.',
   ARRAY['salutation', 'original_subject', 'client_ref', 'line_count', 'enquiry_ref', 'revert_by'], 'awaiting', now()),
  ('request_original', 'Ask for a clearer copy', 'client', 'Re: {original_subject}',
   E'{salutation}\n\nThank you for your enquiry. We could not read {file_name} clearly enough to quote from it: {reason}. Could you send the original file, or a clearer copy?',
   ARRAY['salutation', 'original_subject', 'file_name', 'reason'], 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
