-- Indus Operations · S04-T08 · board 88 "Gmail stays the truth" as a help article (content in the database)
--
--   help_article 'gmail-stays-the-truth'   the explainer at the foot of Settings › Mailboxes: one intro line,
--                                          four numbered principles, and the "not in this release" note for
--                                          the Gmail side panel. Edited later in Help without a deploy.
--
-- Body format (read by data/help.ts): the first paragraph is the intro; lines "1. …" are the principles; a
-- line starting "Later:" is the future-concept note. ON CONFLICT DO NOTHING keeps any later edit.

BEGIN;

INSERT INTO "ops"."help_article" ("slug", "section", "title", "body", "published", "updatedAt") VALUES (
  'gmail-stays-the-truth',
  'mail',
  'Gmail stays the truth',
  E'Everything the console reads stays in Gmail. Everything it sends appears in Gmail''s Sent, in the right thread. The Indus/ labels are the console''s only change to the mailbox.\n\n1. Indus/ labels sort the inbox the same way the console does: enquiries, supplier quotes, POs, and what needs you.\n2. A quotation the console sends sits in the client''s own thread, from sales@, with your signature and the PDF. It is also in Sent.\n3. If the console were switched off tomorrow, every email, attachment and reply would still be in Gmail.\n4. Replying from Gmail directly is fine: the Assistant reads the reply and files it to the enquiry.\n\nLater: Gmail side panel. Open a thread in Gmail and a narrow panel shows the linked enquiry, its status and what needs you, with a link into Indus Operations. Not part of this release.',
  true,
  now()
) ON CONFLICT ("slug") DO NOTHING;

COMMIT;
