-- Indus Operations · S09 · the Assistant actions and email templates this sprint adds (CLAUDE.md §17)
--
--   match_client_answers      (S09-T07, board 171) A client's reply read against the open questions: "Answers to n of
--                             m questions", each answer with its quote; approving re-opens the answered lines and
--                             applies what the answer implies. Internal (it edits lines, sends nothing). Draft and ask.
--   client_question_fallback  (S09-T07, board 171) Before the last useful day: quote on the stated assumptions, leave
--                             the lines out, or keep waiting. Always asks (maxLevel draft_and_ask), not configurable.
--
-- qualify_enquiry and regret_client were seeded by S03-T06 (regret_client already capped at Draft and ask).
--
-- Email templates, awaiting the Owner's sign-off (open items P05, P15):
--   client_regret_whole       board 168: the whole enquiry regretted, in the client's thread from sales@
--   client_regret_lines       board 168 "Lines only": the lines regretted, the rest still quoted
--   client_regret_glad_line   board 168 the "glad to quote on" sentence, {categories} from 12 months of quotations
--   client_questions          board 171: the questions on the held lines (#7)
--   client_question_reminder  board 171: the day-2 reminder of the open questions (#8)
--
-- Keys added to ACTION_KEYS (packages/ops-core/src/autopilot/keys.ts) in the same commit; the catalogue guard checks
-- both. ON CONFLICT DO NOTHING: re-runs never overwrite a level or a wording the Owner changed.

BEGIN;

INSERT INTO "ops"."autopilot_action_def"
  ("key", "group", "label", "description", "ruleText", "position", "configurable", "lockedLevel", "maxLevel",
   "defaultCareful", "defaultBalanced", "defaultHandsOff", "minutesSaved", "originBoard", "signoffStatus")
VALUES
  ('match_client_answers', 'enquiries', 'Match client answers to questions', 'A client''s reply to the questions on held lines · Produces each answer with its quote and what it changes on the line', 'Answers are proposals: nothing changes until you approve', 142, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 3, '171', 'awaiting'),
  ('client_question_fallback', 'enquiries', 'No answer before the last useful day', 'Questions still open when the held lines must go to suppliers · Produces the three fallbacks: assume, leave out, wait', 'Always asks you', 143, false, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 1, '171', 'awaiting')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "ops"."autopilot_setting" ("actionKey", "level", "rules", "version", "updatedAt")
VALUES
  ('match_client_answers', 'draft_and_ask', '{}', 0, now()),
  ('client_question_fallback', 'draft_and_ask', '{}', 0, now())
ON CONFLICT ("actionKey") DO NOTHING;

INSERT INTO "ops"."email_template"
  ("key", "label", "mailboxRole", "subjectTemplate", "bodyTemplate", "variables", "signoffStatus", "updatedAt")
VALUES
  ('client_regret_whole', 'Regret · whole enquiry', 'client', 'Re: {original_subject}',
   E'{salutation}\n\nThank you for your enquiry {client_ref} for {enquiry_title}, and for considering us.\n\nWe have reviewed it carefully, and on this occasion we are unable to offer the items requested.\n\n{glad_line}',
   ARRAY['salutation', 'original_subject', 'client_ref', 'enquiry_title', 'glad_line'], 'awaiting', now()),
  ('client_regret_lines', 'Regret · lines only', 'client', 'Re: {original_subject}',
   E'{salutation}\n\nThank you for your enquiry {client_ref}. We are unable to quote {lines_sentence}. We are pricing the other lines and will send our quotation for them.\n\n{glad_line}',
   ARRAY['salutation', 'original_subject', 'client_ref', 'lines_sentence', 'glad_line'], 'awaiting', now()),
  ('client_regret_glad_line', 'Regret · "glad to quote on" line', 'client', '',
   E'We would be glad to quote on {categories}, and look forward to your next enquiry.',
   ARRAY['categories'], 'awaiting', now()),
  ('client_questions', 'Questions before sourcing', 'client', 'Re: {original_subject}',
   E'{salutation}\n\nBefore we source {held_count} of the lines on your enquiry {client_ref}, we need your answers on the following:\n\n{questions}\n\nThe other lines are with our suppliers now. Our reference is {enquiry_ref}.',
   ARRAY['salutation', 'original_subject', 'held_count', 'client_ref', 'questions', 'enquiry_ref'], 'awaiting', now()),
  ('client_question_reminder', 'Reminder of open questions', 'client', 'Re: {original_subject}',
   E'{salutation}\n\nA short reminder of our {open_count} open questions on {client_ref}, listed below. If we have not heard by {fallback_date}, we will quote these lines on the assumptions stated in the quotation.\n\n{questions}',
   ARRAY['salutation', 'original_subject', 'open_count', 'client_ref', 'fallback_date', 'questions'], 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
