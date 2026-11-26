-- Indus Operations · S09 · settings defaults for matching, qualification and client questions
--
--   qualify.free_mail_domains   public webmail domains (structural list): a sender there is never matched to a
--                               company by domain (S09-T04) and reads as free mail on the quick read (S09-T06).
--   qualify.rdap_enabled        look up the sender domain's age over RDAP (only the domain leaves, 5 s timeout).
--   questions.clock             board 171: remind after 2 working days, call task at 10:00 on day 3, suppliers need
--                               4 working days before the quote date (the fallback comes the working day before).
--
-- All awaiting the Owner's sign-off (open items P05, P15). ON CONFLICT DO NOTHING: a value the Owner changed is kept.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt")
VALUES
  ('qualify.free_mail_domains',
    '{"domains":["126.com","163.com","aol.com","gmail.com","gmx.com","gmx.de","googlemail.com","hotmail.co.uk","hotmail.com","icloud.com","live.com","mac.com","mail.com","mail.ru","me.com","msn.com","naver.com","outlook.com","proton.me","protonmail.com","qq.com","rediffmail.com","sina.com","yahoo.co.in","yahoo.co.uk","yahoo.com","yandex.com","yandex.ru","ymail.com","zoho.com"]}',
    0, true, 'awaiting', now()),
  ('qualify.rdap_enabled', '{"enabled":true}', 0, true, 'awaiting', now()),
  ('questions.clock',
    '{"reminderWorkingDays":2,"callTaskHour":"10:00","supplierLeadWorkingDays":4}',
    0, true, 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
